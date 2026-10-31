---
layout: page
title: "DiffusionPDE：部分观测下的生成式 PDE 求解｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-05-diffusionpde-generative-pde-solving-under-partial-observation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/ba460c43d2ee064a/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# DiffusionPDE：部分观测下的生成式 PDE 求解

**原题：** DiffusionPDE: Generative PDE-Solving Under Partial Observation  
**作者：** Jiahe Huang<sup>1</sup>、Guandao Yang<sup>2</sup>、Zichen Wang<sup>1</sup>、Jeong Joon Park<sup>1</sup>  
**单位：** 1 密歇根大学（University of Michigan）；2 斯坦福大学（Stanford University）；邮箱：{chloehjh, zzzichen, jjparkcv}@umich.edu、guandao@stanford.edu。  
**版本：** 会议论文集版本（NeurIPS-2024-diffusionpde-generative-pde-solving-under-partial-observation-Paper-Conference.pdf），本地 PDF 33 页；第 38 届神经信息处理系统大会（NeurIPS 2024）。**再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。**  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节及全部小节（2、3.1–3.3、4.1–4.7）、式 (1)–(14)、算法 1、表 1（逐格转写）、图 1–7 图注、附录 A 的结构化说明（表 2–9、图 8–23 图注速览）、参考文献 [1]–[60]（英文原条目）均按原文结构录入；逐句逐式终校未做。

## 摘要

我们提出一个利用生成式扩散模型求解偏微分方程（PDE）的通用框架。特别地，我们关注无法获得应用经典求解器所需完整场景知识的场景。现有前向或逆向 PDE 方法在数据观测或底层系数不完整时表现不佳，而后者（观测不完整）是真实测量的常见假设。本文提出 **DiffusionPDE**：通过对解空间与系数空间的**联合分布**建模，在求解 PDE 的同时**补全缺失信息**。我们表明，所学生成先验构成一个通用框架，可在部分观测下准确求解广泛 PDE，并在前向与逆向两个方向上都显著优于现有最先进方法。项目页面：jhhuangchloe.github.io/Diffusion-PDE/ 。

## 1. 引言

偏微分方程（PDE）是现代科学的基石，支撑了大量解释自然现象的当代物理理论。求解 PDE 使我们能够预测系统的未来状态（前向过程），并从状态测量中估计底层物理性质（逆过程）。迄今为止，已有大量方法 [1, 2] 被提出用于数值求解前向与逆向 PDE。然而经典方法可能极其缓慢，这推动了数据驱动、基于学习的求解器的发展——它们显著更快，并能处理一族 PDE。这些基于学习的方法 [3–6] 通常用深度神经网络学习输入系数与其解之间的确定性映射。

尽管取得进展，现有基于学习的方法与经典求解器一样，依赖对系数的**完整观测**来完成到解的映射。然而，关于底层物理性质或系统状态的完整信息很少可得；现实中大多数测量在空间与时间上都是**稀疏**的。经典求解器与最先进的数据驱动模型往往忽视这些情形，因而在部分观测下失效。这一局限使它们主要局限于合成仿真——在那里完整场景配置是设计时给定的，使其难以用于真实世界。

我们提出一个综合框架 **DiffusionPDE**，用于在高度部分观测（通常只有总信息的 1~3%）下求解前向与逆向 PDE。该任务尤其困难，因为补全缺失数据并找出后续解的方式有无数种。我们的方法用生成模型刻画系数空间与解空间的联合分布，从而有效管理不确定性并同时重建这两个空间。推理时，我们采样随机噪声并按标准扩散模型 [7] 迭代去噪；但独特地，我们用**稀疏观测**与**相关 PDE 约束**引导该去噪过程，产生既合理又满足约束的输出。值得注意的是，DiffusionPDE 能用**单个预训练生成网络**处理任意密度与模式的观测。

我们开展大量实验表明 DiffusionPDE 作为通用 PDE 求解框架的多功能性，在多种静态与含时 PDE 上评估，包括 Darcy Flow、Poisson、Helmholtz、Burgers 与 Navier-Stokes 方程。在稀疏测量下，DiffusionPDE 在前向与逆向方向上均显著优于现有最先进的基于学习的 PDE 方法 [3–6, 8]，而在完整观测下达到可比结果。一个突出示例：DiffusionPDE 仅用**五个传感器**的时序数据即可准确重建 Burgers 方程的完整状态（图 4），这提示生成模型有潜力革新真实应用中的物理建模。

**图 1（原文 Figure 1）：** 所提 DiffusionPDE——部分观测下的生成式 PDE 求解器。给定系数（初始状态）\(a\) 与解（最终状态）\(u\) 构成的 PDE 族，我们在二者的联合分布上训练扩散模型；推理时，我们按标准扩散模型逐步去噪一个高斯噪声，并以稀疏观测与已知 PDE 函数为引导，恢复与稀疏观测及给定方程都吻合的 \(a\) 和 \(u\) 的完整预测。

## 2. 相关工作

本文建立在三个领域的丰富文献之上：前向 PDE 求解器、逆向 PDE 求解器与扩散模型（相关综述见 [9–13]）。

**前向 PDE 求解器。** PDE 求解器给定物理系统的规格，通过求解含偏导数的方程来预测其在未见的空间与时间处的状态。由于多数 PDE 难以解析求解，人们诉诸数值技术，如有限元法 [14, 2] 与边界元法 [1, 15]。这些技术在某些问题上表现强、通用性好，但计算代价高、或难以针对复杂物理系统搭建。

近来深度学习的进展启发了新一代 PDE 求解器。Raissi 等 [16, 6] 提出物理知情神经网络（PINNs），用 PDE 约束作为自监督损失优化神经网络以输出 PDE 解；PINNs 已被扩展到特定流体 [17, 18]、Reynolds 平均 Navier–Stokes 方程 [19]、热方程 [20] 与动态电力系统 [21]。PINNs 能处理广泛的复杂 PDE 问题，但由于需要网络优化而难以扩展。另一类方法**神经算子** [3, 5] 直接学习从 PDE 参数（如初始与边界条件）到解函数的映射；训练完成后可避免昂贵的网络优化、即时输出解。该思想已被扩展到 3D PDE [22, 23]、多相流 [24]、地震波 [25, 26]、3D 湍流 [27, 28] 与球面动力学 [29]。也有人探索把神经网络作为 PDE 求解器的一部分，如压缩物理状态 [30–33]。这些求解器通常假设 PDE 参数已知，将其用于求解逆问题颇具挑战。

**PDE 逆问题。** 逆问题指寻找能诱导特定观测的 PDE 系数，即从 PDE 求解器的解映射回其输入参数。人们尝试把传统数值方法扩展到该逆问题 [34–38]，但这些扩展难以高效实现。也有把深度学习 PDE 求解器反演的类似尝试：例如可通过优化网络参数使其输出同时满足观测数据与控制方程来反演 PINNs；iFNO [39] 与 NIO [40] 试图扩展 FNO [3]；其他方法 [41, 42] 直接为逆问题学习算子函数；PINO [4] 进一步把神经算子与物理约束结合以改善前向与逆问题性能。这些方法都假设**完整观测**可得。为处理部分观测下的逆问题，人们尝试利用图神经网络 [43, 8] 的生成先验；这些工作尚未展示求解高分辨率 PDE 的能力，可能受限于生成先验的强度。我们希望利用最先进的生成模型——扩散模型——来开发更好的逆 PDE 求解器。

**扩散模型。** 扩散模型通过逐步估计并去除噪声，在学习高分辨率先验方面展现出巨大潜力。DDIM [44]、DDPM [7] 与 EDM [45] 等模型提供了强大的生成能力，但在带特定约束采样时面临挑战。引导扩散模型 [46–49] 以图像补全等约束增强生成过程，提供更稳定准确的解。针对 PDE 的扩散模型先前工作凸显了扩散方法的潜力：用扩散模型生成 3D 湍流 [50, 51] 与 Navier-Stokes 方程 [52] 等 PDE 数据集；扩散模型也可用于对频谱建模并对解空间去噪 [53]；条件扩散模型被用于在稀疏观测下求解 2D 流动 [54]。然而，把扩散模型用于部分观测下的逆问题仍研究不足。本文旨在朝弥补该缺口迈出第一步。

## 3. 方法

### 3.1 概览

为在不确定性下求解物理知情的前向与逆向问题，我们首先在一族偏微分方程（PDE）上预训练一个扩散生成模型。该模型被设计用于学习 PDE 系数（或初始状态）与其相应解（或最终状态）的**联合分布**。我们的方法利用来自任一侧或两侧的稀疏观测来恢复两个空间的完整数据；实现方式与常规扩散模型一样对随机高斯噪声迭代去噪，但在去噪过程中额外受稀疏观测与 PDE 函数的引导。图 1 给出方法示意，细节见下节。

### 3.2 预备：扩散模型与引导扩散

扩散模型包含一个预定义的前向过程（逐步向数据添加高斯噪声）与一个学习到的反向过程（去噪数据以重建原始分布）。具体地，Song 等 [55] 提出一种确定性扩散模型，学习 \(N\) 步去噪过程、最终输出去噪数据 \(\mathbf x_N\)，并在每个时间步 \(t_i\)（\(i\in\{0,1,\ldots,N-1\}\)）满足如下常微分方程（ODE）：

$$
{\rm d}\mathbf x=-\dot\sigma(t)\sigma(t)\nabla_{\mathbf x}\log p\left(\mathbf x;\sigma(t)\right){\rm d}t.\tag{1}
$$

这里 \(\nabla_{\mathbf x}\log p(\mathbf x;\sigma(t))\) 是分数函数 [56]，用于把来自正态分布 \(\mathcal N(\mathbf 0,\sigma(t_0)^2\mathbf I)\) 的样本变换到目标概率分布 \(p(\mathbf x;\sigma(t))\)。为估计分数函数，Karras 等 [45] 提出学习去噪函数 \(D(\mathbf x;\sigma)\)，使得

$$
\nabla_{\mathbf x}\log p\left(\mathbf x;\sigma(t)\right)=\frac{D(\mathbf x;\sigma(t))-\mathbf x}{\sigma(t)^2}.\tag{2}
$$

为控制生成数据，引导扩散方法 [48] 在去噪过程中向分数函数加入引导梯度：

$$
{\rm d}\mathbf x=-\dot\sigma(t)\sigma(t)\left[\nabla_{\mathbf x}\log p\left(\mathbf x;\sigma(t)\right)+\nabla_{\mathbf x}\log p\left(\mathbf y|\mathbf x;\sigma(t)\right)\right]{\rm d}t.\tag{3}
$$

DPS [46] 表明，在稀疏测量算子 \(M(\cdot)\) 的高斯噪声假设 \(\mathbf y|\mathbf x\sim\mathcal N(M(\mathbf x),\delta^2\mathbf I)\)（标准差为 \(\delta\)）下，对数似然可近似为

$$
\nabla_{\mathbf x_i}\log p\left(\mathbf y|\hat{\mathbf x}_N^i;\sigma(t_i)\right)\approx-\frac{1}{\delta^2}\nabla_{\mathbf x_i}\left\|\mathbf y-M(\hat{\mathbf x}_N^i(\mathbf x_i;\sigma(t_i)))\right\|_2^2,\tag{4}
$$

其中 \(\hat{\mathbf x}_N^i:=D(\mathbf x_i;\sigma(t_i))\) 表示每个去噪步 \(i\) 处对最终去噪数据的估计。由 Bayes 规则，引导扩散的梯度方向为

$$
\nabla_{\mathbf x_i}\log p(\mathbf x_i|\mathbf y)\approx s(\mathbf x_i)-\zeta\nabla_{\mathbf x_i}\left\|\mathbf y-M(\hat{\mathbf x}_N^i)\right\|_2^2,\tag{5}
$$

其中 \(s(\mathbf x)=\nabla_{\mathbf x}\log p(\mathbf x)\) 为原始分数函数，\(\zeta=1/\delta^2\)。

**算法 1：稀疏观测与 PDE 引导扩散采样算法**

- 输入：确定性采样器 \(D_\theta(\mathbf x;\sigma)\)、噪声调度 \(\sigma(t_i), i\in\{0,\ldots,N\}\)、总点数 \(m\)、观测点数 \(n\)、观测 \(\mathbf y\)、PDE 函数 \(f\)、权重 \(\zeta_{\rm obs}\) 与 \(\zeta_{\rm pde}\)。
1. 生成初始采样噪声。
2. 对每个去噪步 \(i\)：估计当前步最终去噪数据 \(\hat{\mathbf x}_N^i\leftarrow D_\theta(\mathbf x_i;\sigma(t_i))\)；计算 \(\frac{{\rm d}\mathbf x}{{\rm d}\sigma(t)}=-\dot\sigma(t)\sigma(t)\nabla_{\mathbf x}\log p(\mathbf x;\sigma(t))\big/\sigma(t_i)\) 作为方向 \(\mathbf d_i\)；按 Euler 步 \(\mathbf x_{i+1}\leftarrow\mathbf x_i+(\sigma(t_{i+1})-\sigma(t_i))\mathbf d_i\) 从 \(\sigma(t_i)\) 走到 \(\sigma(t_{i+1})\)。
3. 计算 \(\mathbf d_{i+1}\)（若 \(\sigma=0\) 则省略），按梯形规则作二阶相关修正。
4. 在 \(\hat{\mathbf x}_N^i\) 上评估观测损失 \(\mathcal L_{\rm obs}\) 与 PDE 损失 \(\mathcal L_{\rm pde}\)。
5. 以引导项更新：\(\mathbf x_{i+1}\leftarrow\mathbf x_{i+1}-\zeta_{\rm obs}\nabla_{\mathbf x_i}\mathcal L_{\rm obs}-\zeta_{\rm pde}\nabla_{\mathbf x_i}\mathcal L_{\rm pde}\)。
6. 返回去噪数据 \(\mathbf x_N\)。

### 3.3 用引导扩散求解 PDE

本文关注两类 PDE：静态 PDE 与动态含时 PDE。

**静态系统**（如 Darcy Flow 或 Poisson 方程）由与时间无关的函数 \(f\) 定义：

$$
f(\mathbf c;\mathbf a,\mathbf u)=0\ \text{in}\ \Omega\subset\mathbb R^d,\qquad \mathbf u(\mathbf c)=g(\mathbf c)\ \text{in}\ \partial\Omega,\tag{6}
$$

其中 \(\Omega\) 为有界域、\(\mathbf c\in\Omega\) 为空间坐标、\(\mathbf a\in\mathcal A\) 为 PDE 系数场、\(\mathbf u\in\mathcal U\) 为解场；\(\partial\Omega\) 为域边界，\(\mathbf u|_{\partial\Omega}=g\) 为边界约束。我们目标是从 \(\mathbf a\) 或 \(\mathbf u\) 或两者的稀疏观测中同时恢复 \(\mathbf a\) 与 \(\mathbf u\)。

**动态系统**（如 Navier-Stokes）类似地定义为

$$
f(\mathbf c,\tau;\mathbf a,\mathbf u)=0\ \text{in}\ \Omega\times(0,\infty),\quad \mathbf u(\mathbf c,\tau)=g(\mathbf c,\tau)\ \text{in}\ \partial\Omega\times(0,\infty),\quad \mathbf u(\mathbf c,\tau)=\mathbf a(\mathbf c,\tau)\ \text{in}\ \overline\Omega\times\{0\},\tag{7}
$$

其中 \(\tau\) 为时间坐标，\(\mathbf a=\mathbf u_0\in\mathcal A\) 为初始条件、\(\mathbf u\) 为解场、\(\mathbf u|_{\Omega\times(0,\infty)}=g\) 为边界约束。我们目标是从 \(\mathbf a\)、\(\mathbf u_T\) 或两者的稀疏观测中同时恢复 \(\mathbf a\) 与特定时刻 \(T\) 的解 \(\mathbf u_T:=\mathbf u(\cdot,T)\)。

最后，我们探索在一维动态系统（由 Burgers 方程支配）中恢复**所有时间步**的状态 \(\mathbf u_{0:T}\)：网络 \(D_\theta\) 建模所有一维状态（含初始条件 \(\mathbf u_0\) 与按时间维拼接的解 \(\mathbf u_{1:T}\)，形成二维表示）的分布。

我们通过在一个预训练扩散模型 \(D_\theta\) 上联合学习 \(\mathcal A\) 与 \(\mathcal U\) 的分布（在通道维拼接，记 \(\mathcal X:=\mathcal A\times\mathcal U\)、数据 \(\mathbf x\in\mathcal X\)）来实现上述目标，训练遵循典型扩散模型流程 [45]。

训练完成后，我们在推理时采用物理知情 DPS [46] 表述，引导采样出满足稀疏观测与给定 PDE 的 \(\mathbf x\in\mathcal X\)，详见算法 1。按式 (5)，我们用两项引导修改分数函数：

$$
\nabla_{\mathbf x_i}\log p(\mathbf x_i|\mathbf y_{\rm obs},f)\approx\nabla_{\mathbf x_i}\log p(\mathbf x_i)-\zeta_{\rm obs}\nabla_{\mathbf x_i}\mathcal L_{\rm obs}-\zeta_{\rm pde}\nabla_{\mathbf x_i}\mathcal L_{\rm pde},\tag{8}
$$

其中 \(\mathbf x_i\) 为去噪步 \(i\) 的含噪数据、\(\mathbf y_{\rm obs}\) 为观测值、\(f(\cdot)=0\) 为 PDE 约束；观测损失为

$$
\mathcal L_{\rm obs}=\left\|\mathbf y_{\rm obs}-M(\hat{\mathbf x}_N^i)\right\|_2^2,\qquad \mathcal L_{\rm pde}=\frac{1}{m}\sum_j\sum_k f(\mathbf c_j,\tau_k;\hat{\mathbf u}_j,\hat{\mathbf a}_j)^2,\tag{9}
$$

其中 \(\hat{\mathbf x}_N^i\) 为当前步对最终去噪数据的估计，\(m\) 为 PDE 残差评估点总数。

## 4. 实验

### 4.1 PDE 问题设置

我们在多种 PDE 上验证 DiffusionPDE 在前向与逆向问题上的有效性，并与近期基于学习的技术比较。所测试的 PDE 族如下。

**Darcy Flow。** Darcy 流描述流体在多孔介质中的运动。实验中考虑带无滑移边界 \(\partial\Omega\) 的静态 Darcy 流：

$$
-\nabla\cdot(\mathbf a(\mathbf c)\nabla\mathbf u(\mathbf c))=\mathbf q(\mathbf c),\ \mathbf c\in\Omega,\qquad \mathbf u(\mathbf c)=0,\ \mathbf c\in\partial\Omega.\tag{10}
$$

其中系数 \(\mathbf a\) 取二值，\(\mathbf q(\mathbf c)=1\) 表示常值外力；PDE 引导函数为 \(f=\nabla\cdot(\mathbf a(\mathbf c)\nabla\mathbf u(\mathbf c))+\mathbf q(\mathbf c)\)。

**非齐次 Helmholtz 方程。** 考虑带无滑移边界 \(\partial\Omega\) 的静态非齐次 Helmholtz 方程（描述波传播）：

$$
\nabla^2\mathbf u(\mathbf c)+k^2\mathbf u(\mathbf c)=\mathbf a(\mathbf c),\ \mathbf c\in\Omega,\qquad \mathbf u(\mathbf c)=0,\ \mathbf c\in\partial\Omega.\tag{11}
$$

其中系数 \(\mathbf a\) 为分片常数、\(k\) 为常数；注意当 \(k=0\) 时式 (11) 即 Poisson 方程。取 \(k=1\) 时 PDE 引导函数为 \(f=\nabla^2\mathbf u(\mathbf c)+k^2\mathbf u(\mathbf c)-\mathbf a(\mathbf c)\)。

**无界 Navier-Stokes 方程。** 研究关于涡量的无界不可压 Navier-Stokes 方程：

$$
\partial_t\mathbf w(\mathbf c,\tau)+\mathbf v(\mathbf c,\tau)\cdot\nabla\mathbf w(\mathbf c,\tau)=\nu\Delta\mathbf w(\mathbf c,\tau)+\mathbf q(\mathbf c),\ \mathbf c\in\Omega,\tau\in(0,T],\qquad \nabla\cdot\mathbf v(\mathbf c,\tau)=0,\ \mathbf c\in\Omega,\tau\in[0,T],\tag{12}
$$

其中 \(\mathbf w=\nabla\times\mathbf v\) 为涡量、\(\mathbf v(\mathbf c,\tau)\) 为 \(\tau\) 时刻 \(\mathbf c\) 处速度、\(\mathbf q(\mathbf c)\) 为力场。取粘性系数 \(\nu=10^{-3}\)、对应 Reynolds 数 \(Re=1\)。DiffusionPDE 学习 \(\mathbf w_0\) 与 \(\mathbf w_T\) 的联合分布，取 \(T=10\)（模拟 1 秒）。由于 \(T\gg0\)，无法从模型输出精确计算 PDE 损失；因此利用 \(\nabla\cdot\mathbf w(\mathbf c,\tau)=\nabla\cdot(\nabla\times\mathbf v)=0\)，采用简化 \(f=\nabla\cdot\mathbf w(\mathbf c,\tau)\)。

**有界 Navier-Stokes 方程。** 研究关于速度 \(\mathbf v\) 与压力 \(p\) 的有界二维不可压 Navier-Stokes 方程：

$$
\partial_t\mathbf v(\mathbf c,\tau)+\mathbf v(\mathbf c,\tau)\cdot\nabla\mathbf v(\mathbf c,\tau)+\frac{1}{\rho}\nabla p=\nu\nabla^2\mathbf v(\mathbf c,\tau),\ \mathbf c\in\Omega,\tau\in(0,T],\qquad \nabla\cdot\mathbf v(\mathbf c,\tau)=0,\ \mathbf c\in\Omega,\tau\in(0,T].\tag{13}
$$

取粘性系数 \(\nu=0.001\)、流体密度 \(\rho=1.0\)。我们在网格内随机位置生成随机半径的二维圆柱；随机湍流从网格上方流入，速度场在左右边缘以及圆柱周围 \(\partial\Omega_{\rm left,right,cylinder}\) 满足无滑移边界条件。DiffusionPDE 学习 \(T=4\)（模拟 0.4 秒）时 \(\mathbf v_0\) 与 \(\mathbf v_T\) 的联合分布，故同样采用 \(f=\nabla\cdot\mathbf v(\mathbf c,\tau)\)。

**Burgers 方程。** 研究单位长度一维空间域 \(\Omega=(0,1)\) 上带周期边界条件的 Burgers 方程，粘性 \(\nu=0.01\)：

$$
\partial_t\mathbf u(\mathbf c,\tau)+\partial_c(\mathbf u^2(\mathbf c,\tau)/2)=\nu\partial_{cc}\mathbf u(\mathbf c,\tau),\ \mathbf c\in\Omega,\tau\in(0,T],\qquad \mathbf u(\mathbf c,0)=\mathbf u_0(\mathbf c),\ \mathbf c\in\Omega.\tag{14}
$$

实验中初始条件 \(\mathbf u_0\) 形状为 \(128\times1\)，初始状态之后取 127 个时间步以形成 \(128\times128\) 的二维 \(\mathbf u_{0:T}\)。由于在时间维上建模稠密，我们可用有限差分可靠计算 \(f=\partial_t\mathbf u(\mathbf c,\tau)+\partial_c(\mathbf u^2(\mathbf c,\tau)/2)-\nu\partial_{cc}\mathbf u(\mathbf c,\tau)\)。

**图 2（原文 Figure 2）：** 与仅用前向/逆向 PDE 求解器不同，DiffusionPDE 可接收稀疏观测并同时重建系数与解（示意）。

**图 3（原文 Figure 3）：** PDE 损失的作用：可视化有无 PDE 损失时恢复的 Helmholtz 方程系数与解的绝对误差；比较仅用观测损失与额外施加 PDE 损失的情形，误差在使用 PDE 损失后显著下降。

### 4.2 数据集准备与训练

我们首先在**联合学习**前向映射 \(F:\mathcal A\to\mathcal U\) 与逆映射 \(I:\mathcal U\to\mathcal A\) 上测试 DiffusionPDE（给定稀疏观测）。实验中 PDE 定义在单位正方形 \(\Omega=(0,1)^2\) 上，表示为 \(128\times128\) 网格；训练数据由有限元法（FEM）生成。具体地，我们运行 FNO [3] 公开脚本生成 Darcy Flow 与 Navier-Stokes 方程的涡量，用二阶有限差分格式生成 Poisson 与 Helmholtz 数据集；为加入更复杂边界条件，用 Difftaichi [57] 生成有界 Navier-Stokes 的速度场。对每个 PDE，我们在三块 A40 GPU 上用 50,000 个数据对训练联合扩散模型约 4 小时。对 Burgers 方程，按 FNO [3] 所述流程生成 50,000 个样本的数据集并训练扩散模型；我们从 \(\Omega\) 上 128 个空间点中随机选 5 个作为沿时间提供测量的传感器。

### 4.3 基线方法

我们将 DiffusionPDE 与最先进的基于学习方法比较，包括 PINO [4]、DeepONet [5]、PINNs [6] 与 FNO [3]。但需注意，这些方法均未展示在部分观测上的运作能力：它们能在完整观测下学习 \(\mathbf a\) 与 \(\mathbf u\)、或 \(\mathbf u_0\) 与 \(\mathbf u_{1:T}\) 之间的映射，因而也能求解 \(\mathbf u_0\) 到 \(\mathbf u_T\) 的映射。PINNs 通过优化同时含解 \(\mathbf u\) 与 PDE 残差的组合损失，把输入 \(\mathbf a\) 映射为输出 \(\mathbf u\)；DeepONet 用分支网络编码在离散点采样的输入函数值、用主干网络处理评估输出坐标；FNO 用 Fourier 变换把参数空间映射到解空间；PINO 通过在训练中整合 PDE 损失、并用 PDE 损失微调来增强 FNO。我们在静态与动态 PDE 上、以对 \(\mathbf a\) 或 \(\mathbf u\) 的完整观测训练全部四个基线的前向与逆映射。我们也尝试在部分观测上训练基线，但观察到退化的训练结果（详见补充材料）；总体而言它们面向完整观测，可能不适于稀疏测量。

与本文更密切相关的是 GraphPDE [8]：它展示了用最终状态的稀疏观测恢复初始状态的能力，这是其他基线难以做到的。因此我们在有界 Navier-Stokes 方程的逆问题上与其比较（即其报告所用设定）。GraphPDE 使用训练好的隐空间模型与有界前向 GNN 模型以稀疏传感器求解逆问题，故与无界 Navier-Stokes 不兼容。我们用有界网格创建有界网格以训练 GNN，并用 \(\mathbf v_{0:T}\) 训练其隐先验。

虽然我们采用引导采样重建解，但分类器无关引导（CFG）[58] 提供了另一种思路：让扩散模型以稀疏输入数据为条件。Shu 等 [54] 扩展该方法，提出以 PDE 损失为条件的优化 CFG 方法、并把观测作为低分辨率输入；此外 OFormer [59] 是另一种用 Transformer 重建完整解的模型，推理运行时间更短。因此我们也在无界 Navier-Stokes 方程上与其比较。

### 4.4 主要评估结果

我们分别处理对 \(\mathbf a\) 或 \(\mathbf u\) 的稀疏观测下的前向与逆问题。前向问题中，我们随机选取系数（初始状态）的稀疏观测，再把预测解（最终状态）与真值比较；具体地，在 Darcy Flow、Poisson、Helmholtz 的系数以及无界 Navier-Stokes 的初始状态上，从 \(128\times128\) 个点中选取 500 个（约 3%）；对有界 Navier-Stokes，在圆柱边界以外的二维区域使用 1% 观测点。逆问题类似：在解（最终状态）上随机采样点作为稀疏观测，各 PDE 使用的观测点数与前向模型相同。

表 1 给出所有方法在前向与逆问题上的相对误差。由于 Darcy Flow 系数为二值，我们评估其**错误率**（error rate）；非二值数据用平均逐像素相对误差评估。每个 PDE 的误差数值为 1,000 个随机场景与观测上的平均。DiffusionPDE 在稀疏观测下于两个方向上都优于 PINO [4]、DeepONet [5]、PINNs [6] 与 FNO [3]，展示了本方法的新颖性与独特性。对 Poisson 与 Helmholtz 方程的逆问题，DiffusionPDE 的错误率较高，原因是随机场产生的系数空间内约束不足。

**表 1（原文 Table 1）：稀疏观测下前向/逆问题的解（或最终状态）与系数（或初始状态）相对误差</br>**

| PDE | 方向 | DiffusionPDE | PINO | DeepONet | PINNs | FNO |
|---|---|---|---|---|---|---|
| Darcy Flow | 前向 | **2.5%** | 35.2% | 38.3% | 48.8% | 28.2% |
| Darcy Flow | 逆向（错误率） | **3.2%** | 49.2% | 41.1% | 59.7% | 49.3% |
| Poisson | 前向 | **4.5%** | 107.1% | 155.5% | 128.1% | 100.9% |
| Poisson | 逆向 | **20.0%** | 231.9% | 105.8% | 130.0% | 232.7% |
| Helmholtz | 前向 | **8.8%** | 106.5% | 123.1% | 142.3% | 98.2% |
| Helmholtz | 逆向 | **22.6%** | 216.9% | 132.8% | 160.0% | 218.2% |
| 无界 Navier-Stokes | 前向 | **6.9%** | 101.4% | 103.2% | 142.7% | 101.4% |
| 无界 Navier-Stokes | 逆向 | **10.4%** | 96.0% | 97.2% | 146.8% | 96.0% |
| 有界 Navier-Stokes | 前向 | **3.9%** | 81.1% | 97.7% | 100.1% | 82.8% |
| 有界 Navier-Stokes | 逆向 | **2.7%** | 69.5% | 91.9% | 105.5% | 69.6% |

图 4 可视化了无界 Navier-Stokes 前向与逆问题的求解结果；其他可视化结果见补充材料。其他方法虽可能产生部分正确结果，但 DiffusionPDE 优于它们并能恢复非常接近真值的结果。对有界 Navier-Stokes 的逆问题，我们进一步与 GraphPDE 比较（图 5）：DiffusionPDE 精度超过 GraphPDE [8]，在仅 1% 观测点下把相对误差从 12.0% 降至 2.7%。

我们进一步分析 DiffusionPDE 能否通过在不同侧、以及同时在两侧的稀疏观测联合恢复 \(\mathbf a\) 与 \(\mathbf u\)。图 2 中，我们分别仅在系数空间、仅在解空间、以及在两者上随机观测 500 个点来恢复 Darcy Flow 的系数与解；各情形下两者都能以低误差恢复。因此我们得出结论：DiffusionPDE 能在任意一侧的稀疏观测下同时求解前向与逆问题，而无需重新训练网络。

**图 4（原文 Figure 4）：** DiffusionPDE 与最先进神经 PDE 求解器 [3–6] 的比较。无界 Navier-Stokes 前向问题中，给定初始状态 500 个稀疏观测求解最终状态；逆问题设定中，从最终状态观测求解初始状态。对 Burgers 方程，我们在所有时间步使用 5 个传感器并希望恢复所有时间步的解；基线在相邻快照对上训练以加入连续观测。

**图 5（原文 Figure 5）：** GraphPDE [8] 与本方法在有界 Navier-Stokes 逆问题上的比较：给定边界条件与最终涡量场 1% 观测，求解初始涡量场（流体自上方流入，边缘与中部圆柱有边界条件）。GraphPDE 能恢复初始状态的总体模式，但在流体经过圆柱处受噪声影响，且遗漏底部的高涡量。

### 4.5 引导采样的优势

为展示引导采样方法的明显优势，我们评估无界 Navier-Stokes 的前向与逆向过程，在仅给定 500 个观测点时比较 DiffusionPDE 与使用 CFG 的扩散方法（图 6）。DiffusionPDE 在两项评估中始终取得更低相对误差。

此外，图 7 把我们的结果与 Shu 等 [54] 比较：后者用优化的 CFG 方法自回归求解整段时间区间，其最终状态误差增至约 13%，明显高于我们的两状态模型。基于 Transformer 的 OFormer [59] 相对误差约为 17% 与 23%，也显著大于 DiffusionPDE。

**图 6（原文 Figure 6）：** DiffusionPDE 与带 CFG 的扩散方法在无界 Navier-Stokes 方程上的比较及误差可视化；500 个观测点下 DiffusionPDE 在前向与逆向求解中都更准确（其相对误差分别为 6.9%/10.4%，CFG 为 17.4%/9.6% 量级区间）。

**图 7（原文 Figure 7）：** DiffusionPDE 与 Shu 等 [54] 及 OFormer [59] 在无界 Navier-Stokes 方程上的比较；500 个观测点下 DiffusionPDE 有效求解前向与逆问题、误差显著更低。

### 4.6 恢复整段时间区间内的解

我们展示 DiffusionPDE 能从稀疏传感器的连续观测中恢复区间 \([0,T]\) 上的所有时间步。为评估其用稀疏传感器恢复 \(\mathbf u_{0:T}\) 的能力，我们研究一维动态 Burgers 方程：DiffusionPDE 用二维扩散模型学习 \(\mathbf u_{0:T}\) 的分布。为对 PINO、DeepONet、FNO 与 PINNs 施加连续观测，我们在相邻快照对上训练它们。实验结果测试相对误差为 2.68%（图 4），显著低于其他方法。

### 4.7 附加分析

我们考察算法各组成部分（如 PDE 损失与观测采样）的影响；强烈建议读者参阅补充材料以获得这些分析及额外实验的更多细节。

**PDE 损失。** 为验证式 (8) 中 PDE 引导损失在去噪过程中的作用，我们可视化有/无 PDE 损失时 Helmholtz 方程恢复的 \(\mathbf a\) 与 \(\mathbf u\) 的误差。这里我们在系数 \(\mathbf a\) 与解 \(\mathbf u\) 上各用 500 个稀疏观测点运行 DPS 算法，研究额外 PDE 损失引导的效果：\(\mathbf u\) 的相对误差从 9.3% 降至 0.6%，\(\mathbf a\) 的相对误差从 13.2% 降至 9.4%。因此我们得出结论：PDE 引导有助于平滑预测并提升精度。

**观测数量。** 我们考察在 \(\mathbf a\)、\(\mathbf u\) 或两者上分别有 100、300、500、1000 个随机观测时 DiffusionPDE 求解前向与逆问题的表现。DiffusionPDE 的误差随稀疏观测数增加而下降；对多数 PDE 族，在任意一侧约 6% 观测点时 DiffusionPDE 能以 1%~10% 的误差恢复 \(\mathbf a\) 与 \(\mathbf u\)。当观测点超过 3% 后，DiffusionPDE 对观测数量不再敏感、能很好地求解问题。

**观测采样模式。** 虽然 CFG 稳健性较差，我们表明 DiffusionPDE 对不同稀疏观测采样模式（包括网格模式与非均匀集中模式）都具有鲁棒性。注意即便以完整观测为条件，本方法也与当前最佳方法相当，这可能归因于引导扩散算法固有的韧性。此外，DiffusionPDE 可利用连续坐标在预测空间做双线性插值，从而为不直接落在网格上的点给出预测值而不损失精度。

## 5. 结论与未来工作

本文提出 DiffusionPDE——一种基于扩散的 PDE 求解器，通过生成先验补全缺失信息来应对部分观测下求解 PDE 的挑战。我们构造了一个学习系数（或初始状态）空间与解（或最终状态）空间联合分布的扩散模型；采样过程中，DiffusionPDE 能用稀疏测量与 PDE 约束引导去噪，从而灵活生成合理数据。我们的新方法相对现有最先进方法带来显著改进，朝着利用生成模型能力的通用 PDE 求解框架迈进。

本工作还引出若干有前景的未来研究方向。目前 DiffusionPDE 限于求解二维动态 PDE 的切片；把其能力扩展到覆盖这些方程的完整时间区间是重要机会。此外，模型在缺乏约束的空间中精度不足，是另一个关键探索方向。DiffusionPDE 采样过程也较慢，更快的求解方法值得追求。

## 参考文献（英文原书目）

[1] Ferri MH Aliabadi. Boundary element methods. In Encyclopedia of Continuum Mechanics, pp. 182–193. Springer, 2020.

[2] Pavel Šolín. Partial Differential Equations and the Finite Element Method. John Wiley & Sons, 2005.

[3] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. Fourier neural operator for parametric partial differential equations. arXiv preprint arXiv:2010.08895, 2020.

[4] Zongyi Li, Hongkai Zheng, Nikola Kovachki, David Jin, Haoxuan Chen, Burigede Liu, Kamyar Azizzadenesheli, and Anima Anandkumar. Physics-informed neural operator for learning partial differential equations. ACM/JMS Journal of Data Science, 2021.

[5] Lu Lu, Pengzhan Jin, Guofei Pang, Zhongqiang Zhang, and George Em Karniadakis. Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators. Nature Machine Intelligence, 3(3):218–229, 2021.

[6] Maziar Raissi, Paris Perdikaris, and George E Karniadakis. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational Physics, 378:686–707, 2019.

[7] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in Neural Information Processing Systems, 33:6840–6851, 2020.

[8] Qingqing Zhao, David B Lindell, and Gordon Wetzstein. Learning to solve PDE-constrained inverse problems with graph networks. arXiv preprint arXiv:2206.00711, 2022.

[9] Lawrence C Evans. Partial Differential Equations, vol. 19. American Mathematical Society, 2022.

[10] Kenji Omori and Jun Kotera. Overview of PDEs and their regulation. Circulation Research, 100(3):309–327, 2007.

[11] Ryan Po, Wang Yifan, Vladislav Golyanik, Kfir Aberman, Jonathan T Barron, Amit H Bermano, Eric Ryan Chan, Tali Dekel, Aleksander Holynski, Angjoo Kanazawa, et al. State of the art on diffusion models for visual computing. arXiv preprint arXiv:2310.07204, 2023.

[12] Walter A Strauss. Partial Differential Equations: An Introduction. John Wiley & Sons, 2007.

[13] Ling Yang, Zhilong Zhang, Yang Song, Shenda Hong, Runsheng Xu, Yue Zhao, Wentao Zhang, Bin Cui, and Ming-Hsuan Yang. Diffusion models: A comprehensive survey of methods and applications. ACM Computing Surveys, 56(4):1–39, 2023.

[14] Alfio Quarteroni and Alberto Valli. Numerical Approximation of Partial Differential Equations, vol. 23. Springer Science & Business Media, 2008.

[15] Sergio R Idelsohn, Eugenio Onate, Nestor Calvo, and Facundo Del Pin. The meshless finite element method. International Journal for Numerical Methods in Engineering, 58(6):893–912, 2003.

[16] Maziar Raissi, Paris Perdikaris, and George Em Karniadakis. Physics informed deep learning (Part I): Data-driven solutions of nonlinear partial differential equations. arXiv preprint arXiv:1711.10561, 2017.

[17] Shengze Cai, Zhiping Mao, Zhicheng Wang, Minglang Yin, and George Em Karniadakis. Physics-informed neural networks (PINNs) for fluid mechanics: A review. Acta Mechanica Sinica, 37(12):1727–1738, 2021.

[18] Zhiping Mao, Ameya D Jagtap, and George Em Karniadakis. Physics-informed neural networks for high-speed flows. Computer Methods in Applied Mechanics and Engineering, 360:112789, 2020.

[19] Hamidreza Eivazi, Mojtaba Tahani, Philipp Schlatter, and Ricardo Vinuesa. Physics-informed neural networks for solving Reynolds-averaged Navier–Stokes equations. Physics of Fluids, 34(7):075117, 2022.

[20] Shengze Cai, Zhicheng Wang, Sifan Wang, Paris Perdikaris, and George Em Karniadakis. Physics-informed neural networks for heat transfer problems. Journal of Heat Transfer, 143(6):060801, 2021.

[21] George S Misyris, Andreas Venzke, and Spyros Chatzivasileiadis. Physics-informed neural networks for power systems. In 2020 IEEE Power & Energy Society General Meeting (PESGM), pp. 1–5, 2020.

[22] Zongyi Li, Nikola Kovachki, Chris Choy, Boyi Li, Jean Kossaifi, Shourya Otta, Mohammad Amin Nabian, Maximilian Stadler, Christian Hundt, Kamyar Azizzadenesheli, et al. Geometry-informed neural operator for large-scale 3D PDEs. 2023.

[23] Louis Serrano, Lise Le Boudec, Armand Kassaï Koupaï, Thomas X Wang, Yuan Yin, Jean-Noël Vittaut, and Patrick Gallinari. Operator learning with neural fields: Tackling PDEs on general geometries. 2023.

[24] Gege Wen, Zongyi Li, Kamyar Azizzadenesheli, Anima Anandkumar, and Sally M Benson. U-FNO—an enhanced Fourier neural operator-based deep-learning model for multiphase flow. Advances in Water Resources, 163:104180, 2022.

[25] Fanny Lehmann, Filippo Gatti, Michaël Bertin, and Didier Clouteau. Fourier neural operator surrogate model to predict 3D seismic waves propagation. arXiv preprint arXiv:2304.10242, 2023.

[26] Bian Li, Hanchen Wang, Shihang Feng, Xiu Yang, and Youzuo Lin. Solving seismic wave equations on variable velocity models with Fourier neural operator. IEEE Transactions on Geoscience and Remote Sensing, 61:1–18, 2023.

[27] Zhijie Li, Wenhui Peng, Zelong Yuan, and Jianchun Wang. Fourier neural operator approach to large eddy simulation of three-dimensional turbulence. Theoretical and Applied Mechanics Letters, 12(6):100389, 2022.

[28] Wenhui Peng, Zelong Yuan, Zhijie Li, and Jianchun Wang. Linear attention coupled Fourier neural operator for simulation of three-dimensional turbulence. Physics of Fluids, 35(1), 2023.

[29] Boris Bonev, Thorsten Kurth, Christian Hundt, Jaideep Pathak, Maximilian Baust, Karthik Kashinath, and Anima Anandkumar. Spherical Fourier neural operators: Learning stable dynamics on the sphere. 2023.

[30] Peter Yichen Chen, Jinxu Xiang, Dong Heon Cho, Yue Chang, GA Pershing, Henrique Teles Maia, Maurizio M Chiaramonte, Kevin Carlberg, and Eitan Grinspun. CROM: Continuous reduced-order modeling of PDEs using implicit neural representations. 2023.

[31] Zilu Li, Guandao Yang, Xi Deng, Christopher De Sa, Bharath Hariharan, and Steve Marschner. Neural caches for Monte Carlo partial differential equation solvers. In SIGGRAPH Asia 2023 Conference Papers, 2023.

[32] Thomas Müller, Fabrice Rousselle, Jan Novák, and Alexander Keller. Real-time neural radiance caching for path tracing. arXiv preprint arXiv:2106.12372, 2021.

[33] Hong Chul Nam, Julius Berner, and Anima Anandkumar. Solving Poisson equations using neural walk-on-spheres. In ICLR 2024 Workshop on AI4DifferentialEquations in Science, 2024.

[34] M Cho, B Jadamba, R Kahler, AA Khan, and M Sama. First-order and second-order adjoint methods for the inverse problem of identifying non-linear parameters in PDEs. Industrial Mathematics, 2022.

[35] Colin Fox and Geoff Nicholls. Statistical estimation of the parameters of a PDE. Canadian Applied Mathematics Quarterly, 10:277–810, 2001.

[36] Bastian Harrach. An introduction to finite element methods for inverse coefficient problems in elliptic PDEs. Jahresbericht der Deutschen Mathematiker-Vereinigung, 123(3):183–210, 2021.

[37] Krishna Kumar and Yonjin Choi. Accelerating particle and fluid simulations with differentiable graph networks for solving forward and inverse problems. In Proceedings of the SC'23 Workshops, 2023.

[38] Tristan van Leeuwen and Felix J Herrmann. A penalty method for PDE-constrained optimization in inverse problems. Inverse Problems, 32(1):015007, 2015.

[39] Da Long and Shandian Zhe. Invertible Fourier neural operators for tackling both forward and inverse problems. arXiv preprint arXiv:2402.11722, 2024.

[40] Roberto Molinaro, Yunan Yang, Björn Engquist, and Siddhartha Mishra. Neural inverse operators for solving PDE inverse problems. arXiv preprint arXiv:2301.11167, 2023.

[41] Maarten V de Hoop, Matti Lassas, and Christopher A Wong. Deep learning architectures for nonlinear operator functions and nonlinear inverse problems. Mathematical Statistics and Learning, 2022.

[42] Samira Pakravan, Pouria A Mistani, Miguel A Aragon-Calvo, and Frederic Gibou. Solving inverse-PDE problems with physics-aware neural networks. Journal of Computational Physics, 440:110409, 2021.

[43] Valerii Iakovlev, Markus Heinonen, and Harri Lähdesmäki. Learning continuous-time PDEs from sparse data with graph neural networks. arXiv preprint arXiv:2006.08956, 2020.

[44] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. arXiv preprint arXiv:2010.02502, 2020.

[45] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. In Proc. NeurIPS, 2022.

[46] Hyungjin Chung, Jeongsol Kim, Michael T McCann, Marc L Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. arXiv preprint arXiv:2209.14687, 2022.

[47] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. Advances in Neural Information Processing Systems, 35, 2022.

[48] Prafulla Dhariwal and Alexander Nichol. Diffusion models beat GANs on image synthesis. Advances in Neural Information Processing Systems, 34:8780–8794, 2021.

[49] Sihan Xu, Yidong Huang, Jiayi Pan, Ziqiao Ma, and Joyce Chai. Inversion-free image editing with natural language. arXiv preprint arXiv:2312.04965, 2023.

[50] Christian Jacobsen, Yilin Zhuang, and Karthik Duraisamy. CoCoGen: Physically-consistent and conditioned score-based generative models for forward and inverse problems. arXiv preprint arXiv:2312.09852, 2023.

[51] Marten Lienen, David Lüdke, Jan Hansen-Palmus, and Stephan Günnemann. From zero to turbulence: Generative modeling for 3D flow simulation. In The Twelfth International Conference on Learning Representations, 2024.

[52] Gefan Yang and Stefan Sommer. A denoising diffusion model for fluid field prediction. arXiv preprint arXiv:2301.11661, 2023.

[53] Phillip Lippe, Bas Veeling, Paris Perdikaris, Richard Turner, and Johannes Brandstetter. PDE-Refiner: Achieving accurate long rollouts with neural PDE solvers. Advances in Neural Information Processing Systems, 36, 2023.

[54] Dule Shu, Zijie Li, and Amir Barati Farimani. A physics-informed diffusion model for high-fidelity flow field reconstruction. Journal of Computational Physics, 478:111972, 2023.

[55] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.

[56] Aapo Hyvärinen and Peter Dayan. Estimation of non-normalized statistical models by score matching. Journal of Machine Learning Research, 6(4), 2005.

[57] Yuanming Hu, Luke Anderson, Tzu-Mao Li, Qi Sun, Nathan Carr, Jonathan Ragan-Kelley, and Frédo Durand. Difftaichi: Differentiable programming for physical simulation. arXiv preprint arXiv:1910.00935, 2019.

[58] Jonathan Ho and Tim Salimans. Classifier-free diffusion guidance. arXiv preprint arXiv:2207.12598, 2022.

[59] Zijie Li, Kazem Meidani, and Amir Barati Farimani. Transformer for partial differential equations' operator learning. arXiv preprint arXiv:2205.13671, 2022.

[60] Evan F Bollig, Natasha Flyer, and Gordon Erlebacher. Solution to PDEs using radial basis function finite-differences (RBF-FD) on multiple GPUs. Journal of Computational Physics, 231(21):7133–7151, 2012.

## 附录概述

> 说明：原文第 15 页起为附录（NeurIPS 补充材料），含超参数、额外定量表、更多可视化与 NeurIPS 检查清单/伦理页（第 27 页起）。因本页为**许可待核**的学习用译稿，附录以结构化说明 + 全部表/图图注呈现；完整数值请对照原文 PDF。

**附录结构：** 附录开头给出实现细节与训练配置（含各 PDE 的 PDE 损失权重 \(\zeta_{\rm pde}\) 与观测损失权重 \(\zeta_{\rm obs}\) 随 PDE 类型与观测方式的变化，见表 2）；随后给出补充定量结果（表 3–表 8）、推理开销比较（表 7–8）、非均匀/含噪观测的鲁棒性分析（图 16–18）、不同初始噪声的多样性（图 20）、不同分辨率的结果（表 9、图 22）、与 U-Net 基线的比较（图 23），以及 21 篇补充可视化图（图 8–23）。

**附录表注速览：** 表 2（不同 PDE 与观测设定下 PDE 损失与观测损失的权重）；表 3（DiffusionPDE 对系数/初始状态 \(\mathbf a\) 与解/最终状态 \(\mathbf u\) 的预测误差）；表 4（稀疏观测下不同 PDE 族的相对误差，扩展版）；表 5（完整观测下的相对误差）；表 6（稀疏观测下前向/逆问题的标准差）；表 7（基于稀疏观测方法的推理计算开销）；表 8（基于完整观测方法有无某优化时的平均推理时间/秒）；表 9（Darcy Flow 在不同分辨率下的前向相对误差与逆问题错误率）。

**附录图注速览：** 图 8（各 PDE 恢复系数/解及其绝对误差可视化）；图 9（5 个传感器恢复 Burgers 方程整段时间的结果）；图 10（不同 PDE 族稀疏观测下前向/逆向结果）；图 11（500 观测点下 Darcy Flow 的前向/逆向结果）；图 12（粘性小 10 倍的 Navier-Stokes 与 Burgers 结果）；图 13（完整观测下不同 PDE 族结果）；图 14（DeepONet 用 500/1000 观测点/完整观测的预测对比）；图 15（Poisson 方程在优化基线后的结果）；图 16（稀疏含噪观测下 Darcy Flow 恢复的相对误差）；图 17（含噪观测下 Darcy Flow 的恢复解）；图 18（非均匀采样观测下 Darcy Flow 的恢复解）；图 19（不同采样模式下 DiffusionPDE 与 Diffusion CFG 的比较）；图 20（不同初始噪声下 DiffusionPDE 的多样预测）；图 21（系数与解的误差率/相对误差随某因素变化）；图 22（500 观测点下 Poisson 方程的前向/逆向结果）；图 23（DiffusionPDE 与 U-Net 在无界 Navier-Stokes 上的比较）。

## 图注与表注

**正文图注：** 图 1–7 的图注已随文置于第 1、3.3、4.1、4.4、4.5 节相应位置：图 1 为方法总览（联合分布建模 + 稀疏观测与 PDE 引导去噪）；图 2 为稀疏观测下同时重建系数与解；图 3 为有无 PDE 损失的绝对误差对比；图 4 为与 FNO/PINO/DeepONet/PINNs 的定性比较；图 5 为与 GraphPDE 在有界 Navier-Stokes 逆问题上的比较；图 6 为与带 CFG 的扩散方法比较；图 7 为与 Shu 等 [54] 及 OFormer [59] 比较。

**正文表注：** 表 1（稀疏观测下 5 类 PDE × 前向/逆向 × 5 方法的相对误差/错误率）已在本页逐格转写。

**本页范围与校对状态：** 本页覆盖原文摘要、第 1–5 节全部正文与小节（2、3.1–3.3、4.1–4.7）、式 (1)–(14)、算法 1、表 1（逐格转写）、图 1–7 图注、参考文献 [1]–[60]（英文原条目）、附录 A 的结构化说明（表 2–9 与图 8–23 图注速览）。原文正文无附录内容（附录从第 15 页起；第 27 页起为 NeurIPS 检查清单/伦理页，属元数据页，本页未收录其正文）。**许可说明（重要）：** 原文为 NeurIPS 2024 会议论文集版本，再传播许可条款待核验；本页为个人学习用途的中文译稿，**不计入可公开全文统计**，页首与页尾均保留该说明。**原文说明：** 图 6 的正文比较段落未给出全部数值，本页图注按原文图示中的相对误差标注（DiffusionPDE 6.9%/10.4%，CFG 17.4%/9.6%）说明；附录表 2–9 与图 8–23 仅列图注、未逐格转写数值，已在页尾注明。逐句逐式终校未做；供后续 QA 重点核对：式 (3)–(5) 的 DPS 近似、式 (8)–(9) 的引导项与 PDE 残差定义、表 1 数值、以及附录权重表。

{% endraw %}
