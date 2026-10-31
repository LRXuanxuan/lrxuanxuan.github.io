---
layout: page
title: "DMPlug：用扩散模型求解逆问题的即插即用方法｜中文全文译文"
permalink: /papers/translations/2026-10-03-2405-16749-dmplug-a-plug-in-method-for-solving-inverse-problems-with-diffusion-mo/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1e18e06c70407123/) · [原文 arXiv](https://arxiv.org/abs/2405.16749) · [全部目录](/papers/catalog/)

# DMPlug：用扩散模型求解逆问题的即插即用方法

**原题：** DMPlug: A Plug-in Method for Solving Inverse Problems with Diffusion Models  
**作者：** Hengkang Wang、Xu Zhang、Taihui Li、Yuxiang Wan、Tiancong Chen、Ju Sun（美国明尼苏达大学双城分校计算机科学与工程系；Xu Zhang 另属 Amazon.com Inc.）。原文脚注说明：本工作与 Xu Zhang 博士在 Amazon 的职位无关。  
**版本：** arXiv:2405.16749v2（cs.LG），v2 日期 2024 年 11 月 6 日；原文为第 38 届神经信息处理系统大会（NeurIPS 2024）论文，共 36 页。  
**范围与状态：** 全文中文译稿：摘要、第 1—5 节、致谢、图 1—18 图注、表 1—10、算法 1—3、参考文献 [1]—[81]（英文原条目）与附录 A—F。原文的 NeurIPS Paper Checklist（第 31—36 页）属投稿检查表、非论文正文，按翻译规则省略；原文表格中的绿色/红色（性能升降）为颜色编码，本页以纯文本符号与正负号表达，粗体与下划线分别表示原文的最优与次优。逐句逐式终校未做，不标记为已验收全文。

> **译注（表格约定）：** 原文表格统一以**粗体**标最优、以下划线标次优，并以绿色/红色表示相对最优基线的性能升降；本页保留粗体与下划线（`<u>`），颜色在纯文本页面无法呈现，故末行差值直接用正负号表示（LPIPS 越低越好，PSNR/SSIM 越高越好；负差值表示本文方法更优）。表中 "N/A" 表示原文未报告该设置。

## 摘要

预训练的扩散模型（diffusion models，DMs）近来被广泛用于求解逆问题（inverse problems，IPs）。现有方法大多把反向扩散过程中的迭代步与"使迭代点更接近测量约束"的迭代步交错进行。然而，这种交错式方法难以产出既像感兴趣的自然目标（即流形可行性）又拟合测量（即测量可行性）的最终结果，对非线性逆问题尤其如此。此外，它们处理测量噪声类型与强度均未知的含噪逆问题的能力仍不清楚。本文主张把扩散模型中的反向过程视为一个函数，并提出一种使用预训练扩散模型求解逆问题的新颖即插即用方法，称为 DMPlug。DMPlug 以有原则的方式同时处理流形可行性与测量可行性问题，并在对未知噪声类型与强度保持鲁棒方面展现出巨大潜力。通过在多种逆问题任务（包括两个线性逆问题与三个非线性逆问题）上的大量实验，我们证明 DMPlug 持续优于当前最优方法，且在非线性逆问题上往往优势显著。代码见 https://github.com/sun-umn/DMPlug。

## 1 引言

逆问题在诸多领域普遍存在，例如计算机视觉、医学成像、遥感与自动驾驶 [1–4]。逆问题的目标是从含噪测量 $y=\mathcal A(x)+n$ 中恢复未知对象 $x$，其中 $\mathcal A$ 是（可能非线性的）前向模型，$n$ 表示测量噪声。逆问题通常是不适定的：即使 $y$ 无噪声，$x$ 一般也无法由 $y$ 与 $\mathcal A$ 唯一确定。因此，必须引入关于 $x$ 的先验知识，才能得到对潜在 $x$ 的可靠估计。

传统上，逆问题在正则化数据拟合框架下求解，其动机常表述为最大后验（MAP）推断：

$$
\min_x\ \ell(y,\mathcal A(x))+\Omega(x),
\qquad
\ell(y,\mathcal A(x)):\ \text{数据拟合损失},\quad \Omega(x):\ \text{正则项}.
\tag{1}
$$

这里，最小化数据拟合损失促使 $y\approx\mathcal A(x)$，正则项则编码关于 $x$ 的先验知识。近年来，深度学习（DL）的出现为求解逆问题带来了若干新的算法思路。例如，给定测量—对象配对训练集 $\{(y_i,x_i)\}_{i=1,\dots,N}$，人们希望训练一个 DL 模型，对给定 $y$ 直接预测 $x$ [5–16]。然而，收集大规模、真实配对训练集的实际困难（尤其对复杂逆问题）可能使这种希望破灭 [17,18]。即便这些困难能够克服，也可能需要为每个新逆问题重新收集训练集并训练新模型 [15]，从而忽略了不同逆问题之间可能共享的关于 $x$ 的先验。另一类有吸引力的思路把预训练的先验与式（1）的正则化数据拟合相结合：先用深度生成模型（如生成对抗网络（GAN）与扩散模型）在形如 $\{x_i\}_{i=1,\dots,N}$ 的训练集上建模 $x$ 的分布，再在求解式（1）时编码这些预训练生成先验。这样，关于 $x$ 的预训练先验便可"开箱即用"地复用于同一类结构化对象的不同逆问题。

本文关注用预训练扩散模型求解逆问题。由于训练相对稳定（例如相对 GAN）且训练完成后具备生成照片级真实图像（以及依应用而定的其他结构化对象）的强大能力，扩散模型近来已成为深度生成模型中的主导家族 [22–27]。这些优势推动了用预训练扩散模型求解逆问题的思路，例如去噪、超分辨率、修复、去模糊与相位恢复 [28,29,20,30–33,21,26,27,34]。其中大多数思路把迭代的反向扩散步与迭代步（有时是投影步，尤其对线性逆问题）交错进行，以更接近可行集 $\{x\,|\,y=\mathcal A(x)\}$（见图 3 与图 4(1)）。然而，由于它们修改了两个迭代过程，通常无法保证迭代序列最终收敛到可行集（即测量可行性），也无法保证收敛到预训练扩散模型所刻画的对象流形 $\mathcal M$（即流形可行性）（详见第 2 节论证）。图 1 展示了这些思路在若干逆问题上产生的可见伪影，突显出（问题 1）流形可行性不足。为快速确认（问题 2）测量可行性不足，我们按 [20,19] 的方式在非线性去模糊问题（一种非线性逆问题）的无噪实例上实验，发现当前最优（SOTA）方法无法找到满足 $y=\mathcal A(x)$ 的 $x$，如图 2 所示。此外，多数基于扩散模型的 SOTA 逆问题方法都假设噪声类型已知（例如通常为高斯噪声）且噪声强度已知（往往很低），这使人怀疑它们面对未知噪声类型与强度时的表现，即（问题 3）对未知噪声类型与强度的鲁棒性——我们在表 4 中确认了这一点。

**本文贡献。** 本文提出一种新的即插即用方法 DMPlug，用预训练扩散模型求解逆问题，以缓解上述三个问题。DMPlug 区别于流行且占主导的交错式思路：它把整个反向扩散过程视为一个函数 $\mathcal R(\cdot)$，该函数由多块堆叠的 DL 模型构成，把种子空间映射到对象流形 $\mathcal M$。这一新视角使我们能够自然地把待恢复对象参数化为 $x=\mathcal R(z)$，并把该重参数化代入式（1），从而得到关于种子 $z$ 的统一优化形式。从概念上讲，由于 $\mathcal R(z)$ 很可能在对象流形 $\mathcal M$ 上产生可行点，而统一形式的全局优化会促使 $y\approx\mathcal A(\mathcal R(z))$，因此优化后的 $z$ 可给出同时具备流形可行性与测量可行性的 $x=\mathcal R(z)$，即解决问题 1 与 2。图 3 与图 4 示意了交错式方法与本文即插即用方法（DMPlug）之间的巨大差异，图 1 与图 2 则确认了 DMPlug 寻找可行解的强大能力。对噪声类型与强度未知的含噪逆问题，我们观察到 DMPlug 具备一种良性的"先学习、后过拟合"（early-learning-then-overfitting，ELTO）性质：估计对象的质量先上升至峰值，随后在开始拟合噪声时下降，如图 6(2) 所示。这一良性性质结合恰当的早停（early stopping，ES）方法（在峰值附近停止估计序列），使我们的方法无需精确的噪声信息即可求解逆问题，即解决问题 3，如表 4 所示。幸运的是，我们发现一种 ES 方法 ES-WMV [35]（由本文部分作者共同提出）对此十分有效（见表 4）。

我们的贡献可总结如下。(1) 在第 3.1 节，我们开创了一种与主流交错式方法显著不同的新即插即用方法 DMPlug，用预训练扩散模型求解逆问题；随后利用一个关键观察，使所提方法在计算与内存开销上变得实用；(2) 在第 4 节与附录 E 中，我们在多种线性与非线性逆问题上进行了大量实验，表明我们的方法在定性上与定量上均优于 SOTA 方法——往往优势显著，尤其在非线性逆问题上。例如以 PSNR 衡量，我们的方法在线性与非线性逆问题上可分别领先 SOTA 方法约 2 dB 与 3～6 dB；此外，第 4.3 节表明我们的方法可以灵活使用不同的先验与优化器；(3) 在第 3.3 节，我们观察到先学习后过拟合（ELTO）性质：DMPlug 倾向于先恢复理想对象，随后过拟合到潜在噪声。利用这一良性性质并集成 ES 方法 ES-WMV [35]，我们的方法首次实现了对未知噪声类型与强度的鲁棒性，在线性与非线性逆问题上以 PSNR 计分别领先 SOTA 方法约 1 dB 与 3.5 dB。

## 2 背景与相关工作

**扩散模型（DMs）。** 去噪扩散概率模型（DDPM）[23] 是无条件图像生成的经典扩散模型。它把 $x_0\sim p_{\mathrm{data}}$ 逐步变换为纯噪声 $x_T\sim\mathcal N(\mathbf 0,\mathbf I)$（即前向扩散过程），再学习通过增量去噪从 $x_T$ 逐步恢复 $x_0$（即反向扩散过程）。前向过程可由随机微分方程（SDE）描述：$\mathrm dx=-\beta_t/2\cdot x\,\mathrm dt+\sqrt{\beta_t}\,\mathrm dw$，其中 $\beta_t$ 为噪声调度，$w$ 为标准 Wiener 过程。相应的反向过程描述为

$$
\text{（DDPM 的反向 SDE）}\quad
\mathrm dx=-\beta_t\left[x/2+\nabla_x\log p_t(x)\right]\mathrm dt+\sqrt{\beta_t}\,\mathrm d\bar w.\tag{2}
$$

这里，$\bar w$ 为时间反演的标准 Wiener 过程，$p_t(x)$ 为时刻 $t$ 的概率密度，$\nabla_x\log p_t(x)$ 为（Stein）得分函数，在扩散模型训练过程中通过得分匹配方法 [36,37] 由 DL 模型 $\boldsymbol\epsilon^{(t)}_{\boldsymbol\theta}(x)$ 近似。对离散设置，给定时间步 $t\in\{1,\dots,T\}$、方差调度 $\beta_1,\dots,\beta_T$、$\alpha_t\triangleq1-\beta_t$（$\alpha_T\to0$）以及 $\bar\alpha_t\triangleq\prod_{s=1}^{t}\alpha_s$，DDPM 的前向过程为 $x_t=\sqrt{1-\beta_t}x_{t-1}+\sqrt{\beta_t}z$，反向过程为

$$
\text{（DDPM）}\quad
x_{t-1}=\frac{1}{\sqrt{\alpha_t}}\left(x_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\cdot\boldsymbol\epsilon^{(t)}_{\boldsymbol\theta}(x_t)\right)+\sqrt{\beta_t}z,\tag{3}
$$

其中 $z\sim\mathcal N(\mathbf 0,\mathbf I)$。由于 DDPM 的反向/采样过程缓慢，文献 [24] 提出去噪扩散隐式模型（DDIM）以缓解该问题。沿用与 DDPM 相同的记号，DDIM 对 DDPM 做了一项关键改动：通过使 $x_t$ 同时依赖 $x_0$ 与 $x_{t-1}$，把前向过程放宽为**非马尔可夫**过程。这一简单改动允许在反向过程中跳过迭代步而无需重新训练 DDPM，从而大幅减少反向步数、显著加速采样。其反向过程现在定义为

$$
\text{（DDIM）}\quad
x_{t-1}=\sqrt{\bar\alpha_{t-1}}\,\hat x_0(x_t)+\sqrt{1-\bar\alpha_{t-1}}\,\boldsymbol\epsilon^{(t)}_{\boldsymbol\theta}(x_t),\tag{4}
$$

其中 $\hat x_0(x_t)\triangleq[x_t-\sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon^{(t)}_{\boldsymbol\theta}(x_t)]/\sqrt{\bar\alpha_t}$ 为由 $x_t$ 预测的 $x_0$。

**用预训练扩散模型求解逆问题。** 用扩散模型求解逆问题的思路可分为两类：监督式与零样本式 [31,38]。前者基于形如 $\{(y_i,x_i)\}$ 的配对训练集训练基于扩散模型的逆问题求解器，故不是本文重点（论证见第 1 节）。后者把预训练扩散模型作为数据驱动先验：(I) 该类别的大多数工作考虑直接建模 $p_t(x\,|\,y)$，把式（2）中的（无条件）得分函数 $\nabla_x\log p_t(x)$ 替换为条件得分函数 $\nabla_x\log p_t(x\,|\,y)=\nabla_x\log p_t(x)+\nabla_x\log p_t(y\,|\,x)$，得到条件反向 SDE

$$
\mathrm dx=\left[-\beta_t/2\cdot x-\beta_t\left(\nabla_x\log p_t(x)+\nabla_x\log p_t(y\,|\,x)\right)\right]\mathrm dt+\sqrt{\beta_t}\,\mathrm d\bar w.\tag{5}
$$

这里，$\nabla_x\log p_t(x)$ 可由预训练得分函数 $\boldsymbol\epsilon^{(t)}_{\boldsymbol\theta}(x)$ 自然近似，但 $\nabla_x\log p_t(y\,|\,x)$ 不可解析计算，因为 $y$ 并不直接依赖 $x^{(t)}$（脚注：在扩散过程的连续表述中，$x$ 是 $t$ 的函数，即 $x(t)$，其中连续变量 $t\in[0,T]$ 常被省略）。规避该困难的思路包括：用 $p_t(y\,|\,\hat x^{(0)}[x^{(t)}])$ 近似 $p_t(y\,|\,x^{(t)})$，其中 $\hat x^{(0)}[x^{(t)}]$ 在离散化中由式（4）的 $\hat x_0(x_t)$ 实现 [19,21]；以及把式（3）或式（4）的无条件反向步与到可行集 $\{x\,|\,y=\mathcal A(x)\}$ 的（近似）投影交错进行，以绕开似然 $p_t(y\,|\,x)$ [39,30,33,32,40,41,20]；(II) 另一种有趣的替代思路是回顾 MAP 框架（见式（1））涉及 $\max_x\log p(y\,|\,x)+\log p(x)$，而优化 MAP 形式的一阶方法（尤其是近端梯度风格的方法）通常只需通过 $\nabla_x\log p(x)$（即得分函数——扩散模型的核心对象！）访问 $p(x)$。因此，可以把预训练扩散模型包裹在一阶方法周围，以（近似）优化 MAP 形式，参见例如 [27,28]。

尽管利用预训练扩散模型先验的概念路径各不相同，迄今为止文献中 (I) 与 (II) 下的大多数方法都遵循同一个算法模板，即算法 1。其中第 3—5 行只是 DDIM（式（4））中的一个反向迭代步（显然，也可以替换为其他合适预训练扩散模型中的反向迭代步）；第 6 行帮助迭代点更靠近或落到可行集 $\{x\,|\,y=\mathcal A(x)\}$ 上。换言之，这些方法把"朝预训练扩散模型所定义的数据流形 $\mathcal M$ 移动"的迭代步与"朝可行集 $\{x\,|\,y=\mathcal A(x)\}$ 移动"的迭代步交错进行，如图 3（左）所示。然而，先验上并不清楚这种交错迭代序列是否会收敛到其中任一目标，从而引发（问题 1）流形可行性不足与（问题 2）测量可行性不足的担忧。事实上，我们的图 1 与图 2 从经验上确认了这些问题，与若干既有文献 [20,42,30] 的观察一致。原则上，问题 2 可以通过确保第 6 行在每次迭代中找到可行的 $x_{i-1}\in\{x\,|\,y=\mathcal A(x)\}$ 来缓解 [39,30,33,32,40,41,20]。然而，这只对容易的逆问题（例如可做闭式投影的线性逆问题）可能，对典型非线性逆问题则很困难，因为会涉及困难的非凸问题。此外，尽管这些方法大多在无噪逆问题之外也考虑了含噪逆问题 [39,30,33,32,20,28,19,21,29]，它们关于噪声类型（常为高斯）与强度（常为低强度）已知的共同假设并不现实：实践中测量噪声类型众多——常常是来自多个来源的混合噪声 [43]，且噪声强度通常未知、难以估计 [44]，这引发对（问题 3）这些方法在未知噪声类型与强度下鲁棒性的担忧；见第 4.2 节。

**算法 1：交错式方法的模板**

- **输入：** 扩散步数 $T$、测量 $y$
1. $x_T\sim\mathcal N(\mathbf 0,\mathbf I)$
2. **for** $i=T-1$ **到** $0$ **do**
3. 　$\hat s\leftarrow\boldsymbol\epsilon^{(i)}_{\boldsymbol\theta}(x_i)$
4. 　$\hat x_0\leftarrow\frac{1}{\sqrt{\bar\alpha_i}}\left(x_i-\sqrt{1-\bar\alpha_i}\,\hat s\right)$
5. 　$x'_{i-1}\leftarrow$ 用 $\hat x_0$ 与 $\hat s$ 的 DDIM 反向步
6. 　$x_{i-1}\leftarrow$ 用 $\hat x_0$ 与 $x'_{i-1}$ 做（近似）投影 [39,30,33,32,40,41,34] 或梯度更新 [20,28,19,21,29,27,26]，以更接近 $\{x\,|\,y=\mathcal A(x)\}$
7. **end for**
- **输出：** 恢复的对象 $x_0$

## 3 方法

本节提出一种简单的即插即用方法 DMPlug，用预训练扩散模型求解逆问题，以解决问题 1 与问题 2（第 3.1 节）；在第 3.2 节讨论它与若干相近思想的联系与区别；最后在第 3.3 节说明如何把早停策略 ES-WMV [35] 集成到即插即用方法中以解决问题 3，从而得到算法 DMPlug+ES-WMV（见算法 3）——它在正则化数据拟合框架式（1）下，即使存在未知噪声，也能用预训练扩散模型求解逆问题。

### 3.1 即插即用方法：DMPlug

**反向过程作为函数与即插即用方法。** 上文讨论的交错式方法之所以难以同时满足流形可行性与测量可行性，是因为它们交错并因而修改了两个过程。尽管投影式修改可以改善测量可行性 [39,30,33,32,40,41,20]，但其应用到非线性逆问题似乎很棘手，且由于 $\mathcal A$ 的非线性通常带来非凸性，单个"投影"步可能与求解原问题一样困难、昂贵 [28,20]。相反，我们提出把整个反向过程视为一个从种子空间映射到对象空间（或对象流形 $\mathcal M$）的函数 $\mathcal R(\cdot)$。数学上，若把单步逆向步写为依赖 $\boldsymbol\epsilon^{(i)}_{\boldsymbol\theta}$ 的函数 $g$，即第 $i$ 个把 $x_{i+1}$ 映射到 $x_i$ 的反向步记作 $g_{\boldsymbol\epsilon^{(i)}_{\boldsymbol\theta}}$，则

$$
\mathcal R=g_{\boldsymbol\epsilon^{(0)}_{\boldsymbol\theta}}\circ g_{\boldsymbol\epsilon^{(1)}_{\boldsymbol\theta}}\circ\cdots\circ g_{\boldsymbol\epsilon^{(T-2)}_{\boldsymbol\theta}}\circ g_{\boldsymbol\epsilon^{(T-1)}_{\boldsymbol\theta}}.
\qquad(\circ\ \text{表示函数复合})\tag{6}
$$

注意对 DDPM 以及一般基于 SDE 的扩散模型，由于每一步都注入噪声，$\mathcal R$ 是随机函数。为减少技术细节，我们聚焦基于常微分方程（ODE）的扩散模型，特别是日益流行的 DDIM [45,46]，从而得到确定性的 $\mathcal R$。这一概念飞跃使我们能把感兴趣的对象重参数化为 $x=\mathcal R(z)$，并把该重参数化代入式（1）的传统正则化数据拟合框架，得到如下统一优化形式：

$$
\text{（DMPlug）}\quad
z^\star\in\arg\min_z\ \ell\left(y,\mathcal A(\mathcal R(z))\right)+\Omega\left(\mathcal R(z)\right),
\qquad
x^\star=\mathcal R(z^\star).\tag{7}
$$

我们强调，此处的优化是关于种子变量 $z$ 的，且给定预训练反向过程 $\mathcal R$。由于我们从不修改反向扩散过程 $\mathcal R$，可期望 $\mathcal R(z)$ 在对象流形 $\mathcal M$ 上产生对象，即强制流形可行性以解决问题 1。此外，优化统一形式式（7）有望促使 $y\approx\mathcal A(\mathcal R(z^\star))$，这是正则化数据拟合框架的内在要求，即促使数据可行性以解决问题 2。当所考虑的逆问题中存在多个感兴趣对象时，即 $y=\mathcal A(x_1,\dots,x_k)+n$ 含 $k$ 个对象（例如盲图像去模糊中 $y=\mathcal A(k,x)+n$，模糊核 $k$ 与清晰图像 $x$ 均为感兴趣对象，其中 $\mathcal A(k,x)=k*x$；另见附录 C.4），不同对象可能有不同的先验，应被编码并区别对待。我们的统一优化形式式（7）便于自然地集成多个先验。另一个额外优点是，统一形式在选择数值优化求解器上具有灵活性。我们在第 4.3 节简要探索这两个方面。

**用于内存与计算效率的快速采样器。** 用典型基于梯度的求解器（如 ADAM [47]）实现 DMPlug 时，每个迭代步的梯度计算都需要对完整的 $\mathcal R$ 做一次前向与一次反向传播，即经过给定扩散模型中基本 DL 模型的 $T$ 个块。对高质量图像生成 [23–25]，$T$ 通常为数十或数百，导致难以承受的内存与计算负担。为此，我们采用 DDIM 作为采样器 $\mathcal R$：其非马尔可夫性质允许跳过反向采样步。令我们惊讶且有利的是，我们发现极少数的反向步（例如 3 步）就足以让我们的方法在所有评估的逆问题上击败 SOTA 方法（见图 5 与第 4 节），而进一步增加步数并不会显著提升性能（实际上甚至略有下降，可能是随着步数增多、梯度消失带来的数值困难所致）。因此，除非另有说明，我们默认反向步数为 3。这一数目不足以用现有扩散模型生成高质量照片级真实图像，但对我们的方法已足够。这一差异暗示图像生成与求解逆问题所涉及的图像"回归"之间存在根本区别——我们将其留待未来工作。

**算法 2：所提即插即用方法 DMPlug**

- **输入：** 轮数 $E$、扩散步数 $T$、测量 $y$
1. 初始化种子 $z^0_T\sim\mathcal N(\mathbf 0,\mathbf I)$
2. **for** $e=0$ **到** $E-1$ **do**
3. 　**for** $i=T-1$ **到** $0$ **do**
4. 　　$\hat s\leftarrow\boldsymbol\epsilon^{(i)}_{\boldsymbol\theta}(z^e_i)$
5. 　　$\hat z^e_0\leftarrow\frac{1}{\sqrt{\bar\alpha_i}}\left(z^e_i-\sqrt{1-\bar\alpha_i}\,\hat s\right)$
6. 　　$z^e_{i-1}\leftarrow$ 用 $\hat z^e_0$、$\hat s$ 的 DDIM 反向步
7. 　**end for**
8. 　由 $z^e_T$ 通过针对式（7）的梯度更新得到 $z^{e+1}_T$
9. **end for**
- **输出：** 恢复的对象 $\mathcal R\left(z^{E-1}_T\right)$

### 3.2 看似相似的思想

**(A) 用于逆问题的 GAN 反演。** 我们的即插即用方法令人联想到用 GAN 反演求解逆问题 [48,49]：对预训练 GAN 生成器 $G_{\boldsymbol\theta}$，GAN 反演做类似的重参数化 $x=G_{\boldsymbol\theta}(z)$ 并代入式（1）；剩余任务同样是对可训练种子 $z$ 最小化所得形式，并通过解 $z^\star$ 产生 $x=G_{\boldsymbol\theta}(z^\star)$。然而，有大量迹象表明 GAN 反演对逆问题效果不佳。例如，[50] 还需在训练种子的同时微调生成器 $G_{\boldsymbol\theta}$ 以提升性能；[33,32] 则报告在求解逆问题时，基于扩散模型的方法优于基于 GAN 反演的方法。

**(B) 扩散反演（DI）。** 给定对象 $x$，扩散反演旨在找到种子 $z$ 使 $\mathcal R(z)$ 重现 $x$，这是基于扩散模型的图像与文本编辑的重要算法组件 [51–53,24,54,55]。扩散反演的流行做法是修改 DDIM [53,24,54,55]。虽然我们不能用扩散反演求解一般逆问题，但扩散反演本身可视为一个逆问题，并通过我们的即插即用方法求解 $\min_z\ell(x,\mathcal R(z))$。

**(C) 算法展开（AU）。** $\mathcal R$ 中的多块结构与算法展开中使用的 DL 模型相似，后者是一类流行的监督式逆问题求解方法 [56,16]。在算法展开中，可训练 DL 模型同样由多个基本 DL 模型块组成，这些块由求解式（1）的展开迭代步导出。区别在于：算法展开中这些 DL 块的权重可训练，而我们 DL 块的权重固定。更重要的是，作为一种监督方法，算法展开需要形如 $\{(y_i,x_i)\}_{i=1,\dots,N}$ 的配对训练集，而本文方法具有零样本（zero-shot）性质。

### 3.3 实现对未知噪声的鲁棒性

**"先学习、后过拟合"（ELTO）现象。** 当 $y$ 含噪声时，求解式（7）可能促使测量可行性 $y\approx\mathcal A(\mathcal R(z^\star))$，但 $\mathcal A(\mathcal R(z^\star))$ 也可能学到噪声，即过拟合到噪声。有趣的是，我们的方法似乎偏好理想内容而抵抗噪声：(A) 与回归随机噪声相比，我们的方法用于回归干净自然图像时收敛快得多（图 6(1)），说明我们的方法对噪声抵抗力强、对结构化内容抵抗力弱；(B) 当对含噪图像 $x=x_0+n$ 做回归时，我们的方法虽然强大到最终可以过拟合含噪图像 $x$，却会先拾取理想的图像内容、再学习噪声，从而呈现标志性的"先学习、后过拟合"（ELTO）现象，使恢复质量在因噪声而潜在退化之前先升至峰值（图 6(2)）。我们强调，类似的 ELTO 现象在使用深度图像先验（deep image priors，DIPs）求解逆问题的文献中已被广泛报道 [57–61]，但这是首次在基于扩散模型的方法中报道该现象。受 DIP 相关研究启发，我们还对中间恢复结果做了谱分析，揭示出我们的方法在学习过程中对低频分量存在谱偏置，与 DIP 方法类似；见附录 B。

**通过早停（ES）实现鲁棒性。** 人们可能好奇：用 DMPlug 求解逆问题时，这种 ELTO 现象有多普遍？除附录 F 中大量额外的可视化确认外，表 4 表明我们的方法在不使用噪声信息的情况下，在迭代过程中的峰值性能上领先 SOTA 方法——在非线性去模糊上尤其优势显著。定量结果表明 ELTO 现象可能普遍存在，尤其跨噪声类型与强度。因此，若能进行恰当的早停（ES）以定位峰值性能，就解决了问题 3。在此推导有效的 ES 策略并非易事，因为实践中我们没有真值图像来计算 PSNR 等基于参考的性能指标。幸运的是，在 DIP 文献中，[35] 发现：对基于 DIP 的逆问题方法，中间重建结果的运行方差曲线的谷值与性能峰值高度对齐。基于这一关键观察，他们提出一种 ES 策略 ES-WMV，能在多种逆问题任务上以很小的性能损失准确检测性能峰值。受其成功启发，我们把 ES-WMV 策略集成到即插即用方法中，发现 ES-WMV 与我们的方法高度协同，能以可忽略的性能损失实现可靠早停（见表 4）。完整算法细节见算法 3。

## 4 实验

本节评估我们的即插即用方法 DMPlug，并在两个线性逆问题（超分辨率与修复）与三个非线性逆问题（非线性去模糊、盲图像去模糊（BID）、带湍流的 BID）上与其他 SOTA 方法比较。遵循 [20]，我们分别从 CelebA [62]、FFHQ [63] 与 LSUN-bedroom [64] 中采样 100 张图像构造评估集，并把所有图像缩放到 $256\times256$；使用图像恢复的三个标准指标衡量恢复质量，包括峰值信噪比（PSNR）、结构相似性指数（SSIM）与学习感知图像块相似度（LPIPS）[65]（默认骨干）。附录 C 详述了所测试的五个逆问题及所用形式；附录 D 给出我们的方法与对比方法的实现细节；附录 E 给出计算开销比较以及更多定量与定性结果。

**表 1：（非线性逆问题）含加性高斯噪声（$\sigma=0.01$）的非线性去模糊。**（粗体：最优；下划线：次优；原文以绿色/红色表示性能升降，本页以正负号表示。来源：原文第 8 页。）

| 方法 | CelebA [62]（$256\times256$） |  |  | FFHQ [63]（$256\times256$） |  |  | LSUN [64]（$256\times256$） |  |  |
|---|---|---|---|---|---|---|---|---|---|
|  | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ |
| BKS-styleGAN [66] | 1.047 | 22.82 | 0.653 | 1.051 | 22.07 | 0.620 | 0.987 | 20.90 | 0.538 |
| BKS-generic [66] | 1.051 | 21.04 | 0.591 | 1.056 | 20.76 | 0.583 | 0.994 | 18.55 | 0.481 |
| MCG [30] | 0.705 | 13.18 | 0.135 | 0.675 | 13.71 | 0.167 | 0.698 | 14.28 | 0.188 |
| ILVR [41] | 0.335 | 21.08 | 0.586 | 0.374 | 20.40 | 0.556 | 0.482 | 18.76 | 0.444 |
| DPS [19] | 0.149 | 24.57 | 0.723 | 0.130 | 25.00 | 0.759 | 0.244 | 23.46 | 0.684 |
| ReSample [20] | 0.104 | 28.52 | 0.839 | 0.104 | 27.02 | 0.834 | 0.143 | 26.03 | 0.803 |
| DMPlug（本文） | **0.073** | **31.61** | **0.882** | **0.057** | **32.83** | **0.907** | **0.083** | **30.74** | **0.882** |
| 相对最优对比方法 | −0.031 | +3.09 | +0.043 | −0.047 | +5.79 | +0.073 | −0.060 | +4.71 | +0.079 |

### 4.1 逆问题任务与实验结果

**线性逆问题。** 受篇幅所限，超分辨率与修复的实验结果见附录 E.2。我们的 DMPlug 平均可领先最优 SOTA 方法约 2 dB（PSNR）与 0.02（SSIM）。

**非线性逆问题——非线性去模糊。** 我们按 [20,19] 使用 [66] 学得的光滑算子（已知高斯型核）并加入 $\sigma=0.01$ 的高斯加性噪声。我们把 DMPlug 与多个强基线比较：基于 GAN 先验的 Blur Kernel Space（BKS）-styleGAN2 [66]、基于 Hyper-Laplacian 先验的 BKS-generic [66]，以及能处理非线性逆问题的基于扩散模型的方法 MCG、ILVR、DPS 与 ReSample。尽管近期的 ReSample [20] 对 DPS 方法做了改进，从表 1 可见 DMPlug 仍能以显著幅度大幅优于 SOTA 的 ReSample。具体地，在三个数据集上平均而言，我们的方法在 LPIPS、PSNR、SSIM 上分别提升 0.05、4.5 dB 与 0.07。此外，如图 1 所示，DMPlug 对细节的恢复更忠实、更精确。

**表 2：（非线性逆问题）含加性高斯噪声（$\sigma=0.01$）的带湍流 BID。**（来源：原文第 8 页。）

| 方法 | CelebA [62]（$256\times256$） |  |  | FFHQ [63]（$256\times256$） |  |  |
|---|---|---|---|---|---|---|
|  | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ |
| DeBlurGANv2 [5] | 0.356 | 24.17 | 0.739 | 0.379 | 23.52 | 0.723 |
| Stripformer [6] | 0.318 | 24.97 | 0.745 | 0.343 | 24.30 | 0.725 |
| MPRNet [7] | 0.379 | 22.64 | 0.696 | 0.399 | 22.28 | 0.682 |
| TSR-WGAN [67] | 0.304 | 23.09 | 0.732 | 0.333 | 22.56 | 0.715 |
| ILVR [41] | 0.337 | 21.25 | 0.589 | 0.375 | 20.24 | 0.554 |
| BlindDPS [21] | **0.137** | 25.45 | 0.730 | 0.165 | 24.40 | 0.712 |
| DMPlug（本文） | 0.146 | **28.34** | **0.790** | **0.164** | **27.91** | **0.812** |
| 相对最优对比方法 | −0.009 | +2.89 | +0.045 | −0.001 | +3.51 | +0.087 |

**BID 与带湍流的 BID。** BID 是从 $y=k*x+n$ 中恢复清晰图像 $x$（及核 $k$），其中 $*$ 表示线性卷积、空间不变的模糊核 $k$ 未知；对长距离成像中常由大气湍流引起的带湍流 BID，我们按 [69] 把前向过程建模为简化的"先倾斜后模糊"过程：$y=k*\mathcal T_\phi(x)+n$，其中 $\mathcal T_\phi(\cdot)$ 是由未知 $\phi$ 参数化的倾斜操作（更多细节见附录 C）。我们主要把 DMPlug 与两个基于扩散模型的模型（ILVR 与作为 DPS 扩展的 BlindDPS [21]）比较。此外，我们选择两种经典基于 MAP 的方法，即 Pan-Dark Channel Prior（Pan-DCP）[70] 与 Pan-$\ell_0$ [71]，基于 DIP 的 SelfDeblur [72]，以及四种基于配对数据监督训练的方法，包括 DeBlurGANv2 [5]、Stripformer [6]、MPRNet [7] 与 TSR-WGAN [67]。需要强调的是，BlindDPS [21] 不仅对图像、也对模糊核（与倾斜图）使用预训练扩散模型，这使它相对其他方法具有不公平的优势。尽管我们的方法可灵活使用多个扩散模型先验（见第 4.3 节），我们选择只对图像使用预训练扩散模型以保证公平比较。表 2 与表 3 表明，尽管所用先验比 BlindDPS 少，我们的方法在 LPIPS、PSNR、SSIM 上平均仍可超越最优对比方法约 0.03、4.5 dB 与 0.1（注：原文此处称"Tables 2 and 3 ... by approximately 0.03, 4.5dB, and 0.1"，与表 3 数值对应；其中 LPIPS 一项本文方法略高于 BlindDPS，详见各表数值）。图 1 中，我们的重建结果比主要对比方法更锐利、更精确。

**表 3：（非线性逆问题）含加性高斯噪声（$\sigma=0.01$）的 BID。**（来源：原文第 9 页。）

| 方法 | CelebA [62] 运动模糊 |  |  | CelebA 高斯模糊 |  |  | FFHQ [63] 运动模糊 |  |  | FFHQ 高斯模糊 |  |  |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
|  | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ |
| SelfDeblur [72] | 0.568 | 16.59 | 0.417 | 0.579 | 16.55 | 0.423 | 0.628 | 16.33 | 0.408 | 0.604 | 16.22 | 0.410 |
| DeBlurGANv2 [5] | 0.313 | 20.56 | 0.613 | 0.350 | 24.29 | 0.743 | 0.353 | 19.67 | 0.581 | 0.374 | 23.58 | 0.726 |
| Stripformer [6] | 0.287 | 22.06 | 0.644 | 0.316 | 25.03 | 0.747 | 0.324 | 21.31 | 0.613 | 0.339 | 24.34 | 0.728 |
| MPRNet [7] | 0.332 | 20.53 | 0.620 | 0.375 | 22.72 | 0.698 | 0.373 | 19.70 | 0.590 | 0.394 | 22.33 | 0.685 |
| Pan-DCP [70] | 0.606 | 15.83 | 0.483 | 0.653 | 20.57 | 0.701 | 0.616 | 15.59 | 0.464 | 0.667 | 20.69 | 0.698 |
| Pan-$\ell_0$ [71] | 0.631 | 15.16 | 0.470 | 0.654 | 20.49 | 0.675 | 0.642 | 14.43 | 0.443 | 0.669 | 20.34 | 0.671 |
| ILVR [41] | 0.398 | 19.23 | 0.520 | 0.338 | 21.20 | 0.588 | 0.445 | 18.33 | 0.484 | 0.375 | 20.45 | 0.555 |
| BlindDPS [21] | **0.164** | 23.60 | 0.682 | 0.173 | 25.15 | 0.721 | 0.185 | 21.77 | 0.630 | 0.193 | 23.83 | 0.693 |
| DMPlug（本文） | 0.104 | **29.61** | **0.825** | **0.140** | **28.84** | **0.795** | **0.135** | **27.99** | **0.794** | **0.169** | **28.26** | **0.811** |
| 相对最优对比方法 | −0.060 | +6.01 | +0.143 | −0.033 | +3.69 | +0.048 | −0.050 | +6.22 | +0.164 | −0.024 | +3.92 | +0.083 |

### 4.2 对未知噪声的鲁棒性

鲁棒性实验中，我们选择超分辨率与非线性去模糊分别代表线性与非线性逆问题。为模拟噪声未知的场景，我们按 [43] 生成含四类噪声（高斯、脉冲、散粒与散斑噪声）与两个噪声强度（低（level-1）与高（level-2））的测量（细节见附录 D.1），但对每个逆问题均使用同一套为温和高斯噪声设计的形式与代码，而不论实际噪声类型与强度。表 4 与图 7 清楚表明：(1) 除 DPS 外，当前大多数逆问题求解器都存在鲁棒性问题，印证了第 2 节的假设；(2) DMPlug 的峰值性能在两个任务上以 PSNR 计可分别领先 SOTA 方法约 1 dB 与 3.5 dB。为检验本方法与 ES-WMV [35] 的兼容性，我们按 [35,59] 用 PSNR 间隙（即峰值与检测到的早停点之间的 PSNR 绝对差）衡量检测性能。表 4 表明两个示例任务中的检测间隙几乎可忽略，PSNR 间隙分别小于 0.5 dB 与 0.2 dB。这说明所提方法与 ES-WMV 高度协同。

**表 4：（鲁棒性与 ES）CelebA [62] 上不同噪声类型与强度下的超分辨率与非线性去模糊。** 仅示出 PSNR↑ 与 PSNR 间隙↓ 以节省篇幅。（来源：原文第 10 页；每格为"低噪声/高噪声"。）

| 方法 | （线性）超分辨率（4×） |  |  |  |  | （非线性）非均匀图像去模糊 |  |  |  |
|---|---|---|---|---|---|---|---|---|---|
|  | 高斯 | 脉冲 | 散粒 | 散斑 |  | 高斯 | 脉冲 | 散粒 | 散斑 |
|  | 低/高 | 低/高 | 低/高 | 低/高 |  | 低/高 | 低/高 | 低/高 | 低/高 |
| ADMM-PnP [73] | 20.17/17.97 | 14.28/14.52 | 19.97/17.82 | 19.42/18.41 |  | N/A | N/A | N/A | N/A |
| DMPS [29] | 20.62/17.54 | 18.78/16.05 | 19.96/16.74 | 20.77/18.73 |  | N/A | N/A | N/A | N/A |
| DDRM [32] | 15.45/14.79 | 14.82/14.14 | 15.31/14.59 | 15.46/15.03 |  | N/A | N/A | N/A | N/A |
| MCG [30] | 17.43/15.83 | 16.39/15.07 | 17.19/15.49 | 17.44/16.43 |  | 12.88/12.85 | 13.16/13.04 | 13.21/13.13 | 13.24/13.07 |
| ILVR [41] | 21.08/21.03 | 20.93/20.00 | 21.19/21.12 | 20.96/20.89 |  | 21.70/21.43 | 21.43/21.00 | 21.56/21.24 | 21.53/21.36 |
| DPS [19] | 25.51/24.58 | 24.89/23.92 | 25.47/24.27 | 25.69/24.97 |  | 23.97/23.35 | 23.74/23.18 | 24.32/23.58 | 23.45/23.61 |
| ReSample [20] | 14.30/13.04 | 15.56/13.48 | 14.38/12.87 | 15.64/14.23 |  | 23.17/20.45 | 20.69/18.91 | 22.94/20.11 | 23.59/21.66 |
| BKS-styleGAN [66] | N/A | N/A | N/A | N/A |  | 22.61/22.53 | 22.64/22.34 | 22.96/22.79 | 22.70/22.56 |
| BKS-generic [66] | N/A | N/A | N/A | N/A |  | 16.85/15.09 | 14.86/13.44 | 16.69/14.74 | 17.04/15.99 |
| DMPlug（本文） | **26.49/25.29** | **26.01/24.76** | **26.34/26.34** | **26.81/25.81** |  | **27.58/26.60** | **27.22/26.13** | **27.71/26.55** | **27.68/26.96** |
| 相对最优对比方法 | +0.98/+0.71 | +1.12/+0.84 | +0.87/+2.07 | +1.12/+0.84 |  | +3.61/+3.25 | +3.48/+2.95 | +3.39/+2.97 | +4.23/+3.35 |
| PSNR 间隙↓ | 0.36/0.46 | 0.38/0.60 | 0.25/0.49 | 0.20/0.21 |  | 0.15/0.12 | 0.14/0.13 | 0.10/0.19 | 0.12/0.09 |

### 4.3 消融研究

我们进行两项消融研究，以展示本方法在使用多个先验/非 DDIM 扩散模型先验以及使用替代优化器方面的灵活性。**（使用扩散模型先验的灵活性）** 首先，我们探索使用不同类型扩散模型的可能性。对超分辨率，表 5 表明潜扩散模型（LDMs）[74,25] 同样与本方法协同。接着，我们以带湍流 BID 为例研究同时使用多个扩散模型的潜力：使用 [21] 提供的额外用于模糊核与倾斜图的预训练扩散模型，本方法可获得更好的重建结果。**（使用替代优化器的灵活性）** 这里我们测试 PyTorch 内置的 ADAM [47] 与 L-BFGS [75] 优化器，并采用若干不同学习率求解式（7）。如表 6 所示，最佳的 ADAM 与 L-BFGS 组合可使 DMPlug 取得可比性能。我们选择 ADAM 作为默认优化器，因为在 PyTorch 中用 ADAM 对多组不同学习率的变量（如带湍流 BID 的情形）做优化易于编程，而 L-BFGS 则较棘手。

**表 5：（灵活性）不同 $x$、$k$、$\phi$ 先验的消融实验**，在 CelebA [62] 的 50 个案例上进行，任务为超分辨率（SR）、非线性去模糊（ND）与带湍流 BID。（来源：原文第 10 页。）

| 任务 | $x$ 的先验 | $k$ 的先验 | $\phi$ 的先验 | PSNR↑ |
|---|---|---|---|---|
| SR | DM | N/A | N/A | 31.51 |
| SR | LDM | N/A | N/A | 31.10 |
| ND | DM | N/A | N/A | 31.61 |
| ND | LDM | N/A | N/A | 30.64 |
| 湍流 | DM | Simplex | None | 28.21 |
| 湍流 | DM | Simplex+DM | None | 29.33 |
| 湍流 | DM | Simplex | DM | 28.35 |
| 湍流 | DM | Simplex+DM | DM | 28.91 |

**表 6：（灵活性）不同优化器与学习率的消融实验**，在 CelebA [62] 的 50 个超分辨率案例上进行。（来源：原文第 10 页。）

| 优化器 | 学习率 | LPIPS↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|
| ADAM | 0.1 | 0.375 | 20.22 | 0.479 |
| ADAM | 0.01 | **0.066** | 31.51 | 0.879 |
| ADAM | 0.001 | 0.093 | 31.45 | 0.879 |
| L-BFGS | 1.0 | 0.254 | 28.53 | 0.786 |
| L-BFGS | 0.1 | 0.173 | **31.89** | **0.888** |
| L-BFGS | 0.01 | 0.225 | 30.20 | 0.839 |

## 5 讨论与结论

本文聚焦用预训练扩散模型求解逆问题。为处理主流交错式方法（问题 1）流形可行性不足与（问题 2）测量可行性不足，我们开创了一种新的即插即用方法 DMPlug，并在计算与内存需求上使其实用。借助良性的 ELTO 性质并集成 ES 方法 ES-WMV [35]，我们的方法首次实现了对未知噪声的鲁棒性（问题 3）。大量实验结果表明，我们的方法在定性与定量上都能领先 SOTA 方法——往往优势显著，尤其在非线性逆问题上。关于局限：第 3.1 节的经验结果表明，用预训练扩散模型做图像生成与图像回归之间存在我们尚未阐明的根本差距；此外，我们的工作主要是经验性的，坚实的理论理解留待未来工作。

## 致谢

Wang H. 部分受 UMN CSE DSI 博士研究生奖学金资助；Wan Y. 部分受 UMN CSE InterS&Ections 种子基金资助。本研究是 AI-CLIMATE："AI Institute for Climate-Land Interactions, Mitigation, Adaptation, Tradeoffs and Economy" 的一部分，并受美国农业部国家食品与农业研究所（USDA NIFA）与美国国家科学基金会（NSF）国家人工智能研究所竞争性奖项（编号 2023-67021-39829）资助。作者感谢明尼苏达大学明尼苏达超级计算研究所（MSI）提供资源，为本论文所报告的研究成果作出贡献。
## 图注与表注

**图 1（原文第 2 页）：** 本文 DMPlug 方法（Ours）与主要对比方法在本文关注的逆问题上的样例结果可视化：超分辨率、修复与非线性去模糊对比 DPS [19] 与 Resample [20]（原文写作 Resample，正文他处作 ReSample [20]）；盲图像去模糊（BID）与带湍流 BID 对比 BlindDPS [21] 与 Stripformer [6]。所有测量均含 $\sigma=0.01$ 的高斯噪声。

**图 2（原文第 2 页）：** 在 CelebA 数据集的无噪非线性去模糊上，本文 DMPlug 与 SOTA 方法的数据拟合损失 $\|y-\mathcal A(x)\|_2^2$ 随进度百分比的变化。进度百分比按各方法所取总迭代数计算；阴影区域表示 50 个实例上损失的范围。

**图 3（原文第 3 页）：** 用预训练扩散模型求解逆问题的交错式方法（左）与本文 DMPlug 方法（右）对比。交错式方法无法保证最终估计对对象流形 $\mathcal M$ 或可行集 $\{x\,|\,y=\mathcal A(x)\}$ 的可行性，而 DMPlug 在保证流形可行性的同时通过全局优化促使 $y\approx\mathcal A(x)$。

**图 4（原文第 5 页）：** 主流交错式方法与本文即插即用方法的对比。图中并排给出算法 1（交错式方法模板）与算法 2（所提即插即用方法 DMPlug）的伪代码；DMPlug 把整个反向扩散过程视为函数 $\mathcal R$，并在外层对种子 $z_T$ 做梯度更新以优化式（7）。

**图 5（原文第 6 页）：** 在 NVIDIA A100 上，$\mathcal R$ 取不同反向步数时的 PSNR（dB）与每迭代实际耗时（秒）的关系。实验在 CelebA 上做 $4\times$ 超分辨率；求解器 ADAM；最大迭代 6,000 次。

**图 6（原文第 7 页）：** 我们的方法在图像回归中的恢复性能：(1) 对 (a) 干净自然图像、(b) 同一图像逐像素随机打乱、(c) 从 $\mathrm{Uniform}(0,1)$ 独立同分布采样的随机噪声做回归；(2) 对含高斯噪声（$\sigma=0.08$）的含噪自然图像做回归。此处图像回归指：给定任意图像 $x$，求解 $\min_z\ell(x,\mathcal R(z))$。

**图 7（原文第 9 页）：**（鲁棒性）本文 DMPlug 与主要对比方法在低强度高斯噪声下 $4\times$ 超分辨率（上）与非线性去模糊（下）的样例结果可视化。

**图 8（原文第 15 页）：** (1) DMPlug 使用 ADAM 求解器 [47] 的谱偏置；(2) DMPlug 使用 L-BFGS 求解器 [75] 的谱偏置。此处实验的逆问题是对含高斯噪声（$\sigma=0.08$）图像做回归，即与图 6(2) 相同的去噪问题；三幅子图对应五个径向频带上的频带误差（FBE）随迭代的演化。

**图 9（原文第 21 页）：**（线性逆问题）即插即用方法（Ours）与对比方法在 $4\times$ 超分辨率上的样例结果可视化。所有测量含 $\sigma=0.01$ 的高斯噪声。

**图 10（原文第 22 页）：**（线性逆问题）即插即用方法（Ours）与对比方法在修复（随机 70% 缺失）上的样例结果可视化。所有测量含 $\sigma=0.01$ 的高斯噪声。

**图 11（原文第 23 页）：**（非线性逆问题）即插即用方法（Ours）与对比方法在非线性去模糊上的样例结果可视化。所有测量含 $\sigma=0.01$ 的高斯噪声。

**图 12（原文第 24 页）：**（非线性逆问题）即插即用方法（Ours）与对比方法在 BID（运动模糊）上的样例结果可视化。所有测量含 $\sigma=0.01$ 的高斯噪声。

**图 13（原文第 25 页）：**（非线性逆问题）即插即用方法（Ours）与对比方法在 BID（高斯模糊）上的样例结果可视化。所有测量含 $\sigma=0.01$ 的高斯噪声。

**图 14（原文第 26 页）：**（非线性逆问题）即插即用方法（Ours）与对比方法在带湍流 BID 上的样例结果可视化。所有测量含 $\sigma=0.01$ 的高斯噪声。

**图 15（原文第 27 页）：**（鲁棒性）即插即用方法（Ours）与对比方法在 $4\times$ 超分辨率上的样例结果可视化。按 [43] 生成含高斯、脉冲、散粒与散斑四类噪声、两个噪声强度（低（level-1）与高（level-2））的测量；上排为低强度噪声，下排为高强度噪声。

**图 16（原文第 28 页）：**（鲁棒性）即插即用方法（Ours）与对比方法在非线性去模糊上的样例结果可视化。按 [43] 生成四类噪声、两个噪声强度的测量；上排为低强度噪声，下排为高强度噪声。

**图 17（原文第 29 页）：**（早停）本文 DMPlug 结合 ES-WMV [35] 在不同噪声类型与强度下做 $4\times$ 超分辨率的结果；上排为低强度噪声，下排为高强度噪声。红色曲线为 PSNR 曲线，蓝色曲线为 VAR 曲线，绿色竖条标出检测到的早停点。

**图 18（原文第 30 页）：**（早停）本文 DMPlug 结合 ES-WMV [35] 在不同噪声类型与强度下做非线性去模糊的结果；上排为低强度噪声，下排为高强度噪声。红色曲线为 PSNR 曲线，蓝色曲线为 VAR 曲线，绿色竖条标出检测到的早停点。

> **原文笔误：** 图 17 的图注在原文中把方法名印作 “DMPlgu”，按上下文应为 “DMPlug”；此处已按正确拼写翻译并在图注中说明，未改动图本身。

**表注汇总：** 表 1（非线性去模糊，第 8 页）、表 2（带湍流 BID，第 8 页）、表 3（BID，第 9 页）、表 4（鲁棒性与 ES，第 10 页）、表 5（先验灵活性，第 10 页）、表 6（优化器灵活性，第 10 页）均已在正文中逐格转录；表 7（耗时与内存，第 19 页）与表 8—10（线性逆问题的补充结果，第 20 页）位于附录 E，已在附录中逐格转录。所有表格的完整数值均由 PDF 渲染图逐格核对。

## 参考文献（英文原书目）

[1] J. Janai, F. Güney, A. Behl, and A. Geiger, “Computer Vision for Autonomous Vehicles: Problems, Datasets and State of the Art,” Mar. 2021, arXiv:1704.05519 [cs]. [Online]. Available: http://arxiv.org/abs/1704.05519
[2] R. Szeliski, Computer Vision: Algorithms and Applications, ser. Texts in Computer Science. Cham: Springer International Publishing, 2022. [Online]. Available: https://link.springer.com/10.1007/978-3-030-34372-9
[3] R. Olsen and R. Olsen, “Introduction to Remote Sensing,” Jan. 2007, book Title: Remote Sensing from Air and Space ISBN: 9780819462350 Publisher: SPIE. [Online]. Available: https://spiedigitallibrary.org/eBooks/PM/Remote-Sensing-from-Air-and-Space/Chapter1/Introduction-to-Remote-Sensing/10.1117/3.673407.ch1
[4] J. Sylvester and C. L. Epstein, “Introduction to the Mathematics of Medical Imaging,” in The American Mathematical Monthly, vol. 112, May 2005, p. 479, iSSN: 00029890 Issue: 5. [Online]. Available: https://www.jstor.org/stable/10.2307/30037514?origin=crossref
[5] O. Kupyn, T. Martyniuk, J. Wu, and Z. Wang, “DeblurGAN-v2: Deblurring (Orders-of-Magnitude) Faster and Better,” Aug. 2019, arXiv:1908.03826 [cs]. [Online]. Available: http://arxiv.org/abs/1908.03826
[6] F.-J. Tsai, Y.-T. Peng, Y.-Y. Lin, C.-C. Tsai, and C.-W. Lin, “Stripformer: Strip Transformer for Fast Image Deblurring,” Jul. 2022, arXiv:2204.04627 [cs]. [Online]. Available: http://arxiv.org/abs/2204.04627
[7] S. W. Zamir, A. Arora, S. Khan, M. Hayat, F. S. Khan, M.-H. Yang, and L. Shao, “Multi-Stage Progressive Image Restoration,” Mar. 2021, arXiv:2102.02808 [cs]. [Online]. Available: http://arxiv.org/abs/2102.02808
[8] M. Delbracio and P. Milanfar, “Inversion by direct iteration: An alternative to denoising diffusion for image restoration,” Transactions on Machine Learning Research, 2023, featured Certification. [Online]. Available: https://openreview.net/forum?id=VmyFF5lL3F
[9] D. Gilton, G. Ongie, and R. Willett, “Deep Equilibrium Architectures for Inverse Problems in Imaging,” Jun. 2021, arXiv:2102.07944 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2102.07944
[10] Z. Luo, F. K. Gustafsson, Z. Zhao, J. Sjölund, and T. B. Schön, “Image Restoration with Mean-Reverting Stochastic Differential Equations,” May 2023, arXiv:2301.11699 [cs]. [Online]. Available: http://arxiv.org/abs/2301.11699
[11] L. Guo, C. Wang, W. Yang, S. Huang, Y. Wang, H. Pfister, and B. Wen, “ShadowDiffusion: When Degradation Prior Meets Diffusion Model for Shadow Removal,” Dec. 2022, arXiv:2212.04711 [cs]. [Online]. Available: http://arxiv.org/abs/2212.04711
[12] J. Whang, M. Delbracio, H. Talebi, C. Saharia, A. G. Dimakis, and P. Milanfar, “Deblurring via Stochastic Refinement,” Dec. 2021, arXiv:2112.02475 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2112.02475
[13] S. Gao, X. Liu, B. Zeng, S. Xu, Y. Li, X. Luo, J. Liu, X. Zhen, and B. Zhang, “Implicit Diffusion Models for Continuous Super-Resolution,” Sep. 2023, arXiv:2303.16491 [cs]. [Online]. Available: http://arxiv.org/abs/2303.16491
[14] O. Kupyn, V. Budzan, M. Mykhailych, D. Mishkin, and J. Matas, “DeblurGAN: Blind Motion Deblurring Using Conditional Adversarial Networks,” Apr. 2018, arXiv:1711.07064 [cs]. [Online]. Available: http://arxiv.org/abs/1711.07064
[15] G. Ongie, A. Jalal, C. A. Metzler, R. G. Baraniuk, A. G. Dimakis, and R. Willett, “Deep Learning Techniques for Inverse Problems in Imaging,” May 2020, arXiv:2005.06001 [cs, eess, stat]. [Online]. Available: http://arxiv.org/abs/2005.06001
[16] V. Monga, Y. Li, and Y. C. Eldar, “Algorithm Unrolling: Interpretable, Efficient Deep Learning for Signal and Image Processing,” Aug. 2020, arXiv:1912.10557 [cs, eess]. [Online]. Available: http://arxiv.org/abs/1912.10557
[17] K. Zhang, W. Ren, W. Luo, W.-S. Lai, B. Stenger, M.-H. Yang, and H. Li, “Deep Image Deblurring: A Survey,” May 2022, arXiv:2201.10700 [cs]. [Online]. Available: http://arxiv.org/abs/2201.10700
[18] J. Koh, J. Lee, and S. Yoon, “Single-image deblurring with neural networks: A comparative survey,” Computer Vision and Image Understanding, vol. 203, p. 103134, Feb. 2021. [Online]. Available: https://linkinghub.elsevier.com/retrieve/pii/S1077314220301533
[19] H. Chung, J. Kim, M. T. Mccann, M. L. Klasky, and J. C. Ye, “Diffusion Posterior Sampling for General Noisy Inverse Problems,” Feb. 2023, arXiv:2209.14687 [cs, stat]. [Online]. Available: http://arxiv.org/abs/2209.14687
[20] B. Song, S. M. Kwon, Z. Zhang, X. Hu, Q. Qu, and L. Shen, “Solving Inverse Problems with Latent Diffusion Models via Hard Data Consistency,” Oct. 2023, arXiv:2307.08123 [cs]. [Online]. Available: http://arxiv.org/abs/2307.08123
[21] H. Chung, J. Kim, S. Kim, and J. C. Ye, “Parallel Diffusion Models of Operator and Image for Blind Inverse Problems,” Nov. 2022, arXiv:2211.10656 [cs, stat]. [Online]. Available: http://arxiv.org/abs/2211.10656
[22] P. Dhariwal and A. Nichol, “Diffusion Models Beat GANs on Image Synthesis,” Jun. 2021, arXiv:2105.05233 [cs, stat]. [Online]. Available: http://arxiv.org/abs/2105.05233
[23] J. Ho, A. Jain, and P. Abbeel, “Denoising Diffusion Probabilistic Models,” Dec. 2020, arXiv:2006.11239 [cs, stat]. [Online]. Available: http://arxiv.org/abs/2006.11239
[24] J. Song, C. Meng, and S. Ermon, “Denoising Diffusion Implicit Models,” Oct. 2022, arXiv:2010.02502 [cs]. [Online]. Available: http://arxiv.org/abs/2010.02502
[25] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer, “High-Resolution Image Synthesis with Latent Diffusion Models,” Apr. 2022, arXiv:2112.10752 [cs]. [Online]. Available: http://arxiv.org/abs/2112.10752
[26] Y. He, N. Murata, C.-H. Lai, Y. Takida, T. Uesaka, D. Kim, W.-H. Liao, Y. Mitsufuji, J. Z. Kolter, R. Salakhutdinov, and S. Ermon, “Manifold Preserving Guided Diffusion,” Oct. 2023. [Online]. Available: https://openreview.net/forum?id=o3BxOLoxm1
[27] X. Xu and Y. Chi, “Provably Robust Score-Based Diffusion Posterior Sampling for Plug-and-Play Image Reconstruction.” [Online]. Available: https://www.semanticscholar.org/paper/Provably-Robust-Score-Based-Diffusion-Posterior-for-Xu-Chi/a713ae4d638ef679a7165fbf7301a6c045e2588d
[28] Y. Zhu, K. Zhang, J. Liang, J. Cao, B. Wen, R. Timofte, and L. Van Gool, “Denoising Diffusion Models for Plug-and-Play Image Restoration,” May 2023, arXiv:2305.08995 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2305.08995
[29] X. Meng and Y. Kabashima, “Diffusion Model Based Posterior Sampling for Noisy Linear Inverse Problems,” Jan. 2024, arXiv:2211.12343 [cs, math, stat]. [Online]. Available: http://arxiv.org/abs/2211.12343
[30] H. Chung, B. Sim, D. Ryu, and J. C. Ye, “Improving Diffusion Models for Inverse Problems using Manifold Constraints,” Oct. 2022, arXiv:2206.00941 [cs, stat]. [Online]. Available: http://arxiv.org/abs/2206.00941
[31] X. Li, Y. Ren, X. Jin, C. Lan, X. Wang, W. Zeng, X. Wang, and Z. Chen, “Diffusion Models for Image Restoration and Enhancement – A Comprehensive Survey,” Aug. 2023, arXiv:2308.09388 [cs]. [Online]. Available: http://arxiv.org/abs/2308.09388
[32] B. Kawar, M. Elad, S. Ermon, and J. Song, “Denoising Diffusion Restoration Models,” Oct. 2022, arXiv:2201.11793 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2201.11793
[33] Y. Wang, J. Yu, and J. Zhang, “Zero-Shot Image Restoration Using Denoising Diffusion Null-Space Model,” Dec. 2022, arXiv:2212.00490 [cs]. [Online]. Available: http://arxiv.org/abs/2212.00490
[34] G. Liu, H. Sun, J. Li, F. Yin, and Y. Yang, “Accelerating Diffusion Models for Inverse Problems through Shortcut Sampling,” May 2024, arXiv:2305.16965 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2305.16965
[35] H. Wang, T. Li, Z. Zhuang, T. Chen, H. Liang, and J. Sun, “Early Stopping for Deep Image Prior,” Dec. 2023, arXiv:2112.06074 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2112.06074
[36] A. Hyvärinen, “Estimation of Non-Normalized Statistical Models by Score Matching,” Journal of Machine Learning Research, vol. 6, no. 24, pp. 695–709, 2005. [Online]. Available: http://jmlr.org/papers/v6/hyvarinen05a.html
[37] Y. Song and S. Ermon, “Generative Modeling by Estimating Gradients of the Data Distribution,” Oct. 2020, arXiv:1907.05600 [cs, stat]. [Online]. Available: http://arxiv.org/abs/1907.05600
[38] J. Song, C. Meng, and A. Vahdat, “Denoising diffusion models: A generative learning big bang,” Nov. 2023, CVPR 2023 Tutorial. [Online]. Available: https://cvpr2023-tutorial-diffusion-models.github.io/
[39] Z. Kadkhodaie and E. Simoncelli, “Stochastic Solutions for Linear Inverse Problems using the Prior Implicit in a Denoiser,” in Advances in Neural Information Processing Systems, vol. 34. Curran Associates, Inc., 2021, pp. 13 242–13 254. [Online]. Available: https://proceedings.neurips.cc/paper/2021/hash/6e28943943dbed3c7f82fc05f269947a-Abstract.html
[40] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, “Score-Based Generative Modeling through Stochastic Differential Equations,” Feb. 2021, arXiv:2011.13456 [cs, stat]. [Online]. Available: http://arxiv.org/abs/2011.13456
[41] J. Choi, S. Kim, Y. Jeong, Y. Gwon, and S. Yoon, “ILVR: Conditioning Method for Denoising Diffusion Probabilistic Models,” Sep. 2021, arXiv:2108.02938 [cs]. [Online]. Available: http://arxiv.org/abs/2108.02938
[42] Y. Sanghvi, Y. Chi, and S. H. Chan, “Kernel diffusion: An alternate approach to blind deconvolution,” arXiv preprint arXiv:2312.02319, 2023.
[43] D. Hendrycks and T. Dietterich, “Benchmarking Neural Network Robustness to Common Corruptions and Perturbations,” Mar. 2019, arXiv:1903.12261 [cs, stat]. [Online]. Available: http://arxiv.org/abs/1903.12261
[44] F. Li, F. Fang, Z. Li, and T. Zeng, “Single image noise level estimation by artificial noise,” Signal Processing, vol. 213, p. 109215, Dec. 2023. [Online]. Available: https://www.sciencedirect.com/science/article/pii/S016516842300289X
[45] C. Lu, Y. Zhou, F. Bao, J. Chen, C. Li, and J. Zhu, “DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps,” Advances in Neural Information Processing Systems, vol. 35, pp. 5775–5787, Dec. 2022. [Online]. Available: https://proceedings.neurips.cc/paper_files/paper/2022/hash/260a14acce2a89dad36adc8eefe7c59e-Abstract-Conference.html
[46] K. Zheng, C. Lu, J. Chen, and J. Zhu, “DPM-Solver-v3: Improved Diffusion ODE Solver with Empirical Model Statistics,” Advances in Neural Information Processing Systems, vol. 36, pp. 55 502–55 542, Dec. 2023. [Online]. Available: https://proceedings.neurips.cc/paper_files/paper/2023/hash/ada8de994b46571bdcd7eeff2d3f9cff-Abstract-Conference.html
[47] D. P. Kingma and J. Ba, “Adam: A Method for Stochastic Optimization,” Jan. 2017, arXiv:1412.6980 [cs]. [Online]. Available: http://arxiv.org/abs/1412.6980
[48] A. Creswell and A. A. Bharath, “Inverting The Generator Of A Generative Adversarial Network,” Nov. 2016, arXiv:1611.05644 [cs]. [Online]. Available: http://arxiv.org/abs/1611.05644
[49] J.-Y. Zhu, P. Krähenbühl, E. Shechtman, and A. A. Efros, “Generative Visual Manipulation on the Natural Image Manifold,” Dec. 2018, arXiv:1609.03552 [cs]. [Online]. Available: http://arxiv.org/abs/1609.03552
[50] X. Pan, X. Zhan, B. Dai, D. Lin, C. C. Loy, and P. Luo, “Exploiting Deep Generative Prior for Versatile Image Restoration and Manipulation,” Jul. 2020, arXiv:2003.13659 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2003.13659
[51] X. Su, J. Song, C. Meng, and S. Ermon, “Dual Diffusion Implicit Bridges for Image-to-Image Translation,” Mar. 2023, arXiv:2203.08382 [cs]. [Online]. Available: http://arxiv.org/abs/2203.08382
[52] A. Hertz, R. Mokady, J. Tenenbaum, K. Aberman, Y. Pritch, and D. Cohen-Or, “Prompt-to-Prompt Image Editing with Cross Attention Control,” Aug. 2022, arXiv:2208.01626 [cs]. [Online]. Available: http://arxiv.org/abs/2208.01626
[53] G. Kim, T. Kwon, and J. C. Ye, “DiffusionCLIP: Text-Guided Diffusion Models for Robust Image Manipulation,” Aug. 2022, arXiv:2110.02711 [cs]. [Online]. Available: http://arxiv.org/abs/2110.02711
[54] R. Mokady, A. Hertz, K. Aberman, Y. Pritch, and D. Cohen-Or, “Null-text Inversion for Editing Real Images using Guided Diffusion Models,” Nov. 2022, arXiv:2211.09794 [cs]. [Online]. Available: http://arxiv.org/abs/2211.09794
[55] B. Wallace, A. Gokul, and N. Naik, “EDICT: Exact Diffusion Inversion via Coupled Transformations,” pp. 22 532–22 541, 2023. [Online]. Available: https://openaccess.thecvf.com/content/CVPR2023/html/Wallace_EDICT_Exact_Diffusion_Inversion_via_Coupled_Transformations_CVPR_2023_paper.html
[56] K. Gregor and Y. LeCun, “Learning fast approximations of sparse coding,” in Proceedings of the 27th International Conference on International Conference on Machine Learning, ser. ICML’10. Madison, WI, USA: Omnipress, Jun. 2010, pp. 399–406.
[57] D. Ulyanov, A. Vedaldi, and V. Lempitsky, “Deep Image Prior,” International Journal of Computer Vision, vol. 128, no. 7, pp. 1867–1888, Jul. 2020, arXiv:1711.10925 [cs, stat]. [Online]. Available: http://arxiv.org/abs/1711.10925
[58] T. Li, Z. Zhuang, H. Liang, L. Peng, H. Wang, and J. Sun, “Self-Validation: Early Stopping for Single-Instance Deep Generative Priors,” Oct. 2021, arXiv:2110.12271 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2110.12271
[59] T. Li, H. Wang, Z. Zhuang, and J. Sun, “Deep Random Projector: Accelerated Deep Image Prior,” pp. 18 176–18 185, 2023. [Online]. Available: https://openaccess.thecvf.com/content/CVPR2023/html/Li_Deep_Random_Projector_Accelerated_Deep_Image_Prior_CVPR_2023_paper.html
[60] Z. Shi, P. Mettes, S. Maji, and C. G. M. Snoek, “On Measuring and Controlling the Spectral Bias of the Deep Image Prior,” Dec. 2021, arXiv:2107.01125 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2107.01125
[61] Z. Zhuang, T. Li, H. Wang, and J. Sun, “Blind Image Deblurring with Unknown Kernel Size and Substantial Noise,” International Journal of Computer Vision, vol. 132, no. 2, pp. 319–348, Feb. 2024, arXiv:2208.09483 [cs, eess]. [Online]. Available: http://arxiv.org/abs/2208.09483
[62] Z. Liu, P. Luo, X. Wang, and X. Tang, “Deep Learning Face Attributes in the Wild,” Sep. 2015, arXiv:1411.7766 [cs]. [Online]. Available: http://arxiv.org/abs/1411.7766
[63] T. Karras, S. Laine, and T. Aila, “A Style-Based Generator Architecture for Generative Adversarial Networks,” Mar. 2019, arXiv:1812.04948 [cs, stat]. [Online]. Available: http://arxiv.org/abs/1812.04948
[64] F. Yu, A. Seff, Y. Zhang, S. Song, T. Funkhouser, and J. Xiao, “LSUN: Construction of a Large-scale Image Dataset using Deep Learning with Humans in the Loop,” Jun. 2016, arXiv:1506.03365 [cs]. [Online]. Available: http://arxiv.org/abs/1506.03365
[65] R. Zhang, P. Isola, A. A. Efros, E. Shechtman, and O. Wang, “The Unreasonable Effectiveness of Deep Features as a Perceptual Metric,” Apr. 2018, arXiv:1801.03924 [cs]. [Online]. Available: http://arxiv.org/abs/1801.03924
[66] P. Tran, A. T. Tran, Q. Phung, and M. Hoai, “Explore Image Deblurring via Encoded Blur Kernel Space,” pp. 11 956–11 965, 2021. [Online]. Available: https://openaccess.thecvf.com/content/CVPR2021/html/Tran_Explore_Image_Deblurring_via_Encoded_Blur_Kernel_Space_CVPR_2021_paper.html
[67] D. Jin, Y. Chen, Y. Lu, J. Chen, P. Wang, Z. Liu, S. Guo, and X. Bai, “Neutralizing the impact of atmospheric turbulence on complex scene imaging via deep learning,” Nat. Mach. Intell., vol. 3, no. 10, pp. 876–884, 2021. [Online]. Available: https://doi.org/10.1038/s42256-021-00392-1
[68] D. Krishnan and R. Fergus, “Fast Image Deconvolution using Hyper-Laplacian Priors,” in Advances in Neural Information Processing Systems, vol. 22. Curran Associates, Inc., 2009. [Online]. Available: https://papers.nips.cc/paper_files/paper/2009/hash/3dd48ab31d016ffcbf3314df2b3cb9ce-Abstract.html
[69] S. H. Chan, “Tilt-then-Blur or Blur-then-Tilt? Clarifying the Atmospheric Turbulence Model,” IEEE Signal Processing Letters, vol. 29, pp. 1833–1837, 2022, arXiv:2207.06377 [eess]. [Online]. Available: http://arxiv.org/abs/2207.06377
[70] J. Pan, D. Sun, H. Pfister, and M.-H. Yang, “Deblurring Images via Dark Channel Prior,” IEEE Transactions on Pattern Analysis and Machine Intelligence, vol. 40, no. 10, pp. 2315–2328, Oct. 2018, conference Name: IEEE Transactions on Pattern Analysis and Machine Intelligence. [Online]. Available: https://ieeexplore.ieee.org/document/8048543
[71] J. Pan, Z. Hu, Z. Su, and M.-H. Yang, “L_0-Regularized Intensity and Gradient Prior for Deblurring Text Images and Beyond,” IEEE Transactions on Pattern Analysis and Machine Intelligence, vol. 39, no. 2, pp. 342–355, Feb. 2017, conference Name: IEEE Transactions on Pattern Analysis and Machine Intelligence. [Online]. Available: https://ieeexplore.ieee.org/abstract/document/7448477
[72] D. Ren, K. Zhang, Q. Wang, Q. Hu, and W. Zuo, “Neural Blind Deconvolution Using Deep Priors,” Mar. 2020, arXiv:1908.02197 [cs]. [Online]. Available: http://arxiv.org/abs/1908.02197
[73] S. H. Chan, X. Wang, and O. A. Elgendy, “Plug-and-Play ADMM for Image Restoration: Fixed Point Convergence and Applications,” Nov. 2016, arXiv:1605.01710 [cs]. [Online]. Available: http://arxiv.org/abs/1605.01710
[74] A. Vahdat, K. Kreis, and J. Kautz, “Score-based generative modeling in latent space,” Advances in Neural Information Processing Systems, vol. 34, pp. 11 287–11 302, 2021.
[75] D. C. Liu and J. Nocedal, “On the limited memory BFGS method for large scale optimization,” Mathematical Programming, vol. 45, no. 1, pp. 503–528, Aug. 1989. [Online]. Available: https://doi.org/10.1007/BF01589116
[76] H. Chihaoui, A. Lemkhenter, and P. Favaro, “Zero-shot Image Restoration via Diffusion Inversion,” Oct. 2023. [Online]. Available: https://openreview.net/forum?id=ZnmofqLWMQ
[77] M. Heusel, H. Ramsauer, T. Unterthiner, B. Nessler, and S. Hochreiter, “Gans trained by a two time-scale update rule converge to a local nash equilibrium,” Advances in neural information processing systems, vol. 30, 2017.
[78] P. Chakrabarty and S. Maji, “The Spectral Bias of the Deep Image Prior,” Dec. 2019, arXiv:1912.08905 [cs]. [Online]. Available: http://arxiv.org/abs/1912.08905
[79] D. L. Ruderman, “The statistics of natural images,” Network: Computation in Neural Systems, vol. 5, no. 4, pp. 517–548, Jan. 1994. [Online]. Available: https://www.tandfonline.com/doi/full/10.1088/0954-898X_5_4_006
[80] Z. Dou and Y. Song, “Diffusion Posterior Sampling for Linear Inverse Problem Solving: A Filtering Perspective,” Oct. 2023. [Online]. Available: https://openreview.net/forum?id=tplXNcHZs1
[81] L. Rout, N. Raoof, G. Daras, C. Caramanis, A. G. Dimakis, and S. Shakkottai, “Solving Linear Inverse Problems Provably via Posterior Sampling with Latent Diffusion Models,” Jul. 2023. [Online]. Available: https://arxiv.org/abs/2307.00619v1

## 附录

### A. 关于同期工作 [76] 的说明

我们在 2024 年 1 月中旬确定方法细节时（本项目于 2023 年 10 月启动）注意到一项未发表的同期工作 SHRED [76]。尽管 SHRED 的核心思想与本文 DMPlug 相同，但 [76] 与本文存在若干关键差异。(1) **动机：** [76] 仅旨在处理流形可行性，而本文同时针对流形可行性、测量可行性与对未知噪声的鲁棒性；(2) **组成部分：** 由于实现对未知噪声的鲁棒性是本文目标的一部分，除与 [76] 共有的统一优化形式式（7）之外，ES-WMV 早停策略是本文方法不可或缺的组成部分；(3) **关键超参数：** 为缓解反向步带来的计算与内存瓶颈，本文对所测试的所有逆问题只使用 3 个反向步，而 [76] 使用 10 个或更多反向步；因此本文设置使方法实用得多；(4) **灵活性：** 如第 4.3 节所示，本文框架在可用时允许使用不止一个预训练扩散模型先验，而 [76] 仅按其次（17）—（19）式使用单一扩散模型先验；(5) **实验评估：** [76] 聚焦线性逆问题，包括修复、超分辨率、压缩感知与一个非线性逆问题（盲反卷积，即盲图像去模糊（BID））；本文除线性逆问题（修复与超分辨率）外，评估重点为非线性逆问题，包括非线性去模糊、BID 与带湍流 BID。此外，[76] 仅用感知指标 LPIPS [65] 与 FID [77] 衡量性能，而本文同时用感知指标 LPIPS 与经典指标 PSNR、SSIM 衡量性能。另外，[76] 甚至没有将其方法与使用预训练扩散模型的明确 SOTA 方法（如 DPS [19]，他们显然知道该方法且已在文中引用）比较，而本文的比较更全面。

### B. 本文 DMPlug 的谱偏置

人们可能好奇 ELTO 现象为何发生。这里我们借用 DIP 文献 [78,60,59,61] 中谱偏置与谱分析的思想给出一些解释。DIP 的谱偏置理论指出：在 DIP 学习过程中，低频分量的学习速度远快于高频分量。DIP 中的谱偏置导致 DIP 中的 ELTO 现象：由于自然图像通常以低频为主 [79]，不同的学习速度意味着 DIP 在早期主要学到理想的图像内容（低频图像内容加上噪声的低频部分），而在后期逐渐拾取噪声的高频部分，从而在某个质量峰值之后性能退化。谱分析为谱偏置提供了定量可视化。

这里我们对 DMPlug 的学习过程做类似的谱分析，以展示导致 ELTO 现象的谱偏置。为衡量谱偏置，我们按 [59,61] 使用频带误差（frequency band errors，FBEs）。对真值图像 $x$ 及其估计 $\hat x$，该指标计算如下：首先在 Fourier 域逐点计算逐点相对误差，即 $|\mathcal F(x)-\mathcal F(\hat x)|/|\mathcal F(x)|$；然后把 Fourier 频率划分为五个径向频带，计算各频带的平均误差，即频带误差（FBEs）。我们在图 8 中可视化 DMPlug 在全部五个频带上的 FBE 演化。各频带学习速度的显著差异清晰可见：最低频带的学习速度远快于其他频带，且这一现象在两种不同优化求解器下一致。由于谱偏置与 DIP 中类似，我们可以按上文对 DIP 的论证解释 DMPlug 中的 ELTO 现象。

### C. 所测逆问题的设置细节

对超分辨率、修复与非线性去模糊，我们使用两个主要对比方法 [19,20] 的前向模型；对 BID 与带湍流 BID，我们沿用 SOTA 扩散模型方法 BlindDPS [21] 的前向模型。此外，遵循 [19,20]，所有测量都含 $\sigma=0.01$ 的加性高斯噪声。我们的损失 $\ell$ 默认为 MSE 损失。

#### C.1 超分辨率

在含噪图像超分辨率中，目标是从含噪降采样版本 $y=D(x)+n$ 重建干净 RGB 图像 $x$，其中 $D(\cdot):[0,1]^{3\times tH\times tW}\to[0,1]^{3\times H\times W}$ 是把 $tH\times tW$ 维图像按因子 $t$ 缩放的降采样算子，$n$ 建模加性噪声。第 4 节取 $t=4$。为保证公平比较，我们在形式中不包含任何显式正则项：

$$
\text{（超分辨率）}\quad
z^\star=\arg\min_z\ \ell\left(y,D(\mathcal R(z))\right),
\qquad
x^\star=\mathcal R(z^\star).\tag{8}
$$

#### C.2 修复

在含噪图像修复中，干净 RGB 图像 $x\in[0,1]^{3\times H\times W}$ 仅被部分观测，随后被加性噪声 $n$ 污染，前向模型为 $y=m\odot x+n$，其中 $m\in\{0,1\}^{3\times H\times W}$ 为二值掩码，$\odot$ 表示 Hadamard 积。给定 $y$ 与 $m$，目标是重建 $x$。遵循 [20]，$m$ 三个通道的掩码相同，且 70% 的掩码值被随机置为 0。为保证公平比较，我们在形式中不包含任何显式正则项：

$$
\text{（修复）}\quad
z^\star=\arg\min_z\ \ell\left(y,m\odot\mathcal R(z)\right),
\qquad
x^\star=\mathcal R(z^\star).\tag{9}
$$

#### C.3 非线性去模糊

我们沿用 [19] 的设置，其受 [66] 启发。近期，[66] 提出从形如 $\{(y_i,x_i)\}_{i=1,\dots,N}$ 的成对模糊—清晰训练集中学习数据驱动的模糊模型：

$$
\alpha^\star,\beta^\star=\arg\min_{\alpha,\beta}\sum_{i=1}^{N}\left\|y_i-\mathcal F_\alpha\left(x_i,G_\beta(x_i,y_i)\right)\right\|,\tag{10}
$$

其中 $G_\beta(\cdot,\cdot)$ 预测与输入模糊—清晰图像对相关联的潜在模糊核，$\psi_\beta(\cdot,\cdot)$ 则在给定输入图像—核对时建模真实世界的非线性模糊过程（注：原文此处以 $\psi_\beta$ 指代式（10）中的 $\mathcal F_\alpha$，记法略有出入，按原文照录）。为研究其 DPS 方法在非线性逆问题上的性能，[19] 提出以下带已知高斯型核的非线性去模糊问题：

$$
y=\mathcal F_{\alpha^\star}(x,g)+n,
\quad\text{其中}\ g\in\mathbb R^{64\times64}\ \text{为高斯型，}\ \sigma=3.0.\tag{11}
$$

这里的任务是从 $y$ 与已知前向模型 $\mathcal F_{\alpha^\star}(\cdot,g)$ 恢复 $x$。我们的形式遵循 [19]，不包含额外正则项：

$$
\text{（非线性去模糊）}\quad
z^\star=\arg\min_z\ \ell\left(y,\mathcal F_{\alpha^\star}(\mathcal R(z),g)\right),
\qquad
x^\star=\mathcal R(z^\star).\tag{12}
$$

#### C.4 盲图像去模糊（BID）

BID 是从 $y=k*x+n$ 恢复清晰图像 $x$，其中 $*$ 表示线性卷积、空间不变的模糊核 $k$ 同样未知。它是一个非线性逆问题，因为前向模型 $\mathcal A(k,x)=k*x$ 是非线性的。在正则化数据拟合框架式（1）下求解 BID 时，通常使用 $\ell_2$ 或 $\ell_1$ 数据拟合损失，以及由 $R_x(x)=\|\nabla x\|_1$ 或 $R_x(x)=\|\nabla x\|_1/\|\nabla x\|_2$ 施加于 $x$ 的稀疏梯度先验。此外，由于前向模型存在尺度模糊，即对任意 $\alpha>0$ 有 $k*x=(\alpha k)*(x/\alpha)$，通常通过要求 $k$ 位于标准单纯形（即 $k\ge0,\ \mathbf 1^\top k=1$）或球面（即 $\|k\|_2=1$）上来固定 $k$ 的尺度。[18,17,61] 对这些先验与正则项作了详细论述。本文实验中，我们遵循 BlindDPS [19] 的设置：所有模糊核按 $64\times64$ 大小模拟；高斯核标准差设为 3.0，运动模糊核强度调整为 0.5。需要强调的是，BlindDPS [21] 不仅对图像、也对模糊核使用预训练扩散模型，这使其相对其他方法具有不公平优势。但为保证与仅使用数据驱动图像先验的其他对比方法公平比较，我们只对图像使用预训练扩散模型，并加上 BlindDPS 同样使用的典型单纯形约束：

$$
\text{（BID）}\quad
z^\star,k^\star=\arg\min_{z,k}\ \ell\left(y,\mathrm{SoftMax}(k)*\mathcal R(z)\right),
\qquad
x^\star=\mathcal R(z^\star),\tag{13}
$$

其中 $\mathrm{SoftMax}(k)$ 使核估计落在标准单纯形上。

#### C.5 带湍流的 BID

带湍流的 BID 常出现在穿过大气湍流的长距离成像中。遵循 [69]，前向成像过程可建模为简化的"先倾斜后模糊"过程：$y=k*\mathcal T_\phi(x)+n$，其中倾斜算子 $\mathcal T_\phi(\cdot)$ 把空间变化向量场 $\phi$ 作用于图像 $x$，使 $x$ 的像素按向量场 $\phi$ 移动，即 $\mathcal T_\phi(x)[p_i+\phi_i]=x[p_i]$，其中 $p_i$ 为像素坐标。在带湍流 BID 中，$k$、$x$、$\phi$ 均未知，任务是从测量 $y$ 联合估计它们。因此，这种 BID 变体显然严格难于 BID 本身。我们遵循 BlindDPS [21] 的数据生成方式：模糊核来自点扩散函数（PSF），取标准差 3.0 的高斯形状；倾斜图在像素网格上按独立同分布高斯随机向量生成。与 BID 情形类似，BlindDPS [21] 对全部三个对象（图像、核与倾斜图）都使用预训练扩散模型，这对其他方法不公平；我们再次只对图像使用预训练扩散模型。对核，我们仍只通过 SoftMax 激活施加单纯形约束。对倾斜图，受"倾斜向量为小幅值随机向量"这一事实启发，我们从均值为零、标准差很小的高斯分布初始化该图，并设置极小的学习率。本任务的最终形式为

$$
\text{（带湍流 BID）}\quad
z^\star,k^\star,\phi^\star=\arg\min_{z,k,\phi}\ \ell\left(y,\mathrm{SoftMax}(k)*\mathcal T_\phi(\mathcal R(z))\right),
\qquad
x^\star=\mathcal R(z^\star).\tag{14}
$$

### D. 更多实现细节

#### D.1 噪声生成

遵循 [43]，我们模拟四类噪声，每类取两个强度级别，具体如下。**高斯噪声：** 零均值加性高斯噪声，低、高强度分别取方差 0.08 与 0.12。**脉冲噪声：** 又称椒盐噪声，以概率 $p\in[0,1]$ 把每个像素替换为白色或黑色像素（各占一半机会）；低、高强度分别对应 $p=0.03$ 与 $0.06$。**散粒噪声：** 又称泊松噪声；对每个像素 $x\in[0,1]$，含噪像素服从速率为 $\lambda x$ 的泊松分布，低、高强度分别取 $\lambda=60$ 与 $25$。**散斑噪声：** 对每个像素 $x\in[0,1]$，含噪像素为 $x(1+\epsilon)$，其中 $\epsilon$ 为零均值高斯，低、高强度的方差分别为 0.15 与 0.20。

#### D.2 本文方法的额外实现细节

我们在所有逆问题任务中对本文方法采用以下设置。对 $\mathcal R(\cdot)$，我们取 [22] 与 [41] 的标准预训练扩散模型，并基于图 5 使用仅 3 个反向步的标准 DDIM [24] 采样器；表 5 中报告的结果另使用预训练潜扩散模型（LDMs）[25] 得到，表 5 中关于模糊核与倾斜图的结果使用 [21] 的预训练扩散模型得到。对 $\ell(\cdot)$，我们选择标准 MSE 损失。对 $\Omega(\cdot)$，我们使用各任务典型的显式正则项以保证比较公平。默认优化器为 ADAM，种子 $z$ 的学习率（LR）为 $1\times10^{-2}$；对 BID（含带湍流情形），模糊核与倾斜图的学习率分别为 $1\times10^{-1}$ 与 $1\times10^{-7}$。最大迭代次数方面，线性与非线性逆问题分别设为 5,000 与 10,000 次，经验上可使收敛良好。所有实验均在显存 40GB 的 NVIDIA A100 GPU 上完成。

**算法 3：用于求解一般逆问题的 DMPlug+ES-WMV**

- **输入：** 扩散步数 $T$、测量 $y$、窗口大小 $W$、耐心参数 $P$、空队列 $\mathcal Q$、迭代计数 $e=0$、$\mathrm{VAR}_{\min}=\infty$
1. **while** 未停止 **do**
2. 　**for** $i=T-1$ **到** $0$ **do**
3. 　　$\hat s\leftarrow\boldsymbol\epsilon^{(i)}_{\boldsymbol\theta}(z^e_i)$
4. 　　$\hat z^e_0\leftarrow\frac{1}{\sqrt{\bar\alpha_i}}\left(z^e_i-\sqrt{1-\bar\alpha_i}\,\hat s\right)$
5. 　　$z^e_{i-1}\leftarrow$ 用 $\hat z^e_0$、$\hat s$ 的 DDIM 反向步
6. 　**end for**
7. 　由 $z^e_T$ 通过针对式（7）的梯度更新得到 $z^{e+1}_T$
8. 　把 $\mathcal R\left(z^{e+1}_T\right)$ 推入 $\mathcal Q$；若 $|\mathcal Q|>W$ 则弹出队首
9. 　**if** $|\mathcal Q|=W$ **then**
10. 　　按式（15）计算 $\mathcal Q$ 中元素的 VAR
11. 　　**if** $\mathrm{VAR}<\mathrm{VAR}_{\min}$ **then**
12. 　　　$\mathrm{VAR}_{\min}\leftarrow\mathrm{VAR}$，$z^\star\leftarrow z^{e+1}_T$
13. 　　**end if**
14. 　　**if** $\mathrm{VAR}_{\min}$ 连续 $P$ 次迭代停滞 **then**
15. 　　　停止并返回 $z^\star$
16. 　　**end if**
17. 　**end if**
18. 　$e=e+1$
19. **end while**
- **输出：** 恢复的对象 $\mathcal R(z^\star)$

**使用 ES-WMV 的早停（ES）。** "先学习、后过拟合"（ELTO）现象已在深度图像先验（DIP）文献中被广泛报道 [57–60,35]，而 ES-WMV [35] 是一种对应用于各类逆问题的 DIP 达到 SOTA 早停性能的 ES 策略。在 ES-WMV 中，运行方差（VAR）定义为：

$$
\mathrm{VAR}(t)\triangleq\frac{1}{W}\sum_{w=0}^{W-1}\left\|x^{t+w}-\frac{1}{W}\cdot\sum_{i=0}^{W-1}x^{t+i}\right\|_F^2,\tag{15}
$$

其中 $W$ 为窗口大小，$x^i$ 表示第 $i$ 次迭代的恢复结果。[35] 观察到：VAR 曲线的第一个主要谷值常与 PSNR 曲线的峰值高度对齐。基于此，[35] 引入一种在线算法来检测 VAR 曲线的第一个主要谷值：若最小 VAR 在连续 $P$ 步内不再变化，即 VAR 在连续 $P$ 步内不再进一步下降，则停止迭代过程。组合算法——集成 ES-WMV 的 DMPlug——见算法 3。实现上，我们使用 ES-WMV 的官方代码。对噪声未知的超分辨率，耐心参数设为 100、窗口大小设为 10；对噪声未知的非线性去模糊，耐心参数设为 300、窗口大小设为 50。表 4 表明两个示例任务中的检测间隙几乎可忽略，PSNR 间隙分别小于 0.5 dB 与 0.2 dB。这说明本文 DMPlug 与 ES-WMV 高度协同。

#### D.3 对比方法的实现

我们使用各对比方法官方实现的默认代码与设置，列表如下。

- ADMM-PnP [73]：https://github.com/kanglin755/plug_and_play_admm
- DMPS [29]：https://github.com/mengxiangming/dmps
- DDRM [32]：https://github.com/bahjat-kawar/ddrm
- DPS [19] & MCG [30]：https://github.com/DPS2022/diffusion-posterior-sampling
- ILVR [41]：https://github.com/jychoi118/ilvr_adm
- ReSample [20]：https://github.com/soominkwon/resample/tree/main
- BKS [66]：https://github.com/VinAIResearch/blur-kernel-space-exploring
- SelfDeblur [72]：https://github.com/csdwren/SelfDeblur
- DeBlurGANv2 [5]：https://github.com/VITA-Group/DeblurGANv2
- Stripformer [6]：https://github.com/pp00704831/Stripformer-ECCV-2022-
- MPRNet [7]：https://github.com/swz30/MPRNet
- Pan-DCP [70]：https://jspan.github.io/projects/dark-channel-deblur/index.html
- Pan-$\ell_0$ [71]：https://jspan.github.io/projects/text-deblurring/index.html
- BlindDPS [21]：https://github.com/BlindDPS/blind-dps
- TSR-WGAN [67]：https://codeocean.com/capsule/9958894/tree/v1
- FPS [80]：https://github.com/ZehaoDou-official/FPS-SMC-2023
- DiffPIR [28]：https://github.com/yuanzhi-zhu/DiffPIR

### E. 更多实验结果

#### E.1 计算效率

如表 7 所示，我们发现本文方法的内存占用与大多数其他算法处于同一量级。速度方面，使用 L-BFGS 的实现显著快于 ADAM 版本。尽管使用 L-BFGS 的本方法仍有些慢，但性能已超越 ReSample。我们将进一步探索方法的加速作为未来工作。

**表 7：各算法在 CelebA [62] 数据集上做超分辨率的实际耗时（秒）与内存占用（GB）**，在单块 NVIDIA A100 GPU 上测试。（Ours-A：本文方法配 ADAM；Ours-L：本文方法配 L-BFGS。来源：原文第 19 页。）

| 指标 | ADMM-PnP | DMPS | DDRM | MCG | DPS | DDNM | FPS | DiffPIR | ReSample | Ours-A | Ours-L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 时间 | 6 | 42 | 30 | 43 | 43 | 14 | 62 | 4 | 367 | 635 | 255 |
| 内存 | 0.42 | 5.10 | 4.99 | 2.80 | 2.79 | 5.11 | 20.63 | 1.44 | 4.87 | 6.59 | 6.74 |

#### E.2 定量结果

**超分辨率与修复。** 遵循 [20,19]，为生成测量，我们对超分辨率（$4\times$）使用双三次降采样，对修复使用 70% 缺失像素的随机掩码；所有测量都含 $\sigma=0.01$ 的加性高斯噪声。我们把本文方法与使用 ADMM 的即插即用方法（ADMM-PnP）[73] 以及若干 SOTA 扩散模型方法比较：基于扩散模型的后验采样（DMPS）[29]、去噪扩散恢复模型（DDRM）[32]（原文此处印作 "Destoration"，应为 "Restoration"）、流形约束梯度（MCG）[30]、迭代潜变量细化（ILVR）[41]、扩散后验采样（DPS）[19] 与 ReSample [20]。定量结果报告于表 8—10，定性结果可视于图 1。显然，我们的 DMPlug 在三个数据集上始终在定量与定性上优于所有对比方法。具体地，尽管 LPIPS 上无显著提升，所提方法在 PSNR 与 SSIM 上平均可分别领先最优 SOTA 方法约 2 dB 与 0.02。

**表 8：（线性逆问题）含加性高斯噪声（$\sigma=0.01$）的超分辨率与修复。**（来源：原文第 20 页。）

| 方法 | 超分辨率（4×）CelebA |  |  | 超分辨率 FFHQ |  |  | 修复 CelebA |  |  | 修复 FFHQ |  |  |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
|  | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ |
| ADMM-PnP [73] | 0.217 | 26.99 | 0.808 | 0.229 | 26.25 | 0.794 | 0.091 | 31.94 | 0.923 | 0.104 | 30.64 | 0.901 |
| DMPS [29] | 0.070 | 28.89 | 0.848 | **0.076** | 28.03 | 0.843 | 0.297 | 24.52 | 0.693 | 0.326 | 23.31 | 0.664 |
| DDRM [32] | 0.226 | 26.34 | 0.754 | 0.282 | 25.11 | 0.731 | 0.185 | 26.10 | 0.712 | 0.201 | 25.44 | 0.722 |
| MCG [30] | 0.725 | 19.88 | 0.323 | 0.786 | 18.20 | 0.271 | 1.283 | 10.16 | 0.049 | 1.276 | 10.37 | 0.050 |
| ILVR [41] | 0.322 | 21.63 | 0.603 | 0.360 | 20.73 | 0.570 | 0.447 | 15.82 | 0.484 | 0.483 | 15.10 | 0.450 |
| DPS [19] | 0.087 | 28.32 | 0.823 | 0.098 | 27.44 | 0.814 | 0.043 | 32.24 | 0.924 | 0.046 | 30.95 | 0.913 |
| ReSample [20] | 0.080 | 28.29 | 0.819 | 0.108 | 25.22 | 0.773 | 0.039 | 30.12 | 0.904 | 0.044 | 27.91 | 0.884 |
| DMPlug（本文） | **0.067** | **31.25** | **0.878** | 0.079 | **30.25** | **0.871** | **0.039** | **34.03** | **0.936** | **0.038** | **33.01** | **0.931** |
| 相对最优对比方法 | −0.003 | +2.36 | +0.030 | +0.003 | +2.22 | +0.028 | −0.000 | +1.79 | +0.012 | −0.006 | +2.06 | +0.018 |

**表 9：（线性逆问题）在 LSUN-bedroom [64] 上含加性高斯噪声（$\sigma=0.01$）的超分辨率与修复。**（来源：原文第 20 页。）

| 方法 | 超分辨率（4×） |  |  | 修复（随机 70%） |  |  |
|---|---|---|---|---|---|---|
|  | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ |
| ADMM-PnP [73] | 0.358 | 24.09 | 0.728 | 0.223 | 27.75 | 0.842 |
| DMPS [29] | 0.172 | 25.54 | 0.772 | 0.320 | 23.09 | 0.712 |
| DDRM [32] | 0.415 | 22.73 | 0.644 | 0.273 | 23.66 | 0.673 |
| MCG [30] | 1.069 | 15.00 | 0.176 | 1.271 | 11.15 | 0.055 |
| ILVR [41] | 0.476 | 18.89 | 0.445 | 0.581 | 14.79 | 0.407 |
| DPS [19] | 0.195 | 25.10 | 0.737 | 0.094 | 28.95 | 0.868 |
| ReSample [20] | 0.137 | 24.72 | 0.762 | 0.069 | 26.43 | 0.861 |
| DMPlug（本文） | **0.136** | **26.93** | **0.801** | **0.064** | **30.15** | **0.905** |
| 相对最优对比方法 | −0.001 | +1.39 | +0.029 | −0.005 | +1.20 | +0.037 |

**表 10：（线性逆问题）在 CelebA [62] 上含加性高斯噪声（$\sigma=0.01$）的超分辨率与修复。**（来源：原文第 20 页。）

| 方法 | 超分辨率（4×） |  |  | 修复（随机 70%） |  |  |
|---|---|---|---|---|---|---|
|  | LPIPS↓ | PSNR↑ | SSIM↑ | LPIPS↓ | PSNR↑ | SSIM↑ |
| FPS [80] | 0.149 | 29.12 | 0.858 | 0.064 | 32.06 | 0.924 |
| DiffPIR [28] | 0.203 | 31.55 | 0.857 | 0.219 | 31.22 | 0.866 |
| DDNM [33] | 0.193 | 29.21 | 0.836 | 0.224 | 27.89 | 0.799 |
| PSLD [81] | 0.243 | 26.45 | 0.682 | 0.213 | 27.65 | 0.785 |
| DMPlug（本文） | **0.067** | **31.25** | **0.878** | **0.039** | **34.03** | **0.936** |
| 相对最优对比方法 | −0.082 | −0.30 | +0.020 | −0.025 | +1.97 | +0.012 |

> **原文疑点：** 表 10 中本文方法相对最优对比方法的 PSNR 差值为 −0.30（即 DiffPIR 的 31.55 dB 高于本文的 31.25 dB），这与正文"本文方法在 PSNR 上领先约 2dB"的总体表述并不矛盾——正文该结论基于表 8 的 CelebA/FFHQ 与表 9 的 LSUN 结果；此处按原文照录表 10 数值，未做改动。

#### E.3 定性结果

定性结果见图 9—14（原文第 21—26 页）：分别为 $4\times$ 超分辨率、修复（随机 70%）、非线性去模糊、BID（运动）、BID（高斯）与带湍流 BID 的样例可视化，所有测量均含 $\sigma=0.01$ 的高斯噪声。

### F. 更多早停结果

早停相关的更多结果见图 15—18（原文第 27—30 页）：图 15 与图 16 分别为 $4\times$ 超分辨率与非线性去模糊在四类噪声、两个噪声强度下的鲁棒性可视化（上排低强度、下排高强度）；图 17 与图 18 分别为两种情况结合 ES-WMV 的早停过程（红色 PSNR 曲线、蓝色 VAR 曲线、绿色竖条为检测到的早停点）。

**本页范围与校对状态：** 本页覆盖 arXiv:2405.16749v2（NeurIPS 2024）全文 36 页的可译正文部分：摘要、第 1—5 节、致谢、图 1—18 图注、表 1—10、算法 1—3、参考文献 [1]—[81]（英文原条目，按原编号保留）、附录 A—F。原文第 31—36 页的 NeurIPS Paper Checklist 属投稿检查表而非论文正文，按翻译规则省略（其中与本页相关的实验复现与代码可用性信息已由正文第 4 节、附录 C/D 覆盖）。表格与算法伪代码已用 `render.py` 将 PDF 第 4、5、8、9、10、18、19、20 页渲染为图像后逐格核对；原文以绿色/红色标注的性能升降在纯文本页面中改用正负号表达，粗体与下划线分别表示最优与次优。已标注两处原文疑点/笔误：图 17 图注中 "DMPlgu" 应为 "DMPlug"；附录 C.3 中 $\psi_\beta$ 与式（10）的 $\mathcal F_\alpha$ 记法不一致（均按原文照录并加注），另对表 10 中本文方法 PSNR 略低于 DiffPIR 的数值与正文总体表述的关系作了说明。原文图内的视觉对比未逐像素描述，图注只给出图中设置与关键结论。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、表格数值的独立复算均未做），因此本页不标记为已验收全文；若需核对具体数值或公式，请以 [原文 PDF](https://arxiv.org/pdf/2405.16749v2) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
