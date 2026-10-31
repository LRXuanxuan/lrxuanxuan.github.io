---
layout: page
title: "用 FLAIR 求解逆问题｜中文译稿（许可待核）译文"
permalink: /papers/translations/2026-10-02-solving-inverse-problems-with-flair/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/9d095caa2a3f42e6/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 用 FLAIR 求解逆问题

**原题：** Solving Inverse Problems with FLAIR  
**作者：** Julius Erbach<sup>1,2</sup>、Dominik Narnhofer<sup>1</sup>、Andreas Dombos<sup>1</sup>、Bernt Schiele<sup>2</sup>、Jan Eric Lenssen<sup>2</sup>、Konrad Schindler<sup>1</sup>  
**单位：** 1 ETH Zürich（苏黎世联邦理工学院）；2 Max Planck Institute for Informatics, Saarland Informatics Campus（马克斯·普朗克信息学研究所，萨尔信息学园区）。  
**版本：** 会议论文集版本（NeurIPS-2025-solving-inverse-problems-with-flair-Paper-Conference.pdf），本地 PDF 38 页；第 39 届神经信息处理系统大会（NeurIPS 2025）。**再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。**  
**范围与状态：** 全文中文译稿：摘要、第 1–6 节及全部小节（1、2、3.1–3.3、4、4.1、5.1–5.3、6）、式 (1)–(16)、命题 1–2、算法 1、表 1–3（逐格转写）、图 1–6 图注、附录 A 的结构化说明与附录表 1–16、图 1–10 图注速览、参考文献 [1]–[62]（英文原条目）均按原文结构录入；逐句逐式终校未做。**许可提示：原文为 NeurIPS 2025 会议论文集版本，许可条款待核验；本页仅为个人学习用途的中文译稿，不纳入可公开全文的统计口径。**

## 摘要

以 Stable Diffusion 3 为代表的基于流的隐生成模型能够生成质量惊人的图像，甚至实现照片级的文本到图像生成。其出色表现说明这些模型也应能作为逆成像问题的强力先验，但该思路尚未带来与之相当的保真度。存在若干关键障碍：(i) 数据似然项通常不可解析求解；(ii) 学习到的生成模型无法被直接以失真观测为条件，导致数据似然与先验之间目标冲突；(iii) 重建结果可能偏离观测数据。我们提出 **FLAIR**——一种无需训练、以流生成模型为先验求解逆问题的新型变分框架。为此，我们引入一个与退化类型无关的流匹配变分目标，并将其与确定性轨迹调整相结合，引导先验朝向在后验下更可能的区域。为强制与观测数据精确一致，我们把数据保真项与正则项的优化解耦。此外，我们引入含时校准方案，依据离线精度估计调制正则强度。在标准成像基准上的结果表明，FLAIR 在重建质量与样本多样性两方面都持续优于现有基于扩散与基于流的方法。源代码见 https://inverseflair.github.io/ 。

## 1. 引言

基于流的生成模型是现代图像生成器（如 Stable Diffusion、FLUX [14]）的核心。除基于文本提示的图像生成外，这些模型已成为一系列视觉计算任务的强大数据驱动先验。它们从互联网规模训练集中学到的、对视觉世界的全面表示，使其成为传统手工图像先验的有吸引力替代，且常常无需任何任务特定的再训练。

虽然一个能生成照片级图像的模型理应适合作为逆成像问题的先验（即正则项），但实际实现面临若干挑战。一方面，基于流的模型通常在变分自编码器（VAE）的低维隐空间中运作，这意味着前向算子（观测到的退化图像与期望的干净目标图像之间的关系）不再是线性的。另一方面，生成过程的迭代性质意味着中间阶段被（含时的）随机噪声污染，因此无法显式计算其数据似然，使数据项不可解析。此外，学习到的生成模型倾向于过度偏好训练分布中样本密度高的区域；对落入低密度区域的测试样本，先验会有过强的倾向把输出拉向先验似然更高的结果，损害对输入观测的保真度。

为此我们提出 **FLAIR**（flow-based latent adaptive inference with deterministic re-noising，基于流、带确定性重加噪的隐式自适应推断）——一种无需训练、专门面向把基于流的隐扩散模型整合进逆问题求解的变分框架。据我们所知，FLAIR 是首个把隐生成建模、流匹配与变分推断统一到逆问题单一表述中的方案。主要贡献如下：

- **面向流匹配先验的逆问题新变分目标。** 确定性轨迹调整把先验引导向与观测更一致的区域；该目标与退化类型无关，可直接用于任意线性的像素域前向算子。
- **数据项与正则项的解耦优化，从而支持硬数据一致性。** 我们提出新的含时加权方案，通过离线精度估计校准，使正则化沿流轨迹自适应地匹配模型预测可靠性的变化，从而实现稳健推断。

## 2. 相关工作

**基于深度学习的先验。** 基于深度学习的方法通常沿两条主线之一：直接学习逆映射 [28, 18, 30, 4, 60]，或学习合适的先验——后者可通过展开优化网络 [15, 29, 1, 36] 等非生成式方法，也可通过 GAN [37, 7, 46]、扩散模型 [17, 49, 52] 或基于流的模型 [31, 33] 等生成模型实现。后者在图像生成任务上表现出色，激发了把它们用作逆问题先验（尤其通过后验采样）的日益增长的兴趣。

**后验采样。** 尽管把基于去噪的深度神经网络所学到的隐式先验纳入求解看似直接，但不同框架会带来不同挑战。早期随机方法利用盲通用去噪器求解逆问题 [21]，但依赖启发式调度且仅限线性算子。现代扩散模型通过固定前向轨迹形式化该过程，但这种含时结构使似然不可解析 [11]。已有多种面向扩散后验采样的方法 [58, 19, 35, 20]：强制轨迹停留在相应噪声流形上 [11, 12, 61]、用 SVD 在谱域运行扩散 [25]、在反向扩散过程中利用值域—零空间分解 [25]、以前向算子的伪逆作引导 [50]。许多既有方法在像素空间表现良好，但由于 VAE 非线性或显存约束而难以用于隐扩散模型。

为规避该问题，ReSample [48] 的作者依赖在反向扩散过程中通过优化与重采样强制硬数据一致性；PSLD [42] 引入附加目标项以确保所有梯度更新指向隐空间中同一最优点；FlowChef [39] 在推理时把引导纳入流轨迹；FlowDPS [26] 把更新步拆分为干净图像估计与噪声估计两部分。相反，FLAIR 属于另一类后验采样方法：通过直接优化近似数据后验的变分目标，把扩散先验与逆问题结合 [34]。该框架最近被 RSD [62] 扩展——后者引入斥力机制以促进样本多样性，并被应用到隐扩散模型。这类优化的已知问题是**模式坍缩** [40]，导致此类方法输出模糊；我们的方法通过引入确定性轨迹调整来针对该问题。

## 3. 背景

### 3.1 逆问题

在补全（inpainting）[5]、超分辨率 [38] 或断层重建 [47] 等许多成像任务中，目标是从失真观测 \(\mathbf y\in\mathbb R^m\) 恢复目标信号 \(\mathbf x\in\mathbb R^n\)。观测被视为把前向算子 \(\mathbf A:\mathbb R^n\mapsto\mathbb R^m\) 作用于目标信号、并被标准差为 \(\sigma_\nu\) 的加性高斯噪声 \(\boldsymbol\nu\in\mathbb R^m\) 污染的结果：

$$
\mathbf y=\mathbf A\mathbf x+\boldsymbol\nu.\tag{1}
$$

多数实际应用中，前向算子 \(\mathbf A\) 或不可逆、或严重病态，故 (1) 一般是不适定的。

变分方法通过最小化能量泛函

$$
\mathcal E(\mathbf x,\mathbf y)=\mathcal D(\mathbf x,\mathbf y)+\mathcal R(\mathbf x)\tag{2}
$$

来恢复解。按 Bayes 定理解释，后验分布 \(p(\mathbf x|\mathbf y)\) 正比于 \(p(\mathbf y|\mathbf x)p(\mathbf x)\)；在负对数域中即得数据项 \(\mathcal D(\mathbf x,\mathbf y)=-\log p(\mathbf y|\mathbf x)\) 与正则项 \(\mathcal R(\mathbf x)=-\log p(\mathbf x)\)。基于稀疏性 [44, 45, 10, 13, 9] 等正则性假设的手工先验长期是标准做法，但已在现代数据驱动方案中基本被基于深度学习的方法取代。

### 3.2 基于流的先验

基于流匹配 [31] 的模型学习含时向量场 \(v_\theta(\mathbf x_t,t)\)，把样本从简单初始分布 \(p_1(\mathbf x)\) 连续变换为复杂目标数据分布 \(p_0(\mathbf x)\)。形式上，该变换通过求解如下常微分方程（ODE）描述：

$$
\frac{{\rm d}}{{\rm d}t}\psi_t(\mathbf x)=v_{\theta,t}(\psi_t(\mathbf x)),\qquad t\in[0,1],\tag{3}
$$

其中 \(\psi_t(\mathbf x)\) 表示样本轨迹，从 \(t=1\) 处抽取的初值平滑演化到 \(t=0\) 处的目标值。

由于积分 ODE 路径把简单分布 \(p_1(\mathbf x)\) 映射为复杂目标 \(p_0(\mathbf x)\)，所学基于流的模型捕捉了数据结构，因而可作为求解逆问题的强力先验。为使该思路对高分辨率数据可行，我们采用隐扩散模型（latent diffusion model，LDM）框架 [41]：用预训练自编码器把生成过程移到低维隐空间，编码器 \(E:\mathbb R^n\mapsto\mathbb R^d\)、解码器 \(D:\mathbb R^d\mapsto\mathbb R^n\)，\(d\ll n\)。然而把此类先验用于逆问题会带来挑战：VAE 的非线性破坏了测量与目标信号之间的线性关系，使前向算子变为非线性。

### 3.3 变分流采样

为从 Bayes 视角求解逆问题，我们的目标是从后验

$$
p(\mathbf x_0|\mathbf y)\propto p(\mathbf y|\mathbf x_0)p(\mathbf x_0)\tag{4}
$$

中采样，其中似然为 \(p(\mathbf y|\mathbf x_0)=\mathcal N(\mathbf A\mathbf x_0,\sigma^2\mathbf I_d)\)，\(p(\mathbf x_0)\) 表示由基于流的生成模型建模的先验。

受既有工作 [34, 62] 启发，我们引入变分分布 \(q(\mathbf x_0|\mathbf y)=\mathcal N(\boldsymbol\mu_x,\sigma_x^2)\) 以最小化其与真实后验 \(p(\mathbf x_0|\mathbf y)\) 的 KL 散度来逼近后验：

$$
q(\mathbf x_0|\mathbf y)\in\arg\min_{q(\mathbf x_0|\mathbf y)}{\rm KL}\left(q(\mathbf x_0|\mathbf y)\|p(\mathbf x_0|\mathbf y)\right).\tag{5}
$$

借助变分下界重写该 KL 散度可得：

$$
{\rm KL}\left(q(\mathbf x_0|\mathbf y)\|p(\mathbf x_0|\mathbf y)\right)=\underbrace{-\mathbb E_{q(\mathbf x_0|\mathbf y)}\left[\log p(\mathbf y|\mathbf x_0)\right]}_{\mathcal D(\mathbf x,\mathbf y)}+\underbrace{{\rm KL}\left(q(\mathbf x_0|\mathbf y)\|p(\mathbf x_0)\right)}_{\mathcal R(\mathbf x)}+\underbrace{\log p(\mathbf y)}_{\rm const}.\tag{6}
$$

由于单个高斯无法刻画多峰后验，我们简化为确定性近似，令 \(\sigma_x^2=0\)；这等价于 Stein 变分方法 [32] 意义上的单粒子近似。如 [51] 所示，在该近似下重写式 (6) 并推广到含时含噪后验，可得

$$
\arg\min_{q(\mathbf x_0|\mathbf y)}\underbrace{\mathbb E_{q(\mathbf x_0|\mathbf y)}\left[\frac{\|\mathbf y-f(\boldsymbol\mu_x)\|_2^2}{2\sigma_\nu^2}\right]}_{\mathcal D(\mathbf x,\mathbf y)}+\underbrace{\int_0^T\omega(t)\mathbb E_{q(\mathbf x_t|\mathbf y)}\left[\left\|\nabla_{\mathbf x}\log q(\mathbf x_t|\mathbf y)-\nabla_{\mathbf x}\log p(\mathbf x_t)\right\|^2\right]{\rm d}t}_{\mathcal R(\mathbf x)}.\tag{7}
$$

式 (7) 第一项描述数据项 \(\mathcal D(\mathbf x,\mathbf y)\)，第二项描述正则项 \(\mathcal R(\mathbf x)\)，其中积分保证在整个扩散轨迹上优化。值得注意的是，后者构成加权分数匹配目标，\(\nabla_{\mathbf x}\log p(\mathbf x_t)\) 表示分数函数 [52]，可从预训练的扩散或流模型中提取。含噪变分分布的分数取决于前向扩散过程，可解析计算。注意当 \(\omega(t)=\beta(t)/2\) 时，加权分数匹配损失恢复扩散模型证据下界（ELBO）的梯度，故优化它得到数据分布的最大似然估计 [51]。然而优化式 (7) 代价较高，因为需要通过流模型计算梯度；如 [54] 所示，可把正则项改写为 Wasserstein 梯度流来规避：

$$
\nabla_{\boldsymbol\mu_x}\mathcal R(\mathbf x)=\mathbb E_{t,q(\mathbf x_t|\mathbf y)}\left[\omega(t)\left(\underbrace{\nabla_{\mathbf x}\log q(\mathbf x_t|\mathbf y)}_{\text{含噪变分分布的分数}}-\underbrace{\nabla_{\mathbf x}\log p(\mathbf x_t)}_{\text{含噪先验分布的分数}}\right)\right].\tag{8}
$$

注意测试时只优化正则项、不含数据项，等价于分数蒸馏采样（Score Distillation Sampling，SDS）[40] 的目标。

## 4. 方法

**流表述。** 式 (7) 的变分表述针对分数建立，但也可改写为去噪或 \(\boldsymbol\epsilon_\theta\) 参数化 [52, 34]。然而我们关心的是依赖速度场 \(v_\theta(\mathbf x_t,t)\) 的变分目标，因为该速度场刻画了连接噪声分布与数据分布的概率轨迹。

**命题 1。** 我们把标准变分目标中基于分数的正则项替换为流匹配表述，得到如下目标函数：

$$
\arg\min_{q(\mathbf x_0|\mathbf y)}\underbrace{\mathbb E_{q(\mathbf x_0|\mathbf y)}\left[\frac{\|\mathbf y-f(\boldsymbol\mu_x)\|_2^2}{2\sigma_\nu^2}\right]}_{\mathcal D(\mathbf x,\mathbf y)}+\underbrace{\int_0^T\lambda_R(t)\mathbb E_{q(\mathbf x_t|\mathbf y)}\left[\left\|v_\theta(\mathbf x_t,t)-u_t(\mathbf x_t|\boldsymbol\epsilon)\right\|^2\right]{\rm d}t}_{\mathcal R(\mathbf x)},\tag{9}
$$

$$
\nabla_{\boldsymbol\mu_x}\mathcal R(\mathbf x)=\mathbb E_{t,q(\mathbf x_t|\mathbf y)}\left[\lambda_R(t)v_\theta(\mathbf x_t,t)-u_t(\mathbf x_t|\boldsymbol\epsilon)\right].\tag{10}
$$

定义正则项的流匹配项来自把变分分布重参数化为 \(q(\mathbf x_t|\mathbf y)=\mathcal N\left((1-t)\boldsymbol\mu_x,t^2\mathbf I\right)\)，对应确定性映射 \(\psi_t(\mathbf x_0|\boldsymbol\epsilon)=(1-t)\mathbf x_0+t\boldsymbol\epsilon\)（\(\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)\)）采样。把分数用目标速度场 \(u_t\) 重写可得

$$
\nabla_{\mathbf x}\log q(\mathbf x_t|\mathbf y)=-\frac{(1-t)u_t(\mathbf x_t|\boldsymbol\epsilon)+\mathbf x_t}{t}.\tag{11}
$$

对学习到的速度 \(v_\theta(\mathbf x_t,t)\) 有类似近似（完整推导见补充材料 A.3 节）：

$$
v_\theta(\mathbf x_t,t)\approx-\frac{t\nabla_{\mathbf x}\log p(\mathbf x_t)-\mathbf x_t}{1-t}.\tag{12}
$$

因此可用学习到的速度场近似含噪先验的分数：

$$
\nabla_{\mathbf x}\log p(\mathbf x_t)\approx-\frac{(1-t)v_\theta(\mathbf x_t,t)+\mathbf x_t}{t}.\tag{13}
$$

**硬数据一致性。** 既有变分后验采样方法 [34, 62] 对数据保真项 \(\mathcal D(\mathbf x,\mathbf y)\) 施加软约束；相反，近期工作 [48] 表明，在从隐扩散模型采样时，强制硬数据一致性通常带来更好的重建与更高的视觉保真度。我们的方法共享该动机，但不同之处在于我们对变分分布做优化，即计算 \(\min\mathbb E_{q(\mathbf x_0|\mathbf y)}[-\log p(\mathbf y|\mathbf x_0)]\)。该变分设定还有一个额外优势：可用基于伴随的初始化 \(\boldsymbol\mu_x=E(\mathbf A^\top\mathbf y)\) 初始化优化变量，其中 \(E\) 为 VAE 编码器、\(\mathbf A^\top\) 为像素空间线性前向算子的伴随；其他初始化策略也可行。

**精度校准。** 由于框架在每个时间步评估轨迹，我们希望按正则项贡献的可靠性加权。已有研究表明预测任务的难度取决于网络参数化以及具体时间步 \(t\) [22]。由于本方法中的正则项 \(\mathcal R(\mathbf x)\) 等价于预训练流模型的训练目标，可方便地用期望模型误差为其加权，而该误差可在少量图像上校准。具体地，采样 \(N\) 张校准图像，计算其在 0 到 1 之间 100 个线性等距时间步上的条件流匹配目标，再对所有图像取平均得到各时间步的期望模型误差。模型误差的不同函数都可选作正则权重，我们选择

$$
\lambda_R(t)=\frac{1}{N}\left(\sum_{i=1}^{N}\left\|v_\theta(\mathbf x_t^{(i)},t)-u_t(\mathbf x_t^{(i)}|\boldsymbol\epsilon)\right\|^2\right)^{-1},\tag{14}
$$

并对所有 \(t<0.2\) 设 \(\lambda_R(t)=0\)，因为 SD3 在低噪声水平下精度显著退化。

**确定性轨迹调整。** 分数蒸馏采样依赖如下假设：\(\mathbf x_t=(1-t)\boldsymbol\mu_x+t\boldsymbol\epsilon\) 位于所学先验支撑/密度合理较高的区域。实践中并非总是如此：在未被紧密条件化时（通常需要大量文本提示），即使最好的扩散模型也会对隐空间中许多看似合理的区域赋予低密度，从而导致糟糕的梯度步。因此我们通过额外以估计的"端点" \(\boldsymbol\mu\) 为 \(\mathbf x_t\) 的条件，来提高 \(p(\mathbf x_t)\)。

**命题 2。** 我们引入重参数化变分分布，其均值在后验均值 \(\boldsymbol\mu_x\) 与模型引导的 \(\hat{\mathbf x}_1\) 之间线性插值：

$$
q(\mathbf x_t|\mathbf y)=\mathcal N\left((1-t)\boldsymbol\mu_x+t\alpha\hat{\mathbf x}_1,\ t^2(1-\alpha^2)\mathbf I\right),\tag{15}
$$

其中 \(\hat{\mathbf x}_1=\mathbf x_{t+\delta t}+(1-t-\delta t)v_\theta(\mathbf x_{t+\delta t},t+\delta t)\) 为基于单步速度的预测器，\(\alpha\in[0,1]\) 控制确定性引导与随机噪声之间的权衡。该重参数化诱导如下参考速度场：

$$
u_t(\mathbf x_t|\boldsymbol\epsilon)=\frac{\alpha\hat{\mathbf x}_1+\sqrt{1-\alpha^2}\boldsymbol\epsilon-\mathbf x_t}{1-t}.\tag{16}
$$

直观上，如此改变形式可确保模型把样本重新定位到学习流形上的期望位置，而不是注入可能把样本推向先验似然高但与观测不一致方向的任意噪声。为进一步鼓励探索、避免坍缩到伴随测量的轨迹上，我们在该过程中额外注入随机分量 \(\boldsymbol\epsilon\)。完整推导见补充材料 A.3 节。

### 4.1 算法

下面伪代码汇总整合了上述所有组件的方法。我们沿用 [34, 62] 的标准方案，按降序线性遍历时间并在 \(t=0.2\) 处停止（如第 4 节所述），取 \(\alpha=1-t\)；硬数据一致性通过随机梯度下降施加梯度更新。更多实现细节与消融见补充材料 A.4 节。

**算法 1：面向逆成像问题的 FLAIR 求解器**

- 输入：\(\boldsymbol\mu_x=\boldsymbol\mu_{\rm init}\)、\(\lambda_R\)、\(\alpha\)、\(\mathbf y\)、\(\mathbf A\)、\(v_\theta\)；输出：\(\boldsymbol\mu_x\)。
1. \(\hat{\boldsymbol\epsilon}\sim\mathcal N(\mathbf 0,\mathbf I)\)（初始噪声样本）。
2. 对 \(t\leftarrow1\) 到 \(0\)（步长 \(-\Delta t\)）：
3. \(\mathbf x_t\leftarrow(1-t)\boldsymbol\mu_x+t\hat{\boldsymbol\epsilon}\)（采样含噪隐变量）。
4. \(u_t(\mathbf x_t|\hat{\boldsymbol\epsilon})\leftarrow\frac{\hat{\boldsymbol\epsilon}-\mathbf x_t}{1-t}\)。
5. \(\nabla_{\boldsymbol\mu_x}\mathcal R\leftarrow v_\theta(\mathbf x_t,t)-u_t(\mathbf x_t|\hat{\boldsymbol\epsilon})\)。
6. \(\boldsymbol\mu_x\leftarrow\boldsymbol\mu_x-\lambda_R\nabla_{\boldsymbol\mu_x}\mathcal R\)（按正则项更新）。
7. \(\boldsymbol\mu_x\leftarrow\arg\min_{\boldsymbol\mu_x}\|\mathbf y-\mathbf A(\boldsymbol\mu_x)\|_2\)（硬数据一致性）。
8. \(\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)\)。
9. \(\hat{\mathbf x}_1\leftarrow\mathbf x_t+(1-t)v_\theta(\mathbf x_t,t)\)（预测确定性噪声）。
10. \(\hat{\boldsymbol\epsilon}\leftarrow\alpha\hat{\mathbf x}_1+\sqrt{1-\alpha^2}\boldsymbol\epsilon\)（更新噪声估计）。

## 5. 实验

### 5.1 设置

我们在多种逆成像任务上评估 FLAIR 的性能，并与若干基线比较，使用未做任何微调的 SD3 主干。我们采用 SSIM [55]、LPIPS [59] 与分块 FID [16]（pFID）等指标全面评估重建的感知与定量质量；FID 使用 InceptionV3 特征在 256×256 分辨率的分块上计算。所有实验在一块 24 GB 显存的 NVIDIA RTX 4090 GPU 上完成。为完整性我们也报告 PSNR，但指出该指标不适合本文目的：PSNR 偏好后验均值，而变分方法的目标是从后验分布采样，因此 PSNR 已知偏好过平滑、模糊的输出而非清晰输出 [6]。为证明本模型也能给出准确的 MMSE 估计，我们通过运行后验采样 8 次并平均做集成预测；如补充材料 A.11 节所示，集成提升 PSNR 同时降低 LPIPS，这证实我们的样本分布在真正后验均值周围，也说明更接近后验均值的结果（如基线方法）在感知上反而比我们的样本离真值更远（LPIPS 更高）。

**数据集。** 我们使用两个高分辨率图像数据集：FFHQ [23] 与 DIV2K [2]。FFHQ 含 7 万张 1024×1024 的多样人脸图像，我们取前 1,000 张，覆盖年龄、姿态、光照与族裔变化；DIV2K 含 800 张 2K 分辨率高质量图像，涵盖多种纹理与结构的自然场景。

**基线。** 本方法与若干近期基于后验采样的逆成像求解器比较：ReSample [48]、FlowDPS [26]、FlowChef [39] 与 RSD [62]。后者不使用斥力项，因为其效果更好。为保证公平且有意义的比较，所有方法在相同函数评估次数下评估。

**问题设定。** 所有方法在固定输出分辨率 768×768 像素下运行与评估。单图超分辨率考虑 8× 与 12× 缩放因子，相应低分辨率输入由双三次下采样生成；运动模糊用尺寸 61 的模糊核模拟；箱式补全掩蔽覆盖约三分之一观测的大块连续矩形。所有合成观测都加性高斯噪声污染（\(\sigma_\nu=0.5\%\)）。FFHQ 推断使用形如 "A high quality photo of a face" 的预定义文本提示；DIV2K 使用 "A high quality photo of" 拼接由 DAPE [56] 作用于观测检索得到的图像特定描述。

**逆问题。** 实验清楚表明 FLAIR 在所有感知指标上都优于现有基于流的方法（见表 1）。在图像补全中，本方法产生高质量重建，充分利用生成模型的能力并自然融入周边上下文，避免在基线中观察到的退化与伪影——特别地，FlowDPS 倾向在补全区域产生不合理纹理，而 FlowChef 经常无法生成语义一致的图像。对单图超分辨率，FLAIR 持续给出感知上最有说服力、最真实的结果；值得注意的是，8× 与 12× 放大下 FID 都保持较低，说明有效利用生成先验克服了日益严重的不适定性。运动去模糊中，FLAIR 也恢复出比竞争方法更锐利、语义更可信的内容，而后者常存在残余模糊或不一致细节；重建质量的提升在定量上由所有指标反映。更多定性示例见补充材料 A.13 节。

**表 1（原文 Table 1）：50 NFE、\(\sigma_\nu=0.5\%\) 下的定量结果**

| 方法 | SR ×8 LPIPS↓ | SR ×8 FID↓ | SR ×8 SSIM↑ | SR ×8 PSNR↑ | SR ×12 LPIPS↓ | SR ×12 FID↓ | SR ×12 SSIM↑ | SR ×12 PSNR↑ | 运动去模糊 LPIPS↓ | 运动去模糊 FID↓ | 运动去模糊 SSIM↑ | 运动去模糊 PSNR↑ | 补全 LPIPS↓ | 补全 FID↓ | 补全 SSIM↑ | 补全 PSNR↑ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FFHQ 768×768 | | | | | | | | | | | | | | | | |
| ReSample | 0.400 | 55.6 | 0.815 | 26.37 | 0.474 | 80.3 | 0.786 | 25.47 | 0.457 | 82.9 | 0.788 | 25.45 | 0.366 | 70.8 | 0.827 | 21.83 |
| FlowDPS | 0.374 | 38.5 | 0.756 | 29.24 | 0.413 | 44.0 | 0.741 | 28.05 | 0.431 | 54.3 | 0.732 | 27.64 | 0.344 | 42.5 | 0.771 | 19.19 |
| RSD | 0.391 | 51.7 | 0.776 | 29.69 | 0.462 | 71.7 | 0.743 | 28.11 | 0.458 | 77.3 | 0.743 | 27.67 | 0.478 | 73.3 | 0.736 | 21.97 |
| FlowChef | 0.341 | 30.5 | 0.760 | 28.42 | 0.373 | 46.5 | 0.730 | 27.00 | 0.406 | 40.2 | 0.716 | 25.81 | 0.394 | 69.8 | 0.780 | 18.18 |
| **Ours** | **0.213** | **13.3** | 0.777 | 29.54 | **0.271** | **16.2** | 0.740 | 27.71 | **0.236** | **10.7** | 0.772 | **29.61** | **0.184** | **8.7** | 0.828 | **23.69** |
| DIV2K 768×768 | | | | | | | | | | | | | | | | |
| ReSample | 0.533 | 55.0 | 0.625 | 22.34 | 0.643 | 88.1 | 0.562 | 20.85 | 0.556 | 79.7 | 0.617 | 21.79 | 0.285 | 51.9 | 0.796 | 22.68 |
| FlowDPS | 0.476 | 44.4 | 0.567 | 23.01 | 0.547 | 54.0 | 0.528 | 21.79 | 0.558 | 65.5 | 0.536 | 21.88 | 0.328 | 29.2 | 0.692 | 21.71 |
| RSD | 0.539 | 60.9 | 0.591 | 23.45 | 0.684 | 95.7 | 0.523 | 21.96 | 0.638 | 97.6 | 0.551 | 22.10 | 0.464 | 63.9 | 0.678 | 23.23 |
| FlowChef | 0.490 | 36.5 | 0.539 | 21.84 | 0.525 | 43.8 | 0.492 | 20.52 | 0.561 | 49.6 | 0.486 | 19.90 | 0.489 | 58.3 | 0.659 | 20.87 |
| **Ours** | **0.353** | **26.5** | **0.607** | 23.30 | **0.421** | **32.1** | **0.525** | 21.39 | **0.315** | **21.1** | **0.653** | **24.44** | **0.163** | **11.0** | **0.815** | **23.75** |

### 5.2 实验结果

**后验方差。** 为证明 FLAIR 不受模式坍缩影响，我们对 ×12 超分辨率任务评估后验方差 \({\rm Var}[\mathbf x|\mathbf y]\)：对固定观测 \(\mathbf y\) 抽取 32 个样本并计算其逐像素方差。我们对 FLAIR、带斥力项的 RSD 与 FlowDPS [26] 做该实验。图 3 的例子表明 FLAIR 具有最高的样本多样性，相应方差图也反映了这一点；值得注意的是，样本方差集中在高频纹理区域，说明本方法可靠地重建了后验——在超分辨率设定中其后验的低频部分被似然项紧密约束。

**编辑。** 除图像恢复外，我们观察到本方法在基于文本的图像编辑上也表现极好：只需在补全时给出合适的目标提示。图 4 展示了由同一张照片生成的各种编辑图像。

**像素空间实验。** 我们还用 [33] 的模型（在缩放至 256×256 的 CelebA-HQ 上训练）在像素空间实现 FLAIR，并与 DDNM [53]、DPS [11]、Moment Matching [43] 与 ΠGDM [50] 比较；所有基线的超参数均已调优（见补充材料 A.9 节）。如表 2 所示，本方法在像素空间同样优于既有工作，显示更广泛的适用性。

**表 2（原文 Table 2）：50 NFE、\(\sigma_\nu=0.5\%\) 下的定量结果——补全与超分辨率（×8）**

| 方法 | 补全 LPIPS↓ | 补全 FID↓ | 补全 SSIM↑ | 补全 PSNR↑ | SR ×8 LPIPS↓ | SR ×8 FID↓ | SR ×8 SSIM↑ | SR ×8 PSNR↑ |
|---|---|---|---|---|---|---|---|---|
| DDNM | 0.158 ± 0.042 | 26.9 | 0.732 ± 0.037 | 18.31 ± 2.94 | 0.199 ± 0.052 | 31.9 | 0.635 ± 0.079 | 23.59 ± 1.64 |
| DPS | 0.195 ± 0.064 | 30.2 | 0.689 ± 0.077 | 20.49 ± 2.81 | 0.172 ± 0.058 | 27.8 | 0.658 ± 0.088 | 24.59 ± 2.04 |
| MM | 0.161 ± 0.054 | 28.8 | 0.728 ± 0.062 | 20.59 ± 3.37 | 0.172 ± 0.051 | 29.1 | 0.669 ± 0.083 | 24.65 ± 1.97 |
| ΠGDM | 0.195 ± 0.064 | 30.2 | 0.689 ± 0.077 | 20.49 ± 2.81 | 0.157 ± 0.052 | 26.5 | 0.677 ± 0.084 | 24.98 ± 2.07 |
| **FLAIR** | **0.097 ± 0.035** | **14.2** | **0.831 ± 0.031** | **21.87 ± 2.66** | **0.143 ± 0.039** | **22.9** | **0.712 ± 0.076** | **25.93 ± 1.96** |

### 5.3 消融研究

我们系统分析本方法关键设计选择的影响：在 ×12 超分辨率上消融确定性轨迹调整、硬数据一致性的使用以及正则权重的校准，使用 FFHQ 与 DIV2K 各 100 个样本的子集；定量与定性结果分别见表 3 与图 6。

**硬数据一致性（HDC）。** 去掉硬数据一致性会同时使两个指标变差，其中 PSNR 受较大影响——因其与输入观测的对齐变差；视觉示例中也很明显：重建看似合理但偏离观测。

**确定性轨迹调整（DTA）。** 相比完整设置最大的性能下降出现在去掉确定性轨迹调整时，因为随机噪声采样会损害先验低密度区域的梯度更新，重建显得过于平滑。

**校准正则权重（CRW）。** 用 \(\lambda_R(t)=t\) 替代校准权重同样显著影响感知质量：若忽略正则项沿流轨迹准确性的变化，结果会明显模糊。

**表 3（原文 Table 3）：×12 超分辨率在 DIV2K 与 FFHQ 上的消融研究（模型组件逐一开启或关闭）**

| HDC | DTA | CRW | FFHQ LPIPS↓ | FFHQ PSNR↑ | DIV2K LPIPS↓ | DIV2K PSNR↑ |
|---|---|---|---|---|---|---|
| ✓ | ✓ | ✓ | **0.259** | 27.45 | **0.427** | 21.05 |
| ✗ | ✓ | ✓ | 0.297 | 27.17 | 0.467 | 20.82 |
| ✓ | ✗ | ✓ | 0.432 | 27.20 | 0.622 | 21.69 |
| ✓ | ✓ | ✗ | 0.363 | **28.58** | 0.583 | 21.98 |
| ✗ | ✗ | ✗ | 0.392 | 28.33 | 0.605 | **21.99** |

图例：HDC——硬数据一致性；DTA——确定性轨迹调整；CRW——校准正则权重。✓ 表示包含，✗ 表示消融。

## 6. 结论与局限

我们提出了 FLAIR——一种无需训练、以基于流的生成模型为图像先验的逆问题变分框架。通过把（隐）基于流模型的能力与有原则的后验分布重建相结合，FLAIR 解决了现有方法的关键局限。第一，它以确定性噪声向量辅助与退化无关的流匹配损失，从而把生成导向与观测匹配的图像。第二，它把数据一致性约束与正则化解耦，并按正则项的期望精度（离线校准）自适应重加权，从而在不牺牲样本多样性的前提下实现硬数据一致性。在不同图像数据集与任务上的实验证实，FLAIR 持续取得比基于流匹配或去噪扩散的现有基线更高的重建质量；值得注意的是，本方法同时实现出色的感知质量、对输入观测的紧密贴合以及高样本多样性。

显然，FLAIR 继承了底层生成模型的局限，包括训练数据选择带来的偏差、输出分辨率的约束，以及恢复分布外模态的能力有限；此外本方法引入了控制确定性轨迹调整的额外超参数。我们注意到，高保真图像恢复方法可能被滥用于不道德的图像操纵。

**致谢。** 本工作部分受 Max Planck ETH Center for Learning Systems 与 Huawei Technologies Oy (Finland) Co. Ltd. 资助。

**图 1（原文 Figure 1）：** 从基于伴随的初始化出发，我们在 (i) 通过流匹配损失（使变分分布的速度 \(u_t\) 与学习到的速度场 \(v_\theta\) 对齐）做正则项更新，与 (ii) 把当前估计投影到观测一致集合上的硬数据一致性步骤之间交替。

**图 2（原文 Figure 2）：** 定性比较。FLAIR 产生感知质量高、同时保持高数据似然的后验样本（建议放大查看；含箱式补全、×12 超分辨率、运动去模糊三类任务）。

**图 3（原文 Figure 3）：** ×12 超分辨率的放大重建。第 1–4 列为 FLAIR、FlowDPS、RSD 的后验样本，第 5、6 列为后验均值与标准差（基于 32 个样本）。

**图 4（原文 Figure 4）：** 编辑后的图像与原图并列展示（提示词形如 "A high resolution portrait of a..."）。

**图 5（原文 Figure 5）：** 定性比较：像素空间的 FLAIR 同样产生高质量后验样本。

**图 6（原文 Figure 6）：** ×12 超分辨率消融研究的定性样本。

## 附录（补充材料）概述

> 说明：原文第 15–18 页为 NeurIPS 论文检查清单（Paper Checklist）与伦理准则页，第 18 页起为补充材料（技术附录 A），含推导、实现细节、统计评估与大量定性结果。因本页为**许可待核**的学习用译稿，附录部分以结构化说明 + 全部表/图图注的方式呈现；附录中的推导式 (17)–(43) 属于 A.3 节（速度—分数关系与变分目标推导）、A.10 节（运行时分析）等处的补充推导，本页标注其位置与作用，完整式子请对照原文 PDF。

**附录结构（与正文引用对应）：**

- **A.1–A.2（补充背景与问题设定）**：补充式 (1)–(2) 的记号与变分能量泛函的概率解释，并给出退化算子族（补全、超分辨率、运动模糊）的像素域前向算子形式。
- **A.3（推导）**：给出式 (11)–(13) 中"含噪变分分布分数 ↔ 目标速度场"关系、以及式 (15)–(16) 确定性轨迹调整后参考速度场的完整推导；对应正文明示的"完整推导见补充材料 A.3 节"。此处包含附录式 (17)–(29)。
- **A.4（实现细节）**：FLAIR 求解器的超参数（时间步数、停止时刻 0.2、\(\alpha=1-t\)、学习率按任务设定）、优化器与 GPU 显存设置；并说明硬数据一致性步骤以 SGD 求解、每步执行一次。
- **A.5–A.8（附加定量结果）**：不同正则加权函数的比较（附录表 1）、与数据特定基线方法的比较（附录表 2）、超分辨率 ×8/×12 的附加结果（附录表 3）、运动去模糊与补全的附加结果（附录表 4）、以及 \(\sigma_\nu=0.5\%\) 设定下补全与 ×8 超分辨率结果（附录表 5）。
- **A.9（基线超参数）**：给出 ReSample、FlowDPS、FlowChef、RSD 以及像素空间基线（DDNM、DPS、Moment Matching、ΠGDM）的超参数设置；含像素空间 FLAIR 的似然权重（0.5 | 32，正则权重 0.4）等。
- **A.10（运行时分析）**：比较 FLAIR 与各基线方法的运行时间与显存占用（附录表 6），说明方法在 NFE=50 下的实际开销。
- **A.11（集成与统计分析）**：报告 8 次采样的集成结果（PSNR 提升、LPIPS 下降），并在 FFHQ 与 DIV2K 上对 ×8 超分辨率、×12 超分辨率、运动模糊与补全做统计评估（附录表 8–15，均值 ± 标准差），以及 FlowDPS 与本方法在 LPIPS 上的配对 t 检验 p 值（附录表 16，全部比较均统计显著）。
- **A.12–A.13（附加可视化）**：附录图 3–8 分别给出 FFHQ 与 DIV2K 上补全、×12 超分辨率、运动去模糊的定性比较；附录图 9 给出 ×12 超分辨率的单个样本及局部放大与标准差图；附录图 10 给出失败案例（DIV2K 与 FFHQ 上的颗粒状结果等）。

**附录表 1–16 图注速览：** 表 1 为 50 NFE、\(\sigma_\nu=0.01\) 下不同加权函数的定量比较；表 2 为与数据特定方法的比较；表 3 为超分辨率（×8 与 ×12）；表 4 为运动去模糊与补全；表 5 为 \(\sigma_\nu=0.5\%\) 下补全与 ×8 超分辨率；表 6 为运行时间与显存占用比较；表 7 为超分辨率（×8、×12）的 PSNR/LPIPS；表 8–15 为 FFHQ/DIV2K 上 ×8 超分辨率、×12 超分辨率、运动模糊、补全的统计评估（均值 ± 标准差）；表 16 为 LPIPS 的配对 t 检验 p 值（FlowDPS vs. 本方法）。

**附录图 1–10 图注速览：** 图 1 为 Flow-Matching 损失随时间 \(t\) 的变化（均值与标准差）；图 2 为像素空间 FLAIR 的定性比较；图 3 为 FFHQ 上的补全结果；图 4 为 FFHQ 上的 ×12 超分辨率结果；图 5 为 FFHQ 上的运动去模糊结果；图 6 为 DIV2K 上的补全结果；图 7 为 DIV2K 上的 ×12 超分辨率结果；图 8 为 DIV2K 上的运动去模糊结果；图 9 为 ×12 超分辨率的单个样本（含局部放大与标准差）；图 10 为 FLAIR 在 DIV2K 与 FFHQ 上的定性失败案例（上排为含颗粒感的结果）。

## 参考文献（英文原书目）

[1] Hemant K Aggarwal, Merry P Mani, and Mathews Jacob. MoDL: Model-based deep learning architecture for inverse problems. IEEE Transactions on Medical Imaging, 38(2):394–405, 2018.

[2] Eirikur Agustsson and Radu Timofte. NTIRE 2017 challenge on single image super-resolution: Dataset and study. In CVPR Workshops, 2017.

[3] Eirikur Agustsson and Radu Timofte. NTIRE 2017 Challenge on Single Image Super-Resolution: Dataset and Study. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR) Workshops, July 2017.

[4] Alexander Becker, Rodrigo Caye Daudt, Nando Metzger, Jan Dirk Wegner, and Konrad Schindler. Neural fields with thermal activations for arbitrary-scale super-resolution. arXiv:2311.17643, 2023.

[5] Marcelo Bertalmio, Guillermo Sapiro, Vincent Caselles, and Coloma Ballester. Image inpainting. In Proceedings of the 27th Annual Conference on Computer Graphics and Interactive Techniques, pages 417–424, 2000.

[6] Yochai Blau and Tomer Michaeli. The perception-distortion tradeoff. In CVPR, 2018.

[7] Ashish Bora, Ajil Jalal, Eric Price, and Alexandros G Dimakis. Compressed sensing using generative models. In ICML, 2017.

[8] Levi Borodenko. motionblur: Generate authentic motion blur kernels and apply them to images. https://github.com/LeviBorodenko/motionblur, 2025. Accessed: 2025-05-19.

[9] Kristian Bredies and Martin Holler. Higher-order total variation approaches and generalisations. Inverse Problems. Topical Review, 36(12):123001, 2020.

[10] Antonin Chambolle and Thomas Pock. A first-order primal-dual algorithm for convex problems with applications to imaging. Journal of Mathematical Imaging and Vision, 40(1):120–145, 2011.

[11] Hyungjin Chung, Jeongsol Kim, Michael T McCann, Marc L Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In ICLR, 2023.

[12] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. NeurIPS, 35, 2022.

[13] Ingrid Daubechies, Michel Defrise, and Christine De Mol. An iterative thresholding algorithm for linear inverse problems with a sparsity constraint. Communications on Pure and Applied Mathematics, 57(11):1413–1457, 2004.

[14] Patrick Esser, Sumith Kulal, Andreas Blattmann, Rahim Entezari, Jonas Müller, Harry Saini, Yam Levi, Dominik Lorenz, Axel Sauer, Frederic Boesel, Dustin Podell, Tim Dockhorn, Zion English, and Robin Rombach. Scaling rectified flow transformers for high-resolution image synthesis. In ICML, 2024.

[15] Kerstin Hammernik, Teresa Klatzer, Erich Kobler, Michael P Recht, Daniel K Sodickson, Thomas Pock, and Florian Knoll. Learning a variational network for reconstruction of accelerated MRI data. Magnetic Resonance in Medicine, 79(6):3055–3071, 2018.

[16] Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter. GANs trained by a two time-scale update rule converge to a local Nash equilibrium. In NeurIPS, 2017.

[17] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. NeurIPS, 2020.

[18] Viren Jain and Sebastian Seung. Natural image denoising with convolutional networks. NeurIPS, 2008.

[19] Yazid Janati, Badr Moufad, Mehdi Abou El Qassime, Alain Oliviero Durmus, Eric Moulines, and Jimmy Olsson. A mixture-based framework for guiding diffusion models. In Forty-second International Conference on Machine Learning, 2025.

[20] Yazid Janati, Badr Moufad, Alain Durmus, Eric Moulines, and Jimmy Olsson. Divide-and-conquer posterior sampling for denoising diffusion priors. Advances in Neural Information Processing Systems, 37:97408–97444, 2024.

[21] Zahra Kadkhodaie and Eero P Simoncelli. Stochastic solutions for linear inverse problems using the prior implicit in a denoiser. In Adv. Neural Information Processing Systems, 2021.

[22] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. In NeurIPS, 2022.

[23] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In CVPR, 2019.

[24] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 4401–4410, 2019.

[25] Bahjat Kawar, Gregory Vaksman, and Michael Elad. SNIPS: Solving noisy inverse problems stochastically. NeurIPS, 34, 2021.

[26] Jeongsol Kim, Bryan Sangwoo Kim, and Jong Chul Ye. FlowDPS: Flow-driven posterior sampling for inverse problems. arXiv:2503.08136, 2025.

[27] Jeongsol Kim, Bryan Sangwoo Kim, and Jong Chul Ye. FlowDPS: Flow-driven posterior sampling for inverse problems. https://github.com/FlowDPS-Inverse/FlowDPS, 2025. Accessed: 2025-05-19.

[28] Florian Knoll, Jure Zbontar, Anuroop Sriram, Matthew J. Muckley, Mary Bruno, Aaron Defazio, Marc Parente, Krzysztof J. Geras, Joe Katsnelson, Hersh Chandarana, Zizhao Zhang, Michal Drozdzal, Adriana Romero, Michael Rabbat, Pascal Vincent, James Pinkerton, Duo Wang, Nafissa Yakubova, Erich Reinhardt, C. Lawrence Zitnick, Michael P. Recht, Daniel K. Sodickson, and Yvonne W. Lui. fastMRI: A publicly available raw k-space and DICOM dataset of knee images for accelerated MR image reconstruction learning. Radiology: Artificial Intelligence, 2(1):e190007, 2020.

[29] Erich Kobler, Alexander Effland, Karl Kunisch, and Thomas Pock. Total deep variation: A stable regularization method for inverse problems. IEEE Transactions on Pattern Analysis and Machine Intelligence, 2021.

[30] Christian Ledig, Lucas Theis, Ferenc Huszár, Jose Caballero, Andrew Cunningham, Alejandro Acosta, Andrew Aitken, Alykhan Tejani, Johannes Totz, Zehan Wang, et al. Photo-realistic single image super-resolution using a generative adversarial network. In CVPR, 2017.

[31] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le. Flow matching for generative modeling. In ICLR, 2023.

[32] Qiang Liu and Dilin Wang. Stein variational gradient descent: A general purpose Bayesian inference algorithm. In NeurIPS, volume 29, pages 2378–2386, 2016.

[33] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. arXiv:2209.03003, 2022.

[34] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In ICLR, 2024.

[35] Badr Moufad, Yazid Janati, Lisa Bedin, Alain Durmus, Randal Douc, Eric Moulines, and Jimmy Olsson. Variational diffusion posterior sampling with midpoint guidance. arXiv preprint arXiv:2410.09945, 2024.

[36] Dominik Narnhofer, Alexander Effland, Erich Kobler, Kerstin Hammernik, Florian Knoll, and Thomas Pock. Bayesian uncertainty estimation of learned variational MRI reconstruction. IEEE Transactions on Medical Imaging, 41(2):279–291, 2022.

[37] Dominik Narnhofer, Kerstin Hammernik, Florian Knoll, and Thomas Pock. Inverse GANs for accelerated MRI reconstruction. In Wavelets and Sparsity XVIII, volume 11138. SPIE, 2019.

[38] Sung Cheol Park, Min Kyu Park, and Moon Gi Kang. Super-resolution image reconstruction: a technical overview. IEEE Signal Processing Magazine, 20(3):21–36, 2003.

[39] Maitreya Patel, Song Wen, Dimitris N. Metaxas, and Yezhou Yang. Steering rectified flow models in the vector field for controlled image generation. arXiv:2412.00100, 2024.

[40] Ben Poole, Ajay Jain, Jonathan T Barron, and Ben Mildenhall. DreamFusion: Text-to-3D using 2D diffusion. In ICLR, 2023.

[41] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In CVPR, 2022.

[42] Litu Rout, Negin Raoof, Giannis Daras, Constantine Caramanis, Alex Dimakis, and Sanjay Shakkottai. Solving linear inverse problems provably via posterior sampling with latent diffusion models. In NeurIPS, 2023.

[43] François Rozet, Gérôme Andry, François Lanusse, and Gilles Louppe. Learning diffusion priors from observations by expectation maximization, 2024.

[44] Leonid I Rudin, Stanley Osher, and Emad Fatemi. Nonlinear total variation based noise removal algorithms. Physica D: Nonlinear Phenomena, 60(1–4):259–268, 1992.

[45] Sylvain Sardy, Paul Tseng, and Andrew Bruce. Robust wavelet denoising. IEEE Transactions on Signal Processing, 49(6):1146–1152, 2001.

[46] Viraj Shah and Chinmay Hegde. Solving linear inverse problems using GAN priors: An algorithm with provable guarantees. In ICASSP, 2018.

[47] Emil Y Sidky and Xiaochuan Pan. Image reconstruction in circular cone-beam computed tomography by constrained, total-variation minimization. Physics in Medicine & Biology, 53(17):4777, 2008.

[48] Bowen Song, Soo Min Kwon, Zecheng Zhang, Xinyu Hu, Qing Qu, and Liyue Shen. Solving inverse problems with latent diffusion models via hard data consistency. In ICLR, 2024.

[49] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. In ICLR, 2021.

[50] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In ICLR, 2023.

[51] Yang Song, Conor Durkan, Iain Murray, and Stefano Ermon. Maximum likelihood training of score-based diffusion models. NeurIPS, 34, 2021.

[52] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In ICLR, 2021.

[53] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. ICLR, 2023.

[54] Zhengyi Wang, Cheng Lu, Yikai Wang, Fan Bao, Chongxuan Li, Hang Su, and Jun Zhu. ProlificDreamer: High-fidelity and diverse text-to-3D generation with variational score distillation. In NeurIPS, 2023.

[55] Zhou Wang, Alan C Bovik, Hamid R Sheikh, and Eero P Simoncelli. Image quality assessment: from error visibility to structural similarity. IEEE Transactions on Image Processing, 13(4):600–612, 2004.

[56] Rongyuan Wu, Tao Yang, Lingchen Sun, Zhengqiang Zhang, Shuai Li, and Lei Zhang. SeeSR: Towards semantics-aware real-world image super-resolution. In CVPR, pages 25456–25467, June 2024.

[57] Rongyuan Wu, Tao Yang, Lingchen Sun, Zhengqiang Zhang, Shuai Li, and Lei Zhang. SeeSR: Towards semantics-aware real-world image super-resolution. In CVPR, pages 25456–25467, 2024.

[58] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. In Proceedings of the Computer Vision and Pattern Recognition Conference, 2025.

[59] Richard Zhang, Phillip Isola, Alexei A Efros, Eli Shechtman, and Oliver Wang. The unreasonable effectiveness of deep features as a perceptual metric. In CVPR, 2018.

[60] Zixiang Zhao, Haowen Bai, Jiangshe Zhang, Yulun Zhang, Shuang Xu, Zudi Lin, Radu Timofte, and Luc Van Gool. CDDFuse: Correlation-driven dual-branch feature decomposition for multi-modality image fusion. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2023.

[61] Zixiang Zhao, Haowen Bai, Yuanzhi Zhu, Jiangshe Zhang, Shuang Xu, Yulun Zhang, Kai Zhang, Deyu Meng, Radu Timofte, and Luc Van Gool. DDFM: Denoising diffusion model for multi-modality image fusion. In Proceedings of the IEEE/CVF International Conference on Computer Vision, 2023.

[62] Nicolas Zilberstein, Morteza Mardani, and Santiago Segarra. Repulsive latent score distillation for solving inverse problems. In ICLR, 2025.

## 图注与表注

**正文图注：** 图 1–6 的图注已随文置于第 1、5 节相应位置。图 1 展示 FLAIR 的交替迭代流程（正则项更新与硬数据一致性投影）；图 2 为三类任务（箱式补全、×12 超分辨率、运动去模糊）的定性比较；图 3 为 ×12 超分辨率的放大重建与后验方差；图 4 为文本提示编辑结果；图 5 为像素空间 FLAIR 的定性比较；图 6 为消融研究的定性样本。

**正文表注：** 表 1（50 NFE、\(\sigma_\nu=0.5\%\) 下 FFHQ/DIV2K 的 ×8 超分辨率、×12 超分辨率、运动去模糊与补全的定量结果）、表 2（像素空间补全与 ×8 超分辨率的定量结果）、表 3（×12 超分辨率消融研究），均已在本页逐格转写（按原文 PDF 第 7–9 页核对；加粗表示本文方法最优项按原文语义标注）。

**附录图表：** 附录表 1–16 与图 1–10 的图注已在"附录概述"中列出（本页因许可待核仅作结构化说明，未逐格转写附录表格数值；完整数值请对照原文 PDF 第 24–38 页）。

**本页范围与校对状态：** 本页覆盖原文摘要、第 1–6 节全部正文与小节、式 (1)–(16)、命题 1–2、算法 1、表 1–3（逐格转写）、图 1–6 图注、附录 A 的结构化说明（含附录表 1–16 与图 1–10 图注速览）、参考文献 [1]–[62]（英文原条目）。原文附录中的推导式 (17)–(43) 属于补充推导，本页标注其所在小节与作用、未逐式重排；NeurIPS 论文检查清单与伦理准则页按原文结构未作翻译收录（属元数据页）。**许可说明（重要）：** 原文为 NeurIPS 2025 会议论文集版本，再传播许可条款待核验；本页为个人学习用途的中文译稿，**不计入可公开全文统计**，页首与页尾均保留该说明。逐句逐式终校未做；供后续 QA 重点核对：式 (9)–(16) 的变分目标与重参数化、表 1/表 2 的数值（尤其 SR ×8/×12 的 LPIPS 与 FID）、算法 1 的步骤顺序，以及附录 A.3 的推导。

{% endraw %}
