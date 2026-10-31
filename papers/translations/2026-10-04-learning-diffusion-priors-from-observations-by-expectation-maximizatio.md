---
layout: page
title: "用期望最大化从观测中学习扩散先验｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-04-learning-diffusion-priors-from-observations-by-expectation-maximizatio/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6ffe4ab7aea24bbc/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 用期望最大化从观测中学习扩散先验

**原题：** Learning Diffusion Priors from Observations by Expectation Maximization  
**作者：** François Rozet¹、Gérôme Andry¹、François Lanusse²、Gilles Louppe¹。单位：¹ 列日大学（University of Liège）；² 巴黎-萨克雷大学、巴黎西岱大学、CEA、CNRS、AIM（Université Paris-Saclay, Université Paris Cité, CEA, CNRS, AIM）。邮箱：francois.rozet@uliege.be、gandry@uliege.be、francois.lanusse@cnrs.fr、g.louppe@uliege.be。  
**版本：** 会议论文集版本（NeurIPS-2024-learning-diffusion-priors-from-observations-by-expectation-maximization-Paper-Conference.pdf），本地 PDF 36 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。原论文为第 38 届神经信息处理系统大会（NeurIPS 2024）论文。  
**范围与状态：** 全文中文译稿：摘要、第 1—7 节、致谢、参考文献（英文原条目）、附录 A（算法）、B（Tweedie 公式）、C（实验细节）、D（附加图）、E（MMPS 评估）、NeurIPS 论文清单（15 项答案逐项转录，省略官方指南性说明文字）、图 1—19 图注、表 1—5、式（1）—（28）。表 1、表 2、表 4、表 5 已用 PDF 渲染核对，表 3 按原文文本抽取转录；逐句逐式终校未做，不标记为已验收全文。

> **许可与使用说明：** 原文本地为 NeurIPS 2024 会议论文集 PDF；**再传播许可待核验**。本页仅作个人学习用途的中文译稿，不代表已获授权，**不计入可公开全文统计**。若核验后许可不允许再传播，本页应下线或仅保留摘要级介绍。
>
> **译注（术语与原文疑点）：** 原文缩写保留英文：EM/MCEM（expectation-maximization / Monte Carlo EM）、EB（empirical Bayes）、DM（diffusion model）、SDE/ODE、VE-SDE（variance exploding SDE）、DSM（denoising score matching）、DPS、MMPS（moment matching posterior sampling）、CG/GMRES、VJP（vector-Jacobian product）、FID/IS、LPIPS/PSNR/SSIM、fastMRI、CIFAR-10、FFHQ、KL、JAX。**原文疑点/说明（按原文照录并加注）：** ①原文 §4.1 中 "contucted" 为 "conducted" 的拼写错误（按原文语义译出）；②原文 §7 中 "mentionned" 为 "mentioned" 的拼写错误；③原文公式（15）后 $\pi_k(\mathbf x)$ 的定义先写为 $\int q_{\theta_k}(\mathbf x|\mathbf y)p(\mathbf y)\,\mathrm d\mathbf y$，随后在引入测量矩阵 $\mathbf A$ 后改为 $\int q_{\theta_k}(\mathbf x|\mathbf y,\mathbf A)p(\mathbf y,\mathbf A)\,\mathrm d\mathbf y$，两处记号并存，按原文照录；④原文附录 B 的定理 1 写作 $p(\mathbf x_t|\mathbf x)=\mathcal N(\mathbf x_t|\mathbf x,\boldsymbol\Sigma_t)$，而正文式（2）为 $\mathcal N(\mathbf x_t|\alpha_t\mathbf x,\boldsymbol\Sigma_t)$；论文采用 VE-SDE 故 $\alpha_t=1$，两者一致，按原文照录；⑤原文 §5.3 明确说明"不报告 PSNR/SSIM，因为这类指标只对回归任务有意义、会不公平地惩罚真正的生成模型"；⑥原文清单第 3 项（理论假设与证明）答 [NA]，理由是"未提出新理论结果，方法由已有文献支撑"。

## 摘要

扩散模型近来被证明是贝叶斯逆问题的出色先验。然而训练这些模型通常需要大量干净数据，这在某些场景中可能难以获得。本工作提出一种基于**期望最大化（EM）算法**的新方法，仅从**不完整且含噪的观测**中训练扩散模型。与先前工作不同，我们的方法得到的是**真正的扩散模型**（proper diffusion models），这对下游任务至关重要。作为方法的一部分，我们提出并论证了一种针对无条件扩散模型的**改进后验采样方案**。我们给出支持该方法有效性的实证证据。

## 1 引言

许多科学应用可形式化为潜变量模型中的贝叶斯推断：给定由前向过程 $p(\mathbf y|\mathbf x)$ 产生的观测 $\mathbf y\in\mathbb R^M$ 与潜变量 $\mathbf x\in\mathbb R^N$ 上的先验 $p(\mathbf x)$，目标是后验分布 $p(\mathbf x|\mathbf y)\propto p(\mathbf y|\mathbf x)p(\mathbf x)$。显著例子包括引力透镜反演 [1—3]、加速 MRI [4—8]、粒子物理中的解卷积 [9, 10] 与数据同化 [11—14]。在所有这些例子中，仅凭观测 $\mathbf y$ 要么过于不完整、要么噪声过大，无法恢复潜变量 $\mathbf x$；以信息性先验 $p(\mathbf x)$ 形式存在的额外知识对有价值的推断至关重要。

近来扩散模型 [15, 16] 被证明是贝叶斯推断的出色先验，兼具质量与通用性 [17—27]。然而要训练潜变量 $\mathbf x$ 的扩散模型，通常需要大量潜变量实现，而这些按定义不可得或很少可得的——在地球与空间科学中尤其如此，因为所关注的系统只能被浅层探测。

**经验贝叶斯（EB）** 方法 [28—31] 在只有观测 $\mathbf y$ 可用时，为潜变量模型中的先验设定问题提供解决方案。EB 的目标是找到先验模型 $q_\theta(\mathbf x)$ 的参数 $\theta$，使证据分布 $q_\theta(\mathbf y)=\int p(\mathbf y|\mathbf x)q_\theta(\mathbf x)\,\mathrm d\mathbf x$ 最接近观测的经验分布 $p(\mathbf y)$。多年来已有许多 EB 方法，但它们仍局限于低维设定 [32—37] 或简单参数模型 [38, 39]。

本工作中，我们使用扩散模型作为先验 $q_\theta(\mathbf x)$，因为它们在建模高维分布方面属于同类最佳，并能支撑包括贝叶斯推断在内的许多下游任务。这对此前 EB 方法构成挑战，因为后者通常依赖密度 $q_\theta(\mathbf x)$ 或样本 $\mathbf x\sim q_\theta(\mathbf x)$ 对参数 $\theta$ 可微的模型。与之不同，我们提出一种**期望最大化** [40—44] 算法的适配：交替地从后验 $q_\theta(\mathbf x|\mathbf y)$ 生成样本，并在这些样本上训练先验 $q_\theta(\mathbf x)$。作为方法的一部分，我们提出一种针对无条件扩散模型的改进后验采样方案，并从理论与实证两方面加以论证。

## 2 扩散模型

扩散模型（DM）[15, 16]（也称基于分数的生成模型 [45, 46]）的主要目的是从所关注的分布 $p(\mathbf x)$ 中生成合理数据。形式上，沿用 Song 等 [46] 的连续时间表述，来自 $p(\mathbf x)$ 的样本 $\mathbf x\in\mathbb R^N$ 通过如下随机微分方程（SDE）所表达的扩散过程被逐步扰动：

$$
\mathrm d\mathbf x_t=f_t\mathbf x_t\,\mathrm dt+g_t\,\mathrm d\mathbf w_t,\tag{1}
$$

其中 $f_t\in\mathbb R$ 为漂移系数，$g_t\in\mathbb R_+$ 为扩散系数，$\mathbf w_t\in\mathbb R^N$ 表示标准 Wiener 过程，$\mathbf x_t\in\mathbb R^N$ 为时刻 $t\in[0,1]$ 的受扰样本。由于该 SDE 关于 $\mathbf x_t$ 线性，从 $\mathbf x$ 到 $\mathbf x_t$ 的扰动核为高斯，形式为

$$
p(\mathbf x_t|\mathbf x)=\mathcal N(\mathbf x_t|\alpha_t\mathbf x,\boldsymbol\Sigma_t),\tag{2}
$$

其中 $\alpha_t$ 与 $\boldsymbol\Sigma_t=\sigma_t^2\mathbf I$ 由 $f_t$ 与 $g_t$ 导出 [46—49]。关键是，前向 SDE（1）关联一族反向 SDE [46—49]：

$$
\mathrm d\mathbf x_t=\left[f_t\mathbf x_t-\frac{1+\eta^2}{2}g_t^2\nabla_{\mathbf x_t}\log p(\mathbf x_t)\right]\mathrm dt+\eta g_t\,\mathrm d\mathbf w_t,\tag{3}
$$

其中 $\eta\ge0$ 为控制随机性的参数。换言之，我们可以抽取噪声样本 $\mathbf x_1\sim p(\mathbf x_1)\approx\mathcal N(\mathbf 0,\boldsymbol\Sigma_1)$，并通过适当的离散化方案从 $t=1$ 到 $0$ 模拟式（3），逐步去除其中的噪声以获得数据样本 $\mathbf x_0\sim p(\mathbf x_0)\approx p(\mathbf x)$ [16, 45, 46, 49—52]。本工作采用**方差爆炸（VE）SDE** [45]，其 $f_t=0$ 且 $\alpha_t=1$。

实践中式（3）的分数函数 $\nabla_{\mathbf x_t}\log p(\mathbf x_t)$ 未知，但可由经去噪分数匹配 [53, 54] 训练的神经网络近似。针对该任务已提出若干等价的参数化与目标 [16, 45, 46, 50—52]。本工作采用**去噪器参数化** $\mathbf d_\theta(\mathbf x_t,t)$ 及其目标 [51]

$$
\arg\min_\theta\ \mathbb E_{p(\mathbf x)p(t)p(\mathbf x_t|\mathbf x)}\left[\lambda_t\left\|\mathbf d_\theta(\mathbf x_t,t)-\mathbf x\right\|_2^2\right],\tag{4}
$$

其最优去噪器为 $p(\mathbf x|\mathbf x_t)$ 的均值 $\mathbb E[\mathbf x|\mathbf x_t]$。重要的是，$\mathbb E[\mathbf x|\mathbf x_t]$ 通过 Tweedie 公式 [55—58] 与分数函数相联系：

$$
\mathbb E[\mathbf x|\mathbf x_t]=\mathbf x_t+\boldsymbol\Sigma_t\nabla_{\mathbf x_t}\log p(\mathbf x_t),\tag{5}
$$

这允许在式（3）中使用 $\mathbf s_\theta(\mathbf x_t)=\boldsymbol\Sigma_t^{-1}(\mathbf d_\theta(\mathbf x_t,t)-\mathbf x_t)$ 作为分数估计。

## 3 期望最大化

期望最大化（EM）算法 [40—44] 的目标是找到潜变量模型 $q_\theta(\mathbf x,\mathbf y)$ 的参数 $\theta$，以最大化观测 $\mathbf y$ 的对数证据 $\log q_\theta(\mathbf y)$。对观测分布 $p(\mathbf y)$，目标是最大化期望对数证据 [43, 44]，或等价地最小化 $p(\mathbf y)$ 与 $q_\theta(\mathbf y)$ 之间的 Kullback-Leibler（KL）散度。即

$$
\theta^*=\arg\max_\theta\ \mathbb E_{p(\mathbf y)}\left[\log q_\theta(\mathbf y)\right]\tag{6}
$$

$$
=\arg\min_\theta\ \mathrm{KL}\left(p(\mathbf y)\,\|\,q_\theta(\mathbf y)\right).\tag{7}
$$

EM 算法的关键思想是：对任意两组参数 $\theta_a$ 与 $\theta_b$，有

$$
\log\frac{q_{\theta_a}(\mathbf y)}{q_{\theta_b}(\mathbf y)}=\log\frac{q_{\theta_a}(\mathbf x,\mathbf y)}{q_{\theta_b}(\mathbf x,\mathbf y)}+\log\frac{q_{\theta_b}(\mathbf x|\mathbf y)}{q_{\theta_a}(\mathbf x|\mathbf y)}\tag{8}
$$

$$
=\mathbb E_{q_{\theta_b}(\mathbf x|\mathbf y)}\left[\log\frac{q_{\theta_a}(\mathbf x,\mathbf y)}{q_{\theta_b}(\mathbf x,\mathbf y)}\right]+\mathrm{KL}\left(q_{\theta_b}(\mathbf x|\mathbf y)\,\|\,q_{\theta_a}(\mathbf x|\mathbf y)\right)\tag{9}
$$

$$
\ge\mathbb E_{q_{\theta_b}(\mathbf x|\mathbf y)}\left[\log q_{\theta_a}(\mathbf x,\mathbf y)-\log q_{\theta_b}(\mathbf x,\mathbf y)\right].\tag{10}
$$

该不等式对 $p(\mathbf y)$ 取期望后同样成立。因此从任意参数 $\theta_0$ 出发，EM 更新

$$
\theta_{k+1}=\arg\max_\theta\ \mathbb E_{p(\mathbf y)}\mathbb E_{q_{\theta_k}(\mathbf x|\mathbf y)}\left[\log q_\theta(\mathbf x,\mathbf y)-\log q_{\theta_k}(\mathbf x,\mathbf y)\right]\tag{11}
$$

$$
=\arg\max_\theta\ \mathbb E_{p(\mathbf y)}\mathbb E_{q_{\theta_k}(\mathbf x|\mathbf y)}\left[\log q_\theta(\mathbf x,\mathbf y)\right]\tag{12}
$$

产生参数序列 $\theta_k$，使期望对数证据 $\mathbb E_{p(\mathbf y)}[\log q_{\theta_k}(\mathbf y)]$ 单调递增并收敛到局部最优 [42—44]。

当式（12）中的期望难以处理时，许多人提出改用 Monte Carlo 近似 [59—66]，包括 Markov 链 Monte Carlo（MCMC）采样、重要性采样、拒绝采样及其变体 [63—66]。Monte Carlo EM（MCEM）算法的一个或许令人意外的优势是，它们可能克服局部最优陷阱 [60, 61]。关于 MCEM 算法的近期综述见 Ruth [66]。

## 4 方法

尽管文献中很少提及，期望最大化算法是经验贝叶斯问题的一种可能解法：二者目标相同——最小化观测经验分布 $p(\mathbf y)$ 与证据 $q_\theta(\mathbf y)$ 之间的 KL 散度。在经验贝叶斯设定中，前向模型 $p(\mathbf y|\mathbf x)$ 已知，只应优化先验 $q_\theta(\mathbf x)$ 的参数。此时式（12）变为

$$
\theta_{k+1}=\arg\max_\theta\ \mathbb E_{p(\mathbf y)}\mathbb E_{q_{\theta_k}(\mathbf x|\mathbf y)}\left[\log q_\theta(\mathbf x)+\log p(\mathbf y|\mathbf x)\right]\tag{13}
$$

$$
=\arg\max_\theta\ \mathbb E_{p(\mathbf y)}\mathbb E_{q_{\theta_k}(\mathbf x|\mathbf y)}\left[\log q_\theta(\mathbf x)\right]\tag{14}
$$

$$
=\arg\min_\theta\ \mathrm{KL}\left(\pi_k(\mathbf x)\,\|\,q_\theta(\mathbf x)\right)\tag{15}
$$

其中 $\pi_k(\mathbf x)=\int q_{\theta_k}(\mathbf x|\mathbf y)p(\mathbf y)\,\mathrm d\mathbf y$。直观上，$\pi_k(\mathbf x)$ 从而 $q_{\theta_{k+1}}(\mathbf x)$ 会给那些与观测 $\mathbf y\sim p(\mathbf y)$ 一致的潜变量 $\mathbf x$ 分配比 $q_{\theta_k}(\mathbf x)$ 更高的密度。本工作考虑经验贝叶斯问题的一个特例：每个观测 $\mathbf y$ 关联一个测量矩阵 $\mathbf A$，且前向过程取线性高斯形式 $p(\mathbf y|\mathbf x,\mathbf A)=\mathcal N(\mathbf y|\mathbf A\mathbf x,\boldsymbol\Sigma_y)$。该表述允许前向过程对每个观测 $\mathbf y$ 可能不同——例如当传感器的位置或环境变化时，测量矩阵 $\mathbf A$ 也可能随之变化，从而产生成对的经验分布 $(\mathbf y,\mathbf A)\sim p(\mathbf y,\mathbf A)$。于是式（15）中的 $\pi_k(\mathbf x)$ 变为 $\pi_k(\mathbf x)=\int q_{\theta_k}(\mathbf x|\mathbf y,\mathbf A)p(\mathbf y,\mathbf A)\,\mathrm d\mathbf y$。

### 4.1 流程

目标与假设确定后，我们给出通过期望最大化从观测 $\mathbf y$ 学习潜变量 $\mathbf x$ 的扩散模型 $q_\theta(\mathbf x)$ 的方法。思路是把式（15）分解为 (i) 从 $\pi_k(\mathbf x)$ 生成独立同分布样本的数据集，以及 (ii) 训练 $q_{\theta_{k+1}}(\mathbf x)$ 复现该生成数据集。受篇幅限制，算法 1、2、3 见附录 A。

**期望步（E 步）。** 为从 $\pi_k(\mathbf x)$ 抽样，我们先采样一对 $(\mathbf y,\mathbf A)\sim p(\mathbf y,\mathbf A)$，再从后验生成 $\mathbf x\sim q_{\theta_k}(\mathbf x|\mathbf y,\mathbf A)$。与依赖昂贵且难调采样策略的先前 MCEM 算法 [63—66] 不同，使用扩散模型可实现高效且高度并行化的后验采样 [21—23]。然而后验样本的质量对 EM 算法正确收敛至关重要 [63—66]，在这方面我们发现先前的后验采样方法 [21—23, 25, 26] 并不令人满意。因此我们提出一种改进的后验采样方案，称为**矩匹配后验采样（moment matching posterior sampling, MMPS）**，并在 §4.2 中给出与论证。我们在附录 E 中独立于"从观测学习"的语境评估 MMPS。

**最大化步（M 步）。** 我们用去噪网络 $\mathbf d_\theta(\mathbf x_t,t)$ 参数化扩散模型 $q_\theta(\mathbf x)$，并按 §2 所述经去噪分数匹配 [53, 54] 训练。为加速训练，每轮迭代都从上一次参数 $\theta_k$ 开始。

**初始化。** 流程的一个重要部分是初始先验 $q_0(\mathbf x)$。任何初始先验都会收敛到某个局部最优 [42—44]，但有信息的初始先验可减少收敛所需迭代次数。实验中我们取高斯分布 $\mathcal N(\mathbf x|\boldsymbol\mu_x,\boldsymbol\Sigma_x)$ 作为初始先验，并用——你猜对了——期望最大化拟合其均值与协方差。用 EM 拟合高斯分布非常快，因为最大化步可闭式进行，尤其对低秩协方差近似 [67]。

本文未探索的一种替代方案是用预训练扩散模型作为初始先验。预训练可在我们认为与潜变量相似的数据上进行，例如计算机模拟甚至电子游戏；越相似，EM 收敛越快。然而若初始先验 $q_0(\mathbf x)$ 未覆盖观测下本来合理的潜变量，则后续先验 $q_{\theta_k}(\mathbf x)$ 也可能不覆盖这些潜变量。因此对科学应用而言，保守的初始先验更可取。

### 4.2 矩匹配后验采样

要从扩散先验 $q_\theta(\mathbf x)$ 的后验分布 $q_\theta(\mathbf x|\mathbf y)\propto q_\theta(\mathbf x)p(\mathbf y|\mathbf x)$ 采样，我们必须估计后验分数 $\nabla_{\mathbf x_t}\log q_\theta(\mathbf x_t|\mathbf y)$ 并代入反向 SDE（3）。本节提出并论证一种改进的后验分数近似。由于该贡献并不局限于 EM 语境，我们暂时回到 §2 的记号，即先验记为 $p(\mathbf x)$ 而非 $q_\theta(\mathbf x)$。

**扩散后验采样。** 借助 Bayes 规则，后验分数 $\nabla_{\mathbf x_t}\log p(\mathbf x_t|\mathbf y)$ 可分解为两项 [17, 18, 21—25, 46]：

$$
\nabla_{\mathbf x_t}\log p(\mathbf x_t|\mathbf y)=\nabla_{\mathbf x_t}\log p(\mathbf x_t)+\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t).\tag{16}
$$

由于先验分数 $\nabla_{\mathbf x_t}\log p(\mathbf x_t)$ 的估计已可由去噪器 $\mathbf d_\theta(\mathbf x_t,t)$ 获得，剩余任务是估计似然分数 $\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)$。假设测量函数 $\mathcal A$ 可微且前向过程为高斯 $p(\mathbf y|\mathbf x)=\mathcal N(\mathbf y|\mathcal A(\mathbf x),\boldsymbol\Sigma_y)$，Chung 等 [21] 提出近似

$$
p(\mathbf y|\mathbf x_t)=\int p(\mathbf y|\mathbf x)p(\mathbf x|\mathbf x_t)\,\mathrm d\mathbf x\approx\mathcal N(\mathbf y|\mathcal A(\mathbb E[\mathbf x|\mathbf x_t]),\boldsymbol\Sigma_y),\tag{17}
$$

这允许在除 $\mathbf d_\theta(\mathbf x_t,t)\approx\mathbb E[\mathbf x|\mathbf x_t]$ 之外不训练任何网络的情况下估计似然分数 $\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)$。式（17）的动机是：当 $\sigma_t$ 较小时，假定 $p(\mathbf x|\mathbf x_t)$ 窄集中于其均值 $\mathbb E[\mathbf x|\mathbf x_t]$ 附近是合理的。然而当 $\sigma_t$ 不可忽略时，该近似非常粗糙。因此 DPS [21] 不稳定、不能恰当覆盖后验 $p(\mathbf x|\mathbf y)$ 的支撑，且常给出与观测 $\mathbf y$ 不一致的样本 $\mathbf x$ [22—25]。

**矩匹配。** 为解决这些缺陷，后续研究 [22—25] 在估计似然分数时引入协方差 $\mathbb V[\mathbf x|\mathbf x_t]$。具体地，它们考虑在 KL 散度意义上最接近 $p(\mathbf x|\mathbf x_t)$ 的高斯近似 [68]

$$
q(\mathbf x|\mathbf x_t)=\mathcal N(\mathbf x|\mathbb E[\mathbf x|\mathbf x_t],\mathbb V[\mathbf x|\mathbf x_t]),\tag{18}
$$

随后，假设线性高斯前向过程 $p(\mathbf y|\mathbf x)=\mathcal N(\mathbf y|\mathbf A\mathbf x,\boldsymbol\Sigma_y)$，可得 [68]

$$
q(\mathbf y|\mathbf x_t)=\int p(\mathbf y|\mathbf x)q(\mathbf x|\mathbf x_t)\,\mathrm d\mathbf x=\mathcal N\left(\mathbf y\,\middle|\,\mathbf A\mathbb E[\mathbf x|\mathbf x_t],\ \boldsymbol\Sigma_y+\mathbf A\mathbb V[\mathbf x|\mathbf x_t]\mathbf A^\top\right),\tag{19}
$$

从而在假定 $\mathbb V[\mathbf x|\mathbf x_t]$ 对 $\mathbf x_t$ 的导数可忽略的前提下 [24, 25]，似然分数 $\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)$ 可估计为

$$
\nabla_{\mathbf x_t}\log q(\mathbf y|\mathbf x_t)=\nabla_{\mathbf x_t}\mathbb E[\mathbf x|\mathbf x_t]^\top\mathbf A^\top\left(\boldsymbol\Sigma_y+\mathbf A\mathbb V[\mathbf x|\mathbf x_t]\mathbf A^\top\right)^{-1}\left(\mathbf y-\mathbf A\mathbb E[\mathbf x|\mathbf x_t]\right).\tag{20}
$$

即便对 $\mathbb V[\mathbf x|\mathbf x_t]$ 采用简单启发式（如 $\boldsymbol\Sigma_t$ [20] 或 $(\boldsymbol\Sigma_t^{-1}+\boldsymbol\Sigma_x^{-1})^{-1}$ [22, 23]），该适配也能带来比 DPS [21] 显著更稳定的采样与更好的后验覆盖。然而我们发现，在存在**局部协方差**（即 $\mathbf x_t$ 邻域内的协方差）时，启发式会导致后验 $q(\mathbf x_t|\mathbf y)\propto p(\mathbf x_t)q(\mathbf y|\mathbf x_t)$ 过度分散。

**图 1：** 当先验 $p(\mathbf x)$ 位于流形上时，高斯近似 $q(\mathbf x|\mathbf x_t)$ 的后验 $q(\mathbf x_t|\mathbf y)$ 示意；椭圆表示 $q(\mathbf x|\mathbf x_t)$ 的 95% 可信区域。(A) 以 $\boldsymbol\Sigma_t$ 作为 $\mathbb V[\mathbf x|\mathbf x_t]$ 的启发式时，任何均值 $\mathbb E[\mathbf x|\mathbf x_t]$ 接近平面 $\mathbf y=\mathbf A\mathbf x$ 的 $\mathbf x_t$ 都被视为可能；(B) 使用 $\mathbb V[\mathbf x|\mathbf x_t]$ 时可正确剪除更多区域；(C) 供参考的真值 $p(\mathbf x_t|\mathbf y)$ 与 $p(\mathbf x|\mathbf x_t)$。（来源：原文第 5 页。）

**图 2：** 当先验 $p(\mathbf x)$ 位于 $\mathbb R^3$ 中随机生成的 1 维流形上时，不同 $\mathbb V[\mathbf x|\mathbf x_t]$ 启发式下后验 $p(\mathbf x_t|\mathbf y)$ 与 $q(\mathbf x_t|\mathbf y)$ 之间的 Sinkhorn 散度 [69]；折线与阴影表示 64 个随机流形 [71] 与测量矩阵 $\mathbf A\in\mathbb R^{1\times3}$ 上的 25-50-75 分位数。使用真实的 $\mathbb V[\mathbf x|\mathbf x_t]$ 而非启发式可带来数量级更准确的后验 $q(\mathbf x_t|\mathbf y)$。（来源：原文第 5 页。）

我们在图 1 中展示该行为，并在先验 $p(\mathbf x)$ 位于 $\mathbb R^3$ 中随机生成的 1 维流形 [71] 上时，度量后验 $p(\mathbf x_t|\mathbf y)$ 与 $q(\mathbf x_t|\mathbf y)$ 之间的 Sinkhorn 散度 [69, 70]。先验 $p(\mathbf x)$ 建模为以流形上的点为中心的各向同性高斯混合，这使我们可解析获得 $p(\mathbf x_t)$、$\mathbb E[\mathbf x|\mathbf x_t]$ 与 $\mathbb V[\mathbf x|\mathbf x_t]$。图 2 的结果表明，使用 $\mathbb V[\mathbf x|\mathbf x_t]$ 而非启发式可带来数量级更准确的后验 $q(\mathbf x_t|\mathbf y)$。我们预期该差距会在真实高维数据上进一步扩大，因为后者常位于低维流形上，从而呈现强局部协方差。

由于 MCEM 算法对后验样本精度敏感 [63—66]，我们选择用 **Tweedie 协方差公式** [55—58] 估计 $\mathbb V[\mathbf x|\mathbf x_t]$：

$$
\mathbb V[\mathbf x|\mathbf x_t]=\boldsymbol\Sigma_t+\boldsymbol\Sigma_t\nabla_{\mathbf x_t}^2\log p(\mathbf x_t)\boldsymbol\Sigma_t\tag{21}
$$

$$
=\boldsymbol\Sigma_t\nabla_{\mathbf x_t}^\top\mathbb E[\mathbf x|\mathbf x_t]\approx\boldsymbol\Sigma_t\nabla_{\mathbf x_t}^\top\mathbf d_\theta(\mathbf x_t,t).\tag{22}
$$

**共轭梯度法。** 正如 Finzi 等 [24] 所指出的，显式计算并实体化 Jacobian $\nabla_{\mathbf x_t}^\top\mathbf d_\theta(\mathbf x_t,t)\in\mathbb R^{N\times N}$ 在高维中不可行；此外即便能获得 $\mathbb V[\mathbf x|\mathbf x_t]$，朴素地计算式（20）中矩阵 $\boldsymbol\Sigma_y+\mathbf A\mathbb V[\mathbf x|\mathbf x_t]\mathbf A^\top$ 的逆仍不可行。幸运的是，我们观察到矩阵 $\boldsymbol\Sigma_y+\mathbf A\mathbb V[\mathbf x|\mathbf x_t]\mathbf A^\top$ 对称正定（SPD），因此可用共轭梯度（CG）法 [72]。CG 是求解形如 $\mathbf M\mathbf v=\mathbf b$ 的线性系统的迭代算法（SPD 矩阵 $\mathbf M$ 与向量 $\mathbf b$ 已知）；重要的是，CG 只需通过执行矩阵–向量乘积 $\mathbf M\mathbf v$ 的算子隐式访问 $\mathbf M$。在我们的情形中，待解线性系统为

$$
\mathbf y-\mathbf A\mathbb E[\mathbf x|\mathbf x_t]=\left(\boldsymbol\Sigma_y+\mathbf A\mathbb V[\mathbf x|\mathbf x_t]\mathbf A^\top\right)\mathbf v\tag{23}
$$

$$
=\boldsymbol\Sigma_y\mathbf v+\mathbf A\left(\underbrace{\mathbf v^\top\mathbf A\boldsymbol\Sigma_t\nabla_{\mathbf x_t}^\top\mathbb E[\mathbf x|\mathbf x_t]}_{\text{向量–Jacobian 乘积}}\right)^\top.\tag{24}
$$

在自动微分框架 [73, 74] 中，右端的向量–Jacobian 乘积可廉价求值。实践中，由于数值误差与训练不完美，Jacobian $\nabla_{\mathbf x_t}^\top\mathbf d_\theta(\mathbf x_t,t)\approx\nabla_{\mathbf x_t}^\top\mathbb E[\mathbf x|\mathbf x_t]$ 并不总是完全 SPD。因此 CG 在若干次迭代后变得不稳定、无法达到精确解。幸运的是，我们发现把 CG 截断到极少的迭代次数（1 至 3 次）就已比使用启发式协方差 $\mathbb V[\mathbf x|\mathbf x_t]$ 带来显著改进。或者，可用能求解非对称非正定线性系统的其他迭代算法（如 GMRES [75] 或 BiCGSTAB [76]）替代 CG，代价是收敛更慢。

## 5 结果

我们开展三个实验以展示方法的有效性。第一个实验围绕潜变量 $\mathbf x$ 维数较低、其真值分布 $p(\mathbf x)$ 已知的情形设计；在该设定中可使用渐近精确的采样方案（如 predictor-corrector 采样 [23, 46] 或 twisted diffusion sampling [77]）而不必担心计算代价。这使我们能在（几乎）精确后验采样的极限下验证 EM 流程（算法 1）。其余实验针对先前研究中的两个基准：损坏的 CIFAR-10 与加速 MRI；这些任务能很好地反映方法在数据与计算有限的典型经验贝叶斯应用中的表现。

### 5.1 低维流形

在该实验中，潜变量 $\mathbf x\in\mathbb R^5\sim p(\mathbf x)$ 位于 $\mathbb R^5$ 中随机 1 维流形上（图 7）。每个观测 $\mathbf y\in\mathbb R^2\sim\mathcal N(\mathbf y|\mathbf A\mathbf x,\boldsymbol\Sigma_y)$ 是潜变量 $\mathbf x$ 的随机线性投影加各向同性高斯噪声（$\boldsymbol\Sigma_y=10^{-4}\mathbf I$）的结果，测量矩阵 $\mathbf A\in\mathbb R^{2\times5}$ 的行从单位球面 $S^4$ 上均匀抽取。我们注意到，在理论上观测一个 $\mathbb R^N$ 中分布 $p(\mathbf x)$ 的所有推前分布 $p(\mathbf u^\top\mathbf x)$（$\mathbf u\in S^{N-1}$）足以恢复 $p(\mathbf x)$ [78, 79]。实践中我们生成含 $2^{16}$ 对 $(\mathbf y,\mathbf A)$ 的有限训练集。我们用多层感知机 $\mathbf d_\theta(\mathbf x_t,t)$ 参数化 DM $q_\theta(\mathbf x)$，进行 $K=32$ 轮 EM 迭代。我们用算法 3 估计后验分数 $\nabla_{\mathbf x_t}\log q_\theta(\mathbf x_t|\mathbf y,\mathbf A)$，但依赖 predictor-corrector [23, 46] 采样方案并以大量（4096）修正步从后验 $q_\theta(\mathbf x|\mathbf y,\mathbf A)$ 采样。噪声调度、网络架构与学习率等更多细节见附录 C。

正如预期，模型 $q_{\theta_k}(\mathbf x)$ 收敛到其边缘分布接近真值 $p(\mathbf x)$ 边缘分布的平稳分布（图 3）。我们把残余伪影归因于有限数据与采样方案的不精确。

**图 3：** EM 迭代过程中模型 $q_{\theta_k}(\mathbf x)$ 的 2 维边缘分布示意。初始高斯先验 $q_0(\mathbf x)$ 导致第一个模型 $q_{\theta_1}(\mathbf x)$ 非常分散；EM 算法逐步剪除与观测不一致的密度区域，直至到达平稳分布；最终分布的边缘接近真值分布的边缘。（来源：原文第 6 页。）

### 5.2 损坏的 CIFAR-10

沿用 Daras 等 [80]，我们把 CIFAR-10 [81] 数据集的 50,000 张训练图像作为潜变量 $\mathbf x$。对每张图像 $\mathbf x$，通过以概率 $\rho$ 随机删除像素生成单个观测 $\mathbf y$，因此测量矩阵 $\mathbf A$ 为二值对角矩阵。为与无法处理含噪观测的 AmbientDiffusion [80] 公平比较，我们加入可忽略的各向同性高斯噪声（$\boldsymbol\Sigma_y=10^{-6}\mathbf I$）。

对每个损坏率 $\rho\in\{0.25,0.5,0.75\}$，我们用受 U-Net [82] 启发的网络 $\mathbf d_\theta(\mathbf x_t,t)$ 参数化 DM $q_\theta(\mathbf x)$，进行 $K=32$ 轮 EM 迭代。我们用算法 2（$T=256$ 个离散化步、$\eta=1$）近似从后验 $q_\theta(\mathbf x|\mathbf y,\mathbf A)$ 采样。我们用算法 3 对 $\mathbb V[\mathbf x|\mathbf x_t]$ 采用若干启发式以与 Tweedie 协方差公式比较；对后者，我们把算法 4 中的共轭梯度法截断到单次迭代。对每个模型 $q_{\theta_k}(\mathbf x)$，我们生成 50,000 张图像并相对未损坏的 CIFAR-10 训练集评估其 Inception score（IS）[83] 与 Fréchet Inception distance（FID）[84]。结果见表 1 与图 4、图 5：在 75% 损坏下，我们的方法与 AmbientDiffusion [80] 仅在 20% 损坏下的表现相近；相反，对 $\mathbb V[\mathbf x|\mathbf x_t]$ 使用启发式会导致很差的样本质量。

**表 1：在损坏 CIFAR-10 上训练的最终模型评估。** 我们的方法在相近损坏水平下优于 AmbientDiffusion [80]；使用启发式替代 Tweedie 公式会大幅降低样本质量。（来源：原文第 7 页。）

| 方法 | $\rho$ | FID↓ | IS↑ |
|---|---|---|---|
| AmbientDiffusion [80] | 0.20 | 11.70 | 7.97 |
| AmbientDiffusion [80] | 0.40 | 18.85 | 7.45 |
| AmbientDiffusion [80] | 0.60 | 28.88 | 6.88 |
| Ours w/ Tweedie | 0.25 | **5.88** | **8.83** |
| Ours w/ Tweedie | 0.50 | 6.76 | 8.75 |
| Ours w/ Tweedie | 0.75 | 13.18 | 8.14 |
| Ours w/ $(I+\boldsymbol\Sigma_t^{-1})^{-1}$ | 0.75 | 39.94 | 7.69 |
| Ours w/ $\boldsymbol\Sigma_t$ | 0.75 | 118.69 | 4.23 |

**图 4：** 损坏 CIFAR-10 实验中 $q_{\theta_k}(\mathbf x)$ 的 FID 随 EM 迭代 $k$ 的变化（Tweedie 25%/50%/75%、$(I+\boldsymbol\Sigma_t^{-1})^{-1}$ 75%、$\boldsymbol\Sigma_t$ 75%）。（来源：原文第 7 页。）

**图 5：** 损坏 CIFAR-10 实验（$\rho=0.75$）中随 EM 迭代 $k=1,2,4,8,16,32$ 的模型 $q_{\theta_k}(\mathbf x)$ 样本示例；使用确定性 DDIM [50] 采样以便比较。生成图像逐渐更精细、噪声更少。（来源：原文第 7 页。）

### 5.3 加速 MRI

磁共振成像（MRI）是放射学中用于检查身体内部解剖与生理的非侵入性医学成像技术。MRI 测量在频域（也称 k 空间）中借助强磁场获得；然而测量整个 k 空间耗时且昂贵。**加速 MRI** [4—8] 即基于部分（可能是随机且含噪的）频率测量推断被扫描对象。

本实验沿用 Kawar 等 [85]，考虑 fastMRI [7, 8] 数据集的单线圈膝部 MRI 扫描：我们把每张扫描的第 10 至 40 层之间的每个切片视为独立潜变量 $\mathbf x$（表示为 $320\times320$ 灰度图像），扫描经 min-max 归一化使像素值落在 $-2$ 到 $2$ 之间。对每个切片 $\mathbf x$，先做离散 Fourier 变换、再做加速度因子 $R=6$ 的随机水平频率子采样 [85, 86]（即平均观测到全部频率的 $1/R$ 比例），从而生成单个观测 $\mathbf y$；最终得到 24,853 个 k 空间观测，并加入各向同性高斯噪声（$\boldsymbol\Sigma_y=10^{-4}\mathbf I$）以匹配 Kawar 等 [85]。

同样地，我们用受 U-Net [82] 启发的网络 $\mathbf d_\theta(\mathbf x_t,t)$ 参数化 DM $q_\theta(\mathbf x)$，进行 $K=16$ 轮 EM 迭代。我们用算法 2（$T=64$ 个离散化步、$\eta=1$）近似从后验 $q_\theta(\mathbf x|\mathbf y,\mathbf A)$ 采样，并把算法 4 的共轭梯度法截断到 3 次迭代。训练完成后，我们把最终模型 $q_{\theta_K}(\mathbf x)$ 用作加速 MRI 的扩散先验。借助矩匹配后验采样，我们能在高达 $R=32$ 的加速度因子下推断合理扫描（图 6）。我们的样本明显比 Kawar 等 [85] 的样本更精细。我们选择不报告样本的 PSNR/SSIM，因为这些指标只对回归任务有意义，会不公平地惩罚真正的生成模型 [87, 88]。先验样本见图 13，另一类前向过程的后验样本见图 14。

**图 6：** 仅从 k 空间观测训练的扩散先验用于加速 MRI 的后验样本示例（$R=4,8,16,32$；掩码、零填充反演、样本 1、样本 2、真值）。后验样本细致并呈现合理变化，同时与观测保持一致；我们提供零填充反演（缺失频率置零）作为基线。（来源：原文第 8 页。）

## 6 相关工作

**经验贝叶斯。** 若干先前研究考察了用深度学习求解经验贝叶斯问题。Louppe 等 [35] 用对抗训练学习先验分布，使其经不可微黑盒前向过程推前时能复现观测的经验分布。Dockhorn 等 [33] 用归一化流 [89, 90] 在前向过程为加性噪声时通过变分推断估计先验密度。Vandegar 等 [36] 同样使用归一化流，但考虑似然 $p(\mathbf y|\mathbf x)$ 难以处理的黑盒前向过程；他们指出经验贝叶斯是病态问题，因为不同先验分布可能产生相同的观测分布。Vetter 等 [37] 通过瞄准最大熵先验分布、同时最小化与观测经验分布的 sliced-Wasserstein 距离 [78, 79] 来处理该问题。这些方法依赖密度 $q_\theta(\mathbf x)$ 或样本 $\mathbf x\sim q_\theta(\mathbf x)$ 对参数 $\theta$ 可微的生成模型，而扩散模型并非如此或很难如此。

与本工作更接近的是，Daras 等 [80] 与 Kawar 等 [85] 尝试仅从线性观测训练 DM。Daras 等 [80] 考虑形如 $\mathbf y=\mathbf A\mathbf x$ 的无噪观测，在 $\mathbb E[\mathbf A^\top\mathbf A]$ 满秩假设下训练网络 $\mathbf d_\theta(\mathbf A\mathbf x_t,\mathbf A,t)$ 以近似 $\mathbb E[\mathbf x|\mathbf A\mathbf x_t]$，作者论证 $\mathbb E[\mathbf x|\mathbf A\mathbf x_t]$ 可作为 $\mathbb E[\mathbf x|\mathbf x_t]$ 的替代。类似地，Kawar 等 [85] 假设高斯观测 $\mathbf y\sim\mathcal N(\mathbf y|\mathbf A\mathbf x,\boldsymbol\Sigma_y)$，并在 $\mathbb E[\mathbf P]$ 满秩（$\mathbf P=\mathbf A^+\mathbf A$，$\mathbf A^+$ 为 Moore–Penrose 伪逆）假设下训练网络 $\mathbf d_\theta(\mathbf P\mathbf x_t,t)$ 近似 $\mathbb E[\mathbf x|\mathbf P\mathbf x_t]$；作者假设即便训练数据不含 $\mathbf P=\mathbf I$，$\mathbf d_\theta(\mathbf P\mathbf x_t,t)$ 也能泛化到 $\mathbf P=\mathbf I$。两种情形下训练出的网络都不是逼近 $\mathbb E[\mathbf x|\mathbf x_t]$ 的真正去噪器，无法可靠地参数化标准扩散模型，这对下游应用是个问题——尤其在贝叶斯推断中，它们需要定制的后验采样方案，例如 Aali 等 [91] 为 AmbientDiffusion [80] 模型提出的方案。相反，本工作不修改去噪分数匹配目标 [53, 54]，保证每一轮迭代都得到与任何后验采样方案兼容的真正 DM；此外我们发现本方法得到定量与定性更好的扩散先验。

在一项并行工作中，Daras 等 [92] 提出通过强制去噪器沿扩散路径的"一致性"来从含噪（$\mathbf A=\mathbf I$、$\boldsymbol\Sigma_y=\sigma_y^2\mathbf I$）数据训练 DM 的算法，并证明均值 $\mathbb E[\mathbf x|\mathbf x_t]$ 是唯一一致的去噪器；有趣的是，该训练算法同样依赖后验样本，而由于白噪声假设这些样本易于获得。

**后验采样。** 近期有大量关于用无条件扩散模型做条件生成的工作，大多采用式（16）的后验分数分解。如 §4.2 所述，Chung 等 [21] 在前向过程 $p(\mathbf y|\mathbf x)$ 为高斯时对似然分数 $\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)$ 提出解析近似；Song 等 [22] 与 Rozet 等 [23] 通过以简单启发式形式引入协方差 $\mathbb V[\mathbf x|\mathbf x_t]$ 改进该近似。我们在此基础上，用基于 Tweedie 协方差公式 [55—58] 的恰当协方差估计替代启发式。Finzi 等 [24] 采用相同思路，但实体化矩阵 $\mathbf A\mathbb V[\mathbf x|\mathbf x_t]\mathbf A^\top$，在高维中不可行。Boys 等 [25] 用行和近似 $\mathrm{diag}(\mathbf e^\top\mathbb V[\mathbf x|\mathbf x_t])$（$\mathbf e$ 为全一向量）替代协方差 $\mathbb V[\mathbf x|\mathbf x_t]$，该近似仅在 $\mathbb V[\mathbf x|\mathbf x_t]$ 为对角时有效，限制了其适用性。相反，我们利用共轭梯度法 [72] 避免实体化 $\mathbf A\mathbb V[\mathbf x|\mathbf x_t]\mathbf A^\top$。一个可能更廉价的方案是训练 $\mathbb V[\mathbf x|\mathbf x_t]$ 的稀疏近似，如 Peng 等 [93] 所提，但该方法通用性较差，不能立即适用于任意扩散模型。

另一条并行研究 [94—96] 把扩散模型的条件化扩展到任意损失项 $\ell(\mathbf x,\mathbf y)\propto-\log p(\mathbf y|\mathbf x)$，因为此时不存在似然分数 $\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)$ 的可靠解析近似。Song 等 [94] 通过从 $p(\mathbf x|\mathbf x_t)$ 的高斯近似采样来对似然 $p(\mathbf y|\mathbf x_t)=\int p(\mathbf y|\mathbf x)p(\mathbf x|\mathbf x_t)\,\mathrm d\mathbf x$ 做 Monte Carlo 近似；相反，He 等 [96] 用均值 $\mathbb E[\mathbf x|\mathbf x_t]$ 作为 $p(\mathbf x|\mathbf x_t)$ 的点估计，但借助预训练编码器–解码器对把 $\mathbf x_t$ 的更新投影到其流形上。我们注意到，本文使用协方差 $\mathbb V[\mathbf x|\mathbf x_t]$ 同样使更新与 $\mathbf x_t$ 的流形相切。

最后，Wu 等 [77] 提出一种基于粒子的后验采样方案：只要似然近似 $q(\mathbf y|\mathbf x_t)$（此处称为 twisting function）在 $t\to0$ 时收敛到 $p(\mathbf y|\mathbf x)$，该方案在粒子数无穷的极限下渐近精确。把 TDS [77] 用作 EM 流程的一部分可能带来更好结果和/或更快收敛，代价是计算资源；此外作者指出 TDS [77] 的效率取决于 twisting function 逼近精确似然的程度——在这方面，我们式（19）中的矩匹配高斯近似可能是一个好的 twisting 候选。

## 7 讨论与结论（原文标题 Discussion）

据我们所知，本文首次把从受损观测训练扩散模型形式化为经验贝叶斯 [28—31] 问题。本工作中，我们把分析限定于线性高斯前向过程，以便利用准确高效的高维后验采样方案；这与通常面向低维潜空间与高度非线性前向过程的典型经验贝叶斯方法 [33—37] 形成对比。此外如 §6 所述，这些 EB 方法不适用于扩散模型。因此我们选择与扩散模型文献中的类似方法 [80, 85] 作基准比较，但强调与先前经验贝叶斯方法的恰当比较对两个社区都将很有价值。我们还注意到，Monte Carlo EM [59—66] 可以处理任意前向过程 $p(\mathbf y|\mathbf x)$，只要能从中采样后验 $q_\theta(\mathbf x|\mathbf y)$；因此本方法未来可适配任意类型的前向过程。我们认为 Dhariwal 等 [97] 与 Ho 等 [98] 关于扩散引导的工作是把本方法适配到非线性、不可微甚至黑盒前向过程的良好途径。

从计算角度看，EM 方法的迭代性质相比先前工作 [80, 85] 是一个缺点：尤其从后验生成足够多的样本可能昂贵（尽管高度可并行化）；此外，虽然模型 $q_\theta(\mathbf x)$ 本身的架构与训练比先前工作 [80, 85] 更简单，但采样步显著增加了复杂度，特别是由于方法收敛对后验样本质量敏感。事实上我们发现先前的后验采样方法 [21—23, 25, 26] 结果令人失望，这促使我们开发更好的方案。因此矩匹配后验采样（MMPS）是本工作的副产物；但它并不局限于从观测学习的语境，可应用于给定预训练扩散先验的任意线性逆问题。在附录 E 中，我们在 FFHQ [99] 数据集上把 MMPS 与先前的后验采样方法在若干线性逆问题上比较，发现 MMPS 在定性与定量上一致优于先前方法；MMPS 显著稳定且需要更少采样步即可生成高质量样本，这在很大程度上弥补了其略高的单步代价。

最后如 §6 所述，经验贝叶斯是病态问题：不同先验分布可能产生相同的观测分布。换言之，给定观测的经验分布 $p(\mathbf y)$，一般不可能识别出"那个"真值分布 $p(\mathbf x)$。对于足够有表现力的扩散模型，我们的 EM 方法最终会收敛到与 $p(\mathbf y)$ 一致、但一般不同于 $p(\mathbf x)$ 的先验 $q_\theta(\mathbf x)$。遵循 Vetter 等 [37] 所倡导的最大熵原则留待未来工作。

**致谢与资助披露。** François Rozet 与 Gérôme Andry 是比利时 F.R.S.-FNRS 的研究员，并感谢其资助。本研究得益于瓦隆大区 Tier-1 超级计算机 Lucia 提供的计算资源（该基础设施由瓦隆大区在资助编号 1910247 下资助）；计算资源由高强度计算设备联盟（CÉCI）提供，其由比利时科学研究基金会（F.R.S.-FNRS）在资助编号 2.5020.11 与瓦隆大区共同资助。本文所用 MRI 数据取自 NYU fastMRI Initiative 数据库 [7, 8]；NYU fastMRI 研究者提供了数据但未参与本报告的分析或写作。fastMRI 研究者的名单（可能更新）见 https://fastmri.med.nyu.edu/。fastMRI 的主要目标是检验机器学习能否辅助医学图像重建。

## 参考文献（英文原书目）

[1] S. J. Warren and S. Dye. "Semilinear Gravitational Lens Inversion". In The Astrophysical Journal (2003).
[2] Warren R. Morningstar et al. "Data-driven Reconstruction of Gravitationally Lensed Galaxies Using Recurrent Inference Machines". In The Astrophysical Journal (2019).
[3] Siddharth Mishra-Sharma and Ge Yang. "Strong Lensing Source Reconstruction Using Continuous Neural Fields". 2022.
[4] Shanshan Wang et al. "Accelerating magnetic resonance imaging via deep learning". In International Symposium on Biomedical Imaging. 2016.
[5] Kerstin Hammernik et al. "Learning a variational network for reconstruction of accelerated MRI data". In Magnetic Resonance in Medicine (2018).
[6] Yoseo Han et al. "k-Space Deep Learning for Accelerated MRI". In Transactions on Medical Imaging (2020).
[7] Jure Zbontar et al. "fastMRI: An Open Dataset and Benchmarks for Accelerated MRI". 2018.
[8] Florian Knoll et al. "fastMRI: A Publicly Available Raw k-Space and DICOM Dataset of Knee Images for Accelerated MR Image Reconstruction Using Machine Learning". In Radiology: Artificial Intelligence (2020).
[9] G. Cowan. "A survey of unfolding methods for particle physics". In Conf. Proc. C (2002).
[10] Volker Blobel. "Unfolding Methods in Particle Physics". In PHYSTAT. CERN, 2011.
[11] François-Xavier Le Dimet and Olivier Talagrand. "Variational algorithms for analysis and assimilation of meteorological observations: theoretical aspects". In Tellus A: Dynamic Meteorology and Oceanography (1986).
[12] Yannick Trémolet. "Accounting for an imperfect model in 4D-Var". In Quarterly Journal of the Royal Meteorological Society (2006).
[13] Thomas M. Hamill. "Ensemble-based atmospheric data assimilation". In Predictability of Weather and Climate. 2006.
[14] Alberto Carrassi et al. "Data assimilation in the geosciences: An overview of methods, issues, and perspectives". In WIREs Climate Change (2018).
[15] Jascha Sohl-Dickstein et al. "Deep Unsupervised Learning using Nonequilibrium Thermodynamics". In Proceedings of the 32nd International Conference on Machine Learning. 2015.
[16] Jonathan Ho et al. "Denoising Diffusion Probabilistic Models". In Advances in Neural Information Processing Systems. 2020.
[17] Yang Song et al. "Solving Inverse Problems in Medical Imaging with Score-Based Generative Models". In International Conference on Learning Representations. 2022.
[18] Bahjat Kawar et al. "SNIPS: Solving Noisy Inverse Problems Stochastically". In Advances in Neural Information Processing Systems. 2021.
[19] Bahjat Kawar et al. "Denoising Diffusion Restoration Models". In Advances in Neural Information Processing Systems. 2022.
[20] Alexandre Adam et al. "Posterior samples of source galaxies in strong gravitational lenses with score-based priors". 2022.
[21] Hyungjin Chung et al. "Diffusion Posterior Sampling for General Noisy Inverse Problems". In International Conference on Learning Representations. 2023.
[22] Jiaming Song et al. "Pseudoinverse-Guided Diffusion Models for Inverse Problems". In International Conference on Learning Representations. 2023.
[23] François Rozet and Gilles Louppe. "Score-based Data Assimilation". In Advances in Neural Information Processing Systems. 2023.
[24] Marc Anton Finzi et al. "User-defined Event Sampling and Uncertainty Quantification in Diffusion Models for Physical Dynamical Systems". In Proceedings of the 40th International Conference on Machine Learning. 2023.
[25] Benjamin Boys et al. "Tweedie Moment Projected Diffusions For Inverse Problems". 2023.
[26] Y. Zhu et al. "Denoising Diffusion Models for Plug-and-Play Image Restoration". In Conference on Computer Vision and Pattern Recognition Workshops. 2023.
[27] Noe Dia et al. "Bayesian Imaging for Radio Interferometry with Score-based Priors". 2023.
[28] Herbert E. Robbins. "An Empirical Bayes Approach to Statistics". In Proceedings of the Third Berkeley Symposium on Mathematical Statistics and Probability. 1956.
[29] George Casella. "An Introduction to Empirical Bayes Data Analysis". In The American Statistician (1985).
[30] Bradley P. Carlin and Thomas A. Louis. "Empirical Bayes: Past, Present and Future". In Journal of the American Statistical Association (2000).
[31] Bradley Efron. "Two Modeling Strategies for Empirical Bayes Estimation". In Statistical Science (2014).
[32] G. D'Agostini. "A multidimensional unfolding method based on Bayes' theorem". In Nuclear Instruments and Methods in Physics Research (1995).
[33] Tim Dockhorn et al. "Density Deconvolution with Normalizing Flows". 2020.
[34] Anders Andreassen et al. "OmniFold: A Method to Simultaneously Unfold All Observables". In Physical Review Letters (2020).
[35] Gilles Louppe et al. "Adversarial Variational Optimization of Non-Differentiable Simulators". In Proceedings of the Twenty-Second International Conference on Artificial Intelligence and Statistics. 2019.
[36] Maxime Vandegar et al. "Neural Empirical Bayes: Source Distribution Estimation and its Applications to Simulation-Based Inference". In Proceedings of The 24th International Conference on Artificial Intelligence and Statistics. 2021.
[37] Julius Vetter et al. "Sourcerer: Sample-based Maximum Entropy Source Distribution Estimation". 2024.
[38] Bradley Efron. "Empirical Bayes deconvolution estimates". In Biometrika (2016).
[39] Balasubramanian Narasimhan and Bradley Efron. "deconvolveR: A G-Modeling Program for Deconvolution and Empirical Bayes Estimation". In Journal of Statistical Software (2020).
[40] H. O. Hartley. "Maximum Likelihood Estimation from Incomplete Data". In Biometrics (1958).
[41] A. P. Dempster et al. "Maximum Likelihood from Incomplete Data Via the EM Algorithm". In Journal of the Royal Statistical Society (1977).
[42] C. F. Jeff Wu. "On the Convergence Properties of the EM Algorithm". In The Annals of Statistics (1983).
[43] Geoffrey J McLachlan and Thriyambakam Krishnan. "The EM algorithm and extensions". John Wiley & Sons, 2007.
[44] Sivaraman Balakrishnan et al. "Statistical guarantees for the EM algorithm: From population to sample-based analysis". In The Annals of Statistics (2017).
[45] Yang Song and Stefano Ermon. "Generative Modeling by Estimating Gradients of the Data Distribution". In Advances in Neural Information Processing Systems. 2019.
[46] Yang Song et al. "Score-Based Generative Modeling through Stochastic Differential Equations". In International Conference on Learning Representations. 2021.
[47] Brian D. O. Anderson. "Reverse-time diffusion equation models". In Stochastic Processes and their Applications (1982).
[48] Simo Särkkä and Arno Solin. "Applied Stochastic Differential Equations". Institute of Mathematical Statistics Textbooks. Cambridge University Press, 2019.
[49] Qinsheng Zhang and Yongxin Chen. "Fast Sampling of Diffusion Models with Exponential Integrator". In International Conference on Learning Representations. 2023.
[50] Jiaming Song et al. "Denoising Diffusion Implicit Models". In International Conference on Learning Representations. 2021.
[51] Tero Karras et al. "Elucidating the Design Space of Diffusion-Based Generative Models". In Advances in Neural Information Processing Systems. 2022.
[52] Yaron Lipman et al. "Flow Matching for Generative Modeling". In International Conference on Learning Representations. 2023.
[53] Aapo Hyvärinen. "Estimation of Non-Normalized Statistical Models by Score Matching". In Journal of Machine Learning Research (2005).
[54] Pascal Vincent. "A Connection Between Score Matching and Denoising Autoencoders". In Neural Computation (2011).
[55] M. C. K. Tweedie. "Functions of a statistical variate with given means, with special reference to Laplacian distributions". In Mathematical Proceedings of the Cambridge Philosophical Society (1947).
[56] Bradley Efron. "Tweedie's Formula and Selection Bias". In Journal of the American Statistical Association (2011).
[57] Kwanyoung Kim and Jong Chul Ye. "Noise2Score: Tweedie's Approach to Self-Supervised Image Denoising without Clean Images". In Advances in Neural Information Processing Systems. 2021.
[58] Chenlin Meng et al. "Estimating High Order Gradients of the Data Distribution by Denoising". In Advances in Neural Information Processing Systems. 2021.
[59] Greg C. G. Wei and Martin A. Tanner. "A Monte Carlo Implementation of the EM Algorithm and the Poor Man's Data Augmentation Algorithms". In Journal of the American Statistical Association (1990).
[60] Gilles Celeux and Jean Diebolt. "A stochastic approximation type EM algorithm for the mixture problem". In Stochastics and Stochastic Reports (1992).
[61] Bernard Delyon et al. "Convergence of a stochastic approximation version of the EM algorithm". In The Annals of Statistics (1999).
[62] James G. Booth and James P. Hobert. "Maximizing Generalized Linear Mixed Model Likelihoods with an Automated Monte Carlo EM Algorithm". In Journal of the Royal Statistical Society (1999).
[63] Richard A. Levine and George Casella. "Implementations of the Monte Carlo EM Algorithm". In Journal of Computational and Graphical Statistics (2001).
[64] Brian S. Caffo et al. "Ascent-Based Monte Carlo Expectation-Maximization". In Journal of the Royal Statistical Society (2005).
[65] Wolfgang Jank. "The EM Algorithm, Its Randomized Implementation and Global Optimization". In Perspectives in Operations Research. 2006.
[66] William Ruth. "A review of Monte Carlo-based versions of the EM algorithm". 2024.
[67] Michael E. Tipping and Christopher M. Bishop. "Mixtures of Probabilistic Principal Component Analyzers". In Neural Computation (1999).
[68] Christopher M. Bishop. "Pattern Recognition and Machine Learning". Information Science and Statistics. Springer, 2006.
[69] Lénaïc Chizat et al. "Faster Wasserstein Distance Estimation with the Sinkhorn Divergence". In Advances in Neural Information Processing Systems. 2020.
[70] Rémi Flamary et al. "POT: Python Optimal Transport". In Journal of Machine Learning Research (2021).
[71] Friedemann Zenke and Tim P. Vogels. "The Remarkable Robustness of Surrogate Gradient Learning for Instilling Complex Function in Spiking Neural Networks". In Neural Computation (2021).
[72] Magnus R. Hestenes and Eduard Stiefel. "Methods of Conjugate Gradients for Solving Linear Systems". In Journal of Research of the National Bureau of Standards (1952).
[73] James Bradbury et al. "JAX: Composable transformations of Python + NumPy programs". 2018.
[74] Adam Paszke et al. "PyTorch: An Imperative Style, High-Performance Deep Learning Library". In Advances in Neural Information Processing Systems. 2019.
[75] Youcef Saad and Martin Schultz. "GMRES: A Generalized Minimal Residual Algorithm for Solving Nonsymmetric Linear Systems". In Journal on Scientific and Statistical Computing (1986).
[76] H. A. Van der Vorst. "Bi-CGSTAB: A Fast and Smoothly Converging Variant of Bi-CG for the Solution of Nonsymmetric Linear Systems". In Journal on Scientific and Statistical Computing (1992).
[77] Luhuan Wu et al. "Practical and Asymptotically Exact Conditional Sampling in Diffusion Models". In Advances in Neural Information Processing Systems. 2023.
[78] Nicolas Bonneel et al. "Sliced and Radon Wasserstein Barycenters of Measures". In Journal of Mathematical Imaging and Vision (2015).
[79] Kimia Nadjahi et al. "Statistical and Topological Properties of Sliced Probability Divergences". In Advances in Neural Information Processing Systems. 2020.
[80] Giannis Daras et al. "Ambient Diffusion: Learning Clean Distributions from Corrupted Data". In Advances in Neural Information Processing Systems. 2023.
[81] Alex Krizhevsky, Geoffrey Hinton, et al. "Learning Multiple Layers of Features from Tiny Images". 2009.
[82] Olaf Ronneberger et al. "U-Net: Convolutional Networks for Biomedical Image Segmentation". In Medical Image Computing and Computer-Assisted Intervention. 2015.
[83] Tim Salimans et al. "Improved Techniques for Training GANs". In Advances in Neural Information Processing Systems. 2016.
[84] Martin Heusel et al. "GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium". In Advances in Neural Information Processing Systems. 2017.
[85] Bahjat Kawar et al. "GSURE-Based Diffusion Model Training with Corrupted Data". In Transactions on Machine Learning Research (2024).
[86] Ajil Jalal et al. "Robust Compressed Sensing MRI with Deep Generative Priors". In Advances in Neural Information Processing Systems. 2021.
[87] Yochai Blau and Tomer Michaeli. "The Perception-Distortion Tradeoff". In Conference on Computer Vision and Pattern Recognition. 2018.
[88] Mauricio Delbracio and Peyman Milanfar. "Inversion by Direct Iteration: An Alternative to Denoising Diffusion for Image Restoration". In Transactions on Machine Learning Research (2023).
[89] E. G. Tabak and Cristina V. Turner. "A family of nonparametric density estimation algorithms". In Communications on Pure and Applied Mathematics (2013).
[90] Danilo Rezende and Shakir Mohamed. "Variational Inference with Normalizing Flows". In Proceedings of the 32nd International Conference on Machine Learning. 2015.
[91] Asad Aali et al. "Ambient Diffusion Posterior Sampling: Solving Inverse Problems with Diffusion Models trained on Corrupted Data". 2024.
[92] Giannis Daras et al. "Consistent Diffusion Meets Tweedie: Training Exact Ambient Diffusion Models with Noisy Data". 2024.
[93] Xinyu Peng et al. "Improving Diffusion Models for Inverse Problems Using Optimal Posterior Covariance". 2024.
[94] Jiaming Song et al. "Loss-Guided Diffusion Models for Plug-and-Play Controllable Generation". In Proceedings of the 40th International Conference on Machine Learning. 2023.
[95] Arpit Bansal et al. "Universal Guidance for Diffusion Models". In International Conference on Learning Representations. 2024.
[96] Yutong He et al. "Manifold Preserving Guided Diffusion". In International Conference on Learning Representations. 2024.
[97] Prafulla Dhariwal and Alexander Quinn Nichol. "Diffusion Models Beat GANs on Image Synthesis". In Advances in Neural Information Processing Systems. 2021.
[98] Jonathan Ho and Tim Salimans. "Classifier-Free Diffusion Guidance". 2022.
[99] Tero Karras et al. "A Style-Based Generator Architecture for Generative Adversarial Networks". In Conference on Computer Vision and Pattern Recognition. 2019.
[100] Ashish Vaswani et al. "Attention is All you Need". In Advances in Neural Information Processing Systems. 2017.
[101] Stefan Elfwing et al. "Sigmoid-weighted linear units for neural network function approximation in reinforcement learning". In Neural Networks (2018).
[102] Jimmy Lei Ba et al. "Layer Normalization". 2016.
[103] Diederik P. Kingma and Jimmy Ba. "Adam: A Method for Stochastic Optimization". In International Conference on Learning Representations. 2015.
[104] Kaiming He et al. "Deep Residual Learning for Image Recognition". In Conference on Computer Vision and Pattern Recognition. 2016.
[105] William Peebles and Saining Xie. "Scalable Diffusion Models with Transformers". In International Conference on Computer Vision. 2023.
[106] Anton Obukhov et al. "High-fidelity performance metrics for generative models in PyTorch". 2020.
[107] Wenzhe Shi et al. "Real-Time Single Image and Video Super-Resolution Using an Efficient Sub-Pixel Convolutional Neural Network". In Conference on Computer Vision and Pattern Recognition. 2016.
[108] Richard Zhang et al. "The Unreasonable Effectiveness of Deep Features as a Perceptual Metric". In Conference on Computer Vision and Pattern Recognition. 2018.
[109] Zhou Wang et al. "Image quality assessment: from error visibility to structural similarity". In Transactions on Image Processing (2004).

## 附录 A 算法

```text
Algorithm 1 期望最大化流程
1  选择初始先验 q_0(x)
2  初始化去噪器 d_θ(x_t, t) 的参数 θ
3  for k = 1 to K do
4      for i = 1 to S do
5          y_i, A_i ~ p(y, A)
6          x_i ~ q_{k−1}(x | y_i, A_i)        # 后验采样
7          repeat
8              i ~ U({1, …, S})
9              t ~ U(0, 1)
10             z ~ N(0, I)
11             x_t ← x_i + σ_t z
12             ℓ ← λ_t ‖d_θ(x_t, t) − x_i‖²      # 去噪分数匹配
13             θ ← GRADIENT DESCENT(θ, ∇_θ ℓ)
14         until convergence
15     θ_k ← θ
16     q_k := q_{θ_k}
17 return θ_K
```

```text
Algorithm 2 DDIM 风格后验采样
1  x_1 ~ N(0, Σ_1)
2  for i = T to 1 do
3      s ← (i−1)/T
4      t ← i/T
5      x̂ ← x_t + Σ_t s_θ(x_t | y, A)        # 估计 E[x | x_t, y, A]
6      z ~ N(0, I)
7      x_s ← x̂ + σ_s √((1−η)(1 − σ_s²/σ_t²)) (x_t − x̂)/σ_t + σ_s √(η(1 − σ_s²/σ_t²)) z
8  return x_0
```

```text
Algorithm 3 矩匹配后验分数
1  function s_θ(x_t | y, A)                 # 估计 ∇_{x_t} log q_θ(x_t | y, A)
2      x̂ ← d_θ(x_t, t)
3      if Tweedie then
4          Σ_{x|x_t} ← Σ_t ∇_{x_t} d_θ(x_t, t)^⊤
5      else
6          Σ_{x|x_t} ← Σ_t or (I + Σ_t^{−1})^{−1} or (Σ_x^{−1} + Σ_t^{−1})^{−1}
7      u ← (Σ_y + A Σ_{x|x_t} A^⊤)^{−1}(y − A x̂)   # 用共轭梯度法求解
8      s_{y|x} ← ∇_{x_t} d_θ(x_t, t)^⊤ A^⊤ u          # 估计 ∇_{x_t} log q_θ(y | x_t, A)
9      s_x ← Σ_t^{−1}(x̂ − x_t)                        # 估计 ∇_{x_t} log q_θ(x_t)
10     return s_x + s_{y|x}
```

```text
Algorithm 4 共轭梯度法
1  function CONJUGATE GRADIENT(A, b, x_0)
2      r_0 ← b − A x_0
3      p_0 ← r_0
4      for i = 0 to N − 1 do
5          if ‖r_i‖ ≤ ε then
6              return x_i
7          α_i ← r_i^⊤ r_i / (p_i^⊤ A p_i)
8          x_{i+1} ← x_i + α_i p_i
9          r_{i+1} ← r_i − α_i A p_i
10         β_i ← r_{i+1}^⊤ r_{i+1} / (r_i^⊤ r_i)
11         p_{i+1} ← r_i + β_i p_i
12     return x_N
```

## 附录 B Tweedie 公式

**定理 1：** 对任意分布 $p(\mathbf x)$ 与 $p(\mathbf x_t|\mathbf x)=\mathcal N(\mathbf x_t|\mathbf x,\boldsymbol\Sigma_t)$，分布 $p(\mathbf x|\mathbf x_t)$ 的一阶与二阶矩通过下式与分数函数 $\nabla_{\mathbf x_t}\log p(\mathbf x_t)$ 相联系：

$$
\mathbb E[\mathbf x|\mathbf x_t]=\mathbf x_t+\boldsymbol\Sigma_t\nabla_{\mathbf x_t}\log p(\mathbf x_t)\tag{25}
$$

$$
\mathbb V[\mathbf x|\mathbf x_t]=\boldsymbol\Sigma_t+\boldsymbol\Sigma_t\nabla_{\mathbf x_t}^2\log p(\mathbf x_t)\boldsymbol\Sigma_t\tag{26}
$$

为完整性，我们给出定理 1 的证明（尽管它是众所周知的结果 [55—58]）。

**证明（式 25）。**

$$
\nabla_{\mathbf x_t}\log p(\mathbf x_t)=\frac{1}{p(\mathbf x_t)}\nabla_{\mathbf x_t}p(\mathbf x_t)=\frac{1}{p(\mathbf x_t)}\int\nabla_{\mathbf x_t}p(\mathbf x,\mathbf x_t)\,\mathrm d\mathbf x=\frac{1}{p(\mathbf x_t)}\int p(\mathbf x,\mathbf x_t)\nabla_{\mathbf x_t}\log p(\mathbf x,\mathbf x_t)\,\mathrm d\mathbf x
$$
$$
=\int p(\mathbf x|\mathbf x_t)\nabla_{\mathbf x_t}\log p(\mathbf x_t|\mathbf x)\,\mathrm d\mathbf x=\int p(\mathbf x|\mathbf x_t)\boldsymbol\Sigma_t^{-1}(\mathbf x-\mathbf x_t)\,\mathrm d\mathbf x=\boldsymbol\Sigma_t^{-1}\mathbb E[\mathbf x|\mathbf x_t]-\boldsymbol\Sigma_t^{-1}\mathbf x_t.
$$

**证明（式 26）。**

$$
\nabla_{\mathbf x_t}^2\log p(\mathbf x_t)=\nabla_{\mathbf x_t}\nabla_{\mathbf x_t}^\top\log p(\mathbf x_t)=\nabla_{\mathbf x_t}\mathbb E[\mathbf x|\mathbf x_t]^\top\boldsymbol\Sigma_t^{-1}-\boldsymbol\Sigma_t^{-1}=\left(\int\nabla_{\mathbf x_t}p(\mathbf x|\mathbf x_t)\mathbf x^\top\,\mathrm d\mathbf x\right)\boldsymbol\Sigma_t^{-1}-\boldsymbol\Sigma_t^{-1}
$$
$$
=\left(\int p(\mathbf x|\mathbf x_t)\nabla_{\mathbf x_t}\log p(\mathbf x_t|\mathbf x)p(\mathbf x_t)\mathbf x^\top\,\mathrm d\mathbf x\right)\boldsymbol\Sigma_t^{-1}-\boldsymbol\Sigma_t^{-1}=\left(\int p(\mathbf x|\mathbf x_t)\boldsymbol\Sigma_t^{-1}\left(\mathbf x-\mathbb E[\mathbf x|\mathbf x_t]\right)\mathbf x^\top\,\mathrm d\mathbf x\right)\boldsymbol\Sigma_t^{-1}-\boldsymbol\Sigma_t^{-1}
$$
$$
=\boldsymbol\Sigma_t^{-1}\left(\mathbb E[\mathbf x\mathbf x^\top|\mathbf x_t]-\mathbb E[\mathbf x|\mathbf x_t]\mathbb E[\mathbf x|\mathbf x_t]^\top\right)\boldsymbol\Sigma_t^{-1}-\boldsymbol\Sigma_t^{-1}=\boldsymbol\Sigma_t^{-1}\mathbb V[\mathbf x|\mathbf x_t]\boldsymbol\Sigma_t^{-1}-\boldsymbol\Sigma_t^{-1}.
$$

## 附录 C 实验细节

所有实验在 JAX [73] 自动微分框架内实现，全部实验的代码见 https://github.com/francois-rozet/diffusion-priors 。

**扩散模型。** 如 §2 所述，本工作采用方差爆炸 SDE [45] 与去噪器参数化 [51]。沿用 Karras 等 [51]，我们对去噪器 $\mathbf d_\theta(\mathbf x_t,t)$ 作如下预条件：

$$
\mathbf d_\theta(\mathbf x_t,t)=\frac{1}{\sigma_t^2+1}\mathbf x_t+\frac{\sigma_t}{\sqrt{\sigma_t^2+1}}h_\theta\left(\frac{\mathbf x_t}{\sqrt{\sigma_t^2+1}},\log\sigma_t\right)\tag{27}
$$

其中 $h_\theta(\mathbf x,\log\sigma)$ 为任意噪声条件网络；标量 $\log\sigma$ 用正弦位置编码 [100] 嵌入为向量。实验中采用指数噪声调度

$$
\sigma_t=\exp\left((1-t)\log10^{-3}+t\log10^2\right),\tag{28}
$$

损失权重 $\lambda_t=\frac1{\sigma_t^2}+1$，训练时 $t$ 从 Beta 分布 $\mathcal B(\alpha=3,\beta=3)$ 采样。

**低维流形。** 噪声条件网络 $h_\theta(\mathbf x,\log\sigma)$ 是含 3 个 256 神经元隐藏层、SiLU [101] 激活的多层感知机，每个激活后插入层归一化 [102]；网络输入为 $\mathbf x_t$ 与噪声嵌入向量的拼接。我们用算法 1 训练 $K=32$ 轮 EM 迭代，每轮含 16,384 步 Adam [103] 优化器优化步；优化器与学习率在每轮 EM 迭代后重新初始化。其他超参数见表 2。

**表 2：低维流形实验的超参数。**（来源：原文第 19 页。）

| 项目 | 取值 |
|---|---|
| 架构 | MLP |
| 输入形状 | (5) |
| 隐藏特征 | (256, 256, 256) |
| 激活 | SiLU |
| 归一化 | LayerNorm |
| 优化器 | Adam |
| 权重衰减 | 0.0 |
| 调度器 | linear |
| 初始学习率 | $1\times10^{-3}$ |
| 最终学习率 | $1\times10^{-6}$ |
| 梯度范数裁剪 | 1.0 |
| 批大小 | 1024 |
| 每轮 EM 迭代步数 | 16 384 |
| EM 迭代轮数 | 32 |

我们用算法 3 估计后验分数 $\nabla_{\mathbf x_t}\log p(\mathbf x_t)$，并把算法 4 截断到 3 次迭代；我们依赖 predictor-corrector [23, 46] 采样方案从后验 $q_\theta(\mathbf x|\mathbf y,\mathbf A)$ 采样。沿用 Rozet 等 [23]，predictor 为确定性 DDIM [50] 步、corrector 为 Langevin Monte Carlo 步；我们执行 4096 个预测步、每步后跟 1 个修正步。每轮 EM 迭代中，我们为每对 $(\mathbf y,\mathbf A)$ 生成一个潜变量 $\mathbf x$。我们按 Zenke 等 [71] 描述的过程生成光滑随机流形；用 POT [70] 包计算 Sinkhorn 散度，熵正则因子 $\lambda=1\mathrm e{-3}$。

**损坏的 CIFAR-10。** 噪声条件网络 $h_\theta(\mathbf x,\log\sigma)$ 为带残差块 [104]、SiLU [101] 激活与层归一化 [102] 的 U-Net [82]；每个残差块按扩散 transformer [105] 的风格依噪声 $\sigma_t$ 调制；U-Net 最后一层的每个残差块后插入多头自注意力块 [100]。我们用算法 1 训练 $K=32$ 轮 EM 迭代，每轮在训练集（50,000 张图像）上训练 256 个 epoch。为防止过拟合，图像做水平翻转与色调偏移增强；优化器在每轮 EM 迭代后重新初始化。其他超参数见表 3。

**表 3：损坏 CIFAR-10 与加速 MRI 实验的超参数。**（来源：原文第 20 页。）

| 项目 | 损坏 CIFAR-10 | 加速 MRI |
|---|---|---|
| 架构 | U-Net | U-Net |
| 输入形状 | (32, 32, 3) | (80, 80, 16) |
| 每层残差块数 | (5, 5, 5) | (3, 3, 3, 3) |
| 每层通道数 | (128, 256, 384) | (128, 256, 384, 512) |
| 每层注意力头数 | (0, 4, 0) | (0, 0, 0, 4) |
| 卷积核大小 | 3 | 3 |
| 激活 | SiLU | SiLU |
| 归一化 | LayerNorm | LayerNorm |
| 优化器 | Adam | Adam |
| 权重衰减 | 0.0 | 0.0 |
| 学习率 | $2\times10^{-4}$ | $10^{-4}$ |
| 梯度范数裁剪 | 1.0 | 1.0 |
| EMA 衰减 | 0.9999 | 0.999 |
| Dropout | 0.1 | 0.1 |
| 数据增强 | 水平翻转、色调 | 水平翻转、填充与裁剪 |
| 批大小 | 256 | 256 |
| 每轮 EM epoch 数 | 256 | 64 |
| EM 迭代轮数 | 32 | 16 |

我们用算法 2（$T=256$ 个离散化步、$\eta=1$）从后验 $q_\theta(\mathbf x|\mathbf y,\mathbf A)$ 采样；用算法 3 对 $\mathbb V[\mathbf x|\mathbf x_t]$ 采用若干启发式以与 Tweedie 协方差公式比较，对后者把算法 4 的共轭梯度法截断到单次迭代。每轮 EM 迭代中，我们为每对 $(\mathbf y,\mathbf A)$ 生成一个潜变量 $\mathbf x$；每轮 EM 迭代（含采样与训练）在 4 块 A100（40GB）GPU 上约需 4 小时。我们用 torch-fidelity [106] 包评估生成图像的 Inception score（IS）[83] 与 Fréchet Inception distance（FID）[84]。

**加速 MRI。** 噪声条件网络架构与损坏 CIFAR-10 实验相同。$320\times320\times1$ 张量 $\mathbf x_t$ 在进入网络前经像素重排 [107] 变为 $80\times80\times16$ 张量。我们用算法 1 训练 $K=16$ 轮 EM 迭代，每轮在训练集（$2\times24{,}853$ 张图像）上训练 64 个 epoch。为防止过拟合，图像做水平翻转与随机裁剪增强；优化器在每轮 EM 迭代后重新初始化，其他超参数见表 3。我们用算法 2（$T=64$ 个离散化步、$\eta=1$）从后验 $q_\theta(\mathbf x|\mathbf y,\mathbf A)$ 采样，并把算法 4 的共轭梯度法截断到 3 次迭代。每轮 EM 迭代中，我们为每对 $(\mathbf y,\mathbf A)$ 生成 2 个潜变量 $\mathbf x$（作为数据增强）；每轮 EM 迭代（含采样与训练）在 4 块 A100（40GB）GPU 上约需 3 小时。

## 附录 D 附加图

**图 7：** 低维流形实验中真值分布 $p(\mathbf x)$ 的 1 维与 2 维边缘分布；该分布位于 $\mathbb R^5$ 中随机 1 维流形上。（来源：原文第 21 页。）

**图 8：** CIFAR-10 实验中沿 EM 迭代（$k=1,2,4,8,16,32$）的后验 $q_{\theta_k}(\mathbf x|\mathbf y)$ 样本示例；生成图像逐渐更精细、噪声更少。（来源：原文第 22 页。）

**图 9：** 当对 $\mathbb V[\mathbf x|\mathbf x_t]$ 使用启发式 $(I+\boldsymbol\Sigma_t^{-1})^{-1}$ 时，CIFAR-10 实验沿 EM 迭代的后验样本示例；生成图像逐渐更精细但仍有噪声残留。（来源：原文第 22 页。）

**图 10：** 当对 $\mathbb V[\mathbf x|\mathbf x_t]$ 使用启发式 $\boldsymbol\Sigma_t$ 时，CIFAR-10 实验沿 EM 迭代的后验样本示例；生成图像仍非常嘈杂。（来源：原文第 22 页。）

**图 11：** fastMRI [7, 8] 数据集扫描切片示例。（来源：原文第 23 页。）

**图 12：** 加速 MRI 实验中加速度因子 $R=6$ 的 k 空间子采样观测示例；每个观测以其零填充反演表示（在逆离散 Fourier 变换前把缺失频率置零）。（来源：原文第 23 页。）

**图 13：** 加速 MRI 实验中最终模型 $q_{\theta_k}(\mathbf x)$ 的样本示例；样本呈现多样且连贯的全局结构，看起来比真实扫描（图 11）略不锐利，但没有未解析频率的典型伪影（图 12）。（来源：原文第 24 页。）

**图 14：** 仅用 k 空间观测训练的扩散先验的后验样本示例（前向过程把潜变量 $\mathbf x$ 裁剪为居中的 $160\times160$ 窗口，使用矩匹配后验采样）；样本在观测处与真值一致、在其他处呈现合理变化。（来源：原文第 24 页。）

**图 15：** 加速 MRI 实验中对 $\mathbb V[\mathbf x|\mathbf x_t]$ 使用启发式 $(I+\boldsymbol\Sigma_t^{-1})^{-1}$ 时，$k=2$ 轮 EM 迭代后的模型 $q_{\theta_k}(\mathbf x)$ 样本示例；样本开始出现因采样不佳导致的垂直伪影。（来源：原文第 25 页。）

**图 16：** 同样设定下 $k=4$ 轮 EM 迭代后的样本示例；不佳采样引入的伪影在每轮迭代中被放大，导致几轮后完全崩溃。（来源：原文第 25 页。）

## 附录 E MMPS 评估

本节独立于"从观测学习"的语境评估 §4.2 提出的矩匹配后验采样（MMPS）。本节代码见 https://github.com/francois-rozet/mmps-benchmark 。

**任务。** 我们在 $256\times256$ 的 FFHQ [99] 数据集上考虑四个线性逆问题：(i) **方框修复**：掩蔽随机定位的 $128\times128$ 像素方块并加入大量噪声（$\sigma_y=1$）；(ii) **随机修复**：以 98% 概率随机删除像素并加入少量噪声（$\sigma_y=0.01$）；(iii) **运动去模糊**：施加随机生成的 $61\times61$ 运动模糊核并加入中等噪声（$\sigma_y=0.1$）；(iv) **超分辨率**：施加 4× 双三次下采样并加入中等噪声（$\sigma_y=0.1$）。

**方法。** 对所有逆问题，我们使用 Chung 等 [21] 提供的预训练扩散模型作为扩散先验。我们改造并扩展 DPS [21] 代码库以支持 MMPS 以及 DiffPIR [26]、ΠGDM [22] 与 TMPD [25]。所有方法使用 DDIM [50] 采样器且 $\eta=1$（等价于 DDPM [16] 采样器）。我们微调 DPS（$\zeta'=0.5$）与 DiffPIR（$\lambda=8.0$）的超参数以在四个任务上取得最佳结果。使用 MMPS 时，我们发现 Chung 等 [21] 提供的预训练模型 Jacobian 在 $\sigma_t$ 较大时强非对称、非正定，导致共轭梯度（CG）[72] 迭代不稳定；因此我们用可求解非对称非正定线性系统的 GMRES [75] 求解器替代 CG。

**协议。** 我们对 FFHQ [99] 数据集 100 张图像¹ 的每个逆问题生成一个观测，并用所有考虑的后验采样方法为每个观测生成一个样本；所有方法使用相同随机种子。我们为每个样本计算三个标准图像重建指标——LPIPS [108]、PSNR 与 SSIM [109]——并在表 4 中报告其平均值，各逆问题的生成样本见图 17、18、19。需附带说明的是，重建指标未必反映我们所关心的推断后验分布的准确性：例如 PSNR 与 SSIM [109] 偏好平滑预测（如均值 $\mathbb E[\mathbf x|\mathbf y]$）而非后验 $p(\mathbf x|\mathbf y)$ 的真实样本；相反 LPIPS [108] 偏好与参考感知相似但可能失真的预测。一般而言不可能同时优化所有重建指标 [87, 88]。

> **脚注 1（原文）：** Chung 等 [21] 未说明其模型使用 FFHQ [99] 的哪个子集训练；在缺乏进一步信息时，我们选择前 100 张图像做评估，若扩散先验曾在其上训练可能导致指标有偏；但由于所有后验采样方法使用同一扩散先验，评估仍属公平。

**结果。** MMPS 在定性上与定量上均一致优于所有基线。正如预期，增加求解器迭代次数会提升样本质量，尤其当 Gram 矩阵 $\mathbf A\mathbf A^\top$ 强非对角时（运动去模糊任务即如此）；然而改进迅速出现递减收益——1 次与 3 次迭代之间的差异远大于 3 次与 5 次之间。MMPS 对采样步数也显著稳定，而 DPS [21]、DiffPIR [26] 与 ΠGDM [22] 对步数与超参数选择敏感。最后，MMPS 需要更少的采样步即可达到与先前方法相同的图像质量，这在很大程度上弥补了其略高的单步代价。

**表 4：MMPS 在 1、3、5 次求解器迭代下的定量评估。**（来源：原文第 27 页。）

| 方法 | 步数 | 方框修复 LPIPS↓ | PSNR↑ | SSIM↑ | 随机修复 LPIPS↓ | PSNR↑ | SSIM↑ | 运动去模糊 LPIPS↓ | PSNR↑ | SSIM↑ | 超分辨率 LPIPS↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DiffPIR [26] | 10 | 0.33 | 19.17 | 0.50 | 0.78 | 10.97 | 0.32 | 0.24 | 24.54 | 0.72 | 0.20 | 26.63 | 0.78 |
| DiffPIR [26] | 100 | 0.30 | 18.15 | 0.54 | 0.68 | 10.26 | 0.25 | 0.19 | 23.97 | 0.70 | 0.17 | 25.24 | 0.73 |
| DiffPIR [26] | 1000 | 0.33 | 17.39 | 0.49 | 0.74 | 9.51 | 0.21 | 0.17 | 23.55 | 0.67 | 0.15 | 24.72 | 0.70 |
| DPS [21] | 10 | 0.64 | 10.41 | 0.34 | 0.58 | 12.68 | 0.43 | 0.75 | 8.63 | 0.27 | 0.58 | 12.01 | 0.41 |
| DPS [21] | 100 | 0.38 | 16.82 | 0.50 | 0.39 | 16.66 | 0.49 | 0.29 | 19.75 | 0.57 | 0.35 | 18.29 | 0.54 |
| DPS [21] | 1000 | 0.22 | 21.01 | 0.64 | 0.19 | 21.90 | 0.66 | 0.18 | 22.91 | 0.66 | 0.16 | 25.02 | 0.72 |
| ΠGDM [22] | 10 | 0.40 | 18.94 | 0.61 | 0.59 | 11.28 | 0.40 | 0.25 | 25.83 | 0.76 | 0.25 | 26.42 | 0.77 |
| ΠGDM [22] | 100 | 0.44 | 18.23 | 0.47 | 0.39 | 17.03 | 0.48 | 0.25 | 22.37 | 0.61 | 0.15 | 25.63 | 0.71 |
| ΠGDM [22] | 1000 | 0.81 | 14.80 | 0.31 | 0.14 | 22.32 | 0.69 | 1.06 | 13.12 | 0.21 | 0.64 | 18.41 | 0.29 |
| TMPD [25] | 10 | 0.36 | 19.90 | 0.64 | 0.59 | 11.08 | 0.40 | 0.27 | 25.28 | 0.74 | 0.26 | 26.07 | 0.76 |
| TMPD [25] | 100 | 0.27 | 19.86 | 0.64 | 0.58 | 10.73 | 0.31 | 0.17 | 26.22 | 0.76 | 0.17 | 26.79 | 0.77 |
| TMPD [25] | 1000 | 0.25 | 19.53 | 0.62 | 0.68 | 9.98 | 0.25 | 0.14 | 25.91 | 0.74 | 0.14 | 26.53 | 0.76 |
| MMPS (1) | 10 | 0.27 | 21.19 | 0.68 | 0.26 | 22.41 | 0.69 | 0.33 | 22.12 | 0.66 | 0.24 | 26.94 | 0.78 |
| MMPS (1) | 100 | **0.20** | 21.19 | 0.67 | 0.18 | 22.18 | 0.69 | 0.20 | 23.92 | 0.71 | 0.15 | 27.32 | 0.79 |
| MMPS (1) | 1000 | 0.19 | 20.77 | 0.64 | 0.18 | 21.94 | 0.66 | 0.16 | 23.83 | 0.69 | 0.12 | 26.92 | 0.77 |
| MMPS (3) | 10 | 0.26 | 21.55 | 0.68 | 0.21 | 23.58 | 0.74 | 0.24 | 25.33 | 0.75 | 0.19 | 27.94 | 0.81 |
| MMPS (3) | 100 | 0.20 | 21.29 | 0.67 | **0.15** | 22.76 | 0.71 | **0.15** | 26.16 | 0.76 | 0.13 | 27.18 | 0.78 |
| MMPS (3) | 1000 | 0.19 | 21.01 | 0.64 | 0.15 | 22.45 | 0.68 | 0.12 | 25.73 | 0.74 | **0.11** | 26.69 | 0.76 |
| MMPS (5) | 10 | 0.23 | **21.73** | **0.69** | 0.20 | **23.72** | **0.75** | 0.20 | **26.70** | **0.78** | 0.18 | **28.02** | **0.81** |
| MMPS (5) | 100 | 0.20 | 21.30 | 0.67 | 0.15 | 22.82 | 0.72 | 0.13 | **26.70** | 0.77 | 0.13 | 27.12 | 0.78 |
| MMPS (5) | 1000 | 0.20 | 20.98 | 0.64 | **0.14** | 22.52 | 0.69 | **0.11** | 26.18 | 0.75 | **0.11** | 26.60 | 0.76 |

**表 5：4× 超分辨率任务中 MMPS 的时间与内存复杂度。** 每次求解器迭代使每步时间增加约 16 ms；MMPS 分配的最大内存比 DPS [21] 与 ΠGDM [22] 约大 10%。（来源：原文第 27 页。）

| 方法 | VJP 次数 | 时间 [ms/步] | 内存 [GB] |
|---|---|---|---|
| DiffPIR [26] | 0 | 30.2 | 0.66 |
| DPS [21] | 1 | 40.5 | 2.29 |
| ΠGDM [22] | 1 | 47.6 | 2.30 |
| TMPD [25] | 2 | 62.2 | 2.52 |
| MMPS (1) | 2 | 58.0 | 2.52 |
| MMPS (3) | 4 | 90.1 | 2.52 |
| MMPS (5) | 6 | 122.1 | 2.52 |

**图 17：** MMPS 在 1 次与 5 次求解器迭代下的定性评估（方框修复、随机修复、运动去模糊、超分辨率；10/100/1000 步）。（来源：原文第 28 页。）

**图 18：** DPS [21] 与 DiffPIR [26] 的定性评估（同四任务、同三步数）。（来源：原文第 28 页。）

**图 19：** ΠGDM [22] 与 TMPD [25] 的定性评估（同四任务、同三步数）。（来源：原文第 29 页。）

## NeurIPS 论文清单

> 原文此处为 NeurIPS 2024 官方清单。以下逐项转录**问题与答案**，并附原文 justification 的译文；官方指南性说明文字从简（省略）。

1. **主张：** 摘要与引言中的主要主张是否准确反映论文贡献与范围？**[Yes]** —— 我们仅声称提出一种新方法（第 4 节描述），并在第 5 节与第 6 节与先前方法比较。
2. **局限：** 论文是否讨论作者工作的局限？**[Yes]** —— 我们在第 7 节讨论局限。
3. **理论假设与证明：** 对每个理论结果，是否提供完整假设与完整（且正确）的证明？**[NA]** —— 未提出新理论结果，方法由已有文献支撑。
4. **实验结果可复现性：** 论文是否充分披露复现主要实验结果所需的所有信息？**[Yes]** —— 稿件描述了所有方法与实验，并提供了算法；全部实验代码见 https://github.com/francois-rozet/diffusion-priors 。
5. **数据与代码的开放获取：** 论文是否提供数据与代码的开放获取及充分说明以忠实复现主要实验结果？**[Yes]** —— 全部实验代码见 https://github.com/francois-rozet/diffusion-priors ，并提供了获取数据集的说明。
6. **实验设置/细节：** 论文是否给出理解结果所需的所有训练与测试细节（如数据划分、超参数及其选择方式、优化器类型等）？**[Yes]** —— 实验细节见附录 C。
7. **实验统计显著性：** 论文是否恰当且正确地报告误差棒或其他统计显著性信息？**[No]** —— 为表 1 与图 4 计算误差棒需要对每个模型在不同数据集上重新训练多次。
8. **实验计算资源：** 对每个实验，论文是否提供复现所需计算资源（计算单元类型、内存、执行时间）的充分信息？**[Yes]** —— 实验细节见附录 C；我们在致谢中说明使用了计算机集群；初步实验未在稿件中报告。
9. **伦理准则：** 论文研究是否在各方面符合 NeurIPS 伦理准则？**[Yes]** —— 我们已阅读并同意 NeurIPS 伦理准则。
10. **更广泛影响：** 论文是否讨论工作的潜在正面与负面社会影响？**[NA]** —— 本工作没有社会影响。
11. **防护措施：** 论文是否描述了为负责任发布高误用风险数据或模型所设的防护措施？**[NA]** —— 本论文不构成此类风险。
12. **既有资产的许可：** 论文所用资产（如代码、数据、模型）的创建者或原始所有者是否被恰当署名，许可与使用条款是否被明确提及并恰当遵守？**[Yes]** —— 我们在致谢中声明使用 NYU fastMRI 数据集 [7, 8] 并遵守其使用条款。
13. **新资产：** 论文引入的新资产是否有充分文档，且文档是否随资产提供？**[NA]** —— 论文未发布新资产。
14. **众包与人类受试者研究：** 对众包实验与人类受试者研究，论文是否包含给参与者的完整说明与截图（如适用）以及报酬细节？**[NA]** —— 论文不涉及众包，也不涉及人类受试者研究。
15. **机构审查委员会（IRB）批准或等效审查：** 论文是否描述研究参与者可能承担的风险、是否向受试者披露该风险、以及是否获得 IRB 批准（或依据所在国家/机构要求的等效批准/审查）？**[NA]** —— 论文不涉及众包，也不涉及人类受试者研究。

## 图注与表注

**图注汇总：** 图 1（原文第 5 页）流形先验下高斯近似的后验示意；图 2（第 5 页）不同 $\mathbb V[\mathbf x|\mathbf x_t]$ 启发式的 Sinkhorn 散度；图 3（第 6 页）低维流形实验中 $q_{\theta_k}(\mathbf x)$ 的 2 维边缘沿 EM 迭代；图 4（第 7 页）损坏 CIFAR-10 的 FID 随 EM 迭代变化；图 5（第 7 页）损坏 CIFAR-10 沿 EM 迭代的样本；图 6（第 8 页）加速 MRI 的后验样本；图 7（第 21 页）低维流形实验的真值分布边缘；图 8—10（第 22 页）CIFAR-10 后验样本（Tweedie / $(I+\Sigma_t^{-1})^{-1}$ / $\Sigma_t$）；图 11（第 23 页）fastMRI 扫描切片；图 12（第 23 页）k 空间子采样观测；图 13（第 24 页）加速 MRI 先验样本；图 14（第 24 页）另一前向过程（中心 $160\times160$ 裁剪）的后验样本；图 15—16（第 25 页）启发式 $(I+\Sigma_t^{-1})^{-1}$ 下 $k=2$、$k=4$ 轮迭代的样本与伪影累积；图 17（第 28 页）MMPS 定性评估；图 18（第 28 页）DPS 与 DiffPIR 定性评估；图 19（第 29 页）ΠGDM 与 TMPD 定性评估。

**表注汇总：** 表 1（原文第 7 页）损坏 CIFAR-10 上最终模型评估（FID/IS）；表 2（第 19 页）低维流形实验超参数；表 3（第 20 页）损坏 CIFAR-10 与加速 MRI 超参数；表 4（第 27 页）MMPS 在 1/3/5 次求解器迭代下的定量评估（四任务 × LPIPS/PSNR/SSIM × 三步数）；表 5（第 27 页）4× 超分辨率的 MMPS 时间与内存复杂度。**核对方式：** 表 1、表 2、表 4、表 5 已用 `render.py` 渲染 PDF 第 7、19、27 页并逐格核对；表 3 按原文文本抽取逐格转录。

**本页范围与校对状态：** 本页覆盖 NeurIPS 2024 会议论文集版本（本地 36 页）全文：摘要、第 1—7 节、致谢、参考文献 [1]—[109]（英文原条目）、附录 A（算法 1—4）、B（定理 1 及式 (25)(26) 证明）、C（实验细节与式 (27)(28)、表 2—3）、D（图 7—19）、E（MMPS 评估、表 4—5）、NeurIPS 论文清单（15 项）、图 1—19 图注、表 1—5、式（1）—（28）。**许可状态：会议论文集版本，再传播许可待核验；本页仅作学习用途、不计入可公开全文统计（已在页首声明）。** 表格核对：表 1、表 2、表 4、表 5 已用 `render.py` 渲染 PDF 第 7、19、27 页逐格核对，表 3 按原文文本抽取转录。原文疑点/说明已在页首译注列出（两处拼写错误、$\pi_k$ 记号并存、定理 1 与式 (2) 的 $\alpha_t$ 一致性、§5.3 不报告 PSNR/SSIM 的说明、清单第 3 项为 NA 等），均按原文照录并加注。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内图像未数字化转写。因此本页不标记为已验收全文；若需核对具体公式或数值，请以本地会议论文集 PDF 为准。
{% endraw %}