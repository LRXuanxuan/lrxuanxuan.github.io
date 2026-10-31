---
layout: page
title: "超越 Best-of-k：歧义非线性逆问题的先验一致 DAPS｜中文全文译文"
permalink: /papers/translations/2026-10-27-beyond-best-of-k-prior-consistent-daps-for-ambiguous-nonlinear-inverse-2610-31592/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/39bb2162c4326c50/) · [原文 arXiv](https://arxiv.org/abs/2610.31592) · [全部目录](/papers/catalog/)

# 超越 Best-of-k：歧义非线性逆问题的先验一致 DAPS

**原题：** Beyond Best-of-$k$: Prior-Consistent DAPS for Ambiguous Nonlinear Inverse Problems  
**作者：** Merve Kocabas<sup>1,2,3*</sup>、Benjamin A. Burns<sup>4*</sup>、Andreas Geiger<sup>1,5,6,7</sup>、Kent Gauen<sup>4</sup>、Sara Fridovich-Keil<sup>4</sup>（<sup>*</sup> 共同第一作者）  
**单位：** 1 图宾根大学（University of Tübingen）；2 Zuse School ELIZA；3 马克斯·普朗克智能系统研究所；4 佐治亚理工学院（Georgia Institute of Technology）；5 Tübingen AI Center；6 ELLIS Institute；7 KE:SAI。邮箱：merve.kocabas@student.uni-tuebingen.de、a.geiger@uni-tuebingen.de、{bburns46, gauenk, sfk}@gatech.edu。  
**版本：** arXiv:2610.31592（Preprint），2026-10-27 推荐，原文 25 页。代码：https://github.com/voilalab/PC-DAPS 。  
**范围与状态：** 全文中文译稿：摘要、第 1–6 节及全部小节（2、3.1–3.2、4.1–4.2）、式 (1)–(13)（正文）与附录式 (14)–(17)、表 1–2（逐格转写）与附录表 3–5 图注速览、图 1–14 图注、参考文献（英文原条目）均按原文结构录入；附录 A 的算法 1 与 A.1–A.7 以结构化说明呈现。逐句逐式终校未做。

## 摘要

扩散模型已成为求解逆问题的强先验。然而，当多个与测量一致的解**只能由先验区分**时，相位恢复等非线性逆问题仍具挑战性——我们把这类测量称为**歧义**（ambiguous）测量。现有基于扩散的采样器在重建过程中依赖**局部近似**；对歧义测量，这些近似会让测量引导偏向一个"接近某个先验支持模态、但自身并不受先验支持"的测量一致模态。评估实践通过报告 **best-of-k** 结果（用真值挑选最好者）掩盖了这类失败。我们提出**先验一致 DAPS**（Prior-Consistent DAPS，PC-DAPS）——解耦退火后验采样（DAPS）的一个变体，通过在**单次采样运行**内维持多个候选解来应对该失败情形。随着退火噪声下降，PC-DAPS 依据**先验一致性**剪除并替换较弱的候选，且无需访问真值。PC-DAPS 降低了先验不一致样本的发生率，并改善非线性逆问题的样本质量，同时在**线性**逆问题上保持样本质量与多样性。

**图 1（原文 Figure 1）：** 测量一致并不足以完成重建。同一傅里叶幅度测量被图像的旋转、平移与颜色通道反转所共享。现有求解器可能返回这些先验不一致的模态，而 PC-DAPS 选出受学习图像先验支持的重建。每个样本均为随机选取：其他方法取自四次独立运行，PC-DAPS 取自单次运行中生成的四个粒子。

## 1. 引言

逆问题在科学与工程中广泛出现——只要需要从间接测量恢复未知信号，就涉及逆问题，包括图像复原（Bertero et al., 2021）、医学成像（Song et al., 2022）与天文成像（Event Horizon Telescope Collaboration, 2019）。给定由已知但可能含噪的测量过程产生的观测 \(\mathbf y\)，逆问题的目标是恢复原始信号 \(\mathbf x\)。对欠定问题，许多不同信号 \(\mathbf x\) 可能产生同一测量 \(\mathbf y\)；贝叶斯成像把后验分布定义为 \(p(\mathbf x|\mathbf y)\propto p(\mathbf y|\mathbf x)p(\mathbf x)\)，其中似然 \(p(\mathbf y|\mathbf x)\) 捕捉候选图像 \(\mathbf x\) 的测量一致性，先验 \(p(\mathbf x)\) 捕捉哪些候选重建是合理的自然信号。因此后验采样的目标是生成**同时**与测量和先验一致的候选重建。

以傅里叶相位恢复为例，多幅图像可产生相同的傅里叶幅度测量（Fienup, 1982）。这些**测量等价**解具有相同似然，但依其与图像先验的一致性可有截然不同的后验概率。特别地，我们观察到：现有相位恢复求解器应用于人脸图像时，有时会返回一张**旋转或颜色反转**的人脸——它与测量一致，但在集中于正立人脸的自然图像先验下并不合理。因此挑战不仅是找到测量一致的重建，而是采样**受先验支持**的测量一致解。

扩散模型为后验采样提供了强图像先验（Ho et al., 2020; Song et al., 2021）。在每个噪声水平上，扩散模型隐式定义一个去噪器，把含噪样本 \(\mathbf x_t\) 映射为相应干净图像的估计；该扩散去噪器可用于在后验采样中纳入先验 \(p(\mathbf x)\)。基于扩散的逆求解器沿**采样轨迹**（即从含噪样本演化到重建的中间状态序列）应用该先验信息。现有方法主要有两类：用近似似然梯度**倾斜**无条件反向扩散过程（Zhang et al., 2025; Chung et al., 2023; Song et al., 2023; Boys et al., 2024），或在各噪声水平间**交替**执行先验更新与测量更新（Wu et al., 2024; Xu & Chi, 2024; Chen et al., 2026; Ahmed & Makin, 2026）。这些方法中，每个噪声水平可用的先验信息都由**以单个干净图像估计为中心的局部去噪近似**表示，而非在中间时间步显式维持多个竞争的先验模态。

当测量存在歧义（如相位恢复等欠定逆问题）时，沿单条采样轨迹前进可能导致**过早模态选择**（premature mode selection）。在高噪声水平，多个先验模态可能都合理，但轨迹只能走向其中一个；一旦轨迹选定某个先验模态，后续精化主要提高该模态**邻域内**的测量一致性，而不再考虑更远的替代方案。当 (i) 所选先验模态与测量不一致、且 (ii) 其最近的测量一致模态不受先验支持时，该问题尤为严重：基于轨迹的采样器会过早锁定这对模态，最终产生既不受真实后验、甚至不受真实先验支持的**幻觉**重建。

**Best-of-k 评估**通过生成多个独立重建并挑选最接近真值者（Chung et al., 2023; Zhang et al., 2025）部分掩盖了该问题；但这种选择使用了测试时不可得的信息，也无法保证所产生样本是先验一致的。基于粒子的方法在中间时间步维持多个候选（Cardoso et al., 2024; Dou & Song, 2024; Wu et al., 2023），但主要关注**线性**逆问题与粒子多样性，而非先验一致采样。

为应对该问题，我们提出 **PC-DAPS**：把样本选择移入采样器内部，并消除对基于真值的 best-of-k 评估的依赖。PC-DAPS 在**同一测量**下退火一袋 \(K\) 个粒子，并用 **\(K\) 分量高斯混合**（而非单峰估计）建模去噪器后验 \(p(\mathbf x_0|\mathbf x_t)\)。采样早期噪声水平高、先验信息弱，多个候选被保留；随着退火中噪声下降，先验一致性低的粒子被剪除，并由更先验一致的存活候选替换。因此 PC-DAPS 把模态选择**推迟**到先验信息更充分之时——它在**单次采样运行**内、无需真值地完成了 best-of-k 只能在 \(k\) 次独立运行之后完成的事情。

我们在 FFHQ（Karras et al., 2019）与 ImageNet（Deng et al., 2009）上、跨**三个非线性与七个线性任务**评估 PC-DAPS，包括 DAPS（Zhang et al., 2025）报告的八个任务，以及高通滤波（Thaker et al., 2025）与 16× 超分辨率。我们在单样本与 best-of-k 两种评估下报告 PSNR、SSIM（Wang et al., 2004）与 LPIPS（Zhang et al., 2018），并额外比较相对于独立 DAPS 运行的先验不一致幻觉发生率。PC-DAPS 降低了先验不一致样本的发生率，在歧义非线性问题上改善性能，同时在线性逆问题上保持图像质量与多样性。我们的贡献如下：

- 提出 PC-DAPS：维持一袋粒子、用高斯混合建模去噪器后验，并在**无真值**条件下执行基于先验的剪枝。
- 在 FFHQ 与 ImageNet 的七个线性与三个非线性逆问题上评估 PC-DAPS，显示先验不一致重建更少、非线性重建质量更高，同时保持线性任务性能。

## 2. 相关工作

**似然引导的扩散采样。** 给定已学到无条件分数 \(\nabla_{\mathbf x_t}\log p(\mathbf x_t)\) 的扩散先验，可把条件分数分解为 \(\nabla_{\mathbf x_t}\log p(\mathbf x_t|\mathbf y)=\nabla_{\mathbf x_t}\log p(\mathbf x_t)+\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)\)。似然项难以处理，因此一类方法近似它来引导反向扩散过程：DPS（Chung et al., 2023）在一步后验均值处评估似然 \(p(\mathbf y|\mathbf x_t)\approx p(\mathbf y|\mathbb E[\mathbf x_0|\mathbf x_t])\) 并反传求分数；对线性测量算子，ΠGDM（Song et al., 2023）与 TMPD（Boys et al., 2024）传播 \(p(\mathbf x_0|\mathbf x_t)\) 的高斯近似，而 DDRM（Kawar et al., 2022）用对角化方法；MCG（Chung et al., 2022）加入流形校正项使引导迭代靠近数据流形。Jin 等（2026）通过稳定先验更新来处理该族方法中的幻觉，但仍坚持单一轨迹。

**分裂与退火后验采样。** 相反，变量分裂方法在先验步与测量步之间交替：在扩散先验步的方法中，PnP-DM（Wu et al., 2024）用分裂 Gibbs 采样器处理似然，DPnP（Xu & Chi, 2024）用 Metropolis–Hastings，DiffPIR（Zhu et al., 2023）用近端步；最后 DAPS（Zhang et al., 2025）采用重复去噪—再加噪方案（第 3.2 节）。RePS（Ahmed & Makin, 2026）在该调度上加入重启，DAPS++（Chen et al., 2026）报告 DAPS 的重建在很大程度上由测量一致性驱动。因此我们把 PC-DAPS 设计为 DAPS 的修改版：保留其变量分裂结构，但引入基于先验的选择以区分测量一致的重建。

**基于粒子的后验采样。** 另一类方法在采样全程维持多个粒子，并用序贯 Monte Carlo 传播、重加权、重采样以逐步提高测量一致性（Cardoso et al., 2024; Janati et al., 2025）。FPS-SMC（Dou & Song, 2024）把反向采样过程表述为状态空间模型并施加粒子滤波；TDS（Wu et al., 2023）用 twisting 函数获得一般测量模型下的渐近精确性。基于粒子的方法通常关心粒子数趋于无穷时集成的保真度，而我们关心的是**单个返回重建先验不一致的概率**，并把粒子用于探索后验景观。

**幻觉与先验失配的诊断。** 幻觉在扩散先验被采用之前就作为逆问题重建算法的性质被研究（Bhadra et al., 2021），指任何……（原文此句延续至下一栏）。Burns 与 Fridovich-Keil（2026）从有限样本视角分析扩散后验采样器何时、为何、如何失败；另有工作对扩散退火类贝叶斯逆求解器做基准测试（Crafts & Villa, 2025; Zach et al., 2026），或在物理科学中基准测试即插即用扩散先验（Zheng et al., 2025）。这些诊断与我们目标相关，但我们的方法**在采样过程中**直接纠正过早提交的粒子。

## 3. 预备

### 3.1 贝叶斯逆问题

我们考虑如下形式的贝叶斯逆问题：

$$
\mathbf y=\mathcal A(\mathbf x)+\mathbf n,\qquad\mathbf n\sim\mathcal N(\mathbf 0,\beta_y^2\mathbf I),\tag{1}
$$

其中 \(\mathbf x\in\mathbb R^d\) 为待求未知信号、\(\mathcal A:\mathbb R^d\to\mathbb R^m\) 为已知测量算子。后验分布为

$$
p(\mathbf x|\mathbf y)\propto p(\mathbf y|\mathbf x)p(\mathbf x),\qquad p(\mathbf y|\mathbf x)=\mathcal N\left(\mathbf y;\mathcal A(\mathbf x),\beta_y^2\mathbf I\right).\tag{2}
$$

我们特别关注**测量一致信号集**包含多个在信号空间中良好分离的候选重建的前向模型：

$$
\mathcal M(\mathbf y)=\left\{\mathbf x\in\mathbb R^d:\left\|\mathcal A(\mathbf x)-\mathbf y\right\|\le\delta\right\}.\tag{3}
$$

在此情形下不同候选可有相同似然却对应不同先验概率，这正是本文关注的**歧义**。

### 3.2 解耦退火后验采样（DAPS）

DAPS 通过对以下两步交替实现从后验采样：

$$
\mathbf x_0\sim p(\mathbf x_0|\mathbf x_t,\mathbf y),\qquad \mathbf x_{t-1}\sim\mathcal N\left(\mathbf x_0,\sigma_{t-1}^2\mathbf I\right),\tag{4}
$$

从而产生 \(\mathbf x_{t-1}\sim p(\mathbf x_{t-1}|\mathbf y)\)。为从引导去噪分布 \(p(\mathbf x_0|\mathbf x_t,\mathbf y)\) 采样，注意给定 \(\mathbf x_0\) 时 \(\mathbf y\) 与 \(\mathbf x_t\) 独立，故由 Bayes 规则可分解为

$$
p(\mathbf x_0|\mathbf x_t,\mathbf y)\propto p(\mathbf y|\mathbf x_0)p(\mathbf x_0|\mathbf x_t).\tag{5}
$$

其中 \(p(\mathbf y|\mathbf x_0)\) 由（2）诱导，而 \(p(\mathbf x_0|\mathbf x_t)\) 用单峰高斯近似：

$$
p(\mathbf x_0|\mathbf x_t)\approx\mathcal N\left(\mathbf x_0;\hat{\mathbf x}_0(\mathbf x_t),r_t^2\mathbf I\right),\tag{6}
$$

其中 \(\hat{\mathbf x}_0(\mathbf x_t)\) 为 Tweedie 点估计。随后 DAPS 用 Langevin 动力学从该近似后验采样：

$$
\mathbf x_0^{(j+1)}=\mathbf x_0^{(j)}+\eta_t\left(\nabla_{\mathbf x_0}\log p(\mathbf x_0^{(j)}|\mathbf x_t)+\nabla_{\hat{\mathbf x}_0}\log p(\mathbf y|\hat{\mathbf x}_0^{(j)})\right)+\sqrt{2\eta_t}\,\boldsymbol\epsilon^{(j)},\quad\boldsymbol\epsilon^{(j)}\sim\mathcal N(\mathbf 0,\mathbf I),\tag{7}
$$

其中 \(\eta_t\) 为步长。Langevin 迭代（用户指定迭代数 \(N\)）结束后，结果用于式 (4) 中的再添加噪声步骤。**图 2** 展示了失败机理：在具有二次测量的非线性逆问题中，先验在两个候选解 \(\mathbf x_1\)、\(\mathbf x_2\) 上分配质量；轨迹式采样器可能过早锁定与先验不一致的候选，产生幻觉重建。

**图 2（原文 Figure 2）：** 过早模态选择。我们考虑具有二次测量的非线性逆问题：先验在两个候选解 \(\mathbf x_1\) 与 \(\mathbf x_2\) 上分配质量，但轨迹式采样器可能在先验仍弱的高噪声阶段过早选定某一模态，其最近测量一致模态可能并不受先验支持，从而产生幻觉。

## 4. 方法

best-of-k 策略有两个明显缺点：(i) 该采样方法的**有效样本量**不佳——大量计算资源用于生成随后被丢弃的样本；(ii) 在无法访问真值信号或后验时，不清楚如何选择丢弃哪些样本。为此我们提出 PC-DAPS：一种在采样过程中**纠正过早提交粒子**的程序，不需要真值图像、也不需要预训练的先验不一致分类器。

PC-DAPS 维持一袋 \(K\) 个粒子，每个粒子用同一退火调度与预训练去噪器去噪，但初始化与 Langevin、再加噪更新中的随机噪声不同。若对 DAPS 不加修改，\(K\) 个粒子将独立去噪，并可被划分为"过早提交的坏粒子"与"后验一致的好粒子"（可能非空）两组。PC-DAPS 的核心思想是改进 DAPS 现有的再加噪策略：**在采样过程中**识别过早提交的粒子，并把它们移动到袋中其他粒子发现的更有希望模态。此外 PC-DAPS 利用这些粒子改进 DAPS 的其他设计决策，例如用自适应高斯混合模型（GMM）近似替换去噪分布的单峰高斯近似。说明该高斯混合近似益处的玩具示例见附录 A.3。

接下来需要说明 PC-DAPS 如何 (i) 判断粒子何时过早提交，(ii) 识别哪些粒子有问题，(iii) 纠正被识别出的粒子，(iv) 由袋构造多峰去噪分布近似。PC-DAPS 对 DAPS 做两处核心修改，利用并行退火的 \(K\) 个粒子：在存在似然歧义的任务中纠正陷入先验不一致似然模态的粒子的**剪枝**技术（第 4.1 节），以及由粒子多样性估计的**多峰去噪分布近似**（第 4.2 节）。更多实现细节与消融见附录 A.4，例如为在降低计算成本的同时提升重建质量而省略最后的 Langevin 精化、改用从高噪声到低噪声的自适应 ODE 步进（附录 A.5）。完整算法（算法 1）见附录 A.1。

PC-DAPS 首先从反向扩散过程的初始分布初始化一袋 \(K\) 个粒子 \(\mathcal B=\{\mathbf x^{(k)}\}_{k=1}^{K}\)，并按 DAPS 规定去噪。在 \(\mathcal M(\mathbf y)\)（式 (3)）包含多个清晰分离候选的任务中（例如非线性 \(\mathcal A\)），粒子会开始去噪到真正不同的候选重建。在 DAPS 去噪过程中**先验首次具备区分力**的退火时刻，PC-DAPS 触发一次**一次性一致性检查**来识别先验不一致粒子。为确定该检查应在何时发生，我们在每次迭代中检验袋的多样性。

### 4.1 剪枝方案

记袋中 Tweedie 干净估计为 \(\tilde{\mathbf x}^{(k)}_0\)，并定义

$$
r^\star=\min_k\left\|\mathcal A(\tilde{\mathbf x}^{(k)}_0)-\mathbf y\right\|_2^2,\qquad \bar r=\frac1K\sum_{k=1}^{K}\left\|\mathcal A(\tilde{\mathbf x}^{(k)}_0)-\mathbf y\right\|_2^2.\tag{8}
$$

对线性 \(\mathcal A\)，由平方范数的凸性与 Jensen 不等式必有 \(\bar r\ge r^\star\)。借用该凸性直觉：对非线性 \(\mathcal A\)，条件 \(\bar r<r^\star\) 表明袋占据了似然势的**多个井**，即模态级剪枝是有意义的。

为识别需要纠正的粒子，我们把袋划分为簇 \(\mathcal C_m\)，并用多个噪声尺度 \(\mathcal S\) 上的**平均先验一致性**（由 Tweedie 公式得到）评估每个簇：

$$
s(\mathcal C_m)=\frac{1}{|\mathcal C_m|}\sum_{\mathbf x\in\mathcal C_m}\frac{1}{|\mathcal S|}\sum_{\sigma\in\mathcal S}\left\|\mathbf x-\mathcal D_\theta(\mathbf x+\sigma\boldsymbol\epsilon;\sigma)\right\|^2,\qquad\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I).\tag{9}
$$

该准则的前提是：位于（先验）数据流形附近的样本在每个噪声尺度上都具有小的（Stein）分数。若某簇的先验一致性得分 \(s(\mathcal C_m)\) 超过阈值，其粒子保持不变；否则其粒子被**随机替换**为得分高于阈值的簇中粒子的副本。聚类方法、噪声尺度集 \(\mathcal S\) 的选择与阈值确定见附录 A.4。

### 4.2 去噪器后验的高斯混合近似

维持一袋粒子的另一个好处是：我们可以用由袋多样性启发的**多峰**分布改进 DAPS 在式 (6) 中的单峰近似。我们提出用高斯混合替换 DAPS 的高斯近似。记第 \(k\) 个粒子的干净信号估计为 \(\tilde{\mathbf x}^{(k)}_0\)。在第 4.1 节剪枝生效之前，我们用以各粒子干净估计为中心的**均匀加权高斯混合**：

$$
q(\mathbf x_0|\mathbf x_t)=\sum_{k=1}^{K}\frac1K\mathcal N\left(\mathbf x_0;\tilde{\mathbf x}^{(k)}_0,\operatorname{Var}_{\mathcal B}\left(\tilde{\mathbf x}^{(k)}_0\right)\mathbf I\right),\tag{10}
$$

其中 \(\operatorname{Var}_{\mathcal B}(\cdot)\) 为袋内经验的逐维方差。剪枝后，我们为每个未剪除的簇保留一个模态，其分量参数由该簇的经验权重、均值与对角协方差给出：

$$
q(\mathbf x_0|\mathbf x_t)=\sum_{m=1}^{M}\pi_m\mathcal N\left(\mathbf x_0;\boldsymbol\mu_m,\boldsymbol\Sigma_m\right),\qquad\pi_m=\frac{|\mathcal C_m|}{K},\tag{11}
$$

$$
\boldsymbol\mu_m=\frac{1}{|\mathcal C_m|}\sum_{\mathbf x^{(k)}\in\mathcal C_m}\tilde{\mathbf x}^{(k)}_0,\qquad\boldsymbol\Sigma_m=\operatorname{diag}\left(\operatorname{Var}_{\mathcal C_m}\left(\tilde{\mathbf x}^{(k)}_0\right)\right).\tag{12}
$$

当某簇只含一个粒子时，其分量使用整个袋的对角协方差。与在点估计 \(\hat{\mathbf x}_0(\mathbf x_t)\) 处中心化去噪近似的 DAPS 不同，PC-DAPS 让同一模态内所有粒子共享**袋均值中心**，得到方差减小的先验估计——我们发现这能提升线性重建任务的重建质量。此外，当整个袋落在单一簇内时，混合退化为以袋平均 Tweedie 估计为中心的单个高斯，协方差由数据决定；这与 DAPS 使用的启发式、与几何无关的协方差形成对比。

注意 GMM 去噪近似 \(q(\mathbf x_0|\mathbf x_t)\) 的分数可**闭式**获得：

$$
\nabla_{\mathbf x_0}\log q(\mathbf x_0|\mathbf x_t)=-\sum_{m=1}^{M}q_m(\mathbf x_0)\boldsymbol\Sigma_m^{-1}\left(\boldsymbol\mu_m-\mathbf x_0\right),\tag{13}
$$

其权重为 \(q_m(\mathbf x_0)=\pi_m\mathcal N(\mathbf x_0;\boldsymbol\mu_m,\boldsymbol\Sigma_m)\big/\sum_{m'}\pi_{m'}\mathcal N(\mathbf x_0;\boldsymbol\mu_{m'},\boldsymbol\Sigma_{m'})\)，因此可用于式 (7) 的 DAPS Langevin 更新。当权重 \(q_m\) 近似 one-hot 时，该更新近似退化为数据相关的高斯。回忆 DAPS 的高斯近似会抑制 Langevin 动力学偏离点估计 \(\hat{\mathbf x}_0(\mathbf x_t)\) 太远；PC-DAPS 的高斯近似则抑制其偏离由袋中集体簇所识别的**先验模态**太远（附录 A.3 图 4 展示了这一点）。

## 5. 结果

**主要结果。** 表 1 表明 PC-DAPS 虽非在所有实验中一致优于全部基线，但在所有实验中都具有竞争力，且常取得最高样本质量，其中相位恢复的改进最显著。特别地，相位恢复结果显示：尽管 PC-DAPS 在评估协议上处于劣势（PC-DAPS 对单次运行生成的四个样本取平均指标，而所有基线只在四次独立运行中**用真值选出**的最好样本上评估），其在各指标上仍具竞争力；此外，尽管采用剪枝—替换策略，我们观察到单次 PC-DAPS 袋内四个粒子的多样性通常仍与独立 DAPS 运行相当（图 3、附录 A.7）。

**表 1（原文 Table 1）：FFHQ 与 ImageNet 上的定量评估（七个线性、三个非线性逆问题，100 张测试图像；PSNR/SSIM/LPIPS）。非线性问题报告 100 张图像的均值±标准差；PC-DAPS 对每个输入生成 4 个样本，指标为这 4 个样本的平均；相位恢复对其他方法报告 best-of-4 运行的 oracle 结果。加粗/下划线标记最佳/次佳。所有任务噪声水平 \(\beta_y=0.05\)。**

| 任务 | 方法 | FFHQ PSNR↑ | FFHQ SSIM↑ | FFHQ LPIPS↓ | ImageNet PSNR↑ | ImageNet SSIM↑ | ImageNet LPIPS↓ |
|---|---|---|---|---|---|---|---|
| 超分辨率 4× | **PC-DAPS** | **30.25** | **0.841** | **0.166** | **26.44** | **0.714** | **0.245** |
| 超分辨率 4× | DAPS | 29.36 | 0.782 | 0.173 | 25.51 | 0.639 | 0.281 |
| 超分辨率 4× | DDNM | 28.01 | 0.797 | 0.196 | 23.92 | 0.606 | 0.472 |
| 超分辨率 4× | DPS | 25.86 | 0.753 | 0.269 | 21.13 | 0.489 | 0.361 |
| 超分辨率 4× | FPS-SMC | 28.45 | 0.812 | 0.206 | 24.79 | 0.705 | 0.311 |
| 超分辨率 16× | **PC-DAPS** | **22.21** | **0.623** | **0.368** | **20.90** | **0.454** | **0.535** |
| 超分辨率 16× | DAPS | 22.14 | 0.597 | 0.373 | 20.35 | 0.450 | 0.545 |
| 超分辨率 16× | DPS | 21.09 | 0.586 | 0.570 | 18.41 | 0.384 | 0.592 |
| 超分辨率 16× | FPS-SMC | 22.09 | 0.604 | 0.496 | 18.88 | 0.423 | 0.588 |
| 高通滤波 | **PC-DAPS** | **18.84** | **0.815** | **0.155** | **17.33** | **0.778** | **0.204** |
| 高通滤波 | DAPS | 16.85 | 0.702 | 0.204 | 15.51 | 0.732 | 0.217 |
| 高通滤波 | DPS | 4.92 | 0.437 | 0.687 | 12.84 | 0.606 | 0.473 |
| 高通滤波 | FGPS | 18.04 | 0.761 | 0.184 | 14.77 | 0.708 | 0.229 |
| 补全（box） | **PC-DAPS** | **24.73** | **0.825** | **0.152** | 21.56 | 0.738 | 0.221 |
| 补全（box） | DAPS | 24.69 | 0.746 | 0.166 | 21.12 | 0.714 | 0.229 |
| 补全（box） | DDNM | 24.44 | **0.839** | 0.233 | 21.67 | **0.746** | 0.321 |
| 补全（box） | DPS | 22.51 | 0.792 | 0.209 | 18.94 | 0.722 | 0.257 |
| 补全（box） | FPS-SMC | 24.86 | 0.823 | **0.146** | **22.16** | 0.726 | **0.208** |
| 补全（random） | **PC-DAPS** | **31.83** | **0.875** | **0.121** | 28.18 | 0.781 | **0.159** |
| 补全（random） | DAPS | 30.73 | 0.801 | 0.129 | 27.32 | 0.725 | 0.189 |
| 补全（random） | DDNM | 29.87 | 0.816 | 0.123 | **31.14** | **0.839** | 0.193 |
| 补全（random） | DPS | 25.46 | 0.823 | 0.203 | 23.52 | 0.745 | 0.297 |
| 补全（random） | FPS-SMC | 28.17 | 0.824 | 0.258 | 24.55 | 0.699 | 0.318 |
| 高斯去模糊 | **PC-DAPS** | **30.35** | **0.839** | **0.164** | 26.37 | **0.703** | **0.250** |
| 高斯去模糊 | DAPS | 29.60 | 0.787 | 0.179 | 25.94 | 0.659 | 0.267 |
| 高斯去模糊 | DDNM | 28.18 | 0.805 | 0.214 | **28.11** | 0.701 | 0.281 |
| 高斯去模糊 | DPS | 25.87 | 0.764 | 0.219 | 20.31 | 0.598 | 0.397 |
| 高斯去模糊 | FPS-SMC | 26.47 | 0.771 | 0.251 | 23.86 | 0.603 | 0.390 |
| 运动去模糊 | **PC-DAPS** | **32.13** | **0.872** | **0.119** | **29.06** | **0.800** | **0.162** |
| 运动去模糊 | DAPS | 31.65 | 0.837 | 0.137 | 28.66 | 0.770 | 0.175 |
| 运动去模糊 | DPS | 24.52 | 0.801 | 0.246 | 18.96 | 0.629 | 0.423 |
| 运动去模糊 | FPS-SMC | 27.31 | 0.825 | 0.229 | 24.60 | 0.645 | 0.329 |
| 相位恢复 | **PC-DAPS** | **30.09±1.77** | **0.834±0.089** | **0.152±0.088** | **21.75±6.10** | **0.469±0.132** | **0.373±0.128** |
| 相位恢复 | DAPS | 29.66±4.17 | 0.770±0.100 | 0.177±0.090 | 20.98±6.72 | 0.461±0.226 | 0.387±0.163 |
| 相位恢复 | DPS | 17.64±2.97 | 0.441±0.129 | 0.410±0.090 | 16.81±3.61 | 0.427±0.143 | 0.447±0.099 |
| 相位恢复 | PnP-DM | 21.70±5.50 | 0.542±0.122 | 0.398±0.101 | 17.68±6.70 | 0.458±0.191 | 0.499±0.101 |
| 相位恢复 | DPnP | 20.39±6.15 | 0.592±0.139 | 0.392±0.173 | 16.74±3.21 | 0.487±0.196 | 0.535±0.107 |
| 相位恢复 | RED-Diff | 15.72±4.41 | 0.401±0.191 | 0.588±0.089 | 15.11±3.68 | 0.389±0.058 | 0.529±0.127 |
| 相位恢复 | HIO | 13.53±2.50 | 0.359±0.093 | 0.726±0.068 | – | – | – |
| 非线性去模糊 | **PC-DAPS** | **29.04±0.82** | **0.804±0.017** | 0.180±0.023 | 27.63±2.58 | 0.739±0.053 | 0.211±0.032 |
| 非线性去模糊 | DAPS | 28.49±1.52 | 0.762±0.031 | 0.191±0.031 | 27.25±3.18 | 0.717±0.089 | 0.213±0.055 |
| 非线性去模糊 | DPS | 23.39±2.01 | 0.623±0.082 | 0.278±0.060 | 22.49±3.20 | 0.591±0.101 | 0.306±0.081 |
| 非线性去模糊 | RED-Diff | 30.72±0.56 | 0.793±0.029 | **0.162±0.032** | **29.91±1.36** | **0.751±0.024** | 0.214±0.080 |
| 高动态范围 | **PC-DAPS** | 28.25±1.17 | **0.839±0.020** | 0.163±0.039 | **26.01±2.77** | **0.822±0.099** | **0.173±0.094** |
| 高动态范围 | DAPS | 27.67±3.57 | 0.839±0.078 | 0.165±0.069 | 25.80±4.37 | 0.819±0.113 | 0.177±0.106 |
| 高动态范围 | DPS | 22.73±6.07 | 0.591±0.141 | 0.264±0.156 | 19.23±2.52 | 0.582±0.082 | 0.503±0.106 |
| 高动态范围 | RED-Diff | 21.94±3.52 | 0.508±0.081 | 0.261±0.091 | 21.88±5.77 | 0.598±0.097 | 0.281±0.191 |

**先验不一致的幻觉。** 表 1 报告标准指标以便与基线比较，然而该评估流程**掩盖**了 PC-DAPS 所要解决的失败模式（测量一致但先验不支持的重建），因为基线方法使用的 best-of-k 评估丢弃了 \(k-1\) 幅重建图像。对相位恢复，我们改为把每个样本分类为**忠实**（faithful）、**倒置/颜色反转**（upside-down / color-inverted，即自然图像先验会降权的测量一致似然模态）或**失败**（failed）。标签用逐通道 PSNR 自动分配：把样本与真值及其旋转版本比较，并对 ±1 像素循环平移取最大以计入平移歧义；只有当某通道比另一方向更接近超过 1 dB 时才归为该方向；所有通道都匹配真值记为忠实，匹配旋转或通道间不一致记为倒置/颜色反转，其余记为失败。表 2 报告由此得到的频率。

**表 2（原文 Table 2）：FFHQ 与 ImageNet 上 DAPS 与 PC-DAPS 的相位恢复结局频率**

| 数据集 | 结局 | DAPS（4 次运行） | PC-DAPS（4 粒子袋） |
|---|---|---|---|
| FFHQ | 忠实↑ | 79.5% | 97.5% |
| FFHQ | 倒置/颜色反转↓ | 14.5% | 1.5% |
| FFHQ | 失败↓ | 6.0% | 1.0% |
| FFHQ | 不可恢复的运行/袋↓ | 4% | 1% |
| ImageNet | 忠实↑ | 38.5% | 45.0% |
| ImageNet | 倒置/颜色反转↓ | 42.0% | 30.5% |
| ImageNet | 失败↓ | 19.5% | 24.5% |
| ImageNet | 不可恢复的运行/袋↓ | 25% | 15% |

在 FFHQ 上，PC-DAPS 把倒置或颜色反转重建的比例从 **14.5% 降至 1.5%**，把忠实重建比例从 **79.5% 升至 97.5%**，从而解决了 PC-DAPS 首要针对的失败模式。在 ImageNet 上改进较小：忠实重建比例从 38.5% 升至 45.0%，不可恢复运行/袋（其中不存在忠实样本）的比例从 25% 降至 15%，倒置/颜色反转比例从 42.0% 降至 30.5%。PC-DAPS 依赖先验一致性来消解相位恢复测量中的颜色与方向歧义，但 ImageNet 的多类别先验在各噪声尺度上提供的消歧信号弱于 FFHQ 先验；当先验支持的局部几何更复杂时，基于数据流形的先验一致剪枝似乎效果较差。

**图 3（原文 Figure 3）：** PC-DAPS 解决了标准 DAPS best-of-k 运行中出现的倒置方向不一致。多样性行显示：尽管 PC-DAPS 稳定，其在单次运行内生成的四个粒子之间仍保留了细微变化。

## 6. 讨论与结论（原文 Discussion）

**动机、局限与未来工作。** 扩散文献中歧义逆问题的结果通常以 best-of-k 报告，并用真值做选择。这种做法之所以常见，是因为现有求解器跨运行不一致，单样本结果质量波动很大；我们把这种不稳定性视为**测量歧义下过早模态选择**的症状。PC-DAPS 利用学习到的先验信息，在无需真值参考的情况下降低采样中的这种不必要方差。即便在 FFHQ 等高维数据集上，由于先验的局部结构，本方法也展现出显著改进；在结构更多样的 ImageNet 上改进较小，因为先验景观更复杂，这暴露出一个仍需解决的局限与开放问题。

**图 1 与图 3** 展示了 PC-DAPS 如何在不牺牲多样性的前提下把采样导向先验支持的模态。

## 参考文献（英文原书目；编号为本站编辑所加，原文为无编号字母序列表）

[1] Ahmed, Bilal and Joseph G Makin. Solving diffusion inverse problems with restart posterior sampling. In European Conference on Computer Vision (ECCV), pp. 79–96. Springer, 2026.

[2] Bertero, Mario, Patrizia Boccacci, and Christine De Mol. Introduction to Inverse Problems in Imaging. CRC Press, 2021.

[3] Bhadra, Sayantan, Varun A Kelkar, Frank J Brooks, and Mark A Anastasio. On hallucinations in tomographic image reconstruction. IEEE Transactions on Medical Imaging, 40(11):3249–3260, 2021.

[4] Boys, Benjamin, Mark Girolami, Jakiw Pidstrigach, Sebastian Reich, Alan Mosca, and Omer Deniz Akyildiz. Tweedie moment projected diffusions for inverse problems. Transactions on Machine Learning Research (TMLR), 2024.

[5] Burns, Benjamin A. and Sara Fridovich-Keil. When, why, and how do diffusion posterior samplers fail? A finite-sample lens. arXiv preprint arXiv:2605.30330, 2026.

[6] Cardoso, Gabriel, Yazid Janati El Idrissi, Sylvain Le Corff, and Eric Moulines. Monte Carlo guided denoising diffusion models for Bayesian linear inverse problems. In International Conference on Learning Representations (ICLR), vol. 2024, pp. 44001–44037, 2024.

[7] Chen, Hao, Renzheng Zhang, and Scott S Howard. DAPS++: Rethinking diffusion inverse problems with decoupled posterior annealing. In European Conference on Computer Vision (ECCV), pp. 223–240. Springer, 2026.

[8] Chung, Hyungjin, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. In Advances in Neural Information Processing Systems (NeurIPS), vol. 35, pp. 25683–25696, 2022.

[9] Chung, Hyungjin, Jeongsol Kim, Michael Thompson McCann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations (ICLR), 2023.

[10] Crafts, Evan Scope and Umberto Villa. Benchmarking diffusion annealing-based Bayesian inverse problem solvers. IEEE Open Journal of Signal Processing, 2025.

[11] Deng, Jia, Wei Dong, Richard Socher, Li-Jia Li, Kai Li, and Li Fei-Fei. ImageNet: A large-scale hierarchical image database. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 248–255. IEEE, 2009.

[12] Dou, Zehao and Yang Song. Diffusion posterior sampling for linear inverse problem solving: A filtering perspective. In International Conference on Learning Representations (ICLR), vol. 2024, pp. 12069–12095, 2024.

[13] Event Horizon Telescope Collaboration. First M87 Event Horizon Telescope Results. IV. Imaging the Central Supermassive Black Hole. The Astrophysical Journal Letters, 875(1):L4, apr 2019.

[14] Fienup, James R. Phase retrieval algorithms: A comparison. Applied Optics, 21(15):2758–2769, 1982.

[15] Ho, Jonathan, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 6840–6851. Curran Associates, Inc., 2020.

[16] İşil, Çağatay and Figen S Oktem. Deep plug-and-play HIO approach for phase retrieval. Applied Optics, 64(5):A84–A94, 2025.

[17] Janati, Yazid, Badr Moufad, Mehdi Abou El Qassime, Alain Oliviero Durmus, Eric Moulines, and Jimmy Olsson. A mixture-based framework for guiding diffusion models. In International Conference on Machine Learning (ICML), vol. 267, pp. 26830–26876. PMLR, 2025.

[18] Jin, Pengfei, Yiqi Tian, Kailong Fan, Bingjie Qi, and Quanzheng Li. Hallucination-aware diffusion sampling for inverse problems via robust prior updates. arXiv preprint arXiv:2606.02331, 2026.

[19] Karras, Tero, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 4396–4405. IEEE, 2019.

[20] Karras, Tero, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. In Advances in Neural Information Processing Systems (NeurIPS), vol. 35, pp. 26565–26577. Curran Associates, Inc., 2022.

[21] Kawar, Bahjat, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. In Advances in Neural Information Processing Systems (NeurIPS), vol. 35, pp. 23593–23606, 2022.

[22] Mardani, Morteza, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In International Conference on Learning Representations (ICLR), vol. 2024, pp. 28027–28053, 2024.

[23] Metzler, Christopher, Phillip Schniter, Ashok Veeraraghavan, and Richard Baraniuk. prDeep: Robust phase retrieval with a flexible deep network. In International Conference on Machine Learning (ICML), pp. 3501–3510. PMLR, 2018.

[24] Roberts, Gareth O. and Richard L. Tweedie. Exponential convergence of Langevin distributions and their discrete approximations. Bernoulli, 2(4):341–363, 1996.

[25] Schwarz, Gideon. Estimating the dimension of a model. The Annals of Statistics, 6(2):461–464, 1978.

[26] Song, Jiaming, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations (ICLR), 2023.

[27] Song, Yang, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations (ICLR), 2021.

[28] Song, Yang, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Solving inverse problems in medical imaging with score-based generative models. In International Conference on Learning Representations (ICLR), 2022.

[29] Thaker, Darshan, Abhishek Goyal, and René Vidal. Frequency-guided posterior sampling for diffusion-based image restoration. In IEEE/CVF International Conference on Computer Vision (ICCV), pp. 12873–12882. IEEE, 2025.

[30] Wang, Frederic and Katherine Bouman. Sample-efficient evidence estimation of score based priors for model selection. In International Conference on Learning Representations (ICLR), vol. 2026, pp. 74960–74987, 2026.

[31] Wang, Yinhuai, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. In The Eleventh International Conference on Learning Representations (ICLR), 2023.

[32] Wang, Zhou, Alan C Bovik, Hamid R Sheikh, and Eero P Simoncelli. Image quality assessment: From error visibility to structural similarity. IEEE Transactions on Image Processing, 13(4):600–612, 2004.

[33] Wu, Luhuan, Brian Trippe, Christian Naesseth, David Blei, and John Cunningham. Practical and asymptotically exact conditional sampling in diffusion models. In Advances in Neural Information Processing Systems (NeurIPS), vol. 36, pp. 31372–31403. Curran Associates, Inc., 2023.

[34] Wu, Zihui, Yu Sun, Yifan Chen, Bingliang Zhang, Yisong Yue, and Katherine Bouman. Principled probabilistic imaging using diffusion models as plug-and-play priors. In The Thirty-eighth Annual Conference on Neural Information Processing Systems (NeurIPS), 2024.

[35] Xu, Xingyu and Yuejie Chi. Provably robust score-based diffusion posterior sampling for plug-and-play image reconstruction. In Advances in Neural Information Processing Systems (NeurIPS), vol. 37, pp. 36148–36184. Curran Associates, Inc., 2024.

[36] Zach, Martin, Youssef Haouchat, and Michael Unser. A statistical benchmark for diffusion-posterior-sampling algorithms. In International Conference on Learning Representations (ICLR), vol. 2026, pp. 108984–109021, 2026.

[37] Zhang, Bingliang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving Diffusion Inverse Problem Solving with Decoupled Noise Annealing. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 20895–20905, 2025.

[38] Zhang, Richard, Phillip Isola, Alexei A Efros, Eli Shechtman, and Oliver Wang. The unreasonable effectiveness of deep features as a perceptual metric. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 586–595. IEEE, 2018.

[39] Zheng, Hongkai, Wenda Chu, Bingliang Zhang, Zihui Wu, Austin Wang, Berthy T. Feng, Caifeng Zou, Yu Sun, Nikola Kovachki, Zachary E. Ross, Katherine L. Bouman, and Yisong Yue. InverseBench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences. In International Conference on Learning Representations (ICLR), vol. 2025, pp. 90912–90940, 2025.

[40] Zhu, Yuanzhi, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops, 2023.

## 附录概述

> 说明：原文第 12–25 页为附录，含算法 1 的完整伪代码、玩具实验细节、GMM 近似的玩具示例、实现与超参数、消融、任务与基线定义，以及大量定性样本。因本页按 TEAM_BRIEF2 的篇幅与结构惯例，附录以结构化说明 + 全部表/图图注呈现；完整伪代码与证明细节请对照原文 PDF。

**A.1 算法 1（Prior-Consistent DAPS，PC-DAPS）**：初始化一袋 \(K\) 个粒子；按 DAPS 退火（ODE 步 + 再加噪）；在每次迭代用式 (8) 的袋多样性与一次一致性检查触发剪枝；按式 (9) 评估簇的先验一致性并剪除/替换粒子；按式 (10)–(12) 构造（剪枝前均匀加权、剪枝后按簇的）高斯混合近似，并用式 (13) 的闭式分数执行 Langevin 更新；最后输出袋内样本（单次运行得到 4 个候选）。

**A.2 玩具实验细节**：信号 \(\mathbf x\in\mathbb R^2\)，先验为两个原子 \(\pm a\mathbf u\)（\(a=1\)，\(\mathbf u=\mathbf e_1\)）：

$$
p(\mathbf x_0)=\tfrac12\delta_{-a\mathbf u}+\tfrac12\delta_{a\mathbf u},\qquad a=1;\tag{14}
$$

对 EDM 参数化的前向模型 \(\mathbf x_\sigma=\mathbf x_0+\sigma\boldsymbol\epsilon\)，先验去噪器有闭式解

$$
D(\mathbf x,\sigma)=\mathbb E[\mathbf x_0|\mathbf x_\sigma=\mathbf x]=a\tanh\left(a\langle\mathbf x,\mathbf u\rangle/\sigma^2\right)\mathbf u,\tag{15}
$$

DAPS 与 PC-DAPS 均以该闭式去噪器替代训练网络（用于概率流 ODE 与全部 Tweedie 估计）。测量算子取内积的二次函数 \(\mathcal A(\mathbf x)=f(\langle\mathbf x,\mathbf u\rangle)\)（式 (16)，\(f\) 的显式形式见原文），观测设为 \(y=c=\kappa\beta_y\)，图 2 中取 \(\beta_y=0.05\)、\(b=0.1\)、\(\kappa=2\)（故 \(c=0.1\)）。**精确后验**可由 Bayes 规则闭式得到（式 (17) 起，原文推导），用于验证两种采样器的模态选择行为。

**A.3 GMM 近似的玩具示例**：图 4 展示高斯混合近似在 Langevin 更新中保持先验支持模态的作用——与单峰近似相比，多峰近似避免动力学被拉离袋中集体识别的先验模态。

**图 4（原文 Figure 4）：** 高斯混合近似在 Langevin 更新中保持先验支持的模态。

**A.4 实现细节**：聚类方法（对袋的 Tweedie 估计聚类）、噪声尺度集 \(\mathcal S\) 的选择、阈值确定，以及一致性检查的触发时刻（由袋多样性决定）。

**A.5 ODE 调度与 Langevin 精化消融**：表 3 比较 ODE 调度与最终 Langevin 精化的组合（在 10 个样本上消融）；图 5–图 8 分析 ODE 步数（图 5）、退火噪声调度步数（图 6）、袋中粒子数（图 7）、以及单次输入采样时间与重建质量（图 8）的影响。

**表 3（原文 Table 3）：ODE 调度与最终 Langevin 精化的比较（10 个样本上消融）**

| ODE 步数 | Langevin 精化 | PSNR | SSIM | LPIPS | PSNR | SSIM | LPIPS |
|---|---|---|---|---|---|---|---|
| 5 | 包含 | 29.50 | 0.787 | 0.168 | 29.63 | 0.789 | 0.167 |
| 1 | 包含 | 25.02 | 0.692 | 0.274 | 28.43 | 0.780 | 0.188 |

**A.6 任务与基线**：定义七个线性任务（4×/16× 超分辨率、高通滤波、box/random 补全、高斯/运动去模糊）与三个非线性任务（相位恢复、非线性去模糊、高动态范围），并给出 DAPS、DDNM、DPS、FPS-SMC、FGPS、PnP-DM、DPnP、RED-Diff、HIO 等基线的实现细节；表 4 报告"均值-of-k"评估下的相位恢复结果，表 5 汇总采样配置（ODE 步数、退火步数与函数评估次数）。

**表 4（原文 Table 4）：mean-of-k 评估下的相位恢复**：所有方法均以均值评估（PC-DAPS 与其 4 粒子平均一致），用于说明 PC-DAPS 的优势并非来自评估协议。

**表 5（原文 Table 5）：采样配置**：给出 DAPS 与 PC-DAPS 在不同任务上的 ODE 步数、退火步数与函数评估次数。

**A.7 定性样本**：图 9–图 14 分别给出 PC-DAPS 在相位恢复（FFHQ 图 9、ImageNet 图 10）、16× 超分辨率（图 11）、190×190 box 补全（图 12），以及 FFHQ/ImageNet 上各任务的多样本（图 13、图 14），样本均未做人工挑选。

**图 5–图 14（原文 Figures 5–14）：** 图 5 ODE 步数对 PC-DAPS 的影响；图 6 退火噪声调度步数的影响；图 7 袋中粒子数对相位恢复的影响；图 8 DAPS 与 PC-DAPS 的单输入采样时间与重建质量比较；图 9–图 14 PC-DAPS 在相位恢复、16× 超分辨率、box 补全及各任务上的定性样本（未人工挑选）。

## 图注与表注

**正文图注：** 图 1（测量一致不足以重建：同一傅里叶幅度测量被旋转、平移、颜色反转共享；现有求解器可能返回先验不一致模态，PC-DAPS 选出先验支持的重建）；图 2（过早模态选择：二次测量的非线性逆问题中，先验在两个候选上分配质量，轨迹式采样器可能过早锁定与先验不一致的候选）；图 3（PC-DAPS 解决标准 DAPS best-of-k 的倒置方向不一致，同时保持粒子多样性）。上述图注已随文置于相应位置。

**正文表注：** 表 1（FFHQ/ImageNet 上七个线性与三个非线性任务的 PSNR/SSIM/LPIPS，PC-DAPS 与 DAPS/DPS/DDNM/FPS-SMC/FGPS/PnP-DM/DPnP/RED-Diff/HIO 比较）与表 2（相位恢复结局频率：忠实/倒置或颜色反转/失败/不可恢复）均已在本页逐格转写；附录表 3–5 的图注已在附录概述中列出。

**本页范围与校对状态：** 本页覆盖原文摘要、第 1–6 节全部正文与小节（2、3.1–3.2、4.1–4.2）、式 (1)–(13)（正文）与式 (14)–(17)（附录玩具实验）、表 1–2（逐格转写）、图 1–3 图注随文 + 图 4–14 图注速览、参考文献（英文原条目）、附录 A.1–A.7 的结构化说明（含表 3–5 图注速览）。原文正文无附录内容（附录从第 12 页起）。**原文说明 2 处已加注：** ① 第 2 节"幻觉与先验失配的诊断"段落与附录玩具实验中的若干句子在 PDF 中跨栏/跨页截断，本页按可见部分翻译并以"（原文此句延续至下一栏/见 PDF）"标注；② 附录式 (16)、(17) 的显式形式在 PDF 中跨行断排，本页以文字说明其定义并按编号标注。逐句逐式终校未做；供后续 QA 重点核对：式 (8)–(9) 的多样性与先验一致性得分、式 (10)–(13) 的 GMM 构造与闭式分数、表 1–2 数值。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
