---
layout: page
title: "多步一致性模型（全文中译）"
permalink: /papers/translations/2026-10-12-multistep-cm/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文条目](/papers/items/2fbb99f8064d2cac/) · [原文 arXiv](https://arxiv.org/abs/2403.06807)

> 依据上传的 arXiv:2403.06807v3（16 页）翻译摘要、正文 1–6 节、附录 A.1–A.5、公式、算法、实验表和图注。引文标号对应原文；参考文献的正式英文著录见原 PDF。保留原文的模型声称与数值，不代表已在无线信道任务上复现。

# 多步一致性模型

*Multistep Consistency Models*

作者：Jonathan Heek、Emiel Hoogeboom、Tim Salimans（Google DeepMind；前两位作者贡献相同）

## 摘要

扩散模型相对容易训练，但生成样本需要很多步骤。一致性模型训练难得多，却可以一步生成样本。本文提出多步一致性模型，将一致性模型（Song et al., 2023）和 TRACT（Berthelot et al., 2023）统一起来，使模型可以在一致性模型和扩散模型之间插值，从而权衡采样速度与生成质量。具体地，单步一致性模型就是传统一致性模型，而采样步骤趋于无穷的一致性模型则是扩散模型。

多步一致性模型在实践中效果很好。把采样预算从一步增加到 2–8 步后，模型更容易训练，生成质量更高，却仍保留大部分速度优势。值得注意的是，我们用一致性蒸馏，在不进行对抗训练、只使用简单损失的条件下，于 ImageNet64 上以 8 步获得 1.4 FID，于 ImageNet128 上以 8 步获得 2.1 FID。我们还表明方法可扩展到文本到图像扩散模型，其生成质量接近原始模型。

## 1. 引言

扩散模型迅速成为图像、视频和音频生成中占主导地位的生成模型之一（Ho et al., 2020；Kong et al., 2021；Saharia et al., 2022）。其最大缺点是采样相对昂贵：训练时每个数据点只需一次函数评估，生成一个样本却需要多次、有时上百次评估。

一致性模型（Song et al., 2023）近期显著缩短了采样时间，代价是图像质量降低。一致性模型有一致性训练（CT）与一致性蒸馏（CD）两种变体，相较早期方法均有较大提升。TRACT（Berthelot et al., 2023）则专注蒸馏，采用与 CD 相似的方式，并显示将扩散轨迹划分为多个阶段可以改善性能。尽管已有成功，这两类方法仍无法接近标准扩散基线。

本文统一一致性模型与 TRACT，缩小标准扩散与少步变体的性能差距。我们放宽一致性模型单步限制，在部分设置中允许 4、8、16 次函数评估。我们将 TRACT 推广到一致性训练，同时引入一致性建模中的步骤调度退火和同步 dropout。我们还说明，当步数增加时，多步 CT 会转化为扩散模型。

我们引入统一的训练算法，称为多步一致性模型。该方法把从数据到噪声的扩散过程划分为预设区间，每个区间训练一个一致性模型，但共享同一组参数。对 CT、CD 而言，这都令学习任务变得更容易，并允许以更少采样步数显著改善结果。令人惊讶的是，在 ImageNet64 和 ImageNet128 上，仅八步便能完全匹配基础扩散模型的性能。

另一重要贡献是确定性扩散采样器 aDDIM（Adjusted DDIM）。在 ImageNet128 等较复杂的数据集上，它也能达到有竞争力的 FID。aDDIM 通过增大噪声预测补偿数值积分误差，缓解积分误差造成的生成模糊。

量化而言，模型只用八步，有时甚至四步，就可与标准扩散方法竞争；一致性训练和一致性蒸馏都适用。四步结果分别为 ImageNet64 的 1.6 FID 与 ImageNet128 的 2.3 FID。

*图 1：多步一致性模型在单步 CM 和标准扩散之间插值。图上方 t=0 为两个高斯组成的数据分布，下方 t=1 为标准正态分布。自左向右分别为训练后的 1、2、4 和无穷步模型的实际采样轨迹；无穷步相当于用 DDIM 采样的标准扩散。四步轨迹较一步更平滑，因而可能更容易学习。*

## 2. 背景：扩散模型

扩散模型由不断添加噪声、破坏数据的前向过程定义：

$$
\mathbf z_t=\alpha_t\mathbf x+\sigma_t\boldsymbol\epsilon_t,\qquad
\boldsymbol\epsilon_t\sim\mathcal N(0,\mathbf I).
$$

通常 \(t\to1\) 时，\(z_t\) 近似标准正态分布；\(t\to0\) 时，\(z_t\) 近似原始数据 x。其分布形式为

$$
q(\mathbf z_t\mid\mathbf x)
=\mathcal N(\mathbf z_t;\alpha_t\mathbf x,\sigma_t^2\mathbf I).
$$

遵循 Ho et al.（2020）与 Sohl-Dickstein et al.（2015），本文选取方差保持形式 \(\sigma_t^2=1-\alpha_t^2\)。Kingma et al.（2021）指出，\(\alpha_t,\sigma_t\) 的绝对数值并不重要：方差保持与方差爆炸等过程可以相互重参数化；真正重要的是两者之比，因此定义信噪比 \({\rm SNR}(t)=\alpha_t^2/\sigma_t^2\)。

从扩散模型采样使用去噪方程（式 1）：

$$
q(\mathbf z_s\mid\mathbf z_t,\mathbf x)=
\mathcal N\left(\mathbf z_s;\boldsymbol\mu_{t\to s}
(\mathbf z_t,\mathbf x),\sigma_{t\to s}^2\mathbf I\right).\tag{1}
$$

这里 x 通过模型预测 \(\widehat{\mathbf x}=f(\mathbf z_t,t)\) 近似。根据 Kingma et al.（2021），

$$
\sigma_{t\to s}^{2}=
\left(\frac1{\sigma_s^2}+
\frac{\alpha_{t|s}^2}{\sigma_{t|s}^2}\right)^{-1},
$$

$$
\boldsymbol\mu_{t\to s}
=\sigma_{t\to s}^{2}\left(
\frac{\alpha_{t|s}}{\sigma_{t|s}^{2}}\mathbf z_t+
\frac{\alpha_s}{\sigma_s^2}\mathbf x\right).
$$

Song et al.（2021b）证明，扩散目标的最优预测是给定噪声观测的条件期望 \(\mathbb E[\mathbf x\mid\mathbf z_t]\)。采样从 \(\mathbf z_1\sim\mathcal N(0,\mathbf I)\) 开始，依次令 \(t=1,1-1/N,\ldots,1/N\) 和 \(s=t-1/N\) 迭代。所需步数与数据分布有关，但图像生成等应用通常需要数百步，使扩散模型成为资源消耗最高的模型类别之一（Luccioni et al., 2023）。

**一致性模型。**与之相反，一致性模型（Song and Dhariwal, 2023；Song et al., 2023）致力于学习从噪声到数据的直接映射。其边界约束是 \(\mathbf x=f(\mathbf z_0,0)\)，同时通过一致性损失训练：

$$
\left\|f(\mathbf z_t,t)-
{\rm stopgrad}\big(f(\mathbf z_s,s)\big)\right\|.\tag{2}
$$

其中 \(z_s=\alpha_s x+\sigma_s\epsilon\)、\(z_t=\alpha_t x+\sigma_t\epsilon\)，两者使用相同噪声 ε，且 \(s<t\)，即 s 更接近数据端。若训练成功，模型就学习了概率流 ODE 随时间演化的轨迹：同一条轨迹上的各位置都预测同一个 x。初始化时，因为 t=0 处 f 由定义就是恒等映射，所以模型最容易先学到这一端；随后训练逐渐将终点信息传播到 t=1。在作者的经验中，训练 CM 比训练扩散模型困难得多。

**一致性训练和一致性蒸馏。**CM 的两种形式为 CT 与 CD。上面式 (2) 中，如果 \(z_s\) 由真实数据构建，就是 CT。另一种做法是让预训练扩散模型（教师）执行一步概率流 ODE 积分，例如通过 DDIM。CD 的目标为（式 3）：

$$
\left\|f(\mathbf z_t,t)-
{\rm stopgrad}\left[
f\!\left({\rm DDIM}_{t\to s}
(\mathbf x_{\rm teacher},\mathbf z_t),s\right)\right]\right\|.\tag{3}
$$

此时 DDIM 根据当前 \(z_t\) 和 x 的估计（或真实 x）产生 \(z_s\)。一致性模型一个关键超参数是 t 与 s 两次评估的间隔。对于 CT，间隔很大会引入偏差，但能更快传播轨迹端点信息；若 \(s\to t\)，偏差趋零，却要更久才能完成沿扩散时间的信息传播。实践中使用 \(N(\cdot)\) 的步骤调度逐渐缩小 \(t-s=1/N(\cdot)\)。

**DDIM 采样器。**DDIM 是概率流 ODE 的线性化方法，广泛用于扩散模型。方差保持设置下（式 4）：

$$
\mathbf z_s={\rm DDIM}_{t\to s}(\mathbf x,\mathbf z_t)
=\alpha_s\mathbf x+\frac{\sigma_s}{\sigma_t}
(\mathbf z_t-\alpha_t\mathbf x).\tag{4}
$$

除了采样，它也是建立多步模型的重要工具。另一个有用公式是逆 DDIM（Salimans and Ho, 2022）：给定 \(z_t,z_s\)，找到使 \({\rm DDIM}_{t\to s}(x,z_t)=z_s\) 成立的 x。由式 (4) 移项可得（式 5）：

$$
\mathbf x={\rm invDDIM}_{t\to s}(\mathbf z_s,\mathbf z_t)
=\frac{\mathbf z_s-(\sigma_s/\sigma_t)\mathbf z_t}
{\alpha_s-\alpha_t(\sigma_s/\sigma_t)}.\tag{5}
$$

## 3. 多步一致性模型

本节阐述多步一致性模型：先给出同时适用于 CT/CD 的训练算法，再说明多步一致性在极限下收敛于标准扩散训练，最后介绍校正 DDIM 方差缺失问题的确定性 aDDIM 采样器。

### 3.1 总体说明

多步一致性将扩散时间均匀划分为若干段，以简化建模任务。回忆传统一致性模型必须学习完整 ODE 的积分。当目标分布有不同模态时，这一映射可能非常陡峭、难以学习（见图 1）。一致性损失可以理解为通过减小轨迹点对之间的差异来近似路径积分。多步方法把积分拆成多个区间，从而推广这一思想。

传统一致性从某个 \(t>0\) 直接预测时间 0 的数据 \(x\approx z_0\)，相当于学习沿 DDIM 路径积分到 0。本文改为把各段起点 \(z_{t_{\rm step}}\) 作为目标，而非总是以 x 为目标。DDIM 方程允许我们在不同 \(t_{\rm step}\) 下操作，因此多步一致性损失写成（式 6）：

$$
\left\|{\rm DDIM}_{t\to t_{\rm step}}
\big(f(\mathbf z_t,t),\mathbf z_t\big)
-\widehat{\mathbf z}_{{\rm ref},t_{\rm step}}\right\|,\tag{6}
$$

其中

$$
\widehat{\mathbf z}_{{\rm ref},t_{\rm step}}
={\rm DDIM}_{s\to t_{\rm step}}
\big({\rm stopgrad}\,f(\mathbf z_s,s),\mathbf z_s\big),
$$

教师更新使用 \(\mathbf z_s={\rm aDDIM}_{t\to s}
(\mathbf x,\mathbf z_t)\) 近似概率流 ODE。现阶段可先把 aDDIM 看成 DDIM，其细节见 3.2 节；对于蒸馏，还可将 aDDIM 替换成任何确定性采样器或积分器。

可以直接在 z 空间优化式 (6)，但为使损失更直观，并与标准扩散训练关联，本文使用 invDDIM 重参数化到 x 空间（式 7）：

$$
\|\widehat{\mathbf x}_{\rm diff}\|=
\left\|f(\mathbf z_t,t)-
{\rm invDDIM}_{t\to t_{\rm step}}
\big(\widehat{\mathbf z}_{{\rm ref},t_{\rm step}},\mathbf z_t\big)\right\|.\tag{7}
$$

这允许使用扩散文献已有损失。本文采用 v-loss（等价于 SNR+1 加权），因为它此前在蒸馏中表现良好（Salimans and Ho, 2022）。

Song et al.（2023）指出，一致性本身不足以蒸馏一条正确轨迹：恒定预测 0 也是一致的，因此必须排除退化解。本文的模型中，当 \(s=t_{\rm step}\)，参考值就是 \(z_s\)；每段最后一步的损失必定不是退化的，因为它变为（式 8）：

$$
\left\|f(\mathbf z_t,t)-
{\rm invDDIM}_{t\to s}(\mathbf z_s,\mathbf z_t)\right\|.\tag{8}
$$

**算法 1：训练多步 CM。**输入网络 f，采样 \(\mathbf x\sim p_{\rm data}\)、\(\boldsymbol\epsilon\sim\mathcal N(0,I)\)，训练迭代编号为 i。令

$$
N_{\rm per\ segment}=
{\rm round}\left(N_{\rm teacher}(i)/{\rm student\_steps}\right).
$$

然后均匀随机选一段 \({\rm step}\in\{0,\ldots,{\rm student\_steps}-1\}\)，再选段内的相对索引 \(n_{\rm rel}\in\{1,\ldots,N_{\rm per\ segment}\}\)，记 \(t_{\rm step}={\rm step}/{\rm student\_steps}\) 和教师总步数 T。CT 时取 \(\mathbf x_{\rm teacher}=\mathbf x\)；CD 时取教师网络预测 \(\mathbf x_{\rm teacher}=f_{\rm teacher}(\mathbf z_t,t)\)。估计方差

$$
x_{\rm var}=\frac{\|\mathbf x_{\rm teacher}-\mathbf x\|^2}{d}.
$$

令 \(t=t_{\rm step}+n_{\rm rel}/T,\ s=t-1/T\)，并按 \(z_t=\alpha_t x+\sigma_t\epsilon\) 产生训练噪声。接着执行

$$
\mathbf z_s={\rm aDDIM}_{t\to s}
(\mathbf x_{\rm teacher},\mathbf z_t,x_{\rm var}),
$$

$$
\widehat{\mathbf x}_{\rm ref}=
{\rm stopgrad}\,f(\mathbf z_s,s),\quad
\widehat{\mathbf x}=f(\mathbf z_t,t),
$$

$$
\widehat{\mathbf z}_{{\rm ref},t_{\rm step}}=
{\rm DDIM}_{s\to t_{\rm step}}
(\widehat{\mathbf x}_{\rm ref},\mathbf z_s),
$$

$$
\widehat{\mathbf x}_{\rm diff}=
{\rm invDDIM}_{t\to t_{\rm step}}
(\widehat{\mathbf z}_{{\rm ref},t_{\rm step}},\mathbf z_t)
-\widehat{\mathbf x}.
$$

最终优化 \(L_t=w_t\|\widehat{\mathbf x}_{\rm diff}\|\)，例如 \(w_t={\rm SNR}(t)+1\)。

**多步 CT 等价于扩散训练的极限。**一致性训练学习沿时间积分概率流；标准扩散模型则学习在非平凡数据分布下必然随时间变化的条件期望路径 \(\widehat x=\mathbb E[x\mid z_t]\)。随着学生步数增加，多步 CT 趋向扩散训练，原因有二：（1）每一段起点附近，两个目标完全相同；（2）当学生步数等于教师步数 T 时，每一步就是标准扩散目标。

在算法 1 中取 \(t=t_{\rm step}+1/T\)。对于 CT，aDDIM 化为 DDIM，且 \(s=t_{\rm step}\)，因而参考映射不再移动 \(z_s\)，得到 \(\widehat z_{{\rm ref},t_{\rm step}}=z_s\)。进一步化简（式 9）：

$$
w(t)\|\mathbf x_{\rm diff}\|=
w(t)\|{\rm invDDIM}_{t\to s}(\mathbf z_s,\mathbf z_t)
-\widehat{\mathbf x}\|
=w(t)\|\mathbf x-\widehat{\mathbf x}\|.\tag{9}
$$

这正是真实数据点与模型预测的加权距离，是标准扩散训练的常见形式。Song and Dhariwal（2023）曾发现，对于 CM，欧氏距离（ℓ₂）通常比更常见的平方欧氏距离（ℓ₂²）好。因此本文采用 ℓ₂；这尤其适用于学生步数较少的情况，也是与普通扩散训练的一个区别。

因为多步一致性逐渐趋近扩散模型，我们提出两点假设：第一，从预训练扩散模型检查点微调多步 CM，会更快、更稳定地收敛；第二，随学生步数增多，多步 CM 的性能将接近扩散模型，由此形成采样质量与时间的直接折中。需要注意，每一种指定的学生步数都必须训练相应的新模型；不过由于可以用预训练扩散模型初始化，微调预算有望远少于原始训练预算。

**算法 2：多步 CM 采样。**先取 \(z_1\sim\mathcal N(0,I)\)，令 \(T={\rm student\_steps}\)。对 \(t=T/T,\ldots,1/T\) 按递减顺序执行 \(s=t-1/T\)，并计算

$$
\mathbf z_s={\rm DDIM}_{t\to s}(f(\mathbf z_t,t),\mathbf z_t).
$$

循环结束返回数据端样本。

**为何不直接使用连续时间训练？**扩散模型容易通过 \(t\sim U(0,1)\) 在连续时间训练，而算法 1 刻意将 t 限制在 [0,1] 的离散网格上。若网络 f 额外接收一个信号，指示当前处于哪个区间，也可以采用连续时间；这是必要的，因为跨越 \(t=t_{\rm step}\) 边界时，预测目标会从当前段跳到下一段，发生不连续变化。本文经常以预训练扩散模型初始化，因此保留与原模型相同的接口更加简单。早期实验发现，连续时间扩展的性能与本文方案接近。

### 3.2 调整后的 DDIM（aDDIM）采样器

许多扩散蒸馏方法，包括本文方法，都通过数值积分概率流 ODE 进行确定性采样。但有限教师步数引入积分误差；用于 CD（Song et al., 2023）和渐进蒸馏（Meng et al., 2022；Salimans and Ho, 2022）的 DDIM 积分器，由此可能使样本变得模糊。

考虑一个理想采样器，先从真实后验 \(p(x\mid z_t)\) 抽取 \(x^*\)，再通过（式 10）产生 \(z_s^*\)：

$$
\mathbf z_s^*
=\alpha_s\mathbf x^*+
\sigma_s\frac{\mathbf z_t-\alpha_t\mathbf x^*}{\sigma_t}
=\left(\alpha_s-\frac{\alpha_t\sigma_s}{\sigma_t}\right)
\mathbf x^*+\frac{\sigma_s}{\sigma_t}\mathbf z_t.\tag{10}
$$

如果输入 \(z_t\) 来自正确分布 \(p(z_t)\)，则输出 \(z_s^*\) 也精确服从正确分布。DDIM 则用网络输出 \(\widehat x\) 替换后验抽样 \(x^*\)，得到（式 11）：

$$
\mathbf z_s^{\rm DDIM}
=\left(\alpha_s-\frac{\alpha_t\sigma_s}{\sigma_t}\right)
\widehat{\mathbf x}+
\frac{\sigma_s}{\sigma_t}\mathbf z_t.\tag{11}
$$

若 \(\widehat x=\mathbb E[x\mid z_t]\)，两者的平方范数差异满足（式 12）：

$$
\mathbb E\!\left[\|\mathbf z_s^*\|^2-
\|\mathbf z_s^{\rm DDIM}\|^2\mid\mathbf z_t\right]
=\operatorname{tr}(\operatorname{Var}[\mathbf z_s\mid\mathbf z_t]),\tag{12}
$$

其中（式 13）

$$
\operatorname{Var}[\mathbf z_s\mid\mathbf z_t]
=\left(\alpha_s-\frac{\alpha_t\sigma_s}{\sigma_t}\right)^2
\operatorname{Var}[\mathbf x\mid\mathbf z_t].\tag{13}
$$

因而 DDIM 迭代状态的范数过小，反映采样算法缺少噪声注入；换言之，预测 \(\widehat x\approx\mathbb E[x\mid z_t]\) 过于平滑。当前最好的采样质量通常来自可调随机噪声、用于抵消积分过度平滑的随机采样器，但现有蒸馏算法不适合直接蒸馏这种采样器。二阶确定性求解器也非理想选择，因为在蒸馏时多要求一次前向网络计算。

本文提出只需单次网络评估的新确定性采样器，在不直接添加随机噪声的情况下取得类似于噪声注入的范数增大效果。我们对 DDIM 做简单修正，称为 aDDIM。这一修正是启发式的，并不比原始 DDIM 具有更强的理论保证；但实践中可改善 FID（图 3），成为更好的确定性教师。

思路是不向 \(z_s\) 加入额外随机噪声，而是增强确定性噪声估计 \(\widehat\epsilon=(z_t-\alpha_t\widehat x)/\sigma_t\) 的贡献。假设 \(\widehat x\) 和 \(\widehat\epsilon\) 正交，可用下式恢复采样状态所需范数（式 14）：

$$
\mathbf z_s^{\rm aDDIM}
=\alpha_s\widehat{\mathbf x}+
\sqrt{\sigma_s^2+
\frac{\operatorname{tr}(\operatorname{Var}[\mathbf z_s\mid\mathbf z_t])}
{\|\widehat{\boldsymbol\epsilon}\|^2}}\,
\widehat{\boldsymbol\epsilon}.\tag{14}
$$

在实践中，

$$
\operatorname{tr}(\operatorname{Var}[\mathbf z_s\mid\mathbf z_t])
=\left(\alpha_s-\frac{\alpha_t\sigma_s}{\sigma_t}\right)^2
\operatorname{tr}(\operatorname{Var}[\mathbf x\mid\mathbf z_t]).
$$

后验方差迹可以提前在数据集上按各相关时间步计算，令

$$
\operatorname{tr}(\operatorname{Var}[\mathbf x\mid\mathbf z_t])
=\eta\|\widehat{\mathbf x}(\mathbf z_t)-\mathbf x\|^2,
$$

本文取超参数 \(\eta=0.75\)。另一种效果近似相当的方案是用解析近似，在数据维度为 d 时取

$$
\frac1d\operatorname{tr}(\operatorname{Var}[\mathbf x\mid\mathbf z_t])
=\frac{0.1}{2+\alpha_t^2/\sigma_t^2}.
$$

可将其理解为方差 0.5、各维独立高斯先验下 x 后验方差的 10%。在两种情况下，当 \(s\to t\) 时，\(\operatorname{Var}[z_s\mid z_t]\to0\)，所以多步极限中的 aDDIM 更新与原 DDIM 相同。

**算法 3：用 aDDIM 生成样本。**在所有 t 上预先计算 \(x_{{\rm var},t}=\eta\|x-\widehat x(z_t)\|^2/d\)，或设置为 \(0.1/(2+\alpha_t^2/\sigma_t^2)\)。选择 \(\eta\in(0,1)\)，初始化 \(z_T\sim\mathcal N(0,I)\)。从 \(t=T/T,\ldots,1/T\) 依次取 \(s=t-1/T\)，计算 \(\widehat x=f(z_t,t)\)、\(\widehat\epsilon=(z_t-\alpha_t\widehat x)/\sigma_t\)，令

$$
z_{s,{\rm var}}=
\left(\alpha_s-\frac{\alpha_t\sigma_s}{\sigma_t}\right)^2 x_{{\rm var},t},
$$

并更新

$$
\mathbf z_s=\alpha_s\widehat{\mathbf x}+
\sqrt{\sigma_s^2+
\left(\frac d{\|\widehat{\boldsymbol\epsilon}\|^2}\right)
z_{s,{\rm var}}}\,\widehat{\boldsymbol\epsilon}.
$$

重复直到数据端。aDDIM 仅替换教师采样步骤；学生仍通过普通 DDIM 学习教师轨迹。学生端 DDIM 只是便利的输出参数化，也完全可以直接预测 \(z_s\)。

*图 2：定性比较。上排为本文 aDDIM 蒸馏的 16 步一致性模型，耗时 3.2 秒；下排为同初始噪声下 100 步 DDIM 扩散模型，耗时 39 秒。*

*图 3：ImageNet64（左）与 ImageNet128（右）未经蒸馏的小模型采样器比较。aDDIM 在 ImageNet64 上与二阶 Heun 相当，在 ImageNet128 上优于它，说明噪声校正与二阶积分校正可同样有效甚至更好。Heun 的良好效果与特定噪声调度相关。*

## 4. 相关工作

多步一致性模型直接结合一致性模型（Song and Dhariwal, 2023；Song et al., 2023）和 TRACT（Berthelot et al., 2023）。相对于 CM，本文采用多个阶段，简化建模并显著提高性能；TRACT 则只处理蒸馏，利用 CM 的自评估机制在多个阶段进行蒸馏，并逐渐缩减到一或两个阶段。因此 TRACT 的最终目标仍是一步或两步采样，而我们认为允许稍多一点步数可以取得更好效果。本文表明，这种更保守的目标结合新采样器和退火调度，显著提高图像质量，缩小标准扩散与少步生成方法之间的差距。

此前 DDIM（Song et al., 2021a）表明，当限制采样步数时，确定性采样器的质量退化通常比 Ho et al.（2020）的随机采样器更缓和。Karras et al.（2022）提出二阶 Heun 减少步数与函数评估；Jolicoeur-Martineau et al.（2021）研究 SDE 积分器减少函数评估。渐进蒸馏（Meng et al., 2022；Salimans and Ho, 2022）分阶段蒸馏扩散模型，使训练时函数评估保持有限，采样步数则随蒸馏阶段数指数下降。

其他受扩散启发的方法——例如 Rectified Flows（Liu et al., 2023a）和 Flow Matching（Lipman et al., 2023）——也试图缩短采样时间。但在实践中，它们通常将数据映射至标准正态分布，其本身仍需较多函数评估。Rectified Flows 提出可显著减少步数的蒸馏方法，但牺牲了一定生成质量。

**对抗蒸馏。**低步数蒸馏容易造成图像质量下降，因此不少工作采用对抗训练。Luo et al.（2023）将扩散知识蒸馏成单步模型；Zheng et al.（2023）使用特定架构，从预先创建的噪声–样本配对数据中蒸馏 ODE 轨迹。与本文时间接近的 Consistency Trajectory Models（CTM；Kim et al., 2023）也把 CM 推广为多步，并学习向任意指定时间步积分，通过在网络输入中加入积分终点实现。虽然 CTM 可以几步生成高质量图像，但依赖对抗训练；没有对抗损失时 FID 存在明显差距。相比之下，本文更简单的多步 CM 可以只用距离损失训练，也能在少步条件下取得很好的 FID。可能的解释是，学习固定的少数几条积分轨迹，比学习任意终点下全部可能轨迹更容易。此外，本文不改变去噪网络的输入，因此从预训练扩散模型微调更方便。对抗训练还可能带来模式崩溃和训练不稳定。

*图 4：另一组基于同一提示词和相同初始噪声的定性对比：上排为本文 16 步蒸馏一致性模型（3.2 秒），下排为原始 100 步 DDIM（39 秒）。*

## 5. 实验

实验在 ImageNet 上通过 FID 进行定量比较，并对大规模文生图模型进行定性评估。这既使方法能与现有学术工作比较，也帮助理解多步蒸馏在大规模模型上的效果。

### 5.1 ImageNet 评估

我们在 ImageNet64 与 ImageNet128 上分别训练小型和大型扩散模型，并用预训练扩散参数初始化 CM；实践发现这大大提高了鲁棒性和收敛速度。CT 与 CD 都进行评估。仅在 ImageNet128 基础模型实验使用无分类器引导（Classifier-Free Guidance）；其他实验没有使用，因为它对扩散模型 FID 没有明显改善。

所有一致性模型训练 200,000 步、批大小为 2048，教师步数使用指数退火调度，在前 100,000 个训练步内由 64 增长到 1280。表 1 显示，随学生采样步数增加，性能通常改善。这支持“更多学生步数能够有效权衡质量和速度”的假设，而且改进在很少步数时就出现：即便在较复杂的 ImageNet128 上，基础模型仅八步便实现 2.1 FID。

**表 1：预训练扩散初始化后，多步 CT/CD 在 ImageNet 的 FID。**列为小模型 ImageNet64、小模型 ImageNet128、大模型 ImageNet64、大模型 ImageNet128；同一列以 CT/CD 为序。

| 步数 | 小64 CT/CD | 小128 CT/CD | 大64 CT/CD | 大128 CT/CD |
|---:|---|---|---|---|
| 1 | 7.2 / 4.3 |16.0 / 8.5|6.4 / 3.2|14.5 / 7.0|
| 2 |2.7 / 2.0|6.0 / 3.1|2.3 / 1.9|4.2 / 3.1|
| 4 |1.8 / 1.7|4.0 / 2.4|1.6 / 1.6|2.7 / 2.3|
| 8 |1.5 / 1.6|3.3 / 2.1|1.5 / 1.4|2.2 / 2.1|
| 16 |1.5 / 1.5|3.4 / 2.0|1.6 / 1.4|2.3 / 2.0|
| 扩散 aDDIM，512 步 | 1.5 |2.2|1.4|2.2|

为直接与渐进蒸馏（PD；Salimans and Ho, 2022）比较，我们使用 aDDIM、相同基础架构重新实现 PD（表 3）。加入本文改进后，PD 也能超过以往文献报告的性能；但与多步 CT/CD 相比，PD 在很少步数时的质量下降更严重，例如四步 PD 为 2.4 FID，而 CD 为 1.7。

**表 3：小 ImageNet64 模型中 PD 与本文 CT/CD 的比较。**

| 学生步数 | CT（本文） | CD（本文） | PD |
|---:|---:|---:|---:|
| 1 |7.2|4.3|10.7|
| 2 |2.7|2.0|4.7|
| 4 |1.8|1.7|2.4|
| 8 |1.5|1.6|1.8|

表 4 消融将 aDDIM 作为教师的效果。经验结果表明，学生步数较多时，调整后的采样器十分重要；在极少步数且学生质量尚不接近教师时，普通 DDIM 反而表现更好。

**表 4：ImageNet64 上 DDIM 与 aDDIM 教师的消融。**

| 学生步数 | DDIM | aDDIM |
|---:|---:|---:|
| 1 |3.91|4.35|
| 2 |1.99|2.02|
| 4 |1.77|1.68|
| 8 |1.70|1.58|
| 16 |1.72|1.54|

另一个消融研究步骤调度退火是否重要。表 2 表明，对于采样步数较少的多步模型，退火特别重要。实验中，64→1280 的退火调度始终优于固定教师步数 128、256 或 1024；随着学生步数增多，退火的重要性下降。

**表 2：ImageNet128 上 CD 教师步长退火消融（FID）。**

| 学生步数 | 64→1280 退火 | 固定128 | 固定256 | 固定1024 |
|---:|---:|---:|---:|---:|
| 1 |7.0|8.8|7.6|10.8|
| 2 |3.1|5.3|3.6|3.8|
| 4 |2.3|5.0|3.5|2.6|
| 8 |2.1|4.9|3.2|2.2|

**与文献比较。**如表 5 所示，本文通过四步和八步生成，在 ImageNet64 与 ImageNet128 上取得了当时先进的 FID。一个有趣之处是，本文单步 CD 与 iCT-deep（Song and Dhariwal, 2023）的性能近似，而后者使用被认为更难训练的直接一致性训练。这可能意味着在极少步数设置下，本文仍存在未优化好的超参数；另一种解释是，多步一致性对超参数不那么敏感。

我们还在 ImageNet128 上与自己重新实现的 PD 比较。ImageNet128 尚未广泛用于少步生成基准，可能正是因为过去缺少效果可靠的确定性采样器。本文同时提供 Kingma and Gao（2023）的近期参考结果，希望推动 ImageNet128 成为少步扩散评估的常用基准。

**表 5：与文献方法在 ImageNet 上的比较。**“非对抗”表示不使用对抗训练；原文列中空白表示该项未标记。

| 数据集 | 方法 | NFE | FID | 非对抗 |
|---|---|---:|---:|---|
| 64² | DDIM |10|18.7|是|
| 64² | DFNO（LPIPS）|1|7.83|是|
| 64² | TRACT |1/2/4/8|7.43 / 4.97 / 2.93 / 2.41|是|
| 64² | Diff-Instruct |1|5.57|—|
| 64² | PD（本文重实现）|1/2/4/8|10.7 / 4.7 / 2.4 / 1.7|是|
| 64² | PD Stochastic |1/2/4/8|18.5 / 5.81 / 2.24 / 2.31|是|
| 64² | CD（LPIPS）|1/2/3|6.20 / 4.70 / 4.32|是|
| 64² | PD（LPIPS）|1/2/3|7.88 / 5.74 / 4.92|是|
| 64² | iCT-deep |1/2|3.25 / 2.77|是|
| 64² | CTM |1/2|1.9 / 1.7|—|
| 64² | DMD |1|2.6|—|
| 64² | 本文 CT 基线 |1|3.2|是|
| 64² | 本文多步 CT |2/4/8|2.3 / 1.6 / 1.5|是|
| 64² | 本文多步 CD |1/2/4/8|3.2 / 1.9 / 1.6 / 1.4|是|
| 128² | VDM++ |512|1.75|是|
| 128² | 本文重实现 PD |2/4/8|8.0 / 3.8 / 2.5|是|
| 128² | 本文多步 CT |2/4/8|4.2 / 2.7 / 2.2|是|
| 128² | 本文多步 CD |2/4/8|3.1 / 2.3 / 2.1|是|

### 5.2 文本到图像生成评估

除 ImageNet 外，我们还研究文生图模型，从基础教师蒸馏一个 16 步一致性模型。表 6 显示，按 FID 衡量，多步 CD 几乎可以完美蒸馏教师。CLIP 分数的部分损失可归因于无分类器引导蒸馏，因为作为对照的 256 步学生模型对此也存在困难。

与引导蒸馏后的基线相比，16 步 CD 在低引导设置下的 CLIP 和 FID 几乎没有性能损失；高引导设置仅在 FID 上有轻微退化。甚至八步 CD 就获得了 8.1 FID，显著优于当时的其他文献结果。

图 2、6 将本文 16 步 aDDIM 蒸馏 CM 与原始 100 步 DDIM 的样本进行比较。它们使用相同随机种子，容易逐样本观察，结果通常只有小差异。作者经验认为，某些细节反而更精确，但整体构图可能稍有牺牲。图 4 另将 DDIM 蒸馏模型（相当于 aDDIM 中 η=0）与标准 DDIM 采样器比较，相同初始随机种子下也有大量相似性。

**表 6：文本到图像性能。**表中 FID30k/FID5k 分别为不同评估样本规模下的 FID；CLIP 为文本图像一致性指标。低引导条件下，8/16 步 CM 与在 256 步进行了引导蒸馏的教师相比几乎无性能损失。

| 方法 | NFE | FID30k | FID5k | CLIP | 非对抗 |
|---|---:|---:|---:|---:|---|
| SDv1.5，低引导 |512|8.8|—|—|是|
| SDv1.5，高引导 |512|13.5|—|.322|是|
| DMD，低引导 |1|11.5|—|—|否|
| DMD，高引导 |1|14.9|—|.320|否|
| UFOGen |1|12.8|22.5|.311|否|
| UFOGen |4|—|22.1|.307|否|
| InstaFlow-1.7B |1|11.8|22.4|.309|是|
| PeRFlow |4|11.3|—|—|是|
| 教师，g=.5，DDPM |256|7.9|13.6|.305|是|
| 引导蒸馏教师，g=.5，DDIM |256|8.2|13.8|.300|是|
| 多步 CD，g=.5 |4|8.7|14.4|.298|是|
| 多步 CD，g=.5 |8|8.1|13.8|.300|是|
| 多步 CD，g=.5 |16|7.9|13.9|.300|是|
| 教师，g=3，DDPM |256|12.7|18.1|.315|是|
| 引导蒸馏教师，g=3，DDIM |256|13.9|19.0|.312|是|
| 多步 CD，g=3 |4|12.4|18.1|.311|是|
| 多步 CD，g=3 |8|13.9|19.6|.311|是|
| 多步 CD，g=3 |16|14.4|20.0|.312|是|

## 6. 结论

本文提出多步一致性模型，将一致性模型与 TRACT 简单统一，并缩小标准扩散和少步采样之间的质量差距。多步一致性在生成质量与速度之间提供直接权衡，仅八步便能达到与标准扩散相近的表现。其主要局限是生成一个样本仍需若干函数评估。当只能使用一两次函数评估时，对抗方法一般仍更强，但代价是训练动态更加复杂和困难。

## 附录 A. 实验细节

### A.1 设置

本文遵循 simple diffusion（Hoogeboom et al., 2023）的实验设置，使用标准 UViT：当一个模块具有自注意力时，将 UNet 中的卷积层替换为 MLP 模块，使整个模块成为 Transformer 模块。关于架构和扩散过程的定义可参考该工作。下文列出各实验的少量特殊配置。所有训练均以预训练扩散模型参数初始化。

**多步一致性超参数。**全部 ImageNet 实验（小/大模型、1–16 步）均采用教师步数从 64 到 1280 的对数线性插值，并在前 100,000 次迭代中退火：

$$
N_{\rm teacher}(i)=\exp\left(\log64+
\operatorname{clip}(i/100000,0,1)(\log1280-\log64)\right).
$$

批大小 2048；aDDIM 的 xvar_frac 取 0.75；Huber ε 为 \(10^{-4}\)；模型总训练 200,000 步。插值初始值较低、耗时较长，对于 8、16 步模型这些配置可能过于保守，但使用同一设置便于公平比较。

文生图实验使用一致性蒸馏，教师步数固定为 256，xvar_frac=0.75。特别注意，xvar_frac 始终根据**条件化输出**而非引导后的输出计算（即此时引导强度为零）。Huber ε 为 1，在关注的归一化 [-1,1] 区域内基本相当于经过标量缩放的平方 ℓ₂ 损失。模型训练 30,000 步，批大小 2048。

**ImageNet64。**小型 UViT 的下采样部分：3 个 256 通道 ResNet 模块，接着 3 个 512 通道 Transformer 模块，两个阶段均以平均池化结束；中间为 16 个 1024 通道 Transformer 模块，MLP 扩展因子 4。上采样与下采样对称，但每阶段从最近邻上采样开始，不再使用池化。中间模块 dropout=0.2。大模型的所有通道数翻倍，所有 Transformer 均使用较小 dropout=0.1。网络在 64² 图像上使用从噪声分辨率 32 到 64 的插值余弦调度，实际几乎等同普通余弦调度。小模型约 3.94 亿参数，大模型约 12.3 亿参数。

**ImageNet128。**UViT 类似 ImageNet64，但在首尾的 128×128 分辨率上各增加 3 个 128 通道 ResNet 模块。下采样部分依次为 3 个 128 通道 ResNet、3 个 256 通道 ResNet、3 个 512 通道 Transformer，各相关阶段以平均池化结束。中间是 16 个 1024 通道 Transformer，MLP 扩展因子为 4；上采样对称，采用最近邻上采样而非池化。小/大模型分别有约 3.97 亿/12.5 亿参数。中间 dropout=0.1；大模型通道加倍，除了 128 分辨率处之外，其余卷积与 Transformer 模块均使用 0.1 dropout。训练在 128² 上采用从噪声分辨率 32 到 128 的插值余弦调度，并采用一次 2×2 平均池化的多尺度损失（Hoogeboom et al., 2023）。

**文本到图像。**文生图模型直接在 512×512 分辨率训练，使用多尺度损失与从噪声分辨率 32 至 512 的插值余弦调度。UViT 下采样依次为 3 个 128 通道 ResNet、3 个 256 通道 ResNet、3 个 1024 通道 ResNet、3 个 2048 通道 Transformer，阶段末尾均平均池化；中间使用 16 个 4096 通道 Transformer，dropout=0.1；上采样则将下采样顺序反转，并以最近邻插值替换平均池化。

### A.2 计算资源

小模型均使用 64 个 TPUv5e 芯片。ImageNet64 的 CT 每秒训练 2.7 步、CD 每秒 2.5 步；ImageNet128 的 CT 每秒 2.2 步、CD 每秒 1.7 步。大模型使用 256 个 TPUv5e：ImageNet64 CT/CD 分别为每秒 2.9/2.5 步，ImageNet128 CT/CD 分别为每秒 2.2/1.8 步。文生图实验也在 256 个 TPUv5e 上训练，每秒 0.71 步，且只训练 30,000 次迭代。所有模型均采用批大小 2048。

### A.3 数据集

本文模型在 ImageNet（Russakovsky et al., 2015）上训练。文生图模型使用获得私人授权的文本–图像数据集训练；其性质可与公开文生图数据集比较，但经过内容过滤。

### A.4 教师采样

图 5 比较包括二阶 Heun 在内的不同采样器。还加入了随机化 DDIM（noisy DDIM）：在模型预测中直接加入随机高斯噪声。这种直接噪声注入破坏 DDIM 的确定性，所以不适合一致性蒸馏，但其行为与 aDDIM 非常接近，似乎说明本文启发式噪声补偿模拟了噪声注入的正面影响。

一个有趣发现是，使用不同评估噪声调度时，采样方法的相对质量显著变化。Heun 更适合 Karras et al.（2022）提出的调度，而加噪方法更适合标准余弦调度。可能的解释是余弦调度的渐近性质更适合噪声注入。此前工作（Lin et al., 2024）指出，噪声调度的渐近行为对于完整捕捉数据分布很重要。作者认为，进一步研究调度与采样器之间的相互作用，是值得探索的方向。

*图 5：ImageNet64 上，余弦调度（左）与 Karras 等提出的 σ 调度（右）下不同采样器比较。除 NFE=64 的位置外，带移位余弦调度的 aDDIM 整体最好。*

### A.5 额外结果

图 6 给出相同提示词下更多生成结果。蒸馏模型再次表现出与原教师十分相似的输出，只有轻微变化。

*图 6：另一组多步一致性与扩散模型定性对比。上排为本文 aDDIM 蒸馏的 16 步 CM（3.2 秒），下排为 100 步 DDIM 原始模型（39 秒）。两组使用相同初始噪声。*

## 参考文献

引文的作者、英文题名和期刊/会议信息按原文保持，不进行书目元数据意译。可查阅[原文 PDF 第 12–13 页的 References](https://arxiv.org/pdf/2403.06807v3)。

{% endraw %}
