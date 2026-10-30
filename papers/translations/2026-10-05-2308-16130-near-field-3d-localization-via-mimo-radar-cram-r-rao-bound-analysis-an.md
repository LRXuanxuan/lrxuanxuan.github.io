---
layout: page
title: "MIMO 雷达近场三维定位：Cramér–Rao 界分析与估计器设计｜中文全文译文"
permalink: /papers/translations/2026-10-05-2308-16130-near-field-3d-localization-via-mimo-radar-cram-r-rao-bound-analysis-an/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1acaad49a2353e5b/) · [原文 arXiv](https://arxiv.org/abs/2308.16130) · [全部目录](/papers/catalog/)

# MIMO 雷达近场三维定位：Cramér–Rao 界分析与估计器设计

**原题：** Near-Field 3D Localization via MIMO Radar: Cramér-Rao Bound Analysis and Estimator Design  
**作者：** Haocheng Hua（IEEE 学生会员）、Jie Xu（IEEE 高级会员，通讯作者）、Yonina C. Eldar（IEEE 会士）  
**单位：** Haocheng Hua 与 Jie Xu 就职于香港中文大学（深圳）理工学院（SSE）与未来智联网络研究院（FNii），深圳，中国；Yonina C. Eldar 就职于以色列魏茨曼科学研究所数学与计算机科学学院，Rehovot 7610001。  
**版本：** arXiv:2308.16130v1（cs.IT），2023 年 8 月 30 日提交，原文 14 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、符号说明、第 I–VI 节及全部小节、命题 1–6、算法 1、图 1–7 图注、附录 A–F（六个证明的完整推导）、参考文献 [1]–[38]（英文原条目）均按原文结构录入；原文无表格。逐句逐式终校未做。  
**说明：** 本文部分内容已在 2023 年 IEEE 全球通信会议（GLOBECOM，马来西亚吉隆坡，2023 年 12 月 4–8 日）报告 [1]。

## 摘要

本文研究近场多输入多输出（multiple-input multiple-output，MIMO）雷达感知系统：其收发机配备大规模天线，目标是在未知杂波环境下对三维（three-dimensional，3D）空间中的多个近场目标进行定位。我们考虑球面波前传播，并同时计入不同天线上信道相位与幅度的变化。在该设定下，未知参数包括多个目标的三维坐标与复反射系数，以及噪声与干扰的协方差矩阵。首先，在考虑一般发射信号波形的前提下，我们推导了对应目标三维坐标与复反射系数的 Fisher 信息矩阵（Fisher information matrix，FIM），并据此得到估计三维坐标的 Cramér–Rao 界（Cramér-Rao bound，CRB），从而为近场三维目标定位提供性能下界。对于单目标特例，我们得到了解析形式的 CRB，并分析了其关于目标距离与收发机天线尺寸的渐近标度行为。为便于实际定位，我们进而提出两种基于最大似然（maximum likelihood，ML）准则的多目标定位估计器，即三维近似循环优化（3D approximate cyclic optimization，3D-ACO）与白高斯噪声下的三维循环优化（3D cyclic optimization with white Gaussian noise，3D-CO-WGN）。数值结果验证了渐近 CRB 分析，并表明：当目标靠近收发机时，计入精确的天线间信道幅度变化对于获得准确 CRB 与实现准确定位是必不可少的。结果还表明，所提估计器在不同杂波环境下都能取得接近所推导 CRB 的定位性能，从而验证了其实际实现中的有效性。此外，发射波形对 CRB 与定位性能有显著影响。

**关键词：** MIMO 雷达感知；近场定位；Cramér–Rao 界；估计器设计。

**符号说明：** 粗体字母表示向量（小写）或矩阵（大写）。对任意方阵 \(\mathbf M\)，\(\operatorname{tr}(\mathbf M)\)、\(\mathbf M^{-1}\) 与 \(|\mathbf M|\) 分别表示其迹、逆与行列式。对任意尺寸矩阵 \(\mathbf M\)，\(\Re(\mathbf M)\)、\(\Im(\mathbf M)\)、\(\mathbf M^H\)、\(\mathbf M^*\)、\(\mathbf M^T\)、\(\mathbf M[m:n,p:q]\) 与 \(\operatorname{vec}(\mathbf M)\) 分别表示其真实部、虚部、共轭转置、共轭、转置、维度为 \((n-m+1)\times(q-p+1)\) 的子块矩阵，以及其向量化；\(\odot\) 表示 Hadamard 积。均值为向量 \(\mathbf x\)、协方差为 \(\mathbf\Sigma\) 的循环对称复高斯（circularly symmetric complex Gaussian，CSCG）随机向量分布记作 \(\mathcal{CN}(\mathbf x,\mathbf\Sigma)\)；\(\sim\) 表示“服从分布”。用 \(\mathbb R^{x\times y}\) 与 \(\mathbb C^{x\times y}\) 表示维度为 \(x\times y\) 的实矩阵与复矩阵空间。\(\mathbb E\{\cdot\}\) 表示统计期望。\(\|\mathbf x\|\) 为复向量 \(\mathbf x\) 的欧氏范数，\(\operatorname{diag}(\mathbf x)\) 表示以 \(\mathbf x\) 为对角元素的对角矩阵。虚数单位写为 \(\mathrm{j}=\sqrt{-1}\)。

## I. 引言

第六代（6G）无线网络在学术界与工业界都引起了越来越多的研究兴趣，预期将支持沉浸式、大规模、超高可靠低时延通信以及通信感知一体化（integrated sensing and communication，ISAC）等新使用场景 [2]–[4]。为此，大量基站（base station，BS）将被密集部署，可利用新兴的超大规模 MIMO 以及毫米波/太赫兹（mmWave/THz）技术 [5]，同时提供无线通信与雷达感知功能。由于天线数量众多且频段较高，感知与通信预期将在近场区域（或 Fresnel 区 [6]–[8]）实现，此时采用平面电磁波前的远场信道模型不再成立。这带来了从传统远场感知与通信设计到新近场设计的范式转变，需要考虑球面波前 [6]–[18]。例如，已有大量工作研究近场超大规模 MIMO 通信，包括单用户通信的信噪比（signal-to-noise ratio，SNR）标度律 [9]、多用户通信的波束聚焦 [6]，以及利用极域稀疏性 [11] 或距离参数化角度域稀疏性 [19] 的新信道估计设计。

利用球面波前对感知目标进行定位的思想可追溯到 [15]，该文作者通过二维多重信号分类（multiple signal classification，MUSIC）与最大似然估计（maximum likelihood estimation，MLE）研究了二维（2D）平面内目标的定位。此后，出现了多种算法 [12]–[14], [17] 用于二维近场目标定位。然而在未来无线感知场景中，目标更可能位于三维（3D）空间而非二维平面，尤其是当收发机配备大规模天线时，因此考虑三维近场目标定位十分重要。为此，[8] 与 [20] 比较了基于张量分解的若干三维目标定位估计器的性能；[18] 的作者基于 MLE 研究了赫兹偶极子源的全息定位；[16] 则研究了在三维空间跟踪单个近场目标的贝叶斯跟踪算法。

除近场定位算法设计外，另一条研究路线通过研究 Cramér–Rao 界（CRB）来考察近场定位的基本性能极限，CRB 刻画了任意无偏估计器的方差下界 [21], [22]。一般研究过两类 CRB：条件（或确定性）CRB [8], [13], [23]–[25] 与无条件（或随机）CRB [8], [18], [23], [25]–[29]，取决于对底层信号模型所作的假设。例如，当目标的复反射系数被视为未知但确定时使用条件 CRB，而假定其为具有未知协方差的零均值高斯随机过程时使用无条件 CRB [23]。本文关注在三维空间中对目标定位的条件 CRB [8]。

尽管已有上述进展，先前工作仍存在若干局限。多数文献要么在信道相位刻画中采用 Fresnel 近似 [12], [13], [23], [28]，要么忽略幅度变化 [8], [20], [24]–[27]。本文在近场信号建模中考虑精确球面波前，同时计入不同天线上的信道相位与幅度变化 [30]。虽然 [14]–[18], [29] 采用了球面波前，但它们要么考虑二维平面内的目标定位 [14], [15], [17], [29]，要么只考虑单个三维目标场景 [16], [18]。此外，上述工作都只在接收端或传感器阵列一侧研究近场定位，或把双站 MIMO 雷达系统 [8], [20], [26] 处理为假定正交发射波形与匹配滤波接收的情形。为便于面向未来无线网络感知应用的发射波形优化 [31]–[33]，使系统支持一般发射波形十分重要。最后，在未来密集部署的 6G 网络中，定位可能面临复杂杂波环境；然而此前所有文献都假设接收信号仅受白高斯噪声（white Gaussian noise，WGN）污染，这在未知杂波环境中可能并不准确。

本文在 MIMO 雷达系统中推导近场三维目标定位的 CRB，并研究估计器设计。我们考虑一般发射信号波形、随天线变化的精确球面波前（同时含信道相位与幅度变化）、多目标以及一般化的杂波建模。在该设定下，接收端的未知参数包括目标的三维坐标与复反射系数，以及噪声与干扰的协方差矩阵；我们的目标是估计目标的三维坐标。主要结果概括如下。

- 首先，我们推导了对应目标三维坐标与复反射系数的 Fisher 信息矩阵（FIM），并据此得到 CRB，从而为近场三维目标定位提供性能下界。作为特例，我们给出了单目标场景下 CRB 的闭式非矩阵解析表达式，并分析其关于目标距离与收发机天线尺寸的渐近标度行为。结果表明：当目标靠近收发机时，本文计入信道幅度变化的模型相比不考虑幅度变化的模型，能得到更准确的 CRB 与更准确的实际定位。
- 其次，我们基于最大似然（ML）准则提出两种实用的多目标定位估计器：3D-ACO 与 3D-CO-WGN。3D-ACO 适用于任意未知杂波环境，不预设噪声与干扰协方差矩阵的结构；3D-CO-WGN 则在假设接收端噪声为 WGN 的前提下推导得到。
- 最后，我们开展数值实验验证 CRB 分析并评估所提估计器性能。在 WGN 场景中，3D-CO-WGN 优于 3D-ACO，且两者在高 SNR 区间都逼近 CRB；在非 WGN 场景中，3D-ACO 优于 3D-CO-WGN。结果还表明：采用合适的非各向同性发射波形时，实际估计器可达到的 CRB 与定位性能可以优于传统各向同性发射设计，从而说明考虑一般发射波形的重要性。这些结果验证了所提估计器在实际场景中的有效性以及发射波形自适应的潜力。

## II. 系统模型

我们考虑如图 1 所示的 MIMO 雷达系统，它由含 \(N\) 根天线的雷达发射机（Tx）与含 \(M\) 根天线的雷达接收机（Rx）组成。Tx 与 Rx 的天线阵列可部署在同一平面或不同平面上，分别如图 1(a) 与 1(b) 所示。注意当 Tx 与 Rx 完全重叠时，图 1(a) 包含单站 MIMO 雷达作为特例。令 \(\mathbf l_n^t=(x_n^t,y_n^t,z_n^t)\)，\(n\in\mathcal N\triangleq\{1,2,\ldots,N\}\)，与 \(\mathbf l_m^r=(x_m^r,y_m^r,z_m^r)\)，\(m\in\mathcal M\triangleq\{1,2,\ldots,M\}\)，分别表示 Tx 第 \(n\) 根天线与 Rx 第 \(m\) 根天线的位置。假设存在 \(K\) 个位于 MIMO 雷达近场区域内的感知目标。令 \(\mathcal K\triangleq\{1,\ldots,K\}\) 表示目标集合，\(\mathbf l_k=(x_k,y_k,z_k)\)，\(k\in\mathcal K\)，表示第 \(k\) 个目标的位置。

在用于多目标定位的第 \(l\in\{1,\ldots,L\}\) 个符号处，令 \(\mathbf x_l\) 表示 Tx 的发射信号，并用 \(\mathbf X=[\mathbf x_1,\ldots,\mathbf x_L]\) 表示一个雷达驻留时间内 \(L\) 个符号上的总发射信号，则发射信号的样本协方差矩阵为

$$
\mathbf R_X=\frac1L\mathbf X\mathbf X^H.\tag{1}
$$

在窄带假设下，\(L\) 个符号上的接收信号由矩阵 \(\mathbf Y\in\mathbb C^{M\times L}\) 描述：

$$
\mathbf Y=\sum_{k=1}^{K}b_k\mathbf a(\mathbf l_k)\mathbf v^T(\mathbf l_k)\mathbf X+\mathbf Z,\tag{2}
$$

其中 \(\mathbf Z=[\mathbf z_1,\ldots,\mathbf z_L]\in\mathbb C^{M\times L}\) 表示噪声与干扰，其每一列均为独立同分布（i.i.d.）的零均值 CSCG 随机向量，协方差为 \(\mathbf Q\in\mathbb C^{M\times M}\)；\(b_k\) 表示与第 \(k\) 个目标雷达截面积（radar cross-section，RCS）成正比的目标复反射系数。这里考虑未知杂波环境，因此 \(\mathbf Q\) 是未知的。此外，式 (2) 中 \(\mathbf a(\mathbf l_k)\) 与 \(\mathbf v(\mathbf l_k)\) 分别表示第 \(k\) 个目标在 Rx 与 Tx 的导向矢量：

$$
\mathbf a(\mathbf l_k)=\left[\alpha_1^r(\mathbf l_k)e^{-\mathrm{j}\nu\|\mathbf l_1^r-\mathbf l_k\|},\ldots,\alpha_M^r(\mathbf l_k)e^{-\mathrm{j}\nu\|\mathbf l_M^r-\mathbf l_k\|}\right]^T,\tag{3}
$$

$$
\mathbf v(\mathbf l_k)=\left[\alpha_1^t(\mathbf l_k)e^{-\mathrm{j}\nu\|\mathbf l_1^t-\mathbf l_k\|},\ldots,\alpha_N^t(\mathbf l_k)e^{-\mathrm{j}\nu\|\mathbf l_N^t-\mathbf l_k\|}\right]^T,\tag{4}
$$

其中 \(\nu=\frac{2\pi}{\lambda}\) 为载波波数，\(\lambda\) 为波长，\(\alpha_m^r(\mathbf l_k)=\frac{\lambda}{4\pi\|\mathbf l_k-\mathbf l_m^r\|}\) 表示基于自由空间路径损耗模型、由第 \(k\) 个目标到第 \(m\) 根接收天线的距离决定的信道幅度，\(\alpha_n^t(\mathbf l_k)=\frac{\lambda}{4\pi\|\mathbf l_k-\mathbf l_n^t\|}\) 表示由第 \(k\) 个目标到第 \(n\) 根发射天线对应的信道幅度。注意式 (3) 与 (4) 假设各向同性天线且天线增益为 1。

为便于表述，把式 (2) 的接收信号 \(\mathbf Y\) 写成更紧凑的形式

$$
\mathbf Y=\mathbf A(\{\mathbf l_k\})\mathbf B\mathbf V^T(\{\mathbf l_k\})\mathbf X+\mathbf Z,\tag{5}
$$

其中

$$
\mathbf A(\{\mathbf l_k\})=[\mathbf a(\mathbf l_1),\mathbf a(\mathbf l_2),\ldots,\mathbf a(\mathbf l_K)]\in\mathbb C^{M\times K},\tag{6}
$$

$$
\mathbf V(\{\mathbf l_k\})=[\mathbf v(\mathbf l_1),\mathbf v(\mathbf l_2),\ldots,\mathbf v(\mathbf l_K)]\in\mathbb C^{N\times K},\tag{7}
$$

$$
\mathbf b=[b_1,\ldots,b_K]^T=[b_{R1}+\mathrm{j}b_{I1},\ldots,b_{RK}+\mathrm{j}b_{IK}]^T,\tag{8}
$$

$$
\mathbf B=\operatorname{diag}(\mathbf b),\tag{9}
$$

其中 \(b_{Rk}\) 与 \(b_{Ik}\) 分别表示 \(b_k\) 的实部与虚部。式 (5) 中的未知参数包括三维目标位置 \(\{\mathbf l_k\}\)、复反射系数 \(\mathbf b\) 以及噪声与干扰协方差矩阵 \(\mathbf Q\)。

## III. 近场 CRB

本节基于式 (5) 的接收信号 \(\mathbf Y\)，推导估计多个近场目标三维坐标的 CRB。具体而言，第 III-A 节先推导多目标一般情形的 CRB，第 III-B 节再给出单目标定位时 CRB 的闭式非矩阵解析表达式及其相应的渐近分析。

### A. 多目标一般情形

令 \(\tilde{\boldsymbol\theta}\in\mathbb R^{5K+M^2}\) 表示包含目标相关参数向量 \(\boldsymbol\theta\) 与协方差矩阵 \(\mathbf Q\) 中全部实未知量的向量，其中 \(\boldsymbol\theta\) 定义为

$$
\boldsymbol\theta=[x_1,\ldots,x_K,y_1,\ldots,y_K,z_1,\ldots,z_K,b_{R1},..,b_{RK},b_{I1},\ldots,b_{IK}]^T=[\mathbf x,\mathbf y,\mathbf z,\mathbf b_R,\mathbf b_I]^T\in\mathbb R^{5K},\tag{10}
$$

而 \(\mathbf Q\) 中有 \(M^2\) 个未知的冗余实参数。令 \(\mathbf y\triangleq\operatorname{vec}(\mathbf Y)\)。由式 (5) 有

$$
\mathbf y=\left[(\mathbf A\mathbf B\mathbf V^T\mathbf x_1)^T+\mathbf z_1^T,\ldots,(\mathbf A\mathbf B\mathbf V^T\mathbf x_L)^T+\mathbf z_L^T\right]^T,\tag{11}
$$

它是复高斯随机向量，均值向量为

$$
\boldsymbol\mu(\tilde{\boldsymbol\theta})=\left[(\mathbf A\mathbf B\mathbf V^T\mathbf x_1)^T,\ldots,(\mathbf A\mathbf B\mathbf V^T\mathbf x_L)^T\right]^T\tag{12}
$$

协方差矩阵为

$$
\mathbf C(\tilde{\boldsymbol\theta})=\begin{bmatrix}\mathbf Q&\mathbf 0&\mathbf 0\\\mathbf 0&\ddots&\mathbf 0\\\mathbf 0&\mathbf 0&\mathbf Q\end{bmatrix}\in\mathbb C^{ML\times ML},\tag{13}
$$

即 \(\mathbf y\sim\mathcal{CN}(\boldsymbol\mu(\tilde{\boldsymbol\theta}),\mathbf C(\tilde{\boldsymbol\theta}))\)。这里式 (13) 成立，是因为不同快拍上的观测彼此不相关。于是有如下命题。

**命题 1。** 基于式 (11)，\(\tilde{\boldsymbol\theta}\) 的总体 FIM（记为 \(\tilde{\mathbf F}\in\mathbb R^{(5K+M^2)\times(5K+M^2)}\)）为

$$
\tilde{\mathbf F}(\tilde\theta_i,\tilde\theta_j)=L\operatorname{tr}\left[\mathbf Q^{-1}\frac{\partial\mathbf Q}{\partial\tilde\theta_i}\mathbf Q^{-1}\frac{\partial\mathbf Q}{\partial\tilde\theta_j}\right]+2\Re\operatorname{tr}\left[\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial\tilde\theta_i}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial\tilde\theta_j}\right)\right],\tag{14}
$$

其中 \(\tilde{\mathbf F}(\tilde\theta_i,\tilde\theta_j)\) 表示 FIM \(\tilde{\mathbf F}\) 的第 \((i,j)\) 个元素。

**证明：** 见附录 A。

基于命题 1，有 \(\tilde{\mathbf F}[1:5K,\,5K+1:5K+M^2]=\mathbf 0_{5K\times M^2}\)。这是因为在 \(\tilde{\mathbf F}(\tilde\theta_i,\tilde\theta_j)\) 的每个元素中，\(\tilde\theta_i\in\boldsymbol\theta\)、\(\tilde\theta_j\in\tilde{\boldsymbol\theta}\setminus\boldsymbol\theta\)（\(\setminus\) 表示集合差），因此式 (14) 中的导数项会消失。相应地，\(\tilde{\mathbf F}[5K+1:5K+M^2,\,1:5K]=\tilde{\mathbf F}^T[1:5K,\,5K+1:5K+M^2]=\mathbf 0_{M^2\times5K}\)。因此，总体 FIM \(\tilde{\mathbf F}\) 关于 \(\boldsymbol\theta\) 中的目标相关未知量与 \(\mathbf Q\) 中的冗余参数呈块对角结构，从而可以分别计算 \(\boldsymbol\theta\) 与 \(\mathbf Q\) 的 CRB。由于主要关注 \(\{\mathbf l_k\}\) 的 CRB，只需找到对应 \(\{\{\mathbf l_k\},\mathbf b\}\) 的 FIM \(\mathbf F\)，即 \(\mathbf F=\tilde{\mathbf F}[1:5K,1:5K]\)，如下所示。

**命题 2。** 关于 \(\boldsymbol\theta\) 的 FIM \(\mathbf F\in\mathbb R^{5K\times5K}\) 为

$$
2\begin{bmatrix}
\Re(\mathbf F_{\mathbf x\mathbf x}) & \Re(\mathbf F_{\mathbf x\mathbf y}) & \Re(\mathbf F_{\mathbf x\mathbf z}) & \Re(\mathbf F_{\mathbf x\mathbf b}) & -\Im(\mathbf F_{\mathbf x\mathbf b})\\
\Re(\mathbf F_{\mathbf x\mathbf y}^T) & \Re(\mathbf F_{\mathbf y\mathbf y}) & \Re(\mathbf F_{\mathbf y\mathbf z}) & \Re(\mathbf F_{\mathbf y\mathbf b}) & -\Im(\mathbf F_{\mathbf y\mathbf b})\\
\Re(\mathbf F_{\mathbf x\mathbf z}^T) & \Re(\mathbf F_{\mathbf y\mathbf z}^T) & \Re(\mathbf F_{\mathbf z\mathbf z}) & \Re(\mathbf F_{\mathbf z\mathbf b}) & -\Im(\mathbf F_{\mathbf z\mathbf b})\\
\Re(\mathbf F_{\mathbf x\mathbf b}^T) & \Re(\mathbf F_{\mathbf y\mathbf b}^T) & \Re(\mathbf F_{\mathbf z\mathbf b}^T) & \Re(\mathbf F_{\mathbf b\mathbf b}) & -\Im(\mathbf F_{\mathbf b\mathbf b})\\
-\Im(\mathbf F_{\mathbf x\mathbf b}^T) & -\Im(\mathbf F_{\mathbf y\mathbf b}^T) & -\Im(\mathbf F_{\mathbf z\mathbf b}^T) & -\Im(\mathbf F_{\mathbf b\mathbf b}^T) & \Re(\mathbf F_{\mathbf b\mathbf b})
\end{bmatrix},\tag{15}
$$

其中 \(\mathbf F_{\mathbf x\mathbf x}\)、\(\mathbf F_{\mathbf y\mathbf y}\) 与 \(\mathbf F_{\mathbf z\mathbf z}\) 由下式给出

$$
\mathbf F_{uu}=L(\dot{\mathbf A}_u^H\mathbf Q^{-1}\dot{\mathbf A}_u)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\mathbf V\mathbf B)+L(\dot{\mathbf A}_u^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\dot{\mathbf V}_u\mathbf B)+L(\mathbf A^H\mathbf Q^{-1}\dot{\mathbf A}_u)\odot(\mathbf B^*\dot{\mathbf V}_u^H\mathbf R_X^*\mathbf V\mathbf B)+L(\mathbf A^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\dot{\mathbf V}_u^H\mathbf R_X^*\dot{\mathbf V}_u\mathbf B),\quad u\in\{\mathbf x,\mathbf y,\mathbf z\},\tag{16}
$$

\(\mathbf F_{\mathbf x\mathbf y}\)、\(\mathbf F_{\mathbf x\mathbf z}\) 与 \(\mathbf F_{\mathbf y\mathbf z}\) 由下式给出

$$
\mathbf F_{uv}=L(\dot{\mathbf A}_u^H\mathbf Q^{-1}\dot{\mathbf A}_v)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\mathbf V\mathbf B)+L(\dot{\mathbf A}_u^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\dot{\mathbf V}_v\mathbf B)+L(\mathbf A^H\mathbf Q^{-1}\dot{\mathbf A}_v)\odot(\mathbf B^*\dot{\mathbf V}_u^H\mathbf R_X^*\mathbf V\mathbf B)+L(\mathbf A^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\dot{\mathbf V}_u^H\mathbf R_X^*\dot{\mathbf V}_v\mathbf B),\quad uv\in\{\mathbf x\mathbf y,\mathbf x\mathbf z,\mathbf y\mathbf z\},\tag{17}
$$

而 \(\mathbf F_{\mathbf b\mathbf b}\)、\(\mathbf F_{\mathbf x\mathbf b}\)、\(\mathbf F_{\mathbf y\mathbf b}\) 与 \(\mathbf F_{\mathbf z\mathbf b}\) 由下式给出

$$
\mathbf F_{\mathbf b\mathbf b}=L(\mathbf A^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf V^H\mathbf R_X^*\mathbf V),\tag{18}
$$

$$
\mathbf F_{u\mathbf b}=L(\dot{\mathbf A}_u^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\mathbf V)+L(\mathbf A^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\dot{\mathbf V}_u^H\mathbf R_X^*\mathbf V),\quad u\in\{\mathbf x,\mathbf y,\mathbf z\},\tag{19}
$$

这里

$$
\dot{\mathbf A}_u=\left[\frac{\partial\mathbf a(\mathbf l_1)}{\partial u_1},\ldots,\frac{\partial\mathbf a(\mathbf l_K)}{\partial u_K}\right],\quad u\in\{\mathbf x,\mathbf y,\mathbf z\},\tag{20}
$$

$$
\dot{\mathbf V}_u=\left[\frac{\partial\mathbf v(\mathbf l_1)}{\partial u_1},\ldots,\frac{\partial\mathbf v(\mathbf l_K)}{\partial u_K}\right],\quad u\in\{\mathbf x,\mathbf y,\mathbf z\},\tag{21}
$$

$$
\left(\frac{\partial\mathbf a(\mathbf l_k)}{\partial u_k}\right)_m=a_m(\mathbf l_k)\left(\frac{u_m^r-u_k}{\|\mathbf l_m^r-\mathbf l_k\|^2}+\mathrm{j}\nu\frac{u_m^r-u_k}{\|\mathbf l_m^r-\mathbf l_k\|}\right),\tag{22}
$$

$$
\left(\frac{\partial\mathbf v(\mathbf l_k)}{\partial u_k}\right)_n=v_n(\mathbf l_k)\left(\frac{u_n^t-u_k}{\|\mathbf l_n^t-\mathbf l_k\|^2}+\mathrm{j}\nu\frac{u_n^t-u_k}{\|\mathbf l_n^t-\mathbf l_k\|}\right).\tag{23}
$$

在式 (22) 与 (23) 中，\(a_m(\mathbf l_k)\) 与 \(v_n(\mathbf l_k)\) 分别表示 \(\mathbf a(\mathbf l_k)\) 的第 \(m\) 个元素与 \(\mathbf v(\mathbf l_k)\) 的第 \(n\) 个元素。

**证明：** 见附录 B。

利用命题 2，我们得到对应 \(\boldsymbol\theta\) 中目标相关参数的完整 FIM \(\mathbf F\)。估计 \(\boldsymbol\theta\) 的 CRB 矩阵 \(\mathbf C\) 为

$$
\mathbf C=\mathbf F^{-1}.\tag{24}
$$

由式 (10)，估计第 \(k\) 个目标位置 \(\mathbf l_k\) 的和 CRB 为

$$
\mathrm{CRB}_k=\mathrm{CRB}_{k,x}+\mathrm{CRB}_{k,y}+\mathrm{CRB}_{k,z}=\mathbf C[k,k]+\mathbf C[k+K,k+K]+\mathbf C[k+2K,k+2K],\tag{25}
$$

其中 \(\mathrm{CRB}_{k,u}\)，\(u\in\{\mathbf x,\mathbf y,\mathbf z\}\)，表示估计第 \(k\) 个目标 \(u\) 坐标的 CRB。

本文推导的 CRB 在以下方面比 [8] 更具一般性。首先，式 (1) 与 (2) 考虑一般发射波形，其样本协方差矩阵 \(\mathbf R_X\) 可为任意半正定矩阵，而 [8] 聚焦于 \(\mathbf R_X=\mathbf I\) 的正交波形。其次，式 (2) 考虑一般的未知噪声与干扰协方差矩阵 \(\mathbf Q\)，而 [8] 假设 WGN 模型 \(\mathbf Q=\sigma^2\mathbf I\)。最后，式 (3) 与 (4) 考虑天线间一般的信道幅度变化，而 [8] 采用简化常幅度模型 \(\alpha_1^r(\mathbf l_k)=\cdots=\alpha_M^r(\mathbf l_k)\triangleq\alpha^r(\mathbf l_k)\) 与 \(\alpha_1^t(\mathbf l_k)=\cdots=\alpha_N^t(\mathbf l_k)\triangleq\alpha^t(\mathbf l_k)\)，并把往返路径损耗并入目标复反射系数。

### B. 单目标与 WGN 的特例

本小节推导仅存在一个感知目标且噪声为 WGN 时的 CRB 闭式表达。此时 \(\mathbf Q=\sigma^2\mathbf I\)，其中 \(\sigma^2\) 为每根接收天线处待估计的噪声功率。于是有如下命题。

**命题 3。** 在 Rx 端为 WGN 时，单目标位置的 CRB 为

$$
\mathrm{CRB}=\mathrm{CRB}_x+\mathrm{CRB}_y+\mathrm{CRB}_z,\tag{26}
$$

其中

$$
\mathrm{CRB}_x=\frac{\sigma^2\left[(\tilde f_{yy}-f_{yy}^R)(\tilde f_{zz}-f_{zz}^R)-(\Re(\tilde f_{yz}-f_{yz}^R))^2\right]}{2|b|^2L|\tilde{\mathbf D}|},
$$
$$
\mathrm{CRB}_y=\frac{\sigma^2\left[(\tilde f_{xx}-f_{xx}^R)(\tilde f_{zz}-f_{zz}^R)-(\Re(\tilde f_{xz}-f_{xz}^R))^2\right]}{2|b|^2L|\tilde{\mathbf D}|},
$$
$$
\mathrm{CRB}_z=\frac{\sigma^2\left[(\tilde f_{xx}-f_{xx}^R)(\tilde f_{yy}-f_{yy}^R)-(\Re(\tilde f_{xy}-f_{xy}^R))^2\right]}{2|b|^2L|\tilde{\mathbf D}|},
$$

其中

$$
\tilde{\mathbf D}=\begin{bmatrix}\tilde f_{xx}-f_{xx}^R&\Re(\tilde f_{xy}-f_{xy}^R)&\Re(\tilde f_{xz}-f_{xz}^R)\\\Re(\tilde f_{xy}-f_{xy}^R)&\tilde f_{yy}-f_{yy}^R&\Re(\tilde f_{yz}-f_{yz}^R)\\\Re(\tilde f_{xz}-f_{xz}^R)&\Re(\tilde f_{yz}-f_{yz}^R)&\tilde f_{zz}-f_{zz}^R\end{bmatrix},\tag{27}
$$

$$
\tilde f_{uu}=\|\dot{\mathbf a}_u\|^2\mathbf v^H\mathbf R_X^*\mathbf v+\dot{\mathbf a}_u^H\mathbf a\mathbf v^H\mathbf R_X^*\dot{\mathbf v}_u+\mathbf a^H\dot{\mathbf a}_u\dot{\mathbf v}_u^H\mathbf R_X^*\mathbf v+\|\mathbf a\|^2\dot{\mathbf v}_u^H\mathbf R_X^*\dot{\mathbf v}_u,\quad u\in\{\mathbf x,\mathbf y,\mathbf z\},\tag{28}
$$

$$
\tilde f_{uv}=\dot{\mathbf a}_u^H\dot{\mathbf a}_v\mathbf v^H\mathbf R_X^*\mathbf v+\dot{\mathbf a}_u^H\mathbf a\mathbf v^H\mathbf R_X^*\dot{\mathbf v}_v+\mathbf a^H\dot{\mathbf a}_v\dot{\mathbf v}_u^H\mathbf R_X^*\mathbf v+\|\mathbf a\|^2\dot{\mathbf v}_u^H\mathbf R_X^*\dot{\mathbf v}_v,\quad uv\in\{\mathbf x\mathbf y,\mathbf x\mathbf z,\mathbf y\mathbf z\},\tag{29}
$$

$$
f_{uu}^R=\frac{|\dot{\mathbf a}_u^H\mathbf a\mathbf v^H\mathbf R_X^*\mathbf v+\|\mathbf a\|^2\dot{\mathbf v}_u^H\mathbf R_X^*\mathbf v|^2}{\|\mathbf a\|^2\mathbf v^H\mathbf R_X^*\mathbf v},\quad u\in\{\mathbf x,\mathbf y,\mathbf z\},\tag{30}
$$

$$
f_{uv}^R=\frac{1}{\|\mathbf a\|^2\mathbf v^H\mathbf R_X^*\mathbf v}\left(\dot{\mathbf a}_u^H\mathbf a\mathbf v^H\mathbf R_X^*\mathbf v+\|\mathbf a\|^2\dot{\mathbf v}_u^H\mathbf R_X^*\mathbf v\right)\left(\dot{\mathbf a}_v^H\mathbf a\mathbf v^H\mathbf R_X^*\mathbf v+\|\mathbf a\|^2\dot{\mathbf v}_v^H\mathbf R_X^*\mathbf v\right)^H,\quad uv\in\{\mathbf x\mathbf y,\mathbf x\mathbf z,\mathbf y\mathbf z\}.\tag{31}
$$

**证明：** 见附录 C。

容易看出，目标位置的 CRB 是发射波形样本协方差矩阵 \(\mathbf R_X\) 的函数。还可以观察到，CRB 与噪声功率 \(\sigma^2\) 成正比，而与复反射系数幅度平方 \(|b|^2\) 及总发射波形长度 \(L\) 成反比。为获得更多洞见，下面分析 CRB 关于目标距离与收发机天线尺寸的标度与行为。

为此，我们进一步考虑图 2 所示只含单个目标的单站 MIMO 雷达特例。该设定下 Rx/Tx 完全重叠，并假设目标位于 \(z\) 轴上、位置为 \((0,0,d)\)。不失一般性，在本小节余下部分我们考虑方形均匀平面阵列（uniform planar array，UPA），其中 \(N=M=n^2\)，\(n\) 为奇数，表示 \(x\) 与 \(y\) 两个维度上的天线数。令 \(s\) 为相邻天线的均匀间距；假设阵列中心与 \(z\) 轴重合。此外采用常用传输策略，即各向同性发射 \(\mathbf R_X=\mathbf I\)。在上述设定下，我们试图把式 (26) 中的 CRB 表示为平面阵列中心到目标的距离 \(d\)、天线间距 \(s\) 与每个维度天线数 \(n\) 的函数，并据此分析其渐近行为。有如下命题。

**命题 4。** 在图 2 的设定下，目标位置 CRB 的闭式表达为

$$
\mathrm{CRB}=\frac{\sigma^2}{4|b|^2L}\left[\frac{2}{\|\mathbf a\|^2\|\dot{\mathbf a}_x\|^2}+\frac{1}{\|\mathbf a\|^2\|\dot{\mathbf a}_z\|^2-|\dot{\mathbf a}_z^H\mathbf a|^2}\right],\tag{32}
$$

其中

$$
\mathrm{CRB}_x=\mathrm{CRB}_y=\frac{\sigma^2}{4|b|^2L}\frac{1}{\|\mathbf a\|^2\|\dot{\mathbf a}_x\|^2},\tag{33}
$$

$$
\mathrm{CRB}_z=\frac{\sigma^2}{4|b|^2L}\frac{1}{\|\mathbf a\|^2\|\dot{\mathbf a}_z\|^2-|\dot{\mathbf a}_z^H\mathbf a|^2},\tag{34}
$$

且

$$
\|\mathbf a\|^2=\frac{1}{4\nu^2}\left(\frac{1}{d^2}+4\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}\frac{1}{d^2+i^2s^2+k^2s^2}\right),\tag{35}
$$

$$
\|\dot{\mathbf a}_x\|^2=\frac{D_1^x+\nu^2D_2^x}{4\nu^2},\qquad\|\dot{\mathbf a}_z\|^2=\frac{d^2}{4\nu^2}(D_1^z+\nu^2D_2^z),\tag{36}
$$

$$
\dot{\mathbf a}_z^H\mathbf a=\frac{d}{4\nu^2}(-D_2^z+\mathrm{j}\nu D_3^z),\tag{37}
$$

其中

$$
D_1^x=4\sum_{i=1}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}\frac{k^2s^2}{(d^2+i^2s^2+k^2s^2)^3}+2\sum_{k=1}^{\frac{n-1}{2}}\frac{k^2s^2}{(d^2+k^2s^2)^3},
$$
$$
D_2^x=4\sum_{i=1}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}\frac{k^2s^2}{(d^2+i^2s^2+k^2s^2)^2}+2\sum_{k=1}^{\frac{n-1}{2}}\frac{k^2s^2}{(d^2+k^2s^2)^2},
$$
$$
D_1^z=\frac{1}{d^6}+4\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}\frac{1}{(d^2+i^2s^2+k^2s^2)^3},
$$
$$
D_2^z=\frac{1}{d^4}+4\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}\frac{1}{(d^2+i^2s^2+k^2s^2)^2},
$$
$$
D_3^z=\frac{1}{d^3}+4\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}\frac{1}{(d^2+i^2s^2+k^2s^2)^{\frac32}}.
$$

**证明：** 见附录 D。

命题 4 中的 CRB 被表示为三个关键系统参数的函数，即 \(\mathrm{CRB}=f(n,d,s)\)。

**命题 5。** 在图 2 的设定下，有

$$
\lim_{d\to\infty}\frac{\mathrm{CRB}_x}{d^6}=\lim_{d\to\infty}\frac{\mathrm{CRB}_y}{d^6}=\frac{48\sigma^2}{|b|^2L}\frac{\nu^2}{(n^2-1)n^4s^2},\tag{38}
$$

以及

$$
\lim_{d\to\infty}\frac{\mathrm{CRB}_z}{d^8}=\frac{1440\sigma^2}{|b|^2L}\frac{\nu^2}{(n^2-1)n^4(n^2-4)s^4}.\tag{39}
$$

**证明：** 见附录 E。

根据命题 5，在图 2 的单站 MIMO 雷达设定下，当 \(d\) 足够大时，\(\mathrm{CRB}_x\)、\(\mathrm{CRB}_y\) 与 \(\mathrm{CRB}_z\) 可近似为

$$
\mathrm{CRB}_x=\mathrm{CRB}_y\approx\frac{48\sigma^2}{|b|^2L}\frac{\nu^2}{(n^2-1)n^4s^2}d^6,\tag{40}
$$

以及

$$
\mathrm{CRB}_z\approx\frac{1440\sigma^2}{|b|^2L}\frac{\nu^2}{(n^2-1)n^4(n^2-4)s^4}d^8.\tag{41}
$$

当 \(d\) 增大时，\(z\) 坐标的 CRB 恶化得比 \(x\)、\(y\) 坐标的 CRB 快得多。这非常直观：在该特例中，\(z\) 坐标的分辨率对应目标与阵列之间距离的分辨率。当目标继续远离时，球面波前逐渐变为平面波前，阵列不再能准确分辨距离。还值得注意的是，\(\mathrm{CRB}_z\) 与 \(n^8\) 成反比，这与 \(\mathrm{CRB}_x\) 与 \(\mathrm{CRB}_y\) 的 \(n^6\) 形成鲜明对比。这再次印证了大规模天线阵列对精确定位目标三维坐标的重要性。

当 \(d\) 固定、天线孔径或 \(n\) 增大时，有如下命题。

**命题 6。** 在图 2 的设定下，有

$$
\lim_{n\to\infty}\mathrm{CRB}_x=\lim_{n\to\infty}\mathrm{CRB}_y=0,\tag{42}
$$

$$
\lim_{n\to\infty}\mathrm{CRB}_z=0.\tag{43}
$$

相应地，\(\lim_{n\to\infty}\mathrm{CRB}=0\)。

**证明：** 见附录 F。

当目标到天线阵列中心的距离 \(d\) 固定、而天线孔径增大时，必须采用同时考虑不同天线上与距离相关的相位和幅度变化的精确球面波前模型。在此场景下，命题 6 表明更大的天线孔径总能降低目标位置的总 CRB，且当 \(n\to\infty\) 时 CRB 渐近趋于零。

## IV. 实际估计器设计

接下来，我们基于式 (5) 并遵循 ML 准则，分别提出两种实用的近场定位算法：3D-ACO 与 3D-CO-WGN。

### A. 3D-ACO

3D-ACO 估计器由两个主要步骤组成：第一步是得到仅以全部目标三维坐标为变量的集中负对数似然函数；第二步是应用循环优化技术 [34] 求解每个目标的三维坐标。

先讨论如何得到集中负对数似然函数。回顾 \(\mathbf y\triangleq\operatorname{vec}(\mathbf Y)\sim\mathcal{CN}(\boldsymbol\mu,\mathbf C)\)，其中 \(\boldsymbol\mu\) 与 \(\mathbf C\) 分别由式 (12) 与 (13) 给出；为简洁起见此处省略 \(\tilde{\boldsymbol\theta}\)。于是 \(\mathbf y\) 的负对数似然函数为

$$
-\ln f(\mathbf y)=-\ln\frac{1}{\pi^{LM}|\mathbf C|}+(\mathbf y-\boldsymbol\mu)^H\mathbf C^{-1}(\mathbf y-\boldsymbol\mu).\tag{44}
$$

略去常数项后，式 (44) 的负对数似然可改写为

$$
f_1(\mathbf Q,\{b_k\},\{\mathbf l_k\})=L\ln|\mathbf Q|+\operatorname{tr}\left[(\mathbf Y-\mathbf A\mathbf B\mathbf V^T\mathbf X)(\mathbf Y-\mathbf A\mathbf B\mathbf V^T\mathbf X)^H\mathbf Q^{-1}\right].\tag{45}
$$

令 \(\mathbf W\triangleq(\mathbf Y-\mathbf A\mathbf B\mathbf V^T\mathbf X)(\mathbf Y-\mathbf A\mathbf B\mathbf V^T\mathbf X)^H\)，则式 (46) 为

$$
f_1(\mathbf Q,\{b_k\},\{\mathbf l_k\})=L\ln|\mathbf Q|+\operatorname{tr}(\mathbf W\mathbf Q^{-1}).\tag{46}
$$

通过关于 \(\mathbf Q\) 最大化对数似然（等价于最小化 \(f_1\)），得到 \(\mathbf Q\) 的估计

$$
\mathbf Q^\star=\frac1L\mathbf W.\tag{47}
$$

把式 (47) 代入式 (46)，得

$$
f_1\!\left(\frac1L\mathbf W,\{b_k\},\{\mathbf l_k\}\right)=L\ln\left(\frac1L\right)^M+L\ln|\mathbf W|+LM.\tag{48}
$$

忽略第一项与第三项常数项后，式 (48) 中 \(f_1\) 的最小化等价于最小化

$$
f_2(\{b_k\},\{\mathbf l_k\})=L\ln|\mathbf W|=L\ln\left|(\mathbf Y-\mathbf A\operatorname{diag}(\mathbf b)\mathbf V^T\mathbf X)(\mathbf Y-\mathbf A\operatorname{diag}(\mathbf b)\mathbf V^T\mathbf X)^H\right|.\tag{49}
$$

下一步，我们关于三维目标位置 \(\{\mathbf l_k\}\) 与目标反射系数 \(\mathbf b\) 最小化 \(f_2\)。先在给定 \(\{\mathbf l_k\}\) 时得到复反射系数向量 \(\mathbf b\) 的估计。注意式 (5) 中的接收数据矩阵属于称为对角增长曲线（diagonal growth curve，DGC）模型的规范形式 [35]。因此，我们采用 [35] 中的近似最大似然（approximate maximum likelihood，AML）估计器得到 \(\mathbf b\) 的 AML 估计：

$$
\widehat{\mathbf b}=\left[(\mathbf A^H\mathbf J^{-1}\mathbf A)\odot(\mathbf S\mathbf S^H)^T\right]^{-1}\operatorname{vecd}\left(\mathbf A^H\mathbf J^{-1}\mathbf Y\mathbf S^H\right),\tag{50}
$$

其中 \(\operatorname{vecd}(\cdot)\) 表示由给定矩阵的对角元素构成的列向量，且

$$
\mathbf S=\mathbf V^T\mathbf X,\tag{51}
$$

$$
\mathbf J=\frac1L\mathbf Y\mathbf Y^H-\frac1L\mathbf Y\mathbf S^H(\mathbf S\mathbf S^H)^{-1}\mathbf S\mathbf Y^H.\tag{52}
$$

**算法 1：用于目标定位的 3D-ACO**

- 输入：\(\mathbf X\)、\(\mathbf Y\)、\(K_{\max}\)、\(\epsilon\)，以及 \(\mathbf L\in\mathbb R^{3\times K_{\max}}\)。
1. \(\widehat K\leftarrow1\)。
2. 把使式 (53) 中 \(f_3\) 最小的 \(\mathbf l_1=[x_1,y_1,z_1]^T\) 估计为 \(\widehat{\mathbf l}_1\)。
3. \(\mathbf L[:,1]\leftarrow\widehat{\mathbf l}_1\)。
4. 当 \(\widehat K<K_{\max}\) 时循环：
5. \(\widehat K\leftarrow\widehat K+1\)。
6. 在固定 \(\{\widehat{\mathbf l}_m\}_{m=1}^{\widehat K-1}\) 的情况下，把使式 (53) 中 \(f_3\) 最小的 \(\mathbf l_{\widehat K}=[x_{\widehat K},y_{\widehat K},z_{\widehat K}]^T\) 估计为 \(\widehat{\mathbf l}_{\widehat K}\)。
7. 用新估计的 \(\widehat{\mathbf l}_{\widehat K}\) 更新基于 \(\{\widehat{\mathbf l}_m\}_{m=1}^{\widehat K}\) 的 \(f_3\)。
8. \(\mathbf L[:,\widehat K]\leftarrow\widehat{\mathbf l}_{\widehat K}\)。
9. \(f_{\rm old}\leftarrow f_3(\{\widehat{\mathbf l}_m\}_{m=1}^{\widehat K})+2\epsilon\)，\(f_{\rm new}\leftarrow f_3(\{\widehat{\mathbf l}_m\}_{m=1}^{\widehat K})\)。
10. \(p\leftarrow1\)。
11. 当 \((f_{\rm old}-f_{\rm new}>\epsilon)\) 时循环：
12. \(f_{\rm old}\leftarrow f_{\rm new}\)。
13. 在固定 \(\{\widehat{\mathbf l}_m\}_{m=1,m\neq p}^{\widehat K}\) 的情况下，把使式 (53) 中 \(f_3\) 最小的 \(\mathbf l_p=[x_p,y_p,z_p]^T\) 估计为 \(\widehat{\mathbf l}_p\)。
14. 用新估计的 \(\widehat{\mathbf l}_p\) 更新基于 \(\{\widehat{\mathbf l}_m\}_{m=1}^{\widehat K}\) 的 \(f_3\)。
15. \(\mathbf L[:,p]\leftarrow\widehat{\mathbf l}_p\)。
16. \(f_{\rm new}\leftarrow f_3(\{\widehat{\mathbf l}_m\}_{m=1}^{\widehat K})\)。
17. \(p\leftarrow\bmod(p,\widehat K)+1\)。
18. 结束内层循环。
19. 结束外层循环。
20. \(\mathbf l_k^{\rm ACO}=\mathbf L[:,k]\)，\(k=1,2,\ldots,K_{\max}\)。
- 输出：\(\{\mathbf l_k^{\rm ACO}\}_{k=1}^{K_{\max}}\)。

结合式 (49)–(52)，得到集中负对数似然函数 \(f_3(\{\mathbf l_k\})\)：

$$
f_3(\{\mathbf l_k\})=L\ln\left|(\mathbf Y-\mathbf A\operatorname{diag}(\widehat{\mathbf b})\mathbf S)(\mathbf Y-\mathbf A\operatorname{diag}(\widehat{\mathbf b})\mathbf S)^H\right|,\tag{53}
$$

其中 \(\widehat{\mathbf b}\)、\(\mathbf S\) 与 \(\mathbf J\) 分别由式 (50)、(51)、(52) 给出。式 (53) 中的未知量数目已减少到 \(3K\) 个。

接下来通过最小化 \(f_3(\{\mathbf l_k\})\) 求解全部目标位置 \(\{\mathbf l_k\}\)。为此采用循环优化技术，其流程汇总于算法 1，并按循环方式实现。首先，通过三维穷举搜索找到式 (53) 中 \(f_3\) 的最小点，估计单个目标的位置（算法 1 第 1–3 步）。然后，若 \(K_{\max}>1\)，逐步增加期望目标数 \(\widehat K\)；在给定 \(\widehat K\) 下，循环估计 \(\widehat K\) 个目标的位置。换言之，每次迭代把其他目标的位置视为固定，通过三维穷举搜索估计每个目标的位置（算法 1 第 6–19 步）。循环迭代在满足某种收敛判据时终止，例如连续两次迭代间 \(f_3\) 的相对变化小于预设阈值 \(\epsilon\)（算法 1 第 11 步）。最后，当期望目标数 \(\widehat K\) 达到预设最大值 \(K_{\max}\) 时，外层迭代终止（算法 1 第 4 步）。

每次三维穷举搜索的复杂度通常很大。为降低复杂度，我们先指定初始搜索网格，得到目标位置的粗估计；再在粗估计附近，以逐次缩小的网格搜索尺寸迭代地获得更好的估计。

注意我们假设目标数 \(K\) 事先已知，并据此把算法 1 中的最大搜索数量设为 \(K_{\max}\)。通过结合模型阶数选择规则 [36]，该估计器可推广到 \(K\) 先验未知的情形。

### B. WGN 下的 3D-CO-WGN 估计器

上一小节提出的 3D-ACO 估计器适用于一般 \(\mathbf Q\)。然而，若事先掌握关于 \(\mathbf Q\) 结构的先验知识，可以找到更好的估计器。假设

$$
\mathbf Q=\sigma^2\mathbf I,\tag{54}
$$

其中 \(\sigma^2\) 为未知噪声方差，并假设所有接收天线上相同，我们基于这一被广泛采用的 \(\mathbf Q\) 假设推导另一个估计器。

当 \(\mathbf Q\) 如式 (54) 指定时，式 (45) 中的负似然函数简化为

$$
f_1^{\rm WGN}(\sigma^2,\{b_k\},\{\mathbf l_k\})=LM\ln\sigma^2+\frac{1}{\sigma^2}\sum_{l=1}^{L}\left\|\mathbf y_l-\mathbf A\operatorname{diag}(\mathbf b)\mathbf V^T\mathbf x_l\right\|^2,\tag{55}
$$

其中 \(\sigma^2\) 未知。把 \(f_1^{\rm WGN}\) 对 \(\sigma^2\) 求导并令其为零，得

$$
(\sigma^2)^\star=\frac{1}{LM}\sum_{l=1}^{L}\left\|\mathbf y_l-\mathbf A\operatorname{diag}(\mathbf b)\mathbf V^T\mathbf x_l\right\|^2.\tag{56}
$$

把该 \(\sigma^2\) 估计代回式 (55)，得

$$
f_1^{\rm WGN}\!\left((\sigma^2)^\star,\{b_k\},\{\mathbf l_k\}\right)=-LM\ln(LM)+LM\ln\left(\sum_{l=1}^{L}\left\|\mathbf y_l-\mathbf A\operatorname{diag}(\mathbf b)\mathbf V^T\mathbf x_l\right\|^2\right)+LM.\tag{57}
$$

忽略第一项与第三项常数项，并注意自然对数函数单调递增，式 (57) 中 \(f_1^{\rm WGN}\) 的最小化等价于最小化

$$
f_2^{\rm WGN}(\mathbf b,\{\mathbf l_k\})=\sum_{l=1}^{L}\left\|\mathbf y_l-\mathbf A\operatorname{diag}(\mathbf b)\mathbf V^T\mathbf x_l\right\|^2=\sum_{l=1}^{L}\left\|\left(\mathbf y_l-\sum_{k\neq i}b_k\mathbf a(\mathbf l_k)\mathbf v^T(\mathbf l_k)\mathbf x_l\right)-b_i\mathbf a(\mathbf l_i)\mathbf v^T(\mathbf l_i)\mathbf x_l\right\|^2.\tag{58}
$$

对 \(b_i^*\) 求导并令其为零，即 \(\frac{\partial f_2^{\rm WGN}}{\partial b_i^*}=0\)，得

$$
b_i^{\rm opt}=\frac{\mathbf a^H(\mathbf l_i)\mathbf Y_i^{\rm opt}\mathbf X^H\mathbf v^*(\mathbf l_i)}{\|\mathbf a(\mathbf l_i)\|^2\mathbf v^T(\mathbf l_i)\mathbf X\mathbf X^H\mathbf v^*(\mathbf l_i)},\quad\forall i\in\mathcal K,\tag{59}
$$

其中

$$
\mathbf Y_i^{\rm opt}=\mathbf Y-\sum_{k\neq i}b_k^{\rm opt}\mathbf a(\mathbf l_k)\mathbf v^T(\mathbf l_k)\mathbf X.\tag{60}
$$

定义

$$
\lambda_i=\frac{\mathbf a^H(\mathbf l_i)\mathbf Y\mathbf X^H\mathbf v^*(\mathbf l_i)}{\|\mathbf a(\mathbf l_i)\|^2\mathbf v^T(\mathbf l_i)\mathbf X\mathbf X^H\mathbf v^*(\mathbf l_i)},\tag{61}
$$

$$
\beta_{i,k}=\frac{\mathbf a^H(\mathbf l_i)\mathbf a(\mathbf l_k)\mathbf v^T(\mathbf l_k)\mathbf X\mathbf X^H\mathbf v^*(\mathbf l_i)}{\|\mathbf a(\mathbf l_i)\|^2\mathbf v^T(\mathbf l_i)\mathbf X\mathbf X^H\mathbf v^*(\mathbf l_i)}.\tag{62}
$$

于是式 (59) 变为

$$
b_i^{\rm opt}+\sum_{k\neq i}b_k^{\rm opt}\beta_{i,k}=\lambda_i,\quad\forall i\in\mathcal K,\tag{63}
$$

或等价地，

$$
\underbrace{\begin{bmatrix}1&\beta_{1,2}&\ldots&\beta_{1,K}\\\beta_{2,1}&1&\ldots&\beta_{2,K}\\\vdots&\vdots&\ddots&\vdots\\\beta_{K,1}&\beta_{K,2}&\ldots&1\end{bmatrix}}_{\boldsymbol\Sigma}\underbrace{\begin{bmatrix}b_1^{\rm opt}\\b_2^{\rm opt}\\\vdots\\b_K^{\rm opt}\end{bmatrix}}_{\mathbf b^{\rm opt}}=\underbrace{\begin{bmatrix}\lambda_1\\\lambda_2\\\vdots\\\lambda_K\end{bmatrix}}_{\boldsymbol\lambda},
$$

其中 \(\boldsymbol\Sigma\in\mathbb C^{K\times K}\)。因此

$$
\mathbf b^{\rm opt}=\boldsymbol\Sigma^{-1}\boldsymbol\lambda.\tag{64}
$$

把式 (64) 代入式 (58) 中的 \(f_2^{\rm WGN}(\mathbf b,\{\mathbf l_k\})\)，得到集中负对数似然函数

$$
f_3^{\rm WGN}(\{\mathbf l_k\})=f_2^{\rm WGN}\left(\boldsymbol\Sigma^{-1}\boldsymbol\lambda,\{\mathbf l_k\}\right).\tag{65}
$$

当仅存在单个目标时，式 (64) 退化为 \(b_1^{\rm opt}=\lambda_1\)。基于 \(f_3^{\rm WGN}(\{\mathbf l_k\})\)，可对 3D-ACO 套用第 IV-A 节的循环优化与迭代细网格三维搜索技术。3D-CO-WGN 的其余流程与 3D-ACO 相同，只是最小化函数改为式 (65) 中的 \(f_3^{\rm WGN}\)。因此，3D-CO-WGN 与算法 1 相同，仅把 \(f_3\) 替换为 \(f_3^{\rm WGN}\)。

## V. 数值结果

本节给出数值结果以验证近场 CRB，并在不同设定下评估所提两种三维多目标定位估计器 3D-ACO 与 3D-CO-WGN 的性能。

### A. CRB 行为分析

我们首先说明考虑式 (3) 与 (4) 中与距离相关的信道幅度变化的必要性。作为对比，我们考虑不考虑天线间幅度变化的传统分析 [8]。为保证公平比较，把常幅度项 \(\alpha^r(\mathbf l_k)\) 与 \(\alpha^t(\mathbf l_k)\) 归一化并入复反射系数 \(\{b_k\}\)，相应得到含往返路径损耗的复反射系数，记为 \(\{\tilde b_k\}\)。具体而言，不考虑幅度变化的 CRB 基于如下接收信号模型推导：

$$
\tilde{\mathbf Y}=\sum_{k=1}^{K}\tilde b_k\tilde{\mathbf a}(\mathbf l_k)\tilde{\mathbf v}^T(\mathbf l_k)\mathbf X+\mathbf Z,\tag{66}
$$

其中 \([\tilde{\mathbf a}(\mathbf l_k)]_m=e^{-\mathrm{j}\nu\|\mathbf l_m^r-\mathbf l_k\|}\)，\([\tilde{\mathbf v}(\mathbf l_k)]_n=e^{-\mathrm{j}\nu\|\mathbf l_n^t-\mathbf l_k\|}\)，且

$$
\tilde b_k=\left(\frac{\lambda}{4\pi}\right)^2\frac{1}{\|\mathbf l_o^r-\mathbf l_k\|}\frac{1}{\|\mathbf l_o^t-\mathbf l_k\|}b_k,\tag{67}
$$

其中 \(\mathbf l_o^r\) 与 \(\mathbf l_o^t\) 分别为 Rx 与 Tx 参考点的三维坐标。这里我们选择相对于参考点的路径损耗，据此得到 \(\{\tilde b_k\}\)。

考虑与图 2 类似的单站 MIMO 雷达设定，Rx 与 Tx 完全重叠。相应地设 \(\mathbf l_o^r=\mathbf l_o^t=[0,0,0]\)。不失一般性，进一步考虑矩形形状的 UPA，总天线数 \(M=N=n_x\times n_y=16\times768=12288\)，其中 \(n_x\) 与 \(n_y\) 分别为沿 \(x\) 轴与 \(y\) 轴的天线数。相邻天线间距为半波长，载频 \(f_c=28\) GHz，因此阵列尺寸约为 \(0.1\ \mathrm m\times4\ \mathrm m\)。进一步考虑简单 WGN 模型 \(\mathbf Q=\sigma^2\mathbf I\)，其中 \(\sigma^2=0.001\)，采用单位功率各向同性发射，即 \(\mathbf X\) 的每一列按 \(\mathbf x_l\sim\mathcal{CN}(\mathbf 0,\mathbf I)\) 生成，\(L=256\)。

首先假设存在一个位于 \(z\) 轴、坐标为 \((0,0,d)\) 的目标。如图 3(a) 所示，当目标靠近 UPA 时，不考虑幅度变化的 CRB 显著偏离我们计入幅度变化推导的 CRB（当 \(d\approx3\) m 时偏差约 20%）。还可以观察到，在该设定下不考虑幅度变化的 CRB 实际上小于计入幅度变化的 CRB。这是因为在式 (67) 中相对阵列中心归一化路径损耗时，我们隐含地降低了目标到所有非中心天线之间的路径损耗，从而得到更小的 CRB。图 3(a) 的设定具有对称性，不能完全体现考虑幅度变化的重要性。因此进一步假设目标坐标为 \((0,6d_y,d_y)\)，其到阵列中心的距离 \(d=\sqrt{(6d_y)^2+d_y^2}=\sqrt{37}d_y\)。在该设定下，图 3(b) 表明即使 \(d\approx12\) m，两种建模的 CRB 仍存在 10% 的偏差。我们还观察到，此时不考虑幅度变化的 CRB 反而更大，因为在式 (67) 的归一化过程中，我们隐含地降低了目标到阵列较远一侧天线之间的路径损耗，同时又增大了目标到较近一侧天线之间的路径损耗，最终导致 CRB 更大。由图 3 可见，信道建模中必须考虑幅度变化。我们还观察到，当目标远离 UPA 时，两种模型会趋于一致，这说明不考虑幅度变化的简化模型只要目标离收发机足够远就是有效的。

随后验证第 III-B 节 CRB 的渐近分析。为此，除假设 UPA 为方形（\(M=N=n^2=35^2=1225\)）且目标坐标为 \((0,0,d)\) 外，其余设定与上文相同，并取 \(\mathbf R_X=\mathbf I\)。由图 4 可以看到，在 \(f_c=28\) GHz 下，当 \(d\) 大于 0.3 m 时，\(x\) 坐标、\(y\) 坐标与 \(z\) 坐标的精确 CRB 可分别由式 (40) 与 (41) 较好地近似。具体而言，图 4 中 \(\mathrm{CRB}_z\) 随距离 \(d\) 的增长远快于 \(\mathrm{CRB}_x\)（\(\mathrm{CRB}_y\)）。

### B. 基于 CRB 的所提估计器评估

接下来，我们用所推导的 CRB 评估所提两种估计器 3D-ACO 与 3D-CO-WGN 在经验位置估计均方误差（MSE）方面的性能。算法 1 中阈值 \(\epsilon\) 设为 \(10^{-5}\)；所有估计器曲线均由 100 次蒙特卡洛仿真平均得到。

首先展示 \(\mathbf Q\) 对 CRB 与估计器性能的影响。图 5(a) 给出与图 1(a) 设定对应的天线配置，以及存在两个目标时目标的相对位置。Tx 阵列中心与 Rx 阵列中心分别位于 \([2.2,0,0]\) m 与 \([-2.2,0,0]\) m，而目标 1 与目标 2 的真实三维坐标分别为 \([-1.834,0.294,3.657]\) m 与 \([1.336,-0.645,2.898]\) m。两个目标的复反射系数设为 1。进一步设 \(M=N=36\)、\(f_c=0.625\) GHz，并采用与第 V-A 节相同的各向同性发射，\(L=52\)。\(\mathbf Q\) 的结构首先取为 \(\mathbf Q=\sigma^2\mathbf I\)。就 CRB 而言，图 5(b) 与 5(c) 表明：虽然目标 1 比目标 2 更靠近 Rx 阵列，但目标 2 的位置 CRB 总体上低于目标 1，因为目标 2 比目标 1 更靠近 Tx 阵列。这说明 CRB 取决于目标与 Tx/Rx 阵列的相对位置。就估计器性能而言，由图 5(b) 与 5(c) 可见，对两个目标而言，3D-CO-WGN 在整个 SNR 区间的性能都优于 3D-ACO。其根本原因在于 3D-CO-WGN 是基于 WGN 模型这一先验假设设计的，而该假设在本文设定下成立。接下来，在与图 5(a) 相同的设定与相同发射波形 \(\mathbf X\) 下，我们考虑另一种情形：\(\mathbf Q\) 不是 WGN，而是按如下方式构造的正定矩阵：

$$
Q_{p,q}=0.95^{|p-q|}e^{\mathrm{j}(p-q)\frac{\pi}{4}},\tag{68}
$$

其中 \(Q_{p,q}\) 表示 \(\mathbf Q\) 的第 \((p,q)\) 个元素。就 CRB 而言，噪声与干扰效应的不同建模对两个目标的 CRB 都有深远影响。就估计器评估而言，图 5(d) 与 5(e) 表明：在非 WGN 的 \(\mathbf Q\) 下，3D-CO-WGN 对两个目标的定位性能都变差，而 3D-ACO 的性能相对不变。特别地，3D-ACO 的性能在整个 SNR 区间都优于 3D-CO-WGN。由于关于 \(\mathbf Q\) 结构的先验知识不再正确，基于 WGN 建模推导的 3D-CO-WGN 性能下降；相比之下，3D-ACO 可适用于一般 \(\mathbf Q\)。

接下来展示 \(\mathbf R_X\) 对 CRB 与估计器性能的影响。图 6(a) 给出另一种与图 1(b) 设定对应的天线配置。Tx 阵列中心与 Rx 阵列中心分别位于 \([0,0,0]\) 与 \([0,0,6]\) m，而目标 1 与目标 2 的真实三维坐标与图 5(a) 相同。两个目标的复反射系数设为 1。类似地设 \(L=52\)、\(M=N=36\)、\(f_c=0.625\) GHz，并采用 WGN 模型。为便于说明，我们同时考虑传统各向同性发射 \(\mathbf x_l\sim\mathcal{CN}(\mathbf 0,\mathbf I)\) 与替代的非各向同性发射策略（脚注 1）：直观地设 \(\mathbf x_l^{\rm non}\sim\mathcal{CN}(\mathbf 0,\mathbf R_X^{\rm non})\)，其中 \(\mathbf R_X^{\rm non}=\frac12\mathbf I+\frac12\mathbf t_1\mathbf t_1^H+\frac12\mathbf t_2\mathbf t_2^H\)。这里 \(\mathbf t_1=\sqrt{\frac{3M}{4}}\frac{\mathbf v^*(\mathbf l_1)}{\|\mathbf v(\mathbf l_1)\|}\)，\(\mathbf t_2=\sqrt{\frac{M}{4}}\frac{\mathbf v^*(\mathbf l_2)}{\|\mathbf v(\mathbf l_2)\|}\)，其中 \(\mathbf l_1\) 与 \(\mathbf l_2\) 分别对应目标 1 与目标 2 的位置。注意发射机须已知 \(\mathbf l_1\) 与 \(\mathbf l_2\) 才能设计 \(\mathbf R_X^{\rm non}\)，这在目标跟踪场景中是可行的 [31]。注意 \(\operatorname{tr}(\mathbf R_X^{\rm non})=\operatorname{tr}(\mathbf I)=M\)，即两种策略发射功率相同，可公平比较。在该设定下，图 6(b) 与 6(c) 表明：与各向同性发射相比，所考虑的非各向同性发射在和功率约束相同的情况下使两个目标的 CRB 都更小。此外还观察到，在非各向同性发射下，两种估计器的性能在整个 SNR 区间总体上都优于各向同性发射。

> **原文脚注 1：** 进一步优化 \(\mathbf R_X\)（进而优化波形）以进一步最小化 CRB 是可能的 [33]；但该问题一般并不简单，因此留待未来研究。

最后，我们说明在估计器设计中考虑天线间信道幅度变化的必要性。考虑图 7(a) 的设定：Tx 与 Rx 均为矩形阵列，\(M=N=3\times12=36\)。目标 1 位于 \([-0.100,-2.600,3.500]\) m，目标 2 位于 \([0.390,2.540,2.050]\) m。采用各向同性发射与 WGN 模型，其余设定与图 5 相同。接收数据矩阵 \(\mathbf Y\) 仍按同时含相位与幅度变化的模型生成，但我们比较在把两种估计器用于处理 \(\mathbf Y\) 时、考虑与不考虑信道幅度变化的情形。可以看到，若在所提两个估计器中忽略幅度变化，图 7(b) 与 7(c) 显示估计器行为会不同。特别地，不考虑信道幅度变化时，3D-ACO 与 3D-CO-WGN 在高 SNR 区间的性能都会退化；3D-ACO 实际上在高 SNR 区间失效，因为不考虑幅度变化会改变算法 1 中 \(f_3\) 的代价景观，导致错误定位。这说明完整建模不仅在 CRB 分析中重要，在估计器设计中同样重要。

## VI. 结论

本文研究了基于精确球面波前模型（同时计入不同天线上的信道相位与幅度变化）的近场 MIMO 雷达多目标定位。在该设定下，我们推导了估计目标三维位置的 CRB，它适用于一般发射波形与一般噪声及干扰协方差矩阵的场景。我们给出了单目标特例下 CRB 的解析非矩阵形式，并据此分析了其关于目标距离与阵列天线尺寸的渐近行为。随后，我们基于 ML 准则提出了两种实用定位算法：3D-ACO 与 3D-CO-WGN 估计器。数值结果表明，考虑天线相关的信道幅度变化能比不考虑时得到更准确的 CRB 与定位，尤其当目标靠近收发机时，并验证了相应的渐近 CRB 分析。结果还表明，所提 3D-ACO 与 3D-CO-WGN 估计器在不同杂波环境下的性能都接近 CRB。最后，非各向同性发射波形的潜力也得到了展示，有望为未来近场 MIMO 感知与 MIMO ISAC 中的自适应发射设计提供参考。

## 附录 A：命题 1 的证明

向量化接收数据矩阵 \(\mathbf y\sim\mathcal{CN}(\boldsymbol\mu(\tilde{\boldsymbol\theta}),\mathbf C(\tilde{\boldsymbol\theta}))\)，其中 \(\boldsymbol\mu(\tilde{\boldsymbol\theta})\) 与 \(\mathbf C(\tilde{\boldsymbol\theta})\) 分别由式 (12) 与 (13) 给出。根据 [37, B.3.25]，

$$
\tilde{\mathbf F}(\tilde\theta_i,\tilde\theta_j)=\operatorname{tr}\left[\mathbf C^{-1}(\tilde{\boldsymbol\theta})\frac{\partial\mathbf C(\tilde{\boldsymbol\theta})}{\partial\tilde\theta_i}\mathbf C^{-1}(\tilde{\boldsymbol\theta})\frac{\partial\mathbf C(\tilde{\boldsymbol\theta})}{\partial\tilde\theta_j}\right]+2\Re\left[\left(\frac{\partial\boldsymbol\mu}{\partial\tilde\theta_i}\right)^H\mathbf C^{-1}(\tilde{\boldsymbol\theta})\frac{\partial\boldsymbol\mu}{\partial\tilde\theta_j}\right].\tag{69}
$$

由于 \(\mathbf C(\tilde{\boldsymbol\theta})\) 是块对角矩阵，其逆可由其中各块矩阵 \(\mathbf Q\) 的逆得到。因此式 (69) 的第一项可改写为

$$
\operatorname{tr}\left\{\begin{bmatrix}\mathbf Q^{-1}\frac{\partial\mathbf Q}{\partial\tilde\theta_i}\mathbf Q^{-1}\frac{\partial\mathbf Q}{\partial\tilde\theta_j}&\mathbf 0&\mathbf 0\\\mathbf 0&\ddots&\mathbf 0\\\mathbf 0&\mathbf 0&\mathbf Q^{-1}\frac{\partial\mathbf Q}{\partial\tilde\theta_i}\mathbf Q^{-1}\frac{\partial\mathbf Q}{\partial\tilde\theta_j}\end{bmatrix}\right\},
$$

它对应式 (14) 中的第一项 \(L\operatorname{tr}\left[\mathbf Q^{-1}\frac{\partial\mathbf Q}{\partial\tilde\theta_i}\mathbf Q^{-1}\frac{\partial\mathbf Q}{\partial\tilde\theta_j}\right]\)。式 (69) 的第二项改写为

$$
2\Re\left(\sum_{l=1}^{L}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf x_l)}{\partial\tilde\theta_i}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf x_l)}{\partial\tilde\theta_j}\right)\right)\tag{70}
$$

$$
=2\Re\operatorname{tr}\left[\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial\tilde\theta_i}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial\tilde\theta_j}\right)\right],\tag{71}
$$

即式 (14) 的第二项，证毕。

## 附录 B：命题 2 的证明

由于式 (10) 中的 \(\boldsymbol\theta\) 不包含 \(\mathbf Q\) 中的任何未知量，式 (14) 的第一项消失。因此有

$$
\mathbf F(\theta_i,\theta_j)=2\Re\operatorname{tr}\left[\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial\theta_i}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial\theta_j}\right)\right].
$$

FIM 的总体结构如下，共 25 个块：

$$
\begin{bmatrix}
\mathbf F(\mathbf x,\mathbf x)&\mathbf F(\mathbf x,\mathbf y)&\mathbf F(\mathbf x,\mathbf z)&\mathbf F(\mathbf x,\mathbf b_R)&\mathbf F(\mathbf x,\mathbf b_I)\\
\mathbf F(\mathbf y,\mathbf x)&\mathbf F(\mathbf y,\mathbf y)&\mathbf F(\mathbf y,\mathbf z)&\mathbf F(\mathbf y,\mathbf b_R)&\mathbf F(\mathbf y,\mathbf b_I)\\
\mathbf F(\mathbf z,\mathbf x)&\mathbf F(\mathbf z,\mathbf y)&\mathbf F(\mathbf z,\mathbf z)&\mathbf F(\mathbf z,\mathbf b_R)&\mathbf F(\mathbf z,\mathbf b_I)\\
\mathbf F(\mathbf b_R,\mathbf x)&\mathbf F(\mathbf b_R,\mathbf y)&\mathbf F(\mathbf b_R,\mathbf z)&\mathbf F(\mathbf b_R,\mathbf b_R)&\mathbf F(\mathbf b_R,\mathbf b_I)\\
\mathbf F(\mathbf b_I,\mathbf x)&\mathbf F(\mathbf b_I,\mathbf y)&\mathbf F(\mathbf b_I,\mathbf z)&\mathbf F(\mathbf b_I,\mathbf b_R)&\mathbf F(\mathbf b_I,\mathbf b_I)
\end{bmatrix}
$$

然而 FIM 总是对称半正定的，因此可以减少需要检查的块数。首先求 \(\mathbf F(\mathbf x,\mathbf x)\)。为此有

$$
\mathbf F(x_i,x_j)=2\Re\operatorname{tr}\left[\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial x_i}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial x_j}\right)\right].
$$

注意对依赖参数 \(\rho\) 的任意矩阵 \(\mathbf A\) 与 \(\mathbf B\)，有

$$
\frac{\partial(\mathbf A\mathbf B)}{\partial\rho}=\frac{\partial\mathbf A}{\partial\rho}\mathbf B+\mathbf A\frac{\partial\mathbf B}{\partial\rho}.\tag{72}
$$

因此，

$$
\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial x_i}=\dot{\mathbf A}_x\mathbf e_i\mathbf e_i^T\mathbf B\mathbf V^T\mathbf X+\mathbf A\mathbf B\mathbf e_i\mathbf e_i^T\dot{\mathbf V}_x^T\mathbf X,\tag{73}
$$

其中 \(\mathbf e_i\) 表示单位矩阵的第 \(i\) 列。于是

$$
\mathbf F(x_i,x_j)=2\Re\operatorname{tr}\left[\left(\dot{\mathbf A}_x\mathbf e_i\mathbf e_i^T\mathbf B\mathbf V^T\mathbf X+\mathbf A\mathbf B\mathbf e_i\mathbf e_i^T\dot{\mathbf V}_x^T\mathbf X\right)^H\mathbf Q^{-1}\left(\dot{\mathbf A}_x\mathbf e_j\mathbf e_j^T\mathbf B\mathbf V^T\mathbf X+\mathbf A\mathbf B\mathbf e_j\mathbf e_j^T\dot{\mathbf V}_x^T\mathbf X\right)\right].\tag{74}
$$

现在，

$$
\operatorname{tr}\left[\left(\dot{\mathbf A}_x\mathbf e_i\mathbf e_i^T\mathbf B\mathbf V^T\mathbf X\right)^H\mathbf Q^{-1}\left(\dot{\mathbf A}_x\mathbf e_j\mathbf e_j^T\mathbf B\mathbf V^T\mathbf X\right)\right]
=\mathbf e_i^T(\dot{\mathbf A}_x^H\mathbf Q^{-1}\dot{\mathbf A}_x)\mathbf e_j\mathbf e_j^T(\mathbf B\mathbf V^T\mathbf X\mathbf X^H\mathbf V^*\mathbf B^H)\mathbf e_i
=L(\dot{\mathbf A}_x^H\mathbf Q^{-1}\dot{\mathbf A}_x)_{ij}(\mathbf B^*\mathbf V^H\mathbf R_X^*\mathbf V\mathbf B)_{ij},
$$

它对应式 (74) 乘积的第一项。这里 \(\mathbf M_{ij}\) 表示 \(\mathbf M\) 的第 \((i,j)\) 个元素。其余三项形式类似。因此 \(\mathbf F(\mathbf x,\mathbf x)=2\Re(\mathbf F_{\mathbf x\mathbf x})\)，其中

$$
\mathbf F_{\mathbf x\mathbf x}=L(\dot{\mathbf A}_x^H\mathbf Q^{-1}\dot{\mathbf A}_x)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\mathbf V\mathbf B)+L(\dot{\mathbf A}_x^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\dot{\mathbf V}_x\mathbf B)+L(\mathbf A^H\mathbf Q^{-1}\dot{\mathbf A}_x)\odot(\mathbf B^*\dot{\mathbf V}_x^H\mathbf R_X^*\mathbf V\mathbf B)+L(\mathbf A^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\dot{\mathbf V}_x^H\mathbf R_X^*\dot{\mathbf V}_x\mathbf B).\tag{75}
$$

相应地，把式 (75) 中的 \(\mathbf x\) 换为 \(\mathbf y\) 与 \(\mathbf z\) 即可得到 \(\mathbf F_{\mathbf y\mathbf y}\) 与 \(\mathbf F_{\mathbf z\mathbf z}\)。于是 \(\mathbf F(\mathbf y,\mathbf y)=2\Re(\mathbf F_{\mathbf y\mathbf y})\)、\(\mathbf F(\mathbf z,\mathbf z)=2\Re(\mathbf F_{\mathbf z\mathbf z})\)。

其次求 \(\mathbf F(\mathbf x,\mathbf y)\)。类似可推导得

$$
\mathbf F(x_i,y_j)=2\Re\operatorname{tr}\left[\left(\dot{\mathbf A}_x\mathbf e_i\mathbf e_i^T\mathbf B\mathbf V^T\mathbf X+\mathbf A\mathbf B\mathbf e_i\mathbf e_i^T\dot{\mathbf V}_x^T\mathbf X\right)^H\mathbf Q^{-1}\left(\dot{\mathbf A}_y\mathbf e_j\mathbf e_j^T\mathbf B\mathbf V^T\mathbf X+\mathbf A\mathbf B\mathbf e_j\mathbf e_j^T\dot{\mathbf V}_y^T\mathbf X\right)\right],\tag{76}
$$

并得到 \(\mathbf F(\mathbf x,\mathbf y)=2\Re(\mathbf F_{\mathbf x\mathbf y})\)，其中

$$
\mathbf F_{\mathbf x\mathbf y}=L(\dot{\mathbf A}_x^H\mathbf Q^{-1}\dot{\mathbf A}_y)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\mathbf V\mathbf B)+L(\dot{\mathbf A}_x^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\dot{\mathbf V}_y\mathbf B)+L(\mathbf A^H\mathbf Q^{-1}\dot{\mathbf A}_y)\odot(\mathbf B^*\dot{\mathbf V}_x^H\mathbf R_X^*\mathbf V\mathbf B)+L(\mathbf A^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\dot{\mathbf V}_x^H\mathbf R_X^*\dot{\mathbf V}_y\mathbf B).\tag{77}
$$

把式 (76) 与 (77) 中的 \(\mathbf x\mathbf y\) 分别换成 \(\mathbf x\mathbf z\) 与 \(\mathbf y\mathbf z\)，即可得到 \(\mathbf F_{\mathbf x\mathbf z}\) 与 \(\mathbf F_{\mathbf y\mathbf z}\)，并相应得到 \(\mathbf F(\mathbf x,\mathbf z)=2\Re(\mathbf F_{\mathbf x\mathbf z})\) 与 \(\mathbf F(\mathbf y,\mathbf z)=2\Re(\mathbf F_{\mathbf y\mathbf z})\)。由于 FIM 本质上是实对称半正定矩阵，有 \(\mathbf F(\mathbf y,\mathbf x)=\mathbf F^T(\mathbf x,\mathbf y)\)、\(\mathbf F(\mathbf z,\mathbf x)=\mathbf F^T(\mathbf x,\mathbf z)\) 与 \(\mathbf F(\mathbf z,\mathbf y)=\mathbf F^T(\mathbf y,\mathbf z)\)。

第三，求 \(\mathbf F(\mathbf b_R,\mathbf b_R)\)、\(\mathbf F(\mathbf b_I,\mathbf b_I)\) 与 \(\mathbf F(\mathbf b_R,\mathbf b_I)\)。为此有

$$
\mathbf F(b_{Ri},b_{Rj})=2\Re\operatorname{tr}\left[\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Ri}}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Rj}}\right)\right],
$$
$$
\mathbf F(b_{Ii},b_{Ij})=2\Re\operatorname{tr}\left[\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Ii}}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Ij}}\right)\right],
$$
$$
\mathbf F(b_{Ri},b_{Ij})=2\Re\operatorname{tr}\left[\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Ri}}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Ij}}\right)\right],
$$

且

$$
\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Ri}}=\mathbf A\mathbf e_i\mathbf e_i^T\mathbf V^T\mathbf X,\tag{78}
$$

$$
\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Ii}}=\mathrm{j}\mathbf A\mathbf e_i\mathbf e_i^T\mathbf V^T\mathbf X.\tag{79}
$$

因此类似地有 \(\mathbf F(\mathbf b_R,\mathbf b_R)=2\Re(\mathbf F_{\mathbf b\mathbf b})\)，其中

$$
\mathbf F_{\mathbf b\mathbf b}=L(\mathbf A^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf V^H\mathbf R_X^*\mathbf V),\tag{80}
$$

并且 \(\mathbf F(\mathbf b_I,\mathbf b_I)=2\Re(\mathbf F_{\mathbf b\mathbf b})\)、\(\mathbf F(\mathbf b_R,\mathbf b_I)=-2\Im(\mathbf F_{\mathbf b\mathbf b})\)。相应地，\(\mathbf F(\mathbf b_I,\mathbf b_R)=\mathbf F^T(\mathbf b_R,\mathbf b_I)=-2\Im(\mathbf F_{\mathbf b\mathbf b}^T)\)。

最后求 \(\mathbf F(\mathbf x,\mathbf b_R)\) 与 \(\mathbf F(\mathbf x,\mathbf b_I)\)。有

$$
\mathbf F(x_i,b_{Rj})=2\Re\operatorname{tr}\left[\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial x_i}\right)^H\mathbf Q^{-1}\left(\frac{\partial(\mathbf A\mathbf B\mathbf V^T\mathbf X)}{\partial b_{Rj}}\right)\right]=2\Re\operatorname{tr}\left[\left(\dot{\mathbf A}_x\mathbf e_i\mathbf e_i^T\mathbf B\mathbf V^T\mathbf X+\mathbf A\mathbf B\mathbf e_i\mathbf e_i^T\dot{\mathbf V}_x^T\mathbf X\right)^H\mathbf Q^{-1}\left(\mathbf A\mathbf e_j\mathbf e_j^T\mathbf V^T\mathbf X\right)\right].\tag{81}
$$

类似地，\(\mathbf F(\mathbf x,\mathbf b_R)=\mathbf F^T(\mathbf b_R,\mathbf x)=2\Re(\mathbf F_{\mathbf x\mathbf b})\)，其中

$$
\mathbf F_{\mathbf x\mathbf b}=L(\dot{\mathbf A}_x^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\mathbf V^H\mathbf R_X^*\mathbf V)+L(\mathbf A^H\mathbf Q^{-1}\mathbf A)\odot(\mathbf B^*\dot{\mathbf V}_x^H\mathbf R_X^*\mathbf V).\tag{82}
$$

把式 (82) 中的 \(\mathbf x\) 换为 \(\mathbf y\) 与 \(\mathbf z\) 即可得到 \(\mathbf F_{\mathbf y\mathbf b}\) 与 \(\mathbf F_{\mathbf z\mathbf b}\)。相应地，\(\mathbf F(\mathbf y,\mathbf b_R)=\mathbf F^T(\mathbf b_R,\mathbf y)=2\Re(\mathbf F_{\mathbf y\mathbf b})\)、\(\mathbf F(\mathbf z,\mathbf b_R)=\mathbf F^T(\mathbf b_R,\mathbf z)=2\Re(\mathbf F_{\mathbf z\mathbf b})\)。

对于 \(\mathbf F(\mathbf x,\mathbf b_I)\)、\(\mathbf F(\mathbf y,\mathbf b_I)\) 与 \(\mathbf F(\mathbf z,\mathbf b_I)\)，根据式 (79) 类似地有

$$
\mathbf F(\mathbf x,\mathbf b_I)=\mathbf F^T(\mathbf b_I,\mathbf x)=-2\Im(\mathbf F_{\mathbf x\mathbf b}),\tag{83}
$$

$$
\mathbf F(\mathbf y,\mathbf b_I)=\mathbf F^T(\mathbf b_I,\mathbf y)=-2\Im(\mathbf F_{\mathbf y\mathbf b}),\tag{84}
$$

$$
\mathbf F(\mathbf z,\mathbf b_I)=\mathbf F^T(\mathbf b_I,\mathbf z)=-2\Im(\mathbf F_{\mathbf z\mathbf b}).\tag{85}
$$

综合以上即得证明。

## 附录 C：命题 3 的证明

在单目标情形下，命题 2 中得到的 FIM 可改写为

$$
\mathbf F=\begin{bmatrix}\mathbf G&\mathbf H\\\mathbf H^T&\mathbf R\end{bmatrix},\tag{86}
$$

其中 \(\mathbf G=\mathbf F([1:3],[1:3])\)、\(\mathbf R=\mathbf F([4:5],[4:5])\)、\(\mathbf H=\mathbf F([1:3],[4:5])\)。等效 FIM 表示为

$$
\mathbf D=\mathbf G-\mathbf H\mathbf R^{-1}\mathbf H^T,\tag{87}
$$

它是 \(\mathbf F\) 关于块 \(\mathbf R\) 的 Schur 补。因此根据矩阵求逆引理 [38]，有

$$
\mathbf D^{-1}=[\mathbf F^{-1}]_{3\times3}.\tag{88}
$$

按照 FIM 之逆的定义与逆矩阵公式，

$$
\mathrm{CRB}_x=[\mathbf F^{-1}]_{1,1}=\frac{1}{|\mathbf D|}\begin{vmatrix}d_{2,2}&d_{2,3}\\d_{3,2}&d_{3,3}\end{vmatrix},\tag{89}
$$

$$
\mathrm{CRB}_y=[\mathbf F^{-1}]_{2,2}=\frac{1}{|\mathbf D|}\begin{vmatrix}d_{1,1}&d_{1,3}\\d_{3,1}&d_{3,3}\end{vmatrix},\tag{90}
$$

$$
\mathrm{CRB}_z=[\mathbf F^{-1}]_{3,3}=\frac{1}{|\mathbf D|}\begin{vmatrix}d_{1,1}&d_{1,2}\\d_{2,1}&d_{2,2}\end{vmatrix},\tag{91}
$$

其中 \([\mathbf F^{-1}]_{i,i}\) 为 \(\mathbf F^{-1}\) 的第 \((i,i)\) 个元素，\(d_{i,j}\) 为 \(\mathbf D\) 的第 \((i,j)\) 个元素。结合 \(\mathbf Q=\sigma^2\mathbf I\) 的假设、命题 2 中 \(\mathbf F\) 的定义以及式 (86)–(91)，即得证明。

## 附录 D：命题 4 的证明

由于天线阵列关于目标对称，可直接由定义验证式 (35)–(37)，故证明从略。此外，有

$$
\dot{\mathbf a}_x^H\mathbf a=\mathbf a^H\dot{\mathbf a}_x=\dot{\mathbf v}_x^H\mathbf v=\mathbf v^H\dot{\mathbf v}_x=0,\tag{92}
$$

$$
\dot{\mathbf a}_y^H\mathbf a=\mathbf a^H\dot{\mathbf a}_y=\dot{\mathbf v}_y^H\mathbf v=\mathbf v^H\dot{\mathbf v}_y=0,\tag{93}
$$

$$
\dot{\mathbf a}_x^H\dot{\mathbf a}_y=\dot{\mathbf a}_x^H\dot{\mathbf a}_z=\dot{\mathbf a}_y^H\dot{\mathbf a}_z=0,\tag{94}
$$

$$
\dot{\mathbf v}_x^H\dot{\mathbf v}_y=\dot{\mathbf v}_x^H\dot{\mathbf v}_z=\dot{\mathbf v}_y^H\dot{\mathbf v}_z=0,\tag{95}
$$

同时下列等式成立：

$$
\|\mathbf a\|^2=\|\mathbf v\|^2,\qquad\|\dot{\mathbf a}_x\|^2=\|\dot{\mathbf v}_x\|^2=\|\dot{\mathbf a}_y\|^2=\|\dot{\mathbf v}_y\|^2,\tag{96}
$$

$$
\|\dot{\mathbf a}_z\|^2=\|\dot{\mathbf v}_z\|^2,\qquad\dot{\mathbf a}_z^H\mathbf a=\dot{\mathbf v}_z^H\mathbf v=\mathbf a^H\dot{\mathbf a}_z=\mathbf v^H\dot{\mathbf v}_z.\tag{97}
$$

因此，在 \(\mathbf R_X=\mathbf I\) 的假设下，式 (28)–(31) 中除以下各项外全部为零：

$$
\tilde f_{xx}=\tilde f_{yy}=2\|\mathbf a\|^2\|\dot{\mathbf a}_x\|^2,\qquad f_{zz}^R=4|\dot{\mathbf a}_z^H\mathbf a|^2,\tag{98}
$$

$$
\tilde f_{zz}=2\|\mathbf a\|^2\|\dot{\mathbf a}_z\|^2+2|\dot{\mathbf a}_z^H\mathbf a|^2.\tag{99}
$$

于是式 (27) 中的 \(\tilde{\mathbf D}\) 简化为对角矩阵，即 \(\tilde{\mathbf D}=2\operatorname{diag}(\|\mathbf a\|^2\|\dot{\mathbf a}_x\|^2,\|\mathbf a\|^2\|\dot{\mathbf a}_x\|^2,\|\mathbf a\|^2\|\dot{\mathbf a}_z\|^2-|\dot{\mathbf a}_z^H\mathbf a|^2)\)；并根据命题 3 相应地有

$$
\mathrm{CRB}_x=\mathrm{CRB}_y=\frac{2\sigma^2\|\mathbf a\|^2\|\dot{\mathbf a}_x\|^2}{|b|^2L|\tilde{\mathbf D}|}\left(\|\mathbf a\|^2\|\dot{\mathbf a}_z\|^2-|\dot{\mathbf a}_z^H\mathbf a|^2\right)=\frac{\sigma^2}{4|b|^2L}\frac{1}{\|\mathbf a\|^2\|\dot{\mathbf a}_x\|^2},
$$

$$
\mathrm{CRB}_z=\frac{2\sigma^2\|\mathbf a\|^4\|\dot{\mathbf a}_x\|^4}{|b|^2L|\tilde{\mathbf D}|}=\frac{\sigma^2}{4|b|^2L}\frac{1}{\|\mathbf a\|^2\|\dot{\mathbf a}_z\|^2-|\dot{\mathbf a}_z^H\mathbf a|^2}.
$$

综合上述结果即得证明。

## 附录 E：命题 5 的证明

先证式 (38)。令 \(\xi=\frac{\sigma^2}{2|b|^2L}\)，\(D_a=\frac{1}{d^2}+4\left(\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}\frac{1}{d^2+i^2s^2+k^2s^2}\right)\)。根据式 (33) 有

$$
\lim_{d\to\infty}\frac{\mathrm{CRB}_x}{d^6}=\lim_{d\to\infty}\frac{\mathrm{CRB}_y}{d^6}=\lim_{d\to\infty}\frac{8\xi\nu^4}{D_a(D_1^x+\nu^2D_2^x)}\frac{1}{d^6}.
$$

当 \(d\to\infty\) 时，\(D_1^x\) 相对 \(D_2^x\) 变得可以忽略，因而可忽略。于是

$$
\lim_{d\to\infty}\frac{\mathrm{CRB}_x}{d^6}=\lim_{d\to\infty}\frac{\mathrm{CRB}_y}{d^6}=\lim_{d\to\infty}\frac{8\xi\nu^2}{(D_ad^2)(D_2^xd^4)}=8\xi\nu^2\left(\lim_{d\to\infty}\frac{1}{D_ad^2}\right)\left(\lim_{d\to\infty}\frac{1}{D_2^xd^4}\right)=8\xi\nu^2\left(\frac{1}{n^2}\right)\left(\frac{12}{s^2(n^4-n^2)}\right)=\frac{48\sigma^2}{|b|^2L}\frac{\nu^2}{(n^6-n^4)s^2}.\tag{100}
$$

再证式 (39)：\(\lim_{d\to\infty}\frac{\mathrm{CRB}_z}{d^8}\) 可表示为

$$
\lim_{d\to\infty}\frac{8\xi\nu^4}{d^{10}\left[(D_1^zD_a-(D_2^z)^2)+\nu^2(D_2^zD_a-(D_3^z)^2)\right]},\tag{101}
$$

类似地，当 \(d\to\infty\) 时，\(D_1^zD_a-(D_2^z)^2\) 相对 \(D_2^zD_a-(D_3^z)^2\) 变得可以忽略，因而可忽略。于是

$$
\lim_{d\to\infty}\frac{\mathrm{CRB}_z}{d^8}=\lim_{d\to\infty}\frac{8\xi\nu^2}{d^{10}\left[D_2^zD_a-(D_3^z)^2\right]}.\tag{102}
$$

由于有如下极限等式：

$$
\lim_{d\to\infty}\left(\frac{4d^{10}}{(d^2+a)^2(d^2+b)}+\frac{4d^{10}}{(d^2+a)(d^2+b)^2}\right)-\frac{8d^{10}}{(d^2+a)^{\frac32}(d^2+b)^{\frac32}}\triangleq\lim_{d\to\infty}\zeta(a,b)=(a-b)^2,\tag{103}
$$

其中 \(\zeta(a,b)\) 为简洁起见相应定义。在 \(D_2^zD_a\) 与 \((D_3^z)^2\) 中相同项相消后，

$$
\lim_{d\to\infty}d^{10}\left[D_2^zD_a-(D_3^z)^2\right]=\lim_{d\to\infty}\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}\zeta\!\left(0,(i^2+k^2)s^2\right)+4\left(\sum_{j=0}^{\frac{n-1}{2}}\sum_{m=1}^{\frac{n-1}{2}}\sum_{i=0}^{\frac{n-1}{2}}\sum_{\substack{k=1\\j^2+m^2<i^2+k^2}}^{\frac{n-1}{2}}\zeta\!\left((j^2+m^2)s^2,(i^2+k^2)s^2\right)\right)
$$
$$
=\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}(i^2+k^2)^2s^4+4\left(\sum_{j=0}^{\frac{n-1}{2}}\sum_{m=1}^{\frac{n-1}{2}}\sum_{i=0}^{\frac{n-1}{2}}\sum_{\substack{k=1\\j^2+m^2<i^2+k^2}}^{\frac{n-1}{2}}\left[(i^2+k^2)-(j^2+m^2)\right]^2s^4\right).
$$

令 \(\mu=\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}(i^2+k^2)^2\)，\(\beta=\left(\sum_{i=0}^{\frac{n-1}{2}}\sum_{k=1}^{\frac{n-1}{2}}(i^2+k^2)\right)^2\)。经过一些代数运算，

$$
\lim_{d\to\infty}d^{10}\left[D_2^zD_a-(D_3^z)^2\right]=s^4\left(\mu+4\left[\left(\frac{n+1}{2}\frac{n-1}{2}-1\right)\mu-(\beta-\mu)\right]\right)=s^4\left[n^2\mu-4\beta\right].\tag{104}
$$

而 \(\mu\) 与 \(\beta\) 可按 \(n\) 的函数计算如下：

$$
\mu=\frac{n^2(n^2-1)(7n^2-13)}{720},\qquad\beta=\frac{(n^2-1)^2n^4}{576}.\tag{105}
$$

结合式 (102)、(104) 与 (105) 即得式 (39)，证毕。

## 附录 F：命题 6 的证明

当 \(n\) 为正奇数时，\(\|\mathbf a\|^2\)、\(\|\dot{\mathbf a}_x\|^2\)、\(\|\dot{\mathbf a}_z\|^2\) 与 \(|\dot{\mathbf a}_z^H\mathbf a|^2\) 均大于 0。因此根据命题 4，为证明式 (42) 只需证明当 \(n\to\infty\) 时 \(\|\mathbf a\|^2\) 发散。为此，由于阵列关于其中心对称，可以证明 \(\|\mathbf a\|^2\) 由如下二重积分下界：

$$
\int_0^{\frac n2s}\int_0^{\frac n2s}\frac{d\omega d\gamma}{d^2+(\omega+s)^2+(\gamma+s)^2}\le s^2\nu^2\|\mathbf a\|^2.\tag{106}
$$

当 \(n\to\infty\) 时该二重积分发散，因而 \(\|\mathbf a\|^2\) 也发散，即

$$
\lim_{n\to\infty}\|\mathbf a\|^2=\infty.\tag{107}
$$

相应地得到式 (42)。结合命题 4 中的式 (34) 与式 (107)，只需再证明当 \(n\to\infty\) 时 \(|\dot{\mathbf a}_z^H\mathbf a|^2\) 收敛即可得到式 (43)。由式 (37)，这等价于证明 \(D_2^z\) 与 \(D_3^z\) 在 \(n\to\infty\) 时都收敛。对 \(D_2^z\)，有如下上界：

$$
\frac{D_2^z}{4}s^2\le\int_{-s}^{\frac n2s}\int_{-s}^{\frac n2s}\frac{d\omega d\gamma}{(d^2+\omega^2+\gamma^2)^2}+\frac{s^2}{4d^4}+\sum_{k=1}^{\frac{n-1}{2}}\frac{s^2}{(d^2+(ks)^2)^2}.\tag{108}
$$

容易验证 \(D_2^z\) 的上界在 \(n\to\infty\) 时收敛，因此 \(D_2^z\) 也收敛。对 \(D_3^z\)，类似有

$$
\frac{D_3^z}{4}s^2\le\int_{-s}^{\frac n2s}\int_{-s}^{\frac n2s}\frac{d\omega d\gamma}{(d^2+\omega^2+\gamma^2)^{\frac32}}+\frac{s^2}{4d^3}+\sum_{k=1}^{\frac{n-1}{2}}\frac{s^2}{(d^2+(ks)^2)^{\frac32}},\tag{109}
$$

\(D_3^z\) 的上界在 \(n\to\infty\) 时收敛，因此 \(D_3^z\) 也收敛。结合式 (108) 与 (109) 可知 \(|\dot{\mathbf a}_z^H\mathbf a|^2\) 在 \(n\to\infty\) 时收敛，从而式 (43) 成立。

## 图注与表注

**图 1（原文 Fig. 1）：** 工作在近场区域的 MIMO 雷达。黑色星号表示待定位的目标：(a) Rx 与 Tx 的天线阵列位于同一平面；(b) Rx 与 Tx 的天线阵列面对面部署。

**图 2（原文 Fig. 2）：** 仅存在一个目标（黑色星号，位置 \((0,0,d)\)）的简化场景；阵列中心假设与 \(z\) 轴重合，图中还标出 \(x\)、\(y\)、\(z\) 坐标方向。

**图 3（原文 Fig. 3）：** 本文设定下式 (25) 的位置 CRB 与不考虑天线间信道幅度变化时的对比。(a) 目标位于 \((0,0,d)\)；(b) 目标位于 \((0,6d_y,d_y)\)，其中 \(d=\sqrt{37}d_y\)。图中给出两种 CRB 曲线与偏差百分比 \(\left|(\mathrm{CRB}-\mathrm{CRB}_{\rm woav})/\mathrm{CRB}\right|\times100\%\)。

**图 4（原文 Fig. 4）：** CRB 与近似表达式的对比：\(\mathrm{CRB}_x\)（\(\mathrm{CRB}_y\)）与式 (40) 的近似值对比；\(\mathrm{CRB}_z\) 与式 (41) 的近似值对比。可以看到当 \(d\) 增大时近似相当准确，且 \(\mathrm{CRB}_z\) 随距离增长远快于 \(\mathrm{CRB}_x\)（\(\mathrm{CRB}_y\)）。

**图 5（原文 Fig. 5）：** 所提 3D-ACO 与 3D-CO-WGN 相对所推导 CRB 的经验 MSE 随 SNR 的变化。(a) 所考虑的设定（Tx 阵列标红、Rx 阵列标蓝）；(b)–(c) 在 \(\mathbf Q\) 的 WGN 模型下对目标 1、目标 2 的评估；(d)–(e) 在式 (68) 指定的 \(\mathbf Q\) 下对目标 1、目标 2 的评估。

**图 6（原文 Fig. 6）：** 在 \(\mathbf Q\) 的 WGN 模型下，所提估计器与所推导 CRB 的经验 MSE 随 SNR 的变化；同时考虑各向同性与非各向同性发射策略。(a) Setup 2 配置（Tx 阵列标红、Rx 阵列标蓝）；(b) 目标 1 的 MSE 对 SNR；(c) 目标 2 的 MSE 对 SNR。

**图 7（原文 Fig. 7）：** 在 \(\mathbf Q\) 的 WGN 模型下，所提 3D-ACO 与 3D-CO-WGN 相对所推导 CRB 的经验 MSE 随 SNR 的变化；这里还给出不考虑天线间信道幅度变化时的 3D-ACO 与 3D-CO-WGN。(a) Setup 2 的矩形阵列配置（Tx 阵列标红、Rx 阵列标蓝）；(b) 目标 1 的 MSE 对 SNR；(c) 目标 2 的 MSE 对 SNR。

> **表注：** 原文没有表格。

## 参考文献（英文原书目）

[1] H. Hua and J. Xu, “Near-field 3D localization via MIMO radar: Cramér-Rao bound and estimator design,” to appear in Proc. IEEE Global Commun. Conf. (GLOBECOM), 2023.

[2] ITU-R WP5D, “IMT.framework for 2030 and beyond,” Feb. 2023. [Online]. Available: https://www.itu.int/dms_ties/itu-r/md/19/wp5d/c/R19-WP5D-C-1668!H3-N3.07!MSW-E.docx

[3] F. Liu, Y. Cui, C. Masouros, J. Xu, T. X. Han, Y. C. Eldar, and S. Buzzi, “Integrated sensing and communications: Towards dual-functional wireless networks for 6G and beyond,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1728–1767, Jun. 2022.

[4] H. Hua, J. Xu, and T. X. Han, “Optimal transmit beamforming for integrated sensing and communication,” IEEE Trans. Veh. Technol., vol. 72, no. 8, pp. 10 588–10 603, Mar. 2023.

[5] R. W. Heath, N. Gonzalez-Prelcic, S. Rangan, W. Roh, and A. M. Sayeed, “An overview of signal processing techniques for millimeter wave MIMO systems,” IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 436–453, Feb. 2016.

[6] H. Zhang, N. Shlezinger, F. Guidi, D. Dardari, M. F. Imani, and Y. C. Eldar, “Beam focusing for near-field multi-user MIMO communications,” IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 7476–7490, Mar. 2022.

[7] H. Zhang, N. Shlezinger, F. Guidi, D. Dardari, and Y. C. Eldar, “6G wireless communications: From far-field beam steering to near-field beam focusing,” IEEE Commun. Mag., vol. 61, no. 4, pp. 72–77, Apr. 2023.

[8] L. Khamidullina, I. Podkurkov, and M. Haardt, “Conditional and unconditional Cramér-Rao bounds for near-field localization in bistatic MIMO radar systems,” IEEE Trans. Signal Process., vol. 69, pp. 3220–3234, May 2021.

[9] H. Lu and Y. Zeng, “Communicating with extremely large-scale array/surface: Unified modeling and performance analysis,” IEEE Trans. Wireless Commun., vol. 21, no. 6, pp. 4039–4053, Nov. 2021.

[10] Y. Lu and L. Dai, “Near-field channel estimation in mixed LoS/NLoS environments for extremely large-scale MIMO systems,” IEEE Trans. Commun., vol. 71, no. 6, pp. 3694–3707, Mar. 2023.

[11] M. Cui and L. Dai, “Channel estimation for extremely large-scale MIMO: Far-field or near-field?” IEEE Trans. Commun., vol. 70, no. 4, pp. 2663–2677, Jan. 2022.

[12] J.-H. Lee, Y.-M. Chen, and C.-C. Yeh, “A covariance approximation method for near-field direction-finding using a uniform linear array,” IEEE Trans. Signal Process., vol. 43, no. 5, pp. 1293–1298, May 1995.

[13] E. Grosicki, K. Abed-Meraim, and Y. Hua, “A weighted linear prediction method for near-field source localization,” IEEE Trans. Signal Process., vol. 53, no. 10, pp. 3651–3660, Sept. 2005.

[14] J. He, L. Li, T. Shu, and T.-K. Truong, “Mixed near-field and far-field source localization based on exact spatial propagation geometry,” IEEE Trans. Veh. Technol., vol. 70, no. 4, pp. 3540–3551, Mar. 2021.

[15] Y.-D. Huang and M. Barkat, “Near-field multiple source localization by passive sensor array,” IEEE Trans. Antennas Propag., vol. 39, no. 7, pp. 968–975, Jul. 1991.

[16] A. Guerra, F. Guidi, D. Dardari, and P. M. Djurić, “Near-field tracking with large antenna arrays: Fundamental limits and practical algorithms,” IEEE Trans. Signal Process., vol. 69, pp. 5723–5738, Aug. 2021.

[17] Q. Yang, A. Guerra, F. Guidi, N. Shlezinger, H. Zhang, D. Dardari, B. Wang, and Y. C. Eldar, “Near-field localization with dynamic metasurface antennas,” in Proc. IEEE ICASSP, Jun. 2023, pp. 1–5.

[18] A. A. D’Amico, A. de Jesus Torres, L. Sanguinetti, and M. Win, “Cramér-Rao bounds for holographic positioning,” IEEE Trans. Signal Process., vol. 70, pp. 5518–5532, Nov. 2022.

[19] X. Zhang, H. Zhang, and Y. C. Eldar, “Near-field sparse channel representation and estimation in 6G wireless communications,” arXiv preprint arXiv:2212.13527, 2022.

[20] I. Podkurkov, L. Hamidullina, E. Traikov, M. Haardt, and A. Nadeev, “Tensor-based near-field localization in bistatic MIMO radar systems,” in Proc. 22nd Int. ITG Workshop Smart Antennas. VDE, Mar. 2018, pp. 1–8.

[21] B. C. Levy, Principles of Signal Detection and Parameter Estimation. Springer Science & Business Media, 2008.

[22] X. Song, J. Xu, F. Liu, T. X. Han, and Y. C. Eldar, “Intelligent reflecting surface enabled sensing: Cramér-Rao bound optimization,” IEEE Trans. Signal Process., vol. 71, pp. 2011–2026, May 2023.

[23] M. N. El Korso, R. Boyer, A. Renaux, and S. Marcos, “Conditional and unconditional Cramér-Rao bounds for near-field source localization,” IEEE Trans. Signal Process., vol. 58, no. 5, pp. 2901–2907, Feb. 2010.

[24] A. Weiss and B. Friedlander, “Range and bearing estimation using polynomial rooting,” IEEE J. Ocean. Eng., vol. 18, no. 2, pp. 130–137, Apr. 1993.

[25] H. Gazzah and J. P. Delmas, “CRB-based design of linear antenna arrays for near-field source localization,” IEEE Trans. Antennas Propag., vol. 62, no. 4, pp. 1965–1974, Jan. 2014.

[26] H. Wang, Z. Xiao, and Y. Zeng, “Cramér-Rao bounds for near-field sensing with extremely large-scale MIMO,” arXiv preprint arXiv:2303.05736, 2023.

[27] Y. Begriche, M. Thameri, and K. Abed-Meraim, “Exact Cramér-Rao bound for near field source localization,” in Proc. 11th Int. Conf. Inf. Sci., Signal Process. Appl., Jul. 2012, pp. 718–721.

[28] T. Bao, M. N. El Korso, and H. H. Ouslimani, “Cramér-Rao bound and statistical resolution limit investigation for near-field source localization,” Digit. Signal Process., vol. 48, pp. 137–147, Jan. 2016.

[29] A. Sakhnini, S. De Bast, M. Guenach, A. Bourdoux, H. Sahli, and S. Pollin, “Near-field coherent radar sensing using a massive MIMO communication testbed,” IEEE Trans. Wireless Commun., vol. 21, no. 8, pp. 6256–6270, Feb. 2022.

[30] B. Friedlander, “Localization of signals in the near-field of an antenna array,” IEEE Trans. Signal Process., vol. 67, no. 15, pp. 3885–3893, Jun. 2019.

[31] F. Liu, Y.-F. Liu, A. Li, C. Masouros, and Y. C. Eldar, “Cramér-Rao bound optimization for joint radar-communication beamforming,” IEEE Trans. Signal Process., vol. 70, pp. 240–253, Dec. 2021.

[32] J. Li, L. Xu, P. Stoica, K. W. Forsythe, and D. W. Bliss, “Range compression and waveform optimization for MIMO radar: a Cramér-Rao bound based study,” IEEE Trans. on Signal Process., vol. 56, no. 1, pp. 218–232, Dec. 2007.

[33] H. Hua, T. X. Han, and J. Xu, “MIMO integrated sensing and communication: CRB-rate tradeoff,” IEEE Trans. Wireless Commun., pp. 1–1, Aug. 2023.

[34] J. Li and P. Stoica, MIMO Radar Signal Processing. John Wiley & Sons, 2008.

[35] L. Xu, P. Stoica, and J. Li, “A diagonal growth curve model and some signal-processing applications,” IEEE Trans. Signal Process., vol. 54, no. 9, pp. 3363–3371, Aug. 2006.

[36] P. Stoica and Y. Selen, “Model-order selection: a review of information criterion rules,” IEEE Signal Process. Mag., vol. 21, no. 4, pp. 36–47, Jul. 2004.

[37] P. Stoica, R. L. Moses et al., Spectral Analysis of Signals. Pearson Prentice Hall Upper Saddle River, NJ, 2005, vol. 452.

[38] R. A. Horn and C. R. Johnson, Matrix Analysis. Cambridge university press, 2012.

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、符号说明、第 I–VI 节全部正文与子节、命题 1–6、算法 1（20 步）、图 1–7 图注、附录 A–F（命题 1–6 的完整证明推导，含式 (69)–(109)）、参考文献 [1]–[38]（英文原条目、按原编号），以及正文全部 1 条脚注。原文没有表格，故"图注与表注"中注明"原文没有表格"。公式覆盖编号式 (1)–(109)：正文 (1)–(68) 与附录 (69)–(109) 均按 PDF 渲染页逐式核对转写；其中式 (26) 的三个 CRB 子式、式 (46)/(48) 的两个恒等式、式 (72)–(109) 的证明式均按原文排版录入（式 (48) 中的 \(\ln\left(1/L\right)^M\) 按原文排版转写，其含义为 \(\ln((1/L)^M)\)）。逐句逐式终校未做；供后续 QA 重点核对：式 (26)–(31) 的 \(\tilde f\) 与 \(f^R\) 定义、式 (103)–(105) 的渐近推导符号。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
