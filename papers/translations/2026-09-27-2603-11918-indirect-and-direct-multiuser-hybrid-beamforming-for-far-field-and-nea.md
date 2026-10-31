---
layout: page
title: "远场与近场多用户混合波束赋形的间接与直接方法｜中文全文译文"
permalink: /papers/translations/2026-09-27-2603-11918-indirect-and-direct-multiuser-hybrid-beamforming-for-far-field-and-nea/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/55e9194128966702/) · [原文 arXiv](https://arxiv.org/abs/2603.11918) · [全部目录](/papers/catalog/)

# 远场与近场多用户混合波束赋形的间接与直接方法：一种深度学习方法

**原题：** Indirect and Direct Multiuser Hybrid Beamforming for Far-Field and Near-Field Communications: A Deep Learning Approach  
**作者：** Xinyang Li、Songjie Yang、Boyu Ning、Zongmiao He、Xiang Ling（IEEE 会员）、Chau Yuen（IEEE 会士）  
**单位：** 电子科技大学通信抗干扰全国重点实验室（成都 611731，中国）；成都工业学院网络与通信工程学院（成都 611730，中国）；新加坡南洋理工大学电气与电子工程学院。  
**资助说明：** 本工作受国家科技重大专项 2024ZD1300800 资助；本文已投稿 IEEE，版权可能在不另行通知的情况下转移。  
**版本：** arXiv:2603.11918v1（eess.SP），2026 年 9 月 14 日，原文 16 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VI 节及全部小节（I-A/B、III-A–C、IV-A/B、V-A–F，其中 V-F 为讨论与未来工作）、式 (1)–(34)、算法 1–2、表 I–III（逐格转写）、图 1–14 图注、参考文献 [1]–[52]（英文原条目）均按原文结构录入；原文无附录、无独立致谢段。逐句逐式终校未做。

## 摘要

在极大规模多输入多输出（extremely large-scale MIMO，XL-MIMO）系统中，由于信道同时依赖角度与距离、且多用户干扰（multiuser interference，MUI）较强，近场混合波束赋形极具挑战。现有深度学习方法通常采用两类思路：一是不显式考虑 MUI 的解耦式设计（只优化模拟波束赋形），二是在非凸恒模（constant modulus，CM）约束、显著的模数耦合以及和速率损失的梯度模式下可能不稳定的端到端（end-to-end，E2E）联合模数优化。为同时解决这两个问题，我们提出一个基于**变体最小均方误差**（variant-MMSE）准则的复值 E2E 框架：数字预编码器通过 Karush–Kuhn–Tucker（KKT）条件以闭式消去，从而使模拟部分的学习具有稳定目标。网络采用分组复卷积感知前端处理上行（uplink，UL）测量、用共享复多层感知机（multilayer perceptron，MLP）提取逐用户特征、并用合并的恒模输出头产生模拟预编码器。在间接模式下，网络由估计的信道状态信息（channel state information，CSI）设计混合波束赋形器；在显式 CSI 不可得的直接模式下，网络从短导频中学习感知算子与模拟映射，随后由额外导频估计等效信道并启用 KKT 闭式数字预编码器。仿真表明：间接模式逼近迭代 variant-MMSE 优化的性能，且复杂度降低量与天线数成正比；直接模式下，所提方法在相同导频预算下相比稀疏恢复流程与近期深度学习基线提升了频谱效率。

**关键词：** 混合波束赋形、极大规模 MIMO（XL-MIMO）、近场通信、多用户干扰、深度学习、深度复值神经网络。

## I. 引言

全球移动数据流量的快速增长要求无线网络具有更高频谱效率 [1], [2]。虽然毫米波通信与大规模 MIMO（mMIMO）等第五代（5G）技术已提升频谱效率 [3]，第六代（6G）网络仍要求峰值数据速率的进一步增益。这促使我们采用更高频段与更大天线阵列，从而形成 XL-MIMO 系统 [4], [5]。随着阵列孔径增大，辐射近场区域显著扩展；在近场中，信道必须用球面波而非平面波描述，其性质由角度与距离共同决定 [6]–[8]。这一结构性变化给 XL-MIMO 的信道估计、波束训练与波束赋形设计都带来了新挑战 [9]–[12]。

混合波束赋形以显著低于全数字结构的射频（radio frequency，RF）链开销逼近全数字性能，是 XL-MIMO 的关键使能技术 [13]–[16]。在混合架构中，模拟预编码器由移相器实现并受恒模约束，数字预编码器在基带完成多用户预编码与功率分配。近场中，由于用户可能处于不同距离但相同角度，波束聚焦（beam focusing）成为必要能力，这要求模拟波束同时对准角度与距离 [14], [30], [31]。然而在多用户情形下，模拟波束的数量远小于天线数，如何抑制 MUI 是核心难点。

### A. 现有工作

早期混合波束赋形研究主要面向远场平面波信道。基于码本的波束训练方案通过分层码本逐级缩小波束搜索范围 [17], [18]；基于信道协方差的方案利用统计信息设计模拟波束 [19], [20]；基于正交匹配追踪（orthogonal matching pursuit，OMP）等稀疏恢复的方法把预编码设计表述为稀疏重构问题 [21], [22]。这些方法在远场中有效，但在近场中因球面波字典高度相干、且需在角度—距离二维网格上搜索，复杂度与性能均受限 [12]。

针对近场，研究者提出了多种波束聚焦与波束训练方法 [27]–[31]，以及面向多用户的近场分层波束训练方案 [34]。然而这些方法大多仍依赖显式信道估计或预定义字典，估计误差会通过"先估计后设计"的流程传播到波束赋形器 [12]。近年来深度学习被引入该领域：用神经网络直接学习信道到波束赋形器的映射 [33], [35]–[37]，或学习感知矩阵与波束赋形的联合设计 [38]–[41]。特别是端到端（E2E）学习方法把上行测量与下行波束赋形纳入统一的可微流程，在 TDD 系统中利用信道互易性避免显式 CSI 反馈 [38]–[40]。然而现有 E2E 方法面临两个问题：其一，若采用解耦设计、只优化模拟部分而不显式建模 MUI，则性能受限；其二，若直接对含 CM 约束的和速率损失做联合优化，则非凸约束、模数强耦合与和速率梯度的病态性会使训练不稳定、性能对初始化敏感 [37], [41]。此外，近场中球面波参数估计的计算代价随路径数线性增长，使基于估计的流程难以用于大阵列实时系统。

### B. 主要贡献

为应对上述挑战，本文提出一个统一的复值 E2E 混合波束赋形框架，并同时给出**间接**与**直接**两种工作模式。主要贡献概括如下。

- 我们提出基于 variant-MMSE 准则的解耦优化框架：对给定模拟预编码器，数字预编码器由 KKT 条件以闭式给出，并缩并为只依赖模拟预编码器的和-MSE 目标。该目标可微且梯度稳定，避免了直接对和速率损失做 CM 约束优化的不稳定性；同时该表述在数学上等价于原始联合问题在模拟部分的可解子问题，保留了模数耦合带来的增益。
- 我们设计了复值 E2E 网络架构，包含：(i) 分组复卷积感知前端，把上行测量过程实现为可学习的线性观测算子；(ii) 共享逐用户复 MLP，提取与用户无关的判别性特征；(iii) 合并的恒模输出头，把全部用户特征融合为模拟预编码器。该架构的参数规模远小于全连接感知层，且对用户数具有可扩展性。
- 我们提出间接模式（DL-IMHB）：在完美 CSI（perfect CSI，PCSI）假设下，网络以估计信道矩阵为输入直接产生模拟预编码器，再与闭式数字预编码器组合。该模式建立了对应直接模式的性能上界，且推理复杂度远低于迭代优化算法。
- 我们进一步提出直接模式（DL-DMHB）：在瞬时 CSI 不可得时，网络从短导频测量中学习感知算子与模拟映射，避免显式高维 CSI 估计；随后通过少量导频重复估计低维等效信道，并由闭式解给出数字预编码器。我们给出完整信令协议与算法流程。
- 我们在近场与远场混合场景、多种用户数、路径数与阵列配置下开展仿真，并与稀疏恢复流程、码本方案、迭代优化与近期深度学习方法比较；此外通过可视化学习到的感知方向图与复特征流形，解释网络学到的物理结构。

## II. 系统模型

考虑 TDD 模式下、工作于载频 100 GHz 的 XL-MIMO 系统：基站（base station，BS）配备 \(M\) 根天线的均匀线阵（uniform linear array，ULA）与 \(N_{\rm RF}\) 条 RF 链，服务 \(K\) 个单天线用户。模拟预编码器记为 \(\mathbf F_{\rm RF}\in\mathbb C^{M\times N_{\rm RF}}\)，数字预编码器记为 \(\mathbf F_{\rm BB}\in\mathbb C^{N_{\rm RF}\times K}\)。

**上行测量。** BS 在第 \(n\) 个感知时隙使用模拟合并矩阵 \(\boldsymbol\Phi^{(n)}\in\mathbb C^{K\times M}\) 接收上行导频。记 \(x_k\) 为用户 \(k\) 的导频符号（单位功率且已知），\(\mathbf h_k\in\mathbb C^{M\times 1}\) 为上行信道向量。用户 \(k\) 在 BS 处的合并信号为

$$
\mathbf y_{k,{\rm UL}}^{(n)}=\boldsymbol\Phi^{(n)}\left(\mathbf h_kx_k+\mathbf v_{k,{\rm UL}}^{(n)}\right),\tag{1}
$$

其中 \(\mathbf v_{k,{\rm UL}}^{(n)}\sim\mathcal{CN}(\mathbf 0,\sigma_n^2\mathbf I_M)\) 为独立同分布（i.i.d.）加性白高斯噪声（AWGN）。经合并后，有效噪声变为有色噪声，协方差为 \(\sigma_n^2\boldsymbol\Phi^{(n)}(\boldsymbol\Phi^{(n)})^H\)。由于导频已知且为单位功率，后文不失一般性省略 \(x_k\)。收集全部 \(K\) 个用户的接收信号，得到聚合信号矩阵 \(\mathbf Y_{\rm UL}^{(n)}\in\mathbb C^{K\times K}\)：

$$
\mathbf Y_{\rm UL}^{(n)}\triangleq\left[\mathbf y_{1,{\rm UL}}^{(n)},\mathbf y_{2,{\rm UL}}^{(n)},\cdots,\mathbf y_{K,{\rm UL}}^{(n)}\right]=\boldsymbol\Phi^{(n)}\mathbf H_{\rm UL}+\boldsymbol\Phi^{(n)}\mathbf V_{\rm UL}^{(n)},\tag{2}
$$

其中 \(\mathbf H_{\rm UL}\triangleq[\mathbf h_1,\ldots,\mathbf h_K]\) 聚合上行信道向量，\(\mathbf V_{\rm UL}^{(n)}=\left[\mathbf v_{1,{\rm UL}}^{(n)},\ldots,\mathbf v_{K,{\rm UL}}^{(n)}\right]\) 为上行噪声矩阵。把 \(N\) 个连续感知时隙的测量堆叠，得到全局观测矩阵 \(\mathbf Y_{\rm UL}\in\mathbb C^{NK\times K}\)：

$$
\mathbf Y_{\rm UL}\triangleq\left[\left(\mathbf Y_{\rm UL}^{(1)}\right)^T,\left(\mathbf Y_{\rm UL}^{(2)}\right)^T,\cdots,\left(\mathbf Y_{\rm UL}^{(N)}\right)^T\right]^T=\boldsymbol\Phi\mathbf H_{\rm UL}+\widetilde{\mathbf V}_{\rm UL},\tag{3}
$$

$$
\boldsymbol\Phi\triangleq\left[\left(\boldsymbol\Phi^{(1)}\right)^T,\left(\boldsymbol\Phi^{(2)}\right)^T,\cdots,\left(\boldsymbol\Phi^{(N)}\right)^T\right]^T,\tag{4}
$$

$$
\widetilde{\mathbf V}_{\rm UL}=\left[\left(\boldsymbol\Phi^{(1)}\mathbf V_{\rm UL}^{(1)}\right)^T,\cdots,\left(\boldsymbol\Phi^{(N)}\mathbf V_{\rm UL}^{(N)}\right)^T\right]^T.\tag{5}
$$

利用 TDD 信道互易性 [44]，定义信道矩阵 \(\mathbf H=\mathbf H_{\rm UL}=\mathbf H_{\rm DL}^H\triangleq[\mathbf h_1,\ldots,\mathbf h_K]\)。由上行观测，BS 设计模拟预编码器 \(\mathbf F_{\rm RF}\in\mathbb C^{M\times N_{\rm RF}}\) 与数字预编码器 \(\mathbf F_{\rm BB}\in\mathbb C^{N_{\rm RF}\times K}\)。用户 \(k\) 收到的下行信号为

$$
\mathbf y_{k,{\rm DL}}=\mathbf h_k^H\mathbf F_{\rm RF}\mathbf F_{\rm BB}\mathbf s+\mathbf v_{k,{\rm DL}}\triangleq\underbrace{\mathbf h_k^H\mathbf F_{\rm RF}\mathbf f_{{\rm BB},k}s_k}_{\text{信号}}+\underbrace{\sum_{i\in\mathcal K,i\ne k}\mathbf h_k^H\mathbf F_{\rm RF}\mathbf f_{{\rm BB},i}s_i}_{\text{干扰}}+\mathbf v_{k,{\rm DL}},\tag{6}
$$

其中 \(\mathbf s=[s_1,\ldots,s_K]^T\) 为发射符号向量，满足 \(\mathbb E[\mathbf s\mathbf s^H]=\mathbf I_K\)；总发射功率约束为 \(\|\mathbf F_{\rm RF}\mathbf F_{\rm BB}\|_F^2\le P_t\)，\(\mathbf v_{k,{\rm DL}}\sim\mathcal{CN}(0,\sigma_n^2)\) 为用户 \(k\) 处 AWGN。数字预编码器分解为 \(\mathbf F_{\rm BB}=[\mathbf f_{{\rm BB},1},\ldots,\mathbf f_{{\rm BB},K}]\)。堆叠全部 \(K\) 个用户的信号得到全局下行模型：

$$
\mathbf y_{\rm DL}=\mathbf H^H\mathbf F_{\rm RF}\mathbf F_{\rm BB}\mathbf s+\mathbf v_{\rm DL},\tag{7}
$$

其中 \(\mathbf v_{\rm DL}\sim\mathcal{CN}(\mathbf 0,\sigma_n^2\mathbf I_K)\)。用户 \(k\) 的信干噪比（signal-to-interference-plus-noise ratio，SINR）为

$$
{\rm SINR}_k=\frac{\left|\mathbf h_k^H\mathbf F_{\rm RF}\mathbf f_{{\rm BB},k}\right|^2}{\sum_{i\ne k}\left|\mathbf h_k^H\mathbf F_{\rm RF}\mathbf f_{{\rm BB},i}\right|^2+\sigma_n^2}.\tag{8}
$$

我们通过联合优化模拟与数字预编码器来最大化系统和速率：

$$
\underset{\mathbf F_{\rm RF},\mathbf F_{\rm BB}}{\text{maximize}}\quad R=\sum_{k=1}^{K}\log_2\left(1+{\rm SINR}_k\right),\tag{9a}
$$

$$
\text{subject to}\quad\left|[\mathbf F_{\rm RF}]_{i,j}\right|=\frac{1}{\sqrt M},\quad\forall i,j,\tag{9b}
$$

$$
\left\|\mathbf F_{\rm RF}\mathbf F_{\rm BB}\right\|_F^2\le P_t,\tag{9c}
$$

其中下标对应天线 \(i=1,\cdots,M\) 与 RF 链 \(j=1,\cdots,N_{\rm RF}\)。问题 (9) 因 (9b) 的硬件恒模约束以及 \(\mathbf F_{\rm RF}\) 与 \(\mathbf F_{\rm BB}\) 的多维耦合而非凸。解耦设计虽简化问题但常带来性能损失，而传统迭代联合优化计算复杂度很高（尤其 \(M\) 较大时）。这促使我们为 XL-MIMO 设计既能捕捉耦合波束赋形增益、又避免昂贵计算开销的高效策略。

近场与远场的边界通常由 Rayleigh 距离 \(R_{\rm Rayleigh}=2D^2/\lambda\) 刻画 [45]，其中 \(D\) 为阵列孔径、\(\lambda\) 为载波波长。该区域内传统平面波模型因无法刻画不可忽略的波前曲率而失效。为此我们采用球面波模型刻画孔径上的相位变化。用户 \(k\) 的信道向量建模为 [46]

$$
\mathbf h_k=\sqrt{\frac{M}{L_k}}\sum_{\ell=1}^{L_k}\alpha_{\ell,k}e^{-\mathrm{j}\frac{2\pi}{\lambda}r_{\ell,k}}\mathbf b(\theta_{\ell,k},r_{\ell,k}),\tag{10}
$$

其中 \(L_k\) 为强路径数（不失一般性假设各用户相同，即 \(L_k=L\)），\(\alpha_{\ell,k}\)、\(\theta_{\ell,k}\)、\(r_{\ell,k}\) 分别为第 \(\ell\) 条路径的复增益、到达角以及阵列中心到用户（或散射体）的距离。该表述给出统一框架，当传播距离足够大时自然退化为平面波模型 [47]。

ULA 的近场阵列响应向量 \(\mathbf b(\theta,r)\in\mathbb C^{M\times1}\) 定义为

$$
\mathbf b(\theta,r)=\frac{1}{\sqrt M}\left[e^{-\mathrm{j}\frac{2\pi}{\lambda}(r^{(0)}-r)},\cdots,e^{-\mathrm{j}\frac{2\pi}{\lambda}(r^{(M-1)}-r)}\right]^T,\tag{11}
$$

其中 \(r^{(m)}=\sqrt{r^2+\delta_m^2d^2-2r\delta_md\sin\theta}\) 为第 \(m\) 个天线元到目标的距离；\(d\) 为天线间距，\(\delta_m=(2m-M+1)/2\) 为相对阵列中心的天线位置索引，\(m=0,\ldots,M-1\)。

在多用户近场信道中，于角度—距离网格上联合估计球面波参数 \(\{\alpha_{\ell,k},\theta_{\ell,k},r_{\ell,k}\}\) 的搜索空间随总路径数 \(KL\) 增长。此外，球面波字典在距离维上高度相干，且对离格失配敏感，会降低估计鲁棒性。由于信道估计只是波束赋形的中间步骤，"先估计后设计"的流程还会遭受误差传播，使基于估计的设计对大阵列昂贵且对模型失配敏感。

## III. 完美 CSI 下的近场与远场间接 E2E 波束赋形

本节给出面向间接混合波束赋形的 E2E 框架。关键在于采用基于 variant-MMSE 的目标，使数字预编码器以闭式消去，从而稳定训练、并使模拟级可在混合约束下学习。我们给出所得复值网络架构与推理流程：预测的模拟预编码器与分析式数字解组合为最终混合波束赋形器。

### A. 基于和-MSE 最小化的解耦混合波束赋形

我们采用 variant-MMSE 准则 [48] 作为引导预编码器优化的主训练目标。相应地，均方误差（MSE）定义为发射信号向量 \(\mathbf s\) 与缩放接收向量 \(\beta^{-1}\mathbf y_{\rm DL}\) 之间的期望欧氏距离。总的和-MSE 为

$$
E\triangleq\mathbb E_{\mathbf s,\mathbf v_{\rm DL}}\left[\left\|\mathbf s-\beta^{-1}\mathbf y_{\rm DL}\right\|_2^2\right]=\operatorname{tr}\left(\mathbf I_K-\beta^{-1}\mathbf F_{\rm BB}^H\mathbf F_{\rm RF}^H\mathbf H-\beta^{-1}\mathbf H^H\mathbf F_{\rm RF}\mathbf F_{\rm BB}+\beta^{-2}\mathbf H^H\mathbf F_{\rm RF}\mathbf F_{\rm BB}\mathbf F_{\rm BB}^H\mathbf F_{\rm RF}^H\mathbf H+\beta^{-2}\sigma_n^2\mathbf I_K\right),\tag{12}
$$

其中缩放因子 \(\beta\in\mathbb R_+\) 用于对齐有效接收信号与源信号 \(\mathbf s\) 的幅度，从而便于在总功率约束下优化 [49], [50]。最小化该 MSE 可有效抑制信道衰落、MUI 与噪声污染。相应地，我们用和-MSE 作为替代目标，把联合混合波束赋形问题表述为

$$
\underset{\mathbf F_{\rm RF},\mathbf F_{\rm BB},\beta}{\text{minimize}}\quad E\tag{13a}
$$

$$
\text{s.t.}\quad\left|[\mathbf F_{\rm RF}]_{i,j}\right|=\frac{1}{\sqrt M},\quad\forall i,j,\qquad\left\|\mathbf F_{\rm RF}\mathbf F_{\rm BB}\right\|_F^2\le P_t.\tag{13b,13c}
$$

对固定 \(\mathbf F_{\rm RF}\)，优化问题化为只含一个功率约束的凸问题。由对 \(\mathbf F_{\rm BB}^*\) 的 KKT 平稳性条件，数字预编码器取闭式

$$
\mathbf F_{\rm BB}=\left(\mathbf F_{\rm RF}^H\mathbf H\mathbf H^H\mathbf F_{\rm RF}+\lambda_{\rm Lag}\mathbf F_{\rm RF}^H\mathbf F_{\rm RF}\right)^{-1}\mathbf F_{\rm RF}^H\mathbf H,\tag{14}
$$

其中 \(\lambda_{\rm Lag}\) 为功率约束对应的 Lagrange 乘子。由于 MSE 目标关于发射功率严格递减，最优时约束必然紧，故 \(\lambda_{\rm Lag}=K\sigma_n^2/P_t\) 对应 MMSE 判据。提取缩放项后，解可显式写为 \(\beta\) 与未归一化矩阵 \(\widetilde{\mathbf F}_{\rm BB}\) 之积：

$$
\mathbf F_{\rm BB}=\beta\left(\mathbf F_{\rm RF}^H\mathbf H\mathbf H^H\mathbf F_{\rm RF}+\frac{K\sigma_n^2}{P_t}\mathbf F_{\rm RF}^H\mathbf F_{\rm RF}\right)^{-1}\mathbf F_{\rm RF}^H\mathbf H=\beta\widetilde{\mathbf F}_{\rm BB}.\tag{15}
$$

将 \(\widetilde{\mathbf F}_{\rm BB}\) 代入有功功率约束，得到闭式缩放因子

$$
\beta=\sqrt{\frac{P_t}{\operatorname{tr}\left(\mathbf F_{\rm RF}\widetilde{\mathbf F}_{\rm BB}\widetilde{\mathbf F}_{\rm BB}^H\mathbf F_{\rm RF}^H\right)}}.\tag{16}
$$

把 \(\beta\) 与 \(\mathbf F_{\rm BB}\) 的闭式代回 (12)，得到只依赖模拟预编码器 \(\mathbf F_{\rm RF}\) 的集中 MSE 目标：

$$
E(\mathbf F_{\rm RF})=\operatorname{tr}\left(\left(\mathbf I_K+\frac{P_t}{K\sigma_n^2}\mathbf H^H\mathbf F_{\rm RF}\left(\mathbf F_{\rm RF}^H\mathbf F_{\rm RF}\right)^{-1}\mathbf F_{\rm RF}^H\mathbf H\right)^{-1}\right).\tag{17}
$$

当模拟预编码器近似半正交（即 \(\mathbf F_{\rm RF}^H\mathbf F_{\rm RF}\approx\mathbf I\)）时，(17) 退化为熟悉的 Wiener 或 MMSE 形式。然而在近场环境中维持该正交性十分困难——额外的距离维常在模拟波束之间引入显著的空间相关性。因此我们保留精确目标而不作近似。所得单变量优化问题表述为

$$
\underset{\mathbf F_{\rm RF}}{\text{minimize}}\ E(\mathbf F_{\rm RF})\quad\text{s.t.}\ \left|[\mathbf F_{\rm RF}]_{i,j}\right|=\frac{1}{\sqrt M},\ \forall i,j,\tag{18}
$$

该式有效实现了解耦：对固定模拟预编码器 \(\mathbf F_{\rm RF}\)，(15) 中的数字预编码器即凸子问题的最优解，只需再求非凸的模拟预编码问题。相比传统的分离两阶段方案，该表述在信号增强与干扰抑制之间取得更好平衡，且随用户数增长优势更明显——这在近场部署中尤为关键，因为即使角度相近、距离不同的用户也呈现强空间相关性。迭代优化算法虽能处理恒模约束而找到局部最优，但通常需要大量迭代，复杂度按 \(\mathcal O(N_{\rm iter}M^2K)\) 增长 [51]，对实时 ELAA 系统不可行。为实现实时推理且不牺牲性能，我们学习一个参数化映射 \(f_\Theta:\mathbf H\mapsto\mathbf F_{\rm RF}\)，直接由 CSI 预测模拟预编码器<sup>1</sup>（脚注 1：间接方法需要显式信道估计作为前提，这与第 IV 节的直接方法不同——后者把导频映射为波束赋形器而无需中间信道重建）。记 \(\Theta\) 为网络参数，我们最小化信道分布上的期望损失：

$$
\underset{\Theta}{\text{min}}\ \mathbb E_{\mathbf H}\left[E(\mathbf F_{\rm RF})\right],\quad\text{s.t.}\ \mathbf F_{\rm RF}=f_\Theta(\mathbf H),\tag{19}
$$

其中 \(f_\Theta(\cdot)\) 表示参数为 \(\Theta\) 的 DNN 映射。实践中期望由训练集 \(\mathcal T\)（大小 \(S\)）上的经验平均近似，即 \(\mathcal L(\Theta)\approx\frac{1}{S}\sum_{s=1}^{S}E\left(f_\Theta(\mathbf H^{(s)})\right)\)。该表述可经随机梯度下降（SGD）高效优化。

### B. 所提复值 E2E 网络架构

如图 2 所示，所提架构以信道为输入，由三个模块组成：用于虚拟感知的分组复卷积模块、用于潜在特征提取的共享逐用户复 MLP，以及以归一化层收尾以施加硬件约束的波束赋形输出模块。

**1）分组复卷积感知层。** 该层设计用于模拟 (3) 定义的上行测量过程，学习一集感知矩阵 \(\{\boldsymbol\Phi^{(n)}\}_{n=1}^{N}\) 作为可训练参数 \(\Theta\) 的一部分。结构上，每个卷积分组被分配给一个特定测量时隙以实现一个不同的感知矩阵，与物理的时域波束切换机制相匹配。相比全连接层，分组卷积固有的稀疏连接减少了参数空间并提供隐式正则化，从而提升抗噪鲁棒性——这对大规模天线阵列至关重要。提取的观测特征随后送入下游逐用户 MLP 学习潜在表示。

为在单个相干区间内适配跨 \(N\) 个测量时隙的时域处理，输入信道矩阵 \(\mathbf H^{(s)}\) 沿时间维广播，得到输入张量 \(\mathbf H^{(s)}\in\mathbb C^{N\times M\times K}\)，其中第 \(n\) 片 \(\widetilde{\mathbf H}_n^{(s)}=\mathbf H^{(s)}\) 表示静态信道状态。训练阶段，我们在输入上叠加 AWGN 张量 \(\mathbf V^{(s)}\in\mathbb C^{N\times M\times K}\)，其元素取自 i.i.d. 复分布 \(\mathcal{CN}(0,\sigma_a^2)\)，得到扰动后的输入 \(\widetilde{\mathbf H}_{\rm noisy}^{(s)}=\widetilde{\mathbf H}^{(s)}+\mathbf V^{(s)}\)。该数据增强策略迫使网络学习对信道扰动不变、鲁棒的噪声特征。注意噪声注入仅用于训练以提升泛化；在 PCSI 假设下的推理阶段被关闭。

与先前把感知权重限制为恒模约束下纯相位参数的深度学习感知架构 [38], [39] 不同，我们实现无偏置的复值分组卷积。放宽恒模约束显著增加了感知自由度，可学习天线信号的最优无约束线性组合；此外，禁用偏置项严格保持信号模型 (2) 的线性性。因此学习到的核恰好对应一集感知矩阵 \(\{\boldsymbol\Phi^{(n)}\}\)，有效捕捉跨测量时隙的时域波束切换动态。

为在标准深度学习框架中实现该运算，我们采用 [43] 提出的复值算术。具体地，复卷积由两个并行的实值分组卷积层合成，分别表示实部与虚部核，即 \((\mathbf W_r*\mathbf x_r-\mathbf W_i*\mathbf x_i)+\mathrm{j}(\mathbf W_r*\mathbf x_i+\mathbf W_i*\mathbf x_r)\)，并严格禁用偏置项。这确保该层作为纯线性算子，与间接和直接两种波束赋形方案都兼容。

我们把二维分组卷积的核尺寸配置为 \((M,1)\) 以覆盖整个天线阵列。于是对第 \(n\) 个测量时隙，第 \(i\) 个核表示复感知向量 \(\boldsymbol\phi_{n,i}\in\mathbb C^M\)（\(i=1,\ldots,K\)），对应感知矩阵 \(\boldsymbol\Phi^{(n)}\) 的第 \(i\) 行。当作用于含噪输入张量的第 \(n\) 片时，卷积运算相当于感知向量与信道的内积空间投影。数学上，第 \(i\) 个感知通道的输出为

$$
\mathbf y_{n,i}=\boldsymbol\phi_{n,i}*\left[\widetilde{\mathbf H}_{\rm noisy}^{(s)}\right]_{n,:,:}=\left[\boldsymbol\phi_{n,i}^T\mathbf h_1^{(s)},\ldots,\boldsymbol\phi_{n,i}^T\mathbf h_K^{(s)}\right]+\underbrace{\left[\boldsymbol\phi_{n,i}^T\tilde{\mathbf v}_{n,1}^{(s)},\ldots,\boldsymbol\phi_{n,i}^T\tilde{\mathbf v}_{n,K}^{(s)}\right]}_{\text{有效噪声}},\tag{20}
$$

其中 \(\tilde{\mathbf v}_{n,k}^{(s)}\triangleq[\widetilde{\mathbf V}^{(s)}]_{n,:,k}\) 为第 \(n\) 个时隙注入到用户 \(k\) 的噪声向量。聚合 \(K\) 个核即构成完整感知矩阵 \(\boldsymbol\Phi^{(n)}\)，不同分组学习独立矩阵以模拟时域波束切换。通过该设计，卷积输出严格对齐 (3) 中的上行信号模型 \(\mathbf Y_{\rm UL}\)，为后续波束赋形阶段提供物理可解释的输入。

为确保与全局上行信号模型 (3) 的结构一致性，所有测量时隙的输出按时间堆叠顺序聚合。设 \(\widetilde{\mathbf Y}_n^{(s)}\in\mathbb C^{K\times K}\) 为第 \(n\) 个样本时隙由分组卷积生成的特征矩阵，则逐时隙特征竖直堆叠为综合观测矩阵 \(\widetilde{\mathbf Y}^{(s)}\triangleq\left[(\widetilde{\mathbf Y}_1^{(s)})^T,\ldots,(\widetilde{\mathbf Y}_N^{(s)})^T\right]^T\in\mathbb C^{NK\times K}\)。最后该聚合矩阵按列切片以分离特定用户特征，作为后续逐用户复用网络的输入。

对比需要把输入展平为 \(\operatorname{vec}(\mathbf H)\in\mathbb C^{MK}\) 并学习跨独立用户冗余相关性的通用全连接感知层，所提分组卷积设计使用 \(N\times K\) 个长度为 \(M\) 的核进行并行逐用户感知。该做法通过强制用户间权重共享避免过参数化，形成紧凑模型架构，便于在资源受限硬件上部署。总之，分组卷积感知层充当可学习线性观测算子 \(f_{\boldsymbol\Phi}:\mathbf H\mapsto\widetilde{\mathbf Y}\)，参数化为矩阵集 \(\{\boldsymbol\Phi^{(n)}\}_{n=1}^{N}\)；该设计有效防止过参数化、提取抗噪特征，并严格遵循物理模型结构。

**2）共享逐用户复用模块。** 该模块使用共享复值 MLP 独立提取每个用户的潜在特征。具体地，对给定样本 \(s\)，用户 \(k\) 对应的输入取自聚合观测矩阵的列向量 \(\tilde{\mathbf y}_k^{(s)}\triangleq[\widetilde{\mathbf Y}^{(s)}]_{:,k}\in\mathbb C^{NK}\)。通过强制跨用户参数共享，该模块在用户数 \(K\) 上具有可扩展性，并与用户无关。该设计有效降低模型复杂度，同时能够学习泛化、判别性的信道表示。

MLP 由 \(P\) 个级联块组成，每块包含一个复值线性层、一个复批归一化（batch normalization，BN）层与一个复 Tanh 激活。记 \(\mathbf W_p\in\mathbb C^{D_p\times D_{p-1}}\) 与 \(\mathbf b_p\in\mathbb C^{D_p}\) 为第 \(p\) 层的权重矩阵与偏置向量。以 \(\mathbf x_0=\tilde{\mathbf y}_k^{(s)}\) 初始化输入，第 \(p\) 块运算为

$$
\hat{\mathbf x}_p={\rm BN}_p\left(\mathbf W_p\mathbf x_{p-1}+\mathbf b_p\right),\qquad \mathbf x_p={\rm CTanh}\left(\hat{\mathbf x}_p\right),\quad p=1,\ldots,P,\tag{21}
$$

其中复 Tanh 函数逐元素作用于实部与虚部，定义为

$$
{\rm CTanh}(x)\triangleq\tanh\left(\Re(x)\right)+\mathrm{j}\tanh\left(\Im(x)\right),\tag{22}
$$

其中 \(\tanh(t)=(e^t-e^{-t})/(e^t+e^{-t})\)。如图 3 所示，所提 CTanh 激活相比 CReLU 与 CPReLU 显著提升和速率。通过保持符号对称性并限制输出幅度，CTanh 有效缓解噪声环境下的梯度爆炸与消失问题，从而改善复值信号的学习稳定性与收敛性。

复 BN [43] 把每个复特征的实部与虚部视为二元向量进行白化，再做仿射变换：

$$
{\rm BN}_p(\mathbf x)\triangleq\boldsymbol\gamma_p\tilde{\mathbf x}+\boldsymbol\beta_p,\qquad \tilde{\mathbf x}=\mathbf C^{-\frac12}\left(\mathbf x-\mathbb E[\mathbf x]\right),\tag{23}
$$

其中 \(\mathbf C\) 为由实—虚向量 \([\Re(\mathbf x),\Im(\mathbf x)]^T\) 导出的 \(2\times2\) 协方差矩阵；\(\boldsymbol\gamma_p\in\mathbb R^{2\times2}\) 与 \(\boldsymbol\beta_p\in\mathbb C\) 分别为可学习缩放矩阵与偏置参数。

级联这 \(P\) 个块即为每个用户 \(k\) 建立逐用户映射 \(f_\zeta:\tilde{\mathbf y}_k\mapsto\mathbf x_P\)。该架构在实现稳定特征提取与维度扩展<sup>2</sup>（脚注 2：直接波束赋形模式下，网络以低维导频观测为输入，并为下游模块输出波束赋形相关特征）的同时，充当与用户无关的模拟波束赋形预处理。

**3）合并波束赋形输出网络。** 为有效管理用户间干扰，合并波束赋形输出网络聚合全部用户的潜在特征以产生模拟预编码器。记 \(\mathbf x_P^{(k,s)}\in\mathbb C^{D_P}\) 为用户 \(k\) 在样本 \(s\) 下的提取特征向量，把 \(K\) 个用户的特征向量按固定顺序拼接构成全局特征向量：

$$
\mathbf z^{(s)}\triangleq\left[\left(\mathbf x_P^{(1,s)}\right)^T,\ldots,\left(\mathbf x_P^{(K,s)}\right)^T\right]^T\in\mathbb C^{KD_P}.\tag{24}
$$

随后，由集合 \(\{\mathbf W_{\rm final},\mathbf b_{\rm final}\}\subset\Theta\) 参数化的复值线性层把 \(\mathbf z^{(s)}\) 映射为未归一化模拟预编码器的向量化表示：

$$
\operatorname{vec}\left(\widetilde{\mathbf F}_{\rm RF}^{(s)}\right)=\mathbf W_{\rm final}\mathbf z^{(s)}+\mathbf b_{\rm final}\in\mathbb C^{MN_{\rm RF}},\tag{25}
$$

其中 \(\mathbf W_{\rm final}\in\mathbb C^{MN_{\rm RF}\times KD_P}\) 与 \(\mathbf b_{\rm final}\in\mathbb C^{MN_{\rm RF}}\) 为权重矩阵与偏置向量。为满足硬件恒模约束，我们对每个元素施加归一化函数，同时保持预编码向量的单位范数功率约束：

$$
\mathcal N_\varepsilon(\mathbf X)\triangleq\frac{\mathbf X\oslash\left(|\mathbf X|+\varepsilon\right)}{\sqrt M},\qquad\varepsilon>0,\tag{26}
$$

其中 \(\oslash\) 表示 Hadamard 除法，\(|\mathbf X|\) 为逐元素模矩阵。引入正则项 \(\varepsilon\) 以提升数值稳定性、避免训练中的除零错误。于是最终模拟预编码器为

$$
\mathbf F_{\rm RF}^{(s)}=\mathcal N_\varepsilon\left(\widetilde{\mathbf F}_{\rm RF}^{(s)}\right)\triangleq f_{\rm final}\left(\mathbf z^{(s)};\mathbf W_{\rm final},\mathbf b_{\rm final}\right),\tag{27}
$$

它在保留未归一化矩阵 \(\widetilde{\mathbf F}_{\rm RF}^{(s)}\) 相位信息的同时，把每个元素的幅度归一化为 \(1/\sqrt M\)。该联合映射机制实现了跨 RF 链的空间波束显式协调，对后续数字预编码前的 MUI 抑制至关重要。

### C. 基于深度学习的近场与远场间接多用户混合波束赋形

借助解耦优化框架，最优数字预编码器由 KKT 闭式解替代，从而得到依赖 \(\mathbf F_{\rm RF}\) 的和-MSE 目标。与 (19) 中的问题表述一致，所提复值网络通过最小化如下损失函数训练：

$$
\mathcal L(\mathbf F_{\rm RF})=\operatorname{tr}\left(\left(\mathbf I_K+\frac{P_t}{K\sigma_n^2}\mathbf H^H\mathbf F_{\rm RF}\left(\mathbf F_{\rm RF}^H\mathbf F_{\rm RF}\right)^{-1}\mathbf F_{\rm RF}^H\mathbf H\right)^{-1}\right),\tag{28}
$$

该损失关于 \(\mathbf F_{\rm RF}\) 可微，前提是系统满足 \(N_{\rm RF}\ge K\) 且 \(\mathbf F_{\rm RF}\) 保持满列秩。在训练与推理阶段均假设 PCSI 可用，故由 (28) 定义的损失可直接用信道矩阵 \(\mathbf H\) 评估。由于 \(\mathbf H\) 既作为神经网络输入、又作为损失函数参数，训练不需要监督标签。对由 \(S\) 个信道实现组成的小批量 \(\{\mathbf H^{(s)}\}_{s=1}^{S}\)，经验优化问题表述为

$$
\underset{\Theta}{\text{min}}\ \frac{1}{S}\sum_{s=1}^{S}\mathcal L\left(\mathbf F_{\rm RF}^{(s)}\right)\quad\text{s.t.}\ \mathbf F_{\rm RF}^{(s)}=f_\Theta\left(\mathbf H^{(s)}\right),\tag{29}
$$

其中 \(f_\Theta(\cdot)\) 为参数为 \(\Theta\) 的 E2E 神经网络映射，它产生受恒模约束的模拟预编码器。

**算法 1：基于深度学习的近场与远场间接多用户混合波束赋形（DL-IMHB）**

- 输入：由 PCSI 或估计得到的信道矩阵 \(\mathbf H\in\mathbb C^{M\times K}\)、噪声功率 \(\sigma_n^2\)、用户数 \(K\)、最大发射功率 \(P_t\)、最优网络参数 \(\Theta^\star\)。
- 输出：最优模拟预编码器 \(\mathbf F_{\rm RF}^\star\in\mathbb C^{M\times N_{\rm RF}}\) 与数字预编码器 \(\mathbf F_{\rm BB}^\star\in\mathbb C^{N_{\rm RF}\times K}\)。
1. 用预训练参数 \(\Theta^\star\) 初始化神经网络。
2. 经前向传播生成恒模归一化模拟预编码器：\(\mathbf F_{\rm RF}^\star\leftarrow f_{\Theta^\star}(\mathbf H)\)。
3. 给定 \(\mathbf H\) 与 \(\mathbf F_{\rm RF}^\star\)，由闭式解 (15) 计算未归一化数字预编码器 \(\widetilde{\mathbf F}_{\rm BB}\)。
4. 按 (16) 导出功率缩放因子 \(\beta\) 以满足总发射功率约束。
5. 返回最终混合波束赋形矩阵：\(\mathbf F_{\rm RF}^\star\) 与 \(\mathbf F_{\rm BB}^\star\leftarrow\beta\widetilde{\mathbf F}_{\rm BB}\)。

训练完成后，所提 DL-IMHB 的推理流程见算法 1。该框架中，估计信道矩阵 \(\mathbf H\) 作为显式输入，用于生成模拟预编码器 \(\mathbf F_{\rm RF}\) 与随后的闭式数字预编码器。这种依赖关系刻画了间接方法的本质：在 PCSI 实例化时，它为相应的、基于测量的直接波束赋形方案建立了理论性能上界。尽管同一架构支持两种模式，\(N\) 在间接与直接设定下含义不同：直接模式中 \(N\) 决定空口导频开销；相反，间接模式中 \(N\) 控制虚拟感知前端的维度，与导频预算无关。

如上所述，间接策略利用显式信道知识，以 \(\mathbf H\) 为输入生成 \(\mathbf F_{\rm RF}\)，并解析导出数字预编码器。然而在无显式 CSI 的直接波束赋形场景中，主要目标转为设计能适应近场与远场快速信道起伏的鲁棒架构，从而即使在高噪声环境下也能以短导频支持快速多用户接入。所提框架可适配不同的感知维度 \(N\)：较大 \(N\) 提升感知自由度，在导频资源充裕时获得更优频谱效率；较小 \(N\) 则优先低时延运行与最小开销。

## IV. 短导频下的鲁棒直接 E2E 混合波束赋形

本节研究直接混合波束赋形范式，面向推理阶段瞬时 CSI 不可得的场景。基于第 III 节建立的统一架构，我们部署所提分组复卷积感知层以实现隐式信道特征提取。与依赖显式信道输入的间接方法不同，直接范式采用不同的推理机制：由分组卷积层学习到的核被提取并映射为物理模拟感知矩阵的配置。该策略让硬件前端在物理上采集导频观测并直接馈送接收信号到后续推理网络，从而避免推理期间的全维信道显式估计。

### A. 问题重述

与第 III 节的和-MSE 优化不同，直接波束赋形范式假设推理阶段显式信道矩阵 \(\mathbf H\) 不可得。因此网络只以经感知接口获得的上行测量矩阵 \(\mathbf Y_{\rm UL}\) 为输入。为把物理感知过程纳入学习框架，初始感知阶段被参数化为实现测量运算的可学习分组卷积层：

$$
\mathbf Y_{\rm UL}=f_{\boldsymbol\Phi}\left(\mathbf H,\widetilde{\mathbf V}_{\rm UL}\right),\qquad f_{\boldsymbol\Phi}\left(\mathbf H,\widetilde{\mathbf V}_{\rm UL}\right)\equiv\mathcal G_{\boldsymbol\Phi}(\mathbf H)+\widetilde{\mathbf V}_{\rm UL},\tag{30}
$$

其中 \(\mathcal G_{\boldsymbol\Phi}(\cdot)\) 表示分组卷积诱导的线性投影（与 (3) 一致），\(\widetilde{\mathbf V}_{\rm UL}\) 与其在 (5) 中的定义一致。学习 \(\boldsymbol\Phi\) 等价于把物理测量设计与后续波束赋形网络联合优化。

下游波束赋形网络由共享逐用户 MLP 模块 \(f_\zeta(\cdot)\) 与含恒模归一化层的合并输出头 \(f_{\rm final}(\cdot)\) 组成。参数集 \(\Theta_{\rm NCSI}\triangleq\{\boldsymbol\Phi,\zeta,\mathbf W_{\rm final},\mathbf b_{\rm final}\}\) 通过最小化第 III 节的期望和-MSE 目标联合优化，其中模拟预编码器由上行测量获得：

$$
\underset{\Theta_{\rm NCSI}}{\text{minimize}}\ \mathbb E_{\mathbf H,\widetilde{\mathbf V}_{\rm UL}}\left[\mathcal L(\mathbf F_{\rm RF};\mathbf H)\right],\quad\text{s.t.}\ \mathbf Y_{\rm UL}=f_{\boldsymbol\Phi}\left(\mathbf H,\widetilde{\mathbf V}_{\rm UL}\right),\ \mathbf F_{\rm RF}=f_{\rm final}\left(f_\zeta(\mathbf Y_{\rm UL})\right),\tag{31}
$$

其中 \(\mathcal L(\mathbf F_{\rm RF};\mathbf H)\) 对应 (28) 定义的和-MSE 度量。关键在于：虽然训练时用信道实现 \(\mathbf H\) 评估损失，它并不馈入网络，仅作为监督。推理阶段系统完全基于采集的测量 \(\mathbf Y_{\rm UL}\) 预测模拟预编码器 \(\mathbf F_{\rm RF}\)，实现无瞬时 CSI 的盲运行。

两个实现细节澄清该感知接口。第一，感知矩阵 \(\boldsymbol\Phi\) 不受模拟恒模约束，因为它表征 RF 感知与数字基带处理的复合效果；这增大了感知自由度，同时保持下游模拟预编码器满足恒模。第二，分组卷积参数化与跨天线线性投影相匹配。训练时省略偏置项以保持 (3) 中的线性感知模型。

### B. 有效信道估计与数字波束赋形协议

在直接波束赋形范式中，一个根本挑战是：由于缺乏显式 CSI，未归一化数字预编码器 \(\widetilde{\mathbf F}_{\rm BB}\) 无法由完整信道 \(\mathbf H\) 导出。为此我们采用如图 4 所示的多阶段信令协议，便于估计低维等效信道 \(\mathbf H_{\rm eq}\triangleq\mathbf H^H\mathbf F_{\rm RF}\in\mathbb C^{K\times N_{\rm RF}}\) 以支持后续数字预编码器构造。这里 \(N\) 为用于模拟推理的上行感知时隙数，\(I\) 为用于估计等效信道的重复块数。

在 DNN 生成恒模归一化模拟预编码器 \(\mathbf F_{\rm RF}^\star\)（如第 IV-B 节所述）后，该矩阵被固定并作为上行模拟合并器部署。利用含 \(I\) 个重复块（如 TDMA）的传输协议，第 \(i\) 个块的基带观测矩阵为

$$
\overline{\mathbf Y}_{\rm UL}^{(i)}=\left(\mathbf F_{\rm RF}^\star\right)^H\left(\mathbf H+\mathbf V_{\rm UL}^{(i)}\right)\in\mathbb C^{N_{\rm RF}\times K},\qquad i=1,\ldots,I,\tag{32}
$$

其中 \(\overline{\mathbf Y}_{\rm UL}^{(i)}\) 的第 \(k\) 列为时域隔离的用户 \(k\) 对应接收导频信号。对这 \(I\) 次重复的观测求平均，得到估计的等效信道：

$$
\widehat{\mathbf H}_{\rm eq}=\left(\frac{1}{I}\sum_{i=1}^{I}\overline{\mathbf Y}_{\rm UL}^{(i)}\right)^H\in\mathbb C^{K\times N_{\rm RF}}.\tag{33}
$$

对 \(I\) 次重复求平均可降低估计噪声，并提供实用的精度—时延折中。基于估计等效信道 \(\widehat{\mathbf H}_{\rm eq}\)，与 variant-MMSE 准则一致的数字预编码器闭式解为

$$
\widehat{\widetilde{\mathbf F}}_{\rm BB}=\left(\widehat{\mathbf H}_{\rm eq}^H\widehat{\mathbf H}_{\rm eq}+\frac{K\sigma_n^2}{P_t}\mathbf F_{\rm RF}^H\mathbf F_{\rm RF}\right)^{-1}\widehat{\mathbf H}_{\rm eq}^H.\tag{34}
$$

数值实现中，Gram 矩阵求逆按 \((\mathbf A^H\mathbf A+\varepsilon\mathbf I)^{-1}\) 正则化，其中小阻尼因子 \(\varepsilon>0\)；系统通过 Cholesky 分解配合前向与后向替换求解以避免显式求逆。最终数字预编码器再经 (16) 中 \(\hat\beta\) 的功率归一化获得。

整合感知前端、DNN 推理与上述数字波束赋形阶段的完整操作流程见算法 2。协议中的导频重复次数 \(I\) 可固定用于基准测试，或依据收敛阈值 \(\epsilon\) 自适应确定。此外，数字预编码器可允许由 (34) 初始化的 WMMSE 算法迭代精化。

**算法 2：基于深度学习的近场与远场直接多用户混合波束赋形（DL-DMHB）**

- 输入：噪声功率 \(\sigma_n^2\)、用户数 \(K\)、最大发射功率 \(P_t\)、感知导频长度 \(N\)、重复块数 \(I\)、已训练参数集 \(\Theta^\star=\{\boldsymbol\Phi^\star,\zeta^\star,\mathbf W_{\rm final}^\star,\mathbf b_{\rm final}^\star\}\)。
- 输出：模拟预编码器 \(\mathbf F_{\rm RF}^\star\in\mathbb C^{M\times N_{\rm RF}}\) 与估计数字预编码器 \(\widehat{\mathbf F}_{\rm BB}^\star\in\mathbb C^{N_{\rm RF}\times K}\)。
1. 用 \(\boldsymbol\Phi^\star\) 初始化感知接口，用其余参数 \(\Theta^\star\setminus\boldsymbol\Phi^\star\) 初始化推理网络。
2. 对 \(n=1\) 到 \(N\)：按子矩阵 \(\boldsymbol\Phi^{(n)}\) 配置感知合并权重；接收全部 \(K\) 个用户的上行 TDMA 导频；按 (2) 获取测量快照 \(\mathbf Y_{\rm UL}^{(n)}\)。
3. 按 (3) 构造聚合测量矩阵 \(\mathbf Y_{\rm UL}\)。
4. 经前向传播生成恒模归一化模拟预编码器：\(\mathbf F_{\rm RF}^\star\leftarrow f_{\rm final}\left(f_\zeta(\mathbf Y_{\rm UL})\right)\)。
5. 将 \(\mathbf F_{\rm RF}^\star\) 部署为固定上行模拟合并器。
6. 对 \(i=1\) 到 \(I\)：按 (32) 记录经 RF 合并后的基带观测 \(\overline{\mathbf Y}_{\rm UL}^{(i)}\)。
7. 按 (33) 的平均计算等效信道估计 \(\widehat{\mathbf H}_{\rm eq}\)。
8. 经 Tikhonov 正则化与基于 Cholesky 的线性求解，用 (34) 导出未归一化数字预编码器 \(\widehat{\widetilde{\mathbf F}}_{\rm BB}\)。
9. 返回最终混合波束赋形器：\(\mathbf F_{\rm RF}^\star\) 与 \(\widehat{\mathbf F}_{\rm BB}^\star\leftarrow\hat\beta\widehat{\widetilde{\mathbf F}}_{\rm BB}\)。

## V. 数值结果与讨论

本节给出所提 PCSI 驱动的 DL-IMHB 与测量驱动的 DL-DMHB 在典型近场与远场信道条件下的数值结果，并与现有基线以及全数字或 PCSI 辅助的参考方案比较。

### A. 系统设置

考虑工作于 TDD 模式、载频 100 GHz 的 XL-MIMO 系统，基站采用 128 天线 ULA。除另有说明，RF 链数设为 \(N_{\rm RF}=K=4\)。上行信道模型遵循 (10)，天线间距为半波长。对每个信道实现，复路径增益取自 \(\mathcal{CN}(0,1)\)，角度余弦在 \([-1,1]\) 上均匀分布，路径距离在 5 m 到 \(r_{\max}\) 上均匀分布（除另有说明 \(r_{\max}=80\) m）。这些设置下对应 Rayleigh 距离约 24.19 m，因此同时包含近场与远场传播区间。总发射功率与参考接收功率归一化为 1，从而使上下行 SNR 相同：\({\rm SNR}_{\rm UL}={\rm SNR}_{\rm DL}=10\log_{10}(1/\sigma_n^2)\)。

针对不同系统配置（用户数 \(K\)、强路径数 \(L\)、最大路径距离 \(r_{\max}\)）构建独立数据集。每个数据集含 20,000 个独立多用户信道实现，按 70%、15%、15% 划分为训练、验证与测试集。深度学习算法在 PyTorch 中实现，使用 NVIDIA GeForce RTX 4070 GPU。早停监控平均验证和速率。超参数优化使用 Optuna 框架 [52]，具体配置见表 I。共享复用模块实例化为 \(P=3\) 个级联块，特征维度依次为 \(D_1=512\)、\(D_2=256\)、\(D_3=128\)。

**表 I（原文 Table I）：仿真实验超参数配置**

| 超参数 | 取值 |
|---|---|
| 初始学习率 | \(5\times10^{-4}\) |
| 批大小 | 1024 |
| 优化器 | Adam |
| 学习率调度器 | ReduceLROnPlateau |
| 早停阈值 | \(1\times10^{-4}\) |
| 调度器阈值 | \(1\times10^{-4}\) |
| 早停耐心 | \(3\times10^{2}\) |
| 调度器耐心 | \(2\times10^{2}\) |
| 调度器缩放因子 | 0.5 |

### B. 基线与计算复杂度

基线按算法 1 的 PCSI 间接范式与算法 2 的测量驱动直接范式分组。性能指标包括 (9a) 定义的和速率与 (17) 导出的 variant-MMSE 目标；具体地，图 5(b) 中后者以 \(10\log_{10}(E(\mathbf F_{\rm RF}))\) dB 的对数尺度可视化，以便观察优化目标。此外，为评估可扩展性，图 6 与图 9 使用归一化逐用户平均和速率 \(R/K\)。

我们在假设 \(N_{\rm RF}=K\)、\(M\gg\{K,N,L,S\}\) 且忽略低阶项的前提下分析推理计算复杂度。间接模式下分组卷积感知模块贡献 \(\mathcal O(NK^2M)\) 项；直接模式中测量在空口完成，该模块不执行。对 P-SOMP 与 P-SIGW，我们排除字典白化、码本构建等离线成本。表 II 汇总各算法在其特定配置下的主导阶推理复杂度与相应平均运行时间；表 III 进一步给出生命周期计算复杂度分析。

**表 II（原文 Table II）：计算复杂度、运行时间与配置比较**

| 设置 | 算法 | 计算复杂度 | 平均运行时间 (ms) | 配置 |
|---|---|---|---|---|
| PCSI | DL-IMHB | \(\mathcal O\left((N+D_P)K^2M+K\sum_{p=1}^{P}D_{p-1}D_p\right)\) | 0.68（GPU）/ 2.89（CPU） | \(N=8\) |
| PCSI | SU-DNN | \(\mathcal O\left(NK^2M+K\sum_{p=1}^{P}D_{p-1}D_p\right)\) | 0.44（GPU）/ 1.72（CPU） | \(N=8\) |
| PCSI | TH-HMP | \(\mathcal O\left(N_{\rm iter}K^2M\right)\) | 5.82（CPU） | \(N_{\rm iter}=10\) |
| PCSI | LDMA | \(\mathcal O\left(SKM+K^2M\right)\) | 26.57（CPU） | \(\beta=0.4\) |
| NCSI | DL-DMHB | \(\mathcal O\left(D_PK^2M+K\sum_{p=1}^{P}D_{p-1}D_p\right)\) | 0.53（GPU）/ 2.31（CPU） | \(N=12\)，\(I=4\) |
| NCSI | SU-DNN | \(\mathcal O\left(K\sum_{p=1}^{P}D_{p-1}D_p\right)\) | 0.42（GPU）/ 1.31（CPU） | \(N=12\)，\(I=4\) |
| NCSI | P-SOMP | \(\mathcal O\left(LSNKM\right)\) | 13.45（CPU） | \(N=24\)，\(\beta=1\) |
| NCSI | P-SIGW | \(\mathcal O\left(LSNKM+N_{\rm iter}L^2NKM\right)\) | 464.83（CPU） | \(N=24\)，\(\beta=1\)，\(N_{\rm iter}=20\) |

**表 III（原文 Table III）：生命周期计算复杂度分析**

| 指标 | 所提 DL-DMHB | 所提 DL-IMHB | 无 CSI 的 SU-DNN | 有 CSI 的 SU-DNN |
|---|---|---|---|---|
| 可学习参数 | 0.92 M | 0.90 M | 0.39 M | 0.37 M |
| 存储占用 | ~3.7 MB | ~3.6 MB | ~1.6 MB | ~1.5 MB |
| 训练时间 | ~24.4 min | ~29.1 min | ~11.5 min | ~9.8 min |
| 理论 FLOPs | 8.21 M | 8.03 M | 6.11 M | 5.82 M |

TH-HMP 需要约 \(N_{\rm iter}\approx10\) 次迭代才能匹配 DL-IMHB 在 \(N=8\) 时的速率，导致同等设置下更高时延（见表 II）。

### C. 间接混合波束赋形性能

图 5 给出和速率（图 5(a)）与和-MSE（图 5(b)）随"算法特定复杂度参数"的变化：DL-IMHB 与 SU-DNN 取虚拟测量数 \(N\)，LDMA 取距离环数 \(S\)，TH-HMP 取迭代次数 \(N_{\rm iter}\)。

在学习类方法中，DL-IMHB 在两个指标上都持续优于 SU-DNN。例如 \(N=8\) 时，DL-IMHB 达到 **29.42 bps/Hz**，相比 SU-DNN 提升约 **3.07 bps/Hz**；同时其和-MSE 更低，为 **−15.75 dB**（SU-DNN 为 **−13.28 dB**）。这说明 variant-MMSE 目标有助于模拟映射网络考虑多用户干扰，尤其在 \(N\) 较小时。对传统基线：LDMA 较早饱和且和-MSE 下限明显更高，这与其在格量化一致；TH-HMP 在迭代足够多时可逼近相近性能，但需要约 \(N_{\rm iter}\approx10\) 次迭代才能匹配 DL-IMHB 在 \(N=8\) 时的速率，在可比设置下导致更高时延（见表 II）。

图 6 通过给出可达和速率随用户数 \(K\) 的变化研究系统可扩展性。为在计算量上公平比较，迭代 TH-HMP 在受限低时延设置 \(N_{\rm iter}\in\{1,2\}\) 下评估，同时给出完全收敛但计算上不可行（\(N_{\rm iter}=200\)）的对照。DL-IMHB 在所考虑用户范围内相对单次迭代 TH-HMP 与基于码本、\(\beta=0.4\) 的 LDMA 保持清晰的和速率优势。虽然两次迭代的 TH-HMP 在较低用户负载下略显优势，但随着系统密度增加，所提框架表现出更优的可扩展性：当 \(K=8\) 时，DL-IMHB 达到 **6.36 bps/Hz**，而 \(N_{\rm iter}=2\) 的 TH-HMP 为 **5.73 bps/Hz**，同时计算开销降低约 **1.3 倍**。当 \(K\) 较大时，TH-HMP 的小迭代预算不足以抑制多用户干扰；相反，所提 variant-MMSE 表述给出 KKT 导出的闭式数字预编码器，且合并输出网络实现跨用户的协调波束赋形。总体而言，所提框架随用户数良好扩展，并以单次前向传播逼近近最优性能，适用于实时间接混合波束赋形。

### D. 直接混合波束赋形性能

图 7 从导频效率（图 7(a)）与 SNR 鲁棒性（图 7(b)）比较直接波束赋形方案。图 7(a) 中 DL-DMHB 在测量驱动方法中取得最高和速率，并随导频开销 \(N+I\) 增大逐步缩小与 PCSI 辅助 TH-HMP 基准的差距。在导频受限的 \(N+I=6+2\) 设置下，DL-DMHB 达到 **26.07 bps/Hz**，比 SU-DNN 高 **3.3 bps/Hz**；相反，稀疏恢复基线在相同导频预算下明显退化，例如 P-SIGW 仅达 **14.29 bps/Hz**，这与其对网格失配的敏感性一致。图 7(b) 表明在固定导频预算下，DL-DMHB 在所考虑整个 SNR 范围内相对 SU-DNN 保持稳定优势；此外使用 6+2 导频时，DL-DMHB 在中高 SNR 区间优于 24 导频的 P-SIGW 基线——例如 10 dB 时 DL-DMHB 为 26.07 bps/Hz，而 P-SIGW 为 **24.78 bps/Hz**。这些观察说明 E2E 设计提升了短导频下的鲁棒性，并缓解了解耦处理与稀疏恢复带来的性能退化。

图 8 通过绘制可达和速率随强路径数 \(L\) 的变化，考察所提与基线方案对信道稀疏度的鲁棒性（\(L\) 从稀疏区 \(L=1\) 到散射丰富区 \(L=15\)；深度学习方法配置 \(N=12\) 个感知导频、\(I=4\) 个等效信道估计导频）。在 \(L\le3\) 的稀疏区，所有方法都因多径分集增强而和速率上升；随 \(L\) 增大、信道散射更丰富，各算法因建模假设不同而性能分化。P-SOMP 在 \(L>7\) 后迅速退化，这与网格失配及稀疏性假设失效一致；P-SIGW 下降更平缓，因为离格精化部分缓解了失配；SU-DNN 基线在 \(L\approx9\) 附近出现性能瓶颈并在高 \(L\) 区趋于稳定，因为它依赖统计特征提取而非显式路径分解。在 \(N=12\)、\(I=4\) 配置下，DL-DMHB 在 \(L=15\) 时仍保持 **27.03 bps/Hz**，比 SU-DNN 高约 **3.5 bps/Hz**。

图 9 给出逐用户平均和速率随用户数从 2 增至 8 的变化。随用户负载增加，逐用户速率因多用户干扰增强而下降，这与间接波束赋形的结果一致。SU-DNN 架构需要 RF 链数等于用户数才能维持固定网络维度，因此在存在冗余 RF 链时无法评估；相反，DL-DMHB 直接在有效测量上运行，可在 RF 链数多于用户数时使用。在 6+2 导频预算、2 个活跃用户下，把 RF 链数增至 \(N_{\rm RF}=K+2\) 可使逐用户速率从 **6.63 bps/Hz** 提升到 **7.17 bps/Hz**。在 \(N_{\rm RF}=K\) 的标准配置、8 个用户下，所提 6+2 方案达到 **5.67 bps/Hz** 的逐用户速率，仍高于 24 导频 P-SIGW 基线的 **4.89 bps/Hz**。

图 10 通过把最大路径距离 \(r_{\max}\) 从 10 m 变化到 320 m，考察针对用户分布范围的鲁棒性，覆盖极端近场到混合近—远场条件。结果表明，显式信道重建方法在极短距离场景中越来越吃力，而 DL-DMHB 在整个距离范围内保持稳定性能。在 \(r_{\max}=10\) m 时，所提 12+4 配置达到 **28.72 bps/Hz**，比 SU-DNN 基线高出 2 bps/Hz 以上；相反，极化域稀疏恢复基线（P-SOMP 与 P-SIGW）在极端近场明显退化。例如 \(r_{\max}=10\) m 时，24 导频的 P-SIGW 仅达 **16.01 bps/Hz**，而所提 6+2 配置达到 **25.73 bps/Hz**。该趋势与"短距离下严重能量扩散导致稀疏性假设失效"一致。一个反常现象出现在 \(r_{\max}=10\) m 处：P-SIGW 略差于 P-SOMP，说明在强近场曲率下基于梯度的距离精化不稳定。当 \(r_{\max}\) 增大趋向平面波区间时，稀疏恢复基线性能逐步恢复；但 DL-DMHB 始终保有清晰优势，且所需导频资源显著更少。

最后，我们把评估扩展到均匀平面阵（uniform planar array，UPA），研究所提框架的可扩展性与对实际 XL-MIMO 阵列几何的泛化性。图 11 给出从小规模 \(8\times8\) 阵列到大规模 \(32\times16\) 阵列的各种天线配置下的和速率性能。所提 DL-DMHB 无需架构修改即可有效适配 UPA 结构，展现出对标准 ULA 之外阵列几何变化的鲁棒性。随着天线数 \(M\) 增至 512，系统性能因阵列增益提升而单调改善。值得注意的是，即使在 \(M=512\) 时，所提模型仍稳定收敛，并以 **6+2** 导频达到 **27.40 bps/Hz**，优于 SU-DNN 基线的 **26.67 bps/Hz**。虽然在最小导频开销下因阵列增益导致容量饱和而使差距略有收窄，但 DL-DMHB 在 12+4 设置下将领先扩大至 **2.6 bps/Hz**。

### E. 学习到的感知与特征的可解释性

为洞察所提网络在 E2E 性能之外学到了什么，我们可视化初始上行感知阶段的有效感知方向图，以及共享逐用户复用模块提取的学习到的复值特征。

我们首先把学习到的权重解释为有效感知向量。需要注意两种比较方案在结构上的差异：对所提 DL-DMHB，有效感知矩阵由模拟 RF 感知与数字基带聚合的相互作用合成，形成无约束的复值权重；相反，SU-DNN 基线依赖纯相位的模拟线性层。把这些向量在角度域 \(\theta\in[-1,1]\) 与距离域 \(r\in[5,40]\) m 上与近场球面波码本做相关，得到图 12 所示的空间响应剖面。SU-DNN 基线表现出僵硬的感知行为，能量主要集中于 \(\theta\approx0\) 的侧射方向附近；进一步分析表明该基线缺乏波束分集，倾向于冗余地聚焦于固定方向而并非进行空间扫描。相反，所提 DL-DMHB 产生多波瓣方向图，覆盖更宽的角度范围。一个值得注意的现象是：感知能量在角度边缘 \(|\theta|\approx1\) 处被抑制，说明网络学会了把感知资源集中在阵列增益显著的有效扇区内，同时避免在有效孔径减小的掠射方向上浪费能量。

我们进一步评估距离相关的感知能力：沿 \(\theta\) 积分波束响应，得到图 13 的距离边缘剖面。SU-DNN 的边缘增益随 \(r\) 增大明显衰减，而 DL-DMHB 在相同范围内保持更平坦的剖面，说明所学感知前端在近场与远场波前上都有更好的泛化能力；后续的用户分离由复用模块提取的特征完成。

最后，我们用复主成分分析（principal component analysis，PCA）探究复用模块中共享 MLP 学到的表示。我们设计一个受控实验：使用固定角度 \(\theta=0\)、距离均匀采样的单路径球面波信道，并把信道复增益归一化以隔离导向矢量 \(\mathbf b(\theta,r)\) 的结构变化。图 14 在复平面上可视化第一复主成分（PC1）及其在幅度空间中的嵌入。如图 14(a) 所示，投影后的特征点形成平滑的弧状轨迹，随距离 \(r\) 变化而与近场相位演化平滑对应。随着距离 \(r\) 增大，阵列表征的二次相位项（与 \(1/r\) 成正比）减弱，使信道向量在高维观测空间中连续旋转；网络捕捉到该相位演化，并将其映射为潜空间中的连续流形。此外，图 14(b) 显示前两个主成分幅度之间的非线性关系；沿 PC1 的投影幅度变化表明信道流形的几何是弯曲的。这些结果表明，所学特征捕捉了与距离相关的相位特性，有助于区分具有不同波前曲率的用户。

### F. 讨论与未来工作

**1）扩展到宽带 OFDM 与波束斜视。** 虽然本文假设窄带信道，所提框架在理论上可扩展到宽带 OFDM 系统。在混合架构中，模拟预编码器 \(\mathbf F_{\rm RF}\) 被约束为频率平坦，因此所提神经网络架构无需对输出层做结构修改——它预测一个在所有 \(N_{\rm sc}\) 个子载波上共享的 \(\mathbf F_{\rm RF}\)。频率选择性与波束斜视效应由数字预编码器处理，后者按子载波使用导出的 KKT 闭式解计算。训练时损失函数可表述为子载波平均和速率；通过优化该聚合目标，网络学到能在带宽内平衡波束斜视效应的鲁棒 \(\mathbf F_{\rm RF}\)，同时避免逐子载波神经网络处理的高复杂度。

**2）实际硬件损伤。** 虽然本文假设理想硬件，实际部署面临量化移相器、功率放大器（power amplifier，PA）非线性与 RF 校准误差等挑战。所提框架可通过在训练中引入 Gumbel-Softmax 等可微量化层来支持量化相位约束。关于 PA 效率，我们严格施加恒模约束有助于降低模拟信号的峰均功率比（PAPR），从而减轻非线性失真。此外对 RF 校准误差，DL-DMHB 提供了一条有前景的途径：通过在能够经空口测量捕捉硬件失配的数据集上训练，E2E 网络可隐式学习联合补偿信道—硬件损伤。这些实际扩展将作为我们未来工作的主题。

## VI. 结论

本文提出一种面向近场与远场 XL-MIMO 系统的统一复值 E2E 混合波束赋形框架。其核心是 variant-MMSE 解耦目标：数字预编码器由 KKT 条件闭式消去，模拟预编码器的学习由此转化为稳定、可微的和-MSE 最小化问题。我们设计了分组复卷积感知前端、共享逐用户复 MLP 与合并恒模输出头的网络架构，并在此基础上给出间接模式 DL-IMHB 与直接模式 DL-DMHB。间接模式在 PCSI 下逼近迭代优化性能，且推理复杂度随天线数降低；直接模式从短导频中联合学习感知算子与模拟映射，配合低维等效信道估计与闭式数字预编码器，在相同导频预算下优于稀疏恢复流程与近期深度学习基线。数值仿真表明，所提方法在多种用户数、路径数、阵列几何与近—远场距离范围内保持稳定优势，最高可带来约 3 bps/Hz 的和速率增益，并接近全数字与理想混合波束赋形的性能上界，同时推理复杂度低。

## 参考文献（英文原书目）

[1] "IMT traffic estimates for the years 2020 to 2030," Int. Telecommun. Union, Geneva, Switzerland, Rep. ITU-R M.2370-0, Jul. 2015.

[2] "Mobile data traffic outlook," Ericsson, Stockholm, Sweden, Rep., Jun. 2025. [Online]. Available: https://www.ericsson.com/en/mobility-report

[3] "Minimum requirements related to technical performance for IMT-2020 radio interface(s)," Int. Telecommun. Union, Geneva, Switzerland, Rep. ITU-R M.2410-0, Nov. 2017.

[4] W. Saad, M. Bennis, and M. Chen, "A vision of 6G wireless systems: Applications, trends, technologies, and open research problems," IEEE Netw., vol. 34, no. 3, pp. 134–142, Oct. 2019.

[5] Z. Wang et al., "A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications," IEEE Commun. Surv. Tut., vol. 26, no. 3, pp. 1560–1605, 3rd Quart. 2024.

[6] S. Yang, H. Chen, W. Liu, X.-P. Zhang, and C. Yuen, "Near-field channel estimation and localization: Recent developments, cooperative integration, and future directions," IEEE Signal Process. Mag., vol. 42, no. 1, pp. 60–73, Jan. 2025.

[7] J. An, C. Yuen, L. Dai, M. Di Renzo, M. Debbah, and L. Hanzo, "Near-field communications: Research advances, potential, and challenges," IEEE Wireless Commun., vol. 31, no. 3, pp. 100–107, Jun. 2024.

[8] Y. Chen, X. Guo, Z. Wang, and C. Yuen, "Unifying far-field and near-field wireless communications in 6G MIMO," IEEE Wireless Commun. Lett., vol. 13, no. 10, pp. 2762–2766, Aug. 2024.

[9] S. Yang, C. Xie, W. Lyu, B. Ning, Z. Zhang, and C. Yuen, "Near-field channel estimation for extremely large-scale reconfigurable intelligent surface (XL-RIS)-aided wideband mmWave systems," IEEE J. Sel. Areas Commun., vol. 42, no. 6, pp. 1567–1582, Jun. 2024.

[10] T. Gong et al., "Holographic MIMO communications with arbitrary surface placements: Near-field LoS channel model and capacity limit," IEEE J. Sel. Areas Commun., vol. 42, no. 6, pp. 1549–1566, Apr. 2024.

[11] T. Gong, L. Wei, C. Huang, G. C. Alexandropoulos, M. Debbah, and C. Yuen, "Near-field channel modeling for holographic MIMO communications," IEEE Wireless Commun., vol. 31, no. 3, pp. 108–116, Jun. 2024.

[12] M. Cui and L. Dai, "Channel estimation for extremely large-scale MIMO: Far-field or near-field?" IEEE Trans. Commun., vol. 70, no. 4, pp. 2663–2677, Apr. 2022.

[13] S. Yang, A. M. Elbir, H. Chen, Y. Xiong, Z. Zhang, and C. Yuen, "Near-field hybrid beamforming for extremely large-scale (XL)-MIMO communications," IEEE Trans. Wireless Commun., vol. 24, no. 11, pp. 9186–9200, Nov. 2025.

[14] Z. Wu and L. Dai, "Multiple access for near-field communications: SDMA or LDMA?" IEEE J. Sel. Areas Commun., vol. 41, no. 6, pp. 1918–1935, May 2023.

[15] X. Gao, L. Dai, S. Han, C.-L. I, and R. W. Heath, "Energy-efficient hybrid analog and digital precoding for mmWave MIMO systems with large antenna arrays," IEEE J. Sel. Areas Commun., vol. 34, no. 4, pp. 998–1009, Apr. 2016.

[16] F. Sohrabi and W. Yu, "Hybrid digital and analog beamforming design for large-scale antenna arrays," IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 501–513, Apr. 2016.

[17] Z. Xiao, T. He, P. Xia, and X.-G. Xia, "Hierarchical codebook design for beamforming training in millimeter-wave communication," IEEE Trans. Wireless Commun., vol. 15, no. 5, pp. 3380–3392, May 2016.

[18] X. Li, S. Yang, W. Lyu, Z. Zhang, and X. Ling, "Hierarchical multi-beam training with the presence of the sub-connected hybrid beamforming architecture," Trans. Emerg. Telecommun. Technol., vol. 34, no. 3, p. e4727, Mar. 2023.

[19] S. Park, J. Park, A. Yazdan, and R. W. Heath, "Exploiting spatial channel covariance for hybrid precoding in massive MIMO systems," IEEE Trans. Signal Process., vol. 65, no. 14, pp. 3818–3832, Jul. 2017.

[20] C. Qi, K. Chen, O. A. Dobre, and G. Y. Li, "Hierarchical codebook-based multiuser beam training for millimeter wave massive MIMO," IEEE Trans. Wireless Commun., vol. 19, no. 12, pp. 8142–8152, Dec. 2020.

[21] O. El Ayach, S. Rajagopal, S. Abu-Surra, Z. Pi, and R. W. Heath, "Spatially sparse precoding in millimeter wave MIMO systems," IEEE Trans. Wireless Commun., vol. 13, no. 3, pp. 1499–1513, Mar. 2014.

[22] X. Yu, J.-C. Shen, J. Zhang, and K. B. Letaief, "Alternating minimization algorithms for hybrid precoding in millimeter wave MIMO systems," IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 485–500, Apr. 2016.

[23] Y. Sun, P. Babu, and D. P. Palomar, "Majorization-minimization algorithms in signal processing, communications, and machine learning," IEEE Trans. Signal Process., vol. 65, no. 3, pp. 794–816, Feb. 2016.

[24] S. S. Christensen, R. Agarwal, E. De Carvalho, and J. M. Cioffi, "Weighted sum-rate maximization using weighted MMSE for MIMO-BC beamforming design," IEEE Trans. Wireless Commun., vol. 7, no. 12, pp. 4792–4799, Dec. 2008.

[25] S. Yang et al., "Flexible WMMSE beamforming for MU-MIMO movable antenna communications," IEEE Trans. Signal Process., vol. 73, pp. 4479–4491, Oct. 2025.

[26] Z. Gao, C. Hu, L. Dai, and Z. Wang, "Channel estimation for millimeter-wave massive MIMO with hybrid precoding over frequency-selective fading channels," IEEE Commun. Lett., vol. 20, no. 6, pp. 1259–1262, Jun. 2016.

[27] Y. Lu, Z. Zhang, and L. Dai, "Hierarchical beam training for extremely large-scale MIMO: From far-field to near-field," IEEE Trans. Commun., vol. 72, no. 4, pp. 2247–2259, Apr. 2023.

[28] Y. Zhang, X. Wu, and C. You, "Fast near-field beam training for extremely large-scale array," IEEE Wireless Commun. Lett., vol. 11, no. 12, pp. 2625–2629, Dec. 2022.

[29] W. Liu, H. Ren, C. Pan, and J. Wang, "Deep learning based beam training for extremely large-scale massive MIMO in near-field domain," IEEE Commun. Lett., vol. 27, no. 1, pp. 170–174, Jan. 2022.

[30] H. Zhang, N. Shlezinger, F. Guidi, D. Dardari, M. F. Imani, and Y. C. Eldar, "Beam focusing for near-field multiuser MIMO communications," IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 7476–7490, Sep. 2022.

[31] Q. Yang et al., "Beam focusing for near-field multi-user localization," IEEE Trans. Veh. Technol., vol. 74, no. 8, pp. 12 259–12 273, Aug. 2025.

[32] H. Wang et al., "Dynamic metasurface antennas based downlink massive MIMO systems," in 2019 IEEE 20th Int. Workshop Signal Process. Advances Wireless Commun., Cannes, France, Jul. 2019, pp. 1–5.

[33] K. Ma, D. He, H. Sun, Z. Wang, and S. Chen, "Deep learning assisted calibrated beam training for millimeter-wave communication systems," IEEE Trans. Commun., vol. 69, no. 10, pp. 6706–6721, Oct. 2021.

[34] W. Liu, C. Pan, H. Ren, J. Wang, and R. Schober, "Near-field multiuser beam-training for extremely large-scale MIMO systems," IEEE Trans. Commun., vol. 73, no. 4, pp. 2663–2679, Apr. 2025.

[35] C.-J. Chun, J.-M. Kang, and I.-M. Kim, "Deep learning-based channel estimation for massive MIMO systems," IEEE Wireless Commun. Lett., vol. 8, no. 4, pp. 1228–1231, Aug. 2019.

[36] J.-M. Kang, C.-J. Chun, and I.-M. Kim, "Deep learning based channel estimation for MIMO systems with received SNR feedback," IEEE Access, vol. 8, pp. 121 162–121 181, Jul. 2020.

[37] J.-M. Kang, "NMAP-Net: Deep-learning-aided near-field multibeamforming design and antenna position optimization for XL-MIMO communications," IEEE Internet Things J., vol. 12, no. 11, pp. 18 397–18 413, Jun. 2025.

[38] K. M. Attiah, F. Sohrabi, and W. Yu, "Deep learning for channel sensing and hybrid precoding in TDD massive MIMO OFDM systems," IEEE Trans. Wireless Commun., vol. 21, no. 12, pp. 10 839–10 853, Dec. 2022.

[39] Z. Gao et al., "Data-driven deep learning based hybrid beamforming for aerial massive MIMO-OFDM systems with implicit CSI," IEEE J. Sel. Areas Commun., vol. 40, no. 10, pp. 2894–2913, Oct. 2022.

[40] J. Park, F. Sohrabi, A. Ghosh, and J. G. Andrews, "End-to-end deep learning for TDD MIMO systems in the 6G upper midbands," IEEE Trans. Wireless Commun., vol. 24, no. 3, pp. 2110–2125, Mar. 2025.

[41] J. Nie, Y. Cui, Z. Yang, W. Yuan, and X. Jing, "Near-field beam training for extremely large-scale MIMO based on deep learning," IEEE Trans. Mobile Comput., vol. 24, no. 1, pp. 352–362, Jan. 2025.

[42] X. Xu, X. Mu, Y. Liu, and A. Nallanathan, "Joint transmit and pinching beamforming for pinching antenna systems (PASS): Optimization-based or learning-based?" 2025, arXiv:2502.08637.

[43] C. Trabelsi et al., "Deep complex networks," 2017, arXiv:1705.09792.

[44] G. S. Smith, "A direct derivation of a single-antenna reciprocity relation for the time domain," IEEE Trans. Antennas Propag., vol. 52, no. 6, pp. 1568–1577, Jun. 2004.

[45] K. T. Selvan and R. Janaswamy, "Fraunhofer and Fresnel distances: Unified derivation for aperture antennas," IEEE Antennas Propag. Mag., vol. 59, no. 4, pp. 12–15, Aug. 2017.

[46] A. Saleh and R. Valenzuela, "A statistical model for indoor multipath propagation," IEEE J. Sel. Areas Commun., vol. 5, no. 2, pp. 128–137, Feb. 1987.

[47] J. Sherman, "Properties of focused apertures in the Fresnel region," IRE Trans. Antennas Propag., vol. 10, no. 4, pp. 399–408, Jul. 1962.

[48] M. Joham, W. Utschick, and J. Nossek, "Linear transmit processing in MIMO communications systems," IEEE Trans. Signal Process., vol. 53, no. 8, pp. 2700–2712, Aug. 2005.

[49] J. Joung and Y. H. Lee, "Regularized channel diagonalization for multiuser MIMO downlink using a modified MMSE criterion," IEEE Trans. Signal Process., vol. 55, no. 4, pp. 1573–1579, Apr. 2007.

[50] V. Stankovic and M. Haardt, "Generalized design of multi-user MIMO precoding matrices," IEEE Trans. Wireless Commun., vol. 7, no. 3, pp. 953–961, Mar. 2008.

[51] P. R. Gautam, L. Zhang, and P. Fan, "Hybrid MMSE precoding for millimeter wave MU-MISO via trace maximization," IEEE Trans. Wireless Commun., vol. 23, no. 3, pp. 1999–2010, Mar. 2023.

[52] T. Akiba, S. Sano, T. Yanase, T. Ohta, and M. Koyama, "Optuna: A next-generation hyperparameter optimization framework," in Proc. 25th ACM SIGKDD Int. Conf. Knowl. Discovery Data Mining, New York, NY, United States, Jul. 2019, pp. 2623–2631.

## 图注与表注

**图 1（原文 Fig. 1）：** 多径环境下高移动性车辆网络中波束跟踪系统的示意（XL-MISO 混合波束赋形系统服务多用户）。

**图 2（原文 Fig. 2）：** 所提复值 E2E 网络示意。模型包含：(i) 模拟上行测量过程的分组复卷积感知前端；(ii) 用于高效特征提取的共享逐用户复 MLP 模块；(iii) 施加恒模归一化以产生 \(\mathbf F_{\rm RF}\) 的合并输出层。

**图 3（原文 Fig. 3）：** 不同复激活函数在各学习率下的测试和速率。

**图 4（原文 Fig. 4）：** 信令协议时间线，包含用于测量采集的 TDMA 上行感知、用于模拟预编码器生成的神经网络推理、经导频重复的有效信道估计，以及随后的下行数据传输。

**图 5（原文 Fig. 5）：** PCSI 间接模式下的性能评估（\(K=4\)）。(a) 可达和速率随算法特定复杂度参数的变化；(b) 和-MSE 随算法特定复杂度参数的变化。算法特定复杂度参数分别为 DL-IMHB 与 SU-DNN 的虚拟测量数 \(N\)、LDMA 的距离环数 \(S\)、TH-HMP 的迭代次数 \(N_{\rm iter}\)。

**图 6（原文 Fig. 6）：** PCSI 间接模式下关于用户数 \(K\) 的可扩展性分析。

**图 7（原文 Fig. 7）：** 直接波束赋形方案的性能评估（\(K=4\)）。(a) 关于导频效率的性能；(b) 关于 SNR 鲁棒性的性能。

**图 8（原文 Fig. 8）：** 信道稀疏度对和速率性能的影响（SNR=10 dB）。

**图 9（原文 Fig. 9）：** 直接波束赋形方案关于用户数的可扩展性分析。

**图 10（原文 Fig. 10）：** 跨越近场到远场传播区间的性能鲁棒性分析。

**图 11（原文 Fig. 11）：** 不同均匀平面阵（UPA）配置（\(M_y\times M_z\)）与不同导频开销下的可达和速率性能（SNR=10 dB，\(K=4\)）。总天线数 \(M\) 从 64（\(8\times8\)）增至 512（\(32\times16\)）。

**图 12（原文 Fig. 12）：** 通过码本相关得到的代表性感知方向图可视化。左：DL-DMHB 的分组卷积分核被解释为有效感知向量；右：SU-DNN 中来自纯相位线性层的 RF 链感知向量。

**图 13（原文 Fig. 13）：** 归一化距离边缘增益剖面的比较。

**图 14（原文 Fig. 14）：** 使用复值主成分分析对共享 MLP 特征流形的可视化。
**表注：** 原文共 3 张表：表 I（仿真实验超参数配置）、表 II（计算复杂度、运行时间与配置比较）、表 III（生命周期计算复杂度分析），均已在本页相应位置逐格转写。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VI 节全部正文与小节（I-A/B、III-A–C、IV-A/B、V-A–E、两项扩展讨论）、式 (1)–(34)、算法 1–2、表 I–III（逐格转写）、图 1–14 图注、参考文献 [1]–[52]（英文原条目）。原文无附录、无独立致谢段（资助信息与版权声明为首页脚注，已录为"资助说明"与版本说明）。全部公式按 PDF 渲染页（p4、p5、p7、p8 等）逐式核对；表 II 与表 III 按渲染页 p11 逐格核对，表 I 按正文与 p10 核对。**原文说明：** 图 5 的横轴为"算法特定复杂度参数"（不同算法分别取 \(N\)、\(S\)、\(N_{\rm iter}\)），图 5(b) 的和-MSE 以 \(10\log_{10}E(\mathbf F_{\rm RF})\) dB 显示；表 II 中"PCSI/NCSI"分别对应完美 CSI 与无 CSI（基于测量）两种设置。逐句逐式终校未做；供后续 QA 重点核对：式 (8)–(9)、(17) 的矩阵维数约定，式 (26) 的恒模归一化定义，算法 1/2 的步骤顺序，以及表 II 复杂度表达式。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
