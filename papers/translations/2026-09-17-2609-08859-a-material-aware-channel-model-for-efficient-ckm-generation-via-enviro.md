---
layout: page
title: "面向高效 CKM 生成的材料感知信道模型｜中文全文译文"
permalink: /papers/translations/2026-09-17-2609-08859-a-material-aware-channel-model-for-efficient-ckm-generation-via-enviro/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6edd1b2a90906cae/) · [原文 arXiv](https://arxiv.org/abs/2609.08859) · [全部目录](/papers/catalog/)

# 面向高效 CKM 生成的材料感知信道模型

**原题：** A Material-Aware Channel Model for Efficient CKM Generation via Environment Reconstruction  
**作者：** Xuancheng Zhu（*†）、Zhenjun Dong（†）、Yong Zeng（*†）、Cheng-Xiang Wang（*†）  
**单位：** 东南大学移动通信国家重点实验室（南京 210096，中国）；紫金山实验室（南京 211111，中国）。邮箱：230268975@seu.edu.cn、dongzhenjun@pmlabs.com.cn、{yong zeng, chxwang}@seu.edu.cn。  
**版本：** arXiv:2609.08859v1（eess.SP），2026-09-08，原文 5 页（含图 1—5 与附录 A—C；原文无表格）。  
**范围与状态：** 全文中文译稿：摘要、第 I—VI 节、注 1—3、引理 1—2、定理 1—2、推论 1、算法 1、附录 A—C、图 1—5 图注、参考文献 [1]—[24] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2609.08859，2026-09-17"；本地 PDF 为 **arXiv:2609.08859v1 [eess.SP]，2026-09-08**，"2026-09-17" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

信道知识地图（channel knowledge map，CKM）是 6G 网络中环境感知无线通信、感知与定位的有前景技术。精确的 CKM 生成需要精确重建环境，包括三维几何与散射体材料，通常要基于激光雷达点云与稀疏信道测量等多模态感知观测完成。前者相对容易获取，但由于缺乏把材料与信道显式联系起来的信道模型，材料难以直接从稀疏信道测量中获得。为填补这一空白，本文提出一种**材料感知信道模型**，显式刻画散射体材料对无线信道的影响。基于该模型，提出一种**基于迭代梯度下降的材料重建算法**。全波仿真结果验证了所建模型与所提算法，展示了其通过环境重建实现高效 CKM 生成的潜力。

## I. 引言

第六代（6G）网络以 Tbps 级数据速率、亚毫秒时延、$10^8$ 设备/km² 的连接密度与厘米级定位精度为目标 [1]。为此，更高频段、XL-MIMO [2] 与通感一体化（ISAC）[3] 已被发展。然而，由此带来的 XL-MIMO 信道估计、ISAC 感知复杂性以及毫米波/太赫兹系统的极高数据率限制了其部署 [4]。近期，基于**信道知识地图（CKM）**[5] 或信道数字孪生 [6] 的环境感知系统，因利用环境与信道的内在关系，已成为有前景的 6G 范式。总体而言，CKM 生成方法分为两类：一类通过数学插值 [7]、矩阵补全 [8] 或深度学习从多模态观测直接端到端生成，需要大量测量；另一类是基于环境重建的生成，先重建三维几何与材料，再应用扩散模型 [9]、流匹配 [10] 或射线追踪 [11] 生成信道知识。后一种方法具有可解释性、可泛化性与更高的数据效率，但尽管三维几何已可通过激光雷达点云获取，材料获取仍然困难。

事实上，对 CKM 生成而言，从稀疏信道测量中推断材料比从视觉 [12] 或 ISAC [13] 中识别更有前景，因为它捕获了材料如何影响信道。然而该方法需要一个把材料属性与信道响应显式联系的模型。统计模型 [14] 忽略了材料；统一信道模型 [15]、基于几何的随机模型（GBSM）与普适模型 [16] 仅通过雷达截面积（RCS）隐式纳入材料，而 RCS 依赖于材料、方向与频率；确定性模型 [17] 依赖数值计算。为此，本文基于电磁（EM）理论建立**材料感知信道模型**，通过散射体的相对介电常数与电导率显式刻画材料，并提出一种基于迭代梯度下降的材料重建算法。最后给出基于全波仿真的数值结果以验证所提模型的有效性，展示其用于有效 CKM 生成的潜力。

## II. 系统模型

如图 1 所示，我们考虑三维笛卡尔坐标中具有 $S$ 个均匀材料散射体的目标环境，散射体材料记为 $\{\varepsilon_s,\sigma_s\}$。发射机与接收机位于 $\mathbf q_T,\mathbf q_R\in\mathbb R^{3\times1}$，均配备单根全向天线。经杂波抑制 [18] 后，信道冲激响应（CIR）为

$$
h(\mathbf q_T,\mathbf q_R,\tau)=\sum_{s=1}^{S}h_s(\mathbf q_T,\mathbf q_R)\delta(\tau-\tau_s),\tag{1}
$$

其中 $h_s(\mathbf q_T,\mathbf q_R)\in\mathbb C$ 表示由散射体 $s\in\{1,2,\cdots,S\}$ 支配的分量，$\tau_s$ 为相应时延。材料重建问题被表述为从 $N$ 个空间稀疏信道测量中推断 $S$ 个均匀散射体的材料，材料向量记为 $\mathbf m\in\mathbb R^{2S\times1}$：

$$
\mathbf m=[\varepsilon_1,\sigma_1,\varepsilon_2,\sigma_2,\cdots,\varepsilon_S,\sigma_S]^T,\tag{2}
$$

测量集记为

$$
\mathcal H=\left\{h(\mathbf q_T,\mathbf q_1,\tau),h(\mathbf q_T,\mathbf q_2,\tau),\cdots,h(\mathbf q_T,\mathbf q_N,\tau)\right\},\tag{3}
$$

其中 $\mathbf q_n\in\mathbb R^{3\times1}$（$n\in\{1,2,\cdots,N\}$）表示信道测量位置。

> **注 1**：把（1）中 $h_s(\mathbf q_T,\mathbf q_R)$ 表示为 $\{\varepsilon_s,\sigma_s\}$ 的显式函数，可在材料与信道之间建立直接联系，从而在以 $S$ 个散射体的精确几何为先验知识的前提下，从 $\mathcal H$ 重建 $\mathbf m$。

## III. 材料感知信道模型

### A. 与材料相关的信道响应

（1）中由散射体 $s$ 支配的信道分量 $h_s(\mathbf q_T,\mathbf q_R)$ 由远场雷达方程 [19] 给出：

$$
h_s(\mathbf q_T,\mathbf q_R)=\sqrt{\frac{P_{R,s}}{P_T}}e^{j\varphi_s}=\frac{\lambda\sqrt{\Xi_s(\mathbf q_T,\mathbf q_R)}e^{j\varphi_s}}{\sqrt{4\pi}\left(4\pi\|\Delta\breve{\mathbf q}_s\|\cdot\|\Delta\tilde{\mathbf q}_s\|\right)},\tag{4}
$$

其中 $\varphi_s\in(-\pi,\pi]$ 表示 $h_s(\mathbf q_T,\mathbf q_R)$ 的复相位；$P_{R,s}/P_T$ 为接收与发射功率之比；$\lambda=c/f_c$ 为波长（$c$ 为光速）；$\Delta\breve{\mathbf q}_s\in\mathbb R^{3\times1}$ 从发射机指向散射体，$\Delta\tilde{\mathbf q}_s=\mathbf q_R-\Delta\breve{\mathbf q}_s-\mathbf q_T\in\mathbb R^{3\times1}$；$\Xi_s(\mathbf q_T,\mathbf q_R)$ 表示散射体 $s$ 的远场双站 RCS。直观地，时延 $\tau_s=(\|\Delta\breve{\mathbf q}_s\|+\|\Delta\tilde{\mathbf q}_s\|)/c$。以下各节通过把散射体 $s$ 的表面网格化为 $M_s$ 个矩形面片，推导 $\Xi_s(\mathbf q_T,\mathbf q_R)$ 关于 $\{\varepsilon_s,\sigma_s\}$ 的显式表达；每个面片由参数集唯一刻画：

$$
\mathcal P_{m_s}=\left\{\mathbf q_{m_s},\eta_{m_s},\vartheta_{m_s},\xi_{m_s},L_{H,m_s},L_{V,m_s},\varepsilon_s,\sigma_s\right\},\tag{5}
$$

其中 $m_s\in\{1,2,\cdots,M_s\}$；$\mathbf q_{m_s}\in\mathbb R^{3\times1}$ 为面片中心位置向量；$\eta_{m_s}$、$\vartheta_{m_s}$、$\xi_{m_s}$ 分别为偏航、俯仰与滚转角；$L_{H,m_s}$、$L_{V,m_s}$ 描述面片 $m_s$ 的尺寸。于是定义 $\Delta\breve{\mathbf q}_s=\frac{1}{M_s}\sum_{m_s}\mathbf q_{m_s}-\mathbf q_T$，$\Xi_s(\mathbf q_T,\mathbf q_R)$ 由 [20] 给出：

$$
\Xi_s(\mathbf q_T,\mathbf q_R)=\left|\sum_{m_s=1}^{M_s}\sqrt{S(\mathcal P_{m_s},\mathbf a_I,\mathbf a_R)}e^{-j\frac{2\pi}{\lambda}\|\Delta\breve{\mathbf q}_s\|}\Delta\breve{\mathbf q}_s^T\hat{\mathbf n}_{m_s}\right|^2,\tag{6}
$$

其中 $\hat{\mathbf n}_{m_s}\in\mathbb R^{3\times1}$ 为面片 $m_s$ 由内指向外的法向量；$\mathbf a_I,\mathbf a_R\in\mathbb R^{3\times1}$ 表示单位入射与观测方向；$S(\mathcal P_{m_s},\mathbf a_I,\mathbf a_R)$ 表示参数集为 $\mathcal P_{m_s}$ 的面片 $m_s$ 的双站 RCS。

**图 1**：含 $S$ 个散射体的多径无线信道，其中第 $s$ 个散射体被划分为 $M_s$ 个矩形面片。

### B. 面片 RCS 的闭式表达

如图 2 所示，先从一个简单情形出发：散射体仅含 1 个面片，位于三维笛卡尔坐标原点，参数集 $\mathcal P=\{\mathbf 0_{3\times1},0,0,0,L_H,L_V,\varepsilon,\sigma\}$。令 $\mathbf l=[0,l_y,l_z]^T\in\mathbb R^{3\times1}$ 表示面片上一点。设入射与观测方向分别为 $\mathbf a_I=\Delta\breve{\mathbf q}/\|\Delta\breve{\mathbf q}\|=[-\sin\theta_I\cos\phi_I,-\sin\theta_I\sin\phi_I,-\cos\theta_I]^T$ 与 $\mathbf a_R=\Delta\tilde{\mathbf q}/\|\Delta\tilde{\mathbf q}\|=[\cos\phi_R\sin\theta_R,\sin\phi_R\sin\theta_R,\cos\theta_R]^T$，其中 $\phi_I,\phi_R,\theta_I,\theta_R$ 为入射与观测的有效方位角与天顶角；$d_R=\|\Delta\tilde{\mathbf q}\|$ 为观测距离；$\gamma\in[0,\frac{\pi}{2}]$ 为极化角。

> **注 2**：本文中方位角 $\phi$ 与天顶角 $\theta$ 的参考方向分别取正 $x$ 轴与正 $z$ 轴，逆时针为正方向，因此 $\phi_I,\phi_R\in\left[-\frac{\pi}{2},\frac{\pi}{2}\right]$、$\theta_I,\theta_R\in[0,\pi)$。

材料属性由反射系数刻画，如引理 1 所述。

**引理 1**：垂直极化与平行极化的反射系数由 [19] 给出：

$$
\Gamma_\perp(\varepsilon,\sigma)=\frac{\cos\rho-\sqrt{\chi(\varepsilon,\sigma)-\sin^2\rho}}{\cos\rho+\sqrt{\chi(\varepsilon,\sigma)-\sin^2\rho}}\in\mathbb C,\tag{7}
$$

$$
\Gamma_\parallel(\varepsilon,\sigma)=\frac{\sqrt{\chi(\varepsilon,\sigma)-\sin^2\rho}-\chi(\varepsilon,\sigma)\cos\rho}{\sqrt{\chi(\varepsilon,\sigma)-\sin^2\rho}+\chi(\varepsilon,\sigma)\cos\rho}\in\mathbb C,\tag{8}
$$

其中 $\chi(\varepsilon,\sigma)=\varepsilon-j\frac{\sigma}{\omega\varepsilon_0}$，$\varepsilon_0\approx8.8542\times10^{-12}$ F/m，$\omega=2\pi f_c$；$\rho=\arccos(\cos\phi_I\sin\theta_I)$。

**证明**：见附录 A。

无线信号建模为平面电磁波，入射电场在 $\mathbf l$ 处的相量为

$$
\mathbf E_I(\mathbf a_I,\mathbf l)=E_Ie^{-j\frac{2\pi}{\lambda}\mathbf a_I^T\mathbf l}\left(\sin\gamma\,\hat{\mathbf E}_\perp+\cos\gamma\,\hat{\mathbf E}_\parallel\right),\tag{9}
$$

其中 $E_I\in\mathbb C$；$\hat{\mathbf E}_\perp,\hat{\mathbf E}_\parallel\in\mathbb R^{3\times1}$ 为

$$
\hat{\mathbf E}_\perp=\frac{\hat{\mathbf x}\times\mathbf a_I}{\|\hat{\mathbf x}\times\mathbf a_I\|}=\frac{\cos\theta_I\hat{\mathbf y}-\sin\phi_I\sin\theta_I\hat{\mathbf z}}{\|\hat{\mathbf x}\times\mathbf a_I\|},\tag{10}
$$

$$
\hat{\mathbf E}_\parallel=(\mathbf a_I\times\hat{\mathbf E}_\perp)/\|\mathbf a_I\times\hat{\mathbf E}_\perp\|.\tag{11}
$$

**图 2**：尺寸为 $L_H\times L_V$ 的面片示意，其相对介电常数与电导率分别为 $\varepsilon$ 与 $\sigma$。

**定理 1**：与面片交互后，$\mathbf l$ 处的感应表面电流 $\mathbf J(\mathbf l)\in\mathbb C^{3\times1}$ 为

$$
\begin{aligned}
\mathbf J(\mathbf l)=\Bigg[&\frac{\sin\gamma\cos\phi_I\sin\theta_I(1-\Gamma_\perp)}{\|\mathbf a_I\times\hat{\mathbf E}_\perp\|}\left(\cos\theta_I\hat{\mathbf y}-\sin\phi_I\sin\theta_I\hat{\mathbf z}\right)\\
&+\frac{\cos\gamma(\Gamma_\parallel-1)}{\|\mathbf a_I\times\hat{\mathbf x}\|}\left(\cos\theta_I\hat{\mathbf z}+\sin\phi_I\sin\theta_I\hat{\mathbf y}\right)\Bigg]\frac{E_Ie^{-j\frac{2\pi}{\lambda}\mathbf a_I^T\mathbf l}}{Z_0},
\end{aligned}\tag{12}
$$

其中 $\Gamma_\perp=\Gamma_\perp(\varepsilon,\sigma)$、$\Gamma_\parallel=\Gamma_\parallel(\varepsilon,\sigma)$ 如引理 1 给出。

**证明**：见附录 B。

选取 $L_H$ 与 $L_V$ 使 $\|\Delta\breve{\mathbf q}\|$ 与 $\|\Delta\tilde{\mathbf q}\|$ 都超过 Rayleigh 距离。于是散射波相量可分解为两个正交分量：

$$
\mathbf E_s(\mathbf a_R)\approx E_s^\phi(\mathbf a_R)\hat{\mathbf E}_s^\phi+E_s^\theta(\mathbf a_R)\hat{\mathbf E}_s^\theta,\tag{13}
$$

其中 $\mathbf E_s(\mathbf a_R)\in\mathbb C^{3\times1}$；$E_s^\phi(\mathbf a_R),E_s^\theta(\mathbf a_R)\in\mathbb C$ 为散射波相量；$\hat{\mathbf E}_s^\phi=-\sin\phi\hat{\mathbf x}+\cos\phi\hat{\mathbf y}\in\mathbb R^{3\times1}$ 与 $\hat{\mathbf E}_s^\theta=\cos\phi\cos\theta\hat{\mathbf x}+\sin\phi\cos\theta\hat{\mathbf y}-\sin\theta\hat{\mathbf z}\in\mathbb R^{3\times1}$ 分别表示方位与极向方向。

**定理 2**：基于远场近似的 Stratton–Chu 方程 [19]，（13）中的散射波相量 $E_s^\phi(\mathbf a_R)$、$E_s^\theta(\mathbf a_R)$ 为

$$
E_s^\phi(\mathbf a_R)\simeq-j\frac{e^{-j\frac{2\pi}{\lambda}d_R}}{2d_R\lambda}E_I\left[\sin\gamma\,\Upsilon(\varepsilon,\sigma)\Phi_\perp(\mathbf a_I,\mathbf a_R)+\cos\gamma\,\Psi(\varepsilon,\sigma)\Phi_\parallel(\mathbf a_I,\mathbf a_R)\right]I(\mathbf a_I,\mathbf a_R),\tag{14}
$$

$$
E_s^\theta(\mathbf a_R)\simeq-j\frac{e^{-j\frac{2\pi}{\lambda}d_R}}{2d_R\lambda}E_I\left[\sin\gamma\,\Upsilon(\varepsilon,\sigma)\Theta_\perp(\mathbf a_I,\mathbf a_R)+\cos\gamma\,\Psi(\varepsilon,\sigma)\Theta_\parallel(\mathbf a_I,\mathbf a_R)\right]I(\mathbf a_I,\mathbf a_R),\tag{15}
$$

其中

$$
I(\mathbf a_I,\mathbf a_R)=L_HL_V\operatorname{sinc}\left(\frac{L_H}{\lambda}\zeta(\mathbf a_I,\mathbf a_R)\right)\operatorname{sinc}\left(\frac{L_V}{\lambda}\kappa(\mathbf a_I,\mathbf a_R)\right),\tag{16}
$$

$$
\Phi_\perp(\mathbf a_I,\mathbf a_R)=\cos\phi_I\sin\theta_I\cos\theta_I\cos\phi_R/\|\mathbf a_I\times\hat{\mathbf E}_\perp\|,\tag{17}
$$

$$
\Phi_\parallel(\mathbf a_I,\mathbf a_R)=\sin\phi_I\sin\theta_I\cos\phi_R/\|\hat{\mathbf x}\times\mathbf a_I\|,\tag{18}
$$

$$
\Theta_\perp(\mathbf a_I,\mathbf a_R)=\frac{\cos\phi_I\sin\theta_I}{\|\mathbf a_I\times\hat{\mathbf E}_\perp\|}\left(\cos\theta_I\sin\phi_R\cos\theta_R+\sin\theta_I\sin\phi_I\sin\theta_R\right),\tag{19}
$$

$$
\Theta_\parallel(\mathbf a_I,\mathbf a_R)=\frac{-\cos\theta_I\sin\theta_R+\sin\phi_I\sin\theta_I\sin\phi_R\cos\theta_R}{\|\hat{\mathbf x}\times\mathbf a_I\|},\tag{20}
$$

且 $\zeta(\mathbf a_I,\mathbf a_R)=\sin\phi_I\sin\theta_I+\sin\phi_R\sin\theta_R$；$\kappa(\mathbf a_I,\mathbf a_R)=\cos\theta_I+\cos\theta_R$；$\Upsilon(\varepsilon,\sigma)=1-\Gamma_\perp(\varepsilon,\sigma)$；$\Psi(\varepsilon,\sigma)=\Gamma_\parallel(\varepsilon,\sigma)-1$。

**证明**：见附录 C。

基于（9）中的 $E_I$ 与（13）中的 $\mathbf E_s$，（6）中的面片 RCS 定义为

$$
S(\mathcal P,\mathbf a_I,\mathbf a_R)=\lim_{d_R\to\infty}4\pi d_R^2\frac{|\mathbf E_s|^2}{|E_I|^2}\overset{(a)}{=}\lim_{d_R\to\infty}4\pi d_R^2\frac{\left|E_s^\phi\right|^2+\left|E_s^\theta\right|^2}{|E_I|^2},\tag{21}
$$

其中 $(a)$ 由（13）中的正交性得到。

**推论 1**：参数为 $\mathcal P$、入射方向 $\mathbf a_I$、观测方向 $\mathbf a_R$ 的面片 RCS 为

$$
\begin{aligned}
S(\mathcal P,\mathbf a_I,\mathbf a_R)=\frac{\pi}{\lambda^2}\Big[&\sin^2\gamma\left(\Phi_\perp^2+\Theta_\perp^2\right)\left|\Upsilon(\varepsilon,\sigma)\right|^2+\sin(2\gamma)\left(\Phi_\perp\Phi_\parallel+\Theta_\perp\Theta_\parallel\right)\Re\left(\Upsilon(\varepsilon,\sigma)\Psi^\ast(\varepsilon,\sigma)\right)\\
&+\cos^2\gamma\left(\Phi_\parallel^2+\Theta_\parallel^2\right)\left|\Psi(\varepsilon,\sigma)\right|^2\Big]\left|I(\mathbf a_I,\mathbf a_R)\right|^2,
\end{aligned}\tag{22}
$$

其中 $\Phi_\perp,\Phi_\parallel,\Theta_\perp,\Theta_\parallel$ 分别表示（17）—（20）。

**证明**：把定理 2 中的各式代入（21）即得（22）。

> **注 3**：一旦目标环境的几何确定，（6）与（22）中的 RCS 只通过 $\Upsilon(\varepsilon,\sigma)$ 与 $\Psi(\varepsilon,\sigma)$ 显式依赖材料属性 $\mathbf m$，从而使从 $\mathcal H$ 经（4）推断 $\mathbf m$ 成为可能。

进一步，如图 3 所示，考虑面片处于任意位置 $\mathcal P=\{\mathbf q,\eta,\vartheta,\xi,L_H,L_V,\varepsilon,\sigma\}$。有效入射与观测向量为

$$
\mathbf a_I(\mathcal P,\mathbf q_T)=-\mathbf R^T(\eta,\vartheta,\xi)\Delta\breve{\mathbf q}/\|\Delta\breve{\mathbf q}\|,\tag{23}
$$

$$
\mathbf a_R(\mathcal P,\mathbf q_T,\mathbf q_R)=\mathbf R^T(\eta,\vartheta,\xi)\Delta\tilde{\mathbf q}/\|\Delta\tilde{\mathbf q}\|,\tag{24}
$$

其中 $\mathbf R(\eta,\vartheta,\xi)\in\mathbb R^{3\times3}$ 为（31）给出的酉旋转矩阵，满足 $\mathbf R\mathbf R^T=\mathbf I_3$。于是入射与观测角为

$$
\theta_I(\mathcal P,\mathbf q_T)=\arccos\left(-\mathbf a_I^T(\mathcal P)\hat{\mathbf z}\right),\tag{25}
$$

$$
\theta_R(\mathcal P,\mathbf q_T,\mathbf q_R)=\arccos\left(\mathbf a_R^T(\mathcal P,\mathbf q_T,\mathbf q_R)\hat{\mathbf z}\right),\tag{26}
$$

$$
\phi_I(\mathcal P,\mathbf q_T)=\arcsin\left(-\mathbf a_I^T(\mathcal P)\hat{\mathbf y}/\sin(\theta_I(\mathcal P))\right),\tag{27}
$$

$$
\phi_R(\mathcal P,\mathbf q_T,\mathbf q_R)=\arcsin\left(\frac{\mathbf a_R^T(\mathcal P,\mathbf q_T,\mathbf q_R)\hat{\mathbf y}}{\sin(\theta_R(\mathcal P,\mathbf q_T,\mathbf q_R))}\right).\tag{28}
$$

此外，为确保面片位于由 Rayleigh 距离界定的远场区域，链路距离 $\|\Delta\breve{\mathbf q}\|$ 与 $\|\Delta\tilde{\mathbf q}\|$ 应满足引理 2。

**引理 2**：为处于远场区域，面片的 $L_H$、$L_V$ 与 $\|\Delta\breve{\mathbf q}\|$、$\|\Delta\tilde{\mathbf q}\|$ 应联合考虑：

$$
\min\left\{\|\Delta\breve{\mathbf q}\|,\|\Delta\tilde{\mathbf q}\|\right\}\ge2\left(L_H^2+L_V^2\right)/\lambda-\lambda/32.\tag{29}
$$

**证明**：Rayleigh 距离 $d_{\mathrm{Rayl}}$ 定义为法向入射（$(\phi_I,\theta_I)=(0,\frac{\pi}{2})$）下的最小链路距离，此时相位误差 $\Delta\varphi(d_{\mathrm{Rayl}})\le\pi/8$：

$$
\Delta\varphi(d_{\mathrm{Rayl}})=\frac{2\pi}{\lambda}\left(\sqrt{d_{\mathrm{Rayl}}^2+\frac{L_H^2+L_V^2}{4}}-d_{\mathrm{Rayl}}\right)\le\frac{\pi}{8}.\tag{30}
$$

因此有 $\min\{\|\Delta\breve{\mathbf q}\|,\|\Delta\tilde{\mathbf q}\|\}\ge\min d_{\mathrm{Rayl}}$，如（29）所示。

把（25）—（28）中的 $\phi_I(\mathcal P,\mathbf q_T)$、$\theta_I(\mathcal P,\mathbf q_T)$、$\phi_R(\mathcal P,\mathbf q_T,\mathbf q_R)$、$\theta_R(\mathcal P,\mathbf q_T,\mathbf q_R)$ 代入（17）—（20）中的 $\Upsilon(\varepsilon,\sigma)$、$\Psi(\varepsilon,\sigma)$、$\Phi_\perp$、$\Phi_\parallel$、$\Theta_\perp$、$\Theta_\parallel$，再代入（22），即得图 3 中面片的 RCS。对所有 $m_s\in\{1,\ldots,M_s\}$ 把 $S(\mathcal P_{m_s},\mathbf a_I,\mathbf a_R)$ 代入（6），即得所有 $s\in\{1,\ldots,S\}$ 的 $\Xi(\mathbf q_T,\mathbf q_R)$。此外，在实际仿真（如射线追踪 [11]）中可取 $\varphi_s\simeq\frac{2\pi}{\lambda}(\|\Delta\breve{\mathbf q}_s\|+\|\Delta\tilde{\mathbf q}_s\|)$，因为由引理 2 有 $\|\Delta\breve{\mathbf q}_s\|,\|\Delta\tilde{\mathbf q}_s\|\gg\lambda$。以下各节提出一种从 $\mathcal H$ 推断 $\mathbf m$ 的迭代算法并验证其性能。

**图 3**：位置任意的面片示意，其参数为 $\mathcal P$，且 $\|\mathbf q\|$ 与 $\|\Delta\mathbf q\|$ 满足引理 2 的远场约束。

## IV. 材料重建

本节提出一种基于迭代梯度下降的算法求解材料重建问题。

### A. 评价指标与损失函数

为通过路径增益与时延综合评价由基于（1）（4）的材料 $\mathbf m^{(t)}\in\mathbb R^{2S\times1}$ 在第 $t\in\{1,2,\cdots,T_{\max}\}$ 次迭代诱导的信道 $\hat h^{(t)}(\mathbf q_T,\mathbf q_n,\tau)$ 与测量 $h(\mathbf q_T,\mathbf q_n,\tau)\in\mathcal H$ 之间的差异，采用均方根（RMS）时延扩展作为度量：

$$
\tau_{\mathrm{RMS}}\left(h(\mathbf q_T,\mathbf q_R,\tau)\right)=\sqrt{\frac{\sum_{s=1}^{S}|h_s(\mathbf q_T,\mathbf q_R)|^2(\tau_s-\bar\tau)^2}{\sum_{s=1}^{S}|h_s(\mathbf q_T,\mathbf q_R)|^2}},\tag{32}
$$

其中 $\bar\tau=\sum_{s=1}^{S}|h_s(\mathbf q_T,\mathbf q_R)|^2\tau_s/\sum_{s=1}^{S}|h_s(\mathbf q_T,\mathbf q_R)|^2$。平均绝对平方误差（MASE）定义为

$$
M(x,\hat x)=|x-\hat x|^2/|x|^2.\tag{33}
$$

于是加权损失函数为

$$
\mathcal L(\mathcal H,\mathbf m^{(t)})=\frac{\sum_{n=1}^{N}w_nM\left(\tau_{\mathrm{RMS}}(\hat h^{(t)}),\tau_{\mathrm{RMS}}(h)\right)}{\sum_{n=1}^{N}w_n},\tag{34}
$$

其中 $\hat h^{(t)}$ 与 $h$ 分别表示 $\hat h^{(t)}(\mathbf q_T,\mathbf q_R,\tau)$ 与 $h(\mathbf q_T,\mathbf q_R,\tau)$；权重 $w_n\in\mathbb R_+$ 为

$$
w_n=\exp\left(M\left(\tau_{\mathrm{RMS}}(h(\mathbf q_T,\mathbf q_n,\tau)),\tau_{\mathrm{RMS}}(\hat h^{(t)}(\mathbf q_T,\mathbf q_n,\tau))\right)\right),\tag{35}
$$

其目的是优先优化偏差较大的位置。

### B. 优化问题与所提算法

材料重建问题可表述为通过调整 $\mathbf m$ 最小化 $N$ 个样本上的 MASE：

$$
\begin{aligned}
\min_{\mathbf m}\ &\mathcal L(\mathcal H,\mathbf m)\\
\text{s.t.}\ &\varepsilon_s\ge1,\quad s\in\{1,2,\cdots,S\},\\
&\sigma_s>0,\quad s\in\{1,2,\cdots,S\}.
\end{aligned}\tag{36}
$$

由于（4）（6）（22）与引理 1 中表达式复杂，加之平方根与复数域带来的额外复杂性 [21]，难以获得闭式解。因此我们提出一种迭代梯度下降算法，以可容忍的复杂度近似求解（36）。损失函数 $\mathcal L(\mathcal H,\mathbf m^{(t)})$ 关于材料 $\mathbf m$ 的梯度为

$$
\nabla_{\mathbf m}\mathcal L(\mathcal H,\mathbf m^{(t)})=\left[\frac{\partial\mathcal L}{\partial\varepsilon_1},\frac{\partial\mathcal L}{\partial\sigma_1},\cdots,\frac{\partial\mathcal L}{\partial\varepsilon_S},\frac{\partial\mathcal L}{\partial\sigma_S}\right]^T\in\mathbb R^{2S\times1},\tag{37}
$$

可借助自动梯度算法方便地获得。于是基于梯度下降的更新为

$$
\mathbf m^{(t+1)}=\mathcal U\left(\mathbf m^{(t)}-\mu^{(t)}\nabla_{\mathbf m}\mathcal L(\mathcal H,\mathbf m^{(t)})\right),\tag{38}
$$

其中 $\mu^{(t)}=\mathcal U\left(\frac{\mathcal L(\mathcal H,\mathbf m^{(t)})}{\mathcal L(\mathcal H,\mathbf m^{(0)})}\right)\mu^{(0)}\in[\mu_{\min},\mu_{\max}]$ 为学习率；$\mathcal U(\cdot)$ 与 $\mathcal U(\cdot)$ 分别为限制 $\mu^{(t)}$ 与 $\mathbf m$ 的步长效用函数。最后，基于前几节的内容，材料重建算法如算法 1 所示。

**算法 1**　基于梯度下降的材料重建

1: **输入**：$S$、$\forall s$ 的 $M_s$、$\mathcal H$、$\mu^{(0)}$、$\mu_{\min}$、$\mu_{\max}$、$T_{\max}$、$\mathbf q_T$；
2: 初始化 $\mathbf m^{(0)}\in\mathbb R^{2S\times1}$、$t=0$；
3: **while** $t<T_{\max}$ **do**
4: 　基于 $\mathbf m^{(t)}$ 用（4）计算 $\hat h^{(t)}(\mathbf q_T,\mathbf q_n,\tau)$，$n\in\{1,\cdots,N\}$；
5: 　基于（34）计算 $\mathcal L(\mathcal H,\mathbf m^{(t)})$；
6: 　基于 $\mathcal L(\mathcal H,\mathbf m^{(t)})$ 与 $\mathcal L(\mathcal H,\mathbf m^{(0)})$ 计算 $\mu^{(t)}$；
7: 　通过自动梯度计算（37）中的 $\nabla_{\mathbf m}\mathcal L(\mathcal H,\mathbf m^{(t)})$；
8: 　通过（38）更新材料 $\mathbf m^{(t+1)}$；
9: 　更新迭代 $t=t+1$；
10: **end while**
11: 获得优化后的材料 $\mathbf m^{T_{\max}}$；
12: 获得最终损失函数 $\mathcal L(\mathcal H,\mathbf m^{T_{\max}})$；
13: **输出**：$\mathbf m^{T_{\max}}$、$\mathcal L(\mathcal H,\mathbf m^{T_{\max}})$。

其中旋转矩阵 $\mathbf R(\eta,\vartheta,\xi)$ 由下式给出：

$$
\mathbf R(\eta,\vartheta,\xi)=\begin{bmatrix}\cos\eta&-\sin\eta&0\\ \sin\eta&\cos\eta&0\\ 0&0&1\end{bmatrix}\times\begin{bmatrix}\cos\vartheta&0&\sin\vartheta\\ 0&1&0\\ -\sin\vartheta&0&\cos\vartheta\end{bmatrix}\times\begin{bmatrix}1&0&0\\ 0&\cos\xi&-\sin\xi\\ 0&\sin\xi&\cos\xi\end{bmatrix}\tag{31}
$$

### C. CKM 生成的定量指标

CKM 精度通过 $M\times K$ MIMO 系统的可达速率 $R(\mathcal H)$ 定量评估，其中 $\mathbf H$ 表示真实信道矩阵，$\hat{\mathbf H}_{\mathrm{ITU}}$ 与 $\hat{\mathbf H}_{R}$ 分别是用 Sionna 射线追踪 [11] 基于默认 ITU 材料与重建材料得到的信道矩阵。噪声功率 $N_0$ 下 $\mathbf H$ 的容量为

$$
C(\mathbf H)=\log_2\left|\mathbf I_{M\times M}+\frac{1}{N_0}\mathbf H\mathbf V\mathbf Q(\mathbf H)\mathbf V^H\mathbf H^H\right|,\tag{39}
$$

其中 $\mathbf H=\mathbf U\boldsymbol\Sigma\mathbf V^H$ 为奇异值分解（SVD）；$\mathbf Q\in\mathbb R^{K\times K}$ 为对角注水功率分配矩阵，$[\mathbf Q]_{(k,k)}=\max\left(\mathrm{SNR}N_0/r+\sum_{n=1}^{r}N_0/rs_n^2-N_0/s_n^2,0\right)$，$r=\operatorname{rank}(\boldsymbol\Sigma)$，$s_n$ 为 $\boldsymbol\Sigma$ 的第 $n$ 个奇异值。发端使用由 CKM 生成的不完美 $\hat{\mathbf H}$ 时的可达速率为 [22]：

$$
R(\mathbf H)=\log_2\left|\mathbf I_{M\times M}+\frac{1}{N_0}\mathbf H\hat{\mathbf V}\mathbf Q(\hat{\mathbf H})\hat{\mathbf V}^H\mathbf H^H\right|,\tag{40}
$$

其中 $\hat{\mathbf H}=\hat{\mathbf U}\hat{\boldsymbol\Sigma}\hat{\mathbf V}^H$。百分比误差定义为

$$
\mathrm{err}(\mathbf H,\hat{\mathbf H})=\left(C(\mathbf H)-R(\hat{\mathbf H})\right)/C(\mathbf H).\tag{41}
$$

由于 $C(\mathbf H)\ge R(\hat{\mathbf H})$，有 $\mathrm{err}(\mathbf H,\hat{\mathbf H})\in[0,1)$；对 $N_{\mathrm{sam}}$ 个样本取平均以验证 CKM 的精度。

## V. 仿真结果

（22）中的散射体 RCS 在如下仿真参数下评估：$f_c=3.5$ GHz，$L_H\times L_V=0.39\ \mathrm{m}\times0.39\ \mathrm{m}$，$\mathbf q=[10\ \mathrm{m},10\ \mathrm{m},0]^T$，$\eta=\vartheta=\xi=0$，$\{\varepsilon,\sigma\}=\{1.5,10\}$，$\|\Delta\breve{\mathbf q}\|=d_R=10\sqrt{2}$ m，极化 $\gamma=\pi/2$，$(\phi_I,\theta_I)=(-45^\circ,60^\circ)$；把 $S(\mathcal P,\mathbf a_I,\mathbf a_R)$ 与全波物理光学（PO）和矩量法（MoM）结果 $S_{\mathrm{PO}}(\mathcal P,\mathbf a_I,\mathbf a_R)$、$S_{\mathrm{MoM}}(\mathcal P,\mathbf a_I,\mathbf a_R)$ [23] 比较。如图 4 所示，所提模型与全波仿真吻合良好，相对 PO 的 MASE 为 $-13.88$ dB。

材料重建在图 5 背景所示的三维环境中评估，其中 $S=6$ 个散射体的真实材料遵循 ITU 规范 [24]，$f_c=3.5$ GHz，$N=5$，$\mu^{(0)}=0.04$，$T_{\max}=500$，$\mathbf q_T=[0,0,0]^T$，$M\times K=8\times8$，$N_{\mathrm{sam}}=1{,}000$，$\mathrm{SNR}=90$ dB。比较图 5 中砖砌建筑与混凝土地面的 $\mathrm{err}(\mathbf H,\hat{\mathbf H}_{\mathrm{ITU}})$ 与重建材料的 $\mathrm{err}(\mathbf H,\hat{\mathbf H}_R)$，平均百分比误差从 11.66% 降到 4.39%，且 $\hat{\mathbf H}_R$ 与 $\mathbf H$ 的逐位置 MASE 中位数为 $-16.34$ dB，表明所提算法的有效性。

**图 4**：所提 RCS 模型与全波数值结果（PO 与 MoM）的比较，天顶观测角 $\theta_R=120^\circ$。
**图 5**：$\mathrm{err}(\mathbf H,\hat{\mathbf H}_{\mathrm{ITU}})$ 与 $\mathrm{err}(\mathbf H,\hat{\mathbf H}_R)$ 的比较。

## VI. 结论

本文提出一种材料感知信道模型，把材料属性与信道响应显式联系起来，并提出一种迭代梯度下降材料重建算法，经数值仿真验证，可用于高效 CKM 生成。

## 附录 A：引理 1 的证明

设 $\rho$ 表示方向 $\mathbf a_I$ 与 $\hat{\mathbf x}$ 之间的夹角，它与极化角 $\gamma$ 无关，由下式给出：

$$
\rho=\arccos\left(|\hat{\mathbf x}^T\mathbf a_I(\phi_I,\theta_I)|\right)=\arccos(\cos\phi_I\sin\theta_I).\tag{42}
$$

基于 Snell 定律 [19]，有

$$
\Gamma_\perp(\varepsilon,\sigma)=\frac{Z_0\cos\rho/\sqrt{\chi(\varepsilon,\sigma)}-Z_0\cos\rho_t}{Z_0\cos\rho/\sqrt{\chi(\varepsilon,\sigma)}+Z_0\cos\rho_t},\tag{43}
$$

$$
\Gamma_\parallel(\varepsilon,\sigma)=\frac{-Z_0\cos\rho+Z_0\cos\rho_t/\sqrt{\chi(\varepsilon,\sigma)}}{Z_0\cos\rho+Z_0\cos\rho_t/\sqrt{\chi(\varepsilon,\sigma)}},\tag{44}
$$

其中 $\sin\rho_t=\sqrt{1/\chi(\varepsilon,\sigma)}\sin\rho$；$Z_0\approx377\ \Omega$ 为真空波阻抗。（43）与（44）可直接给出（7）与（8），故引理 1 得证。

## 附录 B：定理 1 的证明

$\mathbf l$ 处的感应表面电流由下式给出：

$$
\mathbf J(\mathbf l)=\mathbf J_\perp(\mathbf l)+\mathbf J_\parallel(\mathbf l)\overset{(a)}{=}\hat{\mathbf x}\times\left(\mathbf H_I^\perp+\mathbf H_r^\perp+\mathbf H_I^\parallel+\mathbf H_r^\parallel\right),\tag{45}
$$

其中 $(a)$ 来自物理光学（PO）[19]；$\mathbf H_I^\perp,\mathbf H_r^\perp,\mathbf H_I^\parallel,\mathbf H_r^\parallel\in\mathbb C^{3\times1}$ 为垂直或平行极化入射与反射信号的磁相量。交互之后，$\mathbf l$ 处的反射电波相量 $\mathbf E_r(\mathbf l)\in\mathbb C^{3\times1}$ 由 Snell 定律 [19] 给出：

$$
\mathbf E_r(\mathbf l)=E_Ie^{-j\frac{2\pi}{\lambda}\mathbf a_I^T\mathbf l}\left(\Gamma_\perp(\varepsilon,\sigma)\sin\gamma\underbrace{\hat{\mathbf E}_r^\perp}_{\mathbf E_r^\perp\in\mathbb C^{3\times1}}+\Gamma_\parallel(\varepsilon,\sigma)\cos\gamma\underbrace{\hat{\mathbf E}_r^\parallel}_{\mathbf E_r^\parallel\in\mathbb C^{3\times1}}\right),\tag{46}
$$

其中 $\hat{\mathbf E}_r^\perp=\hat{\mathbf E}_\perp\in\mathbb R^{3\times1}$。于是有 [19]：

$$
\mathbf H_I^\perp=E_I\sin\gamma e^{-j\frac{2\pi}{\lambda}\mathbf a_I^T\mathbf l}(\mathbf a_I\times\hat{\mathbf E}_\perp)/Z_0\|\mathbf a_I\times\hat{\mathbf E}_\perp\|,\tag{47}
$$

$$
\mathbf H_r^\perp=E_I\Gamma_\perp\sin\gamma e^{-j\frac{2\pi}{\lambda}\mathbf a_I^T\mathbf l}(\tilde{\mathbf a}_I\times\hat{\mathbf E}_r^\perp)/Z_0\|\tilde{\mathbf a}_I\times\hat{\mathbf E}_r^\perp\|,\tag{48}
$$

$$
\mathbf H_I^\parallel=E_I\cos\gamma e^{-j\frac{2\pi}{\lambda}\mathbf a_I^T\mathbf l}(\mathbf a_I\times\hat{\mathbf x})/Z_0\|\mathbf a_I\times\hat{\mathbf x}\|,\tag{49}
$$

$$
\mathbf H_r^\parallel=-E_I\Gamma_\parallel\cos\gamma e^{-j\frac{2\pi}{\lambda}\mathbf a_I^T\mathbf l}(\mathbf a_I\times\hat{\mathbf x})/Z_0\|\mathbf a_I\times\hat{\mathbf x}\|,\tag{50}
$$

其中 $\tilde{\mathbf a}_I=\mathbf a_I\odot[-1,1,1]^T$。把（47）—（50）代入（45）即得（12）。

## 附录 C：定理 2 的证明

基于远场近似的 Stratton–Chu 方程 [19]，（13）中的散射波相量为

$$
E_s^\phi(\mathbf a_I,\mathbf a_R)\simeq\frac{-jkZ_0e^{-jkd_R}}{4\pi d_R}\iint_S\mathbf J^T(\mathbf l)\hat{\mathbf E}_s^\phi e^{jk\mathbf a_R^T\mathbf l}\,\mathrm ds,\tag{51}
$$

而 $E_s^\theta(\mathbf a_I,\mathbf a_R)$ 由把（51）中的 $\hat{\mathbf E}_s^\phi$ 替换为 $\hat{\mathbf E}_s^\theta$ 得到。把（12）代入（51）得

$$
I(\mathbf a_I,\mathbf a_R)=\int_{-\frac{L_V}{2}}^{\frac{L_V}{2}}\int_{-\frac{L_H}{2}}^{\frac{L_H}{2}}e^{j\frac{2\pi}{\lambda}(\mathbf a_R-\mathbf a_I)^T\mathbf l}\,\mathrm dl_y\,\mathrm dl_z,\tag{52}
$$

即得（16），故定理 2 得证。

## 图注与表注

**图 1**：含 $S$ 个散射体的多径无线信道，其中第 $s$ 个散射体被划分为 $M_s$ 个矩形面片。
**图 2**：尺寸为 $L_H\times L_V$ 的面片示意，相对介电常数与电导率分别为 $\varepsilon$ 与 $\sigma$。
**图 3**：位置任意的面片示意（参数 $\mathcal P$，满足引理 2 的远场约束）。
**图 4**：所提 RCS 模型与全波数值结果（PO 与 MoM）的比较（$\theta_R=120^\circ$）。
**图 5**：$\mathrm{err}(\mathbf H,\hat{\mathbf H}_{\mathrm{ITU}})$ 与 $\mathrm{err}(\mathbf H,\hat{\mathbf H}_R)$ 的比较。

**表注**：本文原**无表格**（仅含图 1—5 与算法 1），故无逐格表格转录项；算法 1 已按原文逐行转录。

## 参考文献

> 以下按原文编号 [1]—[24] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “¨”“´” 等变音伪影已按常规写法整理，书目内容未改动。

[1] C.-X. Wang, X. You, X. Gao et al., “On the Road to 6G: Visions, Requirements, Key Technologies, and Testbeds,” IEEE Commun. Surv. Tutorials, vol. 25, no. 2, pp. 905–974, 2023.

[2] X. Zhu, Z. Zhou, Z. Dong, and Y. Zeng, “Cost-Effective XL-MIMO Communication With Cylinder Directly Connected Antenna Array,” IEEE Trans. Wireless Commun., vol. 25, pp. 17 559–17 575, 2026.

[3] Q. Dai, Y. Zeng, H. Wang et al., “A Tutorial on MIMO-OFDM ISAC: From Far-Field to Near-Field,” IEEE Commun. Surv. Tutorials, vol. 28, pp. 4319–4358, 2026.

[4] Z. Wang, J. Zhang, H. Du et al., “A Tutorial on Extremely Large-Scale MIMO for 6G: Fundamentals, Signal Processing, and Applications,” IEEE Commun. Surv. Tutorials, vol. 26, no. 3, pp. 1560–1605, 2024.

[5] Y. Zeng, J. Chen, J. Xu et al., “A Tutorial on Environment-Aware Communications via Channel Knowledge Map for 6G,” IEEE Commun. Surv. Tutorials, vol. 26, no. 3, pp. 1478–1519, 2024.

[6] J. Wang, J. Zhang, Y. Zhang et al., “Radio Environment Knowledge Pool for 6G Digital Twin Channel,” IEEE Commun. Mag., vol. 63, no. 5, pp. 158–164, 2025.

[7] E. Dall’Anese, S.-J. Kim, and G. B. Giannakis, “Channel Gain Map Tracking via Distributed Kriging,” IEEE Trans. Veh. Technol., vol. 60, no. 3, pp. 1205–1211, 2011.

[8] S. Chouvardas, S. Valentin, M. Draief, and M. Leconte, “A method to reconstruct coverage loss maps based on matrix completion and adaptive sampling,” in 2016 IEEE ICASSP, 2016, pp. 6390–6394.

[9] S. Fu, Y. Zeng, Z. Wu et al., “CKMDiff: A generative diffusion model for CKM construction via inverse problems with learned priors,” npj Wireless Technology, vol. 2, no. 35, 2026.

[10] Z. Huang, Y. Zeng, S. Fu et al., “Channel Knowledge Map Construction via Guided Flow Matching,” IEEE Wireless Commun. Lett., vol. 15, pp. 3159–3163, 2026.

[11] J. Hoydis, S. Cammerer, F. Ait Aoudia et al., “Sionna,” 2022.

[12] G. Schwartz and K. Nishino, “Recognizing Material Properties from Images,” 2018. [Online]. Available: https://arxiv.org/abs/1801.03127

[13] Y. Jiang, F. Gao, and S. Jin, “Electromagnetic Property Sensing: A New Paradigm of Integrated Sensing and Communication,” IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13 471–13 483, 2024.

[14] 3rd Generation Partnership Project (3GPP), 5G; Study on Channel Model for Frequencies from 0.5 to 100 GHz document 38.901, Version 19.1.0, Technical Report (TR). 3GPP, Sep. 2025.

[15] H. Gong, J. Zhang et al., “New Characteristics and Modeling of 6G Channels: Toward a Unified Channel Model for Standardization,” IEEE Veh. Technol. Mag., vol. 20, no. 3, pp. 68–77, 2025.

[16] C. X. Wang et al., “An enhanced 6G pervasive channel model towards standardization,” Sci. China Inf. Sci., vol. 68, 2025.

[17] C.-X. Wang et al., “A Survey of 5G Channel Measurements and Models,” IEEE Commun. Surv. Tutorials, vol. 20, no. 4, pp. 3142–3168, 2018.

[18] Z. Xu, Z. Zhou, D. Wu et al., “CKM-Enabled Joint Spatial–Doppler Domain Clutter Suppression for Low-Altitude UAV ISAC,” IEEE Internet Things J., vol. 13, no. 14, pp. 31 752–31 767, 2026.

[19] C. A. Balanis, Advanced Engineering Electromagnetics, 2nd ed. John Wiley & Sons, 2012.

[20] W. Gordon, “Near field calculations with far field formulas,” in IEEE Antennas and Propagation Society International Symposium. 1996 Digest, vol. 2, 1996, pp. 950–953 vol.2.

[21] S. Boyd and L. Vandenberghe, Convex Optimization. Cambridge University Press, 2004.

[22] E. Björnson and Ö. T. Demir, Introduction to Multiple Antenna Communications and Reconfigurable Surfaces. Boston-Delft: Now Publishers, 2024. [Online]. Available: https://doi.org/10.1561/9781638283157

[23] S. Rao, D. Wilton, and A. Glisson, “Electromagnetic scattering by surfaces of arbitrary shape,” IEEE Transactions on Antennas and Propagation, vol. 30, no. 3, pp. 409–418, 1982.

[24] ITU-R, “Effects of building materials and structures on radiowave propagation above about 100 MHz,” International Telecommunication Union, Recommendation ITU-R P.2040-2, 2021.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；第 I 节引言；第 II 节系统模型（式（1）—（3），注 1，图 1）；第 III 节材料感知信道模型（III-A 与材料相关的信道响应：式（4）—（6）；III-B 面片 RCS 闭式表达：引理 1（式 7—8）、式（9）—（11）、定理 1（式 12）、式（13）—（15）、定理 2（式 14—20）、式（21）、推论 1（式 22）、注 2—3、式（23）—（30），图 2—3）；第 IV 节材料重建（A 评价指标与损失函数：式（32）—（35）；B 优化问题与算法：式（36）—（38）、式（31）、算法 1；C CKM 生成定量指标：式（39）—（41），图 4—5）；第 V 节仿真结果；第 VI 节结论；附录 A—C（式（42）—（52））；图 1—5 图注与表注；参考文献 [1]—[24] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—5 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③**原文无表格**，故无表格逐格转录项；④作者简介与版权声明不在正文范围，未收录；⑤原文式（31）（旋转矩阵）在 PDF 中排于页 4 顶部（与式中引用顺序错位），译文按其编号置于算法 1 之后并注明；⑥骨架版本日期 "2026-09-17" 与 PDF 实际 v1 2026-09-08 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
