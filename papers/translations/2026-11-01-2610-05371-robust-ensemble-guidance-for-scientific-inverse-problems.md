---
layout: page
title: "面向科学逆问题的稳健集成引导（REG）｜中文全文译文"
permalink: /papers/translations/2026-11-01-2610-05371-robust-ensemble-guidance-for-scientific-inverse-problems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/be32642a596c1b20/) · [原文 arXiv](https://arxiv.org/abs/2610.05371/) · [全部目录](/papers/catalog/)

# 面向科学逆问题的稳健集成引导（REG）

**原题：** Robust Ensemble Guidance for Scientific Inverse Problems  
**作者：** Zixiang Li、Wei Wang、Yunchao Wei、Yao Zhao、Yue Song（¹Beijing Jiaotong University 北京交通大学；²Tsinghua University 清华大学；按 PDF 首页单位标注：Zixiang Li¹、Wei Wang¹、Yunchao Wei¹、Yao Zhao¹、Yue Song²）  
**版本：** arXiv:2610.05371v1，2026-10-04；19 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节全部正文与小节（§3.1–3.4、§4.1–4.4）、作者声明（AI 使用/伦理/可复现性）、算法 1、表 1–4（逐格转写）、图 1–4 图注、式 (1)–(21)；附录 A（A.1–A.6，式 (22)–(40)）、附录 B（B.1–B.3）、附录 C（C.1–C.3 与图 5–9 图注）；参考文献 [1]–[48]（英文原条目）；许可：CC BY 4.0。逐句逐式终校未做。

## 摘要

集成引导（ensemble guidance）把预训练扩散先验与黑盒前向模型结合起来，从而在不对物理仿真器求导的前提下求解逆问题。然而，预测离散度很大的观测坐标、或极端残差，可能主导集成校正，从而降低重建精度。我们表明，两种简单的修改——**加权（weighting）**与**裁剪（clipping）**——就能显著改进这一校正。我们的方法 **稳健集成引导（Robust Ensemble Guidance, REG）** 用集成预测离散度来平衡观测尺度，并对标准化残差做自适应裁剪，以限制极端差异的影响。这两种操作都复用已有的粒子与前向预测，不额外需要去噪器调用或前向模型评估。在局部线性高斯模型下，我们导出了单步估计风险降低的条件，界定了单个观测坐标的影响上界，并刻画了这些收益在有限集成的权重估计下何时仍然保持。在 Navier–Stokes 反演、黑洞成像与声学全波形反演上的实验表明，相对其所依托的集成求解器，重建质量得到改进。特别地，REG 在三种观测情形下把黑洞重建的 PSNR 提高 6.2–8.2 dB，并在匹配预算的比较中把 Navier–Stokes 重建误差降低 26.4%。这些发现凸显了观测异质性与残差影响在科学逆问题可靠生成式求解器设计中的重要性。

## 1 引言

逆问题（inverse problem）要从间接、不完整且含噪的观测 \(y\) 中恢复未知状态 \(x^\star\)（Tarantola, 2005）。由于可能有多个状态都能解释同一测量，恢复过程需要强先验（Stuart, 2010; Bora et al., 2017）。预训练扩散模型（Ho et al., 2020; Song et al., 2020; Karras et al., 2022）为复原、感知与科学推断提供了可复用的先验（Song et al., 2021; Jalal et al., 2021）。先验把重建结果保持在数据分布附近；观测校正则提升测量一致性（Kadkhodaie & Simoncelli, 2021）。

大多数观测校正使用数据保真梯度。它们把测量误差通过去噪后的预测与前向模型传播回去（Chung et al., 2022a;b）。其他方法使用伪逆（Song et al., 2023a; Wang et al., 2022）或已知的算子结构（Kawar et al., 2022; Choi et al., 2021）。对许多成像算子而言，这类访问方式是自然的，但并不总是可得。PDE 伴随（adjoint）的推导与存储可能代价高昂，而离散或长时间运行的仿真器可能给出不稳定的灵敏度。这类情形只能依靠前向评估来提供引导。

集成引导通过让一组生成式粒子通过前向模型来提供这种能力（Zheng et al., 2024）。粒子状态与预测观测之间的经验相关性随后把测量误差输运回状态空间（Evensen, 2003; Iglesias et al., 2013; Schillings & Stuart, 2017）。这一做法免除了对前向导数的需求，但也引出了另一个问题：校正本身是由有限多个粒子估计出来的，其行为取决于观测坐标与残差幅度如何进入更新式。

有两种效应可能使该校正不稳定。第一，不同坐标上的预测观测可能处于差异极大的尺度上。若不做标准化，大尺度坐标会主导残差与集成预测之间的交互，放大该坐标上的任何噪声或估计误差。大的离散度未必意味着弱信息：问题在于不等尺度如何影响合并后的更新。第二，二次型数据保真损失会让极端残差的影响力递增（Huber & Ronchetti, 2011; Maronna et al., 2019）。因此，少数被破坏或被预测得很差的测量就可能扭曲一个原本有用的方向。更小的步长只能限制这种误差的幅度，而不能改变它的方向。这些效应促使我们在做粒子校正之前先平衡坐标尺度、并限制极端残差。

我们提出 **稳健集成引导（Robust Ensemble Guidance, REG）**，一种面向有限集成情形的无导数校正方法。REG 用集成的预测离散度同时对残差与预测观测的变动做标准化。这产生一个对角化的观测几何，从而削弱高离散度坐标的影响。随后 REG 以一个共享的、分位数自适应（quantile-adaptive）阈值裁剪标准化残差，限制极端差异对粒子交互的影响。这两种操作都复用校正本来就要用到的粒子与前向预测，既不新增去噪器调用，也不新增前向模型评估。若采用统一坐标权重且不做裁剪，则退化为标准的二次型集成校正。

我们的分析解释了这些修改在何时有益。在局部线性高斯模型下，平衡预测尺度可以改善条件数并减小受观测约束的那部分误差。我们导出了单步估计风险更低的充分条件，并刻画了该优势在权重的有限集成估计下何时仍然保持。对裁剪的分析进一步给出了残差影响的上界，并指出在何种条件下抑制极端残差可以降低估计误差。受控实验验证了这些机制，而在 Navier–Stokes 反演、黑洞成像与声学全波形反演上的实验则展示了相对其他方法的重建改进。这些结果确立了 REG 作为无导数求解器在不同科学逆问题与观测情形下的有效性。

## 2 相关工作

**面向逆问题的扩散先验。** 扩散模型（Sohl-Dickstein et al., 2015; Song & Ermon, 2019; Ho et al., 2020; Song et al., 2020; Karras et al., 2022）提供了可跨观测复用的表达能力强的先验。引导类方法把该先验与观测似然结合，建立于基于去噪器的正则化（Romano et al., 2017）与即插即用式重建（Venkatakrishnan et al., 2013）之上。一种常见策略是在每个扩散步形成干净预测，并把其测量失配同时经去噪器与已知前向算子求导（Chung et al., 2022a;b）。其他表述使用变分优化（Mardani et al., 2024），或把先验更新与数据一致性解耦（Zhu et al., 2023; Li et al., 2024）。已知算子结构（Kawar et al., 2022）与伪逆（Song et al., 2023a; Wang et al., 2022）同样可以实现观测条件化。REG 针对的是与之互补的无导数场景：使用生成粒子与前向取值。

**集成 Kalman 反演。** 集成 Kalman 类方法从粒子推断状态—观测关系（Iglesias et al., 2013; Kovachki & Stuart, 2019）。其理论处理收敛性（Schillings & Stuart, 2017; Blömker et al., 2019）与平均场极限（Ding & Li, 2021）。迭代正则化（Iglesias, 2016）与重复数据同化（Emerick & Reynolds, 2013）扩展了该框架。一般似然的推广同样修改经经验互协方差输运的得分（Duffield & Singh, 2022）。EnKG 把这种统计输运引入扩散引导，采用恒等观测几何与二次型残差（Zheng et al., 2024）。样本协方差集中不等式可量化有限样本误差（Koltchinskii & Lounici, 2017）。我们研究的是固定坐标下有限集成的观测尺度化与残差影响。

**稳健估计。** Huber 损失在零点附近是二次的（Huber, 1992）；其有界得分限制了残差影响（Hampel, 1974）。相关稳健均值（Catoni, 2012）与回归估计器（Sun et al., 2020）控制重尾波动。与理想化的噪声权重不同，逆向离散度是可观测但可能失真的。我们的分析界定了该几何与有界得分在何时能、何时不能改进常规的恒等—二次型更新。

## 3 稳健集成引导

稳健集成引导（REG）把扩散先验预测与集成校正结合起来。成对的状态变动与观测变动把数据失配输运到未知状态。预测离散度加权平衡局部观测尺度，而分位数自适应裁剪限制极端残差。下面导出这些组件以及单步风险更低的条件。

**图 1（原文 Fig. 1）：** 稳健集成引导总览。来自去噪粒子集成的前向预测确定坐标权重与一个共享的裁剪阈值；由此得到的有界残差被输运回粒子空间，构成下一步校正。（图中流程：当前粒子 → 先验步 \(G\) → 干净估计 → 校正后粒子；含“预测离散度加权”与“分位数自适应裁剪”两个分支——小离散度/大离散度、共享分位数阈值 \(+\delta/-\delta\)，随后进入“集成输运”并在下一个扩散步迭代。）

### 3.1 由前向预测构造集成引导

设 \(G:\mathbb R^n\to\mathbb R^m\) 表示前向模型，其中 \(n\) 与 \(m\) 分别为状态维数与观测维数。未知状态 \(x^\star\in\mathbb R^n\) 按下式产生观测 \(y\in\mathbb R^m\)：

$$
y=G(x^\star)+\xi,\qquad \Gamma=\operatorname{Cov}(\xi),\tag{1}
$$

其中 \(\xi\) 是零均值观测噪声，\(\Gamma\in\mathbb R^{m\times m}\) 是其协方差。递减的扩散时间表 \(\tau_T>\cdots>\tau_0=0\) 由 \(T\) 个反向步组成。在每个步 \(t\in\{T,\ldots,1\}\)，REG 维护由 \(j\) 索引的 \(J\) 个粒子构成的集成 \(\{x_t^{(j)}\}_{j=1}^J\)。例如，概率流动力学的一次 Euler 步给出如下扩散预测：

$$
x_{t-1}^{\mathrm{pred},(j)}=x_t^{(j)}-\dot\sigma(\tau_t)\sigma(\tau_t)\,s_\theta\!\left(x_t^{(j)},\tau_t\right)\left(\tau_{t-1}-\tau_t\right),\tag{2}
$$

这里 \(\sigma(\tau)\) 是扩散噪声表，\(\dot\sigma\) 为其时间导数。得分模型 \(s_\theta\) 具有预训练参数 \(\theta\)。上标 \(\mathrm{pred}\) 用以区分该预测与下文校正后的粒子 \(x_{t-1}^{(j)}\)。校正不依赖于具体的数值求解器。

去噪映射 \(\phi_t\) 作用于预测粒子所处的噪声水平。校正相关的量以反向步 \(t\) 为索引。干净状态估计 \(\hat x_t^{(j)}\)、预测观测 \(\hat y_t^{(j)}\) 与残差 \(r_t^{(j)}\) 为：

$$
\hat x_t^{(j)}=\phi_t\!\left(x_{t-1}^{\mathrm{pred},(j)}\right),\qquad
\hat y_t^{(j)}=G\!\left(\hat x_t^{(j)}\right),\qquad
r_t^{(j)}=y-\hat y_t^{(j)}.\tag{3}
$$

记 \(\bar x_{t-1}^{\mathrm{pred}}\) 与 \(\bar y_t\) 为预测粒子均值与观测均值。状态异常矩阵 \(E_t\in\mathbb R^{J\times n}\)、观测异常矩阵 \(Y_t\in\mathbb R^{J\times m}\) 与残差矩阵 \(R_t\in\mathbb R^{J\times m}\) 的行分别为：

$$
\left(E_t\right)_{j,:}=\left(x_{t-1}^{\mathrm{pred},(j)}-\bar x_{t-1}^{\mathrm{pred}}\right)^\top,\quad
\left(Y_t\right)_{j,:}=\left(\hat y_t^{(j)}-\bar y_t\right)^\top,\quad
\left(R_t\right)_{j,:}=\left(r_t^{(j)}\right)^\top.\tag{4}
$$

矩阵 \(X_{t-1}^{\mathrm{pred}}\in\mathbb R^{J\times n}\) 按行堆叠预测粒子。基本的耦合矩阵 \(\mathcal A_t^{(0)}\in\mathbb R^{J\times J}\) 与校正后的粒子矩阵 \(X_{t-1}\in\mathbb R^{J\times n}\) 为：

$$
\mathcal A_t^{(0)}=\frac{1}{J}R_tY_t^\top,\qquad
X_{t-1}=X_{t-1}^{\mathrm{pred}}+\gamma_t\,\mathcal A_t^{(0)}E_t,\tag{5}
$$

其中 \(\gamma_t>0\) 是校正步长。元素 \(\left(\mathcal A_t^{(0)}\right)_{j\ell}\) 度量粒子 \(j\) 的残差与粒子 \(\ell\) 的观测异常之间的对齐程度；粒子 \(\ell\) 的相应状态异常则把这一信息输运到状态空间。经验状态协方差 \(C_t^{xx}\) 与状态—观测互协方差 \(C_t^{xy}\) 由集成计算：

$$
C_t^{xx}=\frac{1}{J}E_t^\top E_t,\qquad C_t^{xy}=\frac{1}{J}E_t^\top Y_t.\tag{6}
$$

若 \(G\circ\phi_t\) 在集成上局部线性，其线性化 \(H_t=\nabla(G\circ\phi_t)\left(\bar x_{t-1}^{\mathrm{pred}}\right)\in\mathbb R^{m\times n}\) 给出：

$$
C_t^{xy}\approx C_t^{xx}H_t^\top,\tag{7}
$$

这就在不显式构造 \(H_t\) 的前提下提供了一个由协方差预条件的局部方向。加权与裁剪控制着观测坐标与残差幅度如何进入该方向。

该分析考虑一次局部的、线性化与协方差固定的校正。固定步长 \(\alpha>0\) 充当 \(\gamma_t\) 的理论对应物。局部参考状态 \(x_t^{\mathrm{ref}}\) 位于粒子空间，并满足 \(G\left(\phi_t\left(x_t^{\mathrm{ref}}\right)\right)=G(x^\star)\)。这一理想化把观测校正与去噪误差、线性化误差隔离开来。附录 A 给出假设、证明与附加分析。

### 3.2 可靠性加权的观测几何

恒等观测加权给每个坐标分配相同系数，即使它们的预测尺度差异很大。由此得到的更新可能把大尺度坐标连同其扰动一起放大。一个两坐标例子把这种尺度不稳定性明确展示出来。考虑一个标量局部状态，其集成方差为单位值，线性化观测向量为 \(h=(1,L)^\top\)，其中 \(L>0\) 是两个坐标之间的尺度比。两个预测标准差于是分别正比于 \(1\) 与 \(L\)。这里 \(e\) 表示标量均值状态误差，\(\zeta\) 表示第二个残差中的扰动。恒等加权校正 \(g_I\) 为：

$$
g_I=(1+L^2)e+L\zeta.\tag{8}
$$

校正后的误差为 \(e^+=e-\alpha g_I\)。仅当 \(0<\alpha<2/(1+L^2)\) 时该迭代稳定。扰动以增益 \(L\) 进入。因此大的离散度比会同时收窄稳定步长范围、并放大有限集成或测量带来的扰动。

对观测坐标 \(k\in\{1,\ldots,m\}\)，经验标准差 \(v_{t,k}\) 定义原始权重 \(\tilde w_{t,k}\) 与单位均值归一化权重 \(w_{t,k}\)：

$$
v_{t,k}=\operatorname{Std}_j\!\left[\hat y_{t,k}^{(j)}\right],\qquad
\tilde w_{t,k}=\frac{1}{v_{t,k}+\varepsilon_w},\qquad
w_{t,k}=\frac{\tilde w_{t,k}}{m^{-1}\sum_{k'=1}^{m}\tilde w_{t,k'}}.\tag{9}
$$

这里 \(\operatorname{Std}_j\) 表示跨粒子的标准差，\(k'\) 为求和指标。正的下界 \(\varepsilon_w\) 防止原始权重无界。单位均值归一化把相对坐标重要性从整体步长中分离出来。对角权重矩阵 \(W_t\in\mathbb R^{m\times m}\) 以及加权后的残差矩阵与观测异常矩阵 \(\widetilde R_t,\widetilde Y_t\in\mathbb R^{J\times m}\) 定义为：

$$
W_t=\operatorname{diag}\left(w_{t,1},\ldots,w_{t,m}\right),\qquad
\widetilde R_t=R_tW_t,\qquad
\widetilde Y_t=Y_tW_t.\tag{10}
$$

加权耦合 \(\widetilde R_t\widetilde Y_t^\top/J\) 对残差与观测异常使用相同的权重。

**加权为何有益。** 在固定的反向步上，令 \(C=C_t^{xx}\)、\(H=H_t\) 表示固定的状态协方差与线性化。预测协方差为 \(\Sigma_y=HCH^\top\)。把加权规则作用于总体离散度 \(v_k=\sqrt{(\Sigma_y)_{kk}}\)，得到总体几何 \(Q\in\mathbb R^{m\times m}\)，其经验对应物为 \(\widehat Q=W_t^2\)。对角方差矩阵为 \(D=\operatorname{diag}(v_1^2,\ldots,v_m^2)\)。在正离散度且下界为零的极限下，归一化因子 \(c=\left(m^{-1}\sum_k v_k^{-1}\right)^{-1}\) 给出：

$$
Q=c^2D^{-1}.\tag{11}
$$

因此加权在该极限下对观测空间做对角白化（diagonal whitening），并消除任意坐标尺度。当 \(\varepsilon_w\) 非零时，\(Q_{kk}\propto(v_k+\varepsilon_w)^{-2}\)。对于相关观测，标准化后的非对角相关幅度由 \(\rho=\left\|D^{-1/2}(\Sigma_y-D)D^{-1/2}\right\|_{\mathrm{op}}<1\) 度量。标准化协方差的条件数 \(\kappa\) 满足：

$$
\kappa\!\left(D^{-1/2}\Sigma_yD^{-1/2}\right)\le\frac{1+\rho}{1-\rho}.\tag{12}
$$

因此当边缘尺度失衡主导标准化后的相关性时，加权会改善条件数。在无噪声的对角情形中，当 \(0<\alpha c^2<2\) 时，该更新收缩经协方差白化的可观测误差；不可观测分量保持不变。

预测离散度只是一种局部可靠性代理，因此它在噪声下的收益是有条件的。令 \(e=\bar x_{t-1}^{\mathrm{pred}}-x_t^{\mathrm{ref}}\) 表示局部均值状态误差，\(e^+\) 为其校正后的值。在 \(C,H,Q,\alpha\) 固定的情况下，单步风险 \(R(Q)\) 对观测噪声取平方误差的平均：

$$
R(Q):=\mathbb E\left\|e^+\right\|_2^2=\left\|\left(I_n-\alpha CH^\top QH\right)e\right\|_2^2+\alpha^2\operatorname{tr}\!\left(CH^\top Q\Gamma QHC\right),\tag{13}
$$

其中两项分别是残余状态误差与转移过来的观测噪声。定义局部方向 \(d_Q=CH^\top QHe\) 与转移噪声水平 \(\nu_Q=\operatorname{tr}\left(CH^\top Q\Gamma QHC\right)\)。取 \(Q=I_m\) 即得恒等加权的对应量 \(d_I\) 与 \(\nu_I\)。对风险作展开给出精确判据：

$$
2e^\top\left(d_Q-d_I\right)>\alpha\left(\left\|d_Q\right\|_2^2-\left\|d_I\right\|_2^2+\nu_Q-\nu_I\right).\tag{14}
$$

左端是与状态误差的额外对齐量，右端是新增的幅度与噪声代价。因此，正的对齐裕度即保证在步长足够小时取得改进。对经验几何 \(\widehat Q=W_t^2\)，定义总体风险优势 \(\Delta_{\mathcal R}=\mathcal R(I_m)-\mathcal R(Q)>0\)。只要 \(\left\|\widehat Q-Q\right\|_{\mathrm{op}}<\Delta_{\mathcal R}/L_{\mathcal R}\)，该优势就保持，其中 \(L_{\mathcal R}\) 是风险对 \(Q\) 的局部敏感度。在次高斯（sub-Gaussian）预测与非消失离散度下，误差为 \(O\!\left(\sqrt{\log(m/\eta)/J}\right)\)，成立概率至少为 \(1-\eta\)，其中 \(\eta\in(0,1)\) 为失败概率。

### 3.3 分位数自适应的有界残差

加权并不能约束残差的影响。对固定的分位数水平 \(q\in(0,1)\)，REG 由全部加权残差计算阈值 \(\delta_t\)。对 \(a\in\mathbb R\)，逐元素裁剪函数 \(\psi_{\delta_t}\) 为：

$$
\delta_t=\operatorname{Quantile}_q\!\left(\left\{\left|\left(\widetilde R_t\right)_{jk}\right|\right\}_{j,k}\right),\qquad
\psi_{\delta_t}(a)=\operatorname{sign}(a)\min\left(|a|,\delta_t\right).\tag{15}
$$

裁剪保持符号与小元素不变、把幅度截到 \(\delta_t\)，并给出：

$$
\mathcal A_t=\frac{1}{J}\psi_{\delta_t}\!\left(\widetilde R_t\right)\widetilde Y_t^\top,\tag{16}
$$

其中 \(\mathcal A_t\in\mathbb R^{J\times J}\) 把残差与粒子异常耦合起来。分位数让阈值适应每一步的残差尺度。当上尾污染占比低于 \(1-q\) 时，该阈值不会变得无界。

**裁剪为何有益。** 对固定阈值 \(\delta\ge0\) 与标量残差 \(a\)，裁剪满足：

$$
a\,\psi_\delta(a)\ge\psi_\delta(a)^2\ge0.\tag{17}
$$

裁剪在保持残差符号的同时压缩尾部。在 \(W_t,\widetilde Y_t,\delta_t\) 固定时，改变加权残差元素 \((j,k)\) 会诱导耦合变化 \(\Delta\mathcal A_t\)。其 Frobenius 范数满足：

$$
\left\|\Delta\mathcal A_t\right\|_F\le\frac{2\delta_t}{J}\left\|\left(\widetilde Y_t\right)_{:,k}\right\|_2,\tag{18}
$$

与步长归一化不同，这一上界限制的是单个元素的影响，而不仅仅是更新长度。

裁剪以估计方差换取尾部偏差。考虑具有干净分布 \(P\) 的随机加权残差 \(u\in\mathbb R^m\)，以及把观测得分转移到状态空间的固定局部映射 \(M\in\mathbb R^{n\times m}\)。在 \(M,\delta\) 固定时，对 \(J\) 个独立样本，裁剪降低样本均值 MSE 当且仅当：

$$
\frac{1}{J}\operatorname{tr}\!\left(M\left[\operatorname{Cov}_P(u)-\operatorname{Cov}_P\left(\psi_\delta(u)\right)\right]M^\top\right)>\left\|M\,\mathbb E_P\left[u-\psi_\delta(u)\right]\right\|_2^2.\tag{19}
$$

左端是被去除的方差，右端是干净尾部偏差的平方。因此，当罕见的大残差带来的方差多于有用方向时，裁剪是有利的。

在任意污染下该权衡仍然有界。记污染残差占比为 \(\pi\in[0,1]\)，干净裁剪偏差为 \(b_\delta=\left\|\mathbb E_P\left[u-\psi_\delta(u)\right]\right\|_2\)。对 \(J\) 个残差样本 \(\{u_j\}_{j=1}^J\)，裁剪估计 \(\widehat g_\delta=MJ^{-1}\sum_j\psi_\delta(u_j)\) 与干净目标 \(g_P=M\mathbb E_Pu\) 满足：

$$
\mathbb E\left\|\widehat g_\delta-g_P\right\|_2^2\le\left\|M\right\|_{\mathrm{op}}^2\left[\left(b_\delta+2\pi\delta\sqrt m\right)^2+\frac{m\delta^2}{J}\right].\tag{20}
$$

各项分别刻画干净尾部偏差、有界污染与有限集成方差。与无界线性残差的误差不同，该界不依赖于被污染残差的幅度。

### 3.4 完整的 REG 更新

把输运、加权与裁剪组合起来，得到：

$$
\mathcal A_t=\frac{1}{J}\psi_{\delta_t}\!\left(R_tW_t\right)\left(Y_tW_t\right)^\top,\qquad
\gamma_t=\frac{\lambda_t}{\left\|\mathcal A_t\right\|_F+\varepsilon_\gamma},\qquad
X_{t-1}=X_{t-1}^{\mathrm{pred}}+\gamma_t\mathcal A_tE_t,\tag{21}
$$

其中 \(\lambda_t>0\) 是规定的耦合尺度，\(\varepsilon_\gamma>0\) 是步长归一化中使用的数值下界。集成关系决定状态空间方向。权重 \(W_t\) 平衡观测尺度，裁剪则约束极端残差的贡献。参数 \(\lambda_t\) 控制归一化后的耦合；状态空间位移还依赖于 \(E_t\)。

**算法 1：稳健集成引导（Robust Ensemble Guidance）**

**输入（Require）：** 前向模型 \(G\)、观测 \(y\)、粒子 \(\{x_T^{(j)}\}_{j=1}^J\)、去噪器 \(\{\phi_t\}_{t=1}^T\)、得分模型 \(s_\theta\)、噪声表 \(\sigma\)、时间点 \(\{\tau_t\}_{t=0}^T\)、下界 \(\varepsilon_w,\varepsilon_\gamma\)、分位数 \(q\)、耦合尺度 \(\{\lambda_t\}_{t=1}^T\)。

1. **for** \(t=T,T-1,\ldots,1\) **do**
2. 按式 (2) 预测 \(x_{t-1}^{\mathrm{pred},(j)}\)
3. 计算 \(\hat x_t^{(j)}=\phi_t\left(x_{t-1}^{\mathrm{pred},(j)}\right)\) 与 \(\hat y_t^{(j)}=G\left(\hat x_t^{(j)}\right)\)
4. 构造状态异常 \(E_t\)、观测异常 \(Y_t\) 与残差 \(R_t\)
5. 按式 (9) 计算 \(W_t\)；置 \(\widetilde R_t\leftarrow R_tW_t\)、\(\widetilde Y_t\leftarrow Y_tW_t\)
6. 按式 (15) 计算 \(\delta_t\)，并置 \(\mathcal A_t\leftarrow\psi_{\delta_t}\left(\widetilde R_t\right)\widetilde Y_t^\top/J\)
7. \(\gamma_t\leftarrow\lambda_t/\left(\left\|\mathcal A_t\right\|_F+\varepsilon_\gamma\right)\)
8. \(X_{t-1}\leftarrow X_{t-1}^{\mathrm{pred}}+\gamma_t\mathcal A_tE_t\)
9. **end for**
10. **return** \(\{x_0^{(j)}\}_{j=1}^J\)

## 4 实验

我们通过受控实验与三个科学逆问题来评估 REG：Navier–Stokes 反演、黑洞成像与声学全波形反演。受控研究隔离加权与裁剪各自的作用，而科学任务评估不同观测条件下的重建质量。粒子数比较与组件消融进一步考察每一项修改的贡献。

**基线。** 我们沿用 InverseBench（Zheng et al., 2025）中的比较集合。对 **Navier–Stokes**，基线为 EKI（Iglesias et al., 2013）、DPS-fGSG 与 DPS-cGSG（Zheng et al., 2024; Berahas et al., 2022）、DPG（Tang et al., 2023）、SCG（Huang et al., 2024）以及 EnKG（Zheng et al., 2024）。**黑洞成像**的基线为 SMILI（Akiyama et al., 2019）、EHT-Imaging（Chael et al., 2019）、DPS（Chung et al., 2022a）、LGD（Song et al., 2023b）、RED-diff（Mardani et al., 2024）、PnP-DM（Wu et al., 2024）、DAPS（Zhang et al., 2025）、DiffPIR（Zhu et al., 2023）与 EnKG（Zheng et al., 2024）。对**声学 FWI**，我们纳入 Adam、DPS（Chung et al., 2022a）、LGD（Song et al., 2023b）、DiffPIR（Zhu et al., 2023）、DAPS（Zhang et al., 2025）、PnP-DM（Wu et al., 2024）、RED-diff（Mardani et al., 2024）与 EnKG（Zheng et al., 2024）。

**图 2（原文 Fig. 2）：** 加权、裁剪与条件化单步风险判据的受控测试。三个面板：(a) **预测离散度加权**——横轴“预测离散度比”（1、2、4、8、16、32、64），纵轴“MSE / 未加权 MSE”（0.7–1.0），曲线为 Weighting only 与 REG；(b) **裁剪控制稀疏离群点**——横轴“离群幅度 / 噪声标准差”（0、5、10、20、40），纵轴“最终 MSE”（0.03–0.10），曲线为 Unweighted、Weighting only、Clipping only、REG，并标注“45% lower”；(c) **条件化单步风险**——横轴“解析风险增益”（−0.2–0.3），纵轴“Monte Carlo 风险增益”（−0.2–0.3），图例区分 same decision 与 different decision，并标注 \(r=0.993\)、符号一致率 = 97.5%。

### 4.1 REG 机制的受控验证

有限集成校正可能以两种不同方式失效。不相等的预测尺度会使某些观测坐标主导更新，而少量极端残差可能主导一次本应信息充分的更新。受控研究把这两种效应分离开来，并检验 REG 的两个部分是否分别针对了对应的失效模式。

我们在图 2(a,b) 中使用 \(J=256\) 个粒子的局部线性高斯问题，状态维数 16、观测维数 64。在每一项比较中，各方法共享前向映射、观测、初始集成、校正计划与随机种子。面板 (a) 在无污染条件下改变预测离散度失衡程度。面板 (b) 固定等预测离散度，并在污染 10% 的残差坐标后改变离群幅度。两个面板报告最终的集成均值 MSE，并给出配对的 95% bootstrap 置信区间。面板 (c) 在 120 个独立生成的问题上，单独比较解析单步风险增益与 Monte Carlo 估计。

图 2 展示了加权与裁剪的互补作用。在等预测离散度下，加权几乎没有收益；但随着尺度失衡增大，(a) 中重建得到改善。(b) 中裁剪控制了越来越大残差离群点所造成的退化。这些结果表明坐标尺度化与残差影响控制针对的是重建误差的不同来源。解析风险增益与 Monte Carlo 风险增益之间的一致性进一步支持了单步分析 (c)。

### 4.2 Navier–Stokes 逆问题

**问题设定。** 我们从二维不可压 Navier–Stokes 流的空间欠采样含噪观测中恢复初始涡量（initial vorticity）。非线性演化与细尺度信息的丢失使恢复变得困难，这正好检验在不穿越 PDE 求解器求导的条件下的引导能力。我们以各算例的均值与标准差报告相对 \(\ell_2\) 误差。

**结果。** 表 1 比较了 9 种欠采样与噪声组合下的相对 \(\ell_2\) 误差。REG 在 6 个设定中取得最低的平均误差，并在 7 个设定中优于 EnKG，其中包括 \(\sigma_y=2\) 时的全部欠采样倍数。这些改进覆盖了无噪声与含噪观测，说明在不同观测条件下恢复均有改善。此外，图 3 补充了定量比较：相对于其他方法，REG 在降低重建误差的同时保留了主要的涡结构。

**表 1（原文 Table 1）：** Navier–Stokes 相对 \(\ell_2\) 误差（↓）。每格上方为均值、下方括号内为标准差（s.d.）；粗体表示该列最低均值。

| 方法 / \(\sigma_y\) | ×2 / 0 | ×2 / 1 | ×2 / 2 | ×4 / 0 | ×4 / 1 | ×4 / 2 | ×8 / 0 | ×8 / 1 | ×8 / 2 |
|---|---|---|---|---|---|---|---|---|---|
| EKI | 0.577 (0.138) | 0.609 (0.119) | 0.673 (0.107) | 0.579 (0.145) | 0.669 (0.131) | 0.805 (0.112) | 0.852 (0.167) | 0.940 (0.115) | 1.116 (0.090) |
| DPS-fGSG | 1.687 (0.156) | 1.612 (0.173) | 1.454 (0.154) | 1.203 (0.122) | 1.209 (0.116) | 1.200 (0.100) | 1.246 (0.108) | 1.221 (0.082) | 1.260 (0.117) |
| DPS-cGSG | 2.203 (0.314) | 2.117 (0.295) | 1.746 (0.191) | 1.175 (0.079) | 1.133 (0.095) | 1.114 (0.144) | 1.186 (0.117) | 1.204 (0.115) | 1.218 (0.113) |
| DPG | 0.325 (0.188) | 0.408 (0.173) | 0.466 (0.171) | 0.322 (0.200) | 0.361 (0.187) | **0.454** (0.207) | 0.596 (0.301) | 0.591 (0.262) | 0.846 (0.251) |
| SCG | 0.908 (0.600) | 0.928 (0.557) | 0.966 (0.546) | 0.869 (0.513) | 0.926 (0.546) | 0.929 (0.505) | 1.260 (0.135) | 1.284 (0.117) | 1.347 (0.141) |
| EnKG | 0.116 (0.039) | **0.215** (0.065) | 0.341 (0.063) | 0.137 (0.115) | 0.343 (0.130) | 0.555 (0.103) | 0.317 (0.305) | **0.556** (0.162) | 0.763 (0.106) |
| REG | **0.100** (0.031) | 0.225 (0.103) | **0.334** (0.080) | **0.135** (0.114) | **0.330** (0.081) | 0.506 (0.084) | **0.272** (0.261) | 0.570 (0.185) | **0.757** (0.109) |

**粒子数比较与组件消融。** 我们接着考察受控研究中观察到的互补效应能否延续到非线性流动反演。在 ×2 欠采样与 \(\sigma_y=0\) 下比较 REG 与 EnKG（Zheng et al., 2024）。两种方法在相同算例上以 \(J\in\{512,1024,2048\}\) 个粒子评估。在 \(J=1024\) 时，*Clipping only* 与 *Weighting only* 分别单独隔离残差裁剪与预测离散度加权。

表 2 表明，在每一个被测粒子预算下，REG 的平均误差与波动都低于 EnKG。加权与裁剪各自都能改进校正，而二者结合表现最好，这说明它们的互补贡献超出了单纯增加集成规模的效果。更多粒子对两种方法都有帮助，但 REG 的相对优势并不随粒子数单调变化。

**表 2（原文 Table 2）：** 匹配消融（×2，\(\sigma_y=0\)）。相对 \(\ell_2\) 误差：均值 ± s.d.；粗体：每次比较中最低均值。变化量是相对相同 \(J\) 下 EnKG 的差值。

**(a) 粒子数比较**

| \(J\) | EnKG | REG | 变化 |
|---|---|---|---|
| 512 | 0.2752 ± 0.1088 | **0.2690 ± 0.0890** | −2.3% |
| 1024 | 0.2029 ± 0.1250 | **0.1493 ± 0.0463** | −26.4% |
| 2048 | 0.1156 ± 0.0385 | **0.1000 ± 0.0314** | −13.4% |

**(b) 组件消融（\(J=1024\)）**

| 方法 | 相对 \(\ell_2\) ↓ | 变化 |
|---|---|---|
| EnKG | 0.2029 ± 0.1250 | – |
| Clipping only | 0.1575 ± 0.0576 | −22.4% |
| Weighting only | 0.1670 ± 0.0556 | −17.7% |
| REG | **0.1493 ± 0.0463** | −26.4% |

**图 3（原文 Fig. 3）：** Navier–Stokes 重建（上排）与绝对误差（下排），同一测试算例，各方法共享色标。上排各列及标注的相对 \(\ell_2\)：Ground truth 0.6009、EKI 2.3892、Central-GSG 1.4001、SCG 0.3774、DPG 0.1430、EnKG 0.1144、REG (ours)（该栏数值在原 PDF 中被裁切，抽取未见，详见文末状态说明）。下排“Absolute error”采用共享的平方根色标（刻度 0、1、5、20、40，原始误差单位）。

### 4.3 黑洞成像

**问题设定。** 我们从含大气噪声与热噪声的稀疏干涉测量中重建黑洞图像。闭合相位（closure phase）与对数闭合振幅（log closure amplitude）降低了大气敏感性，但也使图像细节受到弱约束。我们按 InverseBench 在 100 幅图像、观测时间比 3%、10% 与 100% 下进行，配对的 EnKG 与 REG 使用 \(J=256\) 个粒子。

**评估指标。** 我们报告 PSNR 及其经望远镜分辨率模糊后的对应量。接近 1 的归一化卡方值表示与预期噪声水平相符。

**结果。** 表 3 在三个观测时间比上比较重建质量与测量一致性。REG 在全部三个设定中取得最高 PSNR 与最高模糊 PSNR，并相对其他方法改善了测量一致性。这些结果表明在包括最短观测时间在内的不同观测时长下图像恢复都有改进。两项 PSNR 指标同时提升，说明在原始图像分辨率与望远镜可分辨尺度上保真度都得到改善。图 4 进一步显示环结构与亮度分布的保持更好。

**表 3（原文 Table 3）：** 100 幅图像上的黑洞成像。每格上方为均值、括号内为标准差（s.d.）；粗体与下划线分别标记 PSNR 与模糊 PSNR（dB）的最优与次优。

| 方法 | 3% PSNR↑ | 3% Blur↑ | 3% \(\widetilde\chi^2_{\mathrm{cp}}\) | 3% \(\widetilde\chi^2_{\mathrm{logca}}\) | 10% PSNR↑ | 10% Blur↑ | 10% \(\widetilde\chi^2_{\mathrm{cp}}\) | 10% \(\widetilde\chi^2_{\mathrm{logca}}\) | 100% PSNR↑ | 100% Blur↑ | 100% \(\widetilde\chi^2_{\mathrm{cp}}\) | 100% \(\widetilde\chi^2_{\mathrm{logca}}\) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SMILI | 18.51 (1.39) | 23.08 (2.12) | 1.478 (0.428) | 4.348 (3.827) | 20.85 (2.90) | 25.24 (3.86) | 1.209 (0.169) | 21.788 (12.491) | 22.67 (3.13) | 27.79 (4.02) | 1.878 (0.952) | 17.612 (10.299) |
| EHT-Imaging | 21.72 (3.39) | 25.66 (5.04) | 1.507 (0.485) | 1.695 (0.539) | 22.67 (3.46) | 26.66 (3.93) | 1.166 (0.156) | 1.240 (0.205) | 24.28 (3.63) | 28.57 (4.52) | 1.251 (0.250) | 1.259 (0.316) |
| DPS | 24.20 (3.72) | 30.83 (5.58) | 8.024 (24.336) | 5.007 (5.750) | 24.36 (3.72) | 30.79 (5.75) | 13.052 (43.087) | 6.614 (26.789) | 25.86 (3.90) | 32.94 (6.19) | 8.759 (37.784) | 5.456 (24.185) |
| LGD | 22.51 (3.76) | 28.50 (5.49) | 15.825 (16.838) | 12.862 (12.663) | 22.08 (3.75) | 27.48 (5.09) | 10.775 (21.684) | 13.375 (56.397) | 21.22 (3.64) | 26.06 (4.98) | 13.239 (17.231) | 13.233 (39.107) |
| RED-diff | 20.74 (2.62) | 26.10 (3.35) | 6.713 (6.925) | 9.128 (19.052) | 22.53 (3.02) | 27.67 (4.53) | 2.488 (2.925) | 4.916 (13.221) | 23.77 (4.13) | 29.13 (6.22) | 1.853 (0.938) | 2.050 (2.361) |
| PnP-DM | <u>24.25</u> (3.45) | 30.49 (4.93) | 2.201 (1.352) | 1.668 (0.551) | <u>24.57</u> (3.47) | 30.80 (5.22) | 1.433 (0.417) | 1.336 (0.478) | <u>26.07</u> (3.70) | 32.88 (6.02) | 1.311 (0.195) | 1.199 (0.221) |
| DAPS | 23.54 (3.28) | 29.48 (4.88) | 3.647 (3.287) | 2.329 (1.354) | 23.99 (3.56) | 30.10 (5.13) | 1.545 (0.705) | 2.253 (9.903) | 25.60 (3.64) | 32.78 (5.68) | 1.300 (0.324) | 1.229 (0.532) |
| DiffPIR | 24.12 (3.25) | 30.45 (4.88) | 14.085 (14.105) | 10.545 (8.860) | 23.84 (3.59) | 30.04 (5.03) | 5.374 (3.733) | 5.205 (5.556) | 25.01 (4.64) | 31.86 (6.56) | 3.271 (1.623) | 2.970 (1.202) |
| EnKG | 20.77 (5.95) | 25.58 (7.54) | 14.019 (22.133) | 23.559 (132.848) | 18.00 (9.18) | 22.54 (11.88) | 26.675 (41.330) | 204.890 (675.821) | 21.79 (7.88) | 27.48 (10.36) | 25.173 (32.107) | 29.759 (71.019) |
| REG | **26.97** (3.79) | **34.08** (5.56) | 4.278 (7.335) | 1.740 (1.786) | **26.19** (4.54) | **33.31** (6.52) | 7.198 (11.923) | 2.908 (3.691) | **28.16** (4.58) | **36.84** (6.96) | 5.828 (9.397) | 2.852 (2.726) |

**图 4（原文 Fig. 4）：** 同一算例在 3%、10% 与 100% 观测时间下选出的黑洞重建，标注 PSNR（dB）。各列为 Ground truth、EHT-Imaging、DPS、DiffPIR、SCG、EnKG、REG (ours)。3% 行：24.64、26.88、26.72、25.06、23.55、27.55；10% 行：25.09、25.58、26.82、26.95、18.07、28.43；100% 行：25.19、29.74、29.13、24.01、29.33、30.04（对应上述 6 个基线/对比方法列；Ground truth 列无 PSNR）。EnKG 与 REG 共享观测；其他基线保留其原生随机实现。

### 4.4 声学全波形反演

**问题设定。** 我们使用 InverseBench 的声学波模型从地震测量中恢复地下速度图。稀疏记录与初始化敏感性使恢复变得困难。配对的 EnKG 与 REG 在 10 个官方测试算例上使用 \(J=64\) 个粒子。

**评估指标。** 我们报告相对 \(\ell_2\)、PSNR、SSIM 与地震数据失配（data misfit）。对配对的 EnKG 与 REG，图像类指标在每个集成均值重建上计算，再在测试算例上平均。已发表基线保留官方基准评估结果。

**结果。** 表 4 比较 10 个测试算例上的速度图重建与地震数据失配。REG 在所比较方法中取得最低平均相对误差与最高平均 SSIM，同时相对 EnKG 改善了相对误差、PSNR 与 SSIM。相对误差与 SSIM 评估的是恢复的两个互补侧面；二者同时改善意味着速度值更准确且结构一致性更好。这些结果表明，仅用 64 个粒子的集成即可实现速度图恢复的改进。更多重建结果与绝对误差图见附录 C.3。

**表 4（原文 Table 4）：** 声学 FWI 结果。均值（s.d.）。粗体标记该列最优均值。

| 方法 | 相对 \(\ell_2\) ↓ | PSNR (dB) ↑ | SSIM ↑ | 数据失配 ↓ |
|---|---|---|---|---|
| Adam | 0.333 (0.086) | 9.968 (2.083) | 0.305 (0.120) | 115.14 (52.10) |
| DPS | 0.250 (0.154) | 14.111 (6.820) | 0.491 (0.161) | 155.08 (92.17) |
| LGD | 0.244 (0.024) | 12.288 (0.889) | 0.341 (0.047) | 258.47 (26.40) |
| DiffPIR | 0.204 (0.129) | **16.113** (6.962) | 0.554 (0.191) | **88.53** (56.91) |
| DAPS | 0.201 (0.103) | 14.914 (4.184) | 0.321 (0.067) | 111.13 (71.33) |
| PnP-DM | 0.259 (0.075) | 11.983 (2.269) | 0.431 (0.073) | 308.84 (26.34) |
| RED-diff | 0.319 (0.102) | 10.372 (2.650) | 0.280 (0.108) | 94.67 (41.33) |
| EnKG | 0.170 (0.034) | 15.437 (1.308) | 0.565 (0.065) | 269.64 (51.02) |
| REG | **0.160** (0.027) | 15.903 (1.084) | **0.574** (0.064) | 268.85 (49.51) |

## 5 结论

我们提出了面向生成式逆问题的 REG。REG 把预测离散度加权与自适应残差裁剪结合起来，以平衡观测尺度并限制极端差异的影响。二者都复用集成及其前向预测，既不需要前向导数，也不需要额外的模型评估。在局部线性高斯模型下，我们的分析给出了单步估计风险降低的条件、给出了坐标影响的界，并确定了在有限集成下改进何时保持。实验支持其在不同前向算子、观测情形与问题尺度上的有效性。

## 作者声明

**AI 使用声明（AI Use Statement）。** 在手稿准备过程中使用了生成式 AI 工具，用于辅助语言润色、语法纠正与 LaTeX 排版。所有技术内容、方法设计、实验实现、结果分析与结论均由作者确定并核验。

**伦理声明（Ethics Statement）。** 本工作使用受控仿真与已有基准研究科学逆问题，涉及流体流动、黑洞成像与地震反演。所报告实验不涉及招募人类受试者或收集个人数据。

**可复现性声明（Reproducibility Statement）。** 第 3 节定义了粒子预测、加权、裁剪与校正步骤，并汇总于算法 1。附录 A 给出局部分析的假设与证明，并把固定步长的风险计算与归一化后的算法更新区分开。第 4.1 节描述受控测试及其配对评估。第 4.2–4.4 节给出科学基准、观测情形、评估指标与比较协议。第 4 节引用基准与基线来源，并区分配对评估与已发表基线结果。

## 补充材料（Supplementary Material）

本补充材料沿用正文记号。附录 A 给出假设与证明；附录 B 描述实验协议与评估约定；附录 C 给出附加重建结果。

## 附录 A 局部分析的假设与证明

本附录界定第 3 节各陈述的适用范围。加权相关结论针对冻结的局部线性模型；裁剪相关结论先在前向输运与阈值固定的前提下成立，随后讨论阈值被估计的情形。

### A.1 局部参考状态、线性化与步长归一化

固定一个反向步，记 \(F=G\circ\phi_t\) 为去噪后的前向映射，\(C=C_t^{xx}\) 为状态协方差，\(H=H_t\) 为其局部线性化。在指代该固定步上的相应量时，我们对 \(E,Y,R,W,\widetilde Y,\delta,A\) 与 \(C^{xy}\) 省略下标 \(t\)。分析在感兴趣区域上采用仿射模型 \(F(x)=F\left(x_t^{\mathrm{ref}}\right)+H\left(x-x_t^{\mathrm{ref}}\right)\)，并假设 \(F\left(x_t^{\mathrm{ref}}\right)=G(x^\star)\)。因此局部目标是粒子坐标下的一个状态，其去噪预测具有正确的观测。该假设并不把含噪粒子等同于干净状态。中心化后的行给出 \(Y=EH^\top\)，于是：

$$
C^{xy}=J^{-1}E^\top Y=J^{-1}E^\top EH^\top=CH^\top.\tag{22}
$$

对非线性的 \(F\)，余项矩阵 \(B_{\mathrm{nl}}\) 给出 \(Y=EH^\top+B_{\mathrm{nl}}\) 与 \(C^{xy}=CH^\top+J^{-1}E^\top B_{\mathrm{nl}}\)。

令 \(e=\bar x_{t-1}^{\mathrm{pred}}-x_t^{\mathrm{ref}}\)。若平均前向预测与 \(G(x^\star)+He\) 相差一个确定性失配 \(b\in\mathbb R^m\)，则平均残差为 \(-He-b+\xi\)。这里 \(\alpha\) 是 \(\gamma_t\) 的固定理论对应物，\(Q\) 是确定性观测几何，\(e^+\) 是校正后的误差。该更新给出

$$
e^+=\left(I_n-\alpha CH^\top QH\right)e-\alpha CH^\top Qb+\alpha CH^\top Q\xi.\tag{23}
$$

正文中的风险取 \(b=0\) 并固定 \(C,H,Q,\alpha\)，对协方差为 \(\Gamma\) 的零均值噪声取平均。非零的 \(b\) 会进入确定性误差项，并可能改变两个几何的排序。这些量对同一噪声的依赖性需要进一步分析。

式 (21) 中实现的归一化满足

$$
\left\|\gamma_t\mathcal A_tE_t\right\|_F\le\frac{\lambda_t}{\left\|\mathcal A_t\right\|_F}\frac{\left\|\mathcal A_t\right\|_F}{\left\|\mathcal A_t\right\|_F+\varepsilon_\gamma}\left\|E_t\right\|_{\mathrm{op}}\le\lambda_t\left\|E_t\right\|_{\mathrm{op}}.\tag{24}
$$

它约束的是相对集成离散度的位移，而不是把位移长度设为 \(\lambda_t\)。风险比较使用共同的固定 \(\alpha\)。

### A.2 尺度平衡与条件数

令 \(\Sigma_y=HCH^\top\) 为预测协方差，\(v_k^2=(\Sigma_y)_{kk}\)，\(D=\operatorname{diag}(v_1^2,\ldots,v_m^2)\)，其中 \(D_{kk}>0\)。总体几何 \(Q\) 使用这些总体离散度，其经验对应物为 \(\widehat Q=W_t^2\)。在理想化的零下界极限下，定义 \(c=\left(m^{-1}\sum_k D_{kk}^{-1/2}\right)^{-1}\)。把式 (9) 作用于总体离散度给出 \(Q=c^2D^{-1}\)。因此

$$
Q^{1/2}\Sigma_yQ^{1/2}=c^2D^{-1/2}\Sigma_yD^{-1/2}.\tag{25}
$$

其对角元素相等，而非对角相关仍然保留。这是边缘标准化，并不主张对角权重能去除全部相关性。当 \(\varepsilon_w>0\) 时，精确权重正比于 \(\left(\sqrt{D_{kk}}+\varepsilon_w\right)^{-1}\)；式 (11) 是零下界极限。

记 \(D^{-1/2}\Sigma_yD^{-1/2}=I_m+K\)，其中 \(K\) 对称且 \(\|K\|_{\mathrm{op}}=\rho<1\)。对单位向量 \(z\)，

$$
1-\rho\le z^\top\left(I_m+K\right)z\le1+\rho.\tag{26}
$$

因此最小与最大特征值都落在该区间内，这证明了式 (12)。相对未加权协方差取得严格改进的一个充分条件是 \(\kappa(\Sigma_y)>(1+\rho)/(1-\rho)\)。

对正的坐标重缩放 \(S=\operatorname{diag}(s_1,\ldots,s_m)\)，令 \(R'=RS\)、\(Y'=YS\)。在零下界极限下 \(W'=aS^{-1}W\)（对某个公共常数 \(a>0\)），于是 \(R'W'=aRW\)、\(Y'W'=aYW\)、\(\delta'=a\delta\)。裁剪的齐次性给出 \(\mathcal A'=a^2\mathcal A\)，其中撇号表示重缩放后的量。因此当 \(\mathcal A\ne0\) 且归一化下界为零时，\(\mathcal A/\|\mathcal A\|_F\) 不变。

### A.3 可观测误差的收缩

假设 \(C\) 正定，且 \(\Sigma_y=HCH^\top=D\) 为对角正定，并如上取 \(Q=c^2D^{-1}\)。定义 \(B=HC^{1/2}\) 与协方差白化误差 \(z=C^{-1/2}e\)。由于 \(BB^\top=D\)，到 \(B\) 行空间的正交投影为：

$$
\Pi=B^\top\left(BB^\top\right)^{-1}B.\tag{27}
$$

它满足 \(\Pi^\top=\Pi\) 与 \(\Pi^2=\Pi\)。记 \(z^+=C^{-1/2}e^+\) 为校正后的白化误差，则无噪声更新及其平方误差满足：

$$
z^+=\left(I_n-\alpha c^2\Pi\right)z,\qquad
\left\|z^+\right\|_2^2=\left(1-\alpha c^2\right)^2\left\|\Pi z\right\|_2^2+\left\|\left(I_n-\Pi\right)z\right\|_2^2.\tag{28}
$$

当 \(0<\alpha c^2<2\) 时，可观测分量严格收缩（除非其本身已为零）；零空间分量保持不变。我们显式保留 \(c^2\)，以便 \(\alpha\) 与风险分析中的含义一致。对奇异的 \(C\)，只要 \(H\) 在其值域上行满秩且误差落在该值域内，同一论证在其值域上成立。

### A.4 单步风险与有限集成权重估计

在式 (23) 中取 \(b=0\)。由于 \(\mathbb E\xi=0\)，交叉项消失，而恒等式 \(\mathbb E\left\|CH^\top Q\xi\right\|_2^2=\operatorname{tr}\left(CH^\top Q\Gamma QHC\right)\) 给出式 (13)。这里只需要噪声的前两阶矩；高斯噪声是充分的特例。展开确定性平方项得到

$$
R(Q)=\left\|e\right\|_2^2-2\alpha e^\top d_Q+\alpha^2\left(\left\|d_Q\right\|_2^2+\nu_Q\right).\tag{29}
$$

减去 \(R(I_m)\) 即证明式 (14)。特别地，若 \(a=e^\top\left(d_Q-d_I\right)>0\) 且 \(b_1=\left\|d_Q\right\|_2^2-\left\|d_I\right\|_2^2+\nu_Q-\nu_I\)，则当 \(b_1>0\) 时，\(0<\alpha<2a/b_1\) 时改进成立；在该冻结模型中当 \(b_1\le0\) 时，对任意正 \(\alpha\) 改进都成立。

为完整起见，正文中的局部敏感度可以显式写出。对冻结的输运置 \(U=CH^\top\)，并令 \(B_Q>0\) 界定各几何：\(\|Q\|_{\mathrm{op}},\|\widehat Q\|_{\mathrm{op}}\le B_Q\)。平方范数之差与噪声项的 Frobenius 表示给出

$$
\left|R(\widehat Q)-R(Q)\right|\le L_{\mathcal R}\left\|\widehat Q-Q\right\|_{\mathrm{op}},\tag{30}
$$

$$
L_{\mathcal R}=2\alpha\|U\|_{\mathrm{op}}\|He\|_2\left(\|e\|_2+\alpha\|U\|_{\mathrm{op}}B_Q\|He\|_2\right)+2\alpha^2\|U\|_{\mathrm{op}}^2B_Q\operatorname{tr}(\Gamma).\tag{31}
$$

若 \(L_{\mathcal R}>0\)，则总体优势 \(\Delta_{\mathcal R}>0\) 在 \(\left\|\widehat Q-Q\right\|_{\mathrm{op}}<\Delta_{\mathcal R}/L_{\mathcal R}\) 时保持。若 \(L_{\mathcal R}=0\)，则在所考虑的邻域上风险为常数。

所述的收敛速率在如下条件下成立：标定预测独立同分布、具有一致有界的次高斯范数，其边缘标准差 \(v_k\) 落在 \([v_{\min},v_{\max}]\) 内且 \(v_{\min}>0\)。记其经验估计为 \(\widehat v_k=v_{t,k}\)。对经验一阶与二阶矩取集中不等式，再对坐标做联合界（union bound），得到

$$
\max_k\left|\widehat v_k^2-v_k^2\right|\le C_0\left(\sqrt{\frac{\log(2m/\eta)}{J}}+\frac{\log(2m/\eta)}{J}\right)\tag{32}
$$

以至少 \(1-\eta\) 的概率成立。这里 \(C_0\) 依赖于一致的次高斯界。其推导是对中心化平方坐标应用 Bernstein 不等式，并对每个样本均值应用次高斯界。在经验方差保持高于 \(v_{\min}^2/2\) 的事件上，平方根、逆尺度、单位均值归一化与平方在该有界区间上都是 Lipschitz 的。对角算子范数就是最大的坐标误差，因此当 \(J\) 相对 \(\log(2m/\eta)\) 足够大时，

$$
\left\|\widehat Q-Q\right\|_{\mathrm{op}}=O\!\left(\sqrt{\frac{\log(2m/\eta)}{J}}\right).\tag{33}
$$

常数依赖于离散度界与所选下界。总体权重与经验权重必须使用同一下界，否则还必须计入其确定性近似误差。该论证在 \(C,H,e\) 固定时控制权重估计。

### A.5 裁剪影响与自适应阈值

对标量残差 \(a\)，当 \(|a|\le\delta\) 时 \(a\psi_\delta(a)=\psi_\delta(a)^2=a^2\)；否则 \(a\psi_\delta(a)=|a|\delta\ge\delta^2\)。这证明了式 (17)。固定 \(W,\widetilde Y,\delta\)，只把加权残差元素 \((j,k)\) 由 \(a\) 改为 \(a'\)。若 \(e_j\) 是 \(\mathbb R^J\) 中第 \(j\) 个坐标单位向量，则

$$
\Delta\mathcal A=\frac{\psi_\delta(a')-\psi_\delta(a)}{J}e_j\left(\widetilde Y_{:,k}\right)^\top.\tag{34}
$$

由于该标量差的幅度至多为 \(2\delta\)，这一秩一矩阵的范数即证明式 (18)。

重算阈值还会改变其他被裁剪的元素。设 \(\widetilde R'\) 与 \(\widetilde R=RW\) 仅在一个元素上不同，对应重算阈值 \(\delta'\) 与耦合 \(\mathcal A'\)。通过加减 \(\psi_\delta(\widetilde R')\) 得到

$$
\left\|\mathcal A'-\mathcal A\right\|_F\le\frac{2\delta}{J}\left\|\widetilde Y_{:,k}\right\|_2+\sqrt{\frac{m}{J}}\left|\delta'-\delta\right|\left\|\widetilde Y\right\|_{\mathrm{op}},\tag{35}
$$

因为 \(\left|\psi_{\delta'}(a)-\psi_\delta(a)\right|\le\left|\delta'-\delta\right|\)。

在总体层面，在上尾污染占比 \(\pi\) 下，只要该分位数有限，分位数水平 \(q<1-\pi\) 仍低于干净分布的一个有限分位数。对 \(N=Jm\) 个有限元素与 \(r\) 个任意替换，类似条件为：经验分位数使用的顺序统计量下标位于 \(N-r\) 或更低。例如，对下标 \(1+(N-1)q\) 处的线性插值，只需 \(\lceil1+(N-1)q\rceil\le N-r\)。这陈述了污染占比解释背后的有限样本取整条件。一个共享的测量可能影响多个元素，因此该占比是针对阈值元素的。

### A.6 方差、尾部偏差与污染风险

对式 (19)，假设 \(u_1,\ldots,u_J\) 是来自干净分布 \(P\)、二阶矩有限的独立样本，且 \(M\) 与 \(\delta\) 独立于这些样本。记 \(\mu=\mathbb E_Pu\)、\(\mu_\delta=\mathbb E_P\psi_\delta(u)\)。未裁剪的均值对 \(M\mu\) 无偏；裁剪引入偏差 \(M\left(\mu_\delta-\mu\right)\)。因此

$$
\mathbb E\left\|MJ^{-1}\sum_ju_j-M\mu\right\|_2^2=J^{-1}\operatorname{tr}\!\left(M\operatorname{Cov}_P(u)M^\top\right),\tag{36}
$$

$$
\mathbb E\left\|MJ^{-1}\sum_j\psi_\delta(u_j)-M\mu\right\|_2^2=\left\|M\left(\mu_\delta-\mu\right)\right\|_2^2+J^{-1}\operatorname{tr}\!\left(M\operatorname{Cov}_P\left(\psi_\delta(u)\right)M^\top\right).\tag{37}
$$

相减即证明正文中的精确判据，其中两个协方差均在 \(P\) 下取得。

对标量残差 \(a\)，裁剪是 1-Lipschitz 的，因此对独立副本 \(a'\) 有 \(\operatorname{Var}\left(\psi_\delta(a)\right)=\tfrac12\mathbb E\left(\psi_\delta(a)-\psi_\delta(a')\right)^2\le\tfrac12\mathbb E\left(a-a'\right)^2=\operatorname{Var}(a)\)。这会降低每个边缘方差，但当坐标相关时，并不意味着在任意映射 \(M\) 之后的协方差序关系。若坐标相互独立，则协方差矩阵为对角阵，被输运的方差不会增加。若它们还关于零对称，则裁剪偏差消失、风险不会增加，并且当 \(M\) 使用的某个方向的方差严格降低时取得严格改进。对一般残差，则必须使用显式的方差—偏差判据。

对式 (20)，改为假设样本独立取自 \((1-\pi)P+\pi P_{\mathrm{bad}}\)，其中 \(P\) 一阶矩有限、\(P_{\mathrm{bad}}\) 任意。裁剪满足 \(\left\|\psi_\delta(u)\right\|_2\le\delta\sqrt m\)，这保证所需各阶矩存在，并给出如下偏差与方差界：

$$
\left\|\mathbb E\psi_\delta(u)-\mathbb E_Pu\right\|_2\le b_\delta+2\pi\delta\sqrt m,\tag{38}
$$

$$
\operatorname{tr}\!\left(\operatorname{Cov}\left(\psi_\delta(u)\right)\right)\le\mathbb E\left\|\psi_\delta(u)\right\|_2^2\le m\delta^2.\tag{39}
$$

偏差—方差分解以及对任意 \(z\in\mathbb R^m\) 的 \(\left\|Mz\right\|_2\le\|M\|_{\mathrm{op}}\|z\|_2\) 即证明所声称的界。

这些样本均值结果使用固定的阈值与输运。若这些量在独立标定数据上估计，它们也同样以条件形式成立。以由同一批残差算出的分位数为条件，并不保持其独立性。为联系这两种情形，把随机阈值 \(\widehat\delta\) 与固定阈值 \(\delta_0\) 相比。对阈值的 Lipschitz 依赖性给出：对任意松弛参数 \(\beta>0\)，

$$
\mathbb E\left\|\widehat g_{\widehat\delta}-g_P\right\|_2^2\le(1+\beta)\mathbb E\left\|\widehat g_{\delta_0}-g_P\right\|_2^2+\left(1+\beta^{-1}\right)\|M\|_{\mathrm{op}}^2m\,\mathbb E\left|\widehat\delta-\delta_0\right|^2.\tag{40}
$$

要得到依赖样本的阈值保证，必须控制这一附加项。同理，相关粒子会为其均值的方差引入互协方差项。

## 附录 B 实验协议与评估细节

### B.1 求解器设置

**Navier–Stokes。** 九设定扫描使用 \(J=2048\)、批大小 64、80 步、两次更新、引导尺度 2.0、数值下界 0.01 与分位数 0.995。它还设置精度收缩（precision shrinkage）= 1.0、精度幂（precision power）= 2.0、观测噪声标准差 \(\sigma_y\)，以及引导衰减幂（guidance decay power）= 0.05。

**黑洞成像。** 配对启动器使用官方 `nfft` 观测后端、\(J=256\)、批大小 32、80 个反向步，并在每次校正时做两次更新。数值下界与分位数分别为 0.01 与 0.75。观测种子为 0，推断种子为 \(100000+\text{算例 ID}\)。

**声学 FWI。** 配对集成启动器使用 \(J=64\)、批大小 4、四个反向步、每步一次更新、数值下界 0.01、分位数 0.75、校正步幅 1。它从验证选择中载入各方法专属的引导尺度。观测种子为 0，推断种子为 \(100000+\text{算例 ID}\)。

### B.2 受控实验

图 2 的面板 (a) 与 (b) 使用状态维数 16、观测维数 64 与 \(J=256\)。面板 (a) 使用离散度比 1、2、4、8、16、32、64，且无污染。面板 (b) 把离散度比固定为 1、污染比例固定为 10%，离群幅度取噪声标准差的 0、5、10、20、40 倍。

面板 (c) 使用另一个线性实验，状态维数 12、观测维数 48。它在 120 个生成问题上比较解析风险增益与经验风险增益。总体与经验的加权方向都被重缩放，以匹配相应的未加权线性更新的 Frobenius 范数。该实验中的经验预测使用分母为 \(J\) 的标准差。

### B.3 指标与可视化约定

对展示的重建 \(\hat x\)，相对误差为 \(\left\|\hat x-x^\star\right\|_2/\left\|x^\star\right\|_2\)。绝对误差图显示 \(\left|\hat x-x^\star\right|\)。NS 的定性分数使用所展示的粒子均值。

配对 FWI 的重建指标在集成均值上评估。保存的地震失配为 \(q=\tfrac12\left\|G(\hat x)-y\right\|_2^2\)，随后再对算例指标聚合。NS 与配对 FWI 的记录使用总体标准差（分母为 \(J\)）。

黑洞定性面板使用既有的平移对齐网格，并选用相对参考图像对齐后 PSNR 最高的已保存粒子。两种集成方法使用同一规则。其模糊 PSNR 列对应模糊因子 \(f=20\) 的已保存评估场。EnKG 与 REG 共享观测；其他定性基线在同一目标与观测时间设定下保留其原生观测实现。

在图 3 中，NS 重建共享一个对称涡量色标。绝对误差颜色使用共同的平方根映射，刻度取原始误差单位。黑洞面板共享 \([0,1]\) 范围。

## 附录 C 附加定性结果

### C.1 Navier–Stokes 反演

图 5 在原始匹配配置下把多方法比较扩展到另一个目标。REG 保持了涡结构，并在所展示的方法中取得最低重建误差。

**图 5（原文 Fig. 5）：** ×2、\(\sigma_y=0\) 下的 NS 重建与绝对误差。EnKG 与 REG 使用 \(J=2048\)；图中数字为所示重建的相对 \(\ell_2\) 误差。

图 6 用附录 B.1 中的噪声感知配置把目标固定、遍历九个设定。密集且无噪声的观测给出最精确的恢复，而更强的噪声与更粗的采样会逐步模糊更细的结构。

**图 6（原文 Fig. 6）：** NS id0 在降采样倍数 ×2/4/8 与噪声水平 \(\sigma_y=0/1/2\) 下的 REG 重建，\(J=2048\)。所有面板共享一个涡量色标。

### C.2 黑洞成像

图 7 比较另外三个目标。DPS 会丢失部分环结构或使其形状畸变，而 EnKG 表现出结构扭曲或强烈的颗粒状伪影。在这些例子中，REG 更好地保持了环与亮度分布。

**图 7（原文 Fig. 7）：** 选出的黑洞重建：id0（100%）、id3（3%）与 id7（3%）观测时间。图中数字为对齐后的 PSNR（dB）；评估遵循附录 B.3。

图 8 给出另外六个目标在两个观测时间下的结果。REG 在不同形态下都恢复了主环与亮区，而复杂的外围螺旋图样则分辨得不够完整。

**图 8（原文 Fig. 8）：** 更多黑洞目标与 REG 重建，3% 与 100% 观测时间，\(J=256\)。图中数字为对齐后的 PSNR（dB）。

### C.3 声学全波形反演

图 9 在三组速度场上比较 EnKG 与 REG。REG 在每个算例中都降低了重建误差，并更好地匹配了大尺度速度变化。两种方法中细界面仍被平滑。

**图 9（原文 Fig. 9）：** id2、id5 与 id7 的 FWI 重建与绝对误差，\(J=64\)。速度面板与误差面板使用共享色标；图中数字为相对 \(\ell_2\) 误差。

## 参考文献

（原文采用作者—年份制、未编号；本页按出现顺序编号，条目保留英文原文。）

[1] Kazunori Akiyama, Fumie Tazaki, Kotaro Moriyama, Ilje Cho, Shiro Ikeda, Mahito Sasada, Hiroki Okino, and Mareki Honma. SMILI: Sparse modeling imaging library for interferometry, 2019.

[2] Albert S Berahas, Liyuan Cao, Krzysztof Choromanski, and Katya Scheinberg. A theoretical and empirical comparison of gradient approximations in derivative-free optimization. Foundations of Computational Mathematics, 22(2):507–560, 2022.

[3] Dirk Blömker, Claudia Schillings, Philipp Wacker, and Simon Weissmann. Well posedness and convergence analysis of the ensemble Kalman inversion. Inverse Problems, 35(8):085007, 2019.

[4] Ashish Bora, Ajil Jalal, Eric Price, and Alexandros G Dimakis. Compressed sensing using generative models. In International Conference on Machine Learning, pp. 537–546. PMLR, 2017.

[5] Olivier Catoni. Challenging the empirical mean and empirical variance: a deviation study. 48(4):1148–1185, 2012.

[6] Andrew Chael, Katie Bouman, Michael Johnson, Maciek Wielgus, Lindy Blackburn, Chi-Kwan Chan, Joseph Rachid Farah, Daniel Palumbo, and Dominic Pesce. eht-imaging: v1.1.0: Imaging interferometric data with regularized maximum likelihood, 2019.

[7] Jooyoung Choi, Sungwon Kim, Yonghyun Jeong, Youngjune Gwon, and Sungroh Yoon. ILVR: Conditioning method for denoising diffusion probabilistic models. 2021.

[8] Hyungjin Chung, Jeongsol Kim, Michael T Mccann, Marc L Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. 2022a.

[9] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. volume 35, pp. 25683–25696, 2022b.

[10] Zhiyan Ding and Qin Li. Ensemble Kalman inversion: mean-field limit and convergence analysis. Statistics and Computing, 31(1):9, 2021.

[11] Samuel Duffield and Sumeetpal S Singh. Ensemble Kalman inversion for general likelihoods. Statistics & Probability Letters, 187:109523, 2022.

[12] Alexandre A Emerick and Albert C Reynolds. Ensemble smoother with multiple data assimilation. Computers & Geosciences, 55:3–15, 2013.

[13] Geir Evensen. The ensemble Kalman filter: Theoretical formulation and practical implementation. Ocean Dynamics, 53(4):343–367, 2003.

[14] Frank R Hampel. The influence curve and its role in robust estimation. Journal of the American Statistical Association, 69(346):383–393, 1974.

[15] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. volume 33, pp. 6840–6851, 2020.

[16] Yujia Huang, Adishree Ghatare, Yuanzhe Liu, Ziniu Hu, Qingsheng Zhang, Chandramouli S Sastry, Siddharth Gururani, Sageev Oore, and Yisong Yue. Symbolic music generation with non-differentiable rule guided diffusion. 2024.

[17] Peter J Huber. Robust estimation of a location parameter. pp. 492–518, 1992.

[18] Peter J Huber and Elvezio M Ronchetti. Robust Statistics. John Wiley & Sons, 2011.

[19] Marco A Iglesias. A regularizing iterative ensemble Kalman method for PDE-constrained inverse problems. Inverse Problems, 32(2):025002, 2016.

[20] Marco A Iglesias, Kody JH Law, and Andrew M Stuart. Ensemble Kalman methods for inverse problems. Inverse Problems, 29(4):045001, 2013.

[21] Ajil Jalal, Marius Arvinte, Giannis Daras, Eric Price, Alexandros G Dimakis, and Jon Tamir. Robust compressed sensing MRI with deep generative priors. volume 34, pp. 14938–14954, 2021.

[22] Zahra Kadkhodaie and Eero Simoncelli. Stochastic solutions for linear inverse problems using the prior implicit in a denoiser. volume 34, pp. 13242–13254, 2021.

[23] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. volume 35, pp. 26565–26577, 2022.

[24] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. volume 35, pp. 23593–23606, 2022.

[25] Vladimir Koltchinskii and Karim Lounici. Concentration inequalities and moment bounds for sample covariance operators. Bernoulli, pp. 110–133, 2017.

[26] Nikola B Kovachki and Andrew M Stuart. Ensemble Kalman inversion: a derivative-free technique for machine learning tasks. Inverse Problems, 35(9):095005, 2019.

[27] Xiang Li, Soo Min Kwon, Shijun Liang, Ismail R Alkhouri, Saiprasad Ravishankar, and Qing Qu. Decoupled data consistency with diffusion purification for image restoration. arXiv preprint arXiv:2403.06054, 2024.

[28] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In International Conference on Learning Representations, volume 2024, pp. 28027–28053, 2024.

[29] Ricardo A Maronna, R Douglas Martin, Victor J Yohai, and Matías Salibián-Barrera. Robust Statistics: Theory and Methods (with R). John Wiley & Sons, 2019.

[30] Yaniv Romano, Michael Elad, and Peyman Milanfar. The little engine that could: Regularization by denoising (RED). SIAM Journal on Imaging Sciences, 10(4):1804–1844, 2017.

[31] Claudia Schillings and Andrew M Stuart. Analysis of the ensemble Kalman filter for inverse problems. SIAM Journal on Numerical Analysis, 55(3):1264–1290, 2017.

[32] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In International Conference on Machine Learning, pp. 2256–2265. PMLR, 2015.

[33] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023a.

[34] Jiaming Song, Qinsheng Zhang, Hongxu Yin, Morteza Mardani, Ming-Yu Liu, Jan Kautz, Yongxin Chen, and Arash Vahdat. Loss-guided diffusion models for plug-and-play controllable generation. In International Conference on Machine Learning, pp. 32483–32498. PMLR, 2023b.

[35] Yang Song and Stefano Ermon. Generative modeling by estimating gradients of the data distribution. volume 32, 2019.

[36] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. 2020.

[37] Yang Song, Liyue Shen, Lei Xing, and Stefano Ermon. Solving inverse problems in medical imaging with score-based generative models. 2021.

[38] Andrew M Stuart. Inverse problems: a Bayesian perspective. Acta Numerica, 19:451–559, 2010.

[39] Qiang Sun, Wen-Xin Zhou, and Jianqing Fan. Adaptive Huber regression. Journal of the American Statistical Association, 115(529):254–265, 2020.

[40] Haoyue Tang, Tian Xie, Aosong Feng, Hanyu Wang, Chenyang Zhang, and Yang Bai. Solving noisy inverse problems via posterior sampling: A policy gradient view-point. In The Symbiosis of Deep Learning and Differential Equations III, 2023.

[41] Albert Tarantola. Inverse Problem Theory and Methods for Model Parameter Estimation. SIAM, 2005.

[42] Singanallur V Venkatakrishnan, Charles A Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In 2013 IEEE Global Conference on Signal and Information Processing, pp. 945–948. IEEE, 2013.

[43] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. 2022.

[44] Zihui Wu, Yu Sun, Yifan Chen, Bingliang Zhang, Yisong Yue, and Katherine L Bouman. Principled probabilistic imaging using diffusion models as plug-and-play priors. Advances in Neural Information Processing Systems, 37:118389–118427, 2024.

[45] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. pp. 20895–20905, 2025.

[46] Hongkai Zheng, Wenda Chu, Austin Wang, Nikola Kovachki, Ricardo Baptista, and Yisong Yue. Ensemble Kalman diffusion guidance: A derivative-free method for inverse problems. arXiv preprint arXiv:2409.20175, 2024.

[47] Hongkai Zheng, Wenda Chu, Bingliang Zhang, Zihui Wu, Austin Wang, Berthy Feng, Caifeng Zou, Yu Sun, Nikola Kovachki, Zachary Ross, et al. InverseBench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences. In International Conference on Learning Representations, volume 2025, pp. 90912–90940, 2025.

[48] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In 2023 IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops (CVPRW), pp. 1219–1229. IEEE, 2023.

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、第 1–5 节正文与小节（§3.1–3.4、§4.1–4.4）、算法 1、式 (1)–(21)、表 1–4（逐格转写，含原文的粗体最优与下划线次优标记）、图 1–4 图注、作者声明（AI 使用/伦理/可复现性）、补充材料附录 A（A.1–A.6，式 (22)–(40)）、附录 B（B.1–B.3）、附录 C（C.1–C.3，图 5–9 图注）与参考文献 [1]–[48]（英文原条目）；原文无关键词、无编号定理环境。**已知缺陷与核对说明：** ① pypdf 抽取把公式的分式与上下标打散（如式 (2)、(9)、(13)、(21) 等在纯文本中只剩片段）；本页对正文式 (1)–(21) 已按 PDF 渲染页（第 3–5 页）逐式核对录入，附录式 (22)–(40) 则按 pypdf 抽取文本还原（未逐页渲染核对），式号与原文一致；② 表 3（黑洞成像）在纯文本抽取中按“每方法 12 个数值连续出现”排列、列归属不可见，本页按 PDF 渲染页确认各值分别属于 3%/10%/100% 观测时间下的 PSNR、Blur、\(\widetilde\chi^2_{\mathrm{cp}}\)、\(\widetilde\chi^2_{\mathrm{logca}}\) 四列；③ 表 1 的粗体最低均值位于 DPG/EnKG/REG 等不同行（并非全为 REG），已按 PDF 逐格核对；④ 图 3 中 REG 一栏的相对 \(\ell_2\) 数值在原 PDF 中被裁切（渲染核查亦未见该数字），本页未作任何推测，仅如实标注；⑤ 表 4 中 PSNR 与数据失配的最优均值为 DiffPIR（16.113 dB / 88.53），与正文“REG 取得最低相对误差与最高 SSIM”的表述一致，未做改写；⑥ 原文首页标题为小型大写字母、抽取时连写（“ROBUSTENSEMBLEGUIDANCE…”），已按语义还原；⑦ 参考文献中若干条目原文缺少期刊名/页码（如 [5]、[17]、[35] 等），按原文如实照录、未补全。逐句逐式终校未做；建议后续 QA 重点复核：式 (13)–(14) 的风险判据方向、式 (20) 的污染界定常数、表 3 的 \(\widetilde\chi^2\) 数值、以及附录 A.4 中 \(L_{\mathcal R}\) 的表达式。

---

**登记（2026-11-01）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
