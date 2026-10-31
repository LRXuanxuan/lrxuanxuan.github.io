---
layout: page
title: "后置位置校准的无线电地图构建｜中文全文译文"
permalink: /papers/translations/2026-09-16-2609-11142-radio-map-construction-with-post-hoc-location-calibration-under-quasi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/ab1455deae68f37f/) · [原文 arXiv](https://arxiv.org/abs/2609.11142) · [全部目录](/papers/catalog/)

# 准静态定位误差下的后置位置校准无线电地图构建：联合估计、性能界与基于 GNSS 的评估

**原题：** Radio Map Construction with Post-Hoc Location Calibration under Quasi-Static Positioning Errors: Joint Estimation, Performance Bounds, and GNSS-Based Evaluation  
**作者：** Koki Kanzaki（IEEE 研究生会员）、Katsuya Suto（IEEE 高级会员）、Koya Sato（IEEE 高级会员）（日本电气通信大学人工智能探索研究中心；北海道大学信息科学技术学院）  
**版本：** arXiv:2609.11142v1（eess.SP；投稿 IEEE Internet of Things Journal，2026 年 9 月），原文 16 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—VIII 节、附录 A—B、表 I—表 II、图 1—图 11 图注与参考文献（英文原条目 30 条）按原文结构录入；逐句逐式终校未做。

## 摘要

无线电地图支撑**环境感知**的无线与物联网应用，可由移动设备采集的**带位置标签的接收信号强度（RSS）**测量构建。在城市环境中，**时间相关的 GNSS 误差**会平移整条感知轨迹，造成**系统性的空间配准错误**，而该错误**不能通过收集更多测量来消除**。本文提出一个无线电地图构建框架，利用**无线电测量本身**在数据采集之后校准错误的位置标签。主要定位误差被建模为**传感器特定的准静态偏移**，并在**高斯过程回归（GPR）**框架中与**无线电传播参数联合估计**，其关键是利用**距离相关路径损耗**与**空间相关阴影**所提供的互补空间信息。本文建立了条件 Bayes 风险的**下界与上界**，并证明：在**平移不变的轨迹模型**下，仅凭轨迹信息**无法辨识**准静态偏移，这正说明必须使用 RSS 导出的空间信息进行校准。跨传播条件的数值评估表明：所提方法把相对理想 GPR 的均方误差（MSE）差距降到约 **3.26 dB²**，而**位置误差不可知**与**含噪输入 GPR** 两个基线约为 **10 dB²**。用智能手机 GNSS 测量导出的定位误差模型评估时，所提方法尽管面对**未建模的时变定位误差**，仍优于 **KF–RTS 轨迹平滑**基线，中位 MSE 距理想 GPR 约 **5 dB²**以内。这些结果表明：RSS 测量不仅可作为无线电地图重建的观测，还可作为**后置校准不完美地理标签感知数据的空间线索**。

**关键词：** 高斯过程；无线电地图构建；准静态误差；界分析。

## I. 引言

环境感知的无线通信需要**站点特定的无线传播知识**。无线电地图通过把 RSS、路径损耗与信道增益等无线电传播量与地理位置关联，提供这类空间知识 [2]，并被广泛用作无线资源管理、定位、网络优化及其他环境感知应用的基础 [3]—[5]。更广义地看，无线电环境知识的空间表示对数字孪生与信道知识地图也很重要 [6]—[8]。

一种实用的无线电地图构建方式是从**带位置标签的 RSS 测量**出发，通过空间插值推断未观测位置的无线电量。已有众多模型驱动与数据驱动估计器被提出，其中**高斯过程回归（GPR）**尤为自然，因为它能显式利用阴影的空间相关性 [9]—[12]。

这些测量的位置标签通常由**全球导航卫星系统（GNSS）**获得。在城市环境中，周围建筑、非直射径与多径使 GNSS 定位误差显著 [13]、[14]。更关键的是，当传播环境在**一段时间内保持相似**时（例如同一街道走廊、同一建筑群），由此产生的定位误差具有**强时间自相关** [13]、[15]：同一终端采集的整串位置可能被**一致地平移**，而不是独立散布在真值轨迹周围，如图 1 所示。本文将这类时间相关定位误差的主导**准静态分量**称为**准静态定位偏移**。


这种偏移与逐测量的独立误差有本质区别，也因此带来一个**方法论**挑战：它无法通过增加测量数或做局部平均消除——被平移的整串观测始终落在**错误**的空间位置，会直接污染无线电地图。已有应对逐测量位置不确定性的方法，例如把高斯输入噪声近似为额外输出噪声，或把不确定／潜在输入显式纳入推断 [17]、[18]；它们提供了处理**单个**输入位置不确定性的原理性机制，但**轨迹级**的准静态偏移是另一类问题：一个共同偏移把整条轨迹**一致平移**，并不表现为单个位置附近的散点。

另一条思路是在构建无线电地图**之前**先校正轨迹，例如用轨迹平滑抑制时变定位误差 [20]—[22]。但**仅凭轨迹信息并不能确定**轨迹级常值偏移：在没有足够信息的绝对位置约束时，常值平移在观测似然上不可辨识（第 V-C 节形式化），因此平滑只能减小时变误差，却会留下残余的**绝对空间配准误差**，直接影响后续地图构建。

本文的关键观察是：**无线电测量本身**提供了轨迹无法提供的空间信息。距离相关路径损耗把 RSS 与发送机—接收机距离联系起来，给出关于**相对基站（BS）绝对位置**的信息；空间相关阴影则给出测量对之间**相对位置**的信息。二者合起来可估计轨迹级定位偏移。从这个视角看，无线电地图构建与位置校准是**互补**的。

本文提出一个**准静态定位偏移下的后置位置校准无线电地图构建框架**：所提方法在 GPR 框架中**联合估计**这些偏移与无线电传播参数，同时利用距离相关路径损耗与空间相关阴影，因此把 RSS 测量**既**用作重建地图的观测，**又**用作校准其位置标签的空间信息。主要贡献如下：

1. 提出**后置校准**的无线电地图构建框架，把系统性的轨迹级定位偏移与无线电地图一同估计，并从 RSS 似然出发解释**均值与协方差**各自提供了什么空间信息（径向 vs. 成对方向）。
2. 建立**条件 Bayes 风险的下界与上界**：下界来自可访问真实位置的 oracle 估计器，上界来自仅使用报告位置的 working-model 估计器，由此给出任意估计器**超额风险**的夹逼。特别地，证明**平移不变轨迹模型**下仅凭轨迹无法辨识准静态偏移，从而说明利用 RSS 空间信息的必要性。
3. 用**实测智能手机 GNSS 误差**构造 1 Hz AR(2) 误差模型，并在 20 s 测量间隔下做**模型失配**评估；与显式利用时间相关的 **KF–RTS 平滑基线**对照，展示所提方法在未建模时变误差下仍具优势。

第 II 节给出系统模型；第 III 节说明不考虑定位误差的地图构建及其局限；第 IV 节给出联合估计与地图构建；第 V 节给出性能界分析；第 VI 节在多种传播条件下做数值评估；第 VII 节用实测 GNSS 误差模型进一步评估稳健性；第 VIII 节总结。

## II. 系统模型

考虑目标区域 $\mathcal A\subset\mathbb R^{2}$ 中的单个 BS 与 $N$ 个移动设备（传感器）。**传播模型。** 令 $\mathbf x_{\mathrm{Tx}}\in\mathcal A$ 为 BS 坐标（已知）。假设通过测量中的信号平均，小尺度衰落已被大幅抑制，则 $\mathbf x\in\mathcal A$ 处接收功率 $P_{\mathrm{Rx}}$ [dBm] 可建模为 [23]

$$
P_{\mathrm{Rx}}(\mathbf x)=P_{\mathrm{Tx}}-10\eta\log_{10}\left(\frac{\lVert\mathbf x_{\mathrm{Tx}}-\mathbf x\rVert}{d_0}\right)+W(\mathbf x)\triangleq f(\mathbf x),\tag{1}
$$

其中 $P_{\mathrm{Tx}}$ [dBm] 为 BS 发射功率、$\eta$ 为路径损耗指数、$d_0$ 为参考距离、$W(\mathbf x)$ 为阴影分量，后者按对数正态阴影相关模型 [24] 建模为

$$
W(\cdot)\sim\mathcal{GP}\left(0,k_{\exp}(\cdot,\cdot)\right),\tag{2}
$$

其中指数核为

$$
k_{\exp}(\mathbf x,\mathbf x')=\sigma_f^{2}\exp\left(-\frac{\lVert\mathbf x-\mathbf x'\rVert\ln 2}{d_{\mathrm{cor}}}\right),\tag{3}
$$

$\sigma_f^{2}$ 为阴影方差、$d_{\mathrm{cor}}$ 为相关距离。测量噪声建模为独立同分布高斯：$p_j^{(i)}=f(\mathbf x_j^{(i)})+\epsilon_{p,j}^{(i)}$，其中

$$
\epsilon_{p,j}^{(i)}\sim\mathcal N\left(0,\sigma_p^{2}\right),\tag{4}
$$

$\mathbf x_j^{(i)}$ 为真值位置。

**定位误差模型。** 设传感器 $i$ 在时间索引 $j$ 上报的位置为 $\widetilde{\mathbf x}_j^{(i)}$。定位误差取**准静态**近似：单次观测区间内的主要误差被视为常值偏移，并跨传感器独立。为突出这一结构，本文直接用如下观测模型吸收测量级的小扰动：

$$
\widetilde{\mathbf x}_j^{(i)}=\mathbf x_j^{(i)}+\mathbf e^{(i)},\tag{5}
$$

其中 $\mathbf e^{(i)}$ 假设在第 $i$ 个传感器的观测区间内**恒定**、且跨传感器**独立**，并服从

$$
\mathbf e^{(i)}\sim\mathcal N\left(\boldsymbol\mu_s,\boldsymbol\Sigma_s\right),\tag{6}
$$

$\boldsymbol\mu_s\in\mathbb R^{2}$ 与 $\boldsymbol\Sigma_s\in\mathbb R^{2\times2}$ 为均值向量与协方差矩阵（由先验知识给出或从定位误差统计中经验估计）。

**数据与索引。** 传感器 $i$ 的本地数据集为

$$
\mathcal D^{(i)}=\left\{\left(\widetilde{\mathbf x}_j^{(i)},p_j^{(i)}\right)\mid j=1,\ldots,M^{(i)}\right\}.\tag{7}
$$

所有传感器上传后，服务器把本地数据集聚合为

$$
\mathcal D\triangleq\left\{\mathcal D^{(i)}\right\}_{i=1}^{N}.\tag{8}
$$

服务器假设已知发送机坐标 $\mathbf x_{\mathrm{Tx}}$ 与发射功率 $P_{\mathrm{Tx}}$，并在未观测位置对 RSS 做空间插值构建无线电地图。忽略定位误差时，系统模型中的未知参数汇集为

$$
\boldsymbol\theta\triangleq\left[\eta,\ \sigma_f^{2},\ d_{\mathrm{cor}},\ \sigma_p^{2}\right]^{\top}.\tag{9}
$$

由于阴影分量建模为零均值 GP，RSS 潜在场可表示为

$$
f(\mathbf x)\sim\mathcal{GP}\left(m_{\boldsymbol\theta}(\mathbf x),k_{\exp,\boldsymbol\theta}(\mathbf x,\mathbf x')\right),\tag{10}
$$

其中均值函数为

$$
m_{\boldsymbol\theta}(\mathbf x)\triangleq P_{\mathrm{Tx}}-10\eta\log_{10}\left(1+\frac{\lVert\mathbf x_{\mathrm{Tx}}-\mathbf x\rVert}{d_0}\right),\tag{11}
$$

指数核由 (3) 给出、其参数由 $\boldsymbol\theta$ 指定[^1]。

[^1]: 加性常数 1 用于分析上的便利；在本文考虑的通信距离下 $\lVert\mathbf x_{\mathrm{Tx}}-\mathbf x\rVert/d_0\gg1$，其影响可忽略。

令所有传感器采集到的测量总数为

$$
M_N\triangleq\sum_{i=1}^{N}M^{(i)}.\tag{12}
$$

为以向量形式表达 GP 似然，对第 $n$ 个测量记 $i_n$ 为传感器索引、$j_n$ 为该传感器测量序列中的时间索引，则上报位置与 RSS 测量定义为

$$
\widetilde{\mathbf x}_n\triangleq\widetilde{\mathbf x}_{j_n}^{(i_n)},\qquad p_n\triangleq p_{j_n}^{(i_n)}.\tag{13}
$$

上报位置与 RSS 测量向量化为

$$
\widetilde{\mathbf X}\triangleq[\widetilde{\mathbf x}_1,\ldots,\widetilde{\mathbf x}_{M_N}]^{\top}\in\mathbb R^{M_N\times2},\tag{14}
$$
$$
\mathbf p\triangleq[p_1,\ldots,p_{M_N}]^{\top}\in\mathbb R^{M_N}.\tag{15}
$$

在给定上报位置与模型参数的条件下，观测向量服从

$$
\mathbf p\mid\widetilde{\mathbf X},\boldsymbol\theta\sim\mathcal N\left(\mathbf m_{\boldsymbol\theta,\widetilde{\mathbf X}},\mathbf C_{\boldsymbol\theta,\widetilde{\mathbf X}}\right),\tag{16}
$$

其中均值向量为

$$
\mathbf m_{\boldsymbol\theta,\widetilde{\mathbf X}}\triangleq[m_{\boldsymbol\theta}(\widetilde{\mathbf x}_1),\ldots,m_{\boldsymbol\theta}(\widetilde{\mathbf x}_{M_N})]^{\top},\tag{17}
$$

协方差矩阵为

$$
\mathbf C_{\boldsymbol\theta,\widetilde{\mathbf X}}\triangleq\mathbf K_{\boldsymbol\theta,\widetilde{\mathbf X}}+\sigma_p^{2}\mathbf I,\tag{18}
$$

其中核矩阵元素为

$$
\left[\mathbf K_{\boldsymbol\theta,\widetilde{\mathbf X}}\right]_{m,n}=k_{\exp,\boldsymbol\theta}(\widetilde{\mathbf x}_m,\widetilde{\mathbf x}_n),\qquad m,n=1,\ldots,M_N.\tag{19}
$$

由此得到对数边缘似然

$$
\log\mathcal L\left(\mathbf p\mid\widetilde{\mathbf X},\boldsymbol\theta\right)=-\frac{M_N}{2}\log(2\pi)-\frac{1}{2}\log\det\mathbf C_{\boldsymbol\theta,\widetilde{\mathbf X}}-\frac{1}{2}\left(\mathbf p-\mathbf m_{\boldsymbol\theta,\widetilde{\mathbf X}}\right)^{\top}\mathbf C_{\boldsymbol\theta,\widetilde{\mathbf X}}^{-1}\left(\mathbf p-\mathbf m_{\boldsymbol\theta,\widetilde{\mathbf X}}\right).\tag{20}
$$

模型参数通过最大化对数边缘似然估计：

$$
\widehat{\boldsymbol\theta}=\arg\max_{\boldsymbol\theta\in\Theta}\ \log\mathcal L\left(\mathbf p\mid\widetilde{\mathbf X},\boldsymbol\theta\right),\tag{21}
$$

其中 $\Theta$ 为可行参数集；该函数可用基于梯度的方法最大化，本文使用 Adam [25]。

## III. 不考虑定位误差的无线电地图构建

先回顾忽略定位误差的标准 GPR 无线电地图构建。由估计参数，查询点 $\mathbf x^{*}$ 与上报测量位置之间的互协方差向量为

$$
\left[\mathbf k_{\widehat{\boldsymbol\theta},\widetilde{\mathbf X}}(\mathbf x^{*})\right]_n=k_{\exp,\widehat{\boldsymbol\theta}}(\mathbf x^{*},\widetilde{\mathbf x}_n),\qquad n=1,\ldots,M_N.\tag{22}
$$

$\mathbf x^{*}$ 处的 RSS 由 RSS 潜在场的后验均值估计：

$$
\widehat p(\mathbf x^{*})\triangleq\mathbb E\left[f(\mathbf x^{*})\mid\mathbf p,\widetilde{\mathbf X},\widehat{\boldsymbol\theta}\right]=m_{\widehat{\boldsymbol\theta}}(\mathbf x^{*})+\mathbf k_{\widehat{\boldsymbol\theta},\widetilde{\mathbf X}}^{\top}(\mathbf x^{*})\mathbf C_{\widehat{\boldsymbol\theta},\widetilde{\mathbf X}}^{-1}\left(\mathbf p-\mathbf m_{\widehat{\boldsymbol\theta},\widetilde{\mathbf X}}\right).\tag{23}
$$

对查询点求值即得无线电地图，流程见算法 1。

**算法 1　不考虑定位误差的无线电地图构建**

```text
输入: 数据集 D、发送机位置 x_Tx、发射功率 P_Tx、查询点集 X*
输出: 无线电地图 {p̂(x*)}、估计模型参数 θ̂
1: 由 D 构造上报位置矩阵 X̃ 与 RSS 观测向量 p
2: 求解式 (21) 得 θ̂
3: 按式 (17) 构造 m_{θ̂,X̃}
4: 按式 (19) 构造 K_{θ̂,X̃}，按式 (18) 构造 C_{θ̂,X̃}
5: for 所有 x* ∈ X* do
6:     按式 (22) 构造 k_{θ̂,X̃}(x*)
7:     按式 (23) 计算 p̂(x*)
8: end for
9: return {p̂(x*)}, θ̂
```

该框架把上报位置**直接当作真值位置**，因此轨迹级准静态偏移会一致地平移全部观测、系统性扭曲插值结果，增加测量数或局部平均都无法修正。另一类做法是把位置不确定性当作**含噪输入**：若只考虑逐测量独立随机误差，可把它近似为额外输出噪声，或在推断中显式对潜在输入积分 [17]、[18]。但这些机制针对**独立**不确定性，而轨迹级共同偏移使整条轨迹的一致平移在似然上难以与其他平移区分，因此含噪输入建模同样无法辨识该偏移（第 V-C 节形式化）。

## IV. 无线电地图构建与联合估计

所提方法利用两种空间结构——**距离相关的均值**与**传感器间空间协方差**——联合估计模型参数与传感器特定定位误差。

### A. 传播参数与位置误差的联合估计

由 (5) 的定位误差模型，传感器 $i$ 采集的第 $j$ 个测量的真值位置为

$$
\mathbf x_j^{(i)}=\widetilde{\mathbf x}_j^{(i)}-\mathbf e^{(i)}.\tag{24}
$$

把传感器特定定位误差收集成向量

$$
\mathbf e_{\mathrm{vec}}\triangleq\left[\left(\mathbf e^{(1)}\right)^{\top},\ldots,\left(\mathbf e^{(N)}\right)^{\top}\right]^{\top}\in\mathbb R^{2N}.\tag{25}
$$

采用全局测量索引，令

$$
\mathbf e_n\triangleq\mathbf e^{(i_n)},\qquad n=1,\ldots,M_N.\tag{26}
$$

第 $n$ 个测量对应的校正位置为

$$
\mathbf x_n(\mathbf e_{\mathrm{vec}})\triangleq\widetilde{\mathbf x}_n-\mathbf e_n.\tag{27}
$$

收集这些位置得

$$
\mathbf X(\mathbf e_{\mathrm{vec}})\triangleq[\mathbf x_1(\mathbf e_{\mathrm{vec}}),\ldots,\mathbf x_{M_N}(\mathbf e_{\mathrm{vec}})]^{\top}.\tag{28}
$$

在给定上报位置、模型参数与定位误差的（即取 $\mathbf X=\mathbf X(\mathbf e_{\mathrm{vec}})$ 的）条件下，RSS 观测向量为高斯，其均值为

$$
\mathbf m_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\triangleq\left[m_{\boldsymbol\theta}(\mathbf x_1(\mathbf e_{\mathrm{vec}})),\ldots,m_{\boldsymbol\theta}(\mathbf x_{M_N}(\mathbf e_{\mathrm{vec}}))\right]^{\top}.\tag{29}
$$

其第 $n$ 个元素可显式写为

$$
\left[\mathbf m_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\right]_n=P_{\mathrm{Tx}}-10\eta\log_{10}\left(1+\frac{\lVert\mathbf x_{\mathrm{Tx}}-\mathbf x_n(\mathbf e_{\mathrm{vec}})\rVert}{d_0}\right).\tag{30}
$$

相应协方差矩阵为

$$
\mathbf C_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\triangleq\mathbf K_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}+\sigma_p^{2}\mathbf I,\tag{31}
$$

其中核矩阵元素为

$$
\left[\mathbf K_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\right]_{m,n}=k_{\exp,\boldsymbol\theta}(\mathbf x_m(\mathbf e_{\mathrm{vec}}),\mathbf x_n(\mathbf e_{\mathrm{vec}}))=\sigma_f^{2}\exp\left(-\frac{\lVert(\widetilde{\mathbf x}_m-\mathbf e_m)-(\widetilde{\mathbf x}_n-\mathbf e_n)\rVert\ln 2}{d_{\mathrm{cor}}}\right),\tag{32}
$$

对 $m,n=1,\ldots,M_N$。所得对数边缘似然为

$$
\log\mathcal L\left(\mathbf p\mid\widetilde{\mathbf X},\boldsymbol\theta,\mathbf e_{\mathrm{vec}}\right)=-\frac{M_N}{2}\log(2\pi)-\frac{1}{2}\log\det\mathbf C_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}-\frac{1}{2}\left(\mathbf p-\mathbf m_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\right)^{\top}\mathbf C_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}^{-1}\left(\mathbf p-\mathbf m_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\right).\tag{33}
$$

**均值与协方差提供的空间信息。** 为说明均值与协方差各自提供了什么空间信息，定义距离

$$
r_n\triangleq\lVert\mathbf x_n(\mathbf e_{\mathrm{vec}})-\mathbf x_{\mathrm{Tx}}\rVert,\qquad \rho_{mn}\triangleq\lVert\mathbf x_m(\mathbf e_{\mathrm{vec}})-\mathbf x_n(\mathbf e_{\mathrm{vec}})\rVert,\tag{34}
$$

并令 $\delta_{a,b}$ 表示 Kronecker delta。对 $r_n>0$，均值关于传感器 $i$ 定位误差的梯度为

$$
\nabla_{\mathbf e^{(i)}}\left[\mathbf m_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\right]_n=\delta_{i,i_n}\frac{10\eta}{\ln 10}\cdot\frac{\mathbf x_n(\mathbf e_{\mathrm{vec}})-\mathbf x_{\mathrm{Tx}}}{r_n(d_0+r_n)},\tag{35}
$$

因此均值沿**径向**（相对发送机的方向）提供空间信息。类似地，核矩阵关于 $\mathbf e^{(i)}$ 的梯度为

$$
\nabla_{\mathbf e^{(i)}}\left[\mathbf K_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\right]_{m,n}=\frac{\ln 2}{d_{\mathrm{cor}}}\left[\mathbf K_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\right]_{m,n}\left(\delta_{i,i_m}-\delta_{i,i_n}\right)\frac{\mathbf x_m(\mathbf e_{\mathrm{vec}})-\mathbf x_n(\mathbf e_{\mathrm{vec}})}{\rho_{mn}},\tag{36}
$$

因此协方差沿测量对之间的**成对方向**提供信息。特别地，同一传感器采集的两点之间的梯度为零，因为它们的共同定位偏移不改变二者间距。因此**协方差主要约束不同传感器之间的相对偏移**，而**均值通过到已知发送机的距离约束校正位置的绝对摆放**。于是当轨迹相对发送机只覆盖有限方向范围、或传感器间测量对方向不够多样时，不同定位误差向量可能产生相似的均值与协方差。

**MAP 形式。** 为对这些弱可辨识方向做正则化，本文采用 MAP 形式并引入第 II 节的先验。由于定位误差跨传感器独立，其联合先验密度为

$$
p_{\mathrm e}(\mathbf e_{\mathrm{vec}})=\prod_{i=1}^{N}\phi\left(\mathbf e^{(i)};\boldsymbol\mu_s,\boldsymbol\Sigma_s\right),\tag{37}
$$

其中

$$
\phi(\mathbf x;\boldsymbol\mu_s,\boldsymbol\Sigma_s)=\frac{1}{2\pi\sqrt{|\boldsymbol\Sigma_s|}}\exp\left[-\frac{1}{2}(\mathbf x-\boldsymbol\mu_s)^{\top}\boldsymbol\Sigma_s^{-1}(\mathbf x-\boldsymbol\mu_s)\right].\tag{38}
$$

该先验同时提供定位误差空间中的**绝对参考**。其关于传感器 $i$ 定位误差的梯度为

$$
\nabla_{\mathbf e^{(i)}}\log p_{\mathrm e}(\mathbf e_{\mathrm{vec}})=-\boldsymbol\Sigma_s^{-1}\left(\mathbf e^{(i)}-\boldsymbol\mu_s\right),\tag{39}
$$

因此先验把每个传感器特定定位误差锚定在**先验均值** $\boldsymbol\mu_s$ 附近，并正则化 RSS 似然约束较弱的方向。所得 MAP 目标为

$$
J(\boldsymbol\theta,\mathbf e_{\mathrm{vec}})\triangleq\log\mathcal L\left(\mathbf p\mid\widetilde{\mathbf X},\boldsymbol\theta,\mathbf e_{\mathrm{vec}}\right)+\log p_{\mathrm e}(\mathbf e_{\mathrm{vec}}).\tag{40}
$$

展开先验项后

$$
J(\boldsymbol\theta,\mathbf e_{\mathrm{vec}})=\log\mathcal L\left(\mathbf p\mid\widetilde{\mathbf X},\boldsymbol\theta,\mathbf e_{\mathrm{vec}}\right)-\frac{N}{2}\log\left(4\pi^{2}|\boldsymbol\Sigma_s|\right)-\frac{1}{2}\sum_{i=1}^{N}\left(\mathbf e^{(i)}-\boldsymbol\mu_s\right)^{\top}\boldsymbol\Sigma_s^{-1}\left(\mathbf e^{(i)}-\boldsymbol\mu_s\right).\tag{41}
$$

模型参数与定位误差通过求解

$$
\left(\widehat{\boldsymbol\theta},\widehat{\mathbf e}_{\mathrm{vec}}\right)=\arg\max_{\boldsymbol\theta\in\Theta,\ \mathbf e_{\mathrm{vec}}\in\mathcal E}\ J(\boldsymbol\theta,\mathbf e_{\mathrm{vec}})\tag{42}
$$

联合估计，其中 $\mathcal E$ 为传感器特定定位误差的有限箱约束集。(42) 对应于在把上报位置视为固定的条件下，对定位误差做 MAP 估计、同时对 $\boldsymbol\theta$ 做最大似然估计。与第 V 节的全生成后验不同，该条件化表述**不包含真值测量轨迹的概率律**。由于目标对 $\boldsymbol\theta$ 与 $\mathbf e_{\mathrm{vec}}$ 一般非凸，数值优化器不保证达到全局最优；实现中通过**最小化负目标** $-J$、用 Adam [25] 求解 (42) 的数值解，并对受约束参数重参数化，使优化在无约束空间中进行。所得预测器把估计的定位误差与模型参数作为**插件估计**使用，而非对其后验不确定性做边缘化。完整流程见算法 2。

**算法 2　无线电地图构建与传播参数、位置误差的联合估计**

```text
输入: 数据集 D、发送机位置 x_Tx、发射功率 P_Tx、误差先验均值 μ_s、误差先验协方差 Σ_s、查询点集 X*
输出: 无线电地图 {p̂(x*)}、估计模型参数 θ̂、估计定位误差 ê_vec、校正位置 X̂
1: 由 D 构造 X̃ 与 p
2: 初始化 θ 与 e_vec
3: 用 Adam 最小化 −J(θ, e_vec)，数值求解式 (42)，得 θ̂ 与 ê_vec
4: 按式 (46) 构造校正位置矩阵 X̂
5: 按式 (29) 构造 m_{θ̂,X̂}
6: 按式 (32) 构造 K_{θ̂,X̂}，按式 (47) 构造 C_{θ̂,X̂}
7: for 所有 x* ∈ X* do
8:     按式 (48) 构造 k_{θ̂,X̂}(x*)
9:     按式 (49) 计算 p̂(x*)
10: end for
11: return {p̂(x*)}, θ̂, ê_vec, X̂
```

### B. 无线电地图构建

令 $\widehat{\mathbf e}^{(i)}$ 表示传感器 $i$ 的估计定位误差，其第 $j$ 个测量位置的校正估计为

$$
\widehat{\mathbf x}_j^{(i)}=\widetilde{\mathbf x}_j^{(i)}-\widehat{\mathbf e}^{(i)}.\tag{43}
$$

采用全局测量索引，令

$$
\widehat{\mathbf e}_n\triangleq\widehat{\mathbf e}^{(i_n)},\tag{44}
$$
$$
\widehat{\mathbf x}_n\triangleq\widetilde{\mathbf x}_n-\widehat{\mathbf e}_n.\tag{45}
$$

校正位置收集为

$$
\widehat{\mathbf X}\triangleq[\widehat{\mathbf x}_1,\ldots,\widehat{\mathbf x}_{M_N}]^{\top}\in\mathbb R^{M_N\times2}.\tag{46}
$$

利用估计参数与校正位置，协方差矩阵为

$$
\mathbf C_{\widehat{\boldsymbol\theta},\widehat{\mathbf X}}=\mathbf K_{\widehat{\boldsymbol\theta},\widehat{\mathbf X}}+\widehat\sigma_p^{2}\mathbf I.\tag{47}
$$

查询点 $\mathbf x^{*}$ 与校正测量位置之间的互协方差向量元素为

$$
\left[\mathbf k_{\widehat{\boldsymbol\theta},\widehat{\mathbf X}}(\mathbf x^{*})\right]_n=k_{\exp,\widehat{\boldsymbol\theta}}(\mathbf x^{*},\widehat{\mathbf x}_n),\qquad n=1,\ldots,M_N.\tag{48}
$$

$\mathbf x^{*}$ 处的 RSS 由后验均值估计：

$$
\widehat p(\mathbf x^{*})=m_{\widehat{\boldsymbol\theta}}(\mathbf x^{*})+\mathbf k_{\widehat{\boldsymbol\theta},\widehat{\mathbf X}}^{\top}(\mathbf x^{*})\mathbf C_{\widehat{\boldsymbol\theta},\widehat{\mathbf X}}^{-1}\left(\mathbf p-\mathbf m_{\widehat{\boldsymbol\theta},\widehat{\mathbf X}}\right).\tag{49}
$$

对查询点求 (49) 即得无线电地图。

## V. 性能界分析

本节以条件 Bayes 风险为基准分析所提方法的性能。$E_{\boldsymbol\theta}[\cdot]$ 表示在 $\boldsymbol\theta$ 固定于真值的生成模型下的期望，对真值测量轨迹、定位误差、阴影场、测量噪声以及（必要时）估计器内部随机性取期望。评估点集 $\mathbf X^{*}=\{\mathbf x^{*,1},\ldots,\mathbf x^{*,M^{*}}\}$ 假设确定，且评估点本身不含定位误差。评估点处的真值无线电地图值为

$$
\mathbf f^{*}\triangleq[f(\mathbf x^{*,1}),\ldots,f(\mathbf x^{*,M^{*}})]^{\top}\in\mathbb R^{M^{*}}.\tag{50}
$$

令包含全部真值测量位置的矩阵为

$$
\mathbf X=[\mathbf x_1,\ldots,\mathbf x_{M_N}]^{\top}\in\mathbb R^{M_N\times2},\tag{51}
$$

其中 $\mathbf X$ 假设为服从轨迹生成律的随机变量，其密度记为 $p_{\mathbf X}(\mathbf X)$。定位误差向量的联合先验密度为

$$
p_{\mathrm e}(\mathbf e_{\mathrm{vec}})\triangleq\prod_{i=1}^{N}\phi\left(\mathbf e^{(i)};\boldsymbol\mu_s,\boldsymbol\Sigma_s\right).\tag{52}
$$

对给定 $\mathbf X$ 与 $\boldsymbol\theta$，令 $p_{\mathrm{GP}}(\mathbf p\mid\mathbf X,\boldsymbol\theta)$ 表示 GP 观测模型诱导的 RSS 观测向量多元高斯密度。由观测数据 $\mathcal D$ 与内部随机变量 $Z_\delta$（与 $\mathcal D$ 和真值生成过程独立）构造的任意估计器写作

$$
\widehat{\mathbf f}_\delta=\delta(\mathcal D,Z_\delta).\tag{53}
$$

估计器 $\delta$ 的风险定义为每个评估点的 MSE：

$$
R_\delta(\boldsymbol\theta)=\frac{1}{M^{*}}\mathbb E_{\boldsymbol\theta}\left[\left\lVert\mathbf f^{*}-\widehat{\mathbf f}_\delta\right\rVert_2^{2}\right].\tag{54}
$$

对固定上报位置 $\widetilde{\mathbf X}$，对应定位误差向量 $\mathbf e_{\mathrm{vec}}$ 的真值测量位置由前文定义的 $\mathbf X(\mathbf e_{\mathrm{vec}})$ 确定。因此在真值生成模型下，定位误差的后验密度为

$$
\pi_{\mathrm{true}}(\mathbf e_{\mathrm{vec}}\mid\mathcal D,\boldsymbol\theta)\propto p_{\mathrm{GP}}(\mathbf p\mid\mathbf X(\mathbf e_{\mathrm{vec}}),\boldsymbol\theta)\,p_{\mathrm e}(\mathbf e_{\mathrm{vec}})\,p_{\mathbf X}(\mathbf X(\mathbf e_{\mathrm{vec}})).\tag{55}
$$

因此除 RSS 观测似然与定位误差先验外，真值后验还取决于**校正后的测量轨迹在轨迹生成律下有多可信**。对固定定位误差向量 $\mathbf e_{\mathrm{vec}}$，GP 在评估点处的后验均值为

$$
\boldsymbol\mu_{\mathrm{GP}}(\mathbf e_{\mathrm{vec}};\mathcal D,\boldsymbol\theta)=\mathbf m_{\boldsymbol\theta,\mathbf X^{*}}+\mathbf K_{*\mathbf X(\mathbf e_{\mathrm{vec}})}\mathbf C_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}^{-1}\left[\mathbf p-\mathbf m_{\boldsymbol\theta,\mathbf X(\mathbf e_{\mathrm{vec}})}\right].\tag{56}
$$

### A. Bayes 风险与超额风险

在平方误差损失下，给定 $\boldsymbol\theta$ 固定的 Bayes 最优估计器为

$$
\widehat{\mathbf f}^{\mathrm B}\triangleq\mathbb E_{\boldsymbol\theta}[\mathbf f^{*}\mid\mathcal D],\tag{57}
$$

由迭代期望律可写为

$$
\widehat{\mathbf f}^{\mathrm B}=\int\boldsymbol\mu_{\mathrm{GP}}(\mathbf e_{\mathrm{vec}};\mathcal D,\boldsymbol\theta)\,\pi_{\mathrm{true}}(\mathbf e_{\mathrm{vec}}\mid\mathcal D,\boldsymbol\theta)\,\mathrm d\mathbf e_{\mathrm{vec}}.\tag{58}
$$

该估计器达到的 Bayes 风险为

$$
L_{\mathrm B}(\boldsymbol\theta)=\frac{1}{M^{*}}\mathbb E_{\boldsymbol\theta}\left[\left\lVert\mathbf f^{*}-\widehat{\mathbf f}^{\mathrm B}\right\rVert_2^{2}\right]=\frac{1}{M^{*}}\mathbb E_{\boldsymbol\theta}\left[\operatorname{tr}\left\{\operatorname{Cov}_{\boldsymbol\theta}\left(\mathbf f^{*}\mid\mathcal D\right)\right\}\right].\tag{59}
$$

因此 $L_{\mathrm B}$ 是从观测数据可达到的最小 MSE。由于 $p_{\mathbf X}$ 与定位误差以非线性方式同时影响 GP 均值与协方差，$\widehat{\mathbf f}^{\mathrm B}$ 与 $L_{\mathrm B}$ 一般难以闭式求值。因 $\widehat{\mathbf f}^{\mathrm B}$ 是给定 $\mathcal D$ 下 $\mathbf f^{*}$ 的条件均值，条件期望的正交性给出

$$
\mathbb E_{\boldsymbol\theta}\left[\left(\mathbf f^{*}-\widehat{\mathbf f}^{\mathrm B}\right)^{\top}\left(\widehat{\mathbf f}^{\mathrm B}-\widehat{\mathbf f}_\delta\right)\right]=0.\tag{60}
$$

因此对任意估计器 $\delta$，

$$
R_\delta(\boldsymbol\theta)=L_{\mathrm B}(\boldsymbol\theta)+G_\delta(\boldsymbol\theta),\tag{61}
$$

其中

$$
G_\delta(\boldsymbol\theta)\triangleq\frac{1}{M^{*}}\mathbb E_{\boldsymbol\theta}\left[\left\lVert\widehat{\mathbf f}_\delta-\widehat{\mathbf f}^{\mathrm B}\right\rVert_2^{2}\right]\ge0\tag{62}
$$

为估计器 $\delta$ 的**超额风险**。(61) 因此把风险分解为不可约的 Bayes 风险与相对 Bayes 最优估计器的额外损失，例如从观测估计未知传播参数、以及模型失配带来的损失。

### B. Oracle 下界

由于真值生成模型下 $L_{\mathrm B}$ 一般不可解，本文引入一个除观测数据 $\mathcal D$ 外还能访问真值测量位置 $\mathbf X$ 的 **oracle 估计器**，并用其风险作为 $L_{\mathrm B}$ 的下界：

$$
\widehat{\mathbf f}^{\mathrm{or}}\triangleq\mathbb E_{\boldsymbol\theta}[\mathbf f^{*}\mid\mathcal D,\mathbf X].\tag{63}
$$

在假设的独立性关系下，一旦给定 $\mathbf X$ 与 RSS 观测 $\mathbf p$，再额外给定上报位置 $\widetilde{\mathbf X}$ 不改变 $\mathbf f^{*}$ 的条件分布，故

$$
\widehat{\mathbf f}^{\mathrm{or}}=\mathbb E_{\boldsymbol\theta}[\mathbf f^{*}\mid\mathbf X,\mathbf p].\tag{64}
$$

对固定 $\boldsymbol\theta$ 与 $\mathbf X$，$\mathbf f^{*}$ 与 $\mathbf p$ 联合高斯。定义评估点之间、评估点与测量点之间、以及测量点之间的核矩阵：

$$
\mathbf K_{**}\triangleq\left[k_{\exp,\boldsymbol\theta}(\mathbf x^{*,m},\mathbf x^{*,n})\right]_{m,n=1}^{M^{*}},\tag{65}
$$
$$
\mathbf K_{*\mathbf X}\triangleq\left[k_{\exp,\boldsymbol\theta}(\mathbf x^{*,m},\mathbf x_n)\right]_{m=1,\ldots,M^{*};\ n=1,\ldots,M_N},\qquad \mathbf K_{\mathbf X*}\triangleq\mathbf K_{*\mathbf X}^{\top},\tag{66}
$$
$$
\mathbf K_{\mathbf X\mathbf X}\triangleq\left[k_{\exp,\boldsymbol\theta}(\mathbf x_m,\mathbf x_n)\right]_{m,n=1}^{M_N}.\tag{67}
$$

由高斯条件化，oracle 估计器的后验协方差为

$$
\boldsymbol\Sigma_{\mathrm{or}}(\boldsymbol\theta;\mathbf X)=\mathbf K_{**}-\mathbf K_{*\mathbf X}\left(\mathbf K_{\mathbf X\mathbf X}+\sigma_p^{2}\mathbf I\right)^{-1}\mathbf K_{\mathbf X*}.\tag{68}
$$

因此对给定真值测量位置矩阵 $\mathbf X$ 的条件 MSE 为

$$
\ell_{\mathrm{or}}(\boldsymbol\theta;\mathbf X)\triangleq\frac{1}{M^{*}}\operatorname{tr}\left[\boldsymbol\Sigma_{\mathrm{or}}(\boldsymbol\theta;\mathbf X)\right],\tag{69}
$$

在生成模型下对其取平均即得 oracle 风险

$$
L_{\mathrm{or}}(\boldsymbol\theta)\triangleq\mathbb E_{\boldsymbol\theta}\left[\ell_{\mathrm{or}}(\boldsymbol\theta;\mathbf X)\right].\tag{70}
$$

由于 $\widehat{\mathbf f}^{\mathrm{or}}$ 是比仅用 $\mathcal D$ 拥有更多信息的条件均值估计器，条件期望的投影性质给出

$$
L_{\mathrm{or}}(\boldsymbol\theta)\le L_{\mathrm B}(\boldsymbol\theta),\tag{71}
$$

故 $L_{\mathrm{or}}$ 为 Bayes 风险提供下界。

### C. Working-model 上界及其紧性

仅由可观测信息 $\mathcal D$ 构造的任意估计器的风险不低于 $L_{\mathrm B}$。本文因此引入一个 **working-model 估计器**作为分析参考：其中上报位置 $\widetilde{\mathbf X}$ 被视为**固定设计**，真值后验中出现的轨迹密度 $p_{\mathbf X}(\mathbf X(\mathbf e_{\mathrm{vec}}))$ **不被使用**。相应地，working-model 后验定义为

$$
\pi_{\mathrm{work}}(\mathbf e_{\mathrm{vec}}\mid\mathcal D,\boldsymbol\theta)\propto p_{\mathrm{GP}}(\mathbf p\mid\mathbf X(\mathbf e_{\mathrm{vec}}),\boldsymbol\theta)\,p_{\mathrm e}(\mathbf e_{\mathrm{vec}}).\tag{72}
$$

在该后验下对定位误差做边缘化所得的预测器定义为

$$
\widehat{\mathbf f}^{\mathrm{work}}\triangleq\int\boldsymbol\mu_{\mathrm{GP}}(\mathbf e_{\mathrm{vec}};\mathcal D,\boldsymbol\theta)\,\pi_{\mathrm{work}}(\mathbf e_{\mathrm{vec}}\mid\mathcal D,\boldsymbol\theta)\,\mathrm d\mathbf e_{\mathrm{vec}}.\tag{73}
$$

其风险为

$$
R_{\mathrm{work}}(\boldsymbol\theta)\triangleq\frac{1}{M^{*}}\mathbb E_{\boldsymbol\theta}\left[\left\lVert\mathbf f^{*}-\widehat{\mathbf f}^{\mathrm{work}}\right\rVert_2^{2}\right].\tag{74}
$$

由于 $\widehat{\mathbf f}^{\mathrm B}$ 是基于 $\mathcal D$ 的条件均值估计器，

$$
R_{\mathrm{work}}(\boldsymbol\theta)=L_{\mathrm B}(\boldsymbol\theta)+\frac{1}{M^{*}}\mathbb E_{\boldsymbol\theta}\left[\left\lVert\widehat{\mathbf f}^{\mathrm{work}}-\widehat{\mathbf f}^{\mathrm B}\right\rVert_2^{2}\right],\tag{75}
$$

因此

$$
L_{\mathrm B}(\boldsymbol\theta)\le U_{\mathrm{work}}(\boldsymbol\theta),\tag{76}
$$

其中 $U_{\mathrm{work}}\triangleq R_{\mathrm{work}}$，即 $U_{\mathrm{work}}$ 为 Bayes 风险提供上界。该上界关系**不要求** working model 与真值生成模型一致，也不要求 $\widehat{\mathbf f}^{\mathrm{work}}$ 接近真值 Bayes 最优估计器。

把真值后验与 (72) 的 working-model 后验结合，二者密度比为

$$
\frac{\pi_{\mathrm{true}}(\mathbf e_{\mathrm{vec}}\mid\mathcal D,\boldsymbol\theta)}{\pi_{\mathrm{work}}(\mathbf e_{\mathrm{vec}}\mid\mathcal D,\boldsymbol\theta)}=c(\mathcal D,\boldsymbol\theta)\,p_{\mathbf X}\left(\mathbf X(\mathbf e_{\mathrm{vec}})\right),\tag{77}
$$

其中 $c(\mathcal D,\boldsymbol\theta)$ 与 $\mathbf e_{\mathrm{vec}}$ 无关。因此若轨迹生成律在相关支撑上**平移不变**，则比值不依赖于平移，两种后验在平移方向上的差异消失；但在有界区域上边界效应会破坏该不变性，故数值评估中**不假设**该等式精确成立。

同样的平移不变性也澄清了**仅凭上报轨迹**可获得的传感器特定常值偏移信息。不使用 RSS 观测时，给定上报位置的定位误差向量后验满足

$$
p(\mathbf e_{\mathrm{vec}}\mid\widetilde{\mathbf X})\propto p_{\mathrm e}(\mathbf e_{\mathrm{vec}})\,p_{\mathbf X}\left(\mathbf X(\mathbf e_{\mathrm{vec}})\right).\tag{78}
$$

因此当轨迹律在相关支撑上平移不变时，**上报轨迹不会更新常值偏移的先验分布**。绝对偏移信息此时必须由绝对位置约束（如道路网络、可通行区域、已知锚点）或额外观测提供。在所提方法中，RSS 观测正是通过第 IV 节描述的距离相关均值与传感器间空间协方差结构提供该信息。

### D. Bayes 风险与超额风险的界

由 (71) 与 (76)，

$$
L_{\mathrm{or}}(\boldsymbol\theta)\le L_{\mathrm B}(\boldsymbol\theta)\le U_{\mathrm{work}}(\boldsymbol\theta)\tag{79}
$$

成立。因此对任意估计器 $\delta$（其中 $G_\delta=R_\delta-L_{\mathrm B}$），可得

$$
\left(R_\delta(\boldsymbol\theta)-U_{\mathrm{work}}(\boldsymbol\theta)\right)^{+}\le G_\delta(\boldsymbol\theta)\le R_\delta(\boldsymbol\theta)-L_{\mathrm{or}}(\boldsymbol\theta),\tag{80}
$$

其中 $(\cdot)^{+}$ 表示正部。因此在不知道真值 Bayes 风险的情况下，仍可把任一估计器的超额风险**夹在**可计算区间内。本文把该界应用于两个估计器：第 IV 节所提方法（风险与超额风险记为 $R_{\mathrm{prop}}(\boldsymbol\theta)$ 与 $G_{\mathrm{prop}}(\boldsymbol\theta)$）与第 III 节的位置误差不可知基线（$R_{\mathrm{base}}(\boldsymbol\theta)$ 与 $G_{\mathrm{base}}(\boldsymbol\theta)$），并在第 VI 节评估二者的超额风险区间。

**表 I：参考条件。**

| 参数 | 取值 |
|---|---|
| 仿真区域 $\mathcal A$ | $300\times300$ m |
| 参考距离 $d_0$ | 1.0 m |
| BS 位置 $\mathbf x_{\mathrm{Tx}}$ | $[0,150]$ |
| 发射功率 $P_{\mathrm{Tx}}$ | 10 dBm |
| 路径损耗指数 $\eta$ | 3.0 |
| 阴影方差 $\sigma_f^{2}$ | 64 dB² |
| 相关距离 $d_{\mathrm{cor}}$ | 20 m |
| 测量噪声方差 $\sigma_p^{2}$ | 1.0 dB² |
| 传感器数 $N$ | 20 |
| 测量间隔 | 20 s |
| 每传感器观测时长 | 1800 s |
| $\boldsymbol\theta$ 学习率 | 0.24 |
| $\mathbf e_{\mathrm{vec}}$ 学习率 | 0.6 |
| Lévy 游走参数 $\alpha$ | 0.5 |
| Lévy 游走参数 $\beta$ | 1.0 |

working-model 上界中的积分一般不能闭式求值，本文引入从定位误差先验 $p_{\mathrm e}$ 到 $\pi_{\mathrm{work}}$ 的 **tempering 路径**

$$
\pi_\lambda(\mathbf e_{\mathrm{vec}})\propto p_{\mathrm{GP}}(\mathbf p\mid\mathbf X(\mathbf e_{\mathrm{vec}}),\boldsymbol\theta)^{\lambda}\,p_{\mathrm e}(\mathbf e_{\mathrm{vec}}),\qquad\lambda\in[0,1],\tag{81}
$$

并用自适应 tempered 序贯 Monte Carlo 近似 $\widehat{\mathbf f}^{\mathrm{work}}$。

## VI. 数值评估

本节通过 **1000 次独立数值试验**评估无线电地图估计性能。利用第 V 节的 oracle 下界与 working-model 上界，还评估所提方法与位置误差不可知基线的超额风险。表 I 的参数作为**参考条件**。真值测量轨迹由 Lévy 游走生成：每个传感器从区域内的均匀随机位置出发，按带有表 I 参数的 Lévy 游走移动，观测时长 1800 s、测量间隔 20 s，故每个传感器有 $M^{(i)}=90$ 个测量。

### A. 无线电地图精度性能

图 3 给出一个仿真示例，包括传感器轨迹与所提方法得到的校正轨迹；图 4 给出不同方法下无线电地图估计 MSE 的 CDF。比较的方法为**理想 GPR**（使用真值位置，作为性能上界）、**所提方法**、**位置误差不可知 GPR**（直接使用上报位置）与**含噪输入 GPR**（把位置误差近似为额外输出噪声）。可以看到：位置误差不可知与含噪输入 GPR 的 MSE 均显著高于理想 GPR，说明轨迹级偏移无法通过这些常规处理消除；所提方法则把与理想 GPR 的 MSE 差距缩小到约 **3.26 dB²**，而两个基线约为 **10 dB²**。

### B. 与 Bayes 最优性能的偏差

图 5 给出传播参数对中位 MSE 的影响，扫描路径损耗指数 $\eta$、阴影方差 $\sigma_f^{2}$ 与相关距离 $d_{\mathrm{cor}}$；图 6 给出对应的**超额风险比**。图 6 中的阴影区域表示由第 V 节界得到的**区间**而非统计置信区间。可以看到：区间随 $\sigma_f$ 的变化很小，尽管绝对 MSE 显著上升，说明更大的阴影方差影响的是绝对精度而非估计器的相对效率。图 6(c) 中，区间随 $d_{\mathrm{cor}}$ 增大而变窄，因为更宽的相关范围提供更多携带相对定位偏移信息的**传感器间测量对**，这正是所提方法所利用的。图 6(d) 中，两个区间在噪声主导区域收敛：这并非因为基线的绝对精度提高，而是因为强测量噪声增加了不可约的误差成分，使位置校正的收益在噪声主导区变得可忽略。

## VII. 基于实测 GNSS 误差的评估

第 VI 节假设准静态偏移模型与数据生成完全匹配。本节改用由**实测智能手机 GNSS 定位误差**导出的误差模型，其中包含所提方法**未显式建模的时变误差分量**，以检验模型失配下的稳健性。RSS 观测与真值轨迹仍为仿真生成，实测 GNSS 数据只用于构造定位误差模型。

### A. GNSS 导出的误差模型与评估设置

令 $\mathbf x_{\mathrm{ref},k}\in\mathbb R^{2}$ 与 $\mathbf x_{\mathrm{obs},k}\in\mathbb R^{2}$ 分别表示 1 Hz 时间索引 $k$ 处的参考位置与智能手机上报位置。实测定位误差可分解为**准静态分量** $\mathbf a$ 与**时变残差** $\mathbf u_k$：

$$
\mathbf e_{\mathrm{obs},k}\triangleq\mathbf x_{\mathrm{obs},k}-\mathbf x_{\mathrm{ref},k}=\mathbf a+\mathbf u_k.\tag{82}
$$

对每个轴 $q\in\{x,y\}$，残差用 AR(2) 过程建模：

$$
u_{q,k}=\omega_{q,1}u_{q,k-1}+\omega_{q,2}u_{q,k-2}+\epsilon_{q,k},\qquad\epsilon_{q,k}\sim\mathcal N\left(0,\sigma_q^{2}\right).\tag{83}
$$

准静态分量 $\mathbf a$ 对应所提方法假设的传感器特定定位偏移，而 $\mathbf u_k$ 表示所提方法**未显式建模**的时变分量。误差模型由 GNSS 实测识别：参考轨迹由 RTK 定位的 u-blox ZED-F9R 给出，观测轨迹由两台智能手机 motorola edge 40 neo 与 moto g24 采集；前者配备双频 GNSS 模块，后者为单频模块。位置以 5 Hz（ZED-F9R）与 1 Hz（手机）记录，分别得到 1249 与 1251 个观测位置。详细测量配置、观测轨迹、识别出的 AR(2) 参数与验证结果见附录 A 与表 II。

为使识别出的误差模型与第 VI 节 20 s 测量间隔一致，每个 1 Hz AR(2) 模型被近似为**匹配滞后 0、20、40 s 平稳自协方差**的 20 s AR(2) 模型，对应的 Yule–Walker 构造见附录 A。

与第 VI 节类似，每次试验独立生成 $N=20$ 个传感器的真值轨迹。由于实测 $\mathbf a$ 是与具体设备相关的实现，它们不被同时赋给所有仿真传感器；传感器 $i$ 的准静态定位偏差改为

$$
\mathbf b^{(i)}\sim\mathcal N\left(\mathbf 0,100\mathbf I\right).\tag{84}
$$

令 $\bar{\mathbf u}_n^{(i)}$ 表示由相应 20 s AR(2) 模型生成的独立残差序列，则观测位置生成为

$$
\widetilde{\mathbf x}_n^{(i)}=\mathbf x_n^{(i)}+\mathbf b^{(i)}+\mathbf u_n^{(i)}.\tag{85}
$$

AR(2) 状态从其平稳分布初始化。所提方法所用常值定位偏差先验也设为 $\mathcal N(\mathbf 0,100\mathbf I)$，故准静态分量在**数据生成模型与所提方法之间统计匹配**，而额外的时变 AR(2) 残差构成**刻意的定位误差模型失配**。

作为对照，本文使用 **KF–RTS 基线**：其线性高斯状态空间模型包含传感器位置与速度、传感器特定常值偏差以及 AR(2) 残差。基线获得与生成定位误差相同的 20 s AR(2) 系数与创新方差，但不获得真值位置、真实偏差与真实残差；KF–RTS 平滑阶段只使用 GNSS 观测轨迹，RSS 观测只在后续 GPR 阶段引入。完整状态空间模型与初始化见附录 B。

### B. 时间相关定位误差下的无线电地图估计性能

采用第 VII-A 节设置、与第 VI 节参考条件相同的传播参数与真值轨迹生成条件，对每台设备做 **1000 次独立试验**。由于所提方法只估计传感器特定**常值**定位偏差，(85) 中时变 AR(2) 残差构成刻意的模型失配。图 7 给出各方法所得无线电地图 MSE 的 CDF。尽管 **KF + RTS Smoother** 获得了生成定位误差所用的 AR(2) 动态，其在当前评估条件下的地图估计性能却接近 **Without Correction**（不做校正）。这与第 V-C 节描述的平移模糊一致，也由附录 B 的状态空间模型形式化：KF + RTS 平滑器可利用时间相关估计时变 AR(2) 残差，但 GNSS 轨迹似然**无法把传感器特定准静态偏差与真值轨迹的常值平移分开**。因此这两个分量的分离只能由**绝对位置与偏差先验**决定，平滑后的轨迹中仍可残留传感器级平移；由于所得位置随后作为 GPR 输入，该残余误差会传入地图估计。

与之相对，所提方法尽管同样不显式建模时变误差，仍一致优于位置误差不可知基线与 KF + RTS 平滑基线。中位 MSE 距理想 GPR 约 **5 dB²**以内。这表明：利用 RSS 的空间结构**同时**做地图构建与后置位置校准，在时间相关定位误差下是有效的。

## VIII. 结论

本文研究了准静态定位偏移下的无线电地图构建问题。由于时间相关的 GNSS 误差会一致地平移整条感知轨迹，增加测量数无法消除由此产生的系统性空间配准错误。本文把主要定位误差建模为传感器特定准静态偏移，并在 GPR 框架中与传播参数联合估计，同时利用距离相关路径损耗（径向绝对信息）与空间相关阴影（传感器间相对信息）。本文还建立了条件 Bayes 风险的下界与上界：oracle 下界、working-model 上界，以及由此得到的任一估计器超额风险夹逼；并证明在平移不变的轨迹模型下，仅凭轨迹无法辨识准静态偏移，从而在原理上说明必须利用 RSS 导出的空间信息。数值评估表明：所提方法把相对理想 GPR 的 MSE 差距缩到约 3.26 dB²，而位置误差不可知与含噪输入基线约为 10 dB²；用实测 GNSS 误差模型评估时，尽管存在未建模的时变误差，所提方法仍优于 KF–RTS 平滑基线，中位 MSE 距理想 GPR 约 5 dB²以内。

未来工作的一个有趣方向是通过 $p_{\mathbf X}$ 及校准目标中相应的轨迹密度项，把**绝对位置约束**（道路网络、可通行区域、已知锚点）纳入框架，从而打破平移对称性、为传感器特定偏移提供额外信息。

## 附录 A：GNSS 误差模型及其 20 s 近似的细节

本附录详述第 VII 节所用 GNSS 测量与 20 s AR(2) 误差模型的构造。先描述 GNSS 测量流程并验证由实测定位误差识别的 AR(2) 模型，再说明数值评估所用近似 20 s AR(2) 模型的构造。

### A. GNSS 测量与 AR(2) 模型验证

GNSS 测量于 2025 年 6 月 6 日在电气通信大学校园内采集。参考轨迹由 u-blox ZED-F9R 的 RTK 定位获得，GNSS 观测轨迹由两台 Motorola 智能手机 motorola edge 40 neo 与 moto g24 采集。位置由 ZED-F9R 以 5 Hz、手机以 1 Hz 记录，分别得到 motorola edge 40 neo 的 1249 个与 moto g24 的 1251 个观测位置。测量装置与观测轨迹分别见图 8 与图 9。由 (82) 与 (83) 识别出的误差模型参数汇总于表 II：$\mathbf a$ 为各测量序列得到的准静态偏移，AR(2) 系数与创新标准差刻画 1 Hz 时变残差。实测定位误差与由识别 AR(2) 模型生成的误差直方图见图 10，相应自相关函数（ACF）见图 11。尽管实测与生成的边缘分布存在差异，AR(2) 模型近似再现了实测自相关的**强度与衰减特性**。因此 AR(2) 模型**并非**要再现 GNSS 定位误差的完整边缘分布，而是提供第 VII 节所关心的**时间相关性**的、由测量数据校正的近似。实测序列还表明，在扣除准静态偏移后仍存在强时间相关分量，这正说明该节做模型失配评估的必要性。

### B. 20 s AR(2) 模型的构造

表 II 的 AR(2) 模型由 1 Hz 采样的 GNSS 定位误差序列识别，而第 VI 节的数值评估使用 20 s 测量间隔。直接在 20 s 采样间隔上使用 1 Hz 的 AR(2) 系数不会保持原过程的时间相关性，因此本文通过**匹配选定的平稳自协方差**来构造 20 s 间隔上的近似 AR(2) 模型。对每个轴 $q\in\{x,y\}$，令 1 Hz AR(2) 过程的平稳自协方差为

$$
\gamma_q(\ell)\triangleq\mathbb E\left[u_{q,k}u_{q,k-\ell}\right].\tag{86}
$$

20 s 间隔的近似 AR(2) 过程写作

$$
\bar u_{q,n}=\omega_{q,1}\bar u_{q,n-1}+\omega_{q,2}\bar u_{q,n-2}+\epsilon_{q,n},\qquad\bar\epsilon_{q,n}\sim\mathcal N\left(0,\bar\sigma_q^{2}\right),\tag{87}
$$

其中 $\{\bar\omega_{q,1},\bar\omega_{q,2},\bar\sigma_q^{2}\}$ 由 Yule–Walker 方程令 20 s 模型在滞后 0、20、40 s 处的平稳自协方差与 1 Hz 模型对应滞后（即 $\gamma_q(0)$、$\gamma_q(20)$、$\gamma_q(40)$）相等而定出。

## 附录 B：KF–RTS 基线的状态空间模型

附录 B 给出第 VII-A 节 KF–RTS 基线的完整状态空间模型与初始化。传感器 $i$ 在时间 $n$ 的状态为

$$
\mathbf s_n^{(i)}=\left[p_{x,n}^{(i)},\ v_{x,n}^{(i)},\ p_{y,n}^{(i)},\ v_{y,n}^{(i)},\ b_x^{(i)},\ b_y^{(i)},\ u_{x,n}^{(i)},\ u_{x,n-1}^{(i)},\ u_{y,n}^{(i)},\ u_{y,n-1}^{(i)}\right]^{\top},\tag{88}
$$

其中 $\mathbf p_n^{(i)}=[p_{x,n}^{(i)},p_{y,n}^{(i)}]^{\top}$ 与 $\mathbf v_n^{(i)}$ 为真值位置与速度，$\mathbf b^{(i)}$ 为传感器特定常值定位偏差，$\mathbf u_n^{(i)}$ 为 AR(2) 残差。对每个轴 $q\in\{x,y\}$，真值位置与速度服从**常速模型**

$$
\begin{bmatrix}p_{q,n}^{(i)}\\ v_{q,n}^{(i)}\end{bmatrix}=\begin{bmatrix}1 & \Delta t\\ 0 & 1\end{bmatrix}\begin{bmatrix}p_{q,n-1}^{(i)}\\ v_{q,n-1}^{(i)}\end{bmatrix}+\mathbf w_{q,n}^{(i)},\tag{89}
$$

其中过程噪声建模为

$$
\mathbf w_{q,n}^{(i)}\sim\mathcal N\left(\mathbf 0,\mathbf Q_q\right),\tag{90}
$$

$\Delta t$ 为采样间隔、$\mathbf Q_q$ 为常速模型的过程噪声协方差。AR(2) 残差按 (83) 演变，21 的常值偏差状态保持不变，观测方程为

$$
\mathbf z_n^{(i)}=\begin{bmatrix}p_{x,n}^{(i)}+b_x^{(i)}+u_{x,n}^{(i)}\\ p_{y,n}^{(i)}+b_y^{(i)}+u_{y,n}^{(i)}\end{bmatrix}+\boldsymbol\nu_n^{(i)},\tag{91}
$$

其中 $\mathbf z_n^{(i)}$ 为上报位置、$\boldsymbol\nu_n^{(i)}$ 为观测噪声。由于 (85) 的仿真观测不含 AR(2) 残差之外的额外白噪声，取 $\boldsymbol\nu_n^{(i)}=\mathbf 0$。

对初始位置，把 $300\times300$ m 仿真区域上的均匀分布做矩匹配的高斯近似：

$$
\mathbb E[\mathbf p_0]=[150,150]^{\top},\qquad\operatorname{Cov}(\mathbf p_0)=7500\mathbf I.\tag{92}
$$

进一步取

$$
\mathbb E[\mathbf v_0]=\mathbf 0,\qquad\operatorname{Cov}(\mathbf v_0)=2\mathbf I,\qquad\mathbf b^{(i)}\sim\mathcal N(\mathbf 0,100\mathbf I),\tag{93}
$$

并把 AR(2) 状态从其平稳分布初始化。

先对状态空间模型做**前向 KF**，再对整段观测序列做**固定区间 RTS 平滑**；平滑后的位置 $\widehat{\mathbf p}_{n,\mathrm{RTS}}^{(i)}$ 作为后续 GPR 的训练位置。在比较中，KF–RTS 平滑器获得与生成定位误差相同的 20 s AR(2) 系数与创新方差，但不获得真值位置、真实常值偏差与实现的 AR(2) 残差。仅 GNSS 观测轨迹用于位置平滑，RSS 观测只在后续 GPR 阶段引入。

该状态空间模型的转移与观测似然对传感器级变换 $\mathbf p_n^{(i)}\mapsto\mathbf p_n^{(i)}+\mathbf c^{(i)}$、$\mathbf b^{(i)}\mapsto\mathbf b^{(i)}-\mathbf c^{(i)}$（任意常向量 $\mathbf c^{(i)}\in\mathbb R^{2}$）**不变**。因此，除由初始位置与偏差先验引入的绝对位置信息外，仅 GNSS 轨迹似然**无法**把轨迹的常值平移与相应传感器特定定位偏差区分开。即使时间 AR(2) 动态被正确指定，仅靠时间平滑也不提供解决该准静态平移模糊的额外似然信息。这与第 V-C 节关于仅凭轨迹可辨识性的讨论一致。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 30 条，源文 pp. 15—16）。

[1] K. Kanzaki and K. Sato, "Joint Ex-Post Location Calibration and Radio Map Construction under Biased Positioning Errors," in 2025 IEEE Globecom Workshops, Dec. 2025, pp. 2071–2076.

[2] D. Romero and S.-J. Kim, "Radio Map Estimation: A data-driven approach to spectrum cartography," IEEE Signal Process. Mag., vol. 39, no. 6, pp. 53–72, Nov. 2022.

[3] S. Bi, J. Lyu, Z. Ding, and R. Zhang, "Engineering Radio Maps for Wireless Resource Management," IEEE Wireless Commun., vol. 26, no. 2, pp. 133–141, Apr. 2019.

[4] X. Zhang, W. Sun, J. Zheng, A. Lin, J. Liu, and S. S. Ge, "Wi-Fi-Based Indoor Localization With Interval Random Analysis and Improved Particle Swarm Optimization," IEEE Trans. Mobile Comput., vol. 23, no. 10, pp. 9120–9134, Oct. 2024.

[5] A. C. Suarez Rodriguez, N. Haider, Y. He, and E. Dutkiewicz, "Network Optimisation in 5G Networks: A Radio Environment Map Approach," IEEE Trans. Veh. Technol., vol. 69, no. 10, pp. 12 043–12 057, Oct. 2020.

[6] D.-H. Tran, N. Waheed, Y. M. Saputra, X. Lin, C. T. Nguyen, T. S. Abdu, V. N. Vo, V.-Q. Pham, M. Alsenwi, A. B. M. Adam, S. Chatzinotas, E. Lagunas, H. Tran, T. H. Dac, and N. V. Huynh, "Network Digital Twin for 6G and Beyond: An End-to-End View Across Multi-Domain Network Ecosystems," IEEE Open J. Commun. Soc., vol. 6, pp. 6866–6911, 2025.

[7] H. Wang, J. Zhang, G. Nie, L. Yu, Z. Yuan, T. Li, J. Wang, and G. Liu, "Digital Twin Channel for 6G: Concepts, Architectures and Potential Applications," IEEE Commun. Mag., vol. 63, no. 3, pp. 24–30, Mar. 2025.

[8] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, "A Tutorial on Environment-Aware Communications via Channel Knowledge Map for 6G," IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1478–1519, 2024.

[9] G. Chen, Y. Liu, J. Zhang, T. Zhang, K. Liu, and J. Yang, "GPRT: A Gaussian Process Regression-Based Radio Map Construction Method for Rugged Terrain," IEEE Internet Things J., vol. 12, no. 13, pp. 23 905–23 920, Jul. 2025.

[10] H. Sun and J. Chen, "Propagation Map Reconstruction via Interpolation Assisted Matrix Completion," IEEE Trans. Signal Process., vol. 70, pp. 6154–6169, 2022.

[11] Y. Teganya and D. Romero, "Deep Completion Autoencoders for Radio Map Estimation," IEEE Trans. Wireless Commun., vol. 21, no. 3, pp. 1710–1724, Mar. 2022.

[12] C. E. Rasmussen and C. K. I. Williams, Gaussian Processes for Machine Learning. Cambridge, Mass.: MIT Press, 2005.

[13] N. Zhu, J. Marais, D. Bétaille, and M. Berbineau, "GNSS Position Integrity in Urban Environments: A Review of Literature," IEEE Trans. Intell. Transp. Syst., vol. 19, no. 9, pp. 2762–2778, Sep. 2018.

[14] H. Xiong, R. Bian, Y. Li, Z. Du, and Z. Mai, "Fault-Tolerant GNSS/SINS/DVL/CNS Integrated Navigation and Positioning Mechanism Based on Adaptive Information Sharing Factors," IEEE Syst. J., vol. 14, no. 3, pp. 3744–3754, Sep. 2020.

[15] P. Ranacher, R. Brunauer, W. Trutschnig, S. Van der Spek, and S. Reich, "Why GPS makes distances bigger than they are," Int. J. Geogr. Inf. Sci., vol. 30, no. 2, pp. 316–333, Feb. 2016.

[16] A. Mchutchon and C. Rasmussen, "Gaussian Process Training with Input Noise," in Adv. Neural Inf. Process. Syst., vol. 24. Curran Associates, Inc., 2011.

[17] A. Girard, C. Rasmussen, J. Q. Candela, and R. Murray-Smith, "Gaussian Process Priors with Uncertain Inputs Application to Multiple-Step Ahead Time Series Forecasting," in Adv. Neural Inf. Process. Syst., vol. 15. MIT Press, 2002.

[18] A. C. Damianou, M. K. Titsias, and N. D. Lawrence, "Variational Inference for Latent Variables and Uncertain Inputs in Gaussian Processes," J. Mach. Learn. Res., vol. 17, no. 42, pp. 1–62, 2016.

[19] P. Zhen, B. Zhang, Y.-Q. Xu, Z. Chen, H. Wang, and D. Guo, "Radio Environment Map Construction Based on Gaussian Process With Positional Uncertainty," IEEE Wireless Commun. Lett., vol. 11, no. 8, pp. 1639–1643, Aug. 2022.

[20] R. E. Kalman, "A New Approach to Linear Filtering and Prediction Problems," J. Basic Eng., vol. 82, no. 1, pp. 35–45, Mar. 1960.

[21] S. Särkkä and L. Svensson, Bayesian Filtering and Smoothing. Cambridge Univ. Press, 2023.

[22] K. Iyer, A. Dey, B. Xu, N. Sharma, and L.-T. Hsu, "Enhancing Positioning in GNSS Denied Environments Based on an Extended Kalman Filter Using Past GNSS Measurements and IMU," IEEE Trans. Veh. Technol., vol. 73, no. 6, pp. 7908–7924, Jun. 2024.

[23] A. Goldsmith, Wireless Communications. Cambridge Univ. Press, Aug. 2005.

[24] M. Gudmundson, "Correlation model for shadow fading in mobile radio systems," Electron. Lett., vol. 27, no. 23, pp. 2145–2146, Nov. 1991.

[25] D. P. Kingma and J. Ba, "Adam: A Method for Stochastic Optimization." [Online]. Available: http://arxiv.org/abs/1412.6980

[26] I. Rhee, M. Shin, S. Hong, K. Lee, S. J. Kim, and S. Chong, "On the Levy-Walk Nature of Human Mobility," IEEE/ACM Trans. Netw., vol. 19, no. 3, pp. 630–643, Jun. 2011.

[27] R. M. Neal, "Annealed importance sampling," Stat. Comput., vol. 11, no. 2, pp. 125–139, Apr. 2001.

[28] P. Del Moral, A. Doucet, and A. Jasra, "Sequential Monte Carlo Samplers," J. R. Stat. Soc. Ser. B Stat. Methodol., vol. 68, no. 3, pp. 411–436, Jun. 2006.

[29] N. Chopin, "A Sequential Particle Filter Method for Static Models," Biometrika, vol. 89, no. 3, pp. 539–551, 2002.

[30] B. Friedlander and B. Porat, "The Modified Yule-Walker Method of ARMA Spectral Estimation," IEEE Trans. Aerosp. Electron. Syst., vol. AES-20, no. 2, pp. 158–173, Mar. 1984.

## 图注与表注

**图 1：定位误差的示意。** (a) 独立同分布定位误差：单个上报位置被独立扰动；(b) 准静态偏移：一串上报位置被一致平移，采集更多测量不会平均掉，导致系统性空间配准错误。

**图 2：系统模型概览。** 1. 采集数据（移动设备在区域内测量 RSS 并记录 GNSS 位置）；2. 上传到服务器；3. 校正位置并执行 GPR（误差校正后构建无线电地图）。

**图 3：仿真示例。** (a) 传感器轨迹（真值与上报）；(b) 观测到的 RSS 场；(c) 所提方法得到的校正轨迹与无线电地图。

**图 4：无线电地图估计 MSE 的 CDF**（理想 GPR、所提方法、位置误差不可知 GPR、含噪输入 GPR）。

**图 5：传播参数对中位 MSE 的影响。** (a) $\eta$；(b) $\sigma_f$；(c) $d_{\mathrm{cor}}$。

**图 6：传播参数对超额风险比的影响。** (a) $\eta$；(b) $\sigma_f$；(c) $d_{\mathrm{cor}}$；(d) 噪声主导情形的对比。阴影区域为由第 V 节界得到的区间。

**图 7：时间相关定位误差下无线电地图 MSE 的 CDF。** (a) moto g24；(b) motorola edge 40 neo。

**图 8：测量装置。**

**图 9：观测轨迹**（建筑数据授权自 ©OpenStreetMap 贡献者）。

**图 10：定位误差直方图。** (a) motorola edge 40 neo（$x$ 轴）；(b) motorola edge 40 neo（$y$ 轴）；(c) moto g24（$x$ 轴）；(d) moto g24（$y$ 轴）。

**图 11：定位误差的 ACF。** (a) motorola edge 40 neo（$x$ 轴）；(b) motorola edge 40 neo（$y$ 轴）；(c) moto g24（$x$ 轴）；(d) moto g24（$y$ 轴）。

**表注：** 表 I 给出仿真参考条件（区域、参考距离、BS 位置与发射功率、路径损耗指数、阴影方差、相关距离、测量噪声方差、传感器数与测量间隔、观测时长、学习率、Lévy 游走参数）。表 II 给出由实测 GNSS 定位误差识别的 1 Hz AR(2) 模型参数：准静态偏移 $\mathbf a$、各轴 AR(2) 系数 $\omega_{x,1},\omega_{x,2},\omega_{y,1},\omega_{y,2}$ 与创新标准差 $\sigma_x,\sigma_y$，分 device 为 motorola edge 40 neo 与 moto g24。

**表 II：由实测 GNSS 定位误差识别的 1 Hz AR(2) 模型参数。**

| 参数 | motorola edge 40 neo | moto g24 |
|---|---|---|
| $\mathbf a$ [m] | $[-6.37,\ 1.00]^{\top}$ | $[-1.91,\ 1.99]^{\top}$ |
| $\omega_{x,1}$ | 1.183 | 1.491 |
| $\omega_{x,2}$ | $-1.947\times10^{-1}$ | $-5.084\times10^{-1}$ |
| $\sigma_x$ [m] | $4.836\times10^{-1}$ | $3.130\times10^{-1}$ |
| $\omega_{y,1}$ | 1.246 | 1.405 |
| $\omega_{y,2}$ | $-2.621\times10^{-1}$ | $-4.144\times10^{-1}$ |
| $\sigma_y$ [m] | $5.258\times10^{-1}$ | $4.625\times10^{-1}$ |

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.11142v1（eess.SP，投稿 IEEE IoT Journal）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（无线电地图背景、GNSS 时间相关误差与准静态偏移、相关工作三条路线、核心观察与三项贡献、结构安排）；第 II 节系统模型（传播模型、定位误差模型、数据与索引、GP 似然与参数估计）；第 III 节不考虑定位误差的地图构建（算法 1）及其局限；第 IV 节联合估计与地图构建（IV-A 联合估计与均值／协方差空间信息分析、算法 2；IV-B 地图构建）；第 V 节性能界（Bayes 风险与超额风险、oracle 下界、working-model 上界及紧性、风险界与表 I）；第 VI 节数值评估（IV-A 精度性能、IV-B 与 Bayes 最优的偏差）；第 VII 节实测 GNSS 误差评估（VII-A 误差模型与设置、VII-B 性能）；第 VIII 节结论与未来工作；附录 A（GNSS 测量与 AR(2) 验证、20 s AR(2) 构造）；附录 B（KF–RTS 状态空间模型）；30 条英文参考文献；表 I—表 II 与图 1—图 11 图注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言）→ 第 2—3 页（引言、贡献、第 II 节、图 2）→ 第 4—5 页（系统模型与式、算法 1）→ 第 6—7 页（第 IV 节、算法 2）→ 第 7—9 页（第 V 节、表 I）→ 第 10—11 页（第 VI 节、图 3—图 6）→ 第 11—12 页（第 VII 节、图 7）→ 第 12—13 页（结论、附录 A、图 8—图 11）→ 第 14 页（表 II、附录 B）→ 第 15—16 页（参考文献、作者简介）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 I 与表 II 的条目/数值已按 PDF 第 9 页与第 14 页渲染图逐项核对（含 AR(2) 系数与创新标准差全部 14 个数值），未改变任何数值。
2. **公式编号说明：** 原文编号为 (1)—(105)；本页合并展示了个别原文分列的公式（如 $\triangleq f(\mathbf x)$ 与 $P_{\mathrm{Rx}}$ 合为一个显示），并把附录 A 的 Yule–Walker 构造（原文 (94)—(95)）以文字说明，故本页显示公式 tag 共 93 个、按正文出现顺序连续编号。公式**内容**与原文逐一对应；引用原文编号时请注意该偏移。
3. 图 1—图 11 均未上传图片；本页以"图注与表注"小节统一给出 11 条中文图注与 2 条表注，正文按"图 N/表 N"引用。
4. **原文疑点／说明：** ①原文 (1) 式把 $P_{\mathrm{Rx}}$ 与 $\triangleq f(\mathbf x)$ 分两号给出，本页合并为一个显示公式；②原文的加性常数 1 已在脚注中说明其分析便利性与可忽略性，本页保留脚注；③第 V 节的 (72)—(73) 密度比与 (78) 式表明"轨迹不更新常值偏移先验"仅在平移不变律下成立，原文明确在有界域上不假设该等式，本页照录；④附录 A 的 Yule–Walker 构造原文给出 (94)—(95) 两式，因 PDF 文本层缺失，本页以文字说明匹配滞后 0、20、40 s 的平稳自协方差；⑤表 II 的数值按原文科学计数法照录；⑥原文为投稿格式（页眉为 SUBMITTED TO IEEE INTERNET OF THINGS JOURNAL, SEPTEMBER 2026），本页未复制页眉。
5. 原文为 arXiv 预印本（eess.SP），16 页；页面目录日期 2026-09-16 为站点归档日期，页首"版本"采用 arXiv v1 信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
