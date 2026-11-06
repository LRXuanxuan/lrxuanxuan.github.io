---
layout: page
title: "随机生成式即插即用先验｜中文全文译文"
permalink: /papers/translations/2026-11-06-2604-03603-stochastic-generative-plug-and-play-priors/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3c7dcba9604157d2/) · [原文 arXiv](https://arxiv.org/abs/2604.03603/) · [全部目录](/papers/catalog/)

# 随机生成式即插即用先验

**原题：** Stochastic Generative Plug-and-Play Priors  
**作者：** Chicago Y. Park¹、Edward P. Chandler¹、Yuyang Hu²、Michael T. McCann³、Cristina Garcia-Cardona³、Brendt Wohlberg³、Ulugbek S. Kamilov¹（¹UW–Madison 威斯康星大学麦迪逊分校；²WashU 圣路易斯华盛顿大学；³Los Alamos National Laboratory 洛斯阿拉莫斯国家实验室；通讯邮箱 kamilov@wisc.edu）  
**版本：** arXiv:2604.03603v2，[cs.CV]，2026-10-30；16 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–6 节（§1 引言、§2 背景、§3 方法含 §3.1–3.2、§4 理论分析含 §4.1–4.2、§5 数值评估含 §5.1–5.4、§6 结论）、式 (1)–(32) 编号（含 §4 核心的式 (17)–(21)）、定义 1–2、假设 1–4、定理 1–2、引理 1–3（证明按原文精炼转述并保留关键步骤）、算法 1–3（逐行）、表 1–15 逐格转写、图 1–5 图注、附录 A–D 与致谢、参考文献 [1]–[51] 英文原条目；许可：CC BY 4.0。逐句逐式终校未做。

## 摘要

即插即用（plug-and-play, PnP）方法通过把去噪器嵌入优化算法，被广泛用于求解成像逆问题。基于分数的扩散模型（score-based diffusion models, SBDMs）近来凭借在很宽噪声水平范围内训练的去噪器展现出强大的生成性能。尽管二者都依赖去噪器，但如何在不依赖反向扩散采样的前提下把 SBDM 系统地用作 PnP 框架内的先验，仍不清楚。本文建立了 PnP 的基于分数的解释，从而为在 PnP 算法中直接使用预训练 SBDM 提供依据。基于这一联系，我们提出**随机生成式 PnP（stochastic generative PnP, SGPnP）**框架，它用**随机重加噪（stochastic re-noising）**更好地利用预训练 SBDM 宽广的噪声水平条件化能力，在严重病态逆问题中显著提升重建质量。我们证明，噪声注入会在一个**高斯平滑（Gaussian-smoothed）目标**上诱导优化，并在适当条件下使算法能够避开严格鞍点。在具有挑战性的逆任务（如多线圈 MRI 重建与大掩膜自然图像修补）上的实验表明，该方法相对常规 PnP 方法有一致改进，并取得与基于扩散的求解器相当的性能。代码见 https://github.com/uw-cig/SGPnP 。

## 1 引言

从残缺且含噪的测量中恢复未知图像是计算成像的基础问题。这类逆问题出现在广泛的应用中，包括图像去模糊、超分辨率、修补与磁共振成像（magnetic resonance imaging, MRI）。

**即插即用先验（PnP）**[1] 是一个通过在“强制测量一致性”与“用学习到的去噪器施加先验信息”之间交替来求解成像逆问题的框架。通过用预训练去噪器替代显式的解析先验（例如全变差），PnP 能够在保留基于优化的求解器灵活性的同时利用强大的学习图像统计。这种模块化使 PnP 成为各类成像任务中广受欢迎的方法。

尽管取得了成功，PnP 方法在严重病态的逆问题中仍面临挑战（见图 1）。有两个因素导致这一局限。第一，会出现**分布失配（distribution mismatch）**：PnP 的中间迭代量包含的是结构化伪影而非加性高斯噪声，结果去噪器常在其训练噪声范围之外被使用 [2]。第二，PnP 中通常使用的去噪器**表达能力有限**。BM3D [3] 等经典去噪器能处理较大噪声水平，但依赖手工设计的图像模型而非学习到的图像统计；而学习型去噪器只在有限的噪声范围内训练。二者都无法充分刻画图像分布，以处理严重退化的图像——在这些情形中存在大量歧义或信息缺失，需要很强的先验。近来一种**随机重加噪**策略 [4] 通过在去噪前注入噪声部分缓解了分布失配；但该方法仍依赖低噪声去噪器，在强病态情形下改进有限，如图 1 所示。

**基于分数的扩散模型（SBDM）**[6–8] 近来已成为强大的图像生成框架。与仅限于低噪声情形的常规去噪器 [1, 5, 9] 不同，SBDM 在很宽的噪声水平范围内训练。通过学习**分数（score）**——含噪数据对数密度的梯度——SBDM 能够通过迭代采样把噪声变换为真实图像。受其生成能力驱动，近期工作 [10–21] 探索了把测量一致性纳入采样过程的基于扩散的逆问题求解器，在诸如盒式修补（box inpainting）等严重病态情形中取得亮眼结果（综述见 [22]）。

尽管 PnP 与 SBDM 都依赖去噪器，但如何在不于每个优化步都依赖反向扩散采样的前提下，把预训练 SBDM 系统地作为先验纳入 PnP 算法，仍不清楚。本文通过提供一个完整且有原则的框架来弥补这一空白，使预训练 SBDM 能在 PnP 迭代内作为有效先验使用。我们的贡献如下：

- **随机生成式 PnP 框架：** 我们提出随机生成式 PnP（SGPnP），在去噪器输入端对迭代量重新加噪，使预训练 SBDM 能在其**完整噪声范围**内被查询，并**无需反向扩散过程**即可整合进基于优化的 PnP。
- **SGPnP 的理论保证：** 我们建立了 PnP 文献中**首个严格鞍点规避（strict saddle-point avoidance）保证**，表明在明确陈述的条件下，噪声注入使 SGPnP 能够避开严格鞍点。进一步地，在**退火噪声计划**下，SGPnP 在期望意义下收敛到**精确（未平滑）MAP 目标**的稳定点。
- **SGPnP 的经验改进：** 在使用与确定性对应方法**相同的基于分数的先验**时，SGPnP 在盒式修补、超分辨率、去模糊与 CS-MRI 上显著提升重建质量。

本文是我们会议论文 [23] 的扩展。会议论文建立了如何在确定性 PnP 方法中使用预训练 SBDM 去噪器，本文在此基础上新增三项贡献。第一，我们提出 SGPnP 框架，用随机重加噪在严重病态逆问题中显著提升重建质量。第二，我们为 SGPnP 给出理论保证，包括 PnP 方法中首个鞍点规避结果，以及退火噪声下的平稳性收敛。第三，我们在自然 RGB 图像与脑部 MRI 上给出数值验证，展示相对既有 PnP 方法的实质改进。

**图 1（原文 Fig. 1）：** 确定性 PnP [5]、随机 PnP [4] 与 SGPnP 在三种修补任务上的比较：随机掩膜、小缺失区域的盒式掩膜、大缺失区域的盒式掩膜。确定性 PnP 只在随机修补上成功；随机 PnP 把它扩展到小盒式掩膜，但对大缺失区域失效。相比之下，所提 SGPnP 在三种设定下都表现可靠。

## 2 背景

**成像逆问题（Imaging Inverse Problems）。** 成像逆问题旨在从含噪测量 \(y\in\mathbb R^m\) 中恢复未知信号 \(x\in\mathbb R^n\)，其模型为

$$
y=A(x)+e,\tag{1}
$$

其中 \(A:\mathbb R^n\to\mathbb R^m\) 表示前向算子，\(e\sim\mathcal N(0,\eta^2\mathbf I)\) 表示噪声水平为 \(\eta\) 的加性高斯测量噪声。

一种常见做法是把重建表述为带正则的优化问题

$$
\widehat x\in\arg\min_{x\in\mathbb R^n}\ f(x)\quad\text{with}\quad f(x)=g(x)+h(x),\tag{2}
$$

其中 \(g(x)\) 是与观测 \(y\) 保持一致的数据保真项，\(h(x)\) 是编码关于 \(x\) 的先验知识的正则项。从贝叶斯视角看，当

$$
g(x)=-\log p(y\mid x),\qquad h(x)=-\log p(x)\tag{3}
$$

时，(2) 就是最大后验（MAP）估计，这里 \(p(y\mid x)\) 是似然模型、\(p(x)\) 是先验分布。在许多成像系统中 \(e\) 被建模为加性白高斯噪声，此时数据保真项简化为平方 \(\ell_2\) 项 \(g(x)=\tfrac12\|y-A(x)\|_2^2\)。

**传统 PnP 重建（Traditional PnP Reconstruction）。** 近端分裂算法 [24] 被广泛用于求解形如 (2) 的优化问题，尤其是当数据保真项 \(g\) 或正则项 \(h\) 非光滑时。这些方法的一个核心概念是与 \(h\) 关联的**缩放近端算子（scaled proximal operator）**：

$$
\operatorname{prox}_{\gamma h}(z):=\arg\min_{x\in\mathbb R^n}\left\{\frac12\left\|x-z\right\|_2^2+\gamma h(x)\right\},\tag{4}
$$

其中 \(\gamma>0\) 是缩放参数。从概率视角看，近端算子可解释为加性白高斯噪声（AWGN）去噪问题的 MAP 估计，此时 \(h(x)\) 对应负对数先验。

PnP 方法利用这一解释：在迭代优化算法中用通用图像去噪器 \(D:\mathbb R^n\to\mathbb R^n\) 替代近端算子 \(\operatorname{prox}_{\gamma h}\)，同时保持数据保真更新不变。

一个代表性例子是 PnP-ADMM [1, 25, 26]，它用预训练图像去噪器 \(D_\theta\) 替代 ADMM 中的 \(\operatorname{prox}_{\gamma h}\)（\(\theta\) 为去噪器参数），得到迭代

$$
x^k\leftarrow\operatorname{prox}_{\gamma g}\left(z^{k-1}-s^{k-1}\right)\tag{5a}
$$
$$
z^k\leftarrow D_\theta\left(x^k+s^{k-1};\sigma^k\right)\tag{5b}
$$
$$
s^k\leftarrow s^{k-1}+x^k-z^k,\tag{5c}
$$

其中 \(\sigma^k\) 表示第 \(k\) 次迭代的条件化噪声水平，控制去噪强度。相关的确定性 PnP 表述出现在去噪正则化（RED）[9] 以及基于半二次分裂（HQS）的方法中，例如深度即插即用图像复原（DPIR）[5]——它们把去噪器作为先验用于基于梯度或基于分裂的迭代方案中。另一个相关框架是多尺度能量方法 [27]，它学习一个跨越宽噪声范围的显式能量泛函，并以确定性方式最小化所得能量以计算 MAP 估计，其理论保证单调收敛到稳定点。

**随机 PnP 重建（Stochastic PnP Reconstruction）。** PnP 重建的随机变体已被探索，若干方法 [28–34] 通过小批量近似引入随机性以提升计算效率。

与我们设定更接近的是**随机去噪正则化（SNORE）**[4]，它通过向去噪器输入注入高斯噪声，把随机性引入 PnP，以减小 PnP 中间迭代量与去噪器训练所假设噪声统计之间的失配。具体而言，它通过对扰动后的迭代量施加去噪器来构造显式随机正则项，并建立到相应**平滑目标**临界点的收敛保证。例如，PnP-ADMM 中的这类随机更新可写为

$$
z^k=D_\theta\left(x^k+s^{k-1}+\sigma_{\mathrm{inject}}n;\sigma_{\mathrm{inject}}\right),\tag{6}
$$

其中 \(n\sim\mathcal N(0,\mathbf I)\)，\(\sigma_{\mathrm{inject}}\) 控制注入噪声水平。尽管这一视角改善了理论稳定性并部分缓解了分布失配，相对确定性 PnP 的经验改进仍然有限。例如在 [4, Table 1] 的去模糊实验中，SNORE 在各噪声水平上的 PSNR 比相应的确定性 PnP 方法低约 0.6–0.7 dB，仅偶尔改善感知指标。因此，随机 PnP 方法应当如何设计才能有效求解逆问题，仍是一个开放问题。

**PnP 扩散模型（PnP Diffusion Models）。** 近期把扩散先验与数据一致性更新结合的方法大致分为两类：(a) 把数据保真整合进扩散采样过程；(b) 在 PnP 重建算法中纳入生成式采样步。

第一类方法通过把测量一致性直接注入采样轨迹来修改反向扩散过程 [10–14, 18]。例如，扩散后验采样（DPS）[14] 用去噪估计 \(\widehat x_\theta(x_t)\) 近似似然梯度：

$$
\nabla_{x_t}\log p(y\mid x_t)\approx-\frac{1}{\eta^2}\nabla_{x_t}\left\|y-A\left(\widehat x_\theta(x_t)\right)\right\|_2^2,\tag{7}
$$

其中 \(\eta\) 是测量噪声水平。类似地，用于即插即用图像复原的去噪扩散模型（DiffPIR）[12] 在继续反向扩散迭代之前，对干净图像估计施加近端数据一致性步。另一相关方法 [35] 通过重加噪使去噪器输入接近其训练所用的白高斯情形，但它是在反向扩散轨迹内使用**有色噪声**这样做（每个扩散步运行多次去噪器评估）。第二类方法 [16, 17, 19–21] 则用生成式采样过程替代 PnP 中的确定性去噪器，从而把 PnP 变成随机后验采样方案，而不再是一个优化算法。

与上述两类做法不同，我们的框架保留了 PnP 求解 (2) 的**以优化为中心**的表述，而不是把它改写为生成式采样过程。我们只把扩散模型当作在宽噪声范围上运行的去噪器使用，不在 PnP 内嵌入生成步。此外，我们引入一种噪声注入机制，既缓解中间迭代量与去噪器训练分布之间的失配，又使算法能够逃离鞍点。

## 3 方法

### 3.1 面向 PnP 的分数适配

我们首先说明如何把预训练 SBDM 网络适配为 PnP 算法内的去噪器。该做法使 PnP 算法能够用基于分数的正则项求解 (2)，而无需反向扩散迭代。

**把分数与去噪联系起来（Relating Score to Denoising）。** Tweedie 公式 [36] 把 MMSE 去噪器与分数函数联系起来。为适配各类 SBDM，我们定义一般的噪声扰动方案

$$
x_{c\sigma}=c\left(x+\sigma n\right),\qquad n\sim\mathcal N(0,\mathbf I),\tag{8}
$$

其中 \(c\in\mathbb R_+\) 是缩放因子，\(\sigma\) 是噪声水平。Tweedie 公式给出一般的基于分数的去噪模板

$$
D_\theta(x;\sigma)=x+c\sigma^2\nabla\log p_{c\sigma}(cx),\tag{9}
$$

其中 \(p_{c\sigma}\) 是缩放后含噪观测的密度。当 \(c\to1\) 且 \(\sigma\to0\) 时，它趋近无噪声图像分布 \(p(x)\)。我们把该模板应用于两类常见 SBDM：

**方差爆炸型 SBDM（Variance-Exploding SBDMs）[7]。** 方差爆炸（VE）扩散模型使用噪声污染过程 \(x_{\sigma_t}=x+\sigma_tn\) 训练。把它与 (8) 中的一般噪声扰动方案匹配可得 \(c=1\)、\(\sigma=\sigma_t\)。于是可用 (9) 把预训练 VE 扩散模型映射为 PnP 去噪器：

$$
D_\theta(x;t)=x+\sigma_t^2\,s_\theta^{\mathrm{VE}}(x,t),\tag{10}
$$

其中 \(s_\theta^{\mathrm{VE}}(x,t)\) 是时间步条件化的 VE 分数网络，用于逼近 \(\nabla\log p_{\sigma_t}(x)\)。

**方差保持型 SBDM（Variance-Preserving SBDMs）[6]。** 方差保持（VP）扩散模型使用噪声污染过程

$$
x_{\bar\alpha_t}=\sqrt{\bar\alpha_t}\left(x+\sqrt{\frac{1-\bar\alpha_t}{\bar\alpha_t}}\,n\right)\tag{11}
$$

训练，其中 \(\bar\alpha_t=\prod_{s=1}^{t}\alpha_s\)，且 \(\alpha_t\) 的选取使 \(x_{\bar\alpha_0}\) 服从期望的概率分布、\(x_{\bar\alpha_T}\) 服从标准正态分布。把它与 (8) 中的噪声扰动方案匹配可得 \(c=\sqrt{\bar\alpha_t}\)、\(\sigma=\sqrt{(1-\bar\alpha_t)/\bar\alpha_t}\)。于是 VP 扩散模型可映射为 PnP 去噪：

$$
D_\theta(x;t)=x+\left(1-\bar\alpha_t\right)\sqrt{\bar\alpha_t}\,s_\theta^{\mathrm{VP}}\left(\sqrt{\bar\alpha_t}\,x,t\right),\tag{12}
$$

其中 \(s_\theta^{\mathrm{VP}}(x,t)\) 是时间条件化的 VP 分数网络，逼近 \(\nabla\log p_{\sqrt{\bar\alpha_t}\sigma}(x)\)，\(t\in[1,T]\) 参数化噪声水平。

**参数匹配（Parameter Matching）。** 在 PnP 中使用现成预训练 SBDM 的一个挑战是两种参数化之间的失配：许多预训练扩散模型以时间步 \(t\in\{1,\ldots,T\}\) 为条件（即离散的时间索引参数化），而 PnP 通常使用以连续噪声水平 \(\sigma\) 参数化的去噪器。为弥合这一差异，我们必须找出与查询噪声水平 \(\sigma\) 相对应的具体时间步 \(t\)。记 \(\rho(t)\) 为 SBDM 的有效噪声计划（例如 VE 下 \(\rho(t)=\sigma_t\)，VP 下 \(\rho(t)=\sqrt{(1-\bar\alpha_t)/\bar\alpha_t}\)）。我们的目标是计算逆映射 \(t=\rho^{-1}(\sigma)\)。由于 \(\rho(t)\) 只在整数索引 \(t\in\{1,\ldots,T\}\) 上有定义，我们把计划 \(\{\rho(t)\}_{t=1}^{T}\) 线性插值到高分辨率网格上，构造连续近似。形式上，给定 PnP 噪声水平 \(\sigma\)，我们通过对插值后的计划做数值反演来确定连续时间参数 \(t^\ast\)。这确保分数网络以 PnP 迭代所需的精确噪声方差为条件（我们在附录 C-C.8（表 13）报告了离散训练步之间分数时间步上的去噪性能）。确定 \(t^\ast\) 之后，令 \(t=t^\ast\) 并由相应的噪声扰动模型（VE 或 VP）导出缩放常数 \(c\)，去噪器参数即被完全确定。

**算法 1：SGPnP-ADMM**

**输入（Require）：** \(y\)、\(A\)、\(\gamma_k\)、\(\sigma_k^{\mathrm{inject}}\)、\(\sigma_k^{\mathrm{cond}}\)

1. \(x_0\leftarrow A^{\mathsf H}y\)，\(s_0\leftarrow\mathbf 0\)
2. **for** \(k=0\) **to** \(K-1\) **do**
3. 　\(z_k\leftarrow\operatorname{prox}_{\gamma_kg}\left(x_k-s_k\right)\)
4. 　\(n\sim\mathcal N(0,\mathbf I)\)
5. 　\(x_{\mathrm{input}}\leftarrow\left(s_k+z_k\right)+\sigma_k^{\mathrm{inject}}n\)
6. 　\(x_{k+1}\leftarrow D_\theta\left(x_{\mathrm{input}};\sigma_k^{\mathrm{cond}}\right)\)
7. 　\(s_{k+1}\leftarrow s_k+z_k-x_{k+1}\)
8. **end for**
9. **return** \(x_K\)

**算法 2：SGPnP-PGM**

**输入（Require）：** \(y\)、\(A\)、\(\tau_k\)、\(\gamma_k\)、\(\sigma_k^{\mathrm{inject}}\)、\(\sigma_k^{\mathrm{cond}}\)

1. \(x_0\leftarrow A^{\mathsf H}y\)
2. **for** \(k=0\) **to** \(K-1\) **do**
3. 　\(n\sim\mathcal N(0,\mathbf I)\)
4. 　\(x_{\mathrm{input}}\leftarrow x_k+\sigma_k^{\mathrm{inject}}n\)
5. 　\(\nabla h(x_k)=x_k-D_\theta\left(x_{\mathrm{input}};\sigma_k^{\mathrm{cond}}\right)\)
6. 　\(z_k\leftarrow\operatorname{prox}_{\gamma_kg}\left(x_k\right)\)
7. 　\(x_{k+1}\leftarrow z_k-\tau_k\nabla h(x_k)\)
8. **end for**
9. **return** \(x_K\)

**算法 3：SGPnP-RED**

**输入（Require）：** \(y\)、\(A\)、\(\tau_k\)、\(\gamma_k\)、\(\sigma_k^{\mathrm{inject}}\)、\(\sigma_k^{\mathrm{cond}}\)

1. \(x_0\leftarrow A^{\mathsf H}y\)
2. **for** \(k=0\) **to** \(K-1\) **do**
3. 　\(n\sim\mathcal N(0,\mathbf I)\)
4. 　\(x_{\mathrm{input}}\leftarrow x_k+\sigma_k^{\mathrm{inject}}n\)
5. 　\(\nabla g(x_k)=A^{\mathsf H}\left(Ax_k-y\right)\)
6. 　\(\nabla h(x_k)=\tau_k\left(x_k-D_\theta\left(x_{\mathrm{input}};\sigma_k^{\mathrm{cond}}\right)\right)\)
7. 　\(x_{k+1}\leftarrow x_k-\gamma_k\left(\nabla g(x_k)+\nabla h(x_k)\right)\)
8. **end for**
9. **return** \(x_K\)

### 3.2 所提生成式 PnP 框架

分数适配过程使预训练 SBDM 能够在 PnP 算法内充当噪声条件化去噪器。现在我们引入两个基于分数的 PnP 框架，把这些预训练 SBDM 整合进 PnP 的去噪步：基于分数的确定性 PnP（SDPnP）与随机生成式 PnP（SGPnP）。

**确定性的先验更新（Deterministic prior update）。** PnP 算法通常由交替的数据一致性与先验施加两步组成。一个通用模板可写为

$$
z_k=\mathrm{DC}_k\left(x_k;y\right),\qquad x_{k+1}=D_\theta\left(z_k;\sigma_k^{\mathrm{cond}}\right),\tag{13}
$$

其中 \(x_k\) 表示第 \(k\) 次迭代的当前重建估计，\(y\) 表示观测测量，\(z_k\) 是数据一致性（data consistency, DC）更新后得到的中间变量。算子 \(\mathrm{DC}_k\) 取决于所选的 PnP 算法（如 ADMM、HQS/DPIR 或 PGM），而先验步通过去噪 \(D_\theta\left(z_k;\sigma_k^{\mathrm{cond}}\right)\) 纳入学习到的图像统计，\(\sigma_k^{\mathrm{cond}}\) 控制去噪强度。

应用第 3.1 节导出的分数适配公式，(13) 中的去噪更新可直接由预训练 SBDM 去噪器实现。具体而言，视扩散训练表述而定，\(D_\theta\) 可对应 (10) 中基于 VE 的去噪器或 (12) 中基于 VP 的去噪器。我们把使用基于分数的先验的 PnP 算法称为**基于分数的确定性 PnP（SDPnP）**。

**随机的先验更新（Stochastic prior update）。** 虽然确定性先验更新直接施加 SBDM 去噪器，但数据一致性步产生的中间迭代量 \(z_k\) 一般并不服从去噪器训练输入那样的分布。特别地，\(z_k\) 未必能被很好地表示为“图像先验在给定噪声条件化水平下被高斯噪声污染”后的样本。为更好地利用 SBDM 宽广的噪声水平条件化能力，我们在去噪前引入一个显式的**重加噪**步，构成**随机生成式 PnP（SGPnP）**框架。具体而言，

$$
z_k=\mathrm{DC}_k\left(x_k;y\right),\qquad x_{k+1}=D_\theta\left(z_k+\sigma_k^{\mathrm{inject}}n;\sigma_k^{\mathrm{cond}}\right),\tag{14}
$$

其中 \(n\sim\mathcal N(0,\mathbf I)\)。这里 \(\sigma_k^{\mathrm{inject}}\) 控制随机扰动的幅度，而 \(\sigma_k^{\mathrm{cond}}\) 决定 SBDM 先验的去噪强度。我们让**注入噪声水平与条件化噪声水平解耦**，使去噪器强度可以同时考虑注入扰动与中间迭代量中的残余伪影。因此，SGPnP 把 PnP 中的确定性去噪操作改写为一个受控的随机转移，提升了成像逆问题中的稳健性（见算法 1–3）。我们在附录 D 中与一个相关的随机 PnP 框架做详细比较。

我们用**对数均匀退火（log-uniform annealing）**计划指定这两个噪声水平：对 \(k=0,\ldots,K-1\)，\(\sigma_k=\sigma_0\left(\sigma_{K-1}/\sigma_0\right)^{k/(K-1)}\)，其端点与步长在附录 B 中给出。我们以二者的比值 \(r=\sigma_k^{\mathrm{cond}}/\sigma_k^{\mathrm{inject}}\) 参数化这两个水平：\(r=1\) 复现 SNORE [4] 的匹配设定，\(r>1\) 则使去噪器以高于注入水平的噪声为条件。我们在 FFHQ 上默认取 \(r=1\)，在测量信息更丰富的 CS-MRI 问题上取 \(r>1\)。选取指南与完整扫描报告于附录 C-C.2，其中表明实践中只需对“更大的一个取值”做粗检查即可。

## 4 理论分析

我们现在分析算法 3 中在去噪器输入端加入高斯扰动的 SGPnP，并建立两项理论保证。第一，我们证明所得随机性在适当假设下能够**逃离严格鞍点**。借助非凸优化中随机梯度的结果 [37]，我们证明：在去噪器满足**方差保持（variance-preservation）**条件时，注入扰动沿**负曲率方向**诱导足够漂移，从而逃离平滑目标的严格鞍点。第二，我们分析**退火噪声计划**，并建立到**精确（未平滑）目标**稳定点的**期望意义**收敛。该分析覆盖**匹配噪声**情形 \(\sigma_k^{\mathrm{inject}}=\sigma_k^{\mathrm{cond}}=\sigma_k\)；相应地，下文 \(D_\theta(\cdot)\) 表示 \(D_\theta(\cdot;\sigma)\)。部分实验（例如表 7）使用的**解耦**设定 \(\sigma_k^{\mathrm{inject}}\ne\sigma_k^{\mathrm{cond}}\) 属于本理论未覆盖的经验扩展。

记 \(g(x)\) 为数据保真项，\(p(x)\) 为干净图像先验。沿用 [4]，我们定义高斯平滑后的先验 \(p_\sigma(x)=(p\ast G_\sigma)(x)\)，其中 \(G_\sigma\) 是对应于 \(\mathcal N(0,\sigma^2\mathbf I)\) 密度的各向同性高斯平滑核。相应的随机正则项为

$$
h_\sigma(x):=-\mathbb E_{n\sim\mathcal N(0,\mathbf I)}\left[\log p_\sigma(x+\sigma n)\right].\tag{15}
$$

我们定义随机向量场

$$
U_\sigma(x,n):=\sigma^{-2}\left(x-D_\theta(x+\sigma n)\right),\tag{16}
$$

其中 \(n\sim\mathcal N(0,\mathbf I)\) 通过注入扰动引入随机性。复合目标为 \(f_\sigma(x)=g(x)+h_\sigma(x)\)，而 SGPnP 迭代为

$$
x_{k+1}=x_k-\gamma_k\left(\nabla g(x_k)+U_{\sigma_k}(x_k,n_k)\right),\tag{17}
$$

其中 \(n_k\sim\mathcal N(0,\mathbf I)\)。我们把**隐式优化噪声**定义为随机向量场与其期望的偏差：

$$
w_k:=U_{\sigma_k}(x_k,n_k)-\mathbb E_{n\sim\mathcal N(0,\mathbf I)}\left[U_{\sigma_k}(x_k,n)\right].\tag{18}
$$

### 4.1 严格鞍点规避

**定义 1。** \(f_\sigma\) 的临界点 \(x^\dagger\) 若满足 \(\nabla f_\sigma(x^\dagger)=0\) 且 \(\nabla^2f_\sigma(x^\dagger)\) 至少有一个严格负特征值 [38]，则称其为**严格鞍点（strict saddle）**。

**假设 1。** 对每个固定的 \(\sigma>0\)，数据保真项 \(g\) 与正则项 \(h_\sigma\) 具有 Lipschitz 梯度（常数分别为 \(L_g\) 与 \(L_h(\sigma)\)）与 Lipschitz Hessian（常数分别为 \(\rho_g\) 与 \(\rho_h\)，其中 \(\rho_h\) 可依赖于 \(\sigma\)）。于是复合目标 \(f_\sigma\) 具有 \(L(\sigma)\)-Lipschitz 梯度与 \(\rho\)-Lipschitz Hessian，其中 \(L(\sigma)=L_g+L_h(\sigma)\)、\(\rho=\rho_g+\rho_h\)；当 \(\sigma\) 固定时我们记 \(L\) 表示 \(L(\sigma)\)。此外，\(f_\sigma\) 具有有界梯度且有下界，即 \(f_\sigma^\star:=\inf_x f_\sigma(x)>-\infty\)。

函数 \(g\) 具有 \(L_g\)-Lipschitz 梯度是指对所有 \(x,y\in\mathbb R^n\) 有 \(\|\nabla g(x)-\nabla g(y)\|\le L_g\|x-y\|\)；具有 \(\rho_g\)-Lipschitz Hessian 是指 \(\|\nabla^2g(x)-\nabla^2g(y)\|\le\rho_g\|x-y\|\)。假设 1 施加的是计算成像 [10, 16, 29, 31, 34] 与非凸优化 [39–42] 中常见的标准正则性条件。这些条件对带加性高斯噪声的线性逆问题自然成立：此时 \(g\) 是二次函数、其 Hessian 为常数。虽然关于 \(h_\sigma\) 的 Hessian 条件看似较强，但在我们的设定中是合理的，因为 \(h_\sigma\) 是高斯平滑的，而这种平滑会改善高阶正则性。

**假设 2。** 预训练去噪器是 MMSE 去噪器，即对所有 \(x\) 有

$$
\mathbb E_{n\sim\mathcal N(0,\mathbf I)}\left[U_\sigma(x,n)\right]=\nabla h_\sigma(x).
$$

假设 2 在基于分数的去噪器分析中是标准的。此类结果依赖 Tweedie 公式，它把分数函数与 MMSE 去噪器联系起来 [4, 7, 43]。

**假设 3。** 对任意状态 \(x\in\mathbb R^n\)，令 \(v_x\) 为与 \(\nabla^2f_\sigma(x)\) 的最小特征值相关联的特征向量。我们假设随机梯度几乎必然有界，\(\|U_\sigma(x,n)\|\le B\)，且其方差有上界，即 \(\operatorname{Var}_n\left(U_\sigma(x,n)\right)\le V_{\max}(\sigma)\)；并且存在常数 \(c>0\) 使得

$$
\operatorname{Var}_{n\sim\mathcal N(0,\mathbf I)}\left(v_x^{\mathsf T}D_\theta(x+\sigma n)\right)\ge c.\tag{19}
$$

假设 3 确保注入噪声在负曲率方向上具有非退化分量，这对逃离严格鞍点至关重要。该条件由附录 A 中的引理 3 给出形式化依据：当数据保真项 \(g\) 为凸（正如我们实验中那样）时，该方差下界在任意严格鞍点处成立，且 \(c=\sigma^2\)。

**定理 1。** 在假设 1–3 下运行 (17) 中的 SGPnP 迭代。则对任意 \(\delta\in(0,1)\)，存在步长计划 \(\{\gamma_k\}_{k\ge0}\) 与迭代次数 \(K\)，使得以至少 \(1-\delta\) 的概率，迭代量避开 \(f_\sigma\) 的严格鞍点。

证明见附录 A，其中我们还详述了为严格界定成功逃离严格鞍点概率所需的精确参数计划。据我们所知，这是 PnP 文献中首个关于鞍点逃离的形式化分析。关键洞见是：在去噪器输入端注入的噪声会把迭代量推离负曲率方向。我们在表 3（SDPnP 与 SGPnP 对比）中单独考察噪声注入对重建性能的整体影响。

### 4.2 退火噪声计划下的收敛性

接下来我们分析递减噪声计划下的 SGPnP，并建立到**精确、未平滑目标** \(f_0\) 稳定点的**期望意义**收敛。对固定噪声水平 \(\sigma\)，定义临界点集合 \(\mathcal S_\sigma:=\{x:\nabla f_\sigma(x)=0\}\)。为确保注入噪声消失时的渐近一致性，我们需要一个正则性条件。

**假设 4。** 函数 \(h_0(x)=-\log p(x)\) 连续可微，且目标 \(f_0(x)=g(x)+h_0(x)\) 是强制的（coercive）。此外，我们假设 SGPnP 产生的迭代量始终位于一个紧集 \(\mathcal K\) 内，且在该集合上

$$
\lim_{\sigma\to0}\ \sup_{x\in\mathcal K}\left\|\nabla h_\sigma(x)-\nabla h_0(x)\right\|=0.\tag{20}
$$

假设 4 确保 \(f_\sigma\) 的梯度在紧集上一致收敛到精确目标 \(f_0\) 的梯度。在先验密度 \(p\) 的温和正则性条件（包括光滑性）下，高斯平滑具有这一行为。该假设与基于分数的扩散模型所依托的高斯平滑框架一致：当 \(\sigma\to0\) 时平滑密度 \(p_\sigma\) 逼近真实数据分布 \(p\)。这里我们把这种收敛显式地放在**梯度层面**，以便分析优化轨迹。因此当 \(\sigma\to0\) 时 \(f_\sigma\) 的临界点逼近 \(f_0\) 的临界点。为分析退火过程，我们考虑一个**分阶段（staged）**机制：对每个噪声水平 \(\sigma_k\)，迭代量先接近平滑目标临界集的一个邻域（引理 2），然后 \(\sigma\) 才进一步减小。

**定理 2。** 设假设 1–4 成立。考虑一个计划 \(\{(\sigma_k,\gamma_k)\}_{k\ge0}\)，当 \(k\to\infty\) 时 \(\sigma_k\to0\)、\(\gamma_k\to0\)，并满足 \(\gamma_k\le1/L_k\) 与 \(\gamma_kL_kV_{\max}(\sigma_k)\to0\)，其中 \(L_k:=L(\sigma_k)\)。在每个阶段 \(k\)，运行内循环直至返回的迭代量 \(\widehat x_k\) 满足 \(\mathbb E\|\nabla f_{\sigma_k}(\widehat x_k)\|^2\le2L_k\gamma_kV_{\max}(\sigma_k)\)（该条件可在有限步 \(I_k\) 内达到）。则

$$
\mathbb E\left[\left\|\nabla f_0(\widehat x_k)\right\|^2\right]\longrightarrow0\quad\text{as }k\to\infty,\tag{21}
$$

其中 \(f_0(x)=g(x)+h_0(x)\) 是精确目标。

证明见附录 A。定理 1 与定理 2 共同刻画了 SGPnP 的优化行为：在固定噪声下，定理 1 建立对严格鞍点的规避；在退火情形下，定理 2 建立到原始未平滑目标稳定点的期望意义收敛。

## 5 数值评估

我们在两种模态上评估所提框架：来自 Flickr-Faces-HQ（FFHQ）[44] 的 RGB 人脸图像，以及来自 fastMRI [45, 46] 的复数多线圈 MRI 数据。评估分为三部分：(1) **分数先验适配**：验证在 PnP 框架（DPIR、PnP-ADMM、PGM）内用我们基于分数适配的先验替换经典 CNN 去噪器的有效性（第 3.1 节）；(2) **随机生成式 PnP（SGPnP）**：把所提随机框架（第 3.2 节）与传统 PnP 算法、随机 PnP 以及基于扩散的求解器比较（细节见第 5.1 节）；(3) **噪声注入消融**：通过把方法与其使用**完全相同分数先验**的确定性对应版本直接对比，隔离随机更新的影响。

**表 1（原文 Table 1）：** 若干 PnP 基线与基于扩散的求解器在 FFHQ（修补、4× 超分辨率、去模糊）与 fastMRI（4× CS-MRI）上的定量比较。每项指标与每个逆问题的最优值以高亮标出（本表用粗体表示最优）。SGPnP-PGM 一致地改进常规 PnP 方法，并与基于扩散的求解器相当。

| 测试数据 | 指标 | Input | DPIR | SNORE | DPS | DiffPIR | SGPnP |
|---|---|---|---|---|---|---|---|
| 修补（Inpainting） | PSNR↑ | 18.17 | 18.42 | 18.50 | 23.69 | 25.09 | **25.21** |
| 修补 | SSIM↑ | 0.766 | 0.797 | 0.799 | 0.810 | 0.860 | **0.874** |
| 修补 | LPIPS↓ | 0.289 | 0.264 | 0.250 | 0.176 | 0.115 | **0.108** |
| 超分辨率（4×） | PSNR↑ | 24.61 | 26.54 | 26.40 | 28.66 | 29.69 | **29.90** |
| 超分辨率 | SSIM↑ | 0.778 | 0.833 | 0.837 | 0.839 | 0.854 | **0.874** |
| 超分辨率 | LPIPS↓ | 0.305 | 0.255 | 0.240 | **0.140** | 0.194 | 0.194 |
| 去模糊（Deblurring） | PSNR↑ | 23.69 | 33.42 | 33.18 | 33.92 | 33.48 | **34.52** |
| 去模糊 | SSIM↑ | 0.703 | 0.923 | 0.932 | 0.915 | 0.913 | **0.935** |
| 去模糊 | LPIPS↓ | 0.326 | 0.123 | 0.085 | 0.076 | 0.110 | **0.068** |
| CS-MRI（4×） | PSNR↑ | 22.43 | 26.93 | 27.41 | 29.60 | 29.81 | **32.54** |
| CS-MRI | SSIM↑ | 0.622 | 0.731 | 0.714 | 0.799 | 0.783 | **0.881** |
| CS-MRI | LPIPS↓ | 0.333 | 0.235 | 0.256 | 0.147 | 0.174 | **0.119** |

**图 2（原文 Fig. 2）：** 对应表 1 定量结果的定性视觉比较。注意：对具有挑战性的盒式修补，确定性（DPIR）与随机（SNORE）PnP 方法（二者都使用在低噪声范围训练的去噪器）产生不完整的重建，而 SGPnP 给出更合理的图像补全。

**表 2（原文 Table 2）：** 图像去模糊的定量评估：比较使用 DRUNet 的 PnP 方法与把去噪器换成扩散模型所得的基于分数的变体。每个指标的最优值按颜色编码（本表用粗体表示最优）。

| 方法 | PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|
| Measurement（测量输入） | 23.69 | 0.703 | 0.326 |
| DPIR | 33.42 | 0.923 | 0.123 |
| SDPnP-DPIR | 34.14 | 0.928 | 0.114 |
| PnP-ADMM | 33.31 | 0.935 | 0.102 |
| SDPnP-ADMM | 34.06 | 0.935 | **0.096** |
| PGM | 33.29 | 0.930 | 0.090 |
| SDPnP-PGM | **34.07** | 0.935 | **0.070** |

**表 3（原文 Table 3）：** 在使用相同基于分数的先验时，各 PnP 算法在不加噪声注入与加噪声注入下的定量比较（FFHQ 修补、4× 超分辨率、去模糊；fastMRI 4× CS-MRI）。“w/o noise injection” 即 \(\sigma^{\mathrm{inject}}=0\)（SDPnP），“w/ noise injection” 即 \(\sigma^{\mathrm{inject}}>0\)（SGPnP）。每个指标、每个逆问题、每种 PnP 算法的最优值以高亮标出（本表用粗体表示）。在使用相同先验时，噪声注入几乎改善了每一项数值。

| 测试数据 | 指标 | Input | DPIR 无注入 | DPIR 有注入 | ADMM 无注入 | ADMM 有注入 | RED 无注入 | RED 有注入 | PGM 无注入 | PGM 有注入 |
|---|---|---|---|---|---|---|---|---|---|---|
| 修补 | PSNR↑ | 18.17 | 18.29 | 25.08 | 20.51 | 24.12 | 23.14 | 24.62 | 22.35 | **25.21** |
| 修补 | SSIM↑ | 0.766 | 0.789 | 0.869 | 0.811 | 0.852 | 0.830 | 0.865 | 0.847 | **0.874** |
| 修补 | LPIPS↓ | 0.289 | 0.259 | 0.109 | 0.227 | 0.140 | 0.150 | 0.111 | 0.141 | **0.108** |
| 超分辨 | PSNR↑ | 24.61 | 27.22 | 29.76 | 27.24 | 29.60 | 27.49 | 29.38 | 28.75 | **29.90** |
| 超分辨 | SSIM↑ | 0.778 | 0.830 | 0.871 | 0.849 | 0.868 | 0.815 | 0.864 | 0.854 | **0.874** |
| 超分辨 | LPIPS↓ | 0.305 | 0.234 | 0.194 | 0.209 | 0.201 | 0.221 | 0.197 | 0.202 | **0.194** |
| 去模糊 | PSNR↑ | 23.69 | 34.14 | 34.28 | 34.06 | 34.36 | 30.70 | 33.11 | 34.07 | **34.52** |
| 去模糊 | SSIM↑ | 0.703 | 0.928 | **0.935** | **0.935** | 0.934 | 0.886 | 0.916 | **0.935** | **0.935** |
| 去模糊 | LPIPS↓ | 0.326 | 0.114 | 0.095 | 0.096 | 0.093 | 0.105 | 0.089 | 0.070 | **0.068** |
| CS-MRI | PSNR↑ | 22.43 | 32.73 | 32.91 | 33.19 | 33.32 | 32.28 | 32.31 | 32.34 | **32.54** |
| CS-MRI | SSIM↑ | 0.622 | 0.870 | 0.880 | 0.891 | **0.895** | 0.865 | 0.866 | 0.882 | 0.881 |
| CS-MRI | LPIPS↓ | 0.333 | 0.153 | 0.151 | 0.143 | **0.111** | 0.129 | 0.128 | 0.120 | 0.119 |

**图 3（原文 Fig. 3）：** 对应表 3 定量结果的定性视觉比较，展示各 PnP 算法在不加噪声注入（SDPnP）与加噪声注入（SGPnP）下的表现。在使用相同基于分数的先验时，随机噪声注入在具有挑战性的盒式修补中产生更真实的补全，并在加速 MRI 上带来更好的重建。

### 5.1 实验设置

**数据集与预训练模型（Datasets & Pretrained Models）。** 对 FFHQ，我们取前 100 张图像（\(256\times256\)）作为测试集，并适配 [14] 的预训练扩散模型；遵循该模型的训练约定，RGB 强度从 \([0,1]\) 线性映射到 \([-1,1]\)。对 fastMRI，我们使用 100 例多线圈脑部扫描（中心裁剪到 \(256\times256\)，并按切片做最小–最大归一化，使其幅度落在 \([0,1]\)、相位保留），并适配 [47] 的分数模型。为保证公平比较，我们在两个数据集上训练了 DRUNet [5] 基线，覆盖 \([0,0.192]\) 的噪声水平范围，并按 [5] 使用噪声条件化通道。

**基线（Baselines）。** 我们与三类方法比较：(1) **确定性 PnP**：使用 DRUNet 先验的 PnP-ADMM [1, 26]、DPIR [5] 与 PGM [48]。(2) **随机 PnP**：使用 DRUNet 先验的随机去噪正则化（SNORE）[4]。(3) **扩散求解器**：扩散后验采样（DPS）[14] 与用于即插即用图像复原的去噪扩散模型（DiffPIR）[12]，它们使用与 SGPnP 相同的扩散先验。所有基线均使用其官方代码仓库与 DeepInv 库 [49] 复现，以保证前向算子与数据一致性步一致。

**逆问题（Inverse Problems）。** 我们在以下任务上评估性能。FFHQ 上：盒式修补（\(128\times128\) 中心掩膜）、运动去模糊、4× 超分辨率。fastMRI 上：加速重建（4× 加速）。所有实验中，测量均由真值图像经所述前向算子合成生成，并被噪声水平为 0.02 的加性高斯噪声污染。初始化为 \(x_0=A^{\mathsf H}y\)；但对 \(y\) 已位于图像域的任务（如修补与去模糊），我们直接取 \(x_0=y\)。

**实现细节（Implementation Details）。** 我们通过在一组 50 个样本的留出验证集上做网格搜索来为所有方法优化超参数，选择使 PSNR 与 LPIPS 之间权衡最大的参数。最终超参数（包括步长、噪声退火计划与迭代次数）报告于附录 B。定量评估依赖三项标准指标：峰值信噪比（PSNR）与结构相似性指数（SSIM）用于衡量保真度与结构保持，学习感知图像块相似度（LPIPS）[50] 用于量化感知质量。

### 5.2 基于分数的先验在确定性 PnP 中的作用

我们首先评估在 PnP-ADMM、DPIR 与 PGM 中，把基于 CNN 的 DRUNet 先验替换为经适配的基于分数的扩散模型（SBDM）先验（第 3.1 节的表述）所带来的收益。表 2 表明这一替换在所有指标上带来一致改进。这些结果凸显了 SBDM 提供的**宽噪声水平覆盖**的优势：当噪声参数被调到超出常规 PnP 去噪器通常使用的低噪声范围时，性能得到改善。

### 5.3 随机生成式 PnP 的性能

接下来，我们在两个主要领域上把随机生成式 PnP 框架与基线比较：自然图像复原（盒式修补、去模糊与超分辨率）与加速 MRI 重建。图 2 的视觉结果凸显了一个关键区别：在去噪器均于低噪声范围训练的情况下，确定性 PnP 乃至随机 PnP（SNORE）都无法合理填补盒式修补中的大缺失区域，而我们的方法能在被掩蔽区域恢复出结构连贯的内容。定量上（表 1），我们的 SGPnP-PGM 框架在 PSNR 与 SSIM 上一致优于 PnP 基线与纯扩散求解器（DPS、DiffPIR）。更多视觉比较见附录 C。

### 5.4 随机与确定性生成式 PnP 的对比

我们通过把随机生成式 PnP 与其自身的确定性版本（即使用相同 SBDM 先验但在 (14) 中取 \(\sigma^{\mathrm{inject}}=0\)）比较，隔离所提噪声注入机制的贡献。图 3 表明，即便拥有强大的分数先验，确定性变体在严重病态任务中通常也难以收敛到真实解；相反，SGPnP 在全部四种 PnP 框架上都显著提升重建质量。表 3 确认噪声注入带来了实质性的定量增益。

## 6 结论

我们打通了基于优化的 PnP 重建与基于分数的扩散先验，使预训练基于分数的模型可以直接在 PnP 求解器内使用。我们进一步提出随机生成式 PnP（SGPnP）框架：它在去噪前注入噪声，并允许注入噪声水平与去噪器条件化水平不同，以反映反复数据一致性更新所引入的额外污染。我们的分析表明，这种噪声注入会在**高斯平滑的复合目标**上诱导优化，并产生能够避开严格鞍点的随机动力学。自然图像与多线圈 MRI 上的实验显示，相对确定性与随机 PnP 基线有一致改进，并表明所提框架在严重病态情形（包括大掩膜修补）中大幅提升重建质量。除这些具体贡献之外，我们希望本工作能为打通经典优化视角与现代生成模型提供基础。

## 附录 A 理论结果的详细证明

**引理 1。** 设 \(H_k\) 表示优化过程直到第 \(k\) 次迭代的历史，包含所有过去的迭代量与噪声实现。随机噪声序列 \(\{w_k\}_{k\ge0}\) 满足 \(\mathbb E_{n_k}\left[w_k\mid H_k\right]=0\)。由全期望定律，\(\mathbb E[w_k]=0\)。

**证明。** 由于历史 \(H_k\) 完全决定当前状态 \(x_k\)，且注入噪声 \(n_k\sim\mathcal N(0,\mathbf I)\) 独立于 \(H_k\) 采样，我们可以对 (18) 中噪声定义 \(w_k\) 关于 \(n_k\) 取条件期望：

$$
\mathbb E_{n_k}\left[w_k\mid H_k\right]=\mathbb E_{n_k}\left[U_{\sigma_k}(x_k,n_k)\mid H_k\right]-\mathbb E_n\left[U_{\sigma_k}(x_k,n)\right].
$$

由假设 2，去噪器是分数的一个无偏估计器，即 \(\mathbb E_n\left[U_{\sigma_k}(x_k,n)\right]=\nabla h_\sigma(x_k)\)。把该恒等式代入当前步的条件期望得 \(\mathbb E_{n_k}\left[w_k\mid H_k\right]=\nabla h_\sigma(x_k)-\nabla h_\sigma(x_k)=0\)，从而确保随机更新不引入系统性偏差。最后，对历史 \(H_k\) 应用全期望定律得到无条件均值：\(\mathbb E[w_k]=\mathbb E_{H_k}\left[\mathbb E_{n_k}\left[w_k\mid H_k\right]\right]=0\)。∎

**引理 2。** 设假设 1–3 成立，固定噪声水平 \(\sigma>0\)，以常步长 \(\gamma\le1/L\) 运行 SGPnP 迭代 (17) 共 \(I\) 次内循环迭代。则

$$
\min_{0\le i<I}\mathbb E\left[\left\|\nabla f_\sigma\left(x^{(i)}\right)\right\|^2\right]\le\frac{2\left(f_\sigma\left(x^{(0)}\right)-\inf_x f_\sigma(x)\right)}{\gamma I}+L\gamma V_{\max}(\sigma).\tag{22}
$$

因此，随着 \(I\) 增大，最优迭代量的梯度范数逼近残余水平 \(L\gamma V_{\max}(\sigma)\)——这一下限由步长 \(\gamma\) 与随机梯度方差界 \(V_{\max}(\sigma)\) 决定。

**证明概述。** 固定 \(\sigma>0\) 与常步长 \(\gamma\le1/L\)。由假设 2（等价地 \(\mathbb E\left[w^{(i)}\mid H^{(i)}\right]=0\)）有 \(\mathbb E_n\left[U_\sigma(x,n)\right]=\nabla h_\sigma(x)\)，于是以 (18) 定义的 \(w^{(i)}\)，迭代 (17) 可写为对 \(f_\sigma=g+h_\sigma\) 的随机梯度步：

$$
x^{(i+1)}=x^{(i)}-\gamma\left(\nabla f_\sigma\left(x^{(i)}\right)+w^{(i)}\right),\tag{23}
$$

其中零均值性质来自前一条引理，且由假设 3 有 \(\mathbb E\left[\|w^{(i)}\|^2\mid H^{(i)}\right]=\operatorname{Var}_n\left(U_\sigma\left(x^{(i)},n\right)\right)\le V_{\max}(\sigma)\)。这里由假设 1 有 \(f_\sigma^\star:=\inf_x f_\sigma(x)>-\infty\)。由 \(f_\sigma\) 的 \(L\)-光滑性（假设 1），

$$
f_\sigma\left(x^{(i+1)}\right)\le f_\sigma\left(x^{(i)}\right)-\gamma\nabla f_\sigma\left(x^{(i)}\right)^{\mathsf T}\left(\nabla f_\sigma\left(x^{(i)}\right)+w^{(i)}\right)+\frac{L\gamma^2}{2}\left\|\nabla f_\sigma\left(x^{(i)}\right)+w^{(i)}\right\|^2.
$$

取 \(\mathbb E\left[\cdot\mid H^{(i)}\right]\) 并利用 \(\mathbb E\left[w^{(i)}\mid H^{(i)}\right]=0\) 与方差界，得到

$$
\mathbb E\left[f_\sigma\left(x^{(i+1)}\right)\mid H^{(i)}\right]\le f_\sigma\left(x^{(i)}\right)-\gamma\left(1-\frac{L\gamma}{2}\right)\left\|\nabla f_\sigma\left(x^{(i)}\right)\right\|^2+\frac{L\gamma^2}{2}V_{\max}(\sigma).
$$

由于 \(\gamma\le1/L\) 意味 \(1-L\gamma/2\ge1/2\)，我们得到 \(\mathbb E\left[f_\sigma\left(x^{(i+1)}\right)\mid H^{(i)}\right]\le f_\sigma\left(x^{(i)}\right)-\frac{\gamma}{2}\left\|\nabla f_\sigma\left(x^{(i)}\right)\right\|^2+\frac{L\gamma^2}{2}V_{\max}(\sigma)\)。取全期望并对 \(i=0,\ldots,I-1\) 求和，中间项相消为

$$
\frac{\gamma}{2}\sum_{i=0}^{I-1}\mathbb E\left\|\nabla f_\sigma\left(x^{(i)}\right)\right\|^2\le f_\sigma\left(x^{(0)}\right)-f_\sigma^\star+\frac{IL\gamma^2}{2}V_{\max}(\sigma).\tag{24}
$$

两边除以 \(I\gamma/2\)，并用平均值界定最小值，即得

$$
\min_{0\le i<I}\mathbb E\left\|\nabla f_\sigma\left(x^{(i)}\right)\right\|^2\le\frac{2\left(f_\sigma\left(x^{(0)}\right)-f_\sigma^\star\right)}{\gamma I}+L\gamma V_{\max}(\sigma).\tag{25}
$$

第一项随 \(I\) 减小，因此对任意 \(\delta>0\)，存在有限 \(I\) 使 \(\min_{0\le i<I}\mathbb E\left\|\nabla f_\sigma\left(x^{(i)}\right)\right\|^2\le L\gamma V_{\max}(\sigma)+\delta\)。∎

**定义 2。** 若二次可微目标 \(f_\sigma\) 的某状态 \(x^\star\) 满足梯度范数有界 \(\|\nabla f_\sigma(x^\star)\|\le\epsilon_g\) 且其 Hessian 满足 \(\nabla^2f_\sigma(x^\star)\succeq-\epsilon_h\mathbf I\)（其中 \(\epsilon_g,\epsilon_h>0\)），则称 \(x^\star\) 为 \(f_\sigma\) 的 **\((\epsilon_g,\epsilon_h)\)-二阶稳定点**。

**定理 1。** 在假设 1–3 下运行 (17) 中的 SGPnP 迭代。则对任意 \(\delta\in(0,1)\)，存在步长计划 \(\{\gamma_k\}_{k\ge0}\) 与迭代次数 \(K\)，使得以至少 \(1-\delta\) 的概率，迭代量避开 \(f_\sigma\) 的严格鞍点。

**证明概述。** 我们借助 [37] 建立的理论框架分析 SGPnP 迭代的鞍点规避性质。具体而言，我们假设算法遵循 [37, Table 3] 详述的步长计划。逃离严格鞍点要求随机梯度动力学：(i) 构成有界零均值序列；(ii) 满足**相关负曲率（Correlated Negative Curvature, CNC）**条件，即存在常数 \(c>0\) 使 \(\mathbb E_{n_k}\left[\left(v_{x_k}^{\mathsf T}\widetilde\nabla f_\sigma(x_k,n_k)\right)^2\right]\ge c\)。该条件意味着随机梯度沿最小特征向量 \(v_{x_k}\) 方向的二阶矩一致地远离零。直观上，CNC 条件保证固有优化噪声持续沿最陡下降方向提供随机漂移，防止算法被困在平坦鞍点上。

条件 (i) 由引理 1 与假设 3 成立。为验证条件 (ii)，考虑完整随机梯度 \(\widetilde\nabla f_\sigma(x_k,n_k):=\nabla g(x_k)+U_\sigma(x_k,n_k)\)。展开其沿方向 \(v_{x_k}\) 投影的二阶矩，有

$$
\mathbb E_{n_k}\left[\left(v_{x_k}^{\mathsf T}\widetilde\nabla f_\sigma(x_k,n_k)\right)^2\right]\ge\operatorname{Var}_{n_k}\left(v_{x_k}^{\mathsf T}\nabla g(x_k)+\frac{1}{\sigma^2}v_{x_k}^{\mathsf T}\left(x_k-D_\theta\left(x_k+\sigma n_k\right)\right)\right)=\frac{1}{\sigma^4}\operatorname{Var}_{n_k}\left(v_{x_k}^{\mathsf T}D_\theta\left(x_k+\sigma n_k\right)\right)\ge\frac{c}{\sigma^4},
$$

其中第一个不等式来自二阶矩分解 \(\mathbb E[Y^2]=(\mathbb E[Y])^2+\operatorname{Var}(Y)\ge\operatorname{Var}(Y)\)，第二个等号成立是因为确定性分量（\(\nabla g(x_k)\) 与 \(x_k\)）关于 \(n_k\) 的方差为零，最后一个不等式来自假设 3。因此在确定性梯度消失的严格鞍点处（\(\nabla f_\sigma(x^\dagger)=0\)），去噪器固有方差仍严格满足 CNC 条件，确保迭代量获得足够能量成功逃离。

由于 SGPnP 动力学同时满足零均值与 CNC 条件，[37] 的高概率保证可直接适用。因此，按其规定的理论界配置步长 \(\{\gamma_k\}_{k\ge0}\) 与总迭代次数 \(K\)，算法被形式化保证以至少 \(1-\delta\) 的概率收敛到 \((\epsilon,\sqrt{\rho\epsilon})\)-二阶稳定点，其中 \(\delta\in(0,1)\) 是目标失败容差。把目标概率调到接近 1（\(\delta\to0\)）需要相应更大的迭代次数 \(K\) 与严格受限的步长，如他们的分析所规定。

尽管该数学保证成立，我们要强调这一严格的参数配置纯粹是为理论最坏情形界而设的。实践中，即便以简单得多、经验调优的步长与迭代次数运行，我们的框架依然十分有效。∎

**定理 2。** 设假设 1–4 成立。考虑一个计划 \(\{(\sigma_k,\gamma_k)\}_{k\ge0}\)，当 \(k\to\infty\) 时 \(\sigma_k\to0\)、\(\gamma_k\to0\)，并满足 \(\gamma_k\le1/L_k\) 与 \(\gamma_kL_kV_{\max}(\sigma_k)\to0\)，其中 \(L_k:=L(\sigma_k)\)。在每个阶段 \(k\)，运行内循环直至返回的迭代量 \(\widehat x_k\) 满足 \(\mathbb E\|\nabla f_{\sigma_k}(\widehat x_k)\|^2\le2L_k\gamma_kV_{\max}(\sigma_k)\)（该条件可在有限步 \(I_k\) 内达到）。则

$$
\mathbb E\left[\left\|\nabla f_0\left(\widehat x_k\right)\right\|^2\right]\longrightarrow0\quad\text{as }k\to\infty,\tag{26}
$$

其中 \(f_0(x)=g(x)+h_0(x)\) 是精确目标。

**证明概述。** 由 \(f_0\) 的强制性（假设 4）与引理 2 证明中的单步下降不等式（即 \(\mathbb E\left[f_\sigma(x^{(i+1)})\mid H^{(i)}\right]\le f_\sigma(x^{(i)})-\frac{\gamma}{2}\|\nabla f_\sigma(x^{(i)})\|^2+\frac{L\gamma^2}{2}V_{\max}(\sigma)\)），迭代量保持在紧集 \(\mathcal K\) 内；因此每个阶段初始的最优性间隙一致有界，即 \(\sup_k\left(f_{\sigma_k}(x_k^{(0)})-f_{\sigma_k}^\star\right)\le\Delta<\infty\)，其中阶段 \(k\) 以 \(\widehat x_{k-1}\) 热启动。在第 \(k\) 阶段以步长 \(\gamma_k\le1/L_k\) 应用引理 2，界

$$
\min_{0\le i<I_k}\mathbb E\left\|\nabla f_{\sigma_k}\left(x_k^{(i)}\right)\right\|^2\le\frac{2\Delta}{\gamma_kI_k}+L_k\gamma_kV_{\max}(\sigma_k)\tag{27}
$$

成立。取 \(I_k\ge2\Delta/\left(L_k\gamma_k^2V_{\max}(\sigma_k)\right)\) 可迫使第一项低于 \(L_k\gamma_kV_{\max}(\sigma_k)\)，于是返回的（arg-min）迭代量 \(\widehat x_k\) 满足

$$
\mathbb E\left\|\nabla f_{\sigma_k}\left(\widehat x_k\right)\right\|^2\le2L_k\gamma_kV_{\max}(\sigma_k),\tag{28}
$$

且对每个 \(k\) 有限。由耦合条件 \(\gamma_kL_kV_{\max}(\sigma_k)\to0\)，故 \(\mathbb E\|\nabla f_{\sigma_k}(\widehat x_k)\|^2\to0\)。为把它转移到未平滑目标，注意 \(f_\sigma-f_0=h_\sigma-h_0\)，故 \(\nabla f_{\sigma_k}(x)-\nabla f_0(x)=\nabla h_{\sigma_k}(x)-\nabla h_0(x)\)。记 \(\epsilon_k:=\sup_{x\in\mathcal K}\|\nabla h_{\sigma_k}(x)-\nabla h_0(x)\|\)，假设 4 中的一致收敛结合 \(\sigma_k\to0\) 给出 \(\epsilon_k\to0\)，而不等式 \(\|a+b\|^2\le2\|a\|^2+2\|b\|^2\) 给出

$$
\mathbb E\left\|\nabla f_0\left(\widehat x_k\right)\right\|^2\le2\mathbb E\left\|\nabla f_{\sigma_k}\left(\widehat x_k\right)\right\|^2+2\epsilon_k^2\longrightarrow0.\tag{29}
$$

最后，由于 \(\mathbb E\|\nabla f_0(\widehat x_k)\|^2\to0\)，存在一个子列使 \(\nabla f_0(\widehat x_k)\to0\) 几乎必然成立。由于 \(\{\widehat x_k\}\subset\mathcal K\) 有界，存在收敛子列（仍记作 \(\{\widehat x_k\}\)）使 \(\nabla f_0(\widehat x_k)\to0\) 几乎必然且 \(\widehat x_k\to x^\dagger\)。由于 \(\nabla f_0\) 连续（\(g\) 见假设 1，\(h_0\) 见假设 4），有 \(\nabla f_0(x^\dagger)=0\)，即 \(x^\dagger\in\mathcal S_0\)。∎

下面的引理表明，当数据保真 \(g\) 为凸时，假设 3 在鞍点处自动满足。

**引理 3。** 设假设 1 与 2 成立。此外假设数据保真项 \(g\) 为凸。则对任意鞍点 \(\bar x\)，

$$
\operatorname{Var}_n\left(v_{\bar x}^{\mathsf T}D_\theta\left(\bar x+\sigma n\right)\right)\ge\sigma^2.
$$

**证明概述。** 由于 \(g\) 凸，\(\nabla^2g(\bar x)\succeq0\)。由 \(h_\sigma(\bar x)=-\mathbb E_{n\sim\mathcal N(0,\mathbf I)}\left[\log p_\sigma(\bar x+\sigma n)\right]\) 得

$$
\nabla_{\bar x}^2h_\sigma(\bar x)=-\mathbb E_n\left[\nabla_{\bar x}\left(\nabla_{\bar x}\log p_\sigma(\bar x+\sigma n)\right)\right]=-\mathbb E_n\left[\nabla_{\bar x}\left(\frac{1}{\sigma^2}D_\theta(\bar x+\sigma n)-\frac{1}{\sigma^2}(\bar x+\sigma n)\right)\right]=\frac{1}{\sigma^2}\mathbf I-\frac{1}{\sigma^4}\mathbb E_n\left[\operatorname{Cov}\left(x\mid\bar x+\sigma n\right)\right],
$$

其中第二个等号使用 Tweedie 公式，最后一行使用 Miyasawa 恒等式：

$$
\operatorname{Cov}\left(x\mid\bar x+\sigma n\right)=\sigma^2JD_\theta\left(\bar x+\sigma n\right).\tag{30}
$$

记 \(\Sigma_{\bar x}=\mathbb E_n\left[\operatorname{Cov}\left(x\mid\bar x+\sigma n\right)\right]\)。定义 \(v_{\bar x}\) 为与 \(\nabla^2f_\sigma(\bar x)\) 最小特征值关联的特征向量。最小特征值等价于在单位向量 \(v\) 上最小化 Rayleigh 商 \(v^{\mathsf T}\nabla^2f_\sigma(\bar x)v/\|v\|^2\)：

$$
\min_{\|v\|_2=1}\left\{v^{\mathsf T}\nabla^2g(\bar x)v+\frac{1}{\sigma^2}-\frac{1}{\sigma^4}v^{\mathsf T}\Sigma_{\bar x}v\right\}.
$$

由于 \(\bar x\) 是鞍点，该最小值必然非正。因此

$$
0\ge v_{\bar x}^{\mathsf T}\nabla^2g(\bar x)v_{\bar x}+\frac{1}{\sigma^2}-\frac{1}{\sigma^4}v_{\bar x}^{\mathsf T}\Sigma_{\bar x}v_{\bar x}\ge\frac{1}{\sigma^2}-\frac{1}{\sigma^4}v_{\bar x}^{\mathsf T}\Sigma_{\bar x}v_{\bar x}\ \Longrightarrow\ v_{\bar x}^{\mathsf T}\Sigma_{\bar x}v_{\bar x}\ge\sigma^2.\tag{31}
$$

接下来令 \(z_1=v_{\bar x}^{\mathsf T}D_\theta(\bar x+\sigma n)\)、\(z_2=v_{\bar x}^{\mathsf T}n\)。注意二者都是标量，且 \(\mathbb E[z_2]=0\)、\(\operatorname{Var}(z_2)=\tfrac12\|v_{\bar x}\|_2^2=1\)。由协方差定义

$$
\operatorname{Cov}(z_1,z_2)=\mathbb E[z_1z_2]-\mathbb E[z_1]\mathbb E[z_2]=\mathbb E_n\left[\left(v_{\bar x}^{\mathsf T}D_\theta(\bar x+\sigma n)\right)\left(n^{\mathsf T}v_{\bar x}\right)\right]-0=\sigma\,v_{\bar x}^{\mathsf T}\mathbb E_n\left[JD_\theta(\bar x+\sigma n)\right]v_{\bar x}.\tag{32}
$$

最后一个等号使用 Stein 引理。结合 Cauchy–Schwarz 协方差不等式、(30)、(31) 与 (32) 即得所需结论：

$$
\operatorname{Var}(z_1)\operatorname{Var}(z_2)\ge\operatorname{Cov}(z_1,z_2)^2\ \Longrightarrow\ \operatorname{Var}_n\left(v_{\bar x}^{\mathsf T}D_\theta(\bar x+\sigma n)\right)\ge\frac{1}{\sigma^2}\left(v_{\bar x}^{\mathsf T}\Sigma_{\bar x}v_{\bar x}\right)^2\ge\sigma^2.\qquad\blacksquare
$$

## 附录 B 实现细节

本节汇总所有实验中使用的超参数设置。表 4 报告基于 PnP 的方法（确定性、随机与基于 DRUNet）的参数，表 5 列出扩散后验采样类方法的参数。这里 \(\sigma_0^{\mathrm{cond}}\) 表示第一次迭代的初始条件化噪声水平。遵循 [12]，该条件化噪声水平按对数计划从 \(\sigma_0^{\mathrm{cond}}\) 退火到 \(\sigma_{K-1}^{\mathrm{cond}}\)；注入噪声水平同样按对数计划从 \(\sigma_0^{\mathrm{inject}}\) 退火到 \(\sigma_{K-1}^{\mathrm{inject}}\)。对表 4 中每个方法（SGPnP、SDPnP 与 DPIR），条件化噪声水平最终都落在测量噪声水平 \(\sigma_{K-1}^{\mathrm{cond}}=0.02\)。只有 SGPnP 注入噪声：其注入水平最终在 FFHQ 上为 \(\sigma_{K-1}^{\mathrm{inject}}=0.02\)、在 CS-MRI 上为 \(\sigma_{K-1}^{\mathrm{inject}}=0.001\)。有、无噪声注入时步长遵循相同规则。PGM 与 RED 的先验步长 \(\tau\) 为常数；ADMM、DPIR 与 PGM 的近端步遵循 [12] 的计划 \(\gamma_k=\gamma\left(\sigma_k^{\mathrm{cond}}/\sigma_{K-1}^{\mathrm{cond}}\right)^2\)。表 4 报告 \(\gamma\) 与 \(\tau\)。

**表 4（原文 Table 4）：** 基于 PnP 的重建方法的超参数。SGPnP 表示所提带噪声注入（\(\sigma^{\mathrm{inject}}>0\)）的随机生成式即插即用框架；SDPnP 表示所提不带噪声注入（\(\sigma^{\mathrm{inject}}=0\)）的基于分数的确定性即插即用框架；DPIR 表示基于 DRUNet 去噪器的确定性 PnP 方法。

| 问题 | 方法 | \(\gamma\) | \(\tau\) | \(\sigma_0^{\mathrm{cond}}\) | \(\sigma_0^{\mathrm{inject}}\) | Iter |
|---|---|---|---|---|---|---|
| 修补 Inpainting | SGPnP-ADMM | 1.7 | – | 15 | 15 | 200 |
| 修补 | SGPnP-DPIR | 1.5 | – | 15 | 15 | 200 |
| 修补 | SGPnP-PGM | 0.22 | 0.4 | 20 | 20 | 200 |
| 修补 | SDPnP-ADMM | 1.32 | – | 5 | 0 | 50 |
| 修补 | SDPnP-DPIR | 2.0 | – | 0.3 | 0 | 10 |
| 修补 | SDPnP-PGM | 2.0 | 0.4 | 20 | 0 | 200 |
| 修补 | DPIR | 1.627 | – | 0.1921 | 0 | 50 |
| 去模糊 Deblur | SGPnP-ADMM | 1.398 | – | 7.5 | 7.5 | 200 |
| 去模糊 | SGPnP-DPIR | 1.55 | – | 25 | 25 | 200 |
| 去模糊 | SGPnP-PGM | 0.6286 | 0.3 | 20 | 20 | 200 |
| 去模糊 | SDPnP-ADMM | 1.32 | – | 5 | 0 | 50 |
| 去模糊 | SDPnP-DPIR | 2.0 | – | 2 | 0 | 10 |
| 去模糊 | SDPnP-PGM | 0.66 | 0.4 | 2.0 | 0 | 10 |
| 去模糊 | DPIR | 1.627 | – | 0.1921 | 0 | 10 |
| 超分 SR | SGPnP-ADMM | 1.45 | – | 50 | 50 | 200 |
| 超分 | SGPnP-DPIR | 2.25 | – | 15 | 15 | 200 |
| 超分 | SGPnP-PGM | 0.6286 | 0.3 | 20 | 20 | 200 |
| 超分 | SDPnP-ADMM | 1.32 | – | 0.6 | 0 | 20 |
| 超分 | SDPnP-DPIR | 0.608 | – | 157 | 0 | 50 |
| 超分 | SDPnP-PGM | 1.48 | 0.95 | 20 | 0 | 100 |
| 超分 | DPIR | 1.627 | – | 0.1921 | 0 | 50 |
| CS-MRI | SGPnP-ADMM | 2.19 | – | 1.0 | 0.01 | 200 |
| CS-MRI | SGPnP-DPIR | 3.5 | – | 0.1 | 0.01 | 200 |
| CS-MRI | SGPnP-PGM | 1.7 | 0.75 | 1.0 | 0.01 | 200 |
| CS-MRI | SDPnP-ADMM | 1.5 | – | 50 | 0 | 200 |
| CS-MRI | SDPnP-DPIR | 2.5 | – | 0.9 | 0 | 200 |
| CS-MRI | SDPnP-PGM | 1.4 | 0.63 | 7.5 | 0 | 200 |
| CS-MRI | DPIR | 35.0 | – | 0.192 | 0 | 10 |

所有方法的超参数均通过验证集上的网格搜索选定。步长在 \([0.01,5.0]\) 范围内以 40 个均匀间隔样本搜索；初始条件化噪声水平从去噪器支持的最大噪声水平向下扫描到测量噪声水平；迭代次数从 \(\{10,20,50,100,200\}\) 中选取。注意：对 fastMRI 上使用 DRUNet 先验的确定性 DPIR 实现，我们观察到需要更大的步长范围才能表现良好，因此把步长网格扩展到 50。

**表 5（原文 Table 5）：** 基于扩散的逆问题求解器的超参数。

| 问题 | 方法 | \(\lambda\) | \(\gamma\) | Iter |
|---|---|---|---|---|
| 修补 | DiffPIR | 2.0 | 1.0 | 200 |
| 修补 | DPS | 0.4 | – | 1000 |
| 去模糊 | DiffPIR | 1.0 | 1.0 | 200 |
| 去模糊 | DPS | 10.0 | – | 1000 |
| 超分 | DiffPIR | 1.0 | 1.0 | 200 |
| 超分 | DPS | 3.0 | – | 1000 |
| CS-MRI | DiffPIR | 0.75 | 1.0 | 200 |
| CS-MRI | DPS | 10.0 | – | 1000 |

## 附录 C 进一步的实验结果

### C.1 噪声水平解耦的影响

我们进一步分析在随机生成式 PnP（SGPnP）中把注入噪声水平与去噪器条件化噪声水平解耦的效果。如正文所述，PnP 的中间迭代量不仅包含注入的随机扰动，还包含残余测量噪声与前向算子诱导的伪影。因此仅以注入噪声为条件化依据，可能低估中间重建的有效污染水平。

匹配配置（\(\sigma^{\mathrm{cond}}=\sigma^{\mathrm{inject}}\)）被随机 PnP 方法 SNORE [4] 采用，它假设注入噪声完全刻画了去噪器所见的污染水平。相反，我们的框架允许这两个噪声水平不同，从而使条件化噪声也能计入反复数据一致性更新所引入的测量诱导伪影。表 6 表明这种解耦一致地改善重建稳定性。

**表 6（原文 Table 6）：** fastMRI（4× CS-MRI）上噪声水平耦合方式的消融（使用基于分数的 PnP 求解器）。比较匹配设定（\(\sigma^{\mathrm{cond}}=\sigma^{\mathrm{inject}}\)）与解耦设定（\(\sigma^{\mathrm{cond}}\ne\sigma^{\mathrm{inject}}\)）。每个指标的最优值以高亮标出（本表用粗体）。

| 指标 | Input | SGPnP-DPIR 匹配 | SGPnP-DPIR 解耦 | SGPnP-ADMM 匹配 | SGPnP-ADMM 解耦 | SGPnP-PGM 匹配 | SGPnP-PGM 解耦 |
|---|---|---|---|---|---|---|---|
| PSNR↑ | 22.43 | 30.99 | 32.91 | 31.44 | **33.32** | 31.54 | 32.54 |
| SSIM↑ | 0.622 | 0.856 | 0.880 | 0.854 | **0.895** | 0.823 | 0.881 |
| LPIPS↓ | 0.333 | 0.122 | 0.151 | 0.137 | **0.111** | 0.169 | 0.119 |

### C.2 选取 \(\sigma^{\mathrm{inject}}\)

SGPnP 有两个噪声参数 \(\sigma^{\mathrm{inject}}\) 与 \(\sigma^{\mathrm{cond}}\)，它们无需独立调优：性能由二者比值 \(r=\sigma^{\mathrm{cond}}/\sigma^{\mathrm{inject}}\) 支配，从而把搜索降为单一参数。我们在四个问题各自的验证子集上扫描 \(r\in\{0.05,1,10,100,500\}\)（表 7）。两点观察给出实用规则。第一，响应在很宽的区间上是平坦的，只在 \(r\ll1\) 时失效；在 \(r=0.05\) 时每个问题都崩到 10–14 dB，因为过度注入淹没了测量信号。对 \(r\ge1\)，曲线很宽，且在去模糊与 MRI 上，\(r\in[10,500]\) 范围内的变化小于 0.1 dB。第二，峰值位置随问题几何而变化：修补与 4× 超分留下较大的未测量子空间，需要更强的随机探索来填补，它们在 \(r\approx1\) 处取得峰值；去模糊与 4× CS-MRI 测量信息丰富、由数据一致性主导，它们在一个平坦平台上取得峰值（\(r\in[10,100]\)）。

因此对一个新的问题，选取 \(r\) 就归结为比较默认的 \(r=1\)（\(\sigma^{\mathrm{inject}}=\sigma^{\mathrm{cond}}\)）与平台上的一个取值（例如 \(r=10\)），而不需要精细搜索。解耦在去模糊上带来 0.23 dB、在 CS-MRI 上带来 1.00 dB 的增益，而在修补与超分上会把 PSNR 降低 3–9 dB。因此测量信息丰富的问题才是较大取值发挥作用的地方；当问题类型未知时，\(r=1\) 仍是更稳妥的起点。

**表 7（原文 Table 7）：** SGPnP 对噪声注入水平的敏感性。控制变量是比值 \(r=\sigma^{\mathrm{cond}}/\sigma^{\mathrm{inject}}\)，每行 PSNR 的最优值以高亮标出（本表用粗体）。评估表明欠定问题（修补、超分）在 \(r\approx1\) 处取峰，而去模糊与 MRI 在 \(r\in[10,100]\) 的平坦平台上取峰。默认的 \(r=1\)（\(\sigma^{\mathrm{inject}}=\sigma^{\mathrm{cond}}\)）在全部四个问题上都是最优或接近最优。

| 问题 | r=0.05 | r=1 | r=10 | r=100 | r=500 |
|---|---|---|---|---|---|
| 修补（盒式） | 10.81 | **25.04** | 21.83 | 21.39 | 21.40 |
| 超分辨率（4×） | 10.37 | **29.84** | 21.05 | 21.61 | 21.54 |
| 去模糊 | 12.43 | 33.93 | **34.16** | 34.09 | 34.09 |
| CS-MRI（4×） | 13.74 | 31.54 | 32.53 | **32.54** | 32.54 |

### C.3 噪声水平覆盖范围的影响

我们进一步考察去噪器的噪声水平覆盖范围如何影响随机生成式 PnP（SGPnP）的重建。具体而言，我们把在基于分数的模型训练所用**完整噪声范围**上运行的 SGPnP-PGM，与一个使用相同基于分数的去噪器但被限制在**低噪声区间**（匹配基线 PnP 方法通常使用的范围，包括确定性 DPIR [5] 与随机 SNORE [4]）的变体比较。

表 8 表明，把 SGPnP-PGM 限制在低噪声区间，在盒式修补问题上相对确定性 DPIR 与随机 SNORE 并没有实质改进；相反，让 SGPnP-PGM 充分利用更宽的噪声范围，则在所有重建指标上带来大幅提升。这些结果表明，**宽的噪声水平覆盖**是使有效的随机生成式重建成为可能的关键因素。

**表 8（原文 Table 8）：** 盒式修补上噪声水平覆盖范围的消融研究。我们比较确定性 PnP（DPIR）、随机 PnP 基线（SNORE）、被限制在经典去噪器所用相同低噪声区间的 SGPnP-PGM，以及利用基于分数模型训练时全部噪声范围的 SGPnP-PGM。每个指标的最优值以高亮标出（本表用粗体）。

| 指标 | Input | DPIR（σlow） | SNORE（σlow） | SGPnP-PGM（σlow） | SGPnP-PGM（σwide） |
|---|---|---|---|---|---|
| PSNR↑ | 18.17 | 18.42 | 18.50 | 18.27 | **25.21** |
| SSIM↑ | 0.766 | 0.797 | 0.799 | 0.797 | **0.874** |
| LPIPS↓ | 0.289 | 0.264 | 0.250 | 0.257 | **0.108** |

### C.4 附加的视觉比较

我们给出更多视觉比较以进一步展示所提随机生成式 PnP 方法的行为。图 4 展示所提方法在相同测量上的重复重建，表明注入的随机性在不同运行之间仍能给出视觉上真实的解。表 11 报告测试集上盒式修补 10 次独立运行的均值 ± 标准差，表明 SGPnP 的逐次运行波动很小。图 5 给出更多测量上的额外盒式修补示例：DPIR 与 SNORE 常常产生不完整重建，带分数先验的确定性 PGM 改善了结果但在困难情形下仍然吃力；相比之下，所提方法给出更合理的图像补全。

**图 4（原文 Fig. 4）：** 用 SGPnP-PGM 在相同测量上重复运行得到的盒式修补结果。该方法在多次运行间产生一致的重建。

### C.5 运行时间与计算开销

我们在表 9 中报告所有求解器的实际耗时（wall-clock）、网络类型与迭代次数 \(K\)。由此可得两点。第一，噪声注入没有带来可测的开销：SDPnP-RED（无注入）与 SGPnP-RED（有注入）在 \(K=200\) 时分别为每张图像 2,300 ms 与 2,302 ms。第二，SGPnP 的收益并非来自额外的去噪器评估：SGPnP 与 DiffPIR 都用 \(K=200\)，而 DPS 用 \(K=1000\)；在实际耗时上，SGPnP 与 DiffPIR 相当（2,300 ms），且远低于 SNORE（8,475 ms）与 DPS（24,050 ms）。

**表 9（原文 Table 9）：** PnP 与基于扩散的求解器的运行时间比较。\(K\) 表示迭代次数，time/image 报告每次重建的总实际耗时。

| 方法 | 网络 | \(K\) | time/image |
|---|---|---|---|
| DPIR（classical） | DRUNet | 200 | 1,130 ms |
| SNORE | DRUNet | 1500 | 8,475 ms |
| DPS | Diffusion | 1000 | 24,050 ms |
| DiffPIR | Diffusion | 200 | 2,300 ms |
| SDPnP-RED | Diffusion | 200 | 2,300 ms |
| SGPnP-RED | Diffusion | 200 | 2,302 ms |

**表 10（原文 Table 10）：** FFHQ（修补、4× 超分辨率、去模糊）与 fastMRI（4× CS-MRI）上两种计划下 SGPnP-RED 的比较：主实验所用配置（每个噪声水平 1 个内步）与分阶段配置（每个噪声水平 10 个内步）。二者在所有任务上表现相当。

| 测试数据 | 指标 | Input | SGPnP-RED（1 内步，200 噪声水平） | SGPnP-RED（10 内步，200 噪声水平） |
|---|---|---|---|---|
| 修补 | PSNR↑ | 18.17 | 24.62 | 25.26 |
| 修补 | SSIM↑ | 0.766 | 0.865 | 0.867 |
| 修补 | LPIPS↓ | 0.289 | **0.111** | 0.120 |
| 超分辨率 | PSNR↑ | 24.61 | 29.38 | 29.45 |
| 超分辨率 | SSIM↑ | 0.778 | 0.864 | 0.866 |
| 超分辨率 | LPIPS↓ | 0.305 | **0.197** | 0.199 |
| 去模糊 | PSNR↑ | 23.69 | 33.11 | 34.07 |
| 去模糊 | SSIM↑ | 0.703 | 0.916 | 0.930 |
| 去模糊 | LPIPS↓ | 0.326 | 0.089 | **0.082** |
| CS-MRI | PSNR↑ | 22.43 | 32.31 | 32.55 |
| CS-MRI | SSIM↑ | 0.622 | 0.866 | 0.870 |
| CS-MRI | LPIPS↓ | 0.333 | 0.128 | **0.111** |

**表 11（原文 Table 11）：** DPS、DiffPIR 与两种 SGPnP 变体（SGPnP-PGM 与 SGPnP-RED）在盒式修补上的比较。每项为 10 次独立运行的均值 ± 标准差，其中每次运行的指标先在测试集上平均。

| 指标 | DPS | DiffPIR | SGPnP-PGM | SGPnP-RED |
|---|---|---|---|---|
| PSNR↑ | 23.86±0.970 | 25.00±0.696 | **25.11±0.566** | 24.88±0.527 |
| SSIM↑ | 0.835±0.0101 | 0.859±0.0076 | **0.873±0.0060** | 0.852±0.0058 |
| LPIPS↓ | 0.152±0.0082 | 0.113±0.0057 | **0.108±0.0038** | 0.131±0.0038 |

### C.6 分阶段与单步计划的对比

第 4 节的收敛分析假设一种**分阶段（staged）**计划：在退火之前对每个噪声水平取若干步；而主实验中使用的 SGPnP 配置每个水平只取一步。为检验所分析的算法与实际算法行为一致，我们在 200 个噪声水平中的每一个上取 10 个内步运行 SGPnP-RED，并与主实验的单步配置比较。表 10 在 FFHQ（修补、4× 超分辨率、去模糊）与 fastMRI（4× CS-MRI）上报告了二者。两种配置在全部四个任务上取得相当的重建质量，PSNR 差别最多约 1 dB、SSIM 差别最多 0.014，说明理论所分析的分阶段计划与实践中所运行的单步计划行为一致。

### C.7 非线性逆问题

主实验使用带高斯噪声的线性前向算子。为检验该设定之外的普遍性，我们评估非线性去模糊问题（使用 [14] 的神经网络退化前向模型）。表 12 比较 SGPnP-RED 与 DPS：SGPnP-RED 改善了 PSNR（26.29 vs. 25.40 dB）与 SSIM（0.772 vs. 0.742），而 DPS 取得更低的 LPIPS（0.220 vs. 0.269）。这表明 SGPnP 可扩展到非线性前向模型，尽管我们并不声称在所有指标上一致改进。

**表 12（原文 Table 12）：** DPS 与 SGPnP-RED 在非线性去模糊问题（使用 [14] 的神经网络退化前向模型）上的定量比较。注意 SGPnP 能够有效处理非线性逆问题。

| 指标 | DPS | SGPnP-RED |
|---|---|---|
| PSNR↑ | 25.40 | **26.29** |
| SSIM↑ | 0.742 | **0.772** |
| LPIPS↓ | **0.220** | 0.269 |

### C.8 插值时间步上的去噪

第 3.1 节以通过对插值噪声计划反演得到的**分数时间步** \(t^\ast\) 对预训练网络做条件化。为检验这类分数时间步是否仍处于训练范围内，我们用与 \(t^\ast\) 相对应的噪声水平 \(\sigma\) 污染 100 张留出测试图像，并用条件化在 \(t^\ast\) 的网络对其去噪，在计划的四个点上以四分之一步长扫描 \(t^\ast\)。表 13 表明 PSNR 随 \(\sigma\) 单调下降，在非整数 \(t^\ast\) 处没有不连续。

**表 13（原文 Table 13）：** 预训练扩散模型在训练条目之间的分数时间步 \(t^\ast\) 上、对 100 张留出测试图像做条件化去噪的 PSNR。即便 \(t^\ast\) 非整数，PSNR 仍随噪声水平 \(\sigma\) 单调下降。

| 时间步 \(t^\ast\) | 噪声水平 \(\sigma\) | PSNR (dB) |
|---|---|---|
| 2.00 | 0.0190 | 45.64 |
| 2.25 | 0.0199 | 45.37 |
| 2.50 | 0.0209 | 45.11 |
| 2.75 | 0.0218 | 44.87 |
| 3.00 | 0.0228 | 44.64 |
| 30.00 | 0.1115 | 36.86 |
| 30.25 | 0.1124 | 36.83 |
| 30.50 | 0.1132 | 36.79 |
| 30.75 | 0.1140 | 36.76 |
| 31.00 | 0.1148 | 36.73 |
| 100.00 | 0.3423 | 32.06 |
| 100.25 | 0.3431 | 32.05 |
| 100.50 | 0.3440 | 32.04 |
| 100.75 | 0.3448 | 32.03 |
| 101.00 | 0.3457 | 32.02 |
| 768.00 | 19.9605 | 16.50 |
| 768.25 | 19.9995 | 16.50 |
| 768.50 | 20.0385 | 16.49 |
| 768.75 | 20.0776 | 16.48 |
| 769.00 | 20.1166 | 16.48 |

### C.9 与基于流匹配的 PnP 的比较

为与 PnP-Flow [51] 做匹配数据集的比较，我们在 FFHQ 上训练一个流匹配模型，并对 PnP-Flow 按其超参数做逐问题网格搜索调优。表 14 表明 SGPnP-PGM 在全部三个问题的 PSNR（高出 1.2–3.9 dB）与 SSIM 上都优于 PnP-Flow，并在修补与去模糊的 LPIPS 上更优；在超分辨率上，PnP-Flow 取得略低的 LPIPS（0.193 vs. 0.194）。方法学上，两种方法都在去噪前对迭代量重新加噪：PnP-Flow 通过与高斯噪声做插值把它重新投影到学习到的流匹配路径上，这使其噪声水平被绑定到去噪器被评估的时间；而 SGPnP 注入水平为 \(\sigma^{\mathrm{inject}}\) 的噪声，并在可独立设定的条件化水平 \(\sigma^{\mathrm{cond}}\) 上应用预训练基于分数的扩散模型。

**表 14（原文 Table 14）：** FFHQ（修补、4× 超分辨率、去模糊）上 PnP-Flow [51] 与 SGPnP-PGM 的比较。SGPnP-PGM 结果取自表 1。每个指标与每个逆问题的最优值以高亮标出（本表用粗体）。

| 测试数据 | 指标 | Input | PnP-Flow | SGPnP-PGM |
|---|---|---|---|---|
| 修补 | PSNR↑ | 18.17 | 24.02 | **25.21** |
| 修补 | SSIM↑ | 0.766 | 0.845 | **0.874** |
| 修补 | LPIPS↓ | 0.289 | 0.135 | **0.108** |
| 超分辨率 | PSNR↑ | 24.61 | 28.30 | **29.90** |
| 超分辨率 | SSIM↑ | 0.778 | 0.853 | **0.874** |
| 超分辨率 | LPIPS↓ | 0.305 | **0.193** | 0.194 |
| 去模糊 | PSNR↑ | 23.69 | 30.64 | **34.52** |
| 去模糊 | SSIM↑ | 0.703 | 0.898 | **0.935** |
| 去模糊 | LPIPS↓ | 0.326 | 0.110 | **0.068** |

**图 5（原文 Fig. 5）：** 更多测量上的附加盒式修补结果。对这一具有挑战性的任务，DPIR 与 SNORE 常常产生不完整重建；SDPnP-PGM 改善了结果但在某些情形下仍不完整，而 SGPnP-PGM 给出更合理的图像补全。

## 附录 D 前人工作与我们方法的区别

在近期面向逆问题的 PnP 方法中，随机去噪正则化（SNORE）[4] 与我们先前的工作 [23] 最为接近。虽然 [23] 把基于分数的扩散先验严格以确定性方式纳入 PnP，SNORE [4] 则为仅在低噪声区间内、在 RED 中运行的经典去噪器引入了噪声注入。相比之下，SGPnP 利用覆盖宽噪声水平范围的基于分数的扩散先验，从而取得更优的重建性能，并能求解此前基于优化的 PnP 方法无法处理的严重病态逆问题。此外，SGPnP 把随机重加噪扩展到通用 PnP 框架（包括 ADMM、HQS、PGM 与 RED），并给出 PnP 文献中首个严格鞍点规避保证。这些区别汇总于表 15。

**表 15（原文 Table 15）：** SNORE [4] 与 SGPnP 的比较。SGPnP 把随机重加噪与基于分数的扩散先验结合起来，并为由此产生的随机动力学提供保证。

| 项目 | SNORE | SGPnP（本文） |
|---|---|---|
| 去噪器先验 | 经典去噪器，为低噪声复原训练 | 基于分数的扩散先验（SBDM），在很宽的噪声水平范围内训练 |
| 噪声注入 | 注入高斯噪声并在**相同**噪声水平上去噪 | 注入高斯噪声，同时**解耦**注入与条件化噪声水平，以计入数据一致性更新引入的污染 |
| 噪声的理论作用 | 使算法收敛到临界点附近 | 促使逃离严格鞍点，同时保持向临界点收敛的能力 |
| 严重病态任务 | 通常相对确定性 PnP 只有微弱改进 | 借助表达力强的 SBDM 先验与解耦噪声控制，实现更稳健的生成式重建 |

## 致谢

本工作部分由美国国家科学基金会（National Science Foundation）CAREER award 2625643 与 award 2622128 支持，部分由美国能源部科学办公室高级科学计算研究办公室（U.S. Department of Energy, Office of Science, Office of Advanced Scientific Computing Research）通过 Triad National Security, LLC（“Triad”）合同 89233218CNA000001 [FWP: LANLE2A2] 以及 Award DE-SC0025589 支持。

## 参考文献

[1] S. V. Venkatakrishnan, C. A. Bouman, and B. Wohlberg, "Plug-and-play priors for model based reconstruction," in IEEE Global Conference on Signal and Information Processing, 2013, pp. 945–948.

[2] N. Eslahi and A. Foi, "Improved sparse signal recovery via adaptive correlated noise model," IEEE Transactions on Computational Imaging, vol. 8, pp. 945–960, 2022.

[3] K. Dabov, A. Foi, V. Katkovnik, and K. Egiazarian, "Image denoising by sparse 3-d transform-domain collaborative filtering," IEEE Transactions on Image Processing, vol. 16, no. 8, pp. 2080–2095, 2007.

[4] M. Renaud, J. Prost, A. Leclaire, and N. Papadakis, "Plug-and-play image restoration with stochastic denoising regularization," in Proceedings of the 41st International Conference on Machine Learning, 2024.

[5] K. Zhang, Y. Li, W. Zuo, L. Zhang, L. Van Gool, and R. Timofte, "Plug-and-play image restoration with deep denoiser prior," IEEE Transactions on Pattern Analysis and Machine Intelligence, vol. 44, no. 10, pp. 6360–6376, 2021.

[6] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Advances in Neural Information Processing Systems, vol. 33, 2020, pp. 6840–6851.

[7] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, "Score-based generative modeling through stochastic differential equations," in International Conference on Learning Representations, 2021.

[8] C. Y. Park, M. T. McCann, C. Garcia-Cardona, B. Wohlberg, and U. S. Kamilov, "Random walks with Tweedie: A unified view of score-based diffusion models [in the spotlight]," IEEE Signal Processing Magazine, vol. 42, no. 3, pp. 40–51, 2025. [Online]. Available: https://doi.org/10.1109/MSP.2025.3590608

[9] Y. Romano, M. Elad, and P. Milanfar, "The little engine that could: regularization by denoising (RED)," SIAM Journal on Imaging Sciences, vol. 10, no. 4, pp. 1804–1844, 2017.

[10] R. Laumont, V. De Bortoli, A. Almansa, J. Delon, A. Durmus, and M. Pereyra, "Bayesian imaging using plug & play priors: when Langevin meets Tweedie," SIAM Journal on Imaging Sciences, vol. 15, no. 2, pp. 701–737, 2022.

[11] C. A. Bouman and G. T. Buzzard, "Generative plug and play: Posterior sampling for inverse problems," in 2023 59th Annual Allerton Conference on Communication, Control, and Computing (Allerton). IEEE, 2023, pp. 1–7.

[12] Y. Zhu, K. Zhang, J. Liang, J. Cao, B. Wen, R. Timofte, and L. Van Gool, "Denoising diffusion models for plug-and-play image restoration," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2023, pp. 1219–1229.

[13] B. Kawar, M. Elad, S. Ermon, and J. Song, "Denoising diffusion restoration models," in Advances in Neural Information Processing Systems, vol. 35, 2022, pp. 23 593–23 606.

[14] H. Chung, J. Kim, M. T. McCann, M. L. Klasky, and J. C. Ye, "Diffusion posterior sampling for general noisy inverse problems," in Proc. ICLR, 2023.

[15] M. T. McCann, H. Chung, J. C. Ye, and M. L. Klasky, "Score-based diffusion models for Bayesian image reconstruction," in 2023 IEEE International Conference on Image Processing (ICIP), Kuala Lumpur, Malaysia, 2023, pp. 111–115.

[16] Y. Sun, Z. Wu, Y. Chen, B. T. Feng, and K. L. Bouman, "Provable probabilistic imaging using score-based generative priors," IEEE Transactions on Computational Imaging, 2024.

[17] Z. Wu, Y. Sun, Y. Chen, B. Zhang, Y. Yue, and K. L. Bouman, "Principled probabilistic imaging using diffusion models as plug-and-play priors," in Proceedings of the 38th Conference on Neural Information Processing Systems (NeurIPS), 2024.

[18] X. Xu and Y. Chi, "Provably robust score-based diffusion posterior sampling for plug-and-play image reconstruction," arXiv:2403.17042, 2024.

[19] F. Coeurdoux, N. Dobigeon, and P. Chainais, "Plug-and-play split Gibbs sampler: Embedding deep generative priors in bayesian inference," IEEE Transactions on Image Processing, 2024.

[20] E. C. Faye, M. D. Fall, and N. Dobigeon, "Regularization by denoising: Bayesian model and Langevin-within-split Gibbs sampling," arXiv:2402.12292, 2024.

[21] M. Gülle, J. Yun, Y. U. Alçalar, and M. Akçakaya, "Consistency models as plug-and-play priors for inverse problems," arXiv:2509.22736, 2025.

[22] G. Daras, H. Chung, C.-H. Lai, Y. Mitsufuji, J. C. Ye, P. Milanfar, A. G. Dimakis, and M. Delbracio, "A survey on diffusion models for inverse problems," arXiv:2410.00083, 2024.

[23] C. Y. Park, Y. Hu, M. T. McCann, C. Garcia-Cardona, B. Wohlberg, and U. S. Kamilov, "Plug-and-play priors as a score-based method," in IEEE International Conference on Image Processing, Anchorage, Alaska, 2025.

[24] N. Parikh and S. Boyd, "Proximal algorithms," Foundations and Trends® in Optimization, vol. 1, no. 3, pp. 127–239, 2014.

[25] S. Sreehari, S. V. Venkatakrishnan, B. Wohlberg, G. T. Buzzard, L. F. Drummy, J. P. Simmons, and C. A. Bouman, "Plug-and-play priors for bright field electron tomography and sparse interpolation," IEEE Trans. Comput. Imag., vol. 2, no. 4, pp. 408–423, December 2016.

[26] S. H. Chan, X. Wang, and O. A. Elgendy, "Plug-and-play ADMM for image restoration: Fixed-point convergence and applications," IEEE Transactions on Computational Imaging, vol. 3, no. 1, pp. 84–98, 2016.

[27] J. R. Chand and M. Jacob, "Multi-scale energy (MUSE) framework for inverse problems in imaging," IEEE Transactions on Computational Imaging, vol. 10, pp. 1250–1265, 2024.

[28] J. Tang and M. Davies, "A fast stochastic plug-and-play ADMM for imaging inverse problems," arXiv:2006.11630, 2020.

[29] Y. Sun, Z. Wu, X. Xu, B. Wohlberg, and U. S. Kamilov, "Scalable plug-and-play ADMM with convergence guarantees," IEEE Transactions on Computational Imaging, vol. 7, pp. 849–863, 2021.

[30] Z. Wu, Y. Sun, J. Liu, and U. S. Kamilov, "Online regularization by denoising with applications to phase retrieval," in Proceedings of the IEEE/CVF International Conference on Computer Vision Workshops, 2019.

[31] Y. Sun, J. Liu, Y. Sun, B. Wohlberg, and U. S. Kamilov, "Async-RED: A provably convergent asynchronous block parallel stochastic method using deep denoising priors," arXiv:2010.01446, 2020.

[32] J. Liu, Y. Sun, W. Gan, X. Xu, B. Wohlberg, and U. S. Kamilov, "SGD-Net: Efficient model-based deep learning with theoretical guarantees," IEEE Transactions on Computational Imaging, vol. 7, pp. 598–610, 2021.

[33] Y. Sun, B. Wohlberg, and U. S. Kamilov, "Plug-in stochastic gradient method," arXiv:1811.03659, 2018.

[34] ——, "An online plug-and-play algorithm for regularized image reconstruction," IEEE Transactions on Computational Imaging, vol. 5, no. 3, pp. 395–408, 2019.

[35] M. C. Bendel, S. K. Shastri, R. Ahmad, and P. Schniter, "Solving inverse problems using diffusion with iterative colored renoising," Transactions on Machine Learning Research, vol. 2025, p. 4646, 2025. [Online]. Available: https://openreview.net/forum?id=uN6A3b8Abe

[36] B. Efron, "Tweedie's formula and selection bias," Journal of the American Statistical Association, vol. 106, no. 496, pp. 1602–1614, 2011.

[37] H. Daneshmand, J. Kohler, A. Lucchi, and T. Hofmann, "Escaping saddles with stochastic gradients," in Proceedings of the International Conference on Machine Learning. PMLR, 2018, pp. 1155–1164.

[38] R. Pemantle, "Nonconvergence to unstable points in Urn models and stochastic approximations," The Annals of Probability, vol. 18, no. 2, pp. 698–712, 1990.

[39] Y. Carmon, J. C. Duchi, O. Hinder, and A. Sidford, ""Convex until proven guilty": Dimension-free acceleration of gradient descent on non-convex functions," in Proceedings of the 34th International Conference on Machine Learning. PMLR, 2017, pp. 654–663.

[40] N. Agarwal, Z. Allen-Zhu, B. Bullins, E. Hazan, and T. Ma, "Finding approximate local minima faster than gradient descent," in Proceedings of the 49th Annual ACM SIGACT Symposium on Theory of Computing, 2017, pp. 1195–1199.

[41] N. Marumo and A. Takeda, "Parameter-free accelerated gradient descent for nonconvex minimization," SIAM Journal on Optimization, vol. 34, no. 2, pp. 2093–2120, 2024.

[42] H. Li and Z. Lin, "Restarted nonconvex accelerated gradient descent: No more polylogarithmic factor in the O(ε^{−7/4}) complexity," Journal of Machine Learning Research, vol. 24, no. 157, pp. 1–37, 2023.

[43] P. Vincent, "A connection between score matching and denoising autoencoders," Neural Computation, vol. 23, no. 7, pp. 1661–1674, 2011.

[44] T. Karras, S. Laine, and T. Aila, "A style-based generator architecture for generative adversarial networks," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019, pp. 4401–4410.

[45] J. Zbontar, F. Knoll, A. Sriram, T. Murrell, Z. Huang, M. J. Muckley, A. Defazio, R. Stern, P. Johnson, M. Bruno, M. Parente, K. J. Geras, J. Katsnelson, H. Chandarana, Z. Zhang, M. Drozdzal, A. Romero, M. Rabbat, P. Vincent, N. Yakubova, J. Pinkerton, D. Wang, E. Owens, C. L. Zitnick, M. P. Recht, D. K. Sodickson, and Y. W. Lui, "fastMRI: An open dataset and benchmarks for accelerated MRI," arXiv:1811.08839, 2018.

[46] F. Knoll, J. Zbontar, A. Sriram, M. J. Muckley, M. Bruno, A. Defazio, M. Parente, K. J. Geras, J. Katsnelson, H. Chandarana, Z. Zhang, M. Drozdzal, A. Romero, M. Rabbat, P. Vincent, J. Pinkerton, D. Wang, N. Yakubova, E. Owens, C. L. Zitnick, M. P. Recht, D. K. Sodickson, and Y. W. Lui, "fastMRI: A publicly available raw k-space and DICOM dataset of knee images for accelerated MR image reconstruction using machine learning," Radiology: Artificial Intelligence, vol. 2, no. 1, p. e190007, 2020.

[47] C. Y. Park, S. Shoushtari, H. An, and U. S. Kamilov, "Measurement score-based diffusion model," in International Conference on Learning Representations, 2026.

[48] P. L. Combettes and J.-C. Pesquet, "Proximal splitting methods in signal processing," in Fixed-Point Algorithms for Inverse Problems in Science and Engineering. New York, NY: Springer New York, 2011, pp. 185–212.

[49] J. Tachella, D. Chen, S. Hurault, M. Terris, and A. Wang, "DeepInverse: A deep learning framework for inverse problems in imaging," 2023, date released: 2023-06-30.

[50] R. Zhang, P. Isola, A. A. Efros, E. Shechtman, and O. Wang, "The unreasonable effectiveness of deep features as a perceptual metric," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2018, pp. 586–595.

[51] S. Martin, A. Gagneux, P. Hagemann, and G. Steidl, "PnP-Flow: Plug-and-play image restoration with flow matching," in International Conference on Learning Representations (ICLR), 2025, pp. 45 466–45 492.

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、正文第 1–6 节（§1 引言含三条贡献、§2 背景、§3 方法与 §3.1–3.2、§4 理论分析与 §4.1–4.2、§5 数值评估与 §5.1–5.4、§6 结论）、式 (1)–(32)、算法 1–3（逐行）、定义 1–2、假设 1–4、定理 1–2、引理 1–3、表 1–15（逐格数值转写）、图 1–5 图注、附录 A–D 与致谢、参考文献 [1]–[51]（英文原条目）；原文无独立的 Limitations 节。**重点核对说明（与 lead 指定核对点一致）：** ① 表 1（FFHQ 修补）PSNR：**SGPnP 25.21 dB、DiffPIR 25.09 dB**（差值 0.12 dB，提升很小）；表 1（fastMRI 4× CS-MRI）PSNR：**SGPnP 32.54 dB、DiffPIR 29.81 dB**；② 表 1 超分辨率 LPIPS：**SGPnP 0.194 弱于 DPS 的 0.140**（该列最优为 DPS，本页已按渲染页高亮/粗体标为 DPS 最优，未回避），DiffPIR 亦为 0.194；③ 表 1 的表述“在 PSNR 与 SSIM 上一致优于 PnP 基线与纯扩散求解器”仅限 PSNR/SSIM，LPIPS 上并非逐项最优（去模糊 0.068 与修补 0.108 为最优，超分辨率非最优）——本页照译原文措辞未做加减；④ 理论部分所依赖的条件已在译文中逐条保留：**假设 2 要求去噪器是理想 MMSE 去噪器**（由 Tweedie 公式给出的无偏性）、**假设 1 要求 $g$ 与 $h_\sigma$ 具 Lipschitz 梯度与 Lipschitz Hessian 且 $f_\sigma$ 有界梯度、有下界**、**假设 3 要求随机场几乎必然有界、方差有上界且沿负曲率方向（式 (19)）具非退化分量**、**假设 4 要求 $h_0$ 连续可微、$f_0$ 强制且迭代量落在紧集 $\mathcal K$ 上、梯度一致收敛（式 (20)）**、**定理 2 依赖逐阶段内循环（引理 2）与 $\sigma_k\to0$、$\gamma_k\to0$、$\gamma_kL_kV_{\max}(\sigma_k)\to0$ 的退火计划**；**这些条件并非对所有实用 PnP 变体自动成立**；⑤ **不能由本文直接宣称实用 ADMM/FlowADMM 收敛或给出精确后验**：原文明确说明理论针对算法 3 所对应、且 $\sigma^{\mathrm{inject}}=\sigma^{\mathrm{cond}}$ 的匹配噪声情形，解耦设定“属于本理论未覆盖的经验扩展”；原文亦强调鞍点规避的严格参数配置“纯粹为理论最坏情形界”，实践可用经验调参；本页在 §4 与该段均如实保留这些限定，未把结论外推到 ADMM 等其它实用算法或精确贝叶斯后验。**已知缺陷与核查疑点：** ⑥ pypdf 抽取把表格的列结构与高亮标记压平（数值连写、最优值仅以背景色高亮而无粗体），本页表 1、2、3 已按 PDF 第 6、7 页 4× 放大渲染逐格核对（表 1 与表 3 的高亮最优已用粗体还原；表 2 原文为颜色编码，本页用粗体标出可见最优项）；表 4–14 按第 10–14 页抽取文本转写（表 4 的超参数为逐行核对但未逐格渲染），部分上标（如 $\sigma_0^{\mathrm{cond}}$）的原始字体较小，已按上下文还原；⑦ 表 11 的标准差排版原文为“均值±标准差”，本页照抄数值与位数（如 23.86±0.970）；⑧ 原文式 (11)、(12) 中 VP 记号的上下标在抽取中错位（如 $\bar\alpha_t$ 与 $x_{\bar\alpha_t}$），本页按渲染页与扩散模型标准记号还原；⑨ 图 1–5 为位图，图注按原文翻译，未推测图中未标注的数值；⑩ 原文表 7 的 r=0.05 列在修补/超分上仅 10.8/10.4 dB（崩溃区间），本页照抄。**建议后续 QA 重点：** 式 (9) 中 $c\sigma^2$ 与 $p_{c\sigma}$ 的下标一致性、式 (12) VP 去噪器系数 $(1-\bar\alpha_t)\sqrt{\bar\alpha_t}$ 的还原、式 (16) 中 $\sigma^{-2}$ 归一化与式 (17) 的步长耦合、假设 3 与引理 3 中 $c=\sigma^2$ 的对应关系、以及表 4 超参数中 CS-MRI 行 $\gamma=35.0$（DPIR）等异常大值的核对。逐句逐式终校未做。

---

**登记（2026-11-06）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
