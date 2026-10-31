---
layout: page
title: "HarmoCore：骨稀疏重建的函数潜扩散｜中文全文译文"
permalink: /papers/translations/2026-09-18-2609-00679-harmocore-functional-latent-diffusion-for-sparse-reconstruction-of-osc/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/4b9e56a579c0e989/) · [原文 arXiv](https://arxiv.org/abs/2609.00679) · [全部目录](/papers/catalog/)

# HarmoCore：骨稀疏重建的函数潜扩散

**原题：** HarmoCore: Functional Latent Diffusion for Sparse Reconstruction of Oscillatory Wave Fields  
**作者：** Lihao Chen¹、Xinyu Zhang¹、Panqi Chen¹、Lei Cheng¹、Ting Zhang¹、Jianlong Li¹、Shikai Fang¹*。单位：¹ 浙江大学信息与电子工程学院（College of Information Science and Electronic Engineering, Zhejiang University）；通讯作者：Shikai Fang（fsk@zju.edu.cn）。  
**版本：** arXiv:2609.00679v1（cs.LG），2026 年 9 月 1 日提交，原文 15 页（AAAI 风格单栏投稿格式，含图 1–8、表 1–6、公式 (1)–(15)、附录 A–B、参考文献 32 条）。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–6 节（含 2.1–2.3、3.1–3.3、5.1–5.4 等全部小节）、结论、全部图注（图 1–8）、表 1–6（逐格转录）、公式 (1)–(15)、附录 A–B（实现细节、附加定量与定性结果）以及 32 条参考文献英文原条目；原文无作者简介；逐句逐式终校未做。

## 摘要

从稀疏传感器重建振荡波场是一个严重欠定的逆问题。除一般物理场重建的困难外，波响应是复值的、频率敏感的且高度振荡的，而昂贵的仿真与感知往往只留下极端稀疏的观测。现有低秩、算子与扩散方法大多面向实值、较平滑的场；稠密像素空间扩散对振荡复场尤其低效，且难以扩展到 3D。我们提出 **HarmoCore**，把生成先验置于紧凑、连续且有结构的波场潜表示中。HarmoCore 用**共享连续空间基**上的**函数 Tucker 核心**表示联合实–虚通道，学习频率条件的核心扩散先验，并直接在核心空间执行扩散后验采样（DPS）。在固定传感器坐标处，多线性解码器诱导出显式的似然引导算子，从而避免稠密像素空间校正；可选的目标准方程残差引导进一步促进物理一致性。在 2D Helmholtz、2D 合成波场与 3D Helmholtz 上的实验表明，在 1%–2% 感知下取得显著增益，同时在三维情形下仍保持实用性。

## 1 引言

从稀疏测量重建物理场是科学与工程中的基本逆问题（Arridge et al. 2019; Manohar et al. 2018）。波场重建在电磁仿真（Colton and Kress 2013）、海洋声学（Jensen et al. 2011）、地球物理成像（Virieux and Operto 2009）以及许多其他感知与建模问题中尤为重要。我们聚焦**时谐**波场，它描述在固定频率激励下的稳态响应。在这些应用中，高保真仿真或稠密感知可能代价高昂，尤其当需要在多个频率上采集响应时；因此可用的训练场与传感器测量往往严重受限。从散落传感器恢复完整波响应因而既具有实际重要性，又是一个深刻欠定的问题。

现有稀疏场重建方法大体包括低秩拟合、深度稀疏到稠密回归、神经算子与基于扩散的生成式重建。低秩方法利用紧凑的空间结构（Dolgov, Kressner, and Strössner 2021; Luo et al. 2024）；神经网络与算子学习直接的场映射（Fukami et al. 2021; Li et al. 2021; Tran et al. 2023; Lu et al. 2021; Li et al. 2024, 2023; Kovachki et al. 2023）；扩散先验可通过后验采样与部分观测结合（Chung et al. 2023; Huang et al. 2024）。这些范式已展现强结果，但多数面向实值、相对平滑的空间或时空场。频率敏感、高度振荡的复值波场的稀疏重建仍基本未被充分探索。

然而，振荡波场与多数现有方法所针对的较平滑数据差异显著。在时谐设定下，Helmholtz 方程、频域 Maxwell 方程与弹性动力学方程定义了每个频率下的复空间响应；其实部与虚部共同编码幅度与相位，而源、材料与边界产生非局部干涉。短波长与对频率或介质参数的敏感性产生快速空间变化，并可能在域内移动节点与腹点，使局部传感器对未观测区域的信息很弱。因此重建不仅是局部插值：模型必须从稀疏证据推断全局相干的相位图样，而小的相位误差就可能改变整个域的干涉。这种结构与常见表示不匹配：固定低秩模型可能抑制依赖频率的模态；学习到的回归器与算子需要广泛训练覆盖才能区分相位敏感响应；像素空间扩散必须建模每个快速变化的复值，使引导昂贵且 3D 扩展困难；通用视觉潜表示仍是网格绑定的，并非为连续坐标空间查询或耦合复通道而设计。因此核心挑战在于构建一个同时与振荡场结构及其稀疏观测相契合的生成先验。

为应对这些挑战，我们提出 **HarmoCore**——一个用于稀疏复波场重建的函数潜扩散框架。我们把每个场的实部与虚部表示为共享连续空间基上紧凑函数 Tucker 核心的联合通道。基捕获连续坐标依赖，而核心保留紧凑的、样本与频率特定的系数。我们在这些核心上训练频率条件扩散模型，并直接在核心空间执行扩散后验采样。由于在传感器坐标处评估共享基，我们可使用散落观测而无需栅格化。我们利用解码器的多线性性把传感器测量写成核心上的线性算子，从而得到闭式观测似然梯度。对可选的控制方程引导，同一解码器提供固定的核心–场 Jacobian，可高效传播可能非线性残差的梯度。因此我们把后验校正保持在紧凑核心空间，而非稠密像素空间。在 2D Helmholtz、2D 合成波场与 3D Helmholtz 上的实验表明，1%–2% 感知下取得显著增益。

本文贡献概括如下：

- 我们提出一种基于函数 Tucker 模型的、频率感知的复振荡波场紧凑表示，采用联合实–虚通道与连续坐标解码。
- 我们在核心空间训练频率条件扩散先验，并利用多线性解码器获得闭式观测似然梯度与高效的控制方程残差引导。
- 我们在 2D Helmholtz、2D 合成波场与 3D Helmholtz 重建设定下证明，在极端稀疏条件下取得显著改善。

## 2 预备知识与问题设定

### 2.1 时谐波场的稀疏重建

时谐波场描述在角频率 $\omega$ 激励下稳态复空间响应。物理场 $\tilde u_s(\mathbf r,\omega)\in\mathbb C^K$ 同时编码幅度与相位；实部与虚部共同决定整个域内的干涉、节点位置与能量分布。我们用堆叠的实部与虚部通道表示该场，并把稀疏观测模型形式化为

$$
\begin{aligned}
\mathbf u_s(\mathbf r,\omega)&=\left[\Re(\tilde u_s),\ \Im(\tilde u_s)\right]\in\mathbb R^{C},\qquad C=2K,\\
\mathbf y_m&=\mathbf u_s(\mathbf r_m,\omega)+\boldsymbol\varepsilon_m,\qquad
\boldsymbol\varepsilon_m\sim\mathcal N\left(\mathbf 0,\sigma^2_{\rm obs}\mathbf I\right),
\end{aligned} \tag{1}
$$

其中 $s$ 索引场实例（源位置、材料参数、边界配置），$\mathbf r_m\in\Omega$ 为第 $m$ 个传感器坐标，$\mathbf y_m\in\mathbb R^C$ 为测量通道向量。对标量波场 $K=1$（$C=2$，一个实部与一个虚部通道）；本文报告的三项基准实验均取 $K=1$。稀疏观测集 $\{(\mathbf r_m,\mathbf y_m)\}_{m=1}^{M}$ 可能只覆盖评估网格的一小部分；例如在极端稀疏实验中，感知比低至 1%–2%。主要重建目标是评估网格上的完整连续场 $\mathbf u_s(\cdot,\omega)$，覆盖已观测与未观测区域，其中未观测区域是重建质量的主要指标。

这些场满足控制方程 $\mathcal L_{\xi_s,\omega}\tilde u_s=f_{\xi_s,\omega}$，其中 $\mathcal L$ 为微分算子（例如 Helmholtz 算子 $-\Delta-\omega^2/c(\mathbf r)^2$），$\xi_s$ 汇集实例特定的介质参数，$f_{\xi_s,\omega}$ 为源项。测试时可获得算子与源元数据（依数据集而定），用于第 3.3 节的可选方程引导。

### 2.2 函数 Tucker 表示

Tucker 分解用紧凑核心 $\mathcal G\in\mathbb R^{r_1\times\cdots\times r_d}$ 与因子矩阵 $\mathbf U_k\in\mathbb R^{n_k\times r_k}$（$r_k\ll n_k$）近似张量 $\mathcal X\in\mathbb R^{n_1\times\cdots\times n_d}$，把参数数从 $\prod n_k$ 降至 $\prod r_k+\sum n_kr_k$。函数 Tucker（Dolgov, Kressner, and Strössner 2021; Fang et al. 2024）把离散行查表 $\mathbf U_k[i]$ 替换为可连续坐标评估的基函数 $\boldsymbol\phi_k:\mathbb R\to\mathbb R^{r_k}$：

$$
u(\mathbf r;\mathcal G)=\mathcal G\times_1\boldsymbol\phi_1(r_1)\times_2\cdots\times_d\boldsymbol\phi_d(r_d), \tag{2}
$$

其中 $\times_k$ 表示 mode-$k$ 收缩。在任意固定坐标 $\mathbf r$ 处，映射 $\mathcal G\mapsto u(\mathbf r;\mathcal G)$ 是**多线性**的——对每个模态分别线性。由于 $\boldsymbol\phi_k$ 可在任意实值输入处评估，解码器支持在散落的离格传感器位置查询而无需栅格化。当一组基函数在一个场族内共享、只有核心 $\mathcal G$ 随样本变化时，模型把公共空间结构（由基捕获）与样本特定系数（由核心捕获）分离。

### 2.3 扩散先验与后验采样

扩散模型通过训练去噪器 $\boldsymbol\epsilon_\theta(\mathbf x_t,t)$ 逆转前向加噪过程 $q(\mathbf x_t|\mathbf x_0)=\mathcal N(\sqrt{\bar\alpha_t}\mathbf x_0,(1-\bar\alpha_t)\mathbf I)$，从而在未知变量 $\mathbf x_0$ 上建立生成先验 $p_\theta(\mathbf x_0)$。给定噪声状态 $\mathbf x_t$，去噪器产生干净估计 $\hat{\mathbf x}_{0,t}=(\mathbf x_t-\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon_\theta(\mathbf x_t,t))/\sqrt{\bar\alpha_t}$。对通过前向测量算子 $\mathbf A$ 与 $\mathbf x_0$ 相关联、具有部分观测 $\mathbf y$ 的逆问题，推断目标是后验 $p(\mathbf x_0|\mathbf y)\propto p_\theta(\mathbf x_0)p(\mathbf y|\mathbf x_0)$。扩散后验采样（DPS）（Chung et al. 2023）通过在干净估计上评估的测量一致性梯度校正每个无条件逆向步来近似从该后验采样：

$$
\mathbf x_{t-1}=\mathbf x'_{t-1}
-\zeta_t\nabla_{\mathbf x_t}\left\|\mathbf y-\mathbf A(\hat{\mathbf x}_{0,t})\right\|_2^2, \tag{3}
$$

其中 $\mathbf x'_{t-1}$ 是由 $\hat{\mathbf x}_{0,t}$ 与 $\boldsymbol\epsilon_\theta(\mathbf x_t,t)$ 得到的无条件逆向样本，$\zeta_t$ 为步长调度。该引导的效率与精度关键取决于测量算子 $\mathbf A$ 及其梯度在干净估计 $\hat{\mathbf x}_{0,t}$ 上能被多廉价地评估。

## 3 方法

HarmoCore 通过两个训练阶段与一个引导推断阶段重建稀疏复波场。**训练阶段 1：** 从稀疏训练观测联合学习共享连续空间基网络 $(\boldsymbol\phi_x,\boldsymbol\phi_y)$ 与逐场紧凑核心 $\mathcal G_{s,\omega}$，把场族压缩为结构化潜表示。**训练阶段 2：** 在归一化核心上训练频率条件扩散模型，捕获有效潜系数的分布。**推断：** 在测试用例的传感器坐标处评估冻结的连续基网络，得到预计算的观测算子 $\mathbf H_O$；在 $\mathbf H_O$ 与可选控制方程残差引导下进行核心空间后验采样以重建核心，再解码为连续波场。图 1 展示了整体流水线。

### 3.1 复波场的函数潜建模

HarmoCore 用**联合实–虚通道核心**实例化式 (2) 的函数 Tucker 表示。对每个（样本，频率）对 $(s,\omega)$，场由单个核心张量编码并解码为

$$
\mathcal G_{s,\omega}\in\mathbb R^{R_x\times R_y\times C},\qquad C=2K,
$$
$$
\mathbf u_s(\mathbf r;\mathcal G_{s,\omega})
=\mathcal G_{s,\omega}\times_1\boldsymbol\phi_x(r_x)\times_2\boldsymbol\phi_y(r_y), \tag{4}
$$

其中通道 $1,\dots,K$ 为 $K$ 个场分量的实部，通道 $K+1,\dots,2K$ 为虚部。对标量波场 $K=1$（$C=2$）。在 3D 中增加第三个基网络 $\boldsymbol\phi_z$，核心位于 $\mathbb R^{R_x\times R_y\times R_z\times C}$。单对正弦激活 MLP 网络 $(\boldsymbol\phi_x,\boldsymbol\phi_y)$（Sitzmann et al. 2020）在全部样本、全部频率与全部通道间**共享**；只有 $\mathcal G_{s,\omega}$ 是样本与频率特定的。因此每个（样本，频率）对产生一个 $C\times R_x\times R_y$ 核心（每个通道 $R=R_xR_y$ 个系数），对本文实验所用秩（第 5.1 节）而言，这远小于尺寸为 $C\times H\times W$ 的全分辨率场。

**基与核心的联合优化。** 我们通过 Adam 优化同时学习 $(\boldsymbol\phi_x,\boldsymbol\phi_y)$ 与全部核心。设 $\mathbf g_c={\rm vec}(\mathcal G[\cdot,\cdot,c])\in\mathbb R^{R}$ 为逐通道向量化核心，$\boldsymbol\Phi=[\boldsymbol\phi_x(x_i)\otimes\boldsymbol\phi_y(y_j)]_{ij}\in\mathbb R^{P\times R}$（$P=H\times W$）为全网格基矩阵。设 $O$ 索引下文训练目标所用的观测坐标；把 $\boldsymbol\Phi$ 限制到由 $O$ 索引的行得到观测算子 $\mathbf H_O=\boldsymbol\Phi[O]\in\mathbb R^{M\times R}$，于是 $\mathbf H_O\mathbf g_c$ 在这些位置处评估解码场，并与相应测量 $\mathbf y_c$ 比较。训练目标为

$$
\mathcal L_{\rm FTM}=\frac{1}{2}\sum_{c=1}^{C}
\mathbb E_{s,\omega}\left[\frac{\left\|\mathbf H_O\mathbf g_c-\mathbf y_c\right\|}{\left\|\mathbf y_c\right\|}\right]
+\lambda S(\mathcal G), \tag{5}
$$

其中 $O$ 索引观测位置，$S(\mathcal G)$ 是作用于核心矩阵的频率加权空间平滑正则项。训练后，每个核心按通道用全部（样本，频率）对上计算的全局均值与标准差归一化，从而为扩散模型提供零均值、单位方差的输入。

### 3.2 频率条件的核心扩散

归一化核心用于训练频率条件扩散模型。条件 UNet $\boldsymbol\epsilon_\theta$ 接收含噪核心图像 $\mathbf g_t\in\mathbb R^{C\times R_x\times R_y}$、扩散时间步 $t$，以及经每个 ResBlock 的 FiLM 条件注入的归一化频率 $\omega_{\rm norm}=(\omega-\omega_{\min})/(\omega_{\max}-\omega_{\min})\in[0,1]$。模型以标准噪声预测目标（Ho, Jain, and Abbeel 2020）训练：

$$
\mathcal L_{\rm diff}=\mathbb E_{\mathbf g_0,\boldsymbol\epsilon,t}
\left[\left\|\boldsymbol\epsilon-\boldsymbol\epsilon_\theta(\mathbf g_t,t,\omega)\right\|_2^2\right],\qquad
\mathbf g_t=\sqrt{\bar\alpha_t}\mathbf g_0+\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon, \tag{6}
$$

采用方差保持的线性调度（$T=500$ 步，$\beta_1=10^{-4}$，$\beta_T=2\times10^{-2}$）。由此得到归一化联合通道核心上的条件先验 $p_\theta(\mathbf g_0|\omega)$。

> **原文疑点：** 第 3.1 节把每个核心按通道用全局均值与标准差归一化为零均值、单位方差输入，扩散模型与核心空间采样（第 3.2、3.3 节）都在该归一化空间进行；但推断流程（第 3 节总览、第 3.3 节与附录 A.4）未说明采样结束后如何对核心**反归一化**，再经线性解码器 $\boldsymbol\Phi$（在原始尺度数据上拟合）解码为连续波场。本译按原文照录并加注，未自行补充步骤。

### 3.3 核心空间后验重建

**显式观测算子。** 测试时，冻结的基网络在全评估网格上评估一次以构造 $\boldsymbol\Phi\in\mathbb R^{P\times R}$，并按测试用例传感器坐标 $O$ 重新实例化观测算子 $\mathbf H_O=\boldsymbol\Phi[O]$。所得观测损失及其核心空间梯度为

$$
\mathcal L_{\rm obs}(\mathbf g_c)=\left\|\mathbf H_O\mathbf g_c-\mathbf y_c\right\|^2,\qquad
\nabla_{\mathbf g_c}\mathcal L_{\rm obs}
=\mathbf H_O^\top\left(\mathbf H_O\mathbf g_c-\mathbf y_c\right). \tag{7}
$$

$\mathbf H_O$ 与梯度都只需 $\mathbb R^R$ 中的矩阵–向量积，且 $\mathbf H_O$ 在所有逆向步间复用。同一空间掩码作用于所有通道（实部与虚部），因此单个 $\mathbf H_O$ 同时服务两者。

**核心空间采样更新。** 我们运行 DDPM 式逆向过程，并在每步把引导直接施加于干净估计：

$$
\begin{aligned}
\hat{\mathbf g}_{0,t}&=\frac{\mathbf g_t-\sqrt{1-\bar\alpha_t}\,\hat{\boldsymbol\epsilon}_\theta}{\sqrt{\bar\alpha_t}},\qquad
\hat{\boldsymbol\epsilon}_\theta=\boldsymbol\epsilon_\theta(\mathbf g_t,t,\omega),\\
\hat{\mathbf g}_{0,t}&\leftarrow\hat{\mathbf g}_{0,t}
-\alpha_t\left(\lambda_{\rm obs}\nabla_{\hat{\mathbf g}_{0,t}}\mathcal L_{\rm obs}
+\lambda_{\rm eq}\nabla_{\hat{\mathbf g}_{0,t}}\mathcal L_{\rm eq}\right),\\
\mathbf g_{t-1}&=\sqrt{\bar\alpha_{t-1}}\,\hat{\mathbf g}_{0,t}
+\sqrt{1-\bar\alpha_{t-1}}\,\hat{\boldsymbol\epsilon}_\theta,
\end{aligned} \tag{8}
$$

其中 $\alpha_t$ 为步特定引导权重，噪声估计 $\hat{\boldsymbol\epsilon}_\theta$ 在引导校正后不重新计算。

**可选的控制方程引导。** 对 Helmholtz 基准，测试时可从数据集元数据获得离散算子 $\mathbf A_\omega$（稀疏有限差分矩阵）与源场 $\mathbf f$。逐通道的全网格解码场为 $\hat{\mathbf u}_c=\boldsymbol\Phi\mathbf g_c$；方程残差（Raissi, Perdikaris, and Karniadakis 2019）通过自动微分在解码稠密网格上评估。由于 FTM 训练后 $\boldsymbol\Phi$ 冻结，解码器 Jacobian 在所有逆向步中恒定，可在每次引导评估中复用而无需重新经基网络评估。对线性 Helmholtz 残差 $\mathbf A_\omega\hat{\mathbf u}+\mathbf f$，核心空间梯度为 $\nabla_{\mathbf g_c}\mathcal L_{\rm eq}=2\boldsymbol\Phi^\top\mathbf A_\omega^\top(\mathbf A_\omega\boldsymbol\Phi\mathbf g_c+\mathbf f_c)$；实际中我们通过对解码输出的自动微分计算它。方程项是可选且辅助性的：第 5.3 节消融证实，移除观测引导的后验采样所造成的精度崩塌远大于仅移除方程项。

**图 1：** HarmoCore 流水线概览（以 2D 场为例）。训练（左与中）：稀疏训练观测经共享连续基网络压缩为逐场联合实–虚通道核心；归一化核心用于训练频率条件扩散先验。推断（右）：在传感器坐标处评估基得到预计算观测算子 $\mathbf H_O$；在 $\mathbf H_O$ 与可选方程残差引导下的核心空间后验采样产生重建的复波场。

## 4 相关工作

从稀疏传感器重建稠密场已被从两条路径研究：一是传感器到稠密网络，它先把不规则观测汇集到代理规则输入再预测（Fukami et al. 2021）；二是神经算子，它学习可跨 PDE 参数泛化的直接场映射（Li et al. 2021; Tran et al. 2023; Lu et al. 2021; Li et al. 2024, 2023; Kovachki et al. 2023）。二者在训练覆盖能捕获相关响应模式时表现良好，但在极端稀疏（1%–2% 感知）下，时谐波场的振荡结构与频率敏感性使单一确定性估计高度依赖训练实例是否覆盖特定频率与边界配置。一个捕获有效场配置分布的生成模型，可在局部传感器无法单独解析全局波图样时提供缺失的结构约束。

扩散模型（Ho, Jain, and Abbeel 2020）提供此类先验，并可通过后验采样与部分观测结合（Song et al. 2021; Chung et al. 2023; Kawar et al. 2022; Song et al. 2022, 2023）。在高效可控采样技术（Song, Meng, and Ermon 2021; Ho and Salimans 2022）基础上，扩散后验采样（Chung et al. 2023）在逆向过程中把学习到的去噪器引向测量一致状态，相关工作把它直接用于像素空间的 PDE 控制场补全（Huang et al. 2024）。对快速变化、通道耦合的复场而言，建模并引导稠密空间场的每个值代价高昂，且随分辨率或维度增加更昂贵——这促使人们采用与实/虚通道耦合相契合的紧凑连续表示，其思路接近潜空间扩散（Rombach et al. 2022）。

Tucker 与张量列方法为结构化场提供紧凑多模分解（Kolda and Bader 2009; Oseledets 2011; Dolgov, Kressner, and Strössner 2021），而函数 Tucker 模型（Fang et al. 2024）用连续坐标基函数（Tancik et al. 2020; Mildenhall et al. 2020）替代离散因子矩阵，把共享空间变化（基）与样本特定系数（核心）分离。与本文最接近的是（Chen, Sun et al. 2025），它把学习到的函数 Tucker 核心与扩散先验结合用于时空场重建。HarmoCore 则面向极端稀疏散落感知下的时谐复波场：以频率为条件训练扩散先验，采用联合实–虚通道核心，并利用固定传感器坐标处的多线性解码器构造显式观测算子以高效进行核心空间后验采样——把引导保持在紧凑、结构化的潜表示而非稠密像素空间。

## 5 实验

### 5.1 实验设置

我们在三个基准上评估，每个基准隔离一个不同的实验问题。**2D Helmholtz** 是主基准，驱动跨传感器密度的主要稀疏性比较。**2D 合成波场**检验同一核心空间表述能否迁移到物理上不同的波场族——它由闭式射线模型而非 PDE 求解生成：每个场是逐源射线项的直接加反射叠加，

$$
\tilde u_s(\mathbf r,\omega)=\sum_{k=1}^{K_s}w_{s,k}\left[
a_1(\mathbf r,\mathbf r_{s,k})e^{i2\pi f\tau_1(\mathbf r,\mathbf r_{s,k})}
+\beta a_2(\mathbf r,\mathbf r'_{s,k})e^{i2\pi f\tau_2(\mathbf r,\mathbf r'_{s,k})}
\right], \tag{9}
$$

其中 $\omega=2\pi f$，$a_1,a_2$ 为随距离衰减的幅度，$\tau_1,\tau_2$ 为直接/反射传播时间，$\mathbf r'_{s,k}$ 为每个源的镜像反射体（完整参数化见附录 A.1）；由于没有控制方程，该基准不获得物理残差指标与方程引导（第 3.3 节）。**3D Helmholtz** 在高维域上复用同一控制方程，以检验框架能否通过自然增加第三个共享基网络 $\boldsymbol\phi_z$ 扩展到 3D。给定基准上所有方法在同一留出测试集上评估。

在每个感知比 $r\in\{1\%,2\%,5\%,10\%\}$ 下，观测掩码是网格点上的 i.i.d. Bernoulli($r$) 掩码——每个网格位置以概率 $r$ 独立保留为观测传感器——每个比率生成一次，并被给定测试用例上的所有方法共享。我们报告 1%、2% 与 5%，即本方法聚焦的极端到中等稀疏范围。

我们与三类基线比较：连续低秩张量函数表示 LRTFR（Luo et al. 2024）；在稠密观测上训练的确定性算子回归网络 FNO（Li et al. 2021）、F-FNO（Tran et al. 2023）与 VoronoiCNN（Fukami et al. 2021）；以及基于生成扩散的基线 DiffusionPDE（Huang et al. 2024）。

主指标为相对重建误差（相对 $\ell_2$ 范数，测试集上均值±标准差），全文称为**相对 L2 误差**（表中记为 Rel. L2）；它在包含传感器位置的**完整**评估网格上计算，主要比较聚焦于逆问题最欠定的 1%–2% 感知。对两个 Helmholtz 基准，我们额外报告离散 Helmholtz 算子下的物理残差指标；2D 合成基准没有控制 PDE，因此该列对所有方法标为“—”。所有指标均为越低越好。除非另有说明，函数 Tucker 核心取秩 $R_x=R_y=24$（3D 中 $R_x=R_y=R_z=24$），每个（样本，频率）对每个通道有 $R=576$（2D）或 $R=13{,}824$（3D）个系数（第 3.1 节）。实验设置细节见附录 A。

### 5.2 各基准主结果

表 1 报告三个基准上的重建 Rel. L2 误差与物理残差。HarmoCore 在每个基准、全部三个感知比（1%、2%、5%）下均取得最低 Rel. L2 误差与最佳物理一致性，其中相对最佳基线的最大差距出现在 1%–2% 感知，此时逆问题约束最弱。图 2 与图 4 给出代表性定性示例，完整定性示例见附录 B.4。

**表 1：** 三个基准上的重建相对 L2 误差与物理残差（均值±标准差）。物理残差是 2D/3D Helmholtz 下 Helmholtz 算子的 PDE 残差；2D 合成基准没有控制 PDE（场由闭式射线模型生成），故该列对所有方法为“—”。

| 方法 | 1% Rel. L2 | 1% Phys. Res. | 2% Rel. L2 | 2% Phys. Res. | 5% Rel. L2 | 5% Phys. Res. |
|---|---|---|---|---|---|---|
| **2D Helmholtz** | | | | | | |
| **Ours** | **0.130±0.069** | **0.032±0.001** | **0.068±0.039** | **0.032±0.001** | **0.037±0.023** | **0.032±0.001** |
| LRTFR | 0.726±0.104 | 0.181±0.164 | 0.505±0.142 | 0.172±0.168 | 0.251±0.120 | 0.138±0.119 |
| FNO | 0.822±0.099 | 1.518±0.906 | 0.609±0.060 | 1.494±0.916 | 0.239±0.031 | 0.930±0.599 |
| F-FNO | 1.413±0.403 | 1.338±0.556 | 1.413±0.407 | 1.841±0.760 | 1.412±0.418 | 2.869±1.192 |
| VoronoiCNN | 0.638±0.298 | 0.201±0.048 | 0.446±0.227 | 0.186±0.038 | 0.222±0.123 | 0.153±0.024 |
| DiffusionPDE | 0.653±0.203 | 1.114±0.326 | 0.438±0.197 | 1.013±0.279 | 0.179±0.118 | 0.745±0.211 |
| **2D 合成波场** | | | | | | |
| **Ours** | **0.259±0.106** | — | **0.102±0.049** | — | **0.035±0.013** | — |
| LRTFR | 0.503±0.038 | — | 0.224±0.017 | — | 0.170±0.070 | — |
| FNO | 1.101±0.034 | — | 1.091±0.033 | — | 1.058±0.032 | — |
| F-FNO | 1.075±0.049 | — | 1.070±0.050 | — | 1.056±0.051 | — |
| VoronoiCNN | 0.440±0.200 | — | 0.278±0.136 | — | 0.122±0.061 | — |
| DiffusionPDE | 0.434±0.169 | — | 0.194±0.120 | — | 0.038±0.021 | — |
| **3D Helmholtz** | | | | | | |
| **Ours** | **0.249±0.208** | **5.85±3.69** | **0.175±0.140** | **5.34±3.15** | **0.141±0.112** | **5.12±2.96** |
| LRTFR | 3.139±2.293 | 603±1604 | 2.494±5.407 | 816±3032 | 5.575±3.221 | 710±1333 |
| FNO | 1.217±0.125 | 127±51 | 1.212±0.125 | 245±105 | 1.197±0.123 | 576±252 |
| F-FNO | 1.144±0.095 | 117±42 | 1.144±0.098 | 226±83 | 1.146±0.106 | 523±196 |
| VoronoiCNN | 0.440±0.162 | 14.8±8.0 | 0.291±0.109 | 11.7±6.5 | 0.161±0.060 | 8.47±4.92 |
| DiffusionPDE | 0.753±0.192 | 84.9±37.0 | 0.511±0.154 | 81.7±42.3 | 0.251±0.069 | 67.6±37.2 |

图 3 进一步按频率分解 2% 感知下的结果：HarmoCore 的误差在测试频率范围内保持较低且相对平坦，而基线随 $\omega$ 不规则波动、未遵循稳定趋势，凸显 HarmoCore 在频率范围内的相对鲁棒性。

三个基准的一致规律是：HarmoCore 在真正欠定的区间最有价值——当传感器比极低时，仅靠稀疏观测无法约束全场，而学习到的核心空间先验化解了这种歧义，这也正是 HarmoCore 相对每个基线差距最大之处。

> **原文疑点：** 此处原文称“在每个基准、全部三个感知比下取得最低 Rel. L2 误差与最佳物理一致性”，但 2D 合成波场由闭式射线模型生成、没有控制方程（表 1 中 Phys. Res. 列对所有方法为“—”），因此“最佳物理一致性”仅对 2D/3D Helmholtz 两个基准成立，对 2D 合成基准无从比较。本译按原文照录并加注。

**图 2：** 2D Helmholtz 极端稀疏（1% 感知）下的定性比较。该感知密度下，HarmoCore 比竞争基线更忠实地恢复全局振荡结构。

**图 3：** 2D Helmholtz 在 2% 观测率下平均重建 Rel. L2 误差随频率 $\omega$ 的变化。HarmoCore（Ours）在频率范围内保持较低且相对平坦，而基线误差随 $\omega$ 不规则波动。

### 5.3 机制分析与消融

表 2 报告 2D Helmholtz 上的消融。完全移除 DPS 引导——只保留 PDE 残差项——在 1% 与 2% 下都造成大幅精度崩塌，证实学习先验与观测引导的后验采样是重建精度的主要来源。仅移除方程项产生较小但明显的退化，尤其在 1% 感知时，这支持如下解释：方程引导作为补充的物理正则项，而非主要重建机制。

“w/o DPS”变体在重建精度显著更差的同时取得比完整方法更低的 PDE 残差。这在预期之中：该变体直接朝方程一致性优化，却不受观测约束。极端稀疏下，仅靠低 PDE 残差不足以正确恢复场；物理一致性必须与重建误差联合解读。

**表 2：** 2D Helmholtz 上的消融（越低越好）。

| 方法 | 1% Rel. L2 | 1% Phys. Res. | 2% Rel. L2 | 2% Phys. Res. |
|---|---|---|---|---|
| Ours | **0.130** | 0.032 | **0.068** | 0.032 |
| w/o DPS | 0.960 | **0.027** | 0.921 | **0.028** |
| w/o PDE | 0.431 | 0.058 | 0.204 | 0.044 |

综合来看，这些消融表明主导成分是紧凑函数 Tucker 核心与观测引导 DPS 的组合：共享连续基降低了逆问题的维数，而扩散先验与 DPS 把实际观测注入后验重建；PDE 残差项主要作为支撑性约束改善物理一致性，而不是方法奏效的主要原因。

**图 4：** 1% 感知下的 3D Helmholtz 定性重建，比较真实场、HarmoCore 与最强基线。HarmoCore 在整个体积内恢复正确的干涉与相位结构，而基线或压平细节、或在远离观测传感器处发生相位漂移。

### 5.4 额外分析

**表示容量。** 图 5 在 2D Helmholtz、2% 感知下扫描函数 Tucker 秩 $R_x=R_y\in\{4,8,16,24,32,48,64\}$，对每个秩用相同架构与训练预算重训练扩散先验。重建误差对秩非单调：从 $R=4$（0.891±0.400）急剧下降到 $R=16$（0.509±0.319），在默认 $R=24$（0.068±0.039，与表 1 一致）达到最小，$R=32$ 时接近（0.075±0.052），$R=64$ 时再度上升（0.246±0.106）。由于更大核心的表达能力至少不弱于更小核心，这反映的是固定预算的扩散先验随核心增大而日益供给不足，而非内在容量上限——我们把 $R=24$ 理解为当前秩无关训练预算下的最佳工作点。

**图 5：** 2D Helmholtz、2% 感知下重建 Rel. L2 误差（均值±标准差）随函数 Tucker 秩 $R_x=R_y$ 的变化（每个秩 102 个测试用例），扩散先验架构与训练配置在各秩间保持不变。默认秩 $R=24$（虚线）在固定训练预算下取得最低误差。

**对分布偏移的鲁棒性。** 为检验对测试时底层生成分布偏移的鲁棒性，我们在 2D 合成基准的一个分布外（OOD）变体上、不做任何重训练地评估所有方法；该变体从显著更宽的范围内重抽逐样本波速（完整构造见附录 B.2）。表 3 报告该偏移下的 Rel. L2 误差：HarmoCore 的误差与其分布内取值基本持平，LRTFR 同样鲁棒，而其余基线明显退化，其中 DiffusionPDE 最甚。

**表 3：** 2D 合成 OOD 测试集（波速范围偏移、无重训练）上的重建 Rel. L2 误差。

| 方法 | 1% | 2% | 5% |
|---|---|---|---|
| **Ours** | **0.254** | **0.097** | **0.033** |
| LRTFR | 0.496 | 0.206 | 0.174 |
| FNO | 1.119 | 1.110 | 1.083 |
| F-FNO | 1.087 | 1.083 | 1.069 |
| VoronoiCNN | 0.455 | 0.307 | 0.154 |
| DiffusionPDE | 0.542 | 0.326 | 0.140 |

> **原文疑点：** 原文称偏移下“其余基线明显退化（degrade substantially），其中 DiffusionPDE 最甚”。但据表 3 与表 1 对比，FNO 仅由 1.101 变为 1.119、F-FNO 由 1.075 变为 1.087、VoronoiCNN 由 0.440 变为 0.455（1% 感知），退化幅度很小；显著退化主要出现在 DiffusionPDE（如 5% 下 0.038→0.140）。本译按原文照录并加注，便于读者按数据解读。

## 6 结论

我们提出了 HarmoCore——一个用于稀疏波场重建的潜生成框架，它把复场表示为共享连续空间基上的紧凑函数 Tucker 核心，并直接在该核心空间而非稠密像素空间执行扩散后验采样。在 2D Helmholtz、2D 合成波场与 3D Helmholtz 上，该表述在最欠定的区间最为有效——此时确定性重建与无先验低秩拟合失效——同时相较稠密算子与像素空间生成基线保持更好的物理一致性。该方法依赖全局学习到的空间参数化，并依赖先获得足够有表达力的 FTM 表示；本文对稀疏重建提供的证据强于对频率外推或不确定性校准的证据；沿这些方向扩展核心空间先验留待未来工作。

## 附录 A　实现细节

本附录汇集因篇幅原因从正文省略的实现细节。

### A.1 数据集与预处理

三个基准（2D Helmholtz、2D 合成波场、3D Helmholtz；第 5.1 节）均使用标量复场（$K=1$，$C=2$：每个（样本，频率）对一个实部与一个虚部通道；式 (1)）。

表 1 中所有方法在各基准的同一留出测试集上评估：2D Helmholtz 为 153 个留出场，2D 合成（Synthetic）为 170 个留出用例（10 个样本 × 17 个频率），3D Helmholtz 为 410 个留出用例（10 个样本 × 41 个频率）。

主论文使用评估网格的 1%、2% 与 5% 传感器比；10% 比率见附录 B.1。

FTM 训练后，每个核心按通道用全部（样本，频率）对上的全局均值与标准差归一化（第 3.1 节），为扩散训练产生零均值、单位方差输入。

**2D 与 3D Helmholtz 生成。** 两个 Helmholtz 基准都数值求解 PML 阻尼的 Helmholtz 方程

$$
\Delta\tilde u_s(\mathbf r,\omega)+(\omega/c)^2\tilde u_s(\mathbf r,\omega)
=-f_s(\mathbf r,\omega), \tag{10}
$$

取 $L=1$、$c=1$、$\mathbf r\in\Omega=[0,L]^d$、$d\in\{2,3\}$，在均匀 $128^2$ 网格（2D）或 $32^3$ 网格（3D）上用二阶有限差分离散。$\Delta$ 实现为复坐标拉伸 Laplacian $\sum_{k=1}^{d}\partial_{r_k}[s_k(r_k)\partial_{r_k}]$，在每个面上施加宽度 $\eta L$ 的二次型 PML 吸收层（2D 中 $\eta=0.12$，3D 中 $0.15$）：

$$
\sigma(r_k)=\sigma_{\max}\left(\frac{\eta L-\mathrm{dist}(r_k,\partial\Omega)}{\eta L}\right)^2, \tag{11}
$$

其中 $\sigma_{\max}=50$（2D）或 $40$（3D）；最外层网格行上施加 $\tilde u_s=0$（Dirichlet）。源项是 $K_s$ 个随机高斯点源之和，幅度为单位幅值、随机相位的复振幅：

$$
f_s(\mathbf r,\omega)=\sum_{k=1}^{K_s}e^{i\phi_{s,k}}
\exp\left(-\left\|\mathbf r-\mathbf r_{s,k}\right\|^2/2\sigma^2_{\rm src}\right), \tag{12}
$$

其中 $\phi_{s,k}\sim\mathcal U(0,2\pi)$，$K_s\in\{1,\dots,4\}$（2D，$\sigma_{\rm src}=0.025$）或 $K_s\in\{1,2,3\}$（3D）；源位置 $\mathbf r_{s,k}$ 在 $\Omega$ 内、避开 PML 层均匀抽取，并在样本的全部频率上保持固定（只有 $\omega$ 改变线性系统，因此 $(\mathbf r_{s,1:K_s},\phi_{s,1:K_s})$ 即 $\mathcal L_{\xi_s,\omega}$ 中逐样本的实例描述子 $\xi_s$，第 2.1 节）。频率在线性网格上采样：2D Helmholtz 用 $\omega\in[2,52]$，3D Helmholtz 用 $\omega\in[2,22]$。每个复数解被拆分为实/虚通道，整个数据集在 FTM 拟合前除以单一全局尺度（全部样本、频率与网格点上的最大绝对值）。

**2D 合成波场生成。** 合成基准在 $\Omega=[0,1]^2$ 上相同的 $128\times128$ 网格上，用闭式直接加反射射线叠加替代 PDE 求解。每个样本抽取固定波速 $v_s\sim\mathcal U(0.8,1.2)$ 与 $K_s\in\{1,2,3\}$ 个源位置 $\mathbf r_{s,k}$（在 $\Omega$ 内均匀），并在该样本的频率扫描上保持固定；每个源在边界 $r_2=0$ 处有镜像反射体 $\mathbf r'_{s,k}$ 与随机权重 $w_{s,k}\sim\mathcal U(0.8,1.2)$。频率 $\omega=2\pi f$ 处的场由式 (9)（第 5.1 节）给出，其中 $\beta=0.18$ 缩放反射项；直接/反射传播时间为 $\tau_1=(r_1/v_s)(1+\varepsilon\Phi_1(\mathbf r))$ 与 $\tau_2=((r_2+\delta)/v_s)(1+\varepsilon\Phi_2(\mathbf r))$，$r_1,r_2$ 为 $\mathbf r$ 到源及其反射体的距离，$\delta=0.35$ 为固定延迟偏置，$\varepsilon=0.08$ 为相位扰动强度，$\Phi_1,\Phi_2$ 为固定的平滑正弦场（域尺度上 $r_1,r_2$ 的 $\sin,\cos$），由样本中每个源共享；幅度衰减为 $a_1=e^{-\alpha_1r_1}/(r_1+r_0)^p$ 与 $a_2=e^{-\alpha_2r_2}/\sqrt{r_2}$，其中 $\alpha_1=0$、$\alpha_2=0.12$、$r_0=0.4$、$p=0.3$。在无扰动极限（$\varepsilon\to0$）下，直接波相位满足程函关系 $\|\nabla\theta\|=2\pi f/v_s$；由于场由该闭式求和而非控制方程求解产生，该基准没有可用的 PDE 残差（第 3.3 节）。评估频率网格为 $[1,5]$ Hz 内 17 个线性间隔点；数据按最大绝对值全局重缩放，与 Helmholtz 基准相同。

### A.2 函数 Tucker 表示

共享空间基 $(\boldsymbol\phi_x,\boldsymbol\phi_y)$（3D 中还有 $\boldsymbol\phi_z$）为正弦激活 SIREN MLP（Sitzmann et al. 2020），一对（3D 中三个）在全部样本、频率与通道间共享（第 3.1 节）。默认秩为 $R_x=R_y=24$，每个（样本，频率）对每通道有 $R=R_xR_y=576$ 个系数，而全分辨率场尺寸为 $C\times H\times W$（式 (4)）。基与全部逐（样本，频率）核心用 Adam 联合优化，目标为式 (5)：观测位置上的相对重建损失加频率加权空间平滑正则项 $S(\mathcal G)$（由归一化频率加权的空间梯度惩罚）。基网络与核心学习率均为 $10^{-4}$，批大小 64 个样本、共 25,000 次训练迭代；式 (5) 中平滑正则权重为 $\lambda=10^{5}$。每个 SIREN 基网络有 4 个宽度 512 的隐藏层。

### A.3 潜扩散模型

扩散先验是作用于归一化联合通道核心图像 $\mathbf g_t\in\mathbb R^{C\times R_x\times R_y}$ 的条件 UNet $\boldsymbol\epsilon_\theta$（第 3.2 节）。频率条件使用归一化标量 $\omega_{\rm norm}\in[0,1]$，经每个 ResBlock 的 FiLM 注入。训练使用式 (6) 的噪声预测目标，采用方差保持线性调度，$T=500$ 步，$\beta_1=10^{-4}$，$\beta_T=2\times10^{-2}$。优化用 AdamW，学习率 $10^{-4}$、权重衰减 $10^{-6}$、批大小 32，训练 500 轮；不使用模型权重的 EMA。开发过程中我们还尝试了更丰富的频率编码（Fourier 特征），它们相对标量 FiLM 默认设置未带来一致增益，被作为负面结果处理（附录 B.3）。

### A.4 后验采样与引导

推断时，冻结的基在测试用例传感器坐标处评估一次以构造观测算子 $\mathbf H_O$（式 (7)），并在所有逆向步间复用。引导在每步直接施加于干净估计 $\hat{\mathbf g}_{0,t}$（式 (8)），结合观测似然梯度（权重 $\lambda_{\rm obs}$）与可选的方程残差梯度（权重 $\lambda_{\rm eq}$）；步特定尺度 $\alpha_t$ 乘在组合校正上。所有实验中观测被视为无噪（$\sigma_{\rm obs}=0$），故 $\lambda_{\rm obs}$ 吸收似然缩放。对 Helmholtz 基准，方程项使用第 3.3 节给出的闭式残差梯度；2D 合成基准没有控制 PDE，因此不施加方程引导项（$\lambda_{\rm eq}=0$），该基准的重建只用观测项。

### A.5 评估指标

对预测场 $\hat{\mathbf u}$ 与真值 $\mathbf u$（通道堆叠的实/虚部，尺寸 $C\times H\times W[\times D]$），主表报告的重建误差为完整评估网格上的相对 $\ell_2$ 误差，全文称为**相对 L2 误差**（Rel. L2）：

$$
{\rm Rel.L2}=\frac{\left\|\hat{\mathbf u}-\mathbf u\right\|_2}{\left\|\mathbf u\right\|_2}, \tag{13}
$$

在所有通道与网格点（包括传感器位置）上联合计算，再对测试集聚合为均值±标准差；该全字段定义在 HarmoCore 与每个基线上一致使用。

对两个 Helmholtz 基准，物理残差指标在内部网格点 $\mathcal I$（去掉最外层边界行/列后的域）上，用预测场与已知源 $\mathbf f$ 评估离散控制算子 $\mathbf A_\omega$（式 (10)）：

$$
{\rm PhysRes}=\sqrt{
\frac{{\rm mean}_{\mathcal I}\left(\left|\mathbf A_\omega\hat{\mathbf u}+\mathbf f\right|^2\right)}
{{\rm mean}_{\mathcal I}\left(\left|\mathbf f\right|^2\right)}
}. \tag{14}
$$

### A.6 基线设置

所有学习基线都在各基准稠密训练集相同的 80%/20% 训练/验证划分上训练（附录 A.1），并在与 HarmoCore 相同的留出测试集上评估。

**FNO**（Li et al. 2021）：4 个 Fourier 层，宽度 64，每空间维 12 个 Fourier 模态，训练 200 轮（Adam，学习率 $10^{-3}$，批大小 64）。

**F-FNO**（Tran et al. 2023）：4 个因子化 Fourier 层，宽度 64，每空间维 12 个模态，训练 200 轮（Adam，学习率 $10^{-3}$，批大小 64）。

**VoronoiCNN**（Fukami et al. 2021）：卷积编码–解码器，基础宽度 64，训练 200 轮（Adam，学习率 $10^{-3}$，批大小 32）。

**DiffusionPDE**（Huang et al. 2024）：条件 UNet（基础宽度 64，条件维数 256），采用与 HarmoCore 扩散先验相同的 $T=500$ 步方差保持调度训练 200 轮（Adam，学习率 $10^{-4}$，批大小 32）；推断使用 DPS 式引导，权重 $\zeta=0.3$。

**LRTFR**（Luo et al. 2024）：测试时，逐用例核心系数通过对观测位置与固定空间基的线性最小二乘拟合恢复，再解码到全网格。

## 附录 B　附加结果与消融

本附录汇集补充主论文的支撑性定量与定性结果。

### B.1 完整定量表

表 4 把表 1 扩展到 10% 感知——该比率因篇幅从主论文表中略去（第 5.1 节）。2D 合成基准在任何感知比下都没有控制 PDE（第 3.3 节），故其 Phys. Res. 列对所有方法固定为“—”，与表 1 一致。

**表 4：** 10% 感知下的重建相对 L2 误差与物理残差（均值±标准差），补充表 1。

| 方法 | Rel. L2 | Phys. Res. |
|---|---|---|
| **2D Helmholtz** | | |
| **Ours** | **0.012±0.003** | **0.032±0.001** |
| LRTFR | 0.177±0.104 | 0.116±0.108 |
| FNO | 0.062±0.035 | 0.161±0.035 |
| F-FNO | 1.408±0.437 | 4.012±1.680 |
| VoronoiCNN | 0.116±0.064 | 0.131±0.017 |
| DiffusionPDE | 0.101±0.066 | 0.594±0.170 |
| **2D 合成波场** | | |
| **Ours** | **0.025±0.010** | — |
| LRTFR | 0.009±0.003 | — |
| FNO | 1.010±0.033 | — |
| F-FNO | 1.031±0.053 | — |
| VoronoiCNN | 0.064±0.030 | — |
| DiffusionPDE | 0.031±0.012 | — |
| **3D Helmholtz** | | |
| **Ours** | **0.131±0.105** | **5.001±2.854** |
| LRTFR | 0.499±0.473 | 372±830 |
| FNO | 1.170±0.121 | 1080±480 |
| F-FNO | 1.147±0.118 | 968±364 |
| VoronoiCNN | 0.138±0.038 | 6.496±3.642 |
| DiffusionPDE | 0.161±0.033 | 60.56±33.80 |

### B.2 分布外鲁棒性（2D 合成）

为探查对测试时底层生成分布偏移的敏感性，我们构建第二个 2D 合成测试集：其逐样本波速 $v_s$ 从显著宽于全文其余处所用分布内设定的范围重抽（分布内为 $v_s\sim\mathcal U(0.8,1.2)$，其留出样本上经验值为 $v_s\in[0.84,1.19]$；附录 A.1）——分布外（OOD）测试集改为从偏移且更宽的范围抽取 $v_s$（其 10 个样本上经验值为 $v_s\in[0.44,1.76]$），而其余全部生成因素——源数、源/反射体位置与权重、反射系数 $\beta$ 以及评估频率网格——经同一随机种子保持不变。不重训练任何模型：每个方法都使用表 1 中评估的同一检查点，原样应用于该偏移测试集。结果报告于表 3，并在第 5.4 节讨论。

表 5 以完整形式（均值±标准差、全部四个感知比）报告同一比较，补充表 3 的简版（因篇幅省略标准差与 10% 感知）。每个做了专门 OOD 评估的基线在偏移下误差都增大，DiffusionPDE 最甚（例如 5% 感知下 0.038→0.140，增大 3 倍以上），VoronoiCNN、FNO 与 F-FNO 程度较轻——这与这些方法依赖基于分布内波速范围拟合的映射一致。Ours 在每个感知比下都持平或略低于其分布内取值（例如 5% 感知下 0.035→0.033）。

**表 5：** 2D 合成 OOD 测试集（波速范围偏移、无重训练）上的重建 Rel. L2 误差（均值±标准差），补充精简版表 3。

| 方法 | 1% | 2% | 5% | 10% |
|---|---|---|---|---|
| **Ours** | **0.254±0.107** | **0.097±0.052** | **0.033±0.014** | **0.025±0.011** |
| LRTFR | 0.496±0.034 | 0.206±0.024 | 0.174±0.096 | 0.112±0.037 |
| FNO | 1.119±0.040 | 1.110±0.039 | 1.083±0.037 | 1.043±0.035 |
| F-FNO | 1.087±0.062 | 1.083±0.062 | 1.069±0.064 | 1.045±0.067 |
| VoronoiCNN | 0.455±0.305 | 0.307±0.248 | 0.154±0.161 | 0.091±0.109 |
| DiffusionPDE | 0.542±0.262 | 0.326±0.290 | 0.140±0.262 | 0.093±0.215 |

### B.3 扩散先验的频率条件编码：一个负面结果

扩散先验通过在每个 ResBlock 经 FiLM 注入的归一化标量 $\omega_{\rm norm}\in[0,1]$ 条件化频率（附录 A.3）。开发过程中我们还尝试用更丰富的 Fourier 式编码替代该标量，

$$
\gamma(\omega_{\rm norm})=\left\{\sin(k\pi\omega_{\rm norm}),\cos(k\pi\omega_{\rm norm})\right\}_{k=0}^{K-1}, \tag{15}
$$

取 $K=8$ 个频带，拼接后经同一 FiLM 条件路径替代标量默认设置。

表 6 在 2D Helmholtz、10% 感知下把该 Fourier 编码与若干变体比较——把它与显式低阶多项式项增广、完全去掉 Fourier 特征只用多项式项、再加一个线性谱位置项、以及纯标量默认设置。没有任何更丰富的编码优于朴素标量条件化：纯标量变体误差最低（0.030），而每个更丰富变体都更差，且彼此无一致次序——在多项式编码之上再加线性谱项给出所测最差结果（0.052），仅 Fourier 编码略好（0.049），把 Fourier 特征与显式多项式项增广或只用多项式项都落在中间的 0.044。我们把它视为负面结果：对该基准而言，扩散先验条件化的更精细频率编码并未转化为重建精度提升，这与附录 A.3 的总结一致。

**表 6：** 2D Helmholtz、10% 感知下扩散先验不同频率条件编码的重建 Rel. L2 误差。

| 频率条件编码 | Rel. L2 |
|---|---|
| Fourier 编码（式 15） | 0.049 |
| Fourier + $\omega_{\rm norm}$ + $\omega_{\rm norm}^2$ | 0.044 |
| $\omega_{\rm norm}$ + $\omega_{\rm norm}^2$（无 Fourier） | 0.044 |
| $\omega_{\rm norm}$ + $\omega_{\rm norm}^2$ + 线性项（$k\pi\omega_{\rm norm}$） | 0.052 |
| 仅 $\omega_{\rm norm}$（论文默认） | **0.030** |

### B.4 附加定性比较

1% 感知下的 3D Helmholtz 定性重建见第 5.2 节图 4；下文图 6 与图 7 把两个 Helmholtz 基准扩展到更多测试用例。图 8 给出 2D 合成波场定性重建，补充第 5.2 节的定量结果；主论文本身没有该基准的定性图。

**图 6：** 跨多个测试用例的附加 2D Helmholtz 定性重建，每个用例的实部与虚部通道分行展示，补充图 2 的单用例比较。

**图 7：** 跨多个测试用例的附加 3D Helmholtz 定性重建，每个用例的实部与虚部通道分行展示，补充图 4。

**图 8：** 三个测试用例上的 2D 合成波场定性重建，每个用例的实部与虚部通道分行展示。

## 参考文献（英文原条目，按原文顺序）

[1] Arridge, S.; Maass, P.; Öktem, O.; and Schönlieb, C.-B. 2019. Solving Inverse Problems Using Data-Driven Models. *Acta Numerica*, 28: 1–174.

[2] Chen, P.; Sun, Y.; et al. 2025. Generating Full-field Evolution of Physical Dynamics from Irregular Sparse Observations. In *Advances in Neural Information Processing Systems (NeurIPS)*. arXiv:2505.09284.

[3] Chung, H.; Kim, J.; Mccann, M. T.; Klasky, M. L.; and Ye, J. C. 2023. Diffusion Posterior Sampling for General Noisy Inverse Problems. In *International Conference on Learning Representations*.

[4] Colton, D.; and Kress, R. 2013. *Inverse Acoustic and Electromagnetic Scattering Theory*. Springer, 3rd edition.

[5] Dolgov, S.; Kressner, D.; and Strössner, C. 2021. Functional Tucker Approximation Using Chebyshev Interpolation. *SIAM Journal on Scientific Computing*, 43(3): A2190–A2210. arXiv:2007.16126.

[6] Fang, S.; Yu, X.; Wang, Z.; Li, S.; Kirby, R. M.; and Zhe, S. 2024. Functional Bayesian Tucker Decomposition for Continuous-indexed Tensor Data. In *International Conference on Learning Representations (ICLR)*. arXiv:2311.04829.

[7] Fukami, K.; Maulik, R.; Ramachandra, N.; Fukagata, K.; and Taira, K. 2021. Global Field Reconstruction from Sparse Sensors with Voronoi Tessellation-Assisted Deep Learning. *Nature Machine Intelligence*, 3(11): 945–951. arXiv:2101.00554; code: github.com/kfukami/Voronoi-CNN.

[8] Ho, J.; Jain, A.; and Abbeel, P. 2020. Denoising Diffusion Probabilistic Models. In *Advances in Neural Information Processing Systems*.

[9] Ho, J.; and Salimans, T. 2022. Classifier-Free Diffusion Guidance. *arXiv preprint*. arXiv:2207.12598.

[10] Huang, J.; Yang, G.; Wang, Z.; and Park, J. J. 2024. DiffusionPDE: Generative PDE-Solving Under Partial Observation. In *Advances in Neural Information Processing Systems*. arXiv:2406.17763.

[11] Jensen, F. B.; Kuperman, W. A.; Porter, M. B.; and Schmidt, H. 2011. *Computational Ocean Acoustics*. Springer, 2nd edition.

[12] Kawar, B.; Elad, M.; Ermon, S.; and Song, J. 2022. Denoising Diffusion Restoration Models. In *Advances in Neural Information Processing Systems*. arXiv:2201.11793.

[13] Kolda, T. G.; and Bader, B. W. 2009. Tensor Decompositions and Applications. *SIAM Review*, 51(3): 455–500.

[14] Kovachki, N.; Li, Z.; Liu, B.; Azizzadenesheli, K.; Bhattacharya, K.; Stuart, A.; and Anandkumar, A. 2023. Neural Operator: Learning Maps Between Function Spaces. *Journal of Machine Learning Research*, 24. arXiv:2108.08481.

[15] Li, Z.; Huang, D. Z.; Liu, B.; and Anandkumar, A. 2023. Fourier Neural Operator with Learned Deformations for PDEs on General Geometries. *Journal of Machine Learning Research*, 24. arXiv:2207.05209.

[16] Li, Z.; Kovachki, N.; Azizzadenesheli, K.; Liu, B.; Bhattacharya, K.; Stuart, A.; and Anandkumar, A. 2021. Fourier Neural Operator for Parametric Partial Differential Equations. In *International Conference on Learning Representations*.

[17] Li, Z.; Zheng, H.; Kovachki, N.; Jin, D.; Chen, H.; Liu, B.; Azizzadenesheli, K.; and Anandkumar, A. 2024. Physics-Informed Neural Operator for Learning Partial Differential Equations. *ACM/JMS Journal of Data Science*. arXiv:2111.03794.

[18] Lu, L.; Jin, P.; Pang, G.; Zhang, Z.; and Karniadakis, G. E. 2021. Learning Nonlinear Operators via DeepONet Based on the Universal Approximation Theorem of Operators. *Nature Machine Intelligence*, 3(3): 218–229.

[19] Luo, Y.; Zhao, X.; Li, Z.; Ng, M. K.; and Meng, D. 2024. Low-Rank Tensor Function Representation for Multi-Dimensional Data Recovery. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 46(5): 3351–3369.

[20] Manohar, K.; Brunton, B. W.; Kutz, J. N.; and Brunton, S. L. 2018. Data-Driven Sparse Sensor Placement for Reconstruction: Demonstrating the Benefits of Exploiting Known Patterns. *IEEE Control Systems Magazine*. arXiv:1701.07569.

[21] Mildenhall, B.; Srinivasan, P. P.; Tancik, M.; Barron, J. T.; Ramamoorthi, R.; and Ng, R. 2020. NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis. In *European Conference on Computer Vision*.

[22] Oseledets, I. V. 2011. Tensor-Train Decomposition. *SIAM Journal on Scientific Computing*, 33(5): 2295–2317.

[23] Raissi, M.; Perdikaris, P.; and Karniadakis, G. E. 2019. Physics-Informed Neural Networks: A Deep Learning Framework for Solving Forward and Inverse Problems Involving Nonlinear Partial Differential Equations. *Journal of Computational Physics*, 378: 686–707.

[24] Rombach, R.; Blattmann, A.; Lorenz, D.; Esser, P.; and Ommer, B. 2022. High-Resolution Image Synthesis with Latent Diffusion Models. In *IEEE/CVF Conference on Computer Vision and Pattern Recognition*.

[25] Sitzmann, V.; Martel, J. N. P.; Bergman, A. W.; Lindell, D. B.; and Wetzstein, G. 2020. Implicit Neural Representations with Periodic Activation Functions. In *Advances in Neural Information Processing Systems*.

[26] Song, J.; Meng, C.; and Ermon, S. 2021. Denoising Diffusion Implicit Models. In *International Conference on Learning Representations*.

[27] Song, J.; Vahdat, A.; Mardani, M.; and Kautz, J. 2023. Pseudoinverse-Guided Diffusion Models for Inverse Problems. In *International Conference on Learning Representations*.

[28] Song, Y.; Shen, L.; Xing, L.; and Ermon, S. 2022. Solving Inverse Problems in Medical Imaging with Score-Based Generative Models. In *International Conference on Learning Representations*. arXiv:2111.08005.

[29] Song, Y.; Sohl-Dickstein, J.; Kingma, D. P.; Kumar, A.; Ermon, S.; and Poole, B. 2021. Score-Based Generative Modeling through Stochastic Differential Equations. In *International Conference on Learning Representations*.

[30] Tancik, M.; Srinivasan, P. P.; Mildenhall, B.; Fridovich-Keil, S.; Raghavan, N.; Singhal, U.; Ramamoorthi, R.; Barron, J. T.; and Ng, R. 2020. Fourier Features Let Networks Learn High Frequency Functions in Low Dimensional Domains. In *Advances in Neural Information Processing Systems*.

[31] Tran, A.; Mathews, A. G. d. G.; Xie, L.; and Ong, C. S. 2023. Factorized Fourier Neural Operators. In *International Conference on Learning Representations*.

[32] Virieux, J.; and Operto, S. 2009. An Overview of Full-Waveform Inversion in Exploration Geophysics. *Geophysics*, 74(6): WCC1–WCC26.

**原文插图：** 原 PDF 中的图 1–8 未重传至本页，仅保留中文图注与图中关键标注；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.00679v1（cs.LG，15 页）的全文中文译稿，覆盖摘要、正文第 1–6 节（含 2.1–2.3、3.1–3.3、5.1–5.4 等全部小节）、结论、全部图注（图 1–8）、表 1–6（逐格转录）、公式 (1)–(15)、附录 A（A.1–A.6）与附录 B（B.1–B.4）以及 32 条参考文献英文原条目；原文无作者简介。**逐句终校未做**：表 1（三基准 × 六方法 × 三感知比 × 两指标）、表 2（消融）、表 3/5（OOD）、表 4（10% 感知）、表 6（频率编码）均已用 PDF 页面渲染逐格核对；式 (1)–(8)、(13)–(14) 亦对照页面核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 3 条“原文疑点”加注：①第 3.1 节把核心按通道归一化为零均值/单位方差供扩散训练，但推断流程（第 3 节、第 3.3 节、附录 A.4）未说明采样后如何反归一化再解码；②第 5.2 节称“在每个基准、全部三个感知比下取得最佳物理一致性”，但 2D 合成基准无控制方程、Phys. Res. 列全为“—”；③第 5.4 节称分布偏移下“其余基线明显退化”，而表 3 显示 FNO/F-FNO/VoronoiCNN 仅小幅退化，显著退化主要出现在 DiffusionPDE。均按原文照录，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
