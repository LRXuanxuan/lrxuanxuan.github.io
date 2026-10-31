---
layout: page
title: "方向全变差正则隐式神经表示（DTV-INR）用于退化成像域中的连续超分辨｜中文全文译文"
permalink: /papers/translations/2026-10-08-2609-25429-directional-total-variation-regularized-implicit-neural-representation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/87aadaefe922670d/) · [原文 arXiv](https://arxiv.org/abs/2609.25429) · [全部目录](/papers/catalog/)

# 方向全变差正则隐式神经表示（DTV-INR）用于退化成像域中的连续超分辨

**原题：** Directional Total Variation-Regularized Implicit Neural Representations (DTV-INR) for Continuous Super-Resolution in Degraded Imaging Domains  
**作者：** Mahmoud Saeedi Kelishami（通讯作者：saeedi@iau.ac.ir；伊朗拉什特伊斯兰阿扎德大学拉什特分校生物社会与量子科学与技术研究所数学系）  
**版本：** arXiv:2609.25429v1（cs.CV），2026-09-21，原文 18 页（含 8 幅图）。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 1—5 节（含 1.1—1.4、2 节全部引理/定理及证明、3 节算法 1、4.1—4.6 实验与表 1—3、5.1—5.4 结论与展望）、图 1—8 图注、参考文献 [1]—[25] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 本地 PDF 的题名实为 “Directional Total Variation-Regularized Implicit Neural Representations (DTV-INR) for Continuous **Super-Resolution in Degraded Imaging Domains**”，而登记/骨架中的英文题名写作 “…for Continuous **Imaging Inverse Problems**”，二者不一致（疑为元数据版本差异）。本页 **原题** 按 PDF 原题照录，页面标题沿用骨架（中文“用于连续成像逆问题”，保留“｜中文全文译文”后缀）未改；请 Lead 在核验元数据时决定是否统一。

## 摘要

本文提出**方向全变差正则隐式神经表示（Directional Total Variation-Regularized Implicit Neural Representation，DTV-INR）**，这是一种先进的变分范式，把坐标驱动的隐式神经网络与各向异性、由结构张量引导的全变差正则项协同结合，服务于分辨率无关（resolution-agnostic）的图像超分辨率。本文把连续—离散采集过程表述为不适定逆问题框架，为采用 SIREN 架构的坐标网络配置一个动态黎曼度量张量场 $D(\mathbf x)$。借助该张量的谱分解，所提正则项优先引导扩散沿主导结构轮廓的切线方向进行，同时惩罚跨边缘的耗散，从而成功规避标量全变差方案固有的经典阶梯（staircasing）伪影。本文严格证明了该表述在 $H^1(\Omega)$ 中的适定性，即变分极小解的存在性、唯一性与度量稳定性，并借助交替投影优化算法加以实现——该算法将网络参数调整与自适应张量场更新解耦。在临床脑磁共振成像（MRI）与生物医学透射电子显微镜上的综合实验证实，本方法在定量与定性两方面均有大幅提升：在连续（非整数）上采样倍率下，PSNR 相对无正则 INR 基线最高提升 +5.05 dB，相对各向同性 TV-INR 提升 +1.71—2.85 dB；同时在噪声标准差达 $\sigma_\eta=0.10$ 时仍具备显著噪声鲁棒性，并呈现单调的预条件收敛行为。

**关键词**：隐式神经表示；方向全变差；结构张量；各向异性扩散；变分方法；超分辨率；逆问题；SIREN。

## 1 引言

从稀疏、含噪且欠采样的离散测量中恢复连续空间信号，是现代计算成像、逆问题与物理场重建中的一个基础性挑战 [1, 2]。在临床磁共振成像（MRI）、数字组织病理学与工业无损检测（NDT）等任务关键型模态中，物理采集硬件固有地施加了严格的带宽限制、几何点扩散函数（PSF）模糊与传感器噪声。因此，在任意连续放大倍率下恢复高保真的连续视觉结构，本质上是一个不适定逆问题，需要富有表现力的函数表示与在物理和数学上都合理的正则化相结合。

### 1.1 理论基础与坐标表示

传统单图像超分辨率（SISR）框架历史上依赖离散变分形式，尤其是全变差（TV）正则 [1, 3–5] 以及图像修复等变分/偏微分方程（PDE）类复原范式 [6]。经典 TV 通过惩罚图像梯度的 $L_1$ 范数在边缘保持方面表现优异，但其各向同性形式会引入有据可查的几何伪影，最突出的是平滑梯度区域中的阶梯效应，以及沿曲线边界细方向一致性的损失 [7, 8]。由局部结构张量或黎曼度量场引导的方向性与各向异性扩展，通过把扩散导向主导边缘方向，已展示出显著的分析改进 [9–11]。与此相关的局部自适应非均匀滤波方案（如核回归 [12]）同样利用了方向邻域结构，只不过是在离散模板框架内。

与此同时，隐式神经表示（INR）与坐标基神经网络的兴起革新了连续信号建模 [13–16]。与经典离散像素网格表示不同，INR 把连续信号 $u:\Omega\subset\mathbb R^d\to\mathbb R$ 参数化为依赖参数的映射 $u_\theta(\mathbf x)$，直接在连续空间坐标 $\mathbf x\in\Omega$ 上优化。采用周期正弦激活函数的网络（如正弦表示网络 SIREN [14]）在表示精细高频细节方面具有非凡能力，并支持通过解析反向传播精确、闭式地计算空间导数：

$$
\nabla_{\mathbf x}u_\theta(\mathbf x)=J_{\mathbf x}u_\theta(\mathbf x)=\sum_{k}\frac{\partial u_\theta}{\partial h_k}\frac{\partial h_k}{\partial\mathbf x}.\tag{1.1}
$$

这种可微分性使连续泛函能量项可以直接集成进坐标优化流程，而无需借助离散有限差分近似。

### 1.2 研究空白与动机

尽管具备连续表示能力，无约束坐标网络在严重模糊、不可逆抽取与测量噪声下的不适定连续—离散逆问题中仍然极易失效：

1. **谱偏置与高频噪声过拟合**：仅用经验数据保真项训练的標準 INR 倾向于过拟合高频测量噪声，在连续空间中产生虚假空间谐波与振荡性高频伪影（混叠）[17]。
2. **跨连续尺度的几何不一致**：数据驱动的连续上采样网络（如 LIIF [15]）在远超训练分辨率网格的尺度上外推时，往往无法保持细微的各向异性几何（例如微血管分叉或结构微裂纹）。
3. **缺乏变分适定性保证**：现有深度学习与基于 INR 的超分辨率框架通常缺乏严格的变分适定性、度量稳定性保证，以及连续坐标扰动下的解析界证明。

### 1.3 在退化成像模态中的应用

对连续、保几何复原的需求在任务关键型退化成像模态中尤为迫切：

- **生物医学 MRI 与组织病理学**：在薄层各向异性临床 MRI 与高通量全切片组织病理扫描中，诊断准确性取决于能否在不产生阶梯或人工模糊的情况下分辨亚像素形态边缘与连续细胞边界。
- **工业无损检测（NDT）**：在航空航天部件的超声、热成像与 X 射线计算机断层检测中，检出细如发丝的结构疲劳裂纹需要坐标学习与严格变分正则化在高测量退化下保持连续性。

### 1.4 关键贡献

为弥合连续坐标学习与严格变分正则化之间的差距，本文提出**方向全变差正则隐式神经表示（DTV-INR）**。主要贡献总结如下：

- **连续—离散变分框架**：把连续超分辨率表述为直接定义在连续空间域 $\Omega$ 上的解析变分问题，统一了显式连续前向退化算子与坐标基函数优化。
- **度量张量引导的方向 TV**：把自适应各向异性方向度量张量场 $D(\mathbf x)$ 纳入 INR 变分目标。它使空间梯度惩罚沿结构轮廓切向进行，完全抑制阶梯伪影，同时保持尖锐的高频方向界面。
- **严格的解析适定性与稳定性证明**：在 Sobolev 空间 $H^1(\Omega)$ 中建立连续极小解的存在性、唯一性（在严格泛函凸性下）以及对抗数据扰动与坐标平移的强度量稳定性，并给出完整数学证明。
- **联合解析端到端优化**：设计高效的连续坐标采样方案，通过网络自动微分计算精确解析泛函梯度，消除离散网格化误差。
- **大量实证验证**：在基准数据集与真实医学/NDT 模态上进行综合定量与定性评估，证明 DTV-INR 在 2×、4×、8× 超分辨率下均稳定优于最先进的连续 INR 基线（SIREN、LIIF、NAF）与经典变分方法。

本文其余部分组织如下：第 2 节建立连续变分表述，并给出存在性、唯一性与度量稳定性的解析证明；第 3 节详述 DTV-INR 架构、张量引导计算与优化算法；第 4 节给出大量实验基准、消融研究与定性分析；第 5 节总结全文并给出未来研究方向。

## 2 连续变分表述

连续—离散观测模型为

$$
\mathbf y=\mathcal A\mathbf u+\boldsymbol\eta,\qquad \mathcal A\mathbf u=S_s(k_\sigma\ast\mathbf u),\tag{2.1}
$$

其中 $\mathbf u:\Omega\subset\mathbb R^2\to\mathbb R$ 为连续图像场，$k_\sigma$ 为高斯点扩散函数，$S_s$ 为倍率 $s$ 下的子采样算子，$\boldsymbol\eta\sim\mathcal N(\mathbf 0,\sigma_\eta^2\mathbf I_M)$。

我们通过最小化下式重建 $\mathbf u$：

$$
\min_{\theta}\ J(\mathbf u_\theta)=\frac{1}{2}\|\mathcal A\mathbf u_\theta-\mathbf y\|_{L^2}^2+\frac{\mu}{2}\|\mathbf u_\theta\|_{L^2(\Omega)}^2+\lambda\,\mathrm{DTV}(\mathbf u_\theta;D),\tag{2.2}
$$

其中方向全变差定义为

$$
\mathrm{DTV}(\mathbf u;D)=\int_{\Omega}\sqrt{\nabla\mathbf u(\mathbf x)^\top D(\mathbf x)\nabla\mathbf u(\mathbf x)}\,d\mathbf x,\tag{2.3}
$$

度量张量场 $D(\mathbf x)\in\mathbb S_+^2$ 具有如下分解：

$$
D(\mathbf x)=\alpha_1(\mathbf x)\mathbf v_1(\mathbf x)\mathbf v_1(\mathbf x)^\top+\alpha_2(\mathbf x)\mathbf v_2(\mathbf x)\mathbf v_2(\mathbf x)^\top,\qquad \alpha_{\min}\le\alpha_2(\mathbf x)\le\alpha_1(\mathbf x),\tag{2.4}
$$

其中 $\mathbf v_1(\mathbf x)$ 与局部梯度对齐（抑制扩散），$\mathbf v_2(\mathbf x)$ 为正交切向（允许平滑）。特征值由高斯平滑后的结构张量导出，涉及积分尺度 $\rho$、敏感度阈值 $\tau_D$、过渡指数 $\gamma$，以及椭圆性下界 $\alpha_{\min}=10^{-3}$。

**引理 1（强制性）与凸性。** 在 $\alpha_2(\mathbf x)\ge\alpha_{\min}>0$ 且 $\mu>0$ 时，泛函 $J$（式（2.2））在 $H^1(\Omega)$ 上是凸的、强制的（coercive）且弱下半连续的。

**证明。** 为证明凸性，令 $\mathbf u,\mathbf v\in H$、$\theta\in[0,1]$。由于方向度量张量 $D(\mathbf x)$ 对称正定且具有一致的谱下界 $D(\mathbf x)\succeq\alpha_{\min}\mathbf I$，其平方根 $D^{1/2}(\mathbf x)$ 定义良好且正定。逐点项可写成变换后梯度的欧氏范数：

$$
\|\nabla\mathbf w(\mathbf x)\|_{D(\mathbf x)}=\sqrt{\nabla\mathbf w(\mathbf x)^\top D(\mathbf x)\nabla\mathbf w(\mathbf x)}=\|D^{1/2}(\mathbf x)\nabla\mathbf w(\mathbf x)\|_2.\tag{2.5}
$$

由欧氏范数的三角不等式与梯度算子 $\nabla$ 的线性性可得

$$
\|D^{1/2}(\mathbf x)\nabla(\theta\mathbf u+(1-\theta)\mathbf v)\|_2\le\theta\|D^{1/2}(\mathbf x)\nabla\mathbf u\|_2+(1-\theta)\|D^{1/2}(\mathbf x)\nabla\mathbf v\|_2.\tag{2.6}
$$

在 $\Omega$ 上积分即得 $\int\mathrm{DTV}(\mathbf u)$ 的凸性。保真泛函 $\|\mathcal A(\mathbf u)-\mathbf y\|_2^2$ 因下采样与模糊算子 $\mathcal A$ 的线性而凸；低阶项 $\frac{\mu}{2}\|\mathbf u\|_{L^2}^2$ 严格凸。因此 $E(\mathbf u)$ 严格凸。

关于强制性，由于 $\lambda_{\min}(D(\mathbf x))\ge\alpha_{\min}>0$，有

$$
\int\mathrm{DTV}(\mathbf u)\ge\sqrt{\alpha_{\min}}\int_{\Omega}\|\nabla\mathbf u(\mathbf x)\|_2\,d\mathbf x=\sqrt{\alpha_{\min}}\,\mathrm{TV}(\mathbf u).\tag{2.7}
$$

结合零均值条件（或低阶正则项 $\frac{\mu}{2}\|\mathbf u\|_{L^2}^2$）与 Poincaré–Wirtinger 不等式，可得 $\|\mathbf u\|_H\to\infty\Rightarrow E(\mathbf u)\to\infty$。故 $E(\mathbf u)$ 在 $H$ 上强制，并由标准泛函分析结果 [18] 弱下半连续。

**定理 1（存在性与唯一性）。** 由引理 1 与 $H^1(\Omega)$ 的自反性，问题（2.2）存在极小解 $\mathbf u_{\theta^\star}\in H^1(\Omega)$；在严格凸的 $L^2$ 阻尼下，该极小解唯一。

**证明。** 我们采用变分法中的直接法。由于对所有 $\mathbf u\in H$ 有 $E(\mathbf u)\ge0$，下确界 $m=\inf_{\mathbf u\in H}E(\mathbf u)$ 存在且有限。设 $\{\mathbf u_k\}_{k=1}^{\infty}\subset H$ 为使 $\lim_{k\to\infty}E(\mathbf u_k)=m$ 的极小化序列。由引理 1，目标泛函 $E$ 在 $H$ 上强制，因此序列 $\{\mathbf u_k\}$ 在 $H$ 中一致有界。

由于 $H$ 是自反 Banach 空间（在诱导的 $H^1$ 范数下也是 Hilbert 空间），由 Banach–Alaoglu 与 Eberlein–Šmulian 定理 [18]，存在子列 $\{\mathbf u_{k_j}\}$ 弱收敛于某极限 $\mathbf u^\ast\in H$，即 $\mathbf u_{k_j}\rightharpoonup\mathbf u^\ast$。因为 $E$ 在 $H$ 上连续且凸，故弱下半连续（Mazur 引理），从而

$$
E(\mathbf u^\ast)\le\liminf_{j\to\infty}E(\mathbf u_{k_j})=m.\tag{2.8}
$$

由于 $\mathbf u^\ast\in H$，可得 $E(\mathbf u^\ast)=m$，证得极小解存在。

关于唯一性，假设存在两个不同极小解 $\mathbf u_1^\ast,\mathbf u_2^\ast\in H$ 且 $\mathbf u_1^\ast\neq\mathbf u_2^\ast$。由引理 1，由于二次正则项 $\frac{\mu}{2}\|\mathbf u\|_{L^2}^2$，泛函 $E(\mathbf u)$ 严格凸。于是对任意 $\theta\in(0,1)$：

$$
E(\theta\mathbf u_1^\ast+(1-\theta)\mathbf u_2^\ast)<\theta E(\mathbf u_1^\ast)+(1-\theta)E(\mathbf u_2^\ast)=m,\tag{2.9}
$$

这与 $m$ 作为下确界的定义矛盾。因此极小解 $\mathbf u^\ast$ 必唯一。

**定理 2（度量稳定性）。** 对测量 $\mathbf y$ 与 $\mathbf y+\delta\mathbf y$，唯一极小解满足

$$
\|\mathbf u_{\theta^\star}-\mathbf u_{\theta^\star+\delta}\|_{H^1(\Omega)}\le C\mu^{-1/2}\|\delta\mathbf y\|_2,\tag{2.10}
$$

其中 $C$ 仅依赖于 $\lambda$、$\alpha_{\min}$ 与 $\|\mathcal A\|$；参数扰动受 $O(\mu^{-1/2}\|\delta\mathbf y\|)$ 界约束。

**证明。** 设 $\mathbf u_1,\mathbf u_2\in H^1(\Omega)$ 分别为测量扰动 $\mathbf f_1,\mathbf f_2\in L^2(\Omega_d)$ 对应的唯一连续极小解。由连续能量泛函 $E(\mathbf u;\mathbf f)$ 的一阶 Gateaux 最优性条件，对所有试验方向 $\mathbf v\in H^1(\Omega)$ 有

$$
\langle K^\ast(K\mathbf u_1-\mathbf f_1),\mathbf v\rangle_{L^2}+\lambda\int_{\Omega}\langle D(\mathbf x)\nabla\mathbf u_1(\mathbf x),\nabla\mathbf v(\mathbf x)\rangle\,d\mathbf x=0,\tag{2.11}
$$

以及

$$
\langle K^\ast(K\mathbf u_2-\mathbf f_2),\mathbf v\rangle_{L^2}+\lambda\int_{\Omega}\langle D(\mathbf x)\nabla\mathbf u_2(\mathbf x),\nabla\mathbf v(\mathbf x)\rangle\,d\mathbf x=0.\tag{2.12}
$$

用（2.11）减去（2.12），并取试验函数 $\mathbf v=\mathbf u_1-\mathbf u_2\in H^1(\Omega)$，得

$$
\|K(\mathbf u_1-\mathbf u_2)\|_{L^2(\Omega_d)}^2+\lambda\int_{\Omega}\langle D(\mathbf x)\nabla(\mathbf u_1-\mathbf u_2),\nabla(\mathbf u_1-\mathbf u_2)\rangle\,d\mathbf x=\langle\mathbf f_1-\mathbf f_2,K(\mathbf u_1-\mathbf u_2)\rangle_{L^2}.\tag{2.13}
$$

由张量场的一致椭圆性与正定性 $D(\mathbf x)\succeq\alpha_{\min}\mathbf I$（$\alpha_{\min}>0$）：

$$
\int_{\Omega}\langle D(\mathbf x)\nabla(\mathbf u_1-\mathbf u_2),\nabla(\mathbf u_1-\mathbf u_2)\rangle\,d\mathbf x\ge\alpha_{\min}\|\nabla(\mathbf u_1-\mathbf u_2)\|_{L^2(\Omega)}^2.\tag{2.14}
$$

对（2.13）右端应用 Cauchy–Schwarz 与 Young 不等式：

$$
\langle\mathbf f_1-\mathbf f_2,K(\mathbf u_1-\mathbf u_2)\rangle_{L^2}\le\|\mathbf f_1-\mathbf f_2\|_{L^2(\Omega_d)}\|K(\mathbf u_1-\mathbf u_2)\|_{L^2(\Omega_d)}\le\frac{1}{2}\|\mathbf f_1-\mathbf f_2\|_{L^2(\Omega_d)}^2+\frac{1}{2}\|K(\mathbf u_1-\mathbf u_2)\|_{L^2(\Omega_d)}^2.\tag{2.15}
$$

把该界代入（2.13）得

$$
\|\nabla(\mathbf u_1-\mathbf u_2)\|_{L^2(\Omega)}^2\le\frac{1}{2\lambda\alpha_{\min}}\|\mathbf f_1-\mathbf f_2\|_{L^2(\Omega_d)}^2.\tag{2.16}
$$

对有界区域 $\Omega$ 应用 Poincaré–Friedrichs 不等式（常数 $C_P>0$），有 $\|\mathbf u_1-\mathbf u_2\|_{L^2(\Omega)}\le C_P\|\nabla(\mathbf u_1-\mathbf u_2)\|_{L^2(\Omega)}$，故

$$
\|\mathbf u_1-\mathbf u_2\|_{H^1(\Omega)}^2\le(1+C_P^2)\|\nabla(\mathbf u_1-\mathbf u_2)\|_{L^2(\Omega)}^2\le\frac{1+C_P^2}{2\lambda\alpha_{\min}}\|\mathbf f_1-\mathbf f_2\|_{L^2(\Omega_d)}^2.\tag{2.17}
$$

令 $C_{\mathrm{stab}}=\sqrt{\frac{1+C_P^2}{2\lambda\alpha_{\min}}}<\infty$，两边开平方即完成证明。

## 3 算法

**算法 1**　DTV-INR：交替方向变分优化

**输入**：低分辨率观测 $\mathbf y\in\mathbb R^{M\times N}$、前向退化算子 $K$、正则超参数 $\lambda,\mu>0$、结构张量平滑尺度 $\rho>0$、相干性各向异性阈值 $\gamma>0$、特征值界 $0<\alpha_{\min}\le\alpha_{\max}$、交替外循环总数 $K$、网络内步数 $S$。
**输出**：尺度不变的连续坐标表示 $\mathbf u_\theta\in C^1(\Omega)$，可在任意放大倍率 $s\in\mathbb R_+$ 下求值。

1. **初始化**：初始化坐标 MLP 参数 $\theta^{(0)}$；构造初始各向同性扩散张量场 $D^{(0)}(\mathbf x)=\alpha_{\max}\mathbf I_2$，$\forall\mathbf x\in\Omega$。
2. **for** $k=0,1,\ldots,K-1$ **do**
3. 　▷ **阶段 I：变分网络表示步**
4. 　**for** $s=1,\ldots,S$ **do**
5. 　　采样随机空间小批量坐标 $X_b\subset\Omega$。
6. 　　计算网络连续重建与方向梯度：
7. 　　$\mathbf u_\theta(\mathbf x)\leftarrow\Phi_\theta(\mathbf x)$，$\nabla\mathbf u_\theta(\mathbf x)\leftarrow\nabla_{\mathbf x}\Phi_\theta(\mathbf x)$，$\forall\mathbf x\in X_b$。
8. 　　评估离散—连续复合变分泛函：
9. 　　$J(\theta;D^{(k)})=\frac{1}{2}\|K\mathbf u_\theta-\mathbf y\|_{L^2(\Omega)}^2+\frac{\mu}{2}\|\mathbf u_\theta\|_{H^1(\Omega)}^2+\lambda\int_{\Omega}\sqrt{\nabla\mathbf u_\theta^\top D^{(k)}(\mathbf x)\nabla\mathbf u_\theta+\beta^2}\,d\mathbf x$。
10. 　　用 AdamW 与余弦学习率退火更新网络参数：
11. 　　$\theta\leftarrow\theta-\eta_k\widehat{\nabla_\theta J(\theta;D^{(k)})}$。
12. 　**end for**
13. 　置更新后的场 $\mathbf u^{(k+1)}\leftarrow\mathbf u_\theta$。
14. 　▷ **阶段 II：方向结构张量估计步**
15. 　由更新后的表示计算正则化空间结构张量场：
16. 　$J_\rho(\nabla\mathbf u^{(k+1)})=G_\rho\ast\left(\nabla\mathbf u^{(k+1)}\otimes\nabla\mathbf u^{(k+1)}\right)$。
17. 　执行局部谱分解：
18. 　$J_\rho(\mathbf x)=\lambda_1(\mathbf x)\mathbf v_1(\mathbf x)\mathbf v_1(\mathbf x)^\top+\lambda_2(\mathbf x)\mathbf v_2(\mathbf x)\mathbf v_2(\mathbf x)^\top$，$\lambda_1(\mathbf x)\ge\lambda_2(\mathbf x)\ge0$。
19. 　合成边缘自适应各向异性扩散张量场 $D^{(k+1)}(\mathbf x)$：
20. 　$D^{(k+1)}(\mathbf x)=\alpha_1(\mathbf x)\mathbf v_1(\mathbf x)\mathbf v_1(\mathbf x)^\top+\alpha_2(\mathbf x)\mathbf v_2(\mathbf x)\mathbf v_2(\mathbf x)^\top$，
21. 　特征值约束为：
22. 　$\alpha_1(\mathbf x)=\alpha_{\min}+(\alpha_{\max}-\alpha_{\min})\exp\left(-\frac{(\lambda_1(\mathbf x)-\lambda_2(\mathbf x))^2}{\gamma^2}\right)$，$\alpha_2(\mathbf x)=\alpha_{\max}$。
23. 　检查收敛准则：若 $\|J^{(k+1)}-J^{(k)}\|/J^{(k)}<\epsilon_{\mathrm{tol}}$，则 **break**。
24. **end for**
25. **返回** 优化后的隐式坐标表示 $\mathbf u_{\theta^\ast}\approx\mathbf u^\ast$。

## 4 实验评估与讨论

为佐证第 2 节建立的理论基础并验证第 3 节算法框架的计算效力，本节给出综合实验研究。我们在多种退化机制、非整数连续放大尺度与噪声分布下，把所提 DTV-INR 与经典变分方法及现代连续坐标架构进行比较。

### 4.1 实验设置与基准数据集

**基准数据集。** 我们在两个互补、以复杂曲线边界、方向性纤维与连续强度过渡为特征的成像域上评估：

1. **生物医学显微成像**：具有细膜结构、纤维状细胞骨架网络与非欧几里得曲线边界的高分辨电子显微镜与组织学扫描。
2. **临床神经影像（脑 MRI）**：来自 OASIS 数据库 [19] 的 T1 与 T2 加权磁共振切片，具有平滑组织过渡、白质/灰质界面与方向性血管路径，其中保持各向异性边缘几何对诊断保真度至关重要。

**退化与观测模型。** 低分辨率退化测量 $\mathbf y\in\mathbb R^M$ 严格按连续—离散前向算子 $\mathcal A\mathbf u=S_s(k_\sigma\ast\mathbf u)+\boldsymbol\eta$ 生成，其中：

- $k_\sigma$ 表示宽度 $\sigma_k\in[1.2,2.0]$ 的对称高斯点扩散函数（PSF），刻画光学衍射模糊；
- $S_s$ 表示在均匀探测器格点上的空间子采样，下采样倍率 $s\in\{2,3,4,6,8\}$，并包含非整数、非二进制的连续尺度查询（$s=3.4,5.2$）；
- $\boldsymbol\eta\sim\mathcal N(\mathbf 0,\sigma_\eta^2\mathbf I_M)$ 表示加性零均值白高斯测量噪声，污染标准差 $\sigma_\eta\in[0.01,0.10]$ 可变。

**对比基线方法。** 我们将 DTV-INR 与五类代表性重建范式对比：

- **双三次样条插值**：经典连续空间基线；
- **变分各向同性 TV（Chambolle–Pock）[20]**：离散全变差重建，最小化 $\frac{1}{2}\|\mathcal A\mathbf u-\mathbf y\|_2^2+\lambda\|\nabla\mathbf u\|_1$；
- **离散深度超分辨率（EDSR）[21]**：在预先确定的整数网格配置上运行的深度离散卷积基线（U-Net）[22]；
- **局部隐式图像函数（LIIF）**：以卷积潜表示为条件的先进连续隐式神经网络；
- **普通 SIREN INR**：无正则的连续坐标基隐式神经网络（$\lambda=\mu=0$）；
- **各向同性 TV 正则 INR（TV-INR）**：以标量全变差正则的连续神经表述（$D(\mathbf x)\equiv\mathbf I_2$）。

**定量质量指标。** 重建保真度用峰值信噪比（PSNR [dB]）、结构相似性指数（SSIM）[23] 与学习感知图像块相似度（LPIPS）[24] 量化。

**实现与超参数配置。** 隐式网络 $\mathbf u_\theta$ 由 $L=5$ 层多层感知机参数化，隐藏特征维度 $d_l=256$，基频 $\omega_0=30.0$。网络权重用 AdamW [25] 优化，初始学习率 $\eta=2\times10^{-4}$，在 $K_{\max}=3000$ 次迭代内平滑衰减至 $1\times10^{-5}$。方向张量超参数设为：尺度参数 $\rho=1.5$、敏感度阈值 $\tau_D=0.08$、过渡指数 $\gamma=1.5$、最小椭圆性下界 $\alpha_{\min}=10^{-3}$，确保严格满足定理 2 的数学稳定性要求。为保证在可及计算资源下的经验可复现性，所有算法仿真、张量场评估与坐标基模型优化都在一台配备 1.10 GHz Intel Core i5 CPU 与 8 GB 内存的个人台式机上进行，验证了所提方案不依赖专用 GPU 加速器或专门的高性能计算集群。

### 4.2 定量性能与任意尺度连续泛化

表 1 汇总了 $2\times$ 至 $8\times$ 下采样倍率下的定量基准指标。数值结果展示三个基本性质：

1. **相对无正则 INR 的性能增益**：无正则 SIREN 基线随下采样倍率增大显著退化（例如 $8\times$ 时降至 22.25 dB），主要由于谱泄漏与无约束高频振荡。引入方向扩散度量 $D(\mathbf x)$ 后，DTV-INR 在 $8\times$ 下比 Vanilla SIREN 高 +5.05 dB，证实连续隐式架构在严重不适定逆问题设置中确实需要泛函正则化。
2. **相对各向同性正则的优势**：与各向同性 TV-INR 相比，所提各向异性表述在所有尺度区间平均增益 +1.71 至 +2.85 dB。PSNR 与 SSIM 的这一显著提升直接来自方向投影形式（2.4）：通过把空间传导率分解到正交方向 $(\mathbf v_1,\mathbf v_2)$，DTV-INR 避免了标量各向同性 TV 特有的破坏性跨边缘平滑。
3. **连续尺度不变性**：离散卷积模型因感受野固定，在查询未训练分辨率时需要专门的像素插值；DTV-INR 则在连续参数化的空间域 $\Omega$ 上评估数学连续场 $\mathbf u_\theta$。如图 5(c) 的连续尺度曲线所示，DTV-INR 的重建质量平滑下降，没有离散尺度惩罚或混叠异常。

**表 1：在生物医学显微与神经影像测试集上、不同放大倍率 $s$ 下的定量重建性能（PSNR [dB] / SSIM）。** 最优结果加粗，次优结果下划线（以下按原表逐格转录；“†”为原表脚注）。

| 方法 | 类型 | ×2 | ×3 | ×4 | ×6 | ×8 |
| --- | --- | --- | --- | --- | --- | --- |
| 双三次插值（Bicubic Interpolation） | 连续 | 31.84 / 0.884 | 28.52 / 0.812 | 26.21 / 0.745 | 23.12 / 0.638 | 21.20 / 0.542 |
| 离散 TV（Chambolle–Pock） | 离散 | 33.40 / 0.902 | 29.80 / 0.835 | 27.42 / 0.778 | 24.15 / 0.672 | 22.08 / 0.579 |
| EDSR | 离散 | 35.42 / 0.931 | 31.80 / 0.875 | 29.20 / 0.821 | 25.24 / 0.710† | 22.80 / 0.612† |
| LIIF（连续 SR） | 隐式 | 36.21 / 0.942 | 32.74 / 0.891 | 30.52 / 0.852 | 27.40 / 0.781 | 25.12 / 0.715 |
| 普通 SIREN INR | 隐式 | 33.95 / 0.910 | 30.12 / 0.846 | 27.65 / 0.784 | 24.38 / 0.680 | 22.25 / 0.584 |
| 各向同性 TV-INR | 隐式 | 35.80 / 0.935 | 32.15 / 0.880 | 30.70 / 0.856 | 26.85 / 0.765 | 24.45 / 0.692 |
| **所提 DTV-INR** | 隐式 | **37.92 / 0.961** | **34.62 / 0.924** | **32.41 / 0.895** | **29.54 / 0.832** | **27.30 / 0.771** |

† 原表脚注：离散 CNN 在 ×6 与 ×8 尺度下的数值需要外部双三次重采样，因为固定卷积核缺乏原生任意尺度投影能力。

### 4.3 对测量退化与噪声的鲁棒性分析

为经验性验证定理 2，表 2 与图 5(b) 刻画各方法在加性高斯扰动增强（$\sigma_\eta\in[0.01,0.10]$）下的稳定性。

由于无正则神经坐标表示具有无限有效容量，Vanilla SIREN 会对噪声实现产生剧烈过拟合：在 $\sigma_\eta=0.10$ 时其 PSNR 跌至 18.20 dB，感知误差升高（LPIPS = 0.685）。各向同性 TV-INR 虽通过全变差阻尼稳定反演，却在边缘锐度与对比度上付出显著代价。

与此形成鲜明对比，DTV-INR 即使在强噪声（$\sigma_\eta=0.10$）下仍保持结构完整性与边缘一致性，达到 24.80 dB（比 TV-INR 高 +3.30 dB，比 Vanilla SIREN 高 +6.60 dB）。这一显著稳定性在经验上印证了引理 1 证明的连续能量强制性，以及定理 2 建立的连续—离散稳定性界——该界表明参数扰动严格受 $O(\mu^{-1/2}\|\delta\mathbf y\|)$ 约束。

**表 2：$\times4$ 超分辨率下随测量噪声增强（$\sigma_\eta\in[0.01,0.10]$）的重建鲁棒性。** 指标为 PSNR [dB] / SSIM / LPIPS（↓），逐格转录。

| 方法 | $\sigma_\eta=0.01$ | $\sigma_\eta=0.03$ | $\sigma_\eta=0.05$ | $\sigma_\eta=0.07$ | $\sigma_\eta=0.10$ |
| --- | --- | --- | --- | --- | --- |
| 双三次 | 27.40 / 0.781 / 0.384 | 24.80 / 0.695 / 0.452 | 22.10 / 0.584 / 0.540 | 20.20 / 0.490 / 0.621 | 17.80 / 0.385 / 0.710 |
| LIIF | 31.85 / 0.882 / 0.220 | 28.60 / 0.804 / 0.295 | 25.40 / 0.712 / 0.385 | 22.90 / 0.605 / 0.480 | 19.80 / 0.485 / 0.602 |
| 普通 SIREN | 30.50 / 0.865 / 0.252 | 27.00 / 0.762 / 0.334 | 23.40 / 0.640 / 0.442 | 20.90 / 0.528 / 0.560 | 18.20 / 0.412 / 0.685 |
| 各向同性 TV-INR | 32.20 / 0.895 / 0.205 | 29.30 / 0.825 / 0.278 | 26.50 / 0.742 / 0.360 | 24.10 / 0.650 / 0.445 | 21.50 / 0.535 / 0.565 |
| **所提 DTV-INR** | **34.60 / 0.938 / 0.142** | **32.10 / 0.886 / 0.198** | **29.40 / 0.820 / 0.270** | **27.20 / 0.755 / 0.345** | **24.80 / 0.670 / 0.440** |

### 4.4 定性分析与阶梯伪影抑制

图 6 对具有曲线膜与纤维边界的代表性生物医学组织样本，给出连续重建的视觉与感知对比。

在放大插图中可以直观看到传统表述的感知局限：

- **双三次插值（c）**存在普遍的空间模糊，无法分辨高曲率细胞连接处；
- **Vanilla SIREN（d）**保持了边缘过渡，但引入高频背景波纹与噪声斑点，这是无约束谐波拟合的典型特征；
- **各向同性 TV-INR（e）**能有效抑制随机噪声，却引入严重阶梯伪影：由于标量全变差的非方向性，平滑弯曲的生物边界被分割为人工分段常数平台，出现明显的块状过渡；
- **所提 DTV-INR（f）**实现无缝、锐利、无伪影的重建。结构自适应张量场 $D(\mathbf x)$ 把扩散专门集中在切向场 $\mathbf v_2(\mathbf x)$ 上，使生物轮廓保持连续曲率连续性，同时严格抑制沿 $\mathbf v_1(\mathbf x)$ 的横向扩散。

#### 4.4.1 在解析 Shepp–Logan 体模上的连续表示压力测试

为严格检验所提表述是否在无度量畸变的前提下保持平滑曲线几何，我们借助专用数值测试套件（`main2.py`），用连续 Shepp–Logan 体模开展受控基准测试。该体模是理想的压力测试对象，因为其分段光滑的椭圆水平集能立即暴露人工方向偏置或度量伪影。

如图 7 所示，标准双三次插值存在严重的边缘涂抹（17.52 dB，SSIM = 0.584）。无约束坐标网络（Vanilla SIREN）虽能恢复更锐利的谱成分（18.15 dB，SSIM = 0.612），却在均匀衰减区域产生非物理的高频振荡振铃。施加各向同性全变差（IsoTV）可抑制振荡并改善数值保真度（19.45 dB，SSIM = 0.689），但它不加区分地惩罚真实曲率，产生严重的分段常数棱面化——即典型的阶梯伪影。相比之下，所提 DTV-INR 模型（20.61 dB，SSIM = 0.748）取得更优的结构保真度，PSNR 比标准 IsoTV 高 +1.16 dB，结构一致性也显著改善。

这一性能余量的物理来源在 **图 8** 的曲线边界放大图中得到体现。通过把正则项分解为正交的法向与切向投影，DTV-INR 把平滑限制在等照度线方向，同时阻止垂直于陡峭密度台阶的扩散。因此，细薄的嵌套椭圆界面保持清晰、平滑，且没有虚假的多边形平面化。

### 4.5 消融研究与变分超参数敏感性

为确认式（2.2）泛函能量中各组成部分的单独贡献，我们开展了汇总于表 3 的广泛消融研究。

经验性消融结论如下：

- **连续 $L_2$ 阻尼（$\mu$）的必要性**：仅加入连续 $L_2$ 惩罚（配置 2）即在 Vanilla INR 基础上改善稳定性 +1.15 dB，证实严格能量强制性可从数学上抑制无界参数漂移。
- **各向异性张量形式的影响**：把各向同性正则（配置 3）替换为方向结构张量引导（配置 4）后立即跃升 +2.12 dB。这确认结构引导是抑制阶梯伪影的主要驱动因素。
- **动态张量细化的效力**：允许度量张量 $D(\mathbf x)$ 随演化中的引导场 $\mathbf u_\theta^{(k)}$ 迭代刷新（配置 5，算法 1）额外增加 +0.68 dB，确保优化过程中发现的高分辨率边缘轨迹迭代增强方向引导矩阵。

**表 3：消融研究——所提 DTV-INR 表述各功能组件评估（$\times4$ 超分辨率，$\sigma_\eta=0.03$）。** 逐格转录。

| 配置 | SIREN 骨干 | Tikhonov $L_2$（$\mu$） | 各向同性 TV | 各向异性 $D(\mathbf x)$ | 动态张量 | PSNR [dB] / SSIM |
| --- | --- | --- | --- | --- | --- | --- |
| (1) Vanilla INR | ✓ | – | – | – | – | 27.00 / 0.762 |
| (2) 仅 Tikhonov | ✓ | ✓ | – | – | – | 28.15 / 0.795 |
| (3) 各向同性 TV | ✓ | ✓ | ✓ | – | – | 29.30 / 0.825 |
| (4) 静态各向异性 $D(\mathbf x)$ | ✓ | ✓ | – | ✓ | – | 31.42 / 0.856 |
| (5) 完整 DTV-INR | ✓ | ✓ | – | ✓ | ✓ | **32.10 / 0.886** |

### 4.6 计算收敛性刻画

图 5(a) 绘出经验目标能量 $L(\theta^{(k)})$ 在 3000 次优化步中的轨迹。无正则 Vanilla INR 由于坐标反向传播中的梯度不稳定而出现噪声性、非单调波动；DTV-INR 则实现快速且单调的目标下降。得益于平滑的方向度量正则化，能量曲线在约 1200 次迭代内进入稳定、良态（well-conditioned）的极小点，表明变分正则项在网络优化中起到了有效的计算预条件作用。

## 5 结论与未来展望

本文发展了**方向全变差正则隐式神经表示（DTV-INR）**范式，展示了连续泛函微积分、各向异性变分 PDE 分析与坐标基隐式架构在严重采集退化下连续尺度超分辨率中的数学统一综合。通过把不适定的连续—离散逆重建问题重新表述在无穷维变分框架中，DTV-INR 弥合了经典泛函正则化与现代连续深度表示之间的理论与计算鸿沟。

### 5.1 核心理论与算法贡献总结

本工作在方法、理论与经验层面的主要发现综合如下：

1. **连续算子表述与适定性**：本文不在固定离散像素网格上表述超分辨率，而是通过严格的连续—离散算子 $\mathcal A=S_s\circ\mathcal B_k$ 建立观测模型。通过把坐标网络参数化与方向加权黎曼度量张量场 $D(\mathbf x)$ 以及 $L^2(\Omega)$ Tikhonov 阻尼项结合，证明了变分极小解在自反 Sobolev 空间 $H^1(\Omega)$ 中的存在性、唯一性与度量稳定性（定理 1 与 2），为对抗不适定参数漂移提供了坚实的数学保证。
2. **通过各向异性扩散引导消除阶梯伪影**：传统标量全变差正则项会沿平滑弯曲的生物边界产生不自然的分段常数平台（阶梯伪影）。通过把度量张量分解为平行于边缘切线与垂直于梯度轨迹的正交投影，DTV-INR 把变分平滑严格限制在边界轮廓方向，同时阻止横向通量。
3. **结构张量驱动的自适应性**：正则项的方向性并非人工设计，而是通过带积分尺度 $\rho$ 与各向异性阈值 $\tau_D$ 的高斯平滑结构张量，从图像内容中局部、自动地估计得到。这使泛函具有**内容自适应性**：在均匀区域度量退化为各向同性平滑，而在定向边缘附近变为最大各向异性，从而在去噪与边缘保持之间实现数据驱动的插值。
4. **无网格约束的连续坐标泛化**：得益于 SIREN 网络的连续参数化，重建的连续视觉场 $\mathbf u_\theta:\Omega\to\mathbb R$ 可在任意、非二进制、非整数放大倍率下求值，无需后处理插值、亚像素卷积平移或离散重训练。因此单个训练模型即可服务所有上采样倍率，消除了有监督 SR 架构“每个尺度一个网络”的限制。
5. **经验优越性与预条件效力**：在电子显微镜与临床神经影像上的大量实验表明，DTV-INR 稳定优于最先进的隐式方法（LIIF、Vanilla SIREN、TV-INR）与深度离散基线（EDSR），在严重下采样（×8）下达到最高 +5.05 dB 的 PSNR 优势，并对强烈加性噪声（$\sigma_\eta=0.10$）表现出非凡韧性。此外，收敛性刻画验证了各向异性正则化是有效的计算预条件器，可加速并单调降低数据保真目标，并显著降低对初始化与学习率选择的敏感性。
6. **存储与分辨率可扩展性**：由于 DTV-INR 的存储占用随网络规模而非输出分辨率增长，该框架对任意高的连续放大倍率都保持可计算；相比之下，基于网格的隐式解码器其潜存储代价随像素数增长。

### 5.2 更广泛适用性与临床/工业影响

除基准超分辨率之外，DTV-INR 表述的数学一般性为多样的高价值科学成像模态提供了有前景的途径：

- **临床磁共振成像（MRI）**：在多切片临床 MRI 中，厚层采集常导致各向异性空间分辨率与较低的面外保真度。DTV-INR 提供了精确的数学引擎，可合成连续各向同性 3D 组织体，而不会产生切片阶梯伪影，便于下游形态学体积测量、皮层厚度测绘与皮层下结构的可靠分割。其稳定性保证也使该方法适用于加速（压缩感知）重建，其中方向正则项可直接与傅里叶欠采样算子耦合。
- **冷冻电镜与组织病理学**：高分辨电子显微镜数据受为防止样本辐射损伤而施加的低电子剂量约束，采集结果噪声严重。DTV-INR 已证明的噪声稳定性界与连续边界一致性允许忠实重建亚细胞细胞器与膜拓扑；类似地，在全切片组织病理学中，各向异性先验与腺体及纤维组织结构对齐，以可忽略的额外代价改善诊断相关边界的视觉保真度。
- **工业无损检测（NDT）**：在工业 X 射线计算机断层与复合材料超声检测中，方向性微裂纹与纤维分层沿局部空间取向排列。结构张量驱动的各向异性扩散自然地贴合结构材料纤维，把真实结构缺陷与传感器噪声区分开，从而降低自动质量控制中的假阳性缺陷率。
- **遥感与地理空间成像**：卫星与航空影像呈现强方向性特征（道路、田界、海岸线）以及跨传感器的不规则非均匀像元足迹。连续且带方向正则化的表示可将多传感器、多分辨率采集融合为单一一致的连续场，在任意尺度上具备全色锐化质量。
- **天文与低照度成像**：光子受限的天文成像与 $\sigma_\eta$ 鲁棒性分析所针对的强噪声情形相同；方向先验与拖尾、喷流、星系纤维等条纹状特征良好匹配。
- **可解释性作为实际优势**：与纯黑箱 SR 网络不同，DTV-INR 的每个组件（度量场 $D(\mathbf x)$、结构张量、阻尼权重）都有直接的几何解释。这种透明性支持监管与临床验证流程——在这些流程中，理解重建“为何”可信与它的定量分数同样重要。

### 5.3 局限

对结果作平衡解读，也应承认当前局限。第一，结构张量参数（$\rho,\tau_D$）与正则权重目前凭经验固定；次优选择可能在极强噪声下平滑不足，或过度压平精细纹理。第二，坐标网络的逐场景优化代价虽被观察到的预条件效应摊薄，仍高于预训练离散 SR 网络的单次前向传播，这可能限制实时部署。第三，现有理论针对 $\mathbb R^2$ 中的 $H^1$ 强制泛函；把适定性分析推广到 3D 体数据与高阶（曲率感知）正则项仍是开放问题。最后，与所有 TV 类方法一样，DTV-INR 预设局部一致的方向性结构，对缺乏主导取向的纹理主导图像可能优势较小。

### 5.4 未来研究方向

本研究自然衍生出若干值得关注的理论与计算前沿：

- **推广到非欧几里得与体积流形**：虽然在 $\Omega\subset\mathbb R^2$ 上表述，但把连续泛函表述推广到时—空域 $\Omega\times[0,T]$（例如动态心脏电影 MRI）以及表示解剖曲面（皮层片层、血管中心线）的任意 2D/3D 黎曼流形，是直接的数学推广，只需把平坦散度替换为其流形对应形式。
- **自适应多尺度张量估计**：研究双层优化方案，使结构张量的空间积分尺度 $\rho$ 与阈值参数 $\tau_D$ 在元学习或超网络范式下与网络参数 $\theta$ 联合学习，从而让方向先验自适应于每个场景与噪声水平。
- **严格的泛化误差界**：为方向 TV 正则的坐标架构推导尖锐的 Rademacher 复杂度与神经正切核（NTK）谱界，以刻画泛化误差随样本量 $M$ 与坐标查询密度 $Q$ 的变化，从而把 SIREN 的谱偏置与各向异性能量景观联系起来。
- **学习式与生成式先验**：用神经或 Wasserstein 几何先验（例如从大规模定向成像数据语料学习）替换人工设计的度量场，并把 DTV-INR 与基于分数或扩散的生成模型耦合，实现具有不确定性感知、分布校准的超分辨率，并在任意查询位置给出置信图。
- **摊薄化与元学习初始化**：训练把低分辨率观测映射到 SIREN 权重的超网络，把逐场景优化从数分钟压缩到少量梯度步，从而支持视频级或大规模队列应用。
- **不确定性量化与贝叶斯表述**：通过随机梯度 Langevin 动力学或深度集成对 $\mathbf u_\theta$ 做后验采样，为连续重建设置有原则的置信区间，这是临床决策支持的前提。
- **与任务专用目标耦合**：在单一双层变分方案中联合优化重建与下游任务（分割、检测、配准），使方向先验不仅提升感知保真度，也提升任务性能。

总之，DTV-INR 在变分微积分与连续神经场之间建立了一座富有表现力且数学严谨的桥梁，表明把经典几何 PDE 嵌入深度隐式架构可在计算成像中带来更优保真度、数学可解释性、稳健的噪声韧性与强泛化能力，同时为通向下一代连续逆问题求解器开辟了丰富的理论、算法与转化研究议程。

## 图注（按原文翻译）

**图 1**：DTV-INR 框架总体示意图。退化观测 $\mathbf y$ 被变换为各向异性扩散张量场 $D(\mathbf x)$，用于引导坐标基隐式网络 $f_\theta$ 保持结构边界与精细边缘。
**图 2**：医学与微结构测试数据集上各基准方法的 PSNR 定量比较，突出 DTV-INR 取得的性能余量。
**图 3**：连续超分辨率尺度评估。重建质量（PSNR）作为放大倍率从 ×2 到 ×8 的连续函数。
**图 4**：对严重加性高斯噪声与 Rician 噪声剖面、在不同信噪比（SNR）下的鲁棒性分析。
**图 5**：定量计算刻画：(a) 变分目标随训练迭代 $k$ 的收敛，显示 DTV-INR 加速、单调的下降与更低的终端能量；(b) ×4 分辨率下对严重观测噪声 $\sigma_\eta$ 的鲁棒性轨迹；(c) 在非整数放大倍率 $s\in[2.0,8.0]$ 下的连续尺度泛化行为。
**图 6**：定性超分辨率对比（×4 放大，加性噪声 $\sigma_\eta=0.05$）：(a) 真值高分辨率参考；(b) 退化低分辨率观测；(c) 双三次插值；(d) 无正则 Vanilla SIREN；(e) 各向同性 TV-INR，呈现典型块状阶梯；(f) 所提 DTV-INR，保持锐利平滑的曲线边缘，无分段常数分割伪影。
**图 7**：解析 Shepp–Logan 体模上的连续超分辨率基准（4× 退化倍率，由 `main2.py` 生成）。对比：(a) 双三次基线（17.52 dB，SSIM = 0.584），存在严重模糊；(b) Vanilla SIREN（18.15 dB，SSIM = 0.612），存在高频振铃；(c) SIREN + IsoTV（19.45 dB，SSIM = 0.689），受阶梯棱面化困扰；(d) 所提 DTV-INR（20.61 dB，SSIM = 0.748），保持平滑的曲线水平集与高几何保真度。
**图 8**：Shepp–Logan 体模重建中曲线边界界面的放大检查。标准各向同性全变差会在连续曲线上引入虚假的分段平面棱面化（阶梯），而 DTV-INR 中的方向扩散张量沿切向引导平滑，从而恢复纯净的椭圆轮廓并保持完整边界对比度。

## 参考文献

> 以下按原文编号 [1]—[25] 转录英文原书目，条目文字不翻译；抽取文本中的 “¨” 等变音符号与断行已按书目规范整理，内容未改动。

[1] L. I. Rudin, S. Osher, and E. Fatemi, “Nonlinear total variation based noise removal algorithms,” Physica D, vol. 60, pp. 259–268, 1992.

[2] M. Bertero and P. Boccacci, Introduction to Inverse Problems in Imaging, IOP Publishing, Bristol, 1998.

[3] P. Getreuer, “Rudin–Osher–Fatemi total variation denoising using split Bregman,” IPOL Journal, vol. 2, pp. 74–95, 2012.

[4] A. Chambolle, “An algorithm for total variation minimization and applications,” Journal of Mathematical Imaging and Vision, vol. 20, pp. 89–97, 2004.

[5] M. Benning, L. Gladden, D. Holland, C.-B. Schönlieb, and T. Valkonen, “Phase contrast MRI reconstruction with anisotropic total variation,” in Proc. SampTA, 2017.

[6] M. Bertalmío, G. Sapiro, V. Caselles, and C. Ballester, “Image inpainting,” in Proc. ACM SIGGRAPH, 2000.

[7] K. Bredies, K. Kunisch, and T. Pock, “Total generalized variation,” SIAM Journal on Imaging Sciences, 3(3):492–526, 2010.

[8] J. Valkonen, K. Bredies, and K. Kunisch, “Primal-dual hybrid gradient method for nonlinear operators,” SIAM Journal on Imaging Sciences, 7(4):2339–2365, 2014.

[9] P. Perona and J. Malik, “Scale-space and edge detection using anisotropic diffusion,” IEEE Trans. PAMI, vol. 12, no. 7, pp. 629–639, 1990.

[10] J. Weickert, Anisotropic Diffusion in Image Processing. Stuttgart: Teubner, 1998.

[11] J. Weickert, “Coherence-enhancing diffusion filtering,” International Journal of Computer Vision, vol. 31, pp. 111–127, 1999.

[12] H. Takeda, S. Farsiu, and P. Milanfar, “Kernel regression for image processing and reconstruction,” IEEE Trans. Image Processing, vol. 16, no. 2, pp. 349–366, 2007.

[13] B. Mildenhall, P. P. Srinivasan, M. Tancik, J. T. Barron, R. Ramamoorthi, and R. Ng, “NeRF: Representing scenes as neural radiance fields for view synthesis,” in European Conference on Computer Vision (ECCV), 2020.

[14] V. Sitzmann, J. N. P. Martel, A. W. Bergman, D. B. Lindell, and G. Wetzstein, “Implicit neural representations with periodic activation functions,” in Advances in Neural Information Processing Systems (NeurIPS), 2020.

[15] Y. Chen, S. Liu, and X. Wang, “Learning continuous image representation with local implicit image function,” in Proc. IEEE/CVF CVPR, 2021.

[16] S. Tewari, O. Frey, R. M. Vasconcelos, and T. W. James, “Implicit neural representations for image compression,” in Proc. ECCV, 2020.

[17] M. Tancik, P. P. Srinivasan, B. Mildenhall, S. Fridovich-Keil, N. Raghavan, U. Singhal, R. Ramamoorthi, J. T. Barron, and R. Ng, “Fourier features let networks learn high frequency functions in low dimensional domains,” in Advances in Neural Information Processing Systems (NeurIPS), 2020.

[18] L. C. Evans, Partial Differential Equations, 2nd ed. Providence, RI: AMS, 2010.

[19] D. S. Marcus et al., “Open Access Series of Imaging Studies (OASIS): Cross-sectional MRI data in young, middle aged, nondemented, and demented older adults,” Journal of Cognitive Neuroscience, vol. 19, no. 9, pp. 1498–1507, 2007.

[20] A. Chambolle and T. Pock, “A first-order primal-dual algorithm for convex problems with applications to imaging,” Journal of Mathematical Imaging and Vision, vol. 40, no. 1, pp. 120–145, 2011.

[21] B. Lim, S. Son, H. Kim, S. Nah, and K. Mu Lee, “Enhanced deep residual networks for single image super-resolution,” in Proc. IEEE CVPR W, 2017.

[22] O. Ronneberger, P. Fischer, and T. Brox, “U-Net: Convolutional networks for biomedical image segmentation,” in Proc. MICCAI, 2015.

[23] Z. Wang, A. C. Bovik, H. R. Sheikh, and E. P. Simoncelli, “Image quality assessment: From error visibility to structural similarity,” IEEE Trans. Image Processing, vol. 13, no. 4, pp. 600–612, 2004.

[24] R. Zhang, P. Isola, A. A. Efros, E. Shechtman, and O. Wang, “The unreasonable effectiveness of deep features as a perceptual metric,” in Proc. IEEE CVPR, 2018.

[25] I. Loshchilov and F. Hutter, “Decoupled weight decay regularization,” in Proc. ICLR, 2019.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与关键词；第 1 节（1.1—1.4 引言、研究空白与贡献）；第 2 节连续变分表述（式（2.1）—（2.17），引理 1、定理 1、定理 2 及全部证明）；第 3 节算法 1（交替方向变分优化，逐步伪代码）；第 4 节实验（4.1 数据集/退化/基线/指标/实现，4.2 定量与表 1，4.3 鲁棒性与表 2，4.4 定性分析与 4.4.1 Shepp–Logan 压力测试，4.5 消融与表 3，4.6 收敛性）；第 5 节结论（5.1—5.4）；图 1—8 图注；参考文献 [1]—[25] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②原文为 LaTeX 预印本，公式编号采用节内编号（如（2.1）），本页照录；个别抽取中可能存在的符号歧义（如 (2.16) 的 $1/2$ 系数是否应按 (2.15) 推导正确写入）已在译文中以原式为准；③图 1—8 的图像本体未复制（站点不上传图片），仅转录原文图注与正文给出的关键数值；④原 PDF 题名与登记题名不一致，见页首“原文信息核对”，页面标题未改。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
