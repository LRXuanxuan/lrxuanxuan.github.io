---
layout: page
title: "利用稀疏贝叶斯生成建模的 OTFS 信道估计｜中文全文译文"
permalink: /papers/translations/2026-09-20-2609-01074-otfs-channel-estimation-utilizing-sparse-bayesian-generative-modelling/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/d3356c685e57e5cc/) · [原文 arXiv](https://arxiv.org/abs/2609.01074) · [全部目录](/papers/catalog/)

# 利用稀疏贝叶斯生成建模的 OTFS 信道估计

**原题：** OTFS Channel Estimation Utilizing Sparse Bayesian Generative Modelling  
**作者：** Louis Anseaume、Benedikt Böck、Franz Weißer、Wolfgang Utschick  
**单位：** 慕尼黑工业大学计算、信息与技术学院（TUM School of Computation, Information and Technology, Technical University of Munich，德国）。  
**资助说明：** 本工作由巴伐利亚州经济事务、区域发展与能源部"6G Future Lab Bavaria"项目资助。  
**版本：** arXiv:2609.01074v1（eess.SP），2026 年 9 月 1 日，原文 5 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VII 节及全部小节、定理 1–2、式 (1)–(27)、图 1–2 图注、附录（定理 1 的证明）、参考文献 [1]–[14]（英文原条目）均按原文结构录入；原文无表格、无致谢段。逐句逐式终校未做。

## 摘要

未来无线通信系统的关键挑战之一，是在高速移动场景中保证可靠性——此时准确恢复信道状态信息（channel state information，CSI）至关重要。近期许多研究认为，正交时频空间（orthogonal time-frequency space，OTFS）调制是应对该挑战的有前景技术。此外，基于机器学习（machine learning，ML）的方法有潜力比经典估计技术更有效地利用环境信息，从而改善信道估计性能。本文特别针对 OTFS 信道估计，采用一种基于压缩感知（compressive sensing，CS）的稀疏贝叶斯生成模型（sparse Bayesian generative model，SBGM），即近期提出的压缩感知高斯混合模型（compressive sensing Gaussian mixture model，CSGMM）。我们表明，所提方法在归一化均方误差（normalized mean squared error，NMSE）上相比次优基线有显著改善。我们还就模型在 Doppler–时延（Doppler-delay，DD）域内以任意精度最优逼近复杂信道分布的理论潜力给出洞见。总之，本工作确立了 OTFS-CSGMM 框架作为高移动性无线信道估计的一种有前景方案。

**关键词：** OTFS、Doppler–时延域、压缩感知、稀疏贝叶斯生成建模、信道估计。

## I. 引言

当前最先进的无线通信系统（如第五代 5G 系统）基于正交频分复用（orthogonal frequency-division multiplexing，OFDM），因为其频谱效率高、计算复杂度低且对频率选择性衰落稳健 [1]。然而，下一代系统（如第六代 6G 系统）旨在扩展网络以支持高移动性场景，例如车对车或高速列车通信，典型应用中速度可达 300 至 500 km/h [2]。在这些场景中，研究已表明 OFDM 因高载波间干扰（inter-carrier interference，ICI）而不再是可靠技术，导致信号重建质量差 [3]。因此，近期许多工作宣称正交时频空间（OTFS）是面向大 Doppler 效应场景的有前景候选技术 [4]。它工作在 Doppler–时延（DD）域——一个横跨 Doppler 频移与时延的二维空间——而不是像 OFDM 那样在通常的时频（time-frequency，TF）域传输信息符号。准确的 CSI 对 OTFS 实现正确、可靠且快速的通信至关重要，因此需要高精度的信道估计方法。

在 OTFS 调制中，可用于获取 CSI 的一个重要方面是：在典型室外高移动性场景中，由于反射体数量少，信道具有内在稀疏性 [5]。然而，针对稀疏信道表示的经典估计方法在这些复杂环境中可能达到其极限。因此，基于机器学习（ML）的方法有希望改善此类场景下的信道估计，因为它们能更好地利用无线通信系统内在的上下文信息。特别地，[6] 提出了基于压缩感知（CS）的稀疏贝叶斯生成模型（SBGM），可用于学习典型高速移动通信设置下基站小区内的信道分布。

本工作的目标是：利用典型室外无线通信环境的稀疏性，以及 ML 技术捕捉这些场景复杂性的内在自适应性，来解决 OTFS 信道估计问题。为此，我们重新表述 [7] 的结果以匹配 CS 的描述；随后采用 [6] 中的压缩感知高斯混合模型（CSGMM）——SBGM 的一个代表——并把适配后的算法应用于 OTFS 信道估计问题。通过仿真，我们表明所提方法优于当前最优基线方法。我们还对 SBGM 的功能给出理论研究，表明在关于信道的某些假设下，所研究的模型可以最优地学习底层信道分布的特征，或任意精细地逼近之。这将使估计方法能够给出最优的信道重建。

## II. OTFS 系统模型

我们考虑含 \(P\) 条多径分量的时频相关无线信道。其在 TF 域中的信道冲激响应表示为

$$
H(t,f)=\sum_{p=0}^{P-1}h_pe^{\mathrm{j}2\pi\nu_pt}e^{-\mathrm{j}2\pi\tau_pf},\tag{1}
$$

其中 \(\{h_p\}_{p=0}^{P-1}\) 为信道增益，\(\{\nu_p\}_{p=0}^{P-1}\) 为 Doppler 频移，\(\{\tau_p\}_{p=0}^{P-1}\) 为各路径的时延。此外，记 \(T\) 为 TF 域中的符号时长，\(\Delta f\) 为子载波频率间隔。假设信道参数服从 [7]：

$$
\tau_{\max}<T,\qquad \nu_{\max}<\Delta f,\qquad T=1/\Delta f,\tag{2}
$$

其中 \(\tau_{\max}\) 与 \(\nu_{\max}\) 分别表示参数 \(\tau_p\) 与 \(\nu_p\)（\(p\in\{0,\ldots,P-1\}\)）可取的（绝对值）最大值。

一组复数据符号 \(\{x_{k',l'}\}\)（\(k'\in\{0,\ldots,N-1\}\)、\(l'\in\{0,\ldots,M-1\}\)，\(N,M\in\mathbb N\)）被放置在二维 DD 网格

$$
\mathcal G_{\rm data}=\left\{\left(\frac{k'}{NT},\frac{l'}{M\Delta f}\right)\right\}_{k',l'=0}^{N-1,M-1},\tag{3}
$$

上，我们称之为调制网格。DD 域与 TF 域之间的关系由逆辛傅里叶变换（inverse symplectic finite Fourier transform，ISFFT）给出：把它作用于 \(\{x_{k',l'}\}\) 得到 TF 域中的一块数据符号 \(\{X[n',m']\}\)。对 TF 符号施加离散 Heisenberg 变换，得到时域发送信号，并通过式 (1) 定义的时频选择性信道传输。在接收端，对接收信号施加 Wigner 变换以得到 TF 域输出信号 \(y(t,f)\)；把输出信号采样得到 TF 域中的一块符号 \(\{Y[n,m]\}\) 后，再施加辛傅里叶变换（symplectic finite Fourier transform，SFFT），得到 DD 域输出符号 \(\{y_{k,l}\}\)。

按上述调制方案，OTFS 的向量化输入—输出关系为 [7]

$$
\mathbf y=\left(\sum_{p=0}^{P-1}h_p\mathbf\Psi_p\right)\mathbf x+\mathbf n=\mathbf H\mathbf x+\mathbf n,\tag{4}
$$

其中 \(\mathbf H\) 为信道矩阵，\(\mathbf\Psi_p\) 的元素是第 \(p\) 条路径的符号间干扰（inter-symbol interference，ISI）系数 \(\mathbf\Psi_{k,k'}^p[l,l']\)，\(\mathbf n\sim\mathcal{NC}(\mathbf 0,\sigma^2\mathbf I_{MN})\) 为加性白高斯噪声（additive white Gaussian noise，AWGN）。若发送与接收均采用矩形脉冲，则对任意路径 \(p\in\{0,\ldots,P-1\}\)，\(\mathbf\Psi_{k,k'}^p[l,l']\) 的简化表达式为

$$
\begin{aligned}
\mathbf\Psi_{k,k'}^p[l,l']\approx{}&\frac{e^{\mathrm{j}2\pi\nu_p\tau_p}}{NM}\cdot\frac{1-e^{\mathrm{j}2\pi\left(k'-k+\nu_pNT\right)}}{1-e^{\mathrm{j}2\pi\frac{\left(k'-k+\nu_pNT\right)}{N}}}\cdot\frac{1-e^{\mathrm{j}2\pi\left(l'-l+\tau_pM\Delta f\right)}}{1-e^{\mathrm{j}2\pi\frac{\left(l'-l+\tau_pM\Delta f\right)}{M}}}\cdot e^{-\mathrm{j}2\pi\nu_p\frac{l'}{M\Delta f}}\\
&\times\begin{cases}1,&\text{若 }l'\in\left\{0,\ldots,M-1-\left\lceil\frac{M\tau_p}{T}\right\rceil\right\},\\ e^{-\mathrm{j}2\pi\left(\frac{k'}{N}+\nu_pT\right)},&\text{若 }l'\in\left\{M-\left\lceil\frac{M\tau_p}{T}\right\rceil,\ldots,M-1\right\}.\end{cases}
\end{aligned}\tag{5}
$$

推导细节见 [8]。

信道对 OTFS 调制方案呈块状作用，而非逐符号变换 [7]：发送符号在 DD 网格中经历与信道参数对应的移位，并因其小数部分产生额外能量扩散。这促使我们采用 [7] 中的导频方案，概述如下。

这里，一块 \(N\times M\) 符号包含一个位于中心、高能量的导频符号（称为峰值导频符号），其周围是零能量保护间隔导频符号；块中剩余空间可留给低能量数据符号。这确保峰值导频符号在 DD 域空间上与功率上都与数据符号隔离，因此可作为 DD 网格移位的指示，因为与其他符号的干扰可忽略。于是可把该导频方案的输入向量设为

$$
\mathbf x_{{\rm pl,OTFS}}=[0,\ldots,0,x_{\rm pilot},0,\ldots,0]^T\in\mathbb C^{NM}\tag{6}
$$

因为数据符号功率水平可忽略。

## III. OTFS 信道估计

我们考虑这样一类模型：它同时结合稀疏贝叶斯学习（sparse Bayesian learning，SBL）框架 [9] 的稀疏诱导性质，以及通过可训练生成模型（generative model，GM）对潜在空间的利用。本工作中我们考虑一类特定的 GM，称为条件高斯潜变量模型（conditional Gaussian latent model，CGLM）——在给定潜在变量的条件下分布为高斯分布。此时组合模型称为 SBGM [6]。

特别地，本文聚焦于高斯混合模型（Gaussian mixture model，GMM）的应用，它用

$$
p^{({\rm GMM})}(\mathbf x)=\sum_{k=1}^{K}p(k)p(\mathbf x|k)=\sum_{k=1}^{K}\rho_k\mathcal N(\mathbf x;\boldsymbol\mu_k,\mathbf C_k)\tag{7}
$$

逼近任意概率密度函数（probability density function，PDF）\(p(\mathbf x)\)，其中 \(p(k)=\rho_k\ge0\) 对所有 \(k\in\{1,\ldots,K\}\) 成立，且 \(\sum_{k=1}^{K}\rho_k=1\)。GMM 通常被认为是复杂概率分布的良好逼近，可用于多种无线通信任务 [10]。把其纳入 SBGM 框架即得到 CSGMM [6]。

为在 CSGMM 框架下估计信道参数 \(\boldsymbol\xi=\{h_p,\nu_p,\tau_p\}_{p=0}^{P-1}\)，我们重新表述 OTFS 输入—输出关系。为此引入向量 \(\boldsymbol\phi_p\)：

$$
\boldsymbol\phi_p=\mathbf\Psi_p\mathbf x.\tag{8}
$$

记矩阵 \(\mathbf\Phi=[\boldsymbol\phi_0,\ldots,\boldsymbol\phi_{P-1}]\in\mathbb C^{MN\times P}\) 与向量 \(\mathbf h=[h_0,\ldots,h_{P-1}]^T\in\mathbb C^P\)，(4) 中的输入—输出关系变为

$$
\mathbf y=\mathbf\Phi\mathbf h+\mathbf n.\tag{9}
$$

进一步定义基数为 \(G\ge MN\) 的 DD 网格（称为稀疏网格）

$$
\mathcal G=\{(\tilde\nu_i,\tilde\tau_i)\}_{i=1}^{G}.\tag{10}
$$

假设信道系数位于稀疏网格上，(9) 的输入—输出关系可重述为

$$
\mathbf y=\mathbf\Phi_{\rm dict}\mathbf h_{\rm sp}+\mathbf n,\tag{11}
$$

其中稀疏向量 \(\mathbf h_{\rm sp}\in\mathbb C^G\) 仅有 \(P\) 个非零项，稀疏字典为

$$
\mathbf\Phi_{\rm dict}=\left[\tilde{\boldsymbol\phi}_0,\ldots,\tilde{\boldsymbol\phi}_{G-1}\right]\in\mathbb C^{MN\times G},\tag{12}
$$

其各列为 \(\tilde{\boldsymbol\phi}_i=\mathbf\Psi(\tilde\nu_i,\tilde\tau_i)\mathbf x\)（参见 (8)）。在一般情况下，我们仍使用 (11)，并假设对任意参数 \(\boldsymbol\xi=\{h_p,\nu_p,\tau_p\}_{p=0}^{P-1}\) 都有近似 \(\mathbf\Phi\mathbf h\approx\mathbf\Phi_{\rm dict}\mathbf h_{\rm sp}\) 成立。此时式 (11) 类似于典型的 CS 不适定线性逆问题表述 [6]。于是可把 OTFS-CSGMM 表示如下：

$$
\begin{cases}\mathbf y|\mathbf h_{\rm sp}\sim p(\mathbf y|\mathbf h_{\rm sp})=\mathcal N(\mathbf y;\mathbf\Phi_{\rm dict}\mathbf h_{\rm sp},\sigma^2\mathbf I)\\\mathbf h_{\rm sp}|k\sim p(\mathbf h_{\rm sp}|k)=\mathcal N(\mathbf h_{\rm sp};\mathbf 0,\operatorname{diag}(\boldsymbol\gamma_k))\\\forall k\in\{1,\ldots,K\},\ p_\delta(k)=\rho_k\ge0.\end{cases}\tag{13}
$$

我们用期望最大化（expectation-maximization，EM）算法训练 OTFS-CSGMM。在所谓 E 步中，我们估计稀疏变量与潜在变量后验 \(\{\mathbf h_{\rm sp}|(\mathbf y,k);k|\mathbf y\}\) 的统计特征，从而可闭式计算第 \(t\) 次迭代的 \(p^{(t)}(\mathbf h_{\rm sp},k|\mathbf y)\)。在所谓 M 步中，我们通过最大化证据下界（evidence lower bound，ELBO）来更新 CSGMM 的参数 \(\{\rho_k^{(t+1)},\boldsymbol\gamma_k^{(t+1)}\}_{k=1}^{K}\)。

模型训练完成后，我们由观测到的含噪样本 \(\mathbf y\) 估计稀疏信道表示 \(\mathbf h_{\rm sp}\)。均方误差（mean squared error，MSE）最优的条件均值估计器（conditional mean estimator，CME）可分解为

$$
\mathbf h_{\rm sp,CME}=\mathbb E[\mathbf h_{\rm sp}|\mathbf y]=\mathbb E\left[\mathbb E[\mathbf h_{\rm sp}|\mathbf y,k]|\mathbf y\right]\approx\sum_{k=1}^{K}\hat p(k|\mathbf y)\hat{\boldsymbol\mu}_{\mathbf h_{\rm sp}|\mathbf y,k}\tag{14}
$$

其中 \(\hat p(k|\mathbf y)\) 与 \(\hat{\boldsymbol\mu}_{\mathbf h_{\rm sp}|\mathbf y,k}\) 为相应量的估计。随后把该稀疏估计转为其矩阵表示

$$
\widehat{\mathbf H}=\sum_{i=1}^{G}h_{i,{\rm sp}}\mathbf\Psi(\tilde\nu_i,\tilde\tau_i)\tag{15}
$$

其中 \(h_{i,{\rm sp}}\) 为 \(\mathbf h_{\rm sp,CME}\) 的各元素。

## IV. 理论分析

在零均值、广义平稳不相关散射（wide-sense-stationary-uncorrelated-scattering，WSSUS）信道模型假设下，以边信息为条件时统计特征保持不变 [11]。然而对 OTFS，由 WSSUS 假设产生的 Toeplitz 结构约束不再成立。尽管如此，我们表明可以设计一种流程：在适当条件下，CSGMM 能最优地学习信道分布的任意精细逼近，从而准确恢复随机 OTFS 信道的分布。

考虑把信道路径系数分解为 \(h_p=\sqrt{a_p}e^{-\mathrm{j}\beta_p}\)（\(p\in\{0,\ldots,P-1\}\)），以及相应信道模型

$$
\mathbf r=\mathbf\Phi\mathbf h=\sum_{p=0}^{P-1}\sqrt{a_p}e^{-\mathrm{j}\beta_p}\boldsymbol\phi_p.\tag{16}
$$

### A. 离散模型分布

若信道参数位于稀疏网格 \(\mathcal G\) 上，下述定理表明 OTFS 模型的统计刻画在给定边信息条件下得以保持。

**定理 1。** 设 \(\mathcal G\) 为 DD 网格，使得对所有 \(p\in\{0,\ldots,P-1\}\) 有 \((\nu_p,\tau_p)\in\mathcal G\)，并令 \(\mathbf\Phi_{\rm dict}\) 为相应稀疏字典（参见 (12)）。设 \(\mathbf z\) 为关于 \(\mathbf r\) 的任意边信息。假设

- \(\forall p\ne p'\)，\(\beta_p\perp\beta_{p'}\)；
- \(\forall p\)，\(\beta_p\perp a_p,\nu_p,\tau_p\)；
- \(\forall p\)，\(\beta_p\sim\mathcal U([-\pi,\pi])\)；
- \(\forall p\)，\(\beta_p\perp\mathbf z\)。

则 \(\mathbf r\) 具有如下矩：

$$
\mathbb E[\mathbf r]=\mathbf 0\tag{17}
$$

$$
\mathbb E\left[\mathbf r\mathbf r^H\right]=\mathbf\Phi_{\rm dict}\mathbf\Delta\mathbf\Phi_{\rm dict}^H\tag{18}
$$

$$
\mathbb E[\mathbf r|\mathbf z]=\mathbf 0\tag{19}
$$

$$
\mathbb E\left[\mathbf r\mathbf r^H|\mathbf z\right]=\mathbf\Phi_{\rm dict}\mathbf\Delta_{\mathbf z}\mathbf\Phi_{\rm dict}^H\tag{20}
$$

其中 \(\mathbf\Delta\) 与 \(\mathbf\Delta_{\mathbf z}\) 为对角矩阵。

**证明：** 见附录。

据定理 1，若关于边信息 \(\mathbf z\) 与路径相位 \(\boldsymbol\beta=\{\beta_p\}_{p=0}^{P-1}\) 的某些假设成立，则模型的零均值性质与基于字典的结构得以保持。因此，原则上该模型可以最优地学习此分布，因为真实模型分布位于 CSGMM 的搜索空间之内 [11]。

### B. 连续模型分布

一般情况下，真实信道的参数连续分布在有界取值范围内。通过构造一列离散模型，下述定理建立了向连续真实模型的收敛性。

**定理 2。** 设 \(\{(\mathbf r^{(n)})\}_{n\in\mathbb N}\) 为定义在一列逐渐加密、均匀间隔的 DD 网格 \(\mathcal G^{(n)}\) 上的一列离散模型。记 \(\mathbf\Phi_{{\rm dict},(n)}\) 为与 DD 网格 \(\mathcal G^{(n)}\) 相关联的稀疏字典。假设 DD 参数有界。设 \(\mathbf z\) 为关于 \(\mathbf r\) 的某边信息。此外假设

- \(\forall p\ne p'\)，\(\beta_p\perp\beta_{p'}\)；
- \(\forall p\)，\(\beta_p\perp a_p,\nu_p,\tau_p\)；
- \(\forall p\)，\(\beta_p\sim\mathcal U([-\pi,\pi])\)；
- \(\forall p\)，\(\beta_p\perp\mathbf z\)。

则

$$
\forall n\in\mathbb N,\quad\mathbb E\left[\mathbf r^{(n)}\right]=\mathbb E\left[\mathbf r^{(n)}|\mathbf z\right]=\mathbf 0\tag{21}
$$

$$
\mathbb E[\mathbf r]=\mathbb E[\mathbf r|\mathbf z]=\mathbf 0\tag{22}
$$

$$
\mathbf\Phi_{{\rm dict},(n)}\mathbf\Delta_{(n)}\mathbf\Phi_{{\rm dict},(n)}^H=\mathbb E\left[\mathbf r^{(n)}\mathbf r_{(n)}^H\right]\xrightarrow[n\to+\infty]{}\mathbb E\left[\mathbf r\mathbf r^H\right]\tag{23}
$$

$$
\mathbf\Phi_{{\rm dict},(n)}\mathbf\Delta_{(n),\mathbf z}\mathbf\Phi_{{\rm dict},(n)}^H=\mathbb E\left[\mathbf r^{(n)}\mathbf r_{(n)}^H|\mathbf z\right]\xrightarrow[n\to+\infty]{}\mathbb E\left[\mathbf r\mathbf r^H|\mathbf z\right]\tag{24}
$$

其中 \(\mathbf\Delta_{(n)}\) 为依赖 DD 网格 \(\mathcal G^{(n)}\) 的对角矩阵，\(\mathbf\Delta_{(n),\mathbf z}\) 为额外依赖边信息 \(\mathbf z\) 的对角矩阵。

**证明：** (21) 与 (22) 来自与 (17)、(19) 中结果类似的推导；(23) 与 (24) 由控制收敛定理得到。

定理 2 表明，离散参数化模型的统计特征收敛到连续真实信道的统计特征。由于这类离散模型位于 CSGMM 的可学习空间之内，该结果说明 CSGMM 原则上能够捕捉现实 OTFS 信道的任意精确表示。因此，它为采用高分辨率 DD 网格实现 CSGMM 提供了理论依据，保证所学逼近的矩趋近于连续参数化 OTFS 模型的真实矩。

## V. 数值结果

为评估所提信道估计框架，我们采用 DeepMIMOv3 [12] 中基站标为"BS1"的"Dynamic Doppler (DD1)"场景。此外使用单阵元天线，并针对 2000 个可用场景中的 BS 到用户下行信道生成 \(P=10\) 条最显著路径。我们随机打乱并把数据集划分为训练集与测试集，规模分别为 \(N_{\rm train}=12805\) 与 \(N_{\rm test}=3202\)。

OTFS 调制方案的实现采用子载波频率间隔 \(\Delta f=30\) kHz、符号时长 \(T=\frac{1}{\Delta f}=33.3\) µs。对 CSGMM，我们考虑 \(K=10\) 个分量。除另有说明，OTFS 调制 DD 网格 \(\mathcal G_{\rm data}\) 设为 \(8\times8\) 网格，OTFS 稀疏 DD 网格 \(\mathcal G\) 覆盖 \(32\times32\) 个元素，于是 \(|\mathcal G_{\rm data}|=64\)、\(|\mathcal G|=1024\)。除另有说明，信噪比（signal-to-noise ratio，SNR）设为 20 dB。

作为失真度量的归一化均方误差（NMSE）由下式给出其经验形式：

$$
{\rm NMSE}=\frac{1}{N_{\rm test}}\sum_{n=1}^{N_{\rm test}}\frac{\left\|\widehat{\mathbf H}-\mathbf H\right\|_F^2}{\left\|\mathbf H\right\|_F^2}.\tag{25}
$$

作为对比基线，我们考虑正交匹配追踪（orthogonal matching pursuit，OMP）[13]、SBL [9] 及其变体多稀疏贝叶斯学习（multiple sparse Bayesian learning，M-SBL）[14]。在 OMP 实现中，残差范数的容差水平定义为 \(\epsilon_{\rm OMP}=\alpha|\mathcal G|\)，其中 \(\alpha\) 为尺度因子、\(|\mathcal G|\) 为网格尺寸。由 [14] 可知，M-SBL 可等同于单分量 CSGMM 模型，参见 (13)。

在第一个实验中，我们在指定范围内对每个 SNR 值分别训练与测试模型，在每个被评估的 SNR 水平上独立重训每个基于学习的模型。我们还通过测试一个在单一固定 SNR 下训练的 CSGMM，来评估所提方法的泛化能力。相应性能结果见图 1。CSGMM 在整个 SNR 范围内持续优于全部基线模型，相比次优方法（即 M-SBL）有显著改善。在高 SNR 水平，所有实现方法都表现出性能趋平，说明出现饱和。这些观察表明，相比现有基于字典的方法，所提 CSGMM 更准确地捕捉了 OTFS 信道的概率结构。高 SNR 下失真改善的减小，进一步凸显了使用离散 DD 网格逼近时小数 Doppler 效应带来的限制。尽管其精度最终受限于信道分布在 DD 域中离散网格表示的分辨率（从而带来残余泛化偏差），CSGMM 仍表现出强泛化性能，使其成为 OTFS 信道估计的有前景候选。

为更深入说明离散网格的影响，在第二个实验中固定 SNR，并把所考虑方法的性能作为稀疏网格基数 \(|\mathcal G|\) 的函数评估。相应结果见图 2。对较大网格，CSGMM 持续优于全部基线，在 \(64\times64\) 网格下相对最佳竞争方法（SBL）取得显著改善。直接估计基线也随网格增大而性能改善，但仍保持相对较差的性能。此外，虽然 CSGMM 单调受益于更大的 \(|\mathcal G|\)，M-SBL 模型在 \(|\mathcal G|=1024\) 处达到峰值性能、此后退化，说明存在过度正则化。相比之下，CSGMM 具有足够的模型复杂度来有效利用增大的稀疏网格维度，从而持续受益于更大网格。总体而言，这些结果凸显了 CSGMM 在稀疏 DD 网格上捕捉真实 OTFS 信道分布的优越能力。

**图 1（原文 Fig. 1）：** 应用于 OTFS 信道估计的 CSGMM、OMP、SBL 与 M-SBL 在不同 SNR 值下的 NMSE 性能。对基于训练的方法，在每个被测试的 SNR 水平上分别在该 SNR 处重新训练一个新模型。（图例：OMP（α=0.1）、OMP（α=1.0）、OMP（α=10.0）、SBL、M-SBL、CSGMM、CSGMM（20 dB 训练 SNR）；横轴 SNR [dB] 0–25，纵轴 NMSE 对数刻度。）

**图 2（原文 Fig. 2）：** 应用于 OTFS 信道估计的 CSGMM、OMP、SBL 与 M-SBL 在不同稀疏网格尺寸 \(|\mathcal G|\) 下的 NMSE 性能。（横轴 \(|\mathcal G|\) 取 64、256、1024、4096，纵轴 NMSE 对数刻度。）

## VI. 结论

本文提出一种利用统计表达力强的、基于 ML 的 SBGM 来解决 OTFS 信道估计问题的新途径。所用 CSGMM 准确捕捉了高移动性无线通信场景中信道分布的复杂性。我们证明了在估计精度上相对当前最优基线方法的显著性能提升。此外，我们针对该方法学习 OTFS 信道分布任意精确逼近的潜力，给出了理论洞见。把 CSGMM 以及相关模型——压缩感知变分自编码器（compressive sensing variational autoencoder，CSVAE）——应用于 OTFS 信道估计问题，为未来研究提供了令人期待的机会。

## VII. 附录

**定理 1 的证明。** 设 \(\mathbf r\) 为按 (16) 定义、其参数满足全部假设的随机向量。令 \(G=|\mathcal G|\) 为 \(\mathcal G\) 的基数。由于参数位于 \(\mathcal G\) 中，可写 \(\mathbf r=\mathbf\Psi_{\rm dict}\mathbf h_{\rm sp}\)，并把 \(\mathbf h_{\rm sp}\) 的元素分解为 \(h_{{\rm sp},i}=\sqrt{\eta_i}e^{-\mathrm{j}\tilde\beta_i}\)（\(i\in\{1,\ldots,G\}\)）。不失一般性，可假设 \(\tilde{\boldsymbol\beta}=\{\tilde\beta_i\}_{i=1}^{G}\) 的所有元素与 \(\boldsymbol\beta=\{\beta_p\}_{p=0}^{P-1}\) 的元素具有相同性质。于是容易证明对所有 \(i\in\{1,\ldots,G\}\) 有 \(\tilde\beta_i\perp\eta_i\)。据此，可对 (26) 与 (27) 中所用的 \(\mathbf r\) 的矩作变量替换，分别得到 (17) 与 (18)。再假设 \(\forall p\)，\(\beta_p\perp\mathbf z\)，不失一般性可假设 \(\forall i\)，\(\tilde\beta_i\perp\mathbf z\)，通过类似推理即得 (19) 与 (20)。∎

$$
\mathbb E[\mathbf r]=\mathbb E_{\boldsymbol\eta,\tilde{\boldsymbol\beta}}[\mathbf r]=\sum_{i=1}^{G}\mathbb E_{\boldsymbol\eta}\left[\sqrt{\eta_i}\right]\underbrace{\mathbb E_{\tilde{\boldsymbol\beta}}\left[e^{-\mathrm{j}\tilde\beta_i}\right]}_{=0\ \text{因}\ \tilde\beta_i\sim\mathcal U([-\pi,\pi])}\boldsymbol\phi\left(\tilde\nu^{(i)},\tilde\tau^{(i)}\right)=\mathbf 0\tag{26}
$$

$$
\begin{aligned}
\mathbb E\left[\mathbf r\mathbf r^H\right]&=\mathbb E_{\boldsymbol\eta,\tilde{\boldsymbol\beta}}\left[\mathbf r\mathbf r^H\right]=\sum_{i=1}^{G}\sum_{i'=1}^{G}\mathbb E_{\boldsymbol\eta}\left[\sqrt{\eta_i}\sqrt{\eta_{i'}}\right]\underbrace{\mathbb E_{\tilde{\boldsymbol\beta}}\left[e^{-\mathrm{j}\tilde\beta_i}e^{\mathrm{j}\tilde\beta_{i'}}\right]}_{=\delta_{i,i'}\ \text{因}\ \tilde\beta_i\perp\tilde\beta_{i'}}\boldsymbol\phi\left(\tilde\nu^{(i)},\tilde\tau^{(i)}\right)\boldsymbol\phi^H\left(\tilde\nu^{(i')},\tilde\tau^{(i')}\right)\\
&=\sum_{i=1}^{G}\mathbb E_{\boldsymbol\eta}[\eta_i]\boldsymbol\phi\left(\tilde\nu^{(i)},\tilde\tau^{(i)}\right)\boldsymbol\phi^H\left(\tilde\nu^{(i)},\tilde\tau^{(i)}\right)=\mathbf\Psi_{\rm dict}\operatorname{diag}\left(\mathbb E[\boldsymbol\eta]\right)\mathbf\Psi_{\rm dict}^H
\end{aligned}\tag{27}
$$

## 参考文献（英文原书目）

[1] G. Stuber, J. Barry, S. McLaughlin, Y. Li, M. Ingram, and T. Pratt, “Broadband MIMO-OFDM wireless communications,” Proceedings of the IEEE, vol. 92, no. 2, pp. 271–294, 2004.

[2] W. Yuan, S. Li, Z. Wei, Y. Cui, J. Jiang, H. Zhang, and P. Fan, “New delay Doppler communication paradigm in 6G era: A survey of orthogonal time frequency space (OTFS),” China Communications, vol. 20, no. 6, pp. 1–25, 2023.

[3] T. Wang, J. Proakis, E. Masry, and J. Zeidler, “Performance degradation of OFDM systems due to Doppler spreading,” IEEE Transactions on Wireless Communications, vol. 5, no. 6, pp. 1422–1432, 2006.

[4] R. Hadani, S. Rakib, M. Tsatsanis, A. Monk, A. J. Goldsmith, A. F. Molisch, and R. Calderbank, “Orthogonal time frequency space modulation,” in 2017 IEEE Wireless Communications and Networking Conference (WCNC), 2017, pp. 1–6.

[5] C.-X. Wang, A. Ghazal, B. Ai, Y. Liu, and P. Fan, “Channel measurements and models for high-speed train communication systems: A survey,” IEEE Communications Surveys & Tutorials, vol. 18, no. 2, pp. 974–987, 2016.

[6] B. Böck, S. Syed, and W. Utschick, “Sparse Bayesian generative modeling for compressive sensing,” in Advances in Neural Information Processing Systems, A. Globerson, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. Tomczak, and C. Zhang, Eds., vol. 37. Curran Associates, Inc., 2024, pp. 4629–4659.

[7] L. Gaudio, G. Colavolpe, and G. Caire, “OTFS vs. OFDM in the presence of sparsity: A fair comparison,” IEEE Transactions on Wireless Communications, vol. 21, no. 6, pp. 4410–4423, 2022.

[8] L. Gaudio, M. Kobayashi, G. Caire, and G. Colavolpe, “On the effectiveness of OTFS for joint radar parameter estimation and communication,” IEEE Transactions on Wireless Communications, vol. 19, no. 9, pp. 5951–5965, 2020.

[9] D. Wipf and B. Rao, “Sparse Bayesian learning for basis selection,” IEEE Transactions on Signal Processing, vol. 52, no. 8, pp. 2153–2164, 2004.

[10] M. Koller, B. Fesl, N. Turan, and W. Utschick, “An asymptotically MSE-optimal estimator based on Gaussian mixture models,” IEEE Transactions on Signal Processing, vol. 70, pp. 4109–4123, 2022.

[11] B. Böck, M. Baur, N. Turan, D. Semmler, and W. Utschick, “A statistical characterization of wireless channels conditioned on side information,” IEEE Wireless Communications Letters, vol. 13, no. 12, pp. 3508–3512, 2024.

[12] A. Alkhateeb, “DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications,” in Proc. of Inf. Theory and Appl. Workshop (ITA), San Diego, CA, Feb 2019, pp. 1–8.

[13] Y. Pachigolla, L. Zaniboni, and M. Mahvari, “Channel estimation in uplink multi-user scenario using OTFS modulation,” in 2025 14th International ITG Conference on Systems, Communications and Coding (SCC), 2025, pp. 1–6.

[14] D. P. Wipf and B. D. Rao, “An empirical Bayesian strategy for solving the simultaneous sparse approximation problem,” IEEE Transactions on Signal Processing, vol. 55, no. 7, pp. 3704–3716, 2007.

## 图注与表注

**图注：** 图 1 与图 2 的图注已随文置于第 V 节相应位置。

> **表注：** 原文没有表格。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VII 节全部正文与小节（含 IV-A/IV-B 两个定理）、式 (1)–(27)（含附录证明中的 (26)(27)）、图 1–2 图注、附录（定理 1 的证明）、参考文献 [1]–[14]（英文原条目，编号与原文一致）。原文无表格、无致谢段（资助信息为首页脚注，已录入"资助说明"）。全部公式按 PDF 渲染页（p2–p5）逐式核对后转写；图 1、图 2 图注按 p4 核对。**原文疑点/排版说明（已加注）：** ① 式 (10) 中稀疏网格集合与其基数同用符号 \(G\)（正文又以 \(|\mathcal G|\) 表示基数），属记号重载，按原文照录；② 式 (26)、(27) 在 PDF 中排印于第 5 页页脚（参考文献列表之后），而附录正文称其"shown at the bottom of this page"，本页按附录逻辑位置录入并在此说明。逐句逐式终校未做；供后续 QA 重点核对：式 (5) 的 ISI 系数分式与移位分段、式 (13) 的 CSGMM 层级模型、式 (23)–(24) 的收敛记号。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
