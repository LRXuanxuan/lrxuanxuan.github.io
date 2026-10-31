---
layout: page
title: "MintFlow：约束流匹配的最小轨迹干预｜中文全文译文"
permalink: /papers/translations/2026-10-08-2610-02260-mintflow-minimal-trajectory-intervention-for-constrained-flow-matching/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/647afc788713a6de/) · [原文 arXiv](https://arxiv.org/abs/2610.02260) · [全部目录](/papers/catalog/)

# MintFlow：约束流匹配的最小轨迹干预

**原题：** MintFlow: Minimal Trajectory Intervention for Constrained Flow Matching  
**作者：** Yesom Park¹、Kelvin Kan¹、Qifan Chen¹、Thomas Flynn²、Hayden Schaeffer¹、Xihaier Luo²（通讯作者）。单位：¹ 加州大学洛杉矶分校数学系（Department of Mathematics, University of California, Los Angeles）；² 布鲁克海文国家实验室（Brookhaven National Laboratory）。邮箱：{yeisom, kelvin.kan, chenqifan, hayden}@math.ucla.edu；{tflynn, xluo}@bnl.gov。  
**版本：** arXiv:2610.02260v1（cs.AI），v1 日期 2026 年 9 月 30 日；原文 54 页（ICLR 2027 投稿格式：正文 p1—9、参考文献 p10—13、附录 p13—54）。本页对应论文库 2026-10-08 条目。  
**范围与状态：** 全文中文译稿：摘要、第 1—5 节、致谢、可复现性声明、AI 使用声明、参考文献（英文原条目，原文按字母序未编号，本页加序号便于引用）、附录 A（理论证明）、B（算法 2—3）、C（相关工作）、D（图像生成）、E（图像逆问题）、F（图像编辑）、G（物理系统建模）、H（消融实验）、图 1—24 图注、表 1—10、式（1）—（44）。表 1—3 已用 PDF 渲染逐格核对；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文疑点）：** 原文缩写在本页首次出现时保留英文：flow matching（流匹配）、RF/RFM（rectified flow，整流流）、FM（flow matching）、ODE（ordinary differential equation，常微分方程）、FID（Fr ́echet Inception Distance）、KID（kernel inception distance）、MMD（maximum mean discrepancy，最大均值差异）、$W_2$（Wasserstein-2 距离）、PSNR/SSIM/LPIPS、CLIP-T/CLIP-I、PIE-Bench、AFHQ-Cat、FFHQ、MNIST、CIFAR-10、AE（autoencoder，自编码器）、FFM（functional flow matching，函数流匹配）、PDE（偏微分方程）、IC/BC（初始/边界条件）、POD（proper orthogonal decomposition，本征正交分解）、ECI、PCFM、DPS、D-Flow、FlowChef、PnPFlow、Freedom、DiffusionPDE、HardFlow、OC-Flow、TOCFlow、SNAP-FM、ProFlow、CCFM、Lagrangian Dual Flows。**原文疑点/说明（按原文照录并加注）：** ①原文参考文献**按字母序排列、未编号**，本页为便于引用添加了序号（不改条目内容，仅在译注说明）；②原文公式编号从（1）连续到（44），其中附录 G 的（31）—（40）为本页转录的约束算子分块表达式；③原文 §4.3 与附录 G 中 "Vanilla FFM" 与 "Vanilla" 同义混用；④原文表 3 与表 10 的部分指标（FID/MMD/$W_2$）为在 POD 坐标与条件化数值参考分布上的近似度量，原文明确说明其与 Inception-FID 不同、且不代表与无条件 FFM 分布的散度（见 §G.4）；⑤原文附录 G.4 指出 KID 的有限样本估计可为负值（属无偏估计的正常现象），本页照录。

## 摘要

流匹配模型在生成建模中表现出色，而许多下游应用要求其样本满足规定约束，例如观测测量与物理定律。然而现有约束采样器常面临一个折中：**施加约束会使样本大幅偏离预训练数据分布。** 为解决该折中，我们提出 **MintFlow**——一种免训练的约束采样框架，把约束施加表述为对预训练流轨迹的**最小干预**。MintFlow 寻求对某个中间流状态的最小扰动，使其在预训练流场下的后续演化满足目标约束。通过在保持预训练流场不变的前提下最小扰动流状态，MintFlow 在施加约束的同时最小化对预训练分布的不必要偏离。伴随（adjoint）表述给出该扰动的闭式表达，从而免去昂贵的迭代优化。此外，MintFlow 自适应选择干预时刻，以平衡所需扰动幅度与其被剩余流放大的程度。在生成视觉与物理系统建模的一系列任务上，MintFlow 在取得有竞争力的约束满足的同时，显著优于当前最先进的约束方法地保持预训练生成分布。

## 1 引言

流匹配已成为生成建模的有力范式，通过学习到的连续时间动力学把简单参考分布高效输运到复杂数据分布 (Lipman et al., 2023; Liu et al., 2026)。然而许多现实应用要求的不只是"合理的生成"：生成样本需满足测量约束、结构要求、物理定律或其他应用特定条件 (Utkarsh et al., 2026; Martin et al., 2025a; Patel et al., 2025)。在这些场景中，核心目标是**在保持预训练模型已学得的分布结构的同时施加规定约束**。

现有方法或在训练时、或在推理时处理该问题。训练时方法 (Li et al., 2026a; Tauberschmidt et al., 2026) 通过专门目标、正则化或架构设计纳入约束，但每个新约束都需要昂贵的重训练，往往不切实际。推理时方法避免了重训练，在采样过程中施加约束：或通过引导修改预训练动力学 (Chung et al., 2023a; Feng et al., 2025)，或通过轨迹优化修改流状态 (Ben-Hamu et al., 2024; Patel et al., 2025)，或通过事后投影修改生成样本 (Cheng et al., 2025; Utkarsh et al., 2026)¹。然而这些方法面临一个关键挑战：**仅满足约束并不能阻止对预训练生成过程的大幅偏离**，这可能把样本推离预训练分布（图 1）。

因此我们采用一个简单原则：**只修改必要的部分，且只做必要的修改。** 由于所需的约束样本仍位于预训练流所学得的分布之内，学习到的动力学本身无需改变。这提示我们保留原始向量场，仅对轨迹做干预，用满足约束所需的最小修正，同时限制对预训练分布的不必要偏离。

受该原则启发，我们提出 **MintFlow**——一个免训练框架，把约束生成表述为**最小轨迹干预**（图 2）。给定由预训练流生成的轨迹，MintFlow 寻找对某个中间状态的最小扰动，使其在**不变的预训练流**下的后续演化满足终端约束。最小范数干预通过伴随方程直接由终端约束灵敏度算出，避免显式构造高维流 Jacobian，也避免沿完整生成轨迹做昂贵迭代优化。MintFlow 进一步自适应选择干预时刻，以平衡修正幅度与剩余流传播时间。在温和正则性条件下，我们刻画约束满足误差，并证明修正后分布与预训练分布之间的 Wasserstein 距离被干预幅度与剩余流传播时间所界。在图像与物理数据、多种约束（图像逆问题、图像编辑、物理知情生成）上的实验表明，MintFlow 在广泛应用中有效满足约束并保持已学分布。

> **脚注 1（原文）：** 相关工作的详细讨论见附录 C。
>
> **原文 arXiv 标注：** arXiv:2610.02260v1 [cs.AI] 30 Sep 2026。

**图 1：** 约束满足与分布保真之间的平衡。无约束采样 (A) 从预训练分布生成样本但常违反约束；先前的约束采样方法 (B) 以大幅分布偏移为代价施加约束；所提方法 (C) 在满足约束的同时更好地保持预训练分布。图中以图像修复（inpainting）示例说明该折中。（来源：原文第 2 页。）

## 2 背景

令 $f_\theta$ 为预训练流匹配模型的速率场，它通过积分如下常微分方程（ODE）生成样本：

$$
\frac{\mathrm d\mathbf u}{\mathrm dt}=f_\theta(\mathbf u,t),\quad t\in[0,T].\tag{1}
$$

记 $\Phi(t,s)$ 为相应的流映射，它把状态从时刻 $s$ 沿（1）移动到时刻 $t$，即 $\Phi(t,s)(\mathbf u_s)=\mathbf u_t$。对 $t=0$ 处的基分布 $\mu$，时刻 $t$ 的诱导边缘分布为 $\nu_t:=\Phi(t,0)_\#\mu$，其中 $(\cdot)_\#$ 表示分布经流的推前。假定终端分布 $\nu_T=\Phi(T,0)_\#\mu$ 近似目标数据分布。

**约束生成。** 给定终端分布为 $\nu_T$ 的预训练流匹配模型与可微约束算子 $H$，我们要生成满足下式的样本 $\mathbf u$：

$$
\mathbf u\sim\nu_T,\qquad H(\mathbf u)=0.\tag{2}
$$

由于预训练速率场 $f_\theta$ 是为把基分布 $\mu$ 输运到无约束终端分布 $\nu_T$ 而学习的，它并未被显式训练去施加约束 $H(\mathbf u)=0$。因此我们寻求一种约束生成流程：仅使用预训练流场 $f_\theta$ 与约束算子 $H$、无需额外模型训练，就从终端分布 $\nu_T$ 生成满足规定约束的样本。

关键挑战在于**同时**满足约束 $H(\mathbf u)=0$ 并让样本保持接近预训练分布 $\nu_T$。现有方法常以满足约束为代价偏离 $\nu_T$（图 1）。为此我们把约束生成表述为**最小干预问题**：寻找对预训练流轨迹中间状态的最小扰动，以在保持预训练分布的同时施加约束。

**图 2：** 约束生成策略比较。(a) Steer Velocity Field 通过额外学习一个速率场修改流。(b) Terminal Projection 把生成样本投影到约束流形上。(c) Trajectory Optimization 沿流迭代优化状态。相反，我们的 (d) Trajectory Intervention 在中间时刻对轨迹做最小扰动后，沿原始流前进。（来源：原文第 3 页。）

## 3 方法

### 3.1 面向约束生成的轨迹干预

我们不做事后投影、也不修改预训练流，而是通过对生成轨迹的**最小干预**来施加约束。给定轨迹 $\{\mathbf u_t\}_{t\in[0,T]}$，我们寻找一个中间时刻 $s\in[0,T)$ 与扰动 $\boldsymbol\delta$，使得

$$
H\left(\Phi(T,s)(\mathbf u_s+\boldsymbol\delta)\right)=0.
$$

于是扰动状态 $\mathbf u_s+\boldsymbol\delta$ 用原始预训练流被传播到终端时刻。对固定的干预时刻 $s$，我们寻找满足终端约束的最小扰动：

$$
\min_{\boldsymbol\delta}\ \frac12\|\boldsymbol\delta\|^2,\qquad \text{s.t.}\ F_s(\boldsymbol\delta):=H\left(\Phi(T,s)(\mathbf u_s+\boldsymbol\delta)\right)=0.\tag{3}
$$

该表述把约束生成转化为**最小轨迹干预**：流动力学保持不变，只有中间状态被最小扰动以在 $t=T$ 到达约束流形。

### 3.2 基于伴随的最优修正

我们通过流映射的伴随灵敏度计算最小范数扰动来求解（3）。对生成轨迹 $\{\mathbf u_t\}_{t\in[0,T]}$，考虑在中间时刻 $s$ 的扰动 $\mathbf u'_s=\mathbf u_s+\boldsymbol\delta$。对足够小的 $\boldsymbol\delta$，终端约束可在原轨迹附近线性化为

$$
H(\mathbf u')=F_s(\boldsymbol\delta)\approx H(\mathbf u_T)+\nabla H(\mathbf u_T)D\Phi(T,s)(\mathbf u_s)\boldsymbol\delta,\quad D\Phi(T,s):=\frac{\partial\Phi(T,s)(\mathbf u)}{\partial\mathbf u}(\mathbf u).\tag{4}
$$

于是，在线性近似下施加 $F_s(\boldsymbol\delta)=0$ 给出

$$
\mathbf A_s\boldsymbol\delta=-H(\mathbf u_T),\qquad \mathbf A_s:=\nabla H(\mathbf u_T)D\Phi(T,s)(\mathbf u_s),\tag{5}
$$

其最小范数解为

$$
\boldsymbol\delta^*_s=-\mathbf A_s^\dagger H(\mathbf u_T),\tag{6}
$$

其中 $\mathbf A_s^\dagger$ 为 Moore–Penrose 伪逆，可通过求解相应最小二乘问题计算。特别地，当 $H$ 为标量值时，（6）退化为

$$
\boldsymbol\delta^*_s=-\frac{\mathbf A_s^\top}{\|\mathbf A_s\|^2}H(\mathbf u_T),\qquad \mathbf A_s\ne0.
$$

因此，对每个干预时刻 $s$，在线性近似下最小范数扰动被确定。该修正也可解释为求解非线性方程 $F_s(\boldsymbol\delta)=0$ 的**一步 Newton 迭代**。附录 A.1 还给出**最优控制**解释。

**伴随计算。** （5）中 $\mathbf A_s$ 的计算需要终端状态对中间状态的灵敏度。对高维系统直接计算完整 Jacobian $D\Phi(T,s)$ 在计算上不可行；我们改由伴随方程计算其向量–Jacobian 乘积。

具体地，定义伴随变量 $\boldsymbol\lambda(t)$ 为如下**伴随方程**的解：

$$
\dot{\boldsymbol\lambda}(t)=-\left(\frac{\partial f_\theta}{\partial\mathbf u}(\mathbf u_t,t)\right)^\top\boldsymbol\lambda(t),\qquad \boldsymbol\lambda(T)=\nabla H(\mathbf u_T)^\top.\tag{7}
$$

从 $t=T$ 到 $t=s$ 反向求解该方程，恰好给出所需的向量–Jacobian 乘积 (Coddington, 1955; Pontryagin, 1987)：

$$
\boldsymbol\lambda(s)=D\Phi(T,s)^\top\nabla H(\mathbf u_T)^\top=\mathbf A_s^\top.
$$

于是 $\mathbf A_s$ 无需显式构造流 Jacobian 即可获得，从而可对高维流匹配模型高效计算最优修正。

我们从约束满足与分布保持两方面为所提基于伴随的中间修正提供理论保证。

**定理 3.1（非正式）：** 在 $f_\theta$ 与 $H$ 的温和正则性条件下，所提（6）中的线性化修正取得二阶终端约束残差：

$$
\left\|H\left(\Phi(T,s)(\mathbf u_s+\boldsymbol\delta^*_s)\right)\right\|\le C\|\boldsymbol\delta^*_s\|^2.
$$

此外，若流场关于 $\mathbf u$ 满足 $L_f$-Lipschitz，则修正后的终端分布 $\nu^*_T$ 满足

$$
W_2(\nu^*_T,\nu_T)\le e^{L_f(T-s)}\|\boldsymbol\delta^*_s\|_{L^2(\nu_s)}.
$$

形式化陈述与证明见附录 A.2。第一个结果量化所提修正的约束满足程度；第二个结果表明修正后终端分布相对原始流匹配分布的偏离，被中间修正幅度与剩余积分时间 $T-s$ 共同界定。

### 3.3 自适应干预时刻选择

上一小节对固定干预时刻 $s$ 确定最小范数修正。接下来我们选择 $s$，以平衡修正幅度与剩余传播时间 $T-s$。定理 3.1 提示应控制两个因素：干预幅度与剩余流积分时间。由于 Lipschitz 常数 $L_f$ 通常未知，我们转而考虑如下实用替代目标：

$$
s^*=\arg\min_{s\in[0,T)}\ J(s):=\|\boldsymbol\delta^*_s\|^2+\lambda(T-s)^2,\tag{8}
$$

其中 $\boldsymbol\delta^*_s$ 由（6）给出，$\lambda$ 控制对较晚干预的偏好。第一项偏好需要较小修正的干预时刻；第二项通过惩罚干预后剩余传播时间而偏好较晚干预。这既降低扰动经由剩余流演化被放大的可能，也降低到达终端所需的数值计算代价。因此 $J(s)$ 提供了在分布保持与计算效率之间折中的实用准则。

实践中，我们在一组有限的候选时刻 $0\le s_1<\cdots<s_K<T$ 上评估 $J(s)$：

$$
s^*=\arg\min_{k=1,\cdots,K}J(s_k).\tag{9}
$$

```text
Algorithm 1 MintFlow 约束生成
Require: u_0 ~ μ, f_θ, H, {s_k}_{k=1}^K, λ
1: 生成轨迹 {u_t}_{t=0}^T 并计算 H(u_T)
2: 从 T 反向求解伴随，得到 {s_k}_{k=1}^K 处的灵敏度
3: 并行计算 δ*_{s_k}（式 (6)）并对所有 s_k 评估 J(s_k)
4: 选择 s* = arg min_{s_k} J(s_k)
5: 从 u_{s*} + δ*_{s*} 重新积分到 T
return u_T^corr = Φ(T, s*)(u_{s*} + δ*_{s*})
```

在生成一次轨迹之后，我们把伴随方程反向积分到最早的候选时刻 $s_1$，并存储 $s_k$（$k=1,\ldots,K$）处的伴随状态。随后对所有 $k$ 并行计算 $\boldsymbol\delta^*_{s_k}$ 与 $J(s_k)$，并按（9）选出 $s^*$；然后令 $\mathbf u_{s^*}\leftarrow\mathbf u_{s^*}+\boldsymbol\delta^*_{s^*}$，并从 $s^*$ 到 $T$ 重新积分原始流，得到约束样本。完整的 MintFlow 算法汇总于算法 1。

**迭代精化。** （6）中的修正是 $F_s(\boldsymbol\delta)=0$ 的一步 Newton 迭代。若所得约束残差超过规定容差，我们在修正后的轨迹上迭代应用算法 1，直到残差低于容差。在第 $i$ 次迭代，计算伴随灵敏度、选择干预时刻 $s^{(i)}$、施加 $\boldsymbol\delta^*_{s^{(i)}}$，并重新积分原始流到 $T$。我们把干预时刻限制为 $s^{(1)}<s^{(2)}<\cdots<T$，使后续每次迭代都从上次修正产生的轨迹出发，并需要更短的反向伴随积分。算法 3 及其收敛性分析见附录 A.3。

## 4 实验

我们在三种约束生成设定上评估 MintFlow：(i) 图像逆问题；(ii) 图像编辑；(iii) 物理系统建模。实验覆盖不同的流模型、数据域与约束类型，从局部到全局、从线性到非线性，展示了方法的广泛适用性。我们把 MintFlow 与现有免训练约束生成方法比较，所有方法使用同一预训练流²。我们沿三个核心维度评估每种方法：**约束满足、预训练分布保持与计算效率**，并辅以任务特定性能指标。代码公开于 https://github.com/Yebbi/MintFlow。

> **脚注 2（原文）：** 所有图像实验在单块 NVIDIA H200 GPU 上完成，所有物理系统实验在单块 NVIDIA A100 GPU 上完成。

### 4.1 图像逆问题

**设置。** 沿用 Patel et al. (2025)，我们在无噪声图像逆问题（修复、超分辨率、去模糊）上使用 AFHQ-Cat 与 FFHQ 数据集评估 MintFlow。所有实验使用相同的预训练 Rectified Flow++（RF）模型 (Lee et al., 2024)，图像统一缩放为 $64\times64$。对每个任务，给定退化观测 $\mathbf u_{\mathrm{obs}}$，我们定义测量约束 $H(\mathbf u)=\mathcal A(\mathbf u)-\mathbf u_{\mathrm{obs}}=0$，其中 $\mathcal A$ 为任务特定的退化算子。我们把 MintFlow 与现有图像约束方法（D-Flow、DPS、Freedom、PNPFlow、FlowChef）比较，同时共享同一冻结 RF 模型与源噪声。除约束满足、分布保持与效率外，我们以 PSNR、SSIM 与 LPIPS 报告重建质量。更多细节见附录 E。

**定量结果。** 表 1 汇总定量结果。在所有任务与数据集上，MintFlow 在约束满足与重建质量之间始终提供显著更好的平衡：它在所有评估任务上取得最低的约束误差与 Fréchet Inception Distance（FID）。这表明 MintFlow 能紧密满足测量约束，而无需对预训练生成先验做过量修改。重要的是，约束满足的改善并未以感知或重建质量为代价：MintFlow 在各设定下取得最佳 FID、PSNR、SSIM 与 LPIPS，证明它能同时保持已学数据分布并恢复高质量图像细节。此外，MintFlow 体现出最小干预方法的计算效率。相反，竞争方法虽可降低约束误差，却常产生偏离已学数据分布的重建，导致更高 FID 与更差的重建质量（图 3）。

**定性比较。** 图 3 给出代表性定性结果，更多未筛选结果见附录 E.4。这些结果印证了表 1 的定量发现：MintFlow 产生自然的重建并忠实保持测量约束；相反，基线常产生模糊重建或引入视觉上不合理的结构与伪影，表明偏离了已学图像分布。总体而言，定性结果表明 MintFlow 在更有效地满足测量约束的同时仍忠实于已学图像分布。

**表 1：AFHQ-Cat 与 FFHQ 上图像逆问题的定量比较。** 报告约束误差 $H$、FID、PSNR（dB）、SSIM、LPIPS、推理时间（s）与峰值 GPU 显存（MB）。在每个指标上，浅绿表示最佳、浅红表示次佳（适用于本文所有表格）。（来源：原文第 6 页。）

| 方法 | AFHQ H↓ | AFHQ FID↓ | AFHQ PSNR↑ | AFHQ SSIM↑ | AFHQ LPIPS↓ | FFHQ H↓ | FFHQ FID↓ | FFHQ PSNR↑ | FFHQ SSIM↑ | FFHQ LPIPS↓ | 时间↓(s) | 显存↓(MB) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **任务：修复** | | | | | | | | | | | | |
| D-Flow | 1.775E-2 | 23.662 | 20.8597 | 0.7180 | 0.1578 | 1.592E-2 | 29.692 | 22.7378 | 0.7910 | 0.0915 | 153.47 | 3597.02 |
| DPS | 2.583E-2 | 14.532 | 20.9537 | 0.6232 | 0.1806 | 2.897E-2 | 33.498 | 21.3944 | 0.6913 | 0.1146 | 6.61 | 646.74 |
| Freedom | 6.013E-2 | 19.999 | 17.8908 | 0.4377 | 0.2502 | 6.789E-2 | 39.998 | 18.0828 | 0.5334 | 0.1605 | 4.60 | 637.36 |
| PNPFlow | 1.926E-2 | 24.063 | 22.2547 | 0.6877 | 0.1897 | 2.126E-2 | 63.579 | 22.3143 | 0.7388 | 0.1281 | 5.56 | 338.28 |
| FlowChef | 2.476E-2 | 18.292 | 19.4181 | 0.6110 | 0.1824 | 2.572E-2 | 17.226 | 20.5481 | 0.6934 | 0.1028 | 0.21 | 330.74 |
| MintFlow | **5.498E-4** | **6.506** | **26.3913** | **0.9207** | **0.0376** | **5.172E-4** | **6.046** | **28.7002** | **0.9417** | **0.0207** | 0.19 | 329.99 |
| **任务：超分辨率** | | | | | | | | | | | | |
| D-Flow | 1.371E-2 | 27.351 | 19.9141 | 0.5397 | 0.2309 | 1.347E-2 | 65.788 | 20.2276 | 0.6187 | 0.1565 | 188.96 | 3596.63 |
| DPS | 1.723E-2 | 12.771 | 19.9188 | 0.5220 | 0.1686 | 1.838E-2 | 9.608 | 19.7618 | 0.5924 | 0.1173 | 6.42 | 646.69 |
| Freedom | 4.814E-2 | 19.048 | 17.5691 | 0.3816 | 0.2452 | 5.124E-2 | 25.978 | 17.3415 | 0.4694 | 0.1568 | 4.53 | 637.32 |
| PNPFlow | 1.193E-2 | 52.9554 | 21.6583 | 0.6187 | 0.2289 | 1.342E-2 | 79.951 | 21.1512 | 0.6670 | 0.1649 | 4.9 | 338.24 |
| FlowChef | 1.842E-2 | 23.601 | 18.9815 | 0.4435 | 0.2352 | 1.950E-2 | 18.998 | 18.7612 | 0.5141 | 0.1381 | 0.25 | 330.69 |
| MintFlow | **9.901E-5** | **8.296** | **22.9958** | **0.7147** | **0.0757** | **1.248E-4** | **8.313** | **22.4535** | **0.7468** | **0.0543** | 0.22 | 329.86 |
| **任务：去模糊** | | | | | | | | | | | | |
| D-Flow | 9.015E-3 | 47.8724 | 18.2846 | 0.3734 | 0.3025 | 9.850E-3 | 81.818 | 17.9925 | 0.4277 | 0.1528 | 187.30 | 3596.97 |
| DPS | 1.950E-2 | 12.5016 | 20.5182 | 0.5629 | 0.1694 | 2.018E-2 | 23.919 | 20.2454 | 0.6272 | 0.1145 | 6.23 | 646.69 |
| Freedom | 5.174E-2 | 18.962 | 17.6911 | 0.3983 | 0.2384 | 5.191E-2 | 28.108 | 17.5191 | 0.4886 | 0.1566 | 4.11 | 637.32 |
| PNPFlow | 1.211E-2 | 25.1702 | 22.3216 | 0.6711 | 0.2005 | 1.348E-2 | 73.589 | 21.8534 | 0.7116 | 0.1463 | 4.43 | 338.24 |
| FlowChef | 2.365E-2 | 18.548 | 19.2998 | 0.4924 | 0.2237 | 2.543E-2 | 19.195 | 19.0493 | 0.5593 | 0.1334 | 0.23 | 330.69 |
| MintFlow | **2.877E-4** | **6.819** | **28.3760** | **0.8988** | **0.0344** | **2.916E-4** | **6.417** | **28.4017** | **0.9221** | **0.0237** | 0.22 | 329.94 |

**图 3：** 图像逆问题的代表性定性结果。比较真值图像（GT）、退化输入与不同方法的结果。修复与超分辨率在 AFHQ-Cat 上评估，去模糊在 FFHQ 上评估。（来源：原文第 6 页。）

### 4.2 图像编辑

**设置。** 沿用 Patel et al. (2025)，我们在 PIE-Bench (Ju et al., 2024) 上开展图像编辑实验，使用 InstaFlow (Liu et al., 2023c) 作为流匹配模型。给定参考图像、掩码与文本引导，任务要求在按文本提示编辑掩码区域的同时保持未掩码区域不变。因此主要挑战是**同时**满足保持约束与文本引导的编辑目标。我们在相同模型与源噪声下与 §4.1 相同的基线比较；D-Flow 因 GPU 显存需求过高而被省略。除约束满足与效率外，我们用 CLIP 分数评估提示遵循度与图像相似度，分别衡量编辑图像对文本提示的遵循程度与相对参考图像的视觉一致性。更多细节见附录 F。

**表 2：图像编辑任务的比较。**（来源：原文第 7 页。）

| 方法 | $H$↓ | CLIP-T↑ | CLIP-I↑ | 时间↓ | 显存↓ |
|---|---|---|---|---|---|
| DPS | 0.0115 | 0.2916 | 0.7911 | 9.17 | 8881.75 |
| Freedom | 0.0071 | 0.2756 | **0.8466** | 17.65 | 8122.47 |
| PNPFlow | 0.0503 | 0.2918 | 0.6897 | 42.45 | 6507.95 |
| FlowChef | 0.0136 | 0.2891 | 0.7939 | 9.29 | 6507.26 |
| MintFlow | **0.0069** | **0.2926** | 0.8151 | **8.79** | **6507.26** |

**定量结果。** 表 2 汇总图像编辑任务的定量比较。MintFlow 在各评估指标上展现了稳健的整体性能：它取得最佳约束满足，说明在执行所需编辑时更忠实地保持了未掩码区域；同时取得最高提示遵循度，说明生成图像更好地遵循给定文本引导。Freedom 取得更高图像相似度，但其代价是较低的提示遵循度，表明其更强地倾向于保持参考图像。如图 4 所示，与提示冲突的语义元素（如狗的耳朵、舌头与电厂的烟）被保留。相反，MintFlow 在保持参考图像与遵循编辑指令之间提供了更有利的平衡。MintFlow 也是计算上最高效的方法，取得最低推理时间并占用最少显存，表明其可扩展性与效率即便在文本引导图像编辑中依然成立。总体而言，这些结果表明 MintFlow 能同时满足保持约束、紧密遵循编辑提示并高效完成任务，在编辑质量与计算代价之间提供有利平衡。

**定性比较。** 代表性定性结果见图 4，更多结果见附录 F.4。如所示，基线方法常难以保持结构与视觉连贯性，产生诸如从参考图像残留的提示不一致语义元素（如未被变换的耳朵）、解剖学不一致（如错位的眼睛）以及不自然的色彩偏移或模糊等伪影。相反，我们的方法按给定提示执行所需编辑，同时保持视觉连贯性与图像质量。这些结果显示我们的方法在有效满足提示约束的同时保留了输入图像的上下文信息，且未偏离已学数据分布。

**图 4：** 图像编辑结果的定性比较。给定输入图像及其对应文本提示，比较不同方法的编辑结果。删除线与红色文字分别表示原始文本与编辑后文本。（来源：原文第 7 页。）

### 4.3 物理系统建模

**设置。** 沿用 Utkarsh et al. (2026) 的基准协议，我们使用**函数流匹配（Functional Flow Matching, FFM）**评估 MintFlow 的物理系统生成能力，FFM 把流匹配扩展到函数值数据 (Kerrigan et al., 2023)。我们考虑两个时空系统：周期热方程与一维反应–扩散（RD1D）方程。每个系统使用各自的预训练 FFM 检查点，所有采样器共享相同的冻结权重与源噪声。约束算子联合编码守恒、初始条件（IC）与边界条件（BC）残差：热方程采用结构周期性约束，RD1D 施加规定的 Neumann 通量。我们在不重训练、不微调预训练模型的情况下，把 MintFlow 与 Vanilla FFM、DiffusionPDE、D-Flow、ECI、PCFM 比较。除核心准则外，我们用控制方程残差以及与由各生成样本自身 IC 初始化的数值轨迹的误差来评估物理一致性。分布一致性针对在同一 FFM 导出的物理条件下生成的数值参考集度量，因此所报告的集合级距离量化的是与相应条件化数值分布的一致性，而非与 Vanilla FFM 本身的散度。更多细节见附录 G。

**定量结果。** 表 3 给出使用三个分布指标、平均约束残差与平均仿真误差的紧凑主比较；表 10 额外报告 KID、偏微分方程（PDE）残差以及约束与物理一致性指标的样本级标准差。MintFlow 在两个系统上均具有最小的 FID、MMD、$W_2$ 与仿真误差点估计，完整表 3 显示 KID 与 PDE 残差遵循相同排序。综合这些排序，说明其与条件化数值参考的一致性更好、动力学一致性更高。约束指标揭示了互补的折中：事后投影方法 ECI 与 PCFM 获得最小残差，但其分布与物理一致性指标急剧恶化。相反，MintFlow 相对 Vanilla、DiffusionPDE 与 D-Flow 把残差降低约三个数量级，同时避免了 ECI 与 PCFM 的显著分布偏移与动力学误差。这些结果使 MintFlow 位于一个独特的 Pareto 点，而非确立全面支配：若唯一目标是最小化显式约束残差，ECI 与 PCFM 仍然更好；而 MintFlow 具有所报告的最低分布与物理一致性点估计。

**表 3：物理系统建模基准结果。** 跨 $N=1000$ 个生成样本评估系统 1（热方程）与系统 2（反应–扩散方程）；数值越小越好。（来源：原文第 8 页。）

| 方法 | 系统 1 FID↓ | 系统 1 MMD↓ | 系统 1 $W_2$↓ | 系统 1 $H$↓ | 系统 1 Sim. Error↓ | 系统 2 FID↓ | 系统 2 MMD↓ | 系统 2 $W_2$↓ | 系统 2 $H$↓ | 系统 2 Sim. Error↓ |
|---|---|---|---|---|---|---|---|---|---|---|
| Vanilla FFM | 1.255E-3 | 2.496E-2 | 4.872E-2 | 5.16E-3 | 5.57E-2 | 1.74E-4 | 2.130E-2 | 2.078E-2 | 1.907E0 | 3.55E-2 |
| DiffusionPDE | 4.712E-3 | 5.361E-2 | 7.431E-2 | 1.86E-2 | 8.49E-2 | 9.34E-4 | 6.063E-2 | 3.712E-2 | 9.56E-1 | 3.29E-2 |
| D-Flow | 1.290E-3 | 2.554E-2 | 4.098E-2 | 4.71E-3 | 4.34E-2 | 3.95E-4 | 3.861E-2 | 4.085E-2 | 4.44E-1 | 3.02E-2 |
| ECI | 1.865E-1 | 2.067E-1 | 4.502E-1 | **2.27E-7** | 4.47E-1 | 1.829E-2 | 1.299E-1 | 1.647E-1 | **8.02E-6** | 2.28E-1 |
| PCFM | 1.851E-1 | 2.062E-1 | 4.485E-1 | 1.30E-7 | 4.45E-1 | 1.831E-2 | 1.301E-1 | 1.648E-1 | 8.06E-6 | 2.28E-1 |
| MintFlow | **2.91E-5** | **5.44E-3** | **1.455E-2** | 3.57E-6 | **1.23E-2** | **1.09E-4** | **1.342E-2** | **1.870E-2** | 3.18E-4 | **2.58E-2** |

**定性比较。** 图 5 考察样本层面的动力学自一致性。对每个源噪声索引，相应的无约束 FFM 轨迹确定目标初始条件与定义数值问题所需的物理参数，这些量随后在所有采样器中固定。对每个生成场，我们提取其自身 IC，在固定的按样本索引的物理参数与 BC 下积分相应 PDE，并显示与该数值推演的点wise 绝对偏差。结果表明，ECI 与 PCFM 尽管显式约束残差很小，却产生大范围、空间连贯的误差；MintFlow 则明显更接近其数值推演，与其相对这些基线更低的总体仿真误差一致。附录 G.6 提供更多固定 ID 示例。

**图 5：** 物理约束下的定性物理一致性。上行为 ECI、PCFM 与 MintFlow 生成的样本，下行为生成场与该样本条件化数值推演之间的点wise 绝对偏差。（来源：原文第 9 页。）

**图 6：** MintFlow 对采样步数与正则化参数 $\lambda$ 的敏感度。（来源：原文第 9 页。）

**模型分析。** 图 6 在 Heat 数据集上消融采样步数与（8）中的正则化参数 $\lambda$。基准默认使用 100 步 Euler 采样；提高采样分辨率会同时改善分布保真与约束满足，因为离散化同时影响前向积分与反向伴随计算：更细的采样给出更准确的轨迹与伴随，从而更好地保持预训练分布并得到更准确的局部约束修正。尽管如此，方法仍相对稳健，仅在少于 100 个采样步时才出现明显退化。改变 $\lambda$ 揭示了约束满足与分布保持之间的折中：由于 $\lambda$ 控制的是偏好的干预时刻而非直接控制干预幅度，较大的 $\lambda$ 偏好较晚干预。当干预过于接近终端时刻时，修正趋近于把终端样本直接投影到约束流形，能更好地满足约束但可能更偏离预训练分布 $\nu_T$。方法在适中的 $\lambda$ 范围内保持稳定。更多细节见附录 H。

## 5 结论

本文提出 **MintFlow**——一个面向流匹配模型约束生成的免训练框架。通过把约束生成表述为最小轨迹干预，MintFlow 在最小扰动流状态的同时保持已学得的生成动力学。借助基于伴随的灵敏度表述，它高效计算最小范数中间扰动，并对约束满足与分布稳定性给出理论分析。跨不同领域、约束与骨干模型的大量实验表明，MintFlow 在有效满足约束的同时保持预训练分布。尽管 MintFlow 为高效率依赖一阶线性化，在处理高度非线性约束时可用迭代精化或高阶近似无缝补充。未来工作将把 MintFlow 扩展到更具挑战性的非线性或不可微约束、降低其计算开销，并把框架推广到其他基于动力学的生成模型。

**致谢。** 本工作由美国能源部（DOE）科学办公室先进科学计算研究计划资助，资助编号 B&R-KJ0401010、FWP-CC147 及 grant DE-SC0026262。

**可复现性声明。** 我们提供了便于复现方法与实验的必要细节：单步修正与迭代精化的完整算法见算法 2 与算法 3；全部理论假设与完整证明见附录 A；详细实验设置（数据集、模型配置、超参数与评估协议）见附录 D—G；源代码作为匿名补充材料提供。

**AI 使用声明。** 我们仅使用生成式 AI 工具来识别拼写与语法错误，并对英文措辞提出改进建议。所有建议均由作者人工审阅，相应修改由作者完成。我们未将生成式 AI 工具用于 ICLR 2027 AI 政策所列的任何必须披露任务。作者对本工作最终内容负责。

## 参考文献（英文原书目）

> **说明：** 原文参考文献按作者姓氏字母序排列、**未编号**；本页为便于引用添加了序号 [1]—[41]，条目内容未改。

[1] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman. D-flow: Differentiating through flows for controlled generation. International Conference on Machine Learning, 2024.
[2] Chaoran Cheng, Boran Han, Danielle Maddix, Abdul Fatir Ansari, Andrew Stuart, Michael W Mahoney, and Bernie Wang. Gradient-free generation for hard-constrained systems. In International Conference on Learning Representations, volume 2025, pp. 100510–100539, 2025.
[3] Yunjey Choi, Youngjung Uh, Jaejun Yoo, and Jung-Woo Ha. Stargan v2: Diverse image synthesis for multiple domains. 2020.
[4] Jacob K Christopher, Stephen Baek, and Ferdinando Fioretto. Constrained synthesis with projected diffusion models. Advances in Neural Information Processing Systems, 37:89307–89333, 2024.
[5] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. Advances in neural information processing systems, 35:25683–25696, 2022.
[6] Hyungjin Chung, Jeongsol Kim, Michael T. Mccann, Marc L. Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. International Conference on Learning Representations, 2023a.
[7] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023b. URL https://openreview.net/forum?id=OnD9zGAGT0k.
[8] Earl A Coddington. Theory of ordinary differential equations. McGraw-Hill, 1955.
[9] Ruiqi Feng, Chenglei Yu, Wenhao Deng, Peiyan Hu, and Tailin Wu. On the guidance of flow matching. International Conference on Machine Learning, 2025.
[10] Weiguo Gao, Ming Li, and Qianxiao Li. Terminally constrained flow-based generative models from an optimal control perspective. arXiv preprint arXiv:2601.09474, 2026.
[11] Xuan Ju, Ailing Zeng, Yuxuan Bian, Shaoteng Liu, and Qiang Xu. Pnp inversion: Boosting diffusion-based editing with 3 lines of code. In International Conference on Learning Representations, volume 2024, pp. 23395–23422, 2024.
[12] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019.
[13] Gavin Kerrigan, Giosue Migliorini, and Padhraic Smyth. Functional flow matching. arXiv preprint arXiv:2305.17209, 2023.
[14] Jeongsol Kim, Bryan Sangwoo Kim, and Jong Chul Ye. FlowDPS: Flow-driven posterior sampling for inverse problems. In 2025 IEEE/CVF International Conference on Computer Vision (ICCV), pp. 12328–12337. IEEE, 2025.
[15] Alaina Kolli, Theodoros Xenakis, Utkarsh Utkarsh, Pengfei Cai, Rafael Gomez-Bombarelli, Alan Edelman, and Christopher Vincent Rackauckas. SNAP-FM: Sparse nonlinear accelerated projection for physics-constrained generative modeling. arXiv preprint arXiv:2607.00095, 2026.
[16] Vince Kurtz and Alexander Davydov. Constrained flow matching via lagrangian dual flows. arXiv preprint arXiv:2607.04513, 2026.
[17] Sangyun Lee, Zinan Lin, and Giulia Fanti. Improving the training of rectified flows. Advances in Neural Information Processing Systems, 2024.
[18] Xinpeng Li, Enming Liang, and Minghua Chen. Gauge flow matching: Efficient constrained generative modeling over general convex set and beyond. In The Fourteenth International Conference on Learning Representations, 2026a.
[19] Zeyang Li, Kaveh Alim, and Navid Azizan. Hardflow: Hard-constrained sampling for flow-matching models via trajectory optimization. IEEE Transactions on Pattern Analysis and Machine Intelligence, 2026b.
[20] Jinhao Liang, Yixuan Sun, Anirban Samaddar, Sandeep Madireddy, and Ferdinando Fioretto. Chance-constrained flow matching for high-fidelity constraint-aware generation. arXiv preprint arXiv:2509.25157, 2025.
[21] Yaron Lipman, Ricky TQ Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le. Flow matching for generative modeling. International Conference on Learning Representations, 2023.
[22] Jie Liu, Gongye Liu, Jiajun Liang, Yangguang Li, Jiaheng Liu, Xintao Wang, Pengfei Wan, Di Zhang, and Wanli Ouyang. Flow-grpo: Training flow matching models via online rl. Advances in neural information processing systems, 38:40783–40818, 2026.
[23] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. International Conference on Learning Representations, 2023a.
[24] Xingchao Liu, Lemeng Wu, Shujian Zhang, Chengyue Gong, Wei Ping, and Qiang Liu. Flowgrad: Controlling the output of generative odes with gradients. In 2023 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 24335–24344. IEEE, 2023b.
[25] Xingchao Liu, Xiwen Zhang, Jianzhu Ma, Jian Peng, et al. Instaflow: One step is enough for high-quality diffusion-based text-to-image generation. In The twelfth international conference on learning representations, 2023c.
[26] Ségolène Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. Pnp-flow: Plug-and-play image restoration with flow matching. In International Conference on Learning Representations, volume 2025, pp. 45466–45492, 2025a.
[27] Ségolène Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. Pnp-flow: Plug-and-play image restoration with flow matching. International Conference on Learning Representations, 2025b.
[28] Maitreya Patel, Song Wen, Dimitris N. Metaxas, and Yezhou Yang. Steering rectified flow models in the vector field for controlled image generation. International Conference on Computer Vision, 2025.
[29] Ashwini Pokle, Matthew J. Muckley, Ricky T. Q. Chen, and Brian Karrer. Training-free linear image inverses via flows. Transactions on Machine Learning Research, 2024. URL https://openreview.net/forum?id=PLIt3a4yTm.
[30] Lev Semenovich Pontryagin. Mathematical theory of optimal processes. CRC press, 1987.
[31] Mehrsa Pourya, Bassam El Rawas, and Michael Unser. FLOWER: A flow-matching solver for inverse problems. In International Conference on Learning Representations, volume 2026, pp. 91318–91343, 2026.
[32] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In International conference on machine learning, pp. 8748–8763. PmLR, 2021.
[33] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International conference on learning representations, 2023.
[34] Kaiyu Song, Hanjiang Lai, Yan Pan, Kun Yue, and Jian Yin. Flow-matching posterior sampling: A training-free conditional generation for flow matching. IEEE Transactions on Image Processing, 35:5970–5981, 2026. doi: 10.1109/TIP.2026.3698367. URL https://arxiv.org/abs/2411.07625.
[35] Jan Tauberschmidt, Sophie Fellenz, Sebastian Vollmer, and Andrew Duncan. Physics-constrained fine-tuning of flow-matching models for generation and inverse problems. In International Conference on Learning Representations, volume 2026, pp. 143992–144037, 2026.
[36] Utkarsh Utkarsh, Pengfei Cai, Alan Edelman, Rafael Gomez-Bombarelli, and Christopher Rackauckas. Physics-constrained flow matching: Sampling generative models with hard constraints. Advances in Neural Information Processing Systems, 38:160217–160252, 2026.
[37] Luran Wang, Chaoran Cheng, Yizhen Liao, Yanru Qu, and Ge Liu. Training free guided flow matching with optimal control. arXiv preprint arXiv:2410.18070, 2024.
[38] Yici Yan, Yichi Zhang, Xiangming Meng, and Zhizhen Zhao. FIG: Flow with interpolant guidance for linear inverse problems. In International Conference on Learning Representations, volume 2025, pp. 17635–17659, 2025.
[39] Jiwen Yu, Yinhuai Wang, Chen Zhao, Bernard Ghanem, and Jian Zhang. Freedom: Training-free energy-guided conditional diffusion model. International Conference on Computer Vision, 2023.
[40] Zichao Yu, Ming Li, Wenyi Zhang, Difan Zou, and Weiguo Gao. ProFlow: Zero-shot physics-consistent sampling via proximal flow guidance. arXiv preprint arXiv:2601.20227, 2026.
[41] Yasi Zhang, Peiyu Yu, Yaxuan Zhu, Yingshan Chang, Feng Gao, Ying N Wu, and Oscar Leong. Flow priors for linear inverse problems via iterative corrupted trajectory matching. Advances in Neural Information Processing Systems, 37:57389–57417, 2024.

## 附录 A 理论论证

### A.1 最小范数修正的控制论解释

所提修正策略可从（3）与带约束端点优化的最优控制视角给出自然解释。引入 Lagrangians（乘子）$\boldsymbol\eta$：

$$
\frac12|\boldsymbol\delta|^2+\boldsymbol\eta^\top F_s(\boldsymbol\delta),
$$

一阶最优性条件为

$$
\boldsymbol\delta+DF_s(\boldsymbol\delta)^\top\boldsymbol\eta=0,\qquad F_s(\boldsymbol\delta)=0.
$$

因此精确约束修正由非线性 Karush–Kuhn–Tucker（KKT）系统刻画。所提伴随修正算法可解释为与（3）关联的非线性 KKT 系统的一阶近似。把 $DF_s(\boldsymbol\delta)$ 与 $F(\boldsymbol\delta)$ 的一阶 Taylor 展开代入 KKT 条件，得到

$$
\boldsymbol\delta+\mathbf A_s^\top\boldsymbol\eta=0,\qquad \mathbf A_s\boldsymbol\delta+H(\mathbf u_T)=0,
$$

即非线性 KKT 系统在生成轨迹附近的一阶线性化。消去 Lagrange 乘子 $\boldsymbol\eta$ 即得（6）中的最小范数修正。因此所提修正是与最小扰动端点约束优化问题关联的线性化 KKT 系统的解。

### A.2 线性化修正的有效性

我们给出定理 3.1 中非正式理论保证对应的形式化陈述与证明。特别地，定理 A.1 确立最小范数线性化修正的存在性并量化所得约束满足；定理 A.2 进一步表明修正后终端分布相对已学流匹配分布的偏离，被中间修正幅度与剩余积分时间控制。

**定理 A.1（线性化修正的存在性与精度）：** 假设 $f_\theta$ 与 $H$ 二阶连续可微且导数有界

$$
\|D_{\mathbf u}f_\theta(\mathbf u,t)\|_{\mathrm{op}}\le L_1,\quad\|D^2_{\mathbf u}f_\theta(\mathbf u,t)\|_{\mathrm{op}}\le L_2,
$$

以及

$$
\|\nabla H(\mathbf y)\|\le M_{H,1},\qquad\|\nabla^2H(\mathbf y)\|_{\mathrm{op}}\le M_{H,2},
$$

且 $\mathbf A_s=DF_s(0)$ 行满秩。则线性化约束 $\mathbf A_s\boldsymbol\delta+H(\mathbf u_T)=0$ 存在解，其唯一最小范数解为（6）。此外，若

$$
\frac{M_F}{2}\|\boldsymbol\delta^*\|^2<\|H(\mathbf u_T)\|,\qquad M_F:=M_{H,2}e^{2L_1(T-s)}+M_{H,1}\frac{L_2}{L_1}\left(e^{2L_1(T-s)}-e^{L_1(T-s)}\right),
$$

则

$$
\left\|H\left(\Phi(T,s)(\mathbf u_s+\boldsymbol\delta^*)\right)\right\|<\|H(\mathbf u_T)\|.
$$

**证明。** 对固定 $\mathbf u$，定义 $J(t):=D_{\mathbf u}\Phi(t,s)(\mathbf u)$。变分方程为

$$
\frac{\mathrm d}{\mathrm dt}J(t)=D_{\mathbf u}f_\theta(\Phi(t,s)(\mathbf u),t)J(t),\qquad J(s)=\mathbf I.
$$

因此由 Grönwall 不等式得

$$
\left\|D_{\mathbf u}\Phi(T,s)(\mathbf u)\right\|_{\mathrm{op}}\le e^{L_1(T-s)}.
$$

再对 $\mathbf u$ 求一次导数得

$$
\frac{\mathrm d}{\mathrm dt}D^2_{\mathbf u}\Phi(t,s)(\mathbf u)=D_{\mathbf u}f_\theta(\Phi(t,s)(\mathbf u),t)D^2_{\mathbf u}\Phi(t,s)(\mathbf u)+D^2_{\mathbf u}f_\theta(\Phi(t,s)(\mathbf u),t)\left[D_{\mathbf u}\Phi(t,s)(\mathbf u),D_{\mathbf u}\Phi(t,s)(\mathbf u)\right],
$$

且 $D^2_{\mathbf u}\Phi(s,s)(\mathbf u)=0$。由此可得

$$
\frac{\mathrm d}{\mathrm dt}\left\|D^2_{\mathbf u}\Phi(t,s)(\mathbf u)\right\|_{\mathrm{op}}\le L_1\left\|D^2_{\mathbf u}\Phi(t,s)(\mathbf u)\right\|_{\mathrm{op}}+L_2e^{2L_1(t-s)}.
$$

再次应用 Grönwall 不等式得

$$
\left\|D^2_{\mathbf u}\Phi(T,s)(\mathbf u)\right\|_{\mathrm{op}}\le e^{L_1(T-s)}\int_s^T L_2e^{L_1(t-s)}\,\mathrm dt=\frac{L_2}{L_1}e^{L_1(T-s)}\left(e^{L_1(T-s)}-1\right)=\frac{L_2}{L_1}\left(e^{2L_1(T-s)}-e^{L_1(T-s)}\right).
$$

令 $\boldsymbol\phi(\boldsymbol\delta):=\Phi(T,s)(\mathbf u_s+\boldsymbol\delta)$。二阶链式法则给出，对 $\mathbf v,\mathbf w\in\mathbb R^d$：

$$
D^2F_s(\boldsymbol\delta)[\mathbf v,\mathbf w]=D^2H(\boldsymbol\phi(\boldsymbol\delta))[D\boldsymbol\phi(\boldsymbol\delta)\mathbf v,D\boldsymbol\phi(\boldsymbol\delta)\mathbf w]+DH(\boldsymbol\phi(\boldsymbol\delta))\left[D^2\boldsymbol\phi(\boldsymbol\delta)[\mathbf v,\mathbf w]\right].
$$

因此

$$
\left\|D^2F_s(\boldsymbol\delta)\right\|_{\mathrm{op}}\le\left\|\nabla^2H(\boldsymbol\phi(\boldsymbol\delta))\right\|_{\mathrm{op}}\left\|D\boldsymbol\phi(\boldsymbol\delta)\right\|^2_{\mathrm{op}}+\left\|\nabla H(\boldsymbol\phi(\boldsymbol\delta))\right\|\left\|D^2\boldsymbol\phi(\boldsymbol\delta)\right\|_{\mathrm{op}}\le M_{H,2}e^{2L_1(T-s)}+M_{H,1}\frac{L_2}{L_1}\left(e^{2L_1(T-s)}-e^{L_1(T-s)}\right)=:M_F.
$$

由于 $\mathbf u_T=\Phi(T,s)(\mathbf u_s)$，有 $F_s(0)=H(\Phi(T,s)(\mathbf u_s))=H(\mathbf u_T)$。$F_s$ 在 $\boldsymbol\delta=0$ 处的一阶 Taylor 展开为

$$
F_s(\boldsymbol\delta)=F_s(0)+DF_s(0)\boldsymbol\delta+R(\boldsymbol\delta^*),\tag{10}
$$

其中上述估计给出 $\|R(\boldsymbol\delta^*)\|\le\frac{M_F}{2}\|\boldsymbol\delta^*\|^2$。因此

$$
F_s(\boldsymbol\delta)=H(\mathbf u_T)+\mathbf A_s\boldsymbol\delta+O(\|\boldsymbol\delta\|^2).
$$

考虑线性化约束 $\mathbf A_s\boldsymbol\delta+H(\mathbf u_T)=0$。由于 $\mathbf A_s\in\mathbb R^{m\times d}$ 行满秩，$-H(\mathbf u_T)\in\mathrm{Range}(\mathbf A_s)$，故线性化约束存在解。$\mathbf A_s\boldsymbol\delta=-H(\mathbf u_T)$ 的最小范数解由 Moore–Penrose 伪逆给出：$\boldsymbol\delta^*_s=-\mathbf A_s^\dagger H(\mathbf u_T)$。事实上通解可写为

$$
\boldsymbol\delta=-\mathbf A_s^\dagger H(\mathbf u_T)+\left(\mathbf I-\mathbf A_s^\dagger\mathbf A_s\right)\mathbf z,\qquad\mathbf z\in\mathbb R^d.
$$

第一项属于 $\mathrm{Range}(\mathbf A_s^\top)=\mathrm{Null}(\mathbf A_s)^\perp$，而 $(\mathbf I-\mathbf A_s^\dagger\mathbf A_s)\mathbf z\in\mathrm{Null}(\mathbf A_s)$。两项正交，故

$$
\|\boldsymbol\delta\|^2=\left\|\mathbf A_s^\dagger H(\mathbf u_T)\right\|^2+\left\|\left(\mathbf I-\mathbf A_s^\dagger\mathbf A_s\right)\mathbf z\right\|^2.
$$

因此当 $(\mathbf I-\mathbf A_s^\dagger\mathbf A_s)\mathbf z=0$ 时范数唯一最小，即得 $\boldsymbol\delta^*_s=-\mathbf A_s^\dagger H(\mathbf u_T)$。

利用 $F_s(0)=H(\mathbf u_T)$、$DF_s(0)=\mathbf A_s$，线性化（10）给出

$$
F_s(\boldsymbol\delta^*_s)=H(\mathbf u_T)+\mathbf A_s\boldsymbol\delta^*_s+R_s(\boldsymbol\delta^*_s).
$$

由 $\boldsymbol\delta^*_s$ 的构造有 $\mathbf A_s\boldsymbol\delta^*_s=-H(\mathbf u_T)$，故零阶与一阶项相消，得 $F_s(\boldsymbol\delta^*_s)=R_s(\boldsymbol\delta^*_s)$。于是

$$
\|F_s(\boldsymbol\delta^*)\|\le\frac{M_F}{2}\|\boldsymbol\delta^*\|^2,
$$

从而 $F_s(\boldsymbol\delta^*_s)=O(\|\boldsymbol\delta^*_s\|^2)$。因此线性化约束的最小范数解在二阶残差范围内满足原始非线性约束。

关于 $f_\theta$ 与 $H$ 的假设是扰动分析所需的标准光滑性条件。有界的一阶与二阶导数对光滑神经网络与可微约束算子在生成轨迹所经过的有界区域上是合理的。$\mathbf A_s=DF_s(0)$ 行满秩是标准局部非退化假设，确保约束方向局部独立、约束解良定义；但该条件对一般约束未必成立，尤其对高度非线性约束，其 Jacobian 在某些点可能秩亏。因此行满秩假设应视为局部正则性条件，把分析限制在局部正则的约束构型上。

下述定理表明，小的中间修正引起对预训练流所生成终端分布 $\nu_T$ 的可控偏离。

**定理 A.2（中间修正下的分布稳定性）：** 令 $\mathbf u_s\sim\nu_s$，并定义未修正终端状态 $\mathbf u_T=\Phi(T,s)(\mathbf u_s)$，从而 $\mathbf u_T\sim\nu_T$。令 $\mathbf u^*_s=\mathbf u_s+\boldsymbol\delta^*_s(\mathbf u_s)$ 为可测中间修正，定义修正后终端状态 $\mathbf u^*_T=\Phi(T,s)(\mathbf u^*_s)=\Phi(T,s)(\mathbf u_s+\boldsymbol\delta^*_s(\mathbf u_s))$，并令 $\nu^*_T$ 为 $\mathbf u^*_T$ 的分布。假设流场 $f_\theta$ 关于其状态变量在 $t\in[s,T]$ 上一致满足全局 $L_f$-Lipschitz 条件，即

$$
\|f_\theta(\mathbf u,t)-f_\theta(\mathbf v,t)\|\le L_f\|\mathbf u-\mathbf v\|,\quad\forall\mathbf u,\mathbf v,\ t\in[s,T].
$$

则对每个 $\mathbf u_s$ 有 $\|\mathbf u^*_T-\mathbf u_T\|\le e^{L_f(T-s)}\|\boldsymbol\delta^*_s(\mathbf u_s)\|$。因此修正后终端分布满足

$$
W_2(\nu^*_T,\nu_T)\le e^{L_f(T-s)}\left\|\boldsymbol\delta^*_s\right\|_{L^2(\nu_s)}.
$$

**证明。** 固定 $\mathbf u_s\in\mathbb R^d$，考虑未修正与修正轨迹

$$
\mathbf u(t)=\Phi(t,s)(\mathbf u_s),\qquad \mathbf u^*(t)=\Phi(t,s)(\mathbf u_s+\boldsymbol\delta^*_s(\mathbf u_s)),\quad t\in[s,T].
$$

定义差 $e(t)=\mathbf u^*(t)-\mathbf u(t)$。由于两条轨迹按同一流场演化，

$$
\frac{\mathrm d}{\mathrm dt}e(t)=f_\theta(\mathbf u^*(t),t)-f_\theta(\mathbf u(t),t).
$$

由 $L_f$-Lipschitz 假设，$\left\|\frac{\mathrm d}{\mathrm dt}e(t)\right\|\le L_f\|e(t)\|$。此外在修正时刻 $e(s)=\mathbf u^*_s-\mathbf u_s=\boldsymbol\delta^*_s(\mathbf u_s)$。因此对几乎所有 $t\in[s,T]$ 有 $\frac{\mathrm d}{\mathrm dt}\|e(t)\|\le L_f\|e(t)\|$。应用 Grönwall 不等式得 $\|e(T)\|\le e^{L_f(T-s)}\|e(s)\|$。由于 $e(T)=\mathbf u^*_T-\mathbf u_T$ 且 $e(s)=\boldsymbol\delta^*_s(\mathbf u_s)$，得到逐点界 $\|\mathbf u^*_T-\mathbf u_T\|\le e^{L_f(T-s)}\|\boldsymbol\delta^*_s(\mathbf u_s)\|$。

接下来证明分布界。由于 $\mathbf u_s\sim\nu_s$ 且 $\mathbf u_T=\Phi(T,s)(\mathbf u_s)$，流的推前性质给出 $\mathbf u_T\sim\Phi(T,s)_\#\nu_s=\nu_T$。类似地由定义 $\mathbf u^*_T=\Phi(T,s)(\mathbf u_s+\boldsymbol\delta^*_s(\mathbf u_s))\sim\nu^*_T$。因此联合随机变量 $(\mathbf u_T,\mathbf u^*_T)$ 定义了 $\nu_T$ 与 $\nu^*_T$ 的一个耦合。由 Wasserstein-2 距离定义，

$$
W_2^2(\nu^*_T,\nu_T)\le\mathbb E\left[\|\mathbf u^*_T-\mathbf u_T\|^2\right].
$$

应用逐点稳定性界得

$$
W_2^2(\nu^*_T,\nu_T)\le\mathbb E\left[e^{2L_f(T-s)}\|\boldsymbol\delta^*_s(\mathbf u_s)\|^2\right]=e^{2L_f(T-s)}\mathbb E_{\mathbf u_s\sim\nu_s}\left[\|\boldsymbol\delta^*_s(\mathbf u_s)\|^2\right].
$$

开方即得 $W_2(\nu^*_T,\nu_T)\le e^{L_f(T-s)}\left(\mathbb E_{\mathbf u_s\sim\nu_s}\left[\|\boldsymbol\delta^*_s(\mathbf u_s)\|^2\right]\right)^{1/2}=e^{L_f(T-s)}\|\boldsymbol\delta^*_s\|_{L^2(\nu_s)}$。

关于 $f_\theta$ 的全局 Lipschitz 假设是神经 ODE 的标准正则性条件，确保流轨迹的存在性、唯一性与稳定性；对包含生成轨迹的有界区域上的光滑神经网络通常合理。然而整个状态空间上的全局 Lipschitz 性对实际神经网络可能过强，因此该假设可解释为仅在流所探索的相关状态区域上要求 Lipschitz 连续。

### A.3 迭代精化的收敛性

**定理 A.3（迭代精化的收敛性）：** 令 $f_\theta:\mathbb R^d\times[s,T]\to\mathbb R^d$ 关于 $\mathbf u$ 为 $C^2$，$H:\mathbb R^d\to\mathbb R$ 为 $C^2$，并令 $\Delta=T-s$。假设在相关可达集上

$$
\|D_{\mathbf u}f_\theta(\mathbf u,t)\|_{\mathrm{op}}\le L_1,\quad\|D^2_{\mathbf u}f_\theta(\mathbf u,t)\|_{\mathrm{op}}\le L_2,
$$

且

$$
0<m_H\le\|\nabla H(\mathbf y)\|\le M_{H,1},\qquad\|\nabla^2H(\mathbf y)\|_{\mathrm{op}}\le M_{H,2}.
$$

则（6）给出的修正 $\mathbf u^{(n+1)}=\mathbf u^{(n)}+\boldsymbol\delta^{(n)}$ 满足

$$
|F(\mathbf u^{(n+1)})|\le K|F(\mathbf u^{(n)})|^2,
$$

其中

$$
K=\frac1{2m_H^2}\left[M_{H,2}e^{4L_1\Delta}+M_{H,1}\frac{L_2}{L_1}\left(e^{4L_1\Delta}-e^{3L_1\Delta}\right)\right].
$$

因此，若 $K|F(\mathbf u^{(0)})|<1$，则

$$
|F(\mathbf u^{(n)})|\le\frac1K\left(K|F(\mathbf u^{(0)})|\right)^{2^n}.
$$

特别地，使 $|F(\mathbf u^{(n)})|\le\epsilon$ 的充分迭代次数为

$$
n\ge\log_2\left(\frac{\log(1/(K\epsilon))}{\log(1/(K|F(\mathbf u^{(0)})|))}\right).
$$

**证明。** 令 $\boldsymbol\phi(\mathbf u):=\Phi(T,s)(\mathbf u)$。对固定 $\mathbf u$，定义 $J(t):=D_{\mathbf u}\Phi(t,s)(\mathbf u)$。变分方程为 $\frac{\mathrm d}{\mathrm dt}J(t)=D_{\mathbf u}f_\theta(\Phi(t,s)(\mathbf u),t)J(t)$，$J(s)=\mathbf I$。由 Grönwall 不等式得 $\|D_{\mathbf u}\Phi(T,s)(\mathbf u)\|_{\mathrm{op}}\le e^{L_1\Delta}$。由于流是微分同胚，

$$
D_{\mathbf u}\Phi(T,s)(\mathbf u)^{-1}=D_{\mathbf y}\Phi(s,T)(\mathbf y),\qquad \mathbf y=\Phi(T,s)(\mathbf u),
$$

把相同估计用于逆流得 $\|D_{\mathbf u}\Phi(T,s)(\mathbf u)^{-1}\|_{\mathrm{op}}\le e^{L_1\Delta}$。因此

$$
\sigma_{\min}\left(D_{\mathbf u}\Phi(T,s)(\mathbf u)\right)=\frac1{\|D_{\mathbf u}\Phi(T,s)(\mathbf u)^{-1}\|_{\mathrm{op}}}\ge e^{-L_1\Delta}.
$$

再对 $\mathbf u$ 求一次变分方程的导数，得

$$
\frac{\mathrm d}{\mathrm dt}D^2_{\mathbf u}\Phi(t,s)(\mathbf u)=D_{\mathbf u}f_\theta(\Phi(t,s)(\mathbf u),t)D^2_{\mathbf u}\Phi(t,s)(\mathbf u)+D^2_{\mathbf u}f_\theta(\Phi(t,s)(\mathbf u),t)\left[D_{\mathbf u}\Phi(t,s)(\mathbf u),D_{\mathbf u}\Phi(t,s)(\mathbf u)\right],
$$

且 $D^2_{\mathbf u}\Phi(s,s)(\mathbf u)=0$。利用 $\|D_{\mathbf u}\Phi(t,s)(\mathbf u)\|_{\mathrm{op}}\le e^{L_1(t-s)}$ 得

$$
\frac{\mathrm d}{\mathrm dt}\left\|D^2_{\mathbf u}\Phi(t,s)(\mathbf u)\right\|_{\mathrm{op}}\le L_1\left\|D^2_{\mathbf u}\Phi(t,s)(\mathbf u)\right\|_{\mathrm{op}}+L_2e^{2L_1(t-s)}.
$$

再次应用 Grönwall 不等式得

$$
\left\|D^2_{\mathbf u}\Phi(T,s)(\mathbf u)\right\|_{\mathrm{op}}\le e^{L_1\Delta}\int_s^T L_2e^{L_1(t-s)}\,\mathrm dt=\frac{L_2}{L_1}e^{L_1\Delta}\left(e^{L_1\Delta}-1\right)=\frac{L_2}{L_1}\left(e^{2L_1\Delta}-e^{L_1\Delta}\right).
$$

由链式法则 $\nabla F(\mathbf u)=D\boldsymbol\phi(\mathbf u)^\top\nabla H(\boldsymbol\phi(\mathbf u))$，可得

$$
\|\nabla F(\mathbf u)\|\ge\sigma_{\min}(D\boldsymbol\phi(\mathbf u))\|\nabla H(\boldsymbol\phi(\mathbf u))\|\ge m_He^{-L_1\Delta}.
$$

二阶链式法则给出，对 $\mathbf v,\mathbf w\in\mathbb R^d$：

$$
D^2F(\mathbf u)[\mathbf v,\mathbf w]=D^2H(\boldsymbol\phi(\mathbf u))[D\boldsymbol\phi(\mathbf u)\mathbf v,D\boldsymbol\phi(\mathbf u)\mathbf w]+DH(\boldsymbol\phi(\mathbf u))\left[D^2\boldsymbol\phi(\mathbf u)[\mathbf v,\mathbf w]\right].
$$

因此

$$
\left\|D^2F(\mathbf u)\right\|_{\mathrm{op}}\le\left\|\nabla^2H(\boldsymbol\phi(\mathbf u))\right\|_{\mathrm{op}}\left\|D\boldsymbol\phi(\mathbf u)\right\|^2_{\mathrm{op}}+\left\|\nabla H(\boldsymbol\phi(\mathbf u))\right\|\left\|D^2\boldsymbol\phi(\mathbf u)\right\|_{\mathrm{op}}\le M_{H,2}e^{2L_1\Delta}+M_{H,1}\frac{L_2}{L_1}\left(e^{2L_1\Delta}-e^{L_1\Delta}\right)=:M_F.
$$

由于最优扰动为 $\boldsymbol\delta^{(n)}:=\mathbf u^{(n+1)}-\mathbf u^{(n)}=-\frac{F(\mathbf u^{(n)})}{\|\nabla F(\mathbf u^{(n)})\|^2}\nabla F(\mathbf u^{(n)})$，有

$$
\|\boldsymbol\delta^{(n)}\|=\frac{|F(\mathbf u^{(n)})|}{\|\nabla F(\mathbf u^{(n)})\|}\le\frac{e^{L_1\Delta}}{m_H}|F(\mathbf u^{(n)})|.
$$

由 Taylor 定理，

$$
F(\mathbf u^{(n)}+\boldsymbol\delta^{(n)})=F(\mathbf u^{(n)})+\nabla F(\mathbf u^{(n)})^\top\boldsymbol\delta^{(n)}+R^{(n)},\qquad |R^{(n)}|\le\frac{M_F}{2}\|\boldsymbol\delta^{(n)}\|^2.
$$

由于 $\boldsymbol\delta^{(n)}$ 满足 $\nabla F(\mathbf u^{(n)})^\top\boldsymbol\delta^{(n)}=-F(\mathbf u^{(n)})$，可得 $F(\mathbf u^{(n+1)})=R^{(n)}$，故

$$
|F(\mathbf u^{(n+1)})|\le\frac{M_F}{2}\|\boldsymbol\delta^{(n)}\|^2\le\frac{M_Fe^{2L_1\Delta}}{2m_H^2}|F(\mathbf u^{(n)})|^2.
$$

把 $M_F$ 的定义代入得 $|F(\mathbf u^{(n+1)})|\le K|F(\mathbf u^{(n)})|^2$，其中

$$
K=\frac1{2m_H^2}\left[M_{H,2}e^{4L_1\Delta}+M_{H,1}\frac{L_2}{L_1}\left(e^{4L_1\Delta}-e^{3L_1\Delta}\right)\right].
$$

最后令 $r^{(n)}:=|F(\mathbf u^{(n)})|$，则 $r^{(n+1)}\le K(r^{(n)})^2$。若 $Kr^{(0)}<1$，归纳可得

$$
r^{(n)}\le\frac1K(Kr^{(0)})^{2^n}.
$$

事实上若该界在第 $n$ 次迭代成立，则 $r^{(n+1)}\le K\left[\frac1K(Kr^{(0)})^{2^n}\right]^2=\frac1K(Kr^{(0)})^{2^{n+1}}$。因此当 $(Kr^{(0)})^{2^n}\le K\epsilon$ 时 $|F(\mathbf u^{(n)})|\le\epsilon$；由于 $Kr^{(0)}<1$，这等价于

$$
2^n\ge\frac{\log(1/(K\epsilon))}{\log(1/(Kr^{(0)}))},
$$

即证得所述迭代界与渐近估计 $N_\epsilon=O\left(\log\log\frac1\epsilon\right)$。

### A.4 向整流流的特化

当预训练流为整流流（rectified flow, RF）模型且采样采用 Euler 离散时，所提轨迹干预具有特别简单的形式。特别地，对从中间时刻 $s$ 到终端时刻 $T$ 的单步采样，RF 采样器形式为

$$
\mathbf u_T=\mathbf u_s+(T-s)\mathbf v_\theta(\mathbf u_s,s),\tag{11}
$$

其中 $\mathbf v_\theta$ 表示学到的 RF 速率场。施加中间扰动 $\boldsymbol\delta$ 后，相应终端状态变为

$$
\mathbf u^\delta_T=\mathbf u_s+\boldsymbol\delta+(T-s)\mathbf v_\theta(\mathbf u_s+\boldsymbol\delta,s).\tag{12}
$$

相应地，终端约束可写为

$$
F_s(\boldsymbol\delta)=H\left(\mathbf u_s+\boldsymbol\delta+(T-s)\mathbf v_\theta(\mathbf u_s+\boldsymbol\delta,s)\right).\tag{13}
$$

与一般连续时间表述不同，终端状态对中间扰动的灵敏度可直接由 RF 速率场的局部 Jacobian 得到。特别地，

$$
\left.\frac{\partial\mathbf u^\delta_T}{\partial\boldsymbol\delta}\right|_{\boldsymbol\delta=0}=\mathbf I+(T-s)J_{\mathbf v}(\mathbf u_s,s),\qquad J_{\mathbf v}(\mathbf u_s,s):=\frac{\partial\mathbf v_\theta}{\partial\mathbf u}(\mathbf u_s,s).\tag{14}
$$

因此（3）中的约束 Jacobian 变为

$$
\mathbf A_s=\nabla H(\mathbf u_T)\left[\mathbf I+(T-s)J_{\mathbf v}(\mathbf u_s,s)\right].\tag{15}
$$

对标量值约束 $H$，定义拉回约束梯度

$$
\mathbf g_s:=\left[\mathbf I+(T-s)J_{\mathbf v}(\mathbf u_s,s)\right]^\top\nabla H(\mathbf u_T)^\top.\tag{16}
$$

于是最小范数线性化修正为

$$
\boldsymbol\delta^*_s=-\frac{\mathbf g_s}{\|\mathbf g_s\|^2}H(\mathbf u_T),\qquad \mathbf g_s\ne0.\tag{17}
$$

重要的是，计算 $\mathbf g_s$ 无需显式构造完整 Jacobian $J_{\mathbf v}$，只需通过预训练速率网络做一次向量–Jacobian 乘积即可获得。因此对单步 RF 采样器，连续伴随 ODE 可被局部离散灵敏度计算替代。

更一般地，当 RF 采样器使用多步 Euler 时，

$$
\mathbf u_{k+1}=\mathbf u_k+\Delta t_k\mathbf v_\theta(\mathbf u_k,t_k),\tag{18}
$$

从第 $k$ 步干预到终端状态的灵敏度由相应局部 Jacobian 的乘积给出：

$$
D\Phi_{\mathrm{RF}}(1,t_k)=\prod_{j=k}^{K-1}\left[\mathbf I+\Delta t_jJ_{\mathbf v}(\mathbf u_j,t_j)\right].\tag{19}
$$

其转置可通过离散伴随或对剩余采样步的标准反向模式微分高效计算。因此所提方法自然地从连续时间伴随表述推广到实践中使用的离散 RF 采样器。

最后，（17）揭示了本方法与普通终端投影之间的关系。若 RF 速率场对状态局部不敏感，即

$$
J_{\mathbf v}(\mathbf u_s,s)\approx0,\tag{20}
$$

则

$$
\mathbf g_s\approx\nabla H(\mathbf u_T)^\top,\tag{21}
$$

所提修正退化为对终端状态线性化约束流形的标准最小范数投影。相反，当 $J_{\mathbf v}(\mathbf u_s,s)$ 不可忽略时，因子

$$
\left[\mathbf I+(T-s)J_{\mathbf v}(\mathbf u_s,s)\right]^\top\tag{22}
$$

刻画了中间扰动在到达终端状态前如何被 RF 动力学变换。因此所提修正可视为**动力学感知投影**，而非纯粹的终端事后投影。

## 附录 B 算法

我们汇总第 3 节所提约束生成算法：单次修正流程见算法 2，其迭代扩展见算法 3。

```text
Algorithm 2 基于伴随的最优修正
Require: 初始样本 u_0 ~ μ, 速率场 f_θ, 约束 H, 候选时刻 0 < s_1 < … < s_K < T, 折中参数 λ
1:  前向采样
2:  求解  u̇ = f_θ(u,t), u(0)=u_0，从 0 到 T，存储 {u(s_k)}_{k=1}^K 与终端状态 u_T
3:  计算终端残差 r = H(u_T)
4:  反向伴随求解
5:  初始化 λ(T) = ∇H(u_T)^⊤
6:  仅从 T 到 s_1 反向求解一次伴随 ODE，并在到达每个候选时刻时存储 λ(s_k):
        λ̇ = -(∇_u f_θ(u,t))^⊤ λ
7:  候选评估
8:  for k = 1, …, K do
9:      计算 A_{s_k} = ∇H(u_T) DΦ(T, s_k)
10:     计算 δ*_k = -A_{s_k}^† r
11:     评估 J_k = ‖δ*_k‖² + λ(T-s_k)²
12: end for
13: 选择 k* = arg min_k J_k
14: 从 s_{k*} 重新积分流:
        u(s_{k*}) ← u(s_{k*}) + δ*_{k*}，通过 u̇ = f_θ(u,t), t ∈ [s_{k*}, T]
return 修正后样本 u_T^corr
```

```text
Algorithm 3 迭代式基于伴随的最优修正
Require: 初始样本 u_0 ~ μ, 速率场 f_θ, 约束 H, 候选数 K, 迭代数 N
1: s_0 ← 0, u(s_0) ← u_0
2: for i = 1, …, N do
3:    在 [s_{i-1}, T] 上采样轨迹
4:    选择候选时刻 s_{i-1} < s_1 < … < s_K < T
5:    从 T 到 s_1 求解一次伴随 ODE
6:    for k = 1, …, K do
7:        按 (6) 计算 δ*_k
8:        评估 J(s_k)
9:    end for
10:   s_i ← arg min_{s_k} J(s_k)
11:   从 u(s_i) ← u(s_i) + δ*_i 重新积分流
12: end for
return 修正后样本 u_T^corr
```

## 附录 C 相关工作

我们考虑预训练流匹配 (Lipman et al., 2023) 与整流流模型 (Liu et al., 2023a) 的推理时约束施加。现有方法可按采样期间纳入约束的方式大致分类：修改速率场、投影到约束流形、或优化源状态/中间状态，分别如图 2a、2b、2c 所示。

**速率修改。** 一类工作修改预训练速率场，把生成轨迹引向期望目标或约束。通用流匹配引导为能量倾斜律导出精确或近似修正 (Feng et al., 2025)。图像逆问题求解器用基于梯度的引导把路径校正到数据流形 (Chung et al., 2022; 2023b; Song et al., 2023)，并通过似然梯度、端点估计、测量插值或后验分数替代把同一思想适配到流匹配 (Pokle et al., 2024; Song et al., 2026; Yan et al., 2025; Kim et al., 2025)。TOCFlow 把终端约束表述为基于下游流度量的几何感知反馈的最优控制 (Gao et al., 2026)。Lagrangian Dual Flows 以对偶与松弛动力学扩展 ODE，使等式与不等式残差在终端时刻附近趋于零 (Kurtz & Davydov, 2026)。这些方法直接改变采样动力学，且每个约束都需要重算约束特定的速率修正；而我们的方法保持预训练向量场不变。

**投影。** 投影方法在流积分与修正之间交替，把状态投影到可行集或观测一致集 (Christopher et al., 2024)。ECI 把中间状态外推到端点、施加约束修正，再把结果插值回轨迹 (Cheng et al., 2025)。PCFM 把终端打靶与 Gauss–Newton 投影及基于最优输运的重新插入相结合 (Utkarsh et al., 2026)。ProFlow 以物理与观测约束上的近端问题替代终端修正，而 CCFM 投影到随时间变化的机会可行集 (Yu et al., 2026; Liang et al., 2025)。图像逆问题求解器把数据一致性修正与流路径重投影结合 (Pourya et al., 2026)，SNAP-FM 通过稀疏优化加速 PCFM 风格的非线性投影 (Kolli et al., 2026)。投影可有效施加约束，但显式状态修正可能引起对预训练模型所学分布的偏离；相反我们的方法避免显式投影，转而通过中间状态的小扰动减小约束违反。

**优化。** 另一类方法把约束施加表述为生成轨迹上的优化问题：把源噪声、中间状态或分布式控制视为决策变量，优化它们以产生满足约束的样本。D-Flow 通过对完整流求解器微分终端目标来优化源噪声 (Ben-Hamu et al., 2024)；然而对整个采样 ODE 反向传播需要跨所有积分步计算梯度，使优化计算昂贵。FlowChef 通过把该表述适配到整流流提升了效率，从而无需对 ODE 积分反向传播 (Patel et al., 2025)。与优化源噪声不同，FlowChef 顺序优化中间状态。HardFlow 在估计的终端状态上求解带硬约束的滚动时域轨迹优化问题 (Li et al., 2026b)，而 OC-Flow 用伴随共状态与运行偏差惩罚优化分布式控制 (Wang et al., 2024)。FlowGrad (Liu et al., 2023b) 同样通过对终端引导损失反向传播梯度来优化分布式控制。其他相关工作把终端梯度传播到中间控制并优化受扰轨迹 (Liu et al., 2023b; Zhang et al., 2024)。这些方法保持预训练速率场不变，从而无需改变底层采样动力学即可适应广泛的约束；但求解所得优化问题在计算上可能昂贵，且优化中间状态可能引入对预训练模型已学分布的偏离。相反，我们的方法使用中间状态的最小扰动，并以单一伴随系统替代迭代优化，在降低对已学分布偏离的同时实现更高效的约束施加。

**表 4：实验与消融研究总览。** 我们在多样任务、数据集与流匹配（FM）模型上评估方法，并进一步开展消融研究；详细实验设置与结果见相应章节。（来源：原文第 23 页。）

| 任务 | 细节 | 数据 | FM 模型 | 约束 |
|---|---|---|---|---|
| 图像生成 | 附录 D | MNIST、CIFAR-10 | Flow Matching | 强度、保真度 |
| 图像逆问题 | 附录 E（§4.1） | AFHQ-Cat、FFHQ | Rectified Flow | 观测一致性 |
| 图像编辑 | 附录 F（§4.2） | PIE-Bench | 潜空间文本条件 FM | 文本引导生成 + 区域保持 |
| 物理知情生成 | 附录 G（§4.3） | Heat、RD1D PDE | Functional Flow Matching | 边界条件、守恒律 |
| 消融研究 | 附录 H | — | — | — |

## 附录 D 应用 1：图像生成

本附录给出正文未包含的图像生成补充实验，包括基准定义、模型与采样配置、评估协议以及额外诊断。我们在图像生成任务上用两类约束评估标准流匹配模型：**颜色强度约束**与由预训练自编码器定义的**非线性保真约束**。与正文实验一起，这些结果进一步表明我们的方法可跨不同流匹配模型与多样图像域约束（包括非线性约束）泛化，突出了 MintFlow 的通用性。

与主实验一致，我们分别量化约束生成质量的两个方面：

- **约束满足：** 生成图像满足规定约束的准确程度。
- **分布保真：** 生成图像分布相对参考图像分布的保持程度。

### D.1 数据集与约束

我们使用 torchvision 提供的标准 **MNIST** 与 **CIFAR-10** 数据集。所有图像转换为 float32 张量并缩放到 $[-1,1]$ 范围。

**颜色强度约束。** 对图像 $\mathbf u\in[-1,1]^{C\times H\times W}$，定义逐通道平均强度向量为

$$
\bar{\mathbf u}:=\frac1{HW}\sum_{h=1}^{H}\sum_{w=1}^{W}\mathbf u_{:,h,w}\in\mathbb R^C.\tag{23}
$$

给定目标强度向量 $\mathbf c\in\mathbb R^C$，我们施加约束

$$
H(\mathbf u;\mathbf c):=\bar{\mathbf u}-\mathbf c=\frac1{HW}\sum_{h=1}^{H}\sum_{w=1}^{W}\mathbf u_{:,h,w}-\mathbf c=0.\tag{24}
$$

对 $C=1$ 的 MNIST，我们施加具有规定目标 $c\in\mathbb R$ 的标量强度约束：

$$
H(\mathbf u):=\frac1{HW}\sum_{h=1}^{H}\sum_{w=1}^{W}u_{1,h,w}-c=0.\tag{25}
$$

目标强度 $c$ 主要控制生成数字的整体笔画粗细；对 CIFAR-10，该约束通过各 RGB 通道的平均强度控制生成图像的整体色彩构成。对每个数据集，我们首先计算原始图像平均强度值的经验分布，然后从该分布第 20 至 80 百分位之间的范围随机采样多个目标值。我们把目标值限制在该中心范围，以避免过于稀有的强度水平（数据中仅很小比例自然满足该约束），从而确保约束在底层数据分布中得到足够表示。

**AE 保真约束。** 我们进一步考虑由在真值数据上训练的自编码器（AE）定义的保真相关约束。令 Enc 与 Dec 分别表示编码器与解码器，定义重建约束为

$$
H(\mathbf u)=\mathrm{Dec}(\mathrm{Enc}(\mathbf u))-\mathbf u=0.\tag{26}
$$

对训练良好的 AE，与已学数据分布一致的样本其重建误差应很小；因此施加该约束可促使生成样本保持预训练数据流形所捕获的特征。我们使用该约束不仅是为提升生成图像保真度，也是为了检验 MintFlow 在由训练好的神经网络定义的高度非线性、复杂约束下的稳健性。

对 MNIST，我们训练一个 128 维潜在表示的卷积 AE，使用 Adam 优化器、学习率 $10^{-3}$、训练 200 个 epoch，采用 Smooth L1 重建损失，训练期间输入归一化到 $[-1,1]$。对 CIFAR-10，我们训练更深的卷积 AE（256 维潜在表示），训练 200 个 epoch，使用 AdamW、学习率 $5\times10^{-5}$、权重衰减 $10^{-4}$ 以及余弦学习率调度，采用 L1 重建损失；CIFAR-10 图像归一化到 $[-1,1]$ 并在训练中随机水平翻转。训练好的 AE 在测试集上分别取得 MNIST 0.0008、CIFAR-10 0.00139 的重建损失，表明对数据实现了准确重建，为所提 AE 保真约束提供了可靠基础。该实验假设预训练 AE 为底层数据分布提供了有意义的表示；其目的是评估 MintFlow 对预训练神经网络诱导的非线性约束的适用性，而非声称 AE 重建误差是普遍最优的保真度量。

### D.2 流匹配模型与基线

对图像数据集，所有流匹配模型基于官方 Flow Matching 仓库³实现；我们使用 U-Net 架构，表 5 汇总模型配置。所有实验用 AdamW 优化器、学习率 $1\times10^{-4}$、动量系数 $\beta_1=0.9$ 与 $\beta_2=0.95$，并采用常数学习率调度器在训练全程保持学习率不变。推理时所有实验用 100 个积分步求解流 ODE。我们考虑与 §4.3 相同的基线：具体地，DiffusionPDE 用约束梯度引导预训练 FM 速率，D-Flow 优化潜在噪声以满足约束，而 ECI 与 PCFM 通过最终投影步骤施加约束。尽管其中一些方法主要面向物理知情约束生成，其表述本质上并不局限于物理数据，原则上可应用于具有可微约束的通用数据域；因此我们在此纳入它们，以考察其在图像域约束上的适用性并提供一致的实证比较。特别地，此处考虑的颜色强度约束与这些方法所处理的守恒约束具有相同的全局结构，是跨域评估的自然设定。AE 保真约束进一步考察这些方法在由预训练神经网络诱导的更复杂、高度非线性约束下的表现。我们的目的不是说图像生成是这些方法的最初设计目标，而是评估约束生成方法在不同数据域与约束结构上的通用性。对图像数据上的本方法，我们把候选干预时刻数设为 $K=10$，在整个采样轨迹上均匀分布。所有图像实验在单块 NVIDIA H200 GPU 上完成。

> **脚注 3（原文）：** https://github.com/facebookresearch/flow_matching

**表 5：图像数据集的流匹配模型配置。**（来源：原文第 25 页。）

| 数据集 | 通道数 | ResBlocks | 注意力 | Dropout | 通道倍数 |
|---|---|---|---|---|---|
| MNIST | 64 | 2 | {2} | 0.1 | (1,2,2) |
| CIFAR-10 | 128 | 4 | {2} | 0.3 | (2,2,2) |

### D.3 评估协议

为评估约束生成样本的质量，我们考虑两个方面：约束满足与数据分布保持。

**约束满足。** 我们用生成样本上的平均约束值衡量约束满足。对每种方法（包括真值条件样本），我们生成 2000 个样本并报告平均约束值。

**条件分布保持。** 为评估生成样本是否保持流匹配模型在施加约束下所学得的分布，我们度量约束生成样本与参考样本之间的差异。约束生成的目标是在保持预训练流匹配模型所学分布内的同时获得满足约束的样本；因此评估所用参考分布**不是**真值数据分布，而是由预训练流匹配模型生成的样本构造的条件分布。具体地，我们首先从预训练流匹配模型采样，收集 2000 个满足给定约束的样本作为评估参考；然后度量约束生成样本与参考样本之间的差异，以量化生成样本保持流匹配诱导分布的程度。对图像数据，我们用 FID、KID、MMD 与 Wasserstein-2（$W_2$）距离评估条件分布匹配。对 MMD 使用高斯 RBF 核

$$
k(\mathbf x,\mathbf y)=\exp\left(-\frac{\|\mathbf x-\mathbf y\|^2}{2\sigma^2}\right),
$$

其中 $\sigma^2$ 由生成样本与参考样本成对距离的中位数启发式确定。由于在高维特征空间直接估计经验 $W_2$ 距离在计算上不可行，我们用经验均值与协方差把每个特征分布近似为高斯分布，并计算所得高斯近似之间的精确 $W_2$ 距离；这提供了计算可行、且同时捕捉一阶与二阶统计差异的分布度量。

**表 6：平均强度约束 MNIST 数据集上的定量结果。** 浅绿表示最佳、浅红表示次佳。（来源：原文第 26 页。）

| 方法 | FID↓ | KID↓ | MMD↓ | $W_2$↓ | $H$↓ | 时间(s)↓ | 显存(GB)↓ |
|---|---|---|---|---|---|---|---|
| Unconstrained | 0.879 | 0.02215 | 0.03158 | 0.938 | 2.79E-1 | 5.07 | 0.10 |
| DiffusionPDE | 0.899 | 0.06860 | 0.04427 | 1.064 | 5.36E-2 | 4.29 | 5.10 |
| D-Flow | 0.813 | 0.05342 | 0.04726 | 0.902 | 5.49E-2 | 703.40 | 125.27 |
| ECI | 1.851 | 0.09982 | 0.07863 | 1.361 | **3.55E-15** | 8.89 | 0.35 |
| PCFM | 1.736 | 0.12379 | 0.12064 | 1.317 | 1.43E-12 | 18.37 | 10.12 |
| Ours | **0.262** | **0.01812** | **0.01289** | **0.602** | 4.55E-5 | 6.66 | 0.74 |

对 MNIST，特征空间指标使用预训练 MNIST 分类器的倒数第二层表示计算；该分类器是在 MNIST 训练集上用 Adam、学习率 $10^{-3}$ 训练 200 个 epoch 的残差卷积网络，提取的特征为最终分类层之前的 64 维表示。对 CIFAR-10，特征表示由预训练的 Inception-v3 网络提取。效率方面，运行时按每个生成样本的同步墙钟时间度量，显存报告为峰值分配的 GPU 显存。

### D.4 结果

#### D.4.1 MNIST

**强度约束。** 我们在 MNIST 上以目标值 $-0.6$ 的平均强度约束评估 MintFlow，对每种方法生成 2,000 个样本，所有方法使用同一预训练 FM 模型。为构造评估分布指标的参考分布，我们从预训练 FM 模型采样并保留满足目标约束的样本，得到 2,000 个约束满足样本，作为预训练流模型诱导的条件分布的真值样本。表 6 汇总定量结果，图 8 给出各方法的定性比较。

在现有约束生成方法中，ECI 与 PCFM 先生成样本、再施加事后投影以施加约束，因此这些方法获得近乎精确的约束满足（约束误差极小）；然而其分布匹配性能显著恶化，表明严格的事后约束施加会使生成样本偏离流模型所学分布。这一行为在定性结果中同样明显：其最终投影调整生成样本以满足目标平均强度，却未显式保持原始样本的视觉结构；由于投影只施加全局强度约束，可能显著改变图像外观。

D-Flow 在基线中取得最强的分布性能，但其计算开销很大：其优化需要在从潜在噪声到生成样本的整个采样 ODE 中保留计算图以计算所需梯度，使其比无需对完整采样轨迹反向传播的方法显著更耗显存与时间。相反，MintFlow 在约束满足与分布保真之间提供更好平衡：尽管其约束误差略高于 PCFM 与 ECI，却取得显著更好的 FID、KID、MMD 与 $W_2$ 分数，表明与预训练流模型诱导的条件分布更一致。MintFlow 也比迭代修正方法 D-Flow 与 PCFM 更快，尽管其伴随 ODE 表述需要 Jacobian–向量乘积。

对 MNIST，平均图像强度与数字笔画粗细密切相关。如图 7 所示，改变目标强度可使 MintFlow 产生更粗或更细的笔画，同时保持数字的整体结构。这表明强度约束对显著视觉属性提供了直接且可解释的控制。与通过修改最终生成样本寻找约束满足点的投影方法不同，MintFlow 沿流轨迹施加中间扰动；因此修正样本不被显式要求接近其无约束对应样本，使模型在更好保持已学数据分布的同时达到目标约束。

**图 7：** 用平均强度约束控制 MNIST 数字笔画粗细：从无约束样本出发，本方法按不同目标强度约束修改生成数字，产生更粗或更细的笔画并保持分布。（来源：原文第 27 页。）

**数据保真约束。** 为评估本方法能否提升生成样本保真度，我们考虑基于 AE 的学习型可靠性约束。AE 被训练通过编码–解码流程重建原始 MNIST 图像；因此对训练良好的 AE，（26）中的重建误差衡量生成样本落在已学数据流形上的程度。本实验中满足 AE 约束促使生成样本保持原始 MNIST 分布的特征；相应地，我们用原始 MNIST 测试集作为真值分布，计算生成样本与真值 MNIST 样本之间的分布指标。

定量结果汇总于表 7，定性结果见图 9。与无约束采样相比，我们的修正方法一致改善所有分布匹配指标，表明所提学习型约束可在保持接近原始流诱导分布的同时，引导预训练流模型产生保真度更高的样本。与通过额外训练或模型精化提升样本质量的方法不同，我们的框架提供一种互补的推理时策略，在修改底层模型参数的前提下增强预训练流匹配模型。

**表 7：AE 保真约束 MNIST 数据集上的定量结果。**（来源：原文第 28 页。）

| 方法 | FID↓ | KID↓ | MMD↓ | $W_2$↓ | $H$↓ | 时间(s)↓ | 显存(GB)↓ |
|---|---|---|---|---|---|---|---|
| Unconstrained | 0.261 | 0.0089 | 0.0093 | 0.0093 | 4.54E-3 | 4.45 | 0.12 |
| DiffusionPDE | 0.242 | 0.0074 | 0.0078 | 0.0069 | 3.59E-3 | 6.98 | 5.15 |
| D-Flow | 0.257 | 0.0087 | 0.0092 | 0.5076 | 3.91E-3 | 1674.73 | 63.76 |
| ECI | 0.932 | 0.0079 | 0.0164 | 0.9659 | 3.43E-2 | 11.91 | 0.40 |
| PCFM | 10.225 | 0.3210 | 0.3336 | 3.1977 | 1.02E-1 | 79.56 | 10.17 |
| Ours | **0.221** | **0.0030** | **0.0042** | **0.0048** | **2.67E-3** | 18.06 | 0.76 |

相反，现有约束生成方法在该学习型非线性约束下表现有限。基于投影的修正方法难以有效满足 AE 重建约束，导致比无约束采样更大的约束误差；尤其 ECI 的投影方法为施加硬约束而设计，难以有效处理此类非线性学习型约束。D-Flow 因优化需要同时通过采样过程与预训练 AE 反向传播梯度而产生额外计算开销。DiffusionPDE 在基线中取得最强的约束满足，但其总体分布与约束指标仍差于本方法，且显存需求显著更高。

同时，我们的方法成功降低重建误差并取得最佳分布匹配性能，表明其能在保持底层流分布的同时纳入非线性学习型约束。尽管本方法同样需要对 AE 编码器与解码器微分，其显存占用相对较低，且仍快于 D-Flow 与 PCFM。这些结果表明我们的方法可有效纳入学习型非线性约束，而不显著损害分布保真或计算效率。总体而言，该实验展示了框架的两个重要方面：(1) 在纳入学习型可靠性约束以提升生成样本质量方面的通用性；(2) 把约束生成扩展到人工设计算子之外的能力。我们承认此类学习型约束的有效性自然取决于用于定义它们的辅助模型的质量与泛化能力；因此本实验的目的不是把 AE 重建约束作为普遍最优的保真度量，而是展示我们的框架可在推理时灵活整合学习型非线性约束、并在无需额外训练的情况下改进预训练流匹配模型的潜力。

**图 8：** 强度约束生成（MNIST）的未筛选结果：比较无约束样本与不同方法的约束样本；每行所有样本在各方法间由同一初始噪声生成。（来源：原文第 29 页。）

**图 9：** 基于 AE 保真约束生成（MNIST）的未筛选结果：比较无约束样本与不同方法的约束样本；每行所有样本由同一初始噪声生成。（来源：原文第 30 页。）

**选定的干预时刻。** 为给 §3.3 自适应准则所选干预时刻提供实证，我们可视化由（8）得到的 $s^*$ 分布。具体地，对每个生成样本，我们在预定义候选干预时刻上评估目标 $J(s)$，并选择最小化时刻 $s^*$。图 10 给出 MNIST 上两种约束（强度约束与保真约束）的相应直方图。所选干预时刻在两种约束下呈现不同模式：对线性强度约束，所选 $s^*$ 更集中于轨迹较早部分；相反，由训练好的自编码器定义的非线性保真约束产生更分散的干预时刻分布，选择散布在更宽的轨迹范围。该差异可由两个约束函数的结构理解：强度约束对终端状态线性，约束几何相对简单且一致，故约束对中间扰动的灵敏度沿轨迹变化更系统，（8）中的目标常偏好较早干预时刻；保真约束由非线性训练 AE 诱导，局部几何更复杂，相应约束灵敏度在样本之间可能差异很大，因此不存在一致最小化 $J(s)$ 所编码折中的单一轨迹区域，导致所选干预时刻分布更宽。总体而言，这表明所提时间选择准则并非选择固定或普遍偏好的干预点；相反，$s^*$ 适应约束结构与个体生成轨迹。两种约束间的对比提供了实证：自适应干预机制响应约束的几何与灵敏度，而非施加预定干预时间表。

**图 10：** MNIST 上所选干预时刻的分布。每个直方图显示（8）在对应约束下跨生成样本选择的干预时刻：(a) 线性强度约束倾向于较早干预时刻；(b) 由训练自编码器定义的非线性保真约束导致更分散的分布。（来源：原文第 31 页。）

#### D.4.2 CIFAR10

**色调约束。** 我们在 CIFAR-10 上用全局色调约束评估方法，考虑多个目标色调并共生成 10,000 个样本做定量评估。定量结果见表 8，定性比较见图 11。总体上我们观察到与 MNIST 实验相似的趋势：定量与定性结果都表明本方法在约束满足与分布保持之间取得有利平衡。依赖显式投影步骤的现有方法在施加色调约束时往往引入可见伪影，导致图像保真度下降；这在 CIFAR-10 上尤为明显，因为更高图像分辨率与更复杂视觉结构使直接事后修改更可能影响语义与局部图像特征。D-Flow 的计算开销也随图像分辨率提升而显著大于 MNIST，使其在该设定下昂贵得多。DiffusionPDE 取得相对较强的分布性能，但约束误差更大；特别地，定性结果表明它未把生成图像充分调整到目标色调，与其相对较大的约束误差一致。相反，我们的方法在约束满足与分布保真之间始终提供更好的折中：它有效把生成样本推向期望色调外观，同时保持语义内容与整体视觉质量。此外，我们通过施加多样色调约束展示了方法的灵活性，表明框架可在不显著破坏底层图像分布的情况下提供全局外观的可控变化。

**表 8：色调约束 CIFAR10 数据集上的定量结果。**（来源：原文第 32 页。）

| 方法 | FID↓ | KID↓ | MMD↓ | $W_2$↓ | $H$↓ | 时间(s)↓ | 显存(GB)↓ |
|---|---|---|---|---|---|---|---|
| Unconstrained | 11.1568 | 0.0421 | 0.0518 | 5.354 | 1.02E-1 | 14.17 | 0.44 |
| DiffusionPDE | 8.4464 | 0.0014 | 0.0012 | 2.9062 | 4.66E-2 | 12.08 | 2.25 |
| D-Flow | 9.8484 | 0.0019 | 0.0015 | 3.138 | 5.789E-4 | 787.30 | 101.01 |
| ECI | 322.500 | 0.3596 | 0.29951 | 17.9582 | **2.53E-16** | 19.81 | 0.34 |
| PCFM | 125.262 | 0.0950 | 0.0727 | 11.1920 | 1.72E-12 | 27.10 | 4.26 |
| Ours | **5.08** | 0.0017 | 0.0014 | **2.663** | 2.08E-5 | 22.67 | 2.31 |

**数据保真约束。** 与 MNIST 实验类似，我们在 CIFAR10 上训练 AE 并以重建一致性作为学习型保真约束来提升生成样本质量。定量与定性结果分别汇总于表 9 与图 12。与 MNIST 结果一致，施加本约束修正相较无约束流匹配样本改善了分布匹配指标，表明所提框架可在无额外训练的情况下引导预训练模型产生更高保真样本。相反，现有约束生成方法在该非线性学习型约束下表现有限。值得注意，本实验的目的不是优化 CIFAR10 无条件生成性能，而是评估我们的框架能否在保持预训练流模型分布的同时有效纳入学习型约束。

**表 9：AE 保真约束 CIFAR10 数据集上的定量结果。**（来源：原文第 32 页。）

| 方法 | FID↓ | KID↓ | MMD↓ | $W_2$↓ | $H$↓ | 时间(s)↓ | 显存(GB)↓ |
|---|---|---|---|---|---|---|---|
| Unconstrained | 11.797 | 0.0053 | 0.0043 | 3.4347 | 2.18E-5 | 13.91 | 0.72 |
| DiffusionPDE | 10.779 | 0.0058 | 0.0042 | 3.3389 | 1.06E-5 | 14.82 | 2.59 |
| D-Flow | 9.984 | 0.0057 | 0.0042 | 3.3438 | 9.09E-6 | 1618.61 | 103.74 |
| ECI | 310.353 | 0.3391 | 0.3083 | 17.6227 | 3.17E-4 | 30.80 | 0.68 |
| PCFM | 116.953 | 0.0729 | 0.0578 | 10.8794 | 6.78E-4 | 49.53 | 4.60 |
| Ours | **9.795** | **0.0040** | **0.0033** | **3.2832** | **1.04E-5** | 19.70 | 2.74 |

**图 11：** CIFAR-10 上不同颜色约束的定性比较：比较无约束样本与不同方法的约束样本；每行样本由同一初始噪声生成。（来源：原文第 33 页。）

**图 12：** CIFAR10 上基于 AE 保真约束生成的未筛选结果：比较无约束样本与不同方法的约束样本；每行样本由同一初始噪声生成。（来源：原文第 34 页。）

## 附录 E 应用 2：图像逆问题

本附录给出支撑 §4.1 图像逆问题结果的基准定义、模型与采样配置、评估协议及额外诊断。特别地，我们分别量化重建质量的三个方面：

- **约束满足：** 重建图像满足各逆问题对应测量约束的程度；
- **成对重建保真：** 重建与对应参考图像的接近程度；
- **分布保真：** 重建图像分布相对参考图像分布的保持程度。

### E.1 数据集与约束

我们在两个标准图像数据集 **AFHQ-Cat** (Choi et al., 2020) 与 **FFHQ** (Karras et al., 2019) 上评估图像逆问题，所有图像在施加逆算子前缩放为 $64\times64$。对每个参考图像 $\mathbf u^{\mathrm{ref}}$，我们由相应前向算子构造测量，并求解满足所得测量约束的重建 $\mathbf u$。

**修复。** 对修复，我们考虑中心 $20\times20$ 的方形掩码 $M$，测量由掩码区域之外的像素构成。约束定义为

$$
H(\mathbf u)=M\odot\left(\mathbf u-\mathbf u^{\mathrm{ref}}\right),
$$

其中 $\odot$ 表示逐元素乘，$M$ 为选择受约束区域的二值掩码。因此满足约束要求重建在观测像素上与参考图像一致，而缺失的 $20\times20$ 区域由已学图像先验推断。

**超分辨率。** 对超分辨率，我们首先把 $64\times64$ 参考图像下采样 4 倍，得到 $16\times16$ 观测。令 $D$ 表示下采样算子 $D:\mathbb R^{3\times64\times64}\to\mathbb R^{3\times16\times16}$，测量约束为

$$
H(\mathbf u)=D\left(\mathbf u-\mathbf u^{\mathrm{ref}}\right).
$$

因此有效重建必须在降采样后重现观测到的 $16\times16$ 图像，而高分辨率细节由已学图像先验决定。

**去模糊。** 对去模糊，我们施加核大小 11、标准差 $\sigma=1.0$ 的高斯模糊算子 $B$，相应约束为

$$
H(\mathbf x)=B\left(\mathbf u-\mathbf u^{\mathrm{ref}}\right).
$$

因此逆问题是由模糊版本与观测测量一致来恢复清晰图像。

### E.2 流匹配模型与基线

沿用 (Patel et al., 2025)，所有实验使用相同的预训练 Rectified Flow++ 模型 (Lee et al., 2024)。RFM 模型经训练使流匹配轨迹尽可能接近直线，从而产生更简单直接的生成流；由于该性质，预训练整流流模型已被广泛用于基于流的生成模型求解逆问题的近期方法。所有方法使用 10 步 Rectified Flow 采样，以确保各方法的生成预算一致。

我们把本方法与若干现有基于流的生成模型逆问题方法比较。首先考虑 **FlowChef** (Patel et al., 2025) 与 **D-Flow** (Ben-Hamu et al., 2024)，它们分别通过优化生成轨迹上的中间状态或初始高斯噪声来施加约束。我们还与 **PnP-Flow** (Martin et al., 2025b) 比较，这是把测量算子纳入基于流采样流程的即插即用方法；此外纳入两个基于扩散的基线 **DPS** (Chung et al., 2023a) 与 **FreeDoM** (Yu et al., 2023)，使用 (Patel et al., 2025) 中开发的 Rectified Flow 兼容实现。所有基线使用官方 FlowChef 仓库⁴提供的实现而不作修改，并采用 (Patel et al., 2025) 为各基线指定的超参数。本方法按附录 A.4 所描述的表述实现于 RFM：与先前为通用 Flow Matching 模型开发的表述不同，我们的 RFM 实现利用 RFM 流路径的线性性，使最优修正无需按（15）显式反向求解伴随方程即可获得。

> **脚注 4（原文）：** https://github.com/FlowChef/flowchef

### E.3 评估协议

对 AFHQ-Cat，我们使用官方测试划分中的全部图像；对 FFHQ，我们用固定随机种子随机选取 10,000 张图像，并对所有逆问题评估使用同一组参考图像。对每个数据集与每个逆问题任务，我们从四个互补方面评估重建。

**约束满足。** 对每个逆问题任务，我们评估重建图像满足相应测量约束的程度。具体地，给定重建 $\hat{\mathbf u}$，我们在整个评估集上计算约束残差 $H(\hat{\mathbf u})$ 的均方误差；数值越低表示约束满足越好。

**成对重建保真。** 我们通过比较每张恢复图像 $\hat{\mathbf u}$ 与其对应参考图像 $\mathbf u^{\mathrm{ref}}$（即施加退化算子之前的图像）来衡量重建保真，报告 PSNR、SSIM 与 LPIPS 分别评估像素级、结构级与感知级相似度；PSNR 与 SSIM 越高、LPIPS 越低表示重建保真越好。

**分布保真。** 我们进一步评估恢复图像是否保持整体图像分布。为此，我们计算恢复图像集合与 AFHQ-Cat、FFHQ 真值图像之间的 Fréchet Inception Distance（FID）；FID 越低表示恢复图像的分布越接近 GT 分布。

**效率。** 运行时按每个生成样本的同步墙钟时间度量，显存报告为峰值分配的 GPU 显存。

### E.4 附加定性结果

AFHQ-Cat 数据集上修复、超分辨率与去模糊的更多定性结果分别见图 13、14、15；FFHQ 数据集上的相应结果分别见图 16、17、18。

**图 13：** AFHQ-Cat 数据集上未筛选的修复结果：比较真值图像（GT）、退化输入与不同方法的修复结果。（来源：原文第 37 页。）

**图 14：** AFHQ-Cat 数据集上未筛选的超分辨率结果：比较 GT、退化输入与不同方法的 SR 结果。（来源：原文第 38 页。）

**图 15：** AFHQ-Cat 数据集上未筛选的去模糊结果：比较 GT、退化输入与不同方法的去模糊结果。（来源：原文第 39 页。）

**图 16：** FFHQ 数据集上未筛选的修复结果：比较 GT、退化输入与不同方法的修复结果。（来源：原文第 40 页。）

**图 17：** FFHQ 数据集上未筛选的超分辨率结果：比较 GT、退化输入与不同方法的 SR 结果。（来源：原文第 41 页。）

**图 18：** FFHQ 数据集上未筛选的去模糊结果：比较 GT、退化输入与不同方法的去模糊结果。（来源：原文第 42 页。）

## 附录 F 应用 3：图像编辑

本附录给出支撑 §4.2 图像编辑结果的基准定义、模型与采样配置、评估协议及额外诊断。特别地，我们不仅量化编辑图像满足给定约束的程度与各方法的计算效率，还量化其满足任务特定文本引导的程度。

- **约束满足：** 编辑图像满足约束的程度，即保持所提供掩码之外区域的程度；
- **提示遵循度：** 编辑图像遵循给定文本提示的程度，用 CLIP 分数衡量；
- **图像相似度：** 编辑图像与参考图像保持视觉一致的程度，用 CLIP 分数衡量；
- **效率：** 各方法在推理速度与显存占用方面的计算效率。

### F.1 数据集与约束

我们在 PIE-Bench (Ju et al., 2024) 上开展大规模图像编辑实验，具体使用官方数据仓库中 0-random 140 子集的图像及其提供的真值掩码；所有方法使用相同掩码以保证公平比较。编辑任务受修复式约束：所提供掩码之外的区域应与参考图像相应区域完全一致。然而与上述逆问题不同，编辑区域还需遵循给定文本引导，这使同时满足保持约束与期望语义编辑变得困难。因此该任务的关键挑战是：在掩码区域内执行预期的文本引导编辑，同时忠实保持未掩码区域。

### F.2 流匹配模型与基线

沿用 (Patel et al., 2025)，我们使用 InstaFlow (Liu et al., 2023c)——Stable Diffusion v1.5 的变体——作为流匹配模型。我们在 InstaFlow 上评估与附录 E 相同的逆问题基线集。如先前实验所示，D-Flow 需要通过对整个前向流 ODE 积分微分，导致显存消耗显著更高；在 InstaFlow 的图像编辑任务中，该计算开销超过实验环境的可用显存，因此我们在本实验排除 D-Flow。

### F.3 评估协议

我们用如下指标评估编辑结果。

**约束满足。** 我们衡量编辑图像在提供掩码之外保持参考图像的程度，即计算编辑图像与参考图像在未掩码区域上的均方误差（MSE）。

**提示遵循度。** 我们用基于 CLIP 的相似度 (Radford et al., 2021) 衡量编辑图像遵循文本提示的程度。具体使用 OpenCLIP⁵中 OpenAI 预训练的 CLIP ViT-B/32 模型，报告 **CLIP-T**，即编辑图像的 CLIP 图像嵌入与对应提示的 CLIP 文本嵌入之间的余弦相似度；分数越高表示文本–图像对齐越好。

**图像相似度。** 我们用 **CLIP-I** 衡量编辑图像与参考图像的视觉相似度，即使用同一 OpenAI 预训练 CLIP ViT-B/32 模型计算二者 CLIP 图像嵌入的余弦相似度；分数越高表示与参考图像视觉相似度越高。

> **脚注 5（原文）：** https://github.com/mlfoundations/open_clip

**效率。** 我们用推理时间与峰值 GPU 显存分配衡量约束采样的计算代价：推理时间衡量生成编辑图像所需的墙钟时间，峰值显存衡量约束采样期间分配的最大 GPU 显存。

### F.4 附加定性结果

图像编辑的更多定性结果见图 19 与图 20。总体上我们观察到 MintFlow 按给定提示成功修改图像，同时忠实保持原始输入图像；相反，基线方法往往过度关注提示指令，导致输入背景丢失、伪影或模糊输出。这些结果表明我们的方法有效保持图像分布以生成自然的域内图像，同时成功满足约束、按提示自然编辑图像并保留输入上下文。

**图 19：** 图像编辑结果的附加定性比较（原始文本以删除线表示、编辑后文本以红色表示）。（来源：原文第 45 页。）

**图 20：** 图像编辑结果的更多定性比较（原始/编辑文本标注同图 19）。（来源：原文第 46 页。）

## 附录 G 应用 4：物理系统建模

本附录给出支撑 §4.3 物理系统结果的基准定义、模型与采样配置、评估协议及额外诊断。特别地，我们分别量化：

- 联合守恒、初始条件与边界条件算子的满足程度；
- 与配对数值解分布的集合级一致性；
- 局部 PDE 一致性及与各方法特定数值推演的一致性；
- 对积分分辨率与候选时刻选择的敏感度。

### G.1 物理系统

为把物理时间与 §3 中使用的生成流时间 $t$ 区分开，本附录始终用 $\tau$ 表示物理 PDE 时间。

**热方程。** 我们考虑

$$
\partial_\tau u=\nu\,\partial_{xx}u,\qquad x\in[0,2\pi),\ \tau\in[0,1].\tag{27}
$$

用于数据生成的解析解族为

$$
u(x,\tau)=\sin(x+\phi)\exp(-\nu\tau),\qquad\nu\sim\mathcal U[1,5],\ \phi\sim\mathcal U[0,\pi].\tag{28}
$$

训练加载器按需从该族抽取 5,000 条轨迹；配置的测试划分包含额外 1,000 次抽取。场表示为 $(n_x,n_\tau)=(100,100)$ 数组，采用端点排除的周期空间网格与端点包含的时间网格。这些解析训练轨迹不同于下文定义的基准参考池——后者从 FFM 导出的初始条件求解 PDE。

**反应–扩散方程。** RD1D 基准遵循

$$
\partial_\tau u=\nu\,\partial_{xx}u+\rho u(1-u),\qquad\nu=5\times10^{-3},\ \rho=10^{-2},\tag{29}
$$

作用域为

$$
x\in[0,1],\qquad\tau\in[0,0.99].\tag{30}
$$

场表示在 $128\times100$ 时空网格上：空间坐标为物理域 $[0,1]$ 的单元中心，边界条件由常数左/右 Neumann 通量 $g_L\in[0,0.05]$ 与 $g_R\in[-0.05,0]$ 指定。持久化训练集为 80 个初始条件与 80 个通量对的笛卡尔积（6,400 条轨迹）；测试集使用 $16\times16=256$ 条轨迹。二者均由下文所述有限体积求解器生成。对每个基准源噪声 ID，作为采样目标的 IC 与通量由相应 Vanilla 轨迹一次性导出，并在所有方法间固定。

### G.2 物理约束

我们的物理基准联合施加守恒、初始条件与边界条件一致性，把 §3 的约束算子写为

$$
H(\mathbf u)=\begin{bmatrix}h_{\mathrm{cons}}(\mathbf u)\\h_{\mathrm{IC}}(\mathbf u)\\h_{\mathrm{BC}}(\mathbf u)\end{bmatrix}.\tag{31}
$$

MintFlow 把（6）的轨迹干预施加于该联合算子，而非独立修正三个分量。基准报告样本级统计量

$$
\|H(\mathbf u)\|_\infty=\max_j|H_j(\mathbf u)|,\tag{32}
$$

（经下文任务特定归一化后）。

**初始条件。** 令 $u_{\mathrm{IC}}(x)$ 表示对齐基准样本的规定初始场，IC 残差为

$$
h_{\mathrm{IC}}(\mathbf u)=u(\cdot,0)-u_{\mathrm{IC}}.\tag{33}
$$

目标 $u_{\mathrm{IC}}$ 复制自对齐 Vanilla 样本在 $\tau=0$ 处的值。残差在原始未归一化场中评估；分量尺度仅在构造（32）的组合统计量时施加。

**热方程守恒。** 定义离散空间质量

$$
M(\tau_k)=\Delta x\sum_{i=1}^{n_x}u(x_i,\tau_k),\qquad\Delta x=\frac{2\pi}{100}.\tag{34}
$$

守恒残差为

$$
h_{\mathrm{cons},k}(\mathbf u)=M(\tau_k)-M(\tau_0),\qquad k=1,\ldots,n_\tau-1.\tag{35}
$$

这是端点排除网格上的周期矩形法则。它把每个生成时间切片与生成的 $\tau=0$ 切片比较；单独的 IC 块把该切片锚定到 $u_{\mathrm{IC}}$。因此 Heat 算子有 99 个质量残差与 100 个 IC 残差，总维数 199。

**热方程边界条件。** 周期性由 Heat 表示在结构上施加，因此不引入独立残差：

$$
h_{\mathrm{BC}}(\mathbf u)\equiv0.\tag{36}
$$

因此 Heat 统计量由守恒与 IC 一致性决定。

**RD1D 全局平衡。** 令

$$
M(\tau)=\int_\Omega u(x,\tau)\,\mathrm dx.\tag{37}
$$

时刻 $\tau_k$ 的全局平衡残差为

$$
h_{\mathrm{cons},k}(\mathbf u)=M(\tau_k)-M(\tau_0)-\int_0^{\tau_k}\left[\rho\int_\Omega u(x,\tau)(1-u(x,\tau))\,\mathrm dx+g_L(\tau)-g_R(\tau)\right]\mathrm d\tau.\tag{38}
$$

空间积分采用单元中心矩形法则，时间累积采用梯形法则。（38）中的通量为规定的外部通量，而非由生成场重新估计的值。非线性反应项使 $H$ 的该分量关于 $\mathbf u$ 非线性。

**RD1D 边界条件。** 令 $\hat b_{g_L}(\mathbf u,\tau)$ 与 $\hat b_{g_R}(\mathbf u,\tau)$ 表示在存储的单元中心场上评估的配置五点边界通量观测量，BC 残差为

$$
h_{\mathrm{BC}}(\mathbf u)=\begin{bmatrix}\hat b_{g_L}(\mathbf u,\tau)-g_L(\tau)\\\hat b_{g_R}(\mathbf u,\tau)-g_R(\tau)\end{bmatrix}_\tau.\tag{39}
$$

五点单侧模板仅对正时间切片评估；$\tau=0$ 处的经典角点相容性条件未施加。基准在构造联合算子前把两个通量块按其物理范围 0.05 归一化：

$$
H_{\mathrm{RD1D}}(\mathbf u)=\begin{bmatrix}h_{\mathrm{cons}}(\mathbf u)\\h_{\mathrm{IC}}(\mathbf u)\\h_{\mathrm{BC}}(\mathbf u)/0.05\end{bmatrix}.\tag{40}
$$

全局平衡与 IC 块具有单位尺度。因此 RD1D 算子有 99 个全局平衡、128 个 IC 与 $2\times99$ 个 BC 残差，总维数 425。约束所用边界观测量定义在存储的单元中心上，与有限体积参考求解器内部使用的外表面通量变量不完全相同。

### G.3 流匹配模型与基线

每个 PDE 有各自预训练的检查点，架构相同：四层 Fourier 神经算子，每维 32 个 Fourier 模态、64 个隐藏通道、256 通道的提升与读出层，以及生成流时间的 32 维正弦嵌入。两个网格坐标与时间嵌入同状态拼接，得到 35 个输入通道与 1 个输出通道；直接实例化当前模型得到 17,884,993 个可训练参数。生成模型用条件流匹配训练 20,000 次优化迭代。给定数据样本 $\mathbf u$ 与源样本 $\mathbf z$，插值与目标速率为

$$
\mathbf u_s=(1-s)\mathbf z+s\mathbf u,\qquad \mathbf v^\star=\mathbf u-\mathbf z,\qquad s\sim\mathcal U[0,1].\tag{41}
$$

源 $\mathbf z$ 取自 Matérn-$\frac12$ 高斯过程（长度尺度 $10^{-3}$、输出尺度 1，定义在归一化二维网格上）。训练使用 Adam、批大小 256、学习率 $3\times10^{-4}$、梯度范数裁剪 100。两个保留的检查点均来自第 20,000 次迭代。

我们把 Vanilla 采样与 PCFM、ECI、DiffusionPDE、D-Flow、MintFlow 比较。所有约束方法仅在生成时作用，不引入学习参数。在同一方程内，每个方法使用相同检查点、源噪声张量与按样本索引的约束目标。正文把每种方法作为单一方法报告；MintFlow 的实现层选择在消融研究中单独考察。

Vanilla 使用自适应 Dopri5 积分，Heat 请求 100 个评估点、RD1D 请求 200 个。所有固定步长采样器（PCFM、ECI、DiffusionPDE、D-Flow、MintFlow）在 Heat 上使用 100 步 Euler、在 RD1D 上使用 200 步，因此每个物理系统内各方法的积分分辨率对齐。DiffusionPDE 在 Heat 上使用引导强度 1、在 RD1D 上使用 $10^{-3}$。D-Flow 执行 20 次 L-BFGS 迭代（学习率 1）。标准 ECI 使用一次混合步，标准 PCFM 在 Heat 每个流步使用 10 次 Newton 更新、在 RD1D 每个流步使用 1 次。表 3 与表 10 所报告的 MintFlow 配置在 Heat 上使用 100 步 Euler、RD1D 上 200 步，候选时刻 $K=10$ 位于 $[0.1,0.98]$，末端偏置变换 $s=s_{\min}+(s_{\max}-s_{\min})[1-(1-q)^2]$，$\lambda=10^{-2}$，修正尺度 $\gamma=1$。这些细节用于可复现性，不表示主比较中的独立方法。

### G.4 评估协议

每个基准对每种方法包含 $N=1000$ 个样本。Heat 使用源噪声种子 20260811，RD1D 使用种子 20260820。因此所报告均值与标准差汇总的是单次固定种子运行中的样本间变化，而非跨训练运行或采样种子的不确定性估计。

**目标库与数值参考。** 对每个方程，先在共享源噪声库上评估 Vanilla，其初始切片定义 1,000 个 IC 目标。对 Heat，从每条完整 Vanilla 轨迹一次性拟合 $[1,5]$ 内的扩散率；对 RD1D，一次性拟合常数 Neumann 通量并裁剪到训练范围。这些潜在量在给定样本索引下跨方法固定。数值参考池随后求解这 1,000 个物理问题：Heat 使用周期 Fourier 半群，RD1D 使用数据生成器的精确反应、显式中点有限体积格式。因此参考既不是无条件训练分布，也不是无约束 FFM 池，而是以约束采样器所用同一有限 FFM 导出 IC、BC 与潜在物理参数为条件的求解器分布。集合级指标在构造两个样本集后忽略索引配对。

**约束满足。** 对样本 $i$，$R_\infty(\mathbf u_i)=\|H(\mathbf u_i)\|_\infty$ 为经上述 RD1D BC 归一化后的最大绝对元素。主表报告其样本均值，表 10 额外报告样本标准差。

**集合级分布指标。** 我们避免使用图像专用特征提取器，而是对 1,000 条数值参考轨迹拟合一个冻结的、加四次加权、均值中心化的本征正交分解（POD）。该变换把每个展平坐标按其张量积物理求积权重的平方根加权、减去加权参考均值，并投影到前导右奇异向量；不施加白化、非线性特征映射、裁剪或方法特定重拟合。在 99.9% 方差阈值与至多 20 个分量的约束下，Heat 保留 5 维（99.9463% 方差），RD1D 保留 14 维（99.9429% 方差）。

令 $\mathbf a_i$ 与 $\mathbf b_j$ 表示生成与参考的 POD 系数，所有距离以 float64 评估。FID 为高斯 Fréchet 距离

$$
\|\boldsymbol\mu_a-\boldsymbol\mu_b\|_2^2+\mathrm{tr}\left(\mathbf C_a+\mathbf C_b-2\left(\mathbf C_a^{1/2}\mathbf C_b\mathbf C_a^{1/2}\right)^{1/2}\right).\tag{42}
$$

它是 POD 坐标中的 FID 类比，而非 Inception 特征 FID。KID 为无偏双样本 MMD² 估计器，核为 $k(\mathbf a,\mathbf b)=(\mathbf a^\top\mathbf b/d+1)^3$；有限样本估计可能略为负值。MMD 为非负有偏 MMD² 的平方根，使用五个 RBF 核的平均，其带宽为参考系数上一次性拟合的中位成对距离的 $\{0.25,0.5,1,2,4\}$ 倍。最后，由于两个集合大小相等，经验 $W_2$ 可精确计算为

$$
W_2=\left[\min_{\pi\in S_N}\frac1N\sum_{i=1}^{N}\left\|\mathbf a_i-\mathbf b_{\pi(i)}\right\|_2^2\right]^{1/2},\tag{43}
$$

使用匈牙利指派算法。这四个量衡量与条件化数值分布的一致性，并不直接估计与无约束 FFM 分布的散度；Vanilla 作为被评估的对照报告，而非度量参考。

**物理一致性。** PDE 残差是原始场中有限差分算子的均方根：Heat 使用二阶周期空间 Laplacian 与二阶数值时间导数，RD1D 使用相应的二阶内部空间模板。对仿真误差，每个方法使用其自身生成的初始切片以及为该样本索引固定的物理参数与 BC：

$$
E_{\mathrm{sim}}(\mathbf u_i)=\frac{\left\|\mathbf u_i-\mathbf u_i^{\mathrm{solver}}\right\|_2}{\left\|\mathbf u_i^{\mathrm{solver}}\right\|_2}.\tag{44}
$$

该指标检验动力学自一致性，本身并不检验生成的 IC 是否匹配其规定目标。主表报告平均仿真误差，表 10 额外报告有限差分 PDE 残差与两个物理一致性指标的样本标准差。

### G.5 完整定量结果

扩展结果强化了主表中可见的折中。MintFlow 在两个系统上对全部四个分布指标与两个物理一致性指标都具有最小点估计，而 ECI 与 PCFM 获得最小约束残差。它们更强的显式约束满足伴随着显著更大的分布距离、PDE 残差与仿真误差。D-Flow 是物理一致性上最强的竞争基线，但其约束残差仍远大于 MintFlow、ECI 与 PCFM。标准差进一步表明平均性能可能掩盖异质行为：MintFlow 的 Heat 约束残差标准差超过其均值，而 ECI 与 PCFM 的 RD1D PDE 残差标准差超过各自均值；相反，MintFlow 的 RD1D PDE 残差与仿真误差具有相对较小的偏差。最后，负 KID 值是无偏估计器的有效有限样本结果，应解释为接近零的估计，而非负距离。所有分布结论都针对条件化数值参考，而非直接针对无条件 FFM 分布。

**表 10：初始条件、边界条件与守恒约束下的物理系统建模基准（$N=1000$ 个生成样本），系统 1 为热方程、系统 2 为反应–扩散方程；数值越低越好。** 分布保真†、约束††、物理一致性†††。（来源：原文第 51 页。）

| 方法 | FID↓ | KID↓ | MMD↓ | $W_2$↓ | $H$↓ | PDE Res.↓ | Sim. Error↓ |
|---|---|---|---|---|---|---|---|
| **系统 1：热方程** | | | | | | | |
| Vanilla FFM | 1.255E-3 | −3.17E-4 | 2.496E-2 | 4.872E-2 | 5.16E-3±2.19E-3 | 1.103E0±5.08E-1 | 5.57E-2±6.15E-2 |
| DiffusionPDE | 4.712E-3 | 1.019E-3 | 5.361E-2 | 7.431E-2 | 1.86E-2±2.20E-2 | 1.044E0±6.98E-1 | 8.49E-2±2.95E-2 |
| D-Flow | 1.290E-3 | −2.10E-4 | 2.554E-2 | 4.098E-2 | 4.71E-3±2.08E-3 | 7.82E-1±3.76E-1 | 4.34E-2±2.46E-2 |
| ECI | 1.865E-1 | 4.004E-2 | 2.067E-1 | 4.502E-1 | 2.27E-7±6.45E-8 | 1.554E0±8.78E-1 | 4.47E-1±2.86E-1 |
| PCFM | 1.851E-1 | 3.965E-2 | 2.062E-1 | 4.485E-1 | 1.30E-7±5.28E-8 | 1.549E0±8.72E-1 | 4.45E-1±2.85E-1 |
| MintFlow | **2.91E-5** | **−5.22E-4** | **5.44E-3** | **1.455E-2** | 3.57E-6±3.69E-5 | 6.77E-1±3.22E-1 | **1.23E-2±2.09E-2** |
| **系统 2：反应–扩散方程** | | | | | | | |
| Vanilla FFM | 1.74E-4 | −8.11E-6 | 2.130E-2 | 2.078E-2 | 1.907E0±7.75E-1 | 2.98E-1±5.9E-2 | 3.55E-2±1.72E-2 |
| DiffusionPDE | 9.34E-4 | 1.43E-4 | 6.063E-2 | 3.712E-2 | 9.56E-1±2.50E-1 | 3.43E-1±7.3E-2 | 3.29E-2±2.05E-2 |
| D-Flow | 3.95E-4 | 1.45E-5 | 3.861E-2 | 4.085E-2 | 4.44E-1±1.40E-1 | 2.45E-1±4.4E-2 | 3.02E-2±2.03E-2 |
| ECI | 1.829E-2 | 2.59E-4 | 1.299E-1 | 1.647E-1 | 8.02E-6±2.72E-6 | 3.250E0±5.866E0 | 2.28E-1±2.87E-1 |
| PCFM | 1.831E-2 | 2.61E-4 | 1.301E-1 | 1.648E-1 | 8.06E-6±2.81E-6 | 3.255E0±5.871E0 | 2.28E-1±2.87E-1 |
| MintFlow | **1.09E-4** | **−1.47E-5** | **1.342E-2** | **1.870E-2** | 3.18E-4±2.16E-4 | 2.28E-1±3.0E-2 | **2.58E-2±1.40E-2** |

**表 10 脚注（原文）：** † 分布保真在加四次加权、均值中心化的 POD 空间中评估生成样本与数值参考轨迹分布的接近程度；略为负值的 KID 由无偏多项式采样噪声在零附近引起。†† $H$ 表示跨守恒律、初始条件（IC）与边界条件（BC）的组合归一化最大绝对约束残差，报告为均值±标准差；Heat 周期性是结构性的，而反应–扩散边界通量按 0.05 归一化。††† PDE Res. 表示有限差分 PDE 算子残差；Sim. Error 衡量从每个样本生成的初始条件向前积分数值求解器时的相对 $\ell_2$ 轨迹误差。

### G.6 附加定性结果

图 22 与图 23 给出保留基准运行中的固定索引示例。对每种方法与样本，上行为生成的时空场；我们用从该场提取的初始条件初始化数值 PDE 求解器，并使用按样本索引的物理参数与边界条件。下行为与该方法特定数值轨迹的点wise 绝对偏差，对应（44）在空间与时间聚合之前的量。这些图把显式约束满足与动力学自一致性区分开：一个场可以具有很小的 $\|H(\mathbf u)\|_\infty$，却偏离由其自身初始条件所隐含的 PDE 解。ECI 与 PCFM 在若干选定情形中显示大范围误差，而 MintFlow 更接近其对应推演。由于面板只包含选定样本并省略部分被评估变体，它们是诊断性的，而非集合级支配性的证据。

**图 21：** 附加 Heat 定性结果。每个示例第一行为各方法生成的时空场，第二行为相对由该生成样本自身初始条件初始化的数值 Heat 轨迹的点wise 绝对误差。（来源：原文第 51 页。）

**图 22：** 附加 Heat 定性结果。（来源：原文第 52 页。）

**图 23：** 附加 RD1D 定性结果。（来源：原文第 52 页。）

## 附录 H 消融研究

### H.1 积分分辨率消融

我们在 Heat 基准上消融 MintFlow，使用与主比较相同的 $N=1000$ 源噪声库、目标库、数值参考池与冻结 POD 变换，仅改变采样积分分辨率而保持其他采样器设置固定。因此各配置间的差异不能归因于重采样或重拟合表示。

如图 6 所示，把流匹配模型的 Euler 步数从 50 增至 100、200、400 会单调改善 FID、约束残差与同 IC 仿真误差。重要的是，Euler 步离散化不仅影响前向采样积分误差，也影响反向求解伴随方程时的数值误差；更细的离散化因此给出更接近连续时间对应物的采样轨迹与伴随，从而更忠实地保持预训练轨迹、改善分布保真，同时为施加终端约束提供更准确的局部修正方向。尽管如此，框架在不同分辨率下仍相对稳健，仅在少于 100 个采样步时出现更明显退化。

有限差分 PDE 残差随 200 步改善，但在 400 步时略升。Heat 的头条比较仍使用 100 步，以匹配所有固定步长方法的积分分辨率；更高分辨率设置量化的是数值敏感度，而非定义所报告的工作点。头条绝对分数仍以表 3 与表 10 为准；消融用于评估对单个设计选择的相对敏感度。

### H.2 候选时刻选择与最优时间正则化消融

我们进一步消融（8）中目标函数 $J$ 的正则化参数 $\lambda$（用于自适应干预时刻选择）。我们使用与上一节相同的数据与实验设置，保持源噪声库、目标库、数值参考池与冻结 POD 变换不变，仅改变 $\lambda$ 而保持其他采样器设置固定；因此各配置差异不能归因于重采样或重拟合表示。

图 6 的结果表明，改变 $\lambda$ 揭示了约束满足与分布保持之间的折中。由于 $\lambda$ 不直接正则化干预幅度，而是决定偏好的干预时刻，较大的 $\lambda$ 偏好较晚干预。当干预非常接近终端时刻时，修正越来越像把终端样本直接扰动到约束流形，留给预训练流吸收干预的机会更少；此类修正虽能更强地施加约束，但大扰动可能把样本推得离原始终端分布 $\nu_T$ 更远。实践中，在适中 $\lambda$ 范围内性能相对稳定，表明所提目标在约束满足与分布保持之间提供了稳健平衡。小 $\lambda$ 下的弱敏感度表明该区域内由候选网格而非正则项主导所选修正时刻。

### H.3 干预步数消融

我们对干预步数开展消融，考察方法对重复轨迹干预的响应。在图像编辑中，生成图像须同时遵循目标提示并满足约束，使单次干预通常不足以同时达成两个目标。因此在先前所有实验中，我们按基线方法设置 (Patel et al., 2025) 一致使用 $N=20$ 个干预步。本节改变干预步数 $N$ 并考察其对编辑结果的影响。

如图 24 所示，使用过少的干预步常产生与目标提示对齐但明显偏离输入图像的图像，表明单次或少量干预不足以在保持输入约束的同时生成满足目标提示的图像。随 $N$ 增大，编辑结果逐渐更贴近输入图像，同时继续满足目标提示。经过一定干预步数后结果收敛，进一步增大 $N$ 也基本不变，表明适中的干预次数足以达到所需编辑效果。重要的是，即使施加大量干预，本方法仍持续生成合理图像而不偏离已学分布，表明所提最小干预策略不会引入可能把生成样本推出已学数据分布的过度扰动。总体而言，这些观察展示了干预策略的有效性与稳定性，并为图像编辑所需干预次数提供了实用指导。

**图 24：** 不同干预次数 $N$ 下图像编辑结果的比较。$N$ 过小时生成图像与目标提示对齐但无法满足约束，导致与输入图像显著偏离；随 $N$ 增大，方法更好地保持输入图像的背景与整体外观，只自然修改掩码区域以满足目标提示；超过一定 $N$ 后结果基本不变。（来源：原文第 54 页。）

## 图注与表注

**图 1（原文第 2 页）：** 约束满足与分布保真的平衡（无约束采样 A / 先前约束方法 B / 所提方法 C 的对比示意，以图像修复为例）。
**图 2（原文第 3 页）：** 约束生成策略比较（Steer Velocity Field / Terminal Projection / Trajectory Optimization / Trajectory Intervention）。
**图 3（原文第 6 页）：** 图像逆问题的代表性定性结果（AFHQ-Cat 修复/超分、FFHQ 去模糊）。
**图 4（原文第 7 页）：** 图像编辑结果的定性比较。
**图 5（原文第 9 页）：** 物理约束下的定性物理一致性（生成场与其条件化数值推演的偏差）。
**图 6（原文第 9 页）：** MintFlow 对采样步数与正则化参数 $\lambda$ 的敏感度。
**图 7（原文第 27 页）：** 用平均强度约束控制 MNIST 数字笔画粗细。
**图 8（原文第 29 页）：** 强度约束生成（MNIST）的未筛选结果。
**图 9（原文第 30 页）：** AE 保真约束生成（MNIST）的未筛选结果。
**图 10（原文第 31 页）：** MNIST 上所选干预时刻的分布（强度约束 vs 保真约束）。
**图 11（原文第 33 页）：** CIFAR-10 上不同颜色约束的定性比较。
**图 12（原文第 34 页）：** AE 保真约束生成（CIFAR10）的未筛选结果。
**图 13—18（原文第 37—42 页）：** AFHQ-Cat / FFHQ 上修复、超分辨率、去模糊的未筛选结果。
**图 19—20（原文第 45—46 页）：** 图像编辑结果的附加定性比较。
**图 21（原文第 51 页）：** 附加 Heat 定性结果。
**图 22（原文第 52 页）：** 附加 Heat 定性结果。
**图 23（原文第 52 页）：** 附加 RD1D 定性结果。
**图 24（原文第 54 页）：** 不同干预次数 $N$ 下图像编辑结果比较。

**表注汇总：** 表 1（原文第 6 页）为 AFHQ-Cat/FFHQ 图像逆问题定量比较（约束误差、FID、PSNR、SSIM、LPIPS、时间、显存）；表 2（第 7 页）为图像编辑任务比较（$H$、CLIP-T、CLIP-I、时间、显存）；表 3（第 8 页）为物理系统建模基准（两系统 5 指标）；表 4（第 23 页）为实验与消融总览；表 5（第 25 页）为图像数据集 FM 模型配置；表 6（第 26 页）为平均强度约束 MNIST 结果；表 7（第 28 页）为 AE 保真约束 MNIST 结果；表 8（第 32 页）为色调约束 CIFAR10 结果；表 9（第 32 页）为 AE 保真约束 CIFAR10 结果；表 10（第 51 页）为物理系统建模完整基准（含标准差与 PDE 残差）。所有表格的浅绿/浅红标注规则同表 1 说明。表 1—3 已用 PDF 渲染（第 6—8 页）逐格核对；表 4—10 按原文文本抽取逐格转录。

**本页范围与校对状态：** 本页覆盖 arXiv:2610.02260v1（cs.AI，2026 年 9 月 30 日）全文 54 页：摘要、第 1—5 节（含定理 3.1、算法 1）、致谢、可复现性声明、AI 使用声明、参考文献（原文无编号字母序，共 41 条，本页加序号）、附录 A（理论证明 A.1—A.4，式 (10)—(22)、定理 A.1—A.3）、附录 B（算法 2—3）、附录 C（相关工作）、附录 D（图像生成，式 (23)—(26)、表 4—9、图 7—12）、附录 E（图像逆问题，图 13—18）、附录 F（图像编辑，图 19—20）、附录 G（物理系统建模，式 (27)—(44)、表 10、图 21—23）、附录 H（消融，图 24）。表格核对：用 `render.py` 渲染 PDF 第 6、7、8 页并逐格核对表 1—3（含全部 18 行 × 12 列与物理基准 6 行 × 10 列数值），表 4—10 按文本抽取逐格转录（其中表 10 的均值±标准差与 PDE 残差逐项照录）。原文要点/疑点已在页首译注列出（参考文献未编号、公式编号连续、Vanilla 同义混用、POD 度量与 Inception-FID 不同、KID 可为负）。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内图像与曲线未数字化转写。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2610.02260v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}