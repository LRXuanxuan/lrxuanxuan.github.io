---
layout: page
title: "不完美 CSI 下可旋转天线的双时间尺度设计：速率分析与方向优化｜中文译稿（待终校）"
permalink: /papers/translations/2026-10-23-rotatable-antennas-imperfect-csi-2605-04775/
math: true
toc: true
---

[← 返回论文库](/papers/) · [原文 arXiv](https://arxiv.org/abs/2605.04775) · [原始 PDF](https://arxiv.org/pdf/2605.04775v1)

# 不完美 CSI 下可旋转天线系统的双时间尺度设计：速率分析与方向优化

**英文原题：** Two-Timescale Design for Rotatable-Antenna Systems With Imperfect CSI: Rate Analysis and Orientation Optimization  
**作者：** Ziyuan Zheng、Qingqing Wu、Wen Chen  
**单位：** 上海交通大学集成电路学院  
**来源：** arXiv:2605.04775v1，2026 年 5 月 6 日，13 页。  
**校对说明：** 本页按原文 I—VIII 节组织，正文与图 1—10 已覆盖，并补入优化问题、MRC/wZF 关键遗漏公式及算法逐步过程；部分梯度仍使用等价微分形式，未做到全部逐式对应，需继续校对。参考文献书目未逐条转录，读者可通过原 PDF 查阅；尚未通过全文终校，不应将其视为经过逐字验收的版本。

## 摘要

研究不完美信道状态信息（channel state information，CSI）条件下，采用可旋转天线（rotatable antenna，RA）阵列的上行多用户 MIMO 系统。基站的每个天线均能够在规定角域内调整其最大辐射方向。为兼顾通信性能和控制开销，提出一种双时间尺度设计：在较长时间尺度上依靠统计 CSI 优化 RA 指向，而在每个相干块中根据线性最小均方误差（LMMSE）信道估计更新线性接收合并器。在这一框架下，针对最大比合并（MRC）推导基于“使用后遗忘”（use-and-then-forget，UatF）的闭式速率表达式，并针对不完美 CSI 下的加权迫零（wZF）推导统计速率代理指标，揭示 RA 旋转对有用信号强度、估计误差引发的自干扰及多用户干扰的影响。分析表明，最小化信道估计误差的指向通常不同于最大化速率的指向；由于信号合并机制与考虑误差的用户分离机制不同，MRC 和 wZF 也偏好不同的旋转配置。针对非凸方向设计问题，在球冠直积可行域上建立投影梯度算法，并给出信道统计量和速率指标的显式导数。数值结果验证了长时间尺度代理指标的准确性，同时说明 RA 优化能够明显改善通信性能。

**关键词：** 可旋转天线、方向优化、不完美 CSI、双时间尺度设计、最大比合并、加权迫零。

## I. 引言

多输入多输出（MIMO）借助空间自由度提升频谱效率，是无线通信中的重要技术 [1]、[2]。随着系统向更宽带宽和更高频段发展，大规模天线阵列对补偿传播损耗和多用户空间复用愈发重要 [3]、[4]。但在实际环境中，仅增加天线数量或发射功率，性能改善可能逐渐减弱。当用户信道高度相关、视距（LoS）分量占主导，或信道信息并不准确时，传统固定方向图阵列不能充分利用全部空间自由度 [5]。

这使物理层自适应从单纯的信号处理扩展至三个方向：重塑传播环境、重塑阵列几何，以及重塑天线方向性 [6]。智能反射面（IRS）代表第一类技术 [7]、[8]；可移动或流体天线通过改变阵元位置寻找有利空间采样点，代表第二类 [9]—[13]；第三类在保持阵元位置和射频连接不变的同时，通过旋转阵元最大辐射方向改变其方向响应 [14]—[16]。

RA 就是第三类机制 [16]—[19]。每个阵元具有方向性，且主轴可在可行角域内独立改变。由于阵元增益依赖入射方向，旋转不仅改变确定性 LoS 均值，也改变散射部分的协方差，从而同时影响 CSI 质量与上行频谱效率。RA 调整发生在数字合并之前，因此物理阵列控制、信道估计与多用户检测发生耦合。转动阵元可以增强信道、降低干扰耦合并改善空间分辨能力，但按每个相干块更新方向既会产生机械或电子控制开销，也会要求在大量候选方向获取瞬时 CSI，因此通常不可行 [20]—[22]。

双时间尺度设计对此具有实际意义：长时间尺度依靠用户几何、散射体几何和大尺度衰落确定的统计 CSI 调整 RA；短时间尺度在已选方向上利用瞬时信道估计更新合并器。类似思想已用于 IRS 与可移动天线 [23]、[24]，但 RA 与二者不同：它不形成反射级联信道，也不改变阵元位置或传播距离，而是直接调整接收阵列每个阵元的方向敏感性。因此，已有方法不能直接解决不完美 CSI 下 RA 上行多用户 MIMO 的问题。

论文的主要贡献有五项：（1）建立几何信道下 RA 上行多用户 MIMO 的双时间尺度架构与旋转优化问题；（2）推导不完美 CSI 下 MRC 的 UatF 闭式表达式和非各向同性误差条件下 wZF 的闭式统计代理；（3）揭示估计质量改善不等于速率最优，以及两类接收机的方向配置差异；（4）在球冠直积上推导各项统计量的导数，构建统一的投影梯度优化算法；（5）在数值实验中验证统计代理与块级遍历表现接近，最优方向优于固定或随机指向，wZF 在干扰受限场景尤其获益。全文随后依次介绍模型、估计、优化问题、速率分析、算法、数值结果与结论。

## II. 系统模型

考虑具有 $N=N_{\rm col}N_{\rm row}$ 个 RA 的均匀平面阵列（UPA）基站，同时服务 $K$ 个单天线上行用户。阵元索引集为 $\mathcal N=\{1,\dots,N\}$，用户索引集为 $\mathcal K=\{1,\dots,K\}$。图 1(a) 为系统及散射几何，图 1(b) 为位置不变时的天线方向图旋转，图 1(c) 则展示统计 CSI 驱动的慢速方向调整与瞬时 CSI 驱动的快速合并。

### A. 旋转向量与 RA 方向增益

采用三维直角坐标系；RA 阵列位于 $xOy$ 平面，中心为原点。阵元 $n$ 的位置为 $\mathbf w_n=[x_n,y_n,0]^T\in\mathbb R^3$，阵元间距为半波长；用户 $k$ 的位置为 $\mathbf u_k=[x_k,y_k,z_k]^T$。距离及从阵元指向用户的单位向量分别为

$$
r_{k,n}\triangleq\|\mathbf u_k-\mathbf w_n\|,\qquad
\mathbf s_{k,n}\triangleq\frac{\mathbf u_k-\mathbf w_n}{r_{k,n}}.\tag{1}
$$

每个 RA 的位置保持不变，但可由旋转机构独立改变主轴方向 $\mathbf f_n=[f_{x,n},f_{y,n},f_{z,n}]^T$，且 $\|\mathbf f_n\|=1$。亦可通过与正 $z$ 轴夹角 $\theta_n\in[0,\pi]$ 以及方位角 $\phi_n\in[-\pi,\pi)$ 表示：$\mathbf f_n=[\sin\theta_n\cos\phi_n,\sin\theta_n\sin\phi_n,\cos\theta_n]^T$。以 $\mathbf F=[\mathbf f_1,\dots,\mathbf f_N]\in\mathbb R^{3\times N}$ 汇总全部指向。

由于机械转动范围有限，每个阵元须满足

$$
\mathcal F_n\triangleq\big\{\mathbf f_n\in\mathbb R^3:\|\mathbf f_n\|=1,\ \arccos(\mathbf f_n^T\mathbf e_z)\le\theta_{\max}\big\},\quad
\mathbf e_z=[0,0,1]^T.\tag{2}
$$

其中 $\theta_{\max}\in(0,\pi/2]$ 为最大倾角。阵元指向与用户入射方向的偏差角定义为

$$\vartheta_{k,n}\triangleq\arccos(\mathbf f_n^T\mathbf s_{k,n}).\tag{3}$$

采用余弦形式的半空间方向增益模型：

$$
G(\mathbf f_n,\mathbf s_{k,n})=G_0[\mathbf f_n^T\mathbf s_{k,n}]_+^{2b},\qquad [x]_+=\max\{x,0\},\quad G_0=2(2b+1).\tag{4}
$$

$b\ge0$ 控制主瓣宽度；当入射方向与主轴一致时取得满足功率归一化的最大增益 $G_0$。

### B. 基于几何的莱斯信道

考虑一个主导 LoS 路径及空间中 $Q$ 个 NLoS 散射簇的窄带莱斯衰落模型。用户 $k$ 与阵元 $n$ 间 LoS 大尺度路径增益为

$$g_{k,n}^{\rm LoS}(\mathbf f_n)=\varrho\frac{G(\mathbf f_n,\mathbf s_{k,n})}{4\pi r_{k,n}^2}.\tag{5}$$

$\varrho$ 表示阵元物理尺寸。第 $q$ 个散射簇位于 $\mathbf c_q$；从阵元指向散射簇的距离与单位方向分别为 $r_{q,n}=\|\mathbf c_q-\mathbf w_n\|$ 和 $\mathbf s_{q,n}=(\mathbf c_q-\mathbf w_n)/r_{q,n}$。对应的方向路径增益为

$$g^c_{q,n}(\mathbf f_n)=\varrho\frac{G(\mathbf f_n,\mathbf s_{q,n})}{4\pi r_{q,n}^2}.\tag{6}$$

令 $d_{q,k}=\|\mathbf u_k-\mathbf c_q\|$。用户 $k$ 到阵元 $n$ 的复基带信道可拆分为

$$h_{k,n}(\mathbf f_n)=h_{k,n}^{\rm LoS}(\mathbf f_n)+h_{k,n}^{\rm NLoS}(\mathbf f_n),\tag{7}$$

其中

$$h_{k,n}^{\rm LoS}(\mathbf f_n)=\sqrt{g_{k,n}^{\rm LoS}(\mathbf f_n)}e^{-j2\pi r_{k,n}/\lambda},\tag{8}$$

$$h_{k,n}^{\rm NLoS}(\mathbf f_n)=\sum_{q=1}^Q\varpi_{k,q}\frac{\sqrt{\sigma_qg^c_{q,n}(\mathbf f_n)}}{d_{q,k}}e^{-j2\pi(r_{q,n}+d_{q,k})/\lambda}.\tag{9}$$

$\lambda$ 为载波波长，$\sigma_q>0$ 为散射簇雷达散射截面积，$\varpi_{k,q}\sim\mathcal{CN}(0,1)$ 相互独立并与 LoS 分量独立。给定稳定几何与 $\mathbf F$ 后，将确定性 LoS 及随机散射分别堆叠，得到

$$\mathbf h_k(\mathbf F)=\boldsymbol\mu_k(\mathbf F)+\mathbf B_k(\mathbf F)\boldsymbol\varpi_k,\tag{10}$$

$$\mathbf h_k(\mathbf F)\sim\mathcal{CN}\big(\boldsymbol\mu_k(\mathbf F),\mathbf R_k(\mathbf F)\big),\tag{11}$$

$$\mathbf R_k(\mathbf F)=\mathbf B_k(\mathbf F)\mathbf B_k^H(\mathbf F).\tag{12}$$

因此，均值—协方差对 $\{\boldsymbol\mu_k,\mathbf R_k\}$ 是后续估计、速率分析与优化的核心统计量。

### C. 上行信号

$$\mathbf y=\sum_{k\in\mathcal K}\sqrt{p_k}\mathbf h_k(\mathbf F)x_k+\mathbf n,\qquad\mathbf n\sim\mathcal{CN}(0,\sigma^2\mathbf I_N).\tag{13}$$

$p_k$ 为用户功率且 $0\le p_k\le P_k^{\max}$，$\mathbb E|x_k|^2=1$。基站根据导频得到信道矩阵的估计 $\widehat{\mathbf H}(\mathbf F)$，构造 $\mathbf V=[\mathbf v_1,\dots,\mathbf v_K]$，从而将第 $k$ 个用户的接收统计量写为

$$\varsigma_k=\mathbf v_k^H\mathbf y.\tag{14}$$

合并器在每个相干块更新，阵元指向则由较慢变化的几何和统计 CSI 决定。

## III. 信道估计

考虑时分双工，相干块长度 $T_c$，其中 $\tau_p$ 个符号用于训练，其余 $T_d=T_c-\tau_p$ 个符号传输数据。每个块内 $\mathbf F$ 与几何保持不变，待估计的随机性主要来自散射快衰落系数。

### A. 上行训练

不同用户发送互正交导频 $\boldsymbol\phi_k\in\mathbb C^{\tau_p}$，满足 $\boldsymbol\Phi^H\boldsymbol\Phi=\tau_p\mathbf I_K$ 且 $\tau_p\ge K$。接收导频为

$$\mathbf Y_p(\mathbf F)=\sum_{k=1}^K\sqrt{p_k^{\rm tr}}\mathbf h_k(\mathbf F)\boldsymbol\phi_k^T+\mathbf Z_p.\tag{15}$$

与第 $k$ 个导频相关并归一化后，得到充分统计量

$$\mathbf y_{p,k}(\mathbf F)=\frac{1}{\sqrt{\tau_p}}\mathbf Y_p(\mathbf F)\boldsymbol\phi_k^*=\sqrt{\tau_pp_k^{\rm tr}}\mathbf h_k(\mathbf F)+\mathbf n_{p,k},\tag{16}$$

其中 $\mathbf n_{p,k}\sim\mathcal{CN}(0,\sigma^2\mathbf I_N)$。

### B. LMMSE 估计器

给定 $\mathbf F$，观测均值、协方差与信道—观测互协方差分别为

$$\overline{\mathbf y}_{p,k}=\sqrt{\tau_pp_k^{\rm tr}}\boldsymbol\mu_k,\tag{17}$$

$$\mathbf C_{y_k}=\tau_pp_k^{\rm tr}\mathbf R_k+\sigma^2\mathbf I_N,\tag{18}$$

$$\mathbf C_{h_ky_k}=\sqrt{\tau_pp_k^{\rm tr}}\mathbf R_k.\tag{19}$$

由于观测与信道联合服从复高斯分布，LMMSE 与 MMSE 估计一致：

$$\widehat{\mathbf h}_k=\boldsymbol\mu_k+\sqrt{\tau_pp_k^{\rm tr}}\mathbf R_k(\tau_pp_k^{\rm tr}\mathbf R_k+\sigma^2\mathbf I_N)^{-1}(\mathbf y_{p,k}-\sqrt{\tau_pp_k^{\rm tr}}\boldsymbol\mu_k).\tag{20}$$

这里及以下统计量的 $\mathbf F$ 依赖在不引起歧义时省略。式（20）表明，旋转指向通过 $\boldsymbol\mu_k(\mathbf F)$ 与 $\mathbf R_k(\mathbf F)$ 改变估计器。

### C. 估计误差统计

定义信道估计误差（原文式 21）：

$$\widetilde{\mathbf h}_k(\mathbf F)\triangleq\mathbf h_k(\mathbf F)-\widehat{\mathbf h}_k(\mathbf F).\tag{21}$$

高斯先验下，估计与误差独立，且

$$\widetilde{\mathbf h}_k\sim\mathcal{CN}(\mathbf0,\mathbf C_{e,k}),\tag{22}$$

$$\mathbf C_{e,k}=\mathbf R_k-\tau_pp_k^{\rm tr}\mathbf R_k(\tau_pp_k^{\rm tr}\mathbf R_k+\sigma^2\mathbf I_N)^{-1}\mathbf R_k=\mathbf R_k(\mathbf I_N+\frac{\tau_pp_k^{\rm tr}}{\sigma^2}\mathbf R_k)^{-1},\tag{23}$$

$$\mathbf C_{\widehat h_k}=\mathbf R_k-\mathbf C_{e,k}=\tau_pp_k^{\rm tr}\mathbf R_k(\tau_pp_k^{\rm tr}\mathbf R_k+\sigma^2\mathbf I_N)^{-1}\mathbf R_k,\tag{24}$$

$$\widehat{\mathbf h}_k\sim\mathcal{CN}(\boldsymbol\mu_k,\mathbf C_{\widehat h_k}).\tag{25}$$

令 $a_k=\tau_pp_k^{\rm tr}$，$\mathbf R_k^\dagger$ 为伪逆，$\mathbf P_k=\mathbf R_k\mathbf R_k^\dagger$ 为到非零特征值张成的活动子空间的正交投影。定义归一化误差协方差及活动子空间 NMSE：

$$\mathbf E_k=(\mathbf R_k^\dagger)^{1/2}\mathbf C_{e,k}(\mathbf R_k^\dagger)^{1/2},\tag{26}$$

$$\operatorname{NMSE}_k=\begin{cases}\operatorname{tr}(\mathbf E_k)/\iota_k,&\iota_k>0,\\0,&\iota_k=0,\end{cases}\quad\iota_k=\operatorname{rank}(\mathbf R_k).\tag{27}$$

**引理 1。** 对任意半正定 $\mathbf R_k$，

$$\mathbf E_k=\mathbf P_k\left(\mathbf I_N+\frac{a_k}{\sigma^2}\mathbf R_k\right)^{-1}\mathbf P_k.\tag{28}$$

若 $\mathbf R_k$ 的非零特征值为 $\lambda_{k,i}$，则活动子空间中 $\mathbf E_k$ 的特征值为 $(1+a_k\lambda_{k,i}/\sigma^2)^{-1}$，故增加非零特征值可降低 NMSE。进一步地，若 $\mathbf R_k(\mathbf F_1)\succeq\mathbf R_k(\mathbf F_2)\succeq0$ 且两者活动子空间相同，则 $\mathbf E_k(\mathbf F_1)\preceq\mathbf E_k(\mathbf F_2)$，从而 $\operatorname{NMSE}_k(\mathbf F_1)\le\operatorname{NMSE}_k(\mathbf F_2)$。

**证明。** 在相同活动子空间上采用 $\mathbf R_k$ 谱分解，得到每个非零特征模态的归一化误差特征值；矩阵 Loewner 序在正定平移与取逆之后反向，并在相同投影空间中保序，取迹即得结论。

**注释 1—2。** 使主轴朝向强散射方向能够提高活动子空间中的协方差强度，从而改善估计质量。但可达速率还取决于 LoS 均值、跨用户统计耦合及接收合并器，因此 NMSE 最小的旋转通常不是速率最大的旋转。慢时间尺度更新 $\mathbf F$ 后，同一统计匹配的 LMMSE 估计器可用于多个相干块。

## IV. 双时间尺度优化问题

线性合并矩阵是瞬时信道估计的确定性函数：

$$\mathbf V(\widehat{\mathbf H})=[\mathbf v_1(\widehat{\mathbf H}),\dots,\mathbf v_K(\widehat{\mathbf H})]\in\mathbb C^{N\times K},\tag{29}$$

$$\widehat{\mathbf H}(\mathbf F)=[\widehat{\mathbf h}_1(\mathbf F),\dots,\widehat{\mathbf h}_K(\mathbf F)].\tag{30}$$

第 $k$ 个用户的检测统计量展开为

$$\varsigma_k=\sqrt{p_k}\mathbf v_k^H\mathbf h_k x_k+\sum_{i\ne k}\sqrt{p_i}\mathbf v_k^H\mathbf h_i x_i+\mathbf v_k^H\mathbf n,\tag{31}$$

$$\gamma_k=\frac{p_k|\mathbf v_k^H\mathbf h_k|^2}{\sum_{i\ne k}p_i|\mathbf v_k^H\mathbf h_i|^2+\sigma^2\|\mathbf v_k\|^2}.\tag{32}$$

把给定估计值时有效信道增益的条件均值视为确定性有用信号，将剩余随机性当作非相关高斯噪声，得到 UatF 信干噪比

$$\bar\gamma_k(\mathbf F,\widehat{\mathbf H})=\frac{p_k|\mathbb E[\mathbf v_k^H\mathbf h_k\mid\widehat{\mathbf H}]|^2}{p_k\operatorname{Var}(\mathbf v_k^H\mathbf h_k\mid\widehat{\mathbf H})+\sum_{i\ne k}p_i\mathbb E[|\mathbf v_k^H\mathbf h_i|^2\mid\widehat{\mathbf H}]+\sigma^2\|\mathbf v_k\|^2}.\tag{33}$$

令训练开销对应的前置因子 $\eta=1-\tau_p/T_c$。速率指标和和速率分别为

$$\bar R_k(\mathbf F)=\eta\log_2\big(1+\bar\gamma_k(\mathbf F,\widehat{\mathbf H})\big),\tag{34}$$

$$\bar R_{\rm sum}(\mathbf F)=\sum_{k\in\mathcal K}\bar R_k(\mathbf F).\tag{35}$$

原文的长时间尺度优化问题完整表述为

$$
(\mathrm{P1}):\quad
\max_{\mathbf F}
\mathbb E_{\widehat{\mathbf H}}
\left[\max_{\mathbf V(\widehat{\mathbf H})}
\overline R_{\rm sum}(\mathbf F)\right].
\tag{36a}
$$

$$
\mathrm{s.t.}\quad \mathbf F\in\mathcal F.
\tag{36b}
$$

该问题包括不可解析的期望、单位范数与角度限制以及非凹方向增益，是随机非凸问题。固定短期合并策略为 MRC 或 wZF，并推导仅依赖统计量的闭式速率代理后，可分别解

$$\text{(P2-MRC)}:\ \max_{\mathbf F\in\mathcal F}\sum_k\bar R_k^{\rm MRC}(\mathbf F),\qquad\text{(P2-wZF)}:\ \max_{\mathbf F\in\mathcal F}\sum_k\bar R_k^{\rm wZF}(\mathbf F).\tag{37}$$

**命题 1。** 当 $K=1$ 且纯 LoS（$\mathbf R_1=0$）时，$\widehat{\mathbf h}_1=\mathbf h_1=\boldsymbol\mu_1$，MRC 与 wZF 重合。速率最大化等价于逐阵元最大化方向增益，因此

$$\mathbf f_n^\star=\Pi_{\mathcal F_n}(\mathbf s_{1,n}),\quad n\in\mathcal N.\tag{38}$$

由于纯 LoS 时目标仅依赖 $\|\boldsymbol\mu_1\|^2=\sum_n|\mu_{1,n}|^2$，而每项随 $G(\mathbf f_n,\mathbf s_{1,n})$ 单调增加，逐阵元独立投影得到最优解。多用户时干扰与误差耦合使这种简化不再成立。

## V. MRC 与 wZF 的可达速率分析

定义二阶矩阵

$$\boldsymbol\Sigma_{h,k}=\mathbb E[\mathbf h_k\mathbf h_k^H]=\mathbf R_k+\boldsymbol\mu_k\boldsymbol\mu_k^H,\tag{39}$$

$$\boldsymbol\Sigma_{\widehat h,k}=\mathbb E[\widehat{\mathbf h}_k\widehat{\mathbf h}_k^H]=\mathbf C_{\widehat h_k}+\boldsymbol\mu_k\boldsymbol\mu_k^H.\tag{40}$$

显然 $\boldsymbol\Sigma_{h,k}=\boldsymbol\Sigma_{\widehat h,k}+\mathbf C_{e,k}$。RA 不同于固定方向图阵列，$\mathbf F$ 可经式（4）、估计器（20）及 UatF 界影响全部统计量。

### A. MRC 的闭式 UatF 表达式

MRC 的瞬时合并器为

$$
\mathbf v_k^{\rm MRC}(\widehat{\mathbf H})\triangleq\widehat{\mathbf h}_k(\mathbf F).\tag{41}
$$

代入 UatF 表达式后，利用无条件均值和总接收功率，可得

$$
\overline\gamma_k^{\rm MRC}(\mathbf F)=
\frac{p_k|\mathbb E[(\mathbf v_k^{\rm MRC})^H\mathbf h_k]|^2}
{\sum_{i=1}^{K}p_i\mathbb E[|(\mathbf v_k^{\rm MRC})^H\mathbf h_i|^2]
-p_k|\mathbb E[(\mathbf v_k^{\rm MRC})^H\mathbf h_k]|^2
+\sigma^2\mathbb E[\|\mathbf v_k^{\rm MRC}\|^2]}.\tag{42}
$定义有用信号平均合并增益

$$\alpha_k=\mathbb E[\widehat{\mathbf h}_k^H\mathbf h_k]=\operatorname{tr}(\mathbf C_{\widehat h_k})+\|\boldsymbol\mu_k\|^2.\tag{43}$$

有用信号功率是 $p_k\alpha_k^2$（44），平均合并后噪声范数为 $\mathbb E\|\mathbf v_k^{\rm MRC}\|^2=\alpha_k$（45）。用户间干扰的平均功率由独立性得到

$$\Theta_{i,k}=\mathbb E|\widehat{\mathbf h}_k^H\mathbf h_i|^2=\operatorname{tr}(\boldsymbol\Sigma_{h,i}\boldsymbol\Sigma_{\widehat h,k}),\quad i\ne k.\tag{46}$$

由高斯向量四阶矩，第 $k$ 个用户自项为

$$\mathbb E|\widehat{\mathbf h}_k^H\mathbf h_k|^2=\alpha_k^2+\operatorname{tr}(\mathbf C_{\widehat h_k}^2)+2\boldsymbol\mu_k^H\mathbf C_{\widehat h_k}\boldsymbol\mu_k+\operatorname{tr}(\mathbf C_{e,k}\boldsymbol\Sigma_{\widehat h,k}).\tag{47}$$

定义自干扰与干扰加噪声分母

$$\Phi_k=\operatorname{tr}(\mathbf C_{\widehat h_k}^2)+2\boldsymbol\mu_k^H\mathbf C_{\widehat h_k}\boldsymbol\mu_k+\operatorname{tr}(\mathbf C_{e,k}\boldsymbol\Sigma_{\widehat h,k}),\tag{49}$$

$$I_k^{\rm MRC}=p_k\Phi_k+\sum_{i\ne k}p_i\Theta_{i,k}+\sigma^2\alpha_k.\tag{48}$$

因此分别得到 MRC 的闭式 UatF SINR 与速率：

$$
\overline\gamma_k^{\rm MRC}(\mathbf F)
=\frac{p_k\alpha_k^2(\mathbf F)}{I_k^{\rm MRC}(\mathbf F)}.\tag{50}
$$

$$
\overline R_k^{\rm MRC}(\mathbf F)
=\eta\log_2\bigl(1+\overline\gamma_k^{\rm MRC}(\mathbf F)\bigr),\qquad
\overline R_{\rm sum}^{\rm MRC}=\sum_{k=1}^{K}\overline R_k^{\rm MRC}.\tag{51}
$$

由此可见，旋转同时影响相干信号合并能量 $\alpha_k$、误差引发的自干扰 $\Phi_k$、跨用户干扰 $\Theta_{i,k}$ 与合并后噪声。因此只按 NMSE 或有用信号功率设计指向，都未必能最大化速率。

### B. wZF 的闭式统计代理

对 wZF，方向相关的非各向同性估计误差使外层期望难以精确计算，因此构造统计近似。设 $K\le N$ 且 $\widehat{\mathbf H}$ 满列秩，ZF 型合并器满足

$$\mathbf V_{\rm ZF}^H\widehat{\mathbf H}=\mathbf I_K.\tag{52}$$

对每个满足 $\mathbf V^H\widehat{\mathbf H}=\mathbf I_K$ 的 wZF 型接收机，给定 $\widehat{\mathbf H}$ 时，各用户的信道均为 $\mathbf h_i=\widehat{\mathbf h}_i+\widetilde{\mathbf h}_i$，因而原文逐项列出

$$
(\mathbf v_k^{\rm wZF})^H\mathbf h_k
=1+(\mathbf v_k^{\rm wZF})^H\widetilde{\mathbf h}_k.\tag{53a}
$$

$$
(\mathbf v_k^{\rm wZF})^H\mathbf h_i
=(\mathbf v_k^{\rm wZF})^H\widetilde{\mathbf h}_i,\quad i\ne k.\tag{53b}
$$

$$
\mathbb E[(\mathbf v_k^{\rm wZF})^H\mathbf h_k\mid\widehat{\mathbf H}]=1.\tag{53c}
$$

$$
\operatorname{Var}[(\mathbf v_k^{\rm wZF})^H\mathbf h_k\mid\widehat{\mathbf H}]
=(\mathbf v_k^{\rm wZF})^H\mathbf C_{e,k}\mathbf v_k^{\rm wZF}.\tag{53d}
$$

$$
\mathbb E[|(\mathbf v_k^{\rm wZF})^H\mathbf h_i|^2\mid\widehat{\mathbf H}]
=(\mathbf v_k^{\rm wZF})^H\mathbf C_{e,i}\mathbf v_k^{\rm wZF},\quad i\ne k.\tag{53e}
$$

于是

$$\bar\gamma_k^{\rm wZF}(\mathbf F,\widehat{\mathbf H})=\frac{p_k}{\mathbf v_k^H\mathbf Z(\mathbf F)\mathbf v_k},\tag{54}$$

$$\mathbf Z(\mathbf F)=\sigma^2\mathbf I_N+\sum_{i=1}^K p_i\mathbf C_{e,i}(\mathbf F).\tag{55}$$

**命题 2。** 满列秩条件下，在 $\mathbf V^H\widehat{\mathbf H}=\mathbf I_K$ 的 ZF 型接收机中，彩色有效噪声下最优的加权迫零合并矩阵为

$$\mathbf V^{\rm wZF}=\mathbf Z^{-1}\widehat{\mathbf H}\big(\widehat{\mathbf H}^H\mathbf Z^{-1}\widehat{\mathbf H}\big)^{-1}.\tag{56}$$

$$\bar\gamma_k^{\rm wZF}(\mathbf F,\widehat{\mathbf H})=\frac{p_k}{\big[(\widehat{\mathbf H}^H\mathbf Z^{-1}\widehat{\mathbf H})^{-1}\big]_{k,k}}.\tag{57}$$

**证明。** 对用户 $k$，在约束 $\mathbf v_k^H\widehat{\mathbf H}=\mathbf e_k^T$ 下最小化 $\mathbf v_k^H\mathbf Z\mathbf v_k$；该严格凸二次规划的 KKT 条件给出式（56），再代入即可得式（57）。不满足满秩条件时须采用正则化形式。

为仅用统计 CSI 进行慢尺度设计，将随机白化 Gram 矩阵替换为期望值：

$$\widehat{\mathbf H}^H\mathbf Z^{-1}\widehat{\mathbf H}\ \approx\ \overline{\mathbf S}=\mathbb E[\widehat{\mathbf H}^H\mathbf Z^{-1}\widehat{\mathbf H}].\tag{58}$$

以 $\mathbf M=[\boldsymbol\mu_1,\dots,\boldsymbol\mu_K]$ 表示 LoS 均值矩阵，则

$$\overline{\mathbf S}=\operatorname{diag}\big(\operatorname{tr}(\mathbf Z^{-1}\mathbf C_{\widehat h_1}),\dots,\operatorname{tr}(\mathbf Z^{-1}\mathbf C_{\widehat h_K})\big)+\mathbf M^H\mathbf Z^{-1}\mathbf M.\tag{59}$$

最终的统计代理为

$$\bar\gamma_k^{\rm wZF}=\frac{p_k}{[\overline{\mathbf S}^{-1}]_{k,k}},\qquad\bar R_k^{\rm wZF}=\eta\log_2(1+\bar\gamma_k^{\rm wZF}).\tag{60--61}$$

**注释 6。** 若人为近似各用户估计误差为各向同性 $\mathbf C_{e,i}\approx\sigma_{e,i}^2\mathbf I_N$（62），式（54）退化为传统 wZF 噪声增强形式（63），可再借助大规模 MIMO 的矩匹配近似（64）—（66）。但是 RA 的阵元方向增益通常随阵元而异，故上述各向同性条件一般不成立；作者主要使用式（59）—（61）。

**推论 1。** 对 $\overline{\mathbf S}$ 按用户 $k$ 与其余用户分块（67）。令对角自项为 $\bar s_{k,k}=\boldsymbol\mu_k^H\mathbf Z^{-1}\boldsymbol\mu_k+\operatorname{tr}(\mathbf Z^{-1}\mathbf C_{\widehat h_k})$（68），跨用户向量由 $\boldsymbol\mu_i^H\mathbf Z^{-1}\boldsymbol\mu_k$ 构成（69）。利用 Schur 补恒等式（71），

$$\bar\gamma_k^{\rm wZF}=p_k\Big[\bar s_{k,k}-\bar{\mathbf s}_{k,-k}^H\overline{\mathbf S}_{-k,-k}^{-1}\bar{\mathbf s}_{k,-k}\Big].\tag{70}$$

因此 wZF 的旋转增益具有两个机制：提高考虑估计误差的用户自身信道增益，以及降低考虑估计误差的跨用户耦合。$\mathbf Z$ 也随 $\mathbf C_{e,i}$ 变化，因此估计误差会同时进入这两类项。

## VI. 旋转优化

对 MRC 与 wZF，分别最大化其长尺度和速率代理，即原文（P3-MRC）、（P3-wZF）（72a）—（72b）。这些非凸目标依赖 $\boldsymbol\mu_k$、$\mathbf R_k$ 及 $\mathbf C_{e,k}$，但可行域为球冠直积 $\mathcal F=\prod_{n=1}^N\mathcal F_n$，适合投影梯度上升。

**备注 6：各向同性误差特例及其限制。** 如果人为令 $\mathbf C_{e,i}(\mathbf F)\approx\sigma_{e,i}^2(\mathbf F)\mathbf I_N$，则

$$
\mathbf C_{e,i}(\mathbf F)\approx \sigma_{e,i}^2(\mathbf F)\mathbf I_N,\quad \forall i.\tag{62}
$$

此时加权 ZF 的有效噪声成为标量倍数，条件 SINR 可化为

$$
\overline\gamma_k^{\rm wZF}(\mathbf F,\widehat{\mathbf H})
=\frac{p_k}{(\sigma^2+\sum_i p_i\sigma_{e,i}^2)
[\mathbf G^{-1}(\mathbf F)]_{k,k}},\quad
\mathbf G=\widehat{\mathbf H}^H\widehat{\mathbf H}.\tag{63}
$$

原文进一步列出基于大规模 MIMO 矩匹配的近似（64）–（66），但明确指出 RA 旋转造成阵元增益不均匀，通常违背式（62）的各向同性前提。因此主方法采用式（59）–（61），而非将此特例作为通用结论。

**推论 1：Schur 补揭示用户间耦合。** 按用户 $k$ 把统计 Gram 矩阵分块：

$$
\overline{\mathbf S}=
\begin{bmatrix}
\overline s_{k,k}&\overline{\mathbf s}_{k,-k}^H\\
\overline{\mathbf s}_{k,-k}&\overline{\mathbf S}_{-k,-k}
\end{bmatrix}.\tag{67}
$$

其中

$$
\overline s_{k,k}
=\boldsymbol\mu_k^H\mathbf Z^{-1}\boldsymbol\mu_k+
\operatorname{tr}(\mathbf Z^{-1}\mathbf C_{\widehat h_k})
=\|\mathbf Z^{-1/2}\boldsymbol\mu_k\|^2+
\operatorname{tr}(\mathbf Z^{-1/2}\mathbf C_{\widehat h_k}\mathbf Z^{-1/2}),\tag{68}
$$

$$
\overline{\mathbf s}_{k,-k}
=\bigl[\boldsymbol\mu_i^H\mathbf Z^{-1}\boldsymbol\mu_k\bigr]_{i\ne k}.
\tag{69}
$$

于是 wZF 速率代理的 SINR 还可精确地写成

$$
\overline\gamma_k^{\rm wZF}
=p_k\left(\overline s_{k,k}-
\overline{\mathbf s}_{k,-k}^H
\overline{\mathbf S}_{-k,-k}^{-1}
\overline{\mathbf s}_{k,-k}\right).\tag{70}
$$

根据分块矩阵求逆的 Schur 补公式，

$$
[\overline{\mathbf S}^{-1}]_{k,k}^{-1}
=\overline s_{k,k}-\overline{\mathbf s}_{k,-k}^H
\overline{\mathbf S}_{-k,-k}^{-1}
\overline{\mathbf s}_{k,-k},\tag{71}
$$

由此验证（70）。旋转一方面提升误差感知的有用项 $\overline s_{k,k}$，另一方面降低用户间耦合带来的减项，这解释了为何 wZF 与 MRC 倾向于不同的方向配置。

### A. 信道统计量的导数

由于阵元 $n$ 的旋转仅影响 $\boldsymbol\mu_k$ 第 $n$ 项和 $\mathbf B_k$ 第 $n$ 行，可利用稀疏导数。对任意固定方向 $\mathbf s$，方向增益梯度为

$$\nabla_{\mathbf f_n}G(\mathbf f_n,\mathbf s)=\begin{cases}2bG_0(\mathbf f_n^T\mathbf s)^{2b-1}\mathbf s,&\mathbf f_n^T\mathbf s>0,\\\mathbf0,&\mathbf f_n^T\mathbf s\le0.\end{cases}\tag{73}$$

边界点取零次梯度。LoS 均值的第 $n$ 项（74）与关于分量 $[\mathbf f_n]_m$ 的导数（75）—（76）为

$$\mu_{k,n}=\sqrt{\frac{\varrho G_0}{4\pi r_{k,n}^2}}[\mathbf f_n^T\mathbf s_{k,n}]_+^{b}e^{-j2\pi r_{k,n}/\lambda},\tag{74}$$

$$\frac{\partial\mu_{k,n}}{\partial[\mathbf f_n]_m}=\begin{cases}b\frac{\mu_{k,n}}{\mathbf f_n^T\mathbf s_{k,n}}[\mathbf s_{k,n}]_m,&\mathbf f_n^T\mathbf s_{k,n}>0,\\0,&\text{其他},\end{cases}\quad\frac{\partial\boldsymbol\mu_k}{\partial[\mathbf f_n]_m}=\boldsymbol\delta_n\frac{\partial\mu_{k,n}}{\partial[\mathbf f_n]_m}.\tag{75--76}$$

同理，散射路径矩阵的第 $(n,q)$ 项在原文式（77）中明确定义为

$$
[\mathbf B_k(\mathbf F)]_{n,q}=
\sqrt{\frac{\varrho\sigma_qG_0}{4\pi r_{q,n}d_{q,k}}}
[\mathbf f_n^T\mathbf s_{q,n}]_+^b
e^{-j\frac{2\pi}{\lambda}(r_{q,n}+d_{q,k})}.\tag{77}
$$

其导数满足

$$\frac{\partial[\mathbf B_k]_{n,q}}{\partial[\mathbf f_n]_m}=\begin{cases}b\frac{[\mathbf B_k]_{n,q}}{\mathbf f_n^T\mathbf s_{q,n}}[\mathbf s_{q,n}]_m,&\mathbf f_n^T\mathbf s_{q,n}>0,\\0,&\text{其他}.\end{cases}\tag{78}$$

把该行的偏导组成 $\mathbf b_{k,n}^{(m)}$（80），则原文（79）—（81）可写为

$$\frac{\partial\mathbf B_k}{\partial[\mathbf f_n]_m}=\boldsymbol\delta_n(\mathbf b_{k,n}^{(m)})^T,\quad\frac{\partial\mathbf R_k}{\partial[\mathbf f_n]_m}=\boldsymbol\delta_n(\mathbf b_{k,n}^{(m)})^T\mathbf B_k^H+\mathbf B_k(\mathbf b_{k,n}^{(m)})^*\boldsymbol\delta_n^T.\tag{79--81}$$

令 $\mathbf A_k=a_k\mathbf R_k+\sigma^2\mathbf I_N$。对 $\mathbf C_{\widehat h_k}=a_k\mathbf R_k\mathbf A_k^{-1}\mathbf R_k$ 求微分，用 $d\mathbf A^{-1}=-\mathbf A^{-1}(d\mathbf A)\mathbf A^{-1}$：

$$d\mathbf C_{\widehat h_k}=a_k(d\mathbf R_k)\mathbf A_k^{-1}\mathbf R_k+a_k\mathbf R_k\mathbf A_k^{-1}(d\mathbf R_k)-a_k^2\mathbf R_k\mathbf A_k^{-1}(d\mathbf R_k)\mathbf A_k^{-1}\mathbf R_k.\tag{82}$$

$$d\mathbf C_{e,k}=d\mathbf R_k-d\mathbf C_{\widehat h_k}.\tag{83}$$

对二阶矩阵（39）—（40）分别求导：

$$d\boldsymbol\Sigma_{h,k}=d\mathbf R_k+(d\boldsymbol\mu_k)\boldsymbol\mu_k^H+\boldsymbol\mu_k(d\boldsymbol\mu_k)^H,\tag{84}$$

$$d\boldsymbol\Sigma_{\widehat h,k}=d\mathbf C_{\widehat h_k}+(d\boldsymbol\mu_k)\boldsymbol\mu_k^H+\boldsymbol\mu_k(d\boldsymbol\mu_k)^H.\tag{85}$$

上述微分对应原文逐分量导数，构成可实现的梯度计算链。

### B. MRC 和速率代理梯度

对（43b），有

$$d\alpha_k=2\operatorname{Re}(\boldsymbol\mu_k^Hd\boldsymbol\mu_k)+\operatorname{tr}(d\mathbf C_{\widehat h_k}).\tag{86}$$

多用户干扰项及自干扰项的微分分别是

$$d\Theta_{i,k}=\operatorname{tr}\big[(d\boldsymbol\Sigma_{h,i})\boldsymbol\Sigma_{\widehat h,k}+\boldsymbol\Sigma_{h,i}(d\boldsymbol\Sigma_{\widehat h,k})\big],\tag{87}$$

$$\begin{aligned}d\Phi_k={}&2\operatorname{tr}(\mathbf C_{\widehat h_k}d\mathbf C_{\widehat h_k})+2\boldsymbol\mu_k^H(d\mathbf C_{\widehat h_k})\boldsymbol\mu_k\\&+4\operatorname{Re}[(d\boldsymbol\mu_k)^H\mathbf C_{\widehat h_k}\boldsymbol\mu_k]+\operatorname{tr}\big[(d\mathbf C_{e,k})\boldsymbol\Sigma_{\widehat h,k}+\mathbf C_{e,k}d\boldsymbol\Sigma_{\widehat h,k}\big].\end{aligned}\tag{88}$$

进而

$$dI_k^{\rm MRC}=p_kd\Phi_k+\sum_{i\ne k}p_i d\Theta_{i,k}+\sigma^2 d\alpha_k,\tag{89}$$

$$d\bar\gamma_k^{\rm MRC}=p_k\frac{2\alpha_kI_k^{\rm MRC}d\alpha_k-\alpha_k^2dI_k^{\rm MRC}}{(I_k^{\rm MRC})^2}.\tag{90}$$

逐个阵元和坐标分量收集导数后，MRC 和速率梯度为

$$\nabla_{\mathbf f_n}\bar R_{\rm sum}^{\rm MRC}=\frac{\eta}{\ln 2}\sum_{k=1}^K\frac{\nabla_{\mathbf f_n}\bar\gamma_k^{\rm MRC}}{1+\bar\gamma_k^{\rm MRC}}.\tag{91}$$

### C. wZF 和速率代理梯度

由（55）与（59）依次微分：

$$d\mathbf Z=\sum_i p_i d\mathbf C_{e,i},\qquad d\mathbf Z^{-1}=-\mathbf Z^{-1}(d\mathbf Z)\mathbf Z^{-1}.\tag{92--93}$$

$\mathbf M$ 的导数按各用户均值列向量组合（94）。定义 $\chi_k=d\operatorname{tr}(\mathbf Z^{-1}\mathbf C_{\widehat h_k})$，则

$$\chi_k=\operatorname{tr}\big[(d\mathbf Z^{-1})\mathbf C_{\widehat h_k}+\mathbf Z^{-1}d\mathbf C_{\widehat h_k}\big].\tag{95--96}$$

令 $\mathbf D=\operatorname{diag}(\chi_1,\dots,\chi_K)$，从而

$$d\overline{\mathbf S}=\mathbf D+(d\mathbf M)^H\mathbf Z^{-1}\mathbf M+\mathbf M^H\mathbf Z^{-1}d\mathbf M+\mathbf M^H(d\mathbf Z^{-1})\mathbf M.\tag{97}$$

逆矩阵微分满足

$$d\overline{\mathbf S}^{-1}=-\overline{\mathbf S}^{-1}(d\overline{\mathbf S})\overline{\mathbf S}^{-1}.\tag{98}$$

置 $\Psi_k=[\overline{\mathbf S}^{-1}]_{k,k}$，则

$$d\Psi_k=-[\overline{\mathbf S}^{-1}(d\overline{\mathbf S})\overline{\mathbf S}^{-1}]_{k,k},\tag{99}$$

$$d\bar\gamma_k^{\rm wZF}=\frac{p_k}{\Psi_k^2}[\overline{\mathbf S}^{-1}(d\overline{\mathbf S})\overline{\mathbf S}^{-1}]_{k,k},\tag{100}$$

$$\nabla_{\mathbf f_n}\bar R_{\rm sum}^{\rm wZF}=\frac{\eta}{\ln 2}\sum_k\frac{\nabla_{\mathbf f_n}\bar\gamma_k^{\rm wZF}}{1+\bar\gamma_k^{\rm wZF}}.\tag{101}$$

式（102）明确地把用户方向的三个坐标梯度堆叠为

$$
\nabla_{\mathbf f_n}\overline R_{\rm sum}^{\rm BF}(\mathbf F)
=\left[
\frac{\partial\overline R_{\rm sum}^{\rm BF}}{\partial[\mathbf f_n]_x},
\frac{\partial\overline R_{\rm sum}^{\rm BF}}{\partial[\mathbf f_n]_y},
\frac{\partial\overline R_{\rm sum}^{\rm BF}}{\partial[\mathbf f_n]_z}
\right]^T.\tag{102}
$$

### D. 球冠投影梯度上升

对 $\mathrm{BF}\in\{\mathrm{MRC},\mathrm{wZF}\}$，先将欧氏梯度投影到单位球切空间：

$$\mathbf g_n^{(\ell)}=\big(\mathbf I_3-\mathbf f_n^{(\ell)}(\mathbf f_n^{(\ell)})^T\big)\nabla_{\mathbf f_n}\bar R_{\rm sum}^{\rm BF}(\mathbf F^{(\ell)}).\tag{103}$$

以步长 $\alpha^{(\ell)}>0$ 沿切方向移动并归一化：

$$\widetilde{\mathbf f}_n^{(\ell+1)}=\frac{\mathbf f_n^{(\ell)}+\alpha^{(\ell)}\mathbf g_n^{(\ell)}}{\|\mathbf f_n^{(\ell)}+\alpha^{(\ell)}\mathbf g_n^{(\ell)}\|}.\tag{104}$$

接着将其投影回球冠。若倾角不超过 $\theta_{\max}$，保持原值；否则定义截去法向分量的平面向量

$$
\mathbf a_n^{(\ell+1)}
\triangleq\widetilde{\mathbf f}_n^{(\ell+1)}
-\bigl[(\widetilde{\mathbf f}_n^{(\ell+1)})^T\mathbf e_z\bigr]\mathbf e_z.\tag{106}
$$

并采用

$$\mathbf f_n^{(\ell+1)}=\begin{cases}\widetilde{\mathbf f}_n^{(\ell+1)},&\arccos(\widetilde{\mathbf f}_n^T\mathbf e_z)\le\theta_{\max},\\\cos\theta_{\max}\mathbf e_z+\sin\theta_{\max}\frac{\mathbf a_n}{\|\mathbf a_n\|},&\text{其他}.\end{cases}\tag{105}$$

步长由 Armijo 回溯选择：从 $\alpha=\rho^q\alpha_0$ 中取使

$$\bar R_{\rm sum}^{\rm BF}(\mathbf F^{(\ell+1)})\ge\bar R_{\rm sum}^{\rm BF}(\mathbf F^{(\ell)})+c\alpha^{(\ell)}\sum_n\|\mathbf g_n^{(\ell)}\|^2\tag{107}$$

成立的最大值，其中 $0<\rho,c<1$。当 $\max_n\|\mathbf g_n^{(\ell)}\|\le\epsilon$ 或达到最大次数时终止。

**算法 1：RA 旋转的投影梯度上升（按原文逐步展开）。**

1. **输入：** 可行初值 $\mathbf F^{(0)}\in\mathcal F$、终止容差 $\epsilon$、迭代上限 $L_{\max}$、接收机类型 $\mathrm{BF}\in\{\mathrm{MRC},\mathrm{wZF}\}$。
2. 对 $\ell=0,1,\ldots,L_{\max}-1$ 迭代。
3. 对全部 $n$，若 BF 为 MRC，使用式（91）求 $\nabla_{\mathbf f_n}\overline R_{\rm sum}^{\rm BF}(\mathbf F^{(\ell)})$；若 BF 为 wZF，则用式（101）。
4. 按式（103）求单位球切空间中的上升方向 $\mathbf g_n^{(\ell)}$。
5. 如果 $\max_n\|\mathbf g_n^{(\ell)}\|\le\epsilon$，跳出循环。
6. 否则按照式（107）的 Armijo 回溯准则选择步长 $\alpha^{(\ell)}$。
7. 按式（104）计算每个阵元的临时指向 $\widetilde{\mathbf f}_n^{(\ell+1)}$，再使用式（105）投影到对应球冠 $\mathcal F_n$。
8. 汇总 $\mathbf F^{(\ell+1)}=[\mathbf f_1^{(\ell+1)},\ldots,\mathbf f_N^{(\ell+1)}]$，进入下一轮。
9. **输出：** 最终方向配置 $\mathbf F^\star$。



### E. 收敛性与复杂度

Armijo 回溯令每一步的目标不下降；由于可行域紧致且目标连续，目标序列有上界，因此收敛。算法停止点满足投影梯度判据，可视为问题的 Clarke 驻点候选。每个阵元方向仅改变均值一项和散射矩阵一行，梯度具有稀疏性。若以直接矩阵求逆实现且复用每轮公共逆矩阵，则 MRC 每次迭代的主要复杂度为 $O(KN^3+K^2N^2)$，wZF 为 $O((K+1)N^3+K^2N^2+K^3)$。wZF 计算代价较高，但通常获得较大性能增益。

## VII. 数值结果

除另有说明外，采用 $N=N_{\rm row}N_{\rm col}=2\times4$ 的 RA UPA，载频 6 GHz，阵元距半波长，$K=4$ 个用户，$Q=3$ 个散射簇。方向参数 $b=4$，最大增益 $G_0=18$；噪声功率 $-80$ dBm；参考距离 1 m 的路径损耗为 $-30$ dB，即 $\varrho/(4\pi)=10^{-3}\,\mathrm{m}^2$；相干块长度 $T_c=200$，默认最大旋转角 $60^\circ$，导频长度 $\tau_p=K$；用户训练和数据发射功率均为 20 dBm。用户位置在水平半径 $[0,300]$ m、高度 $[100,200]$ m 内均匀取样；散射簇在水平半径 $[0,350]$ m、高度 $[50,250]$ m 内生成，雷达散射截面积 $\sigma_q=100/3\,\mathrm{m}^2$。

每条曲线平均 3000 次独立几何实现；标为“erg.”的曲线又对每个几何实现平均 100 次独立快衰落，标为“sur.”的使用第 V 节统计代理；“opt. F”是算法 1 的方向，“ran. F”是在球冠内均匀随机取样，“fix. F”表示所有阵元指向 $\mathbf e_z$。

**图 2（基站天线数）。** 显示随阵元数 $N$ 增加，优化后的 MRC 与 wZF 和速率均上升；wZF 始终高于 MRC。统计代理与对应遍历曲线接近，表明闭式代理可用于慢时间尺度设计；更多阵元同时增强有用信道及 wZF 可利用的空间自由度。

**图 3（用户数）。** 用户增加时，优化 wZF 和速率仍显著提高，但 MRC 因多用户干扰逐步趋于饱和。密集用户场景中，MRC 的瓶颈由信号强度转向残余干扰，而 wZF 能利用旋转改善用户可分离性。

**图 4（用户发射功率）。** 优化 wZF 的速率在所考察 dB 功率范围内上升较快，MRC 上升较慢，体现后者更早进入干扰受限状态。随着功率增大，优化方向相较随机方向的优势扩大。

**图 5（最大旋转角）。** 增大 $\theta_{\max}$ 在小至中等倾角范围显著提高速率，角域足够大后逐渐饱和，意味着无需无限增加机械旋转范围。

**图 6（方向参数 $b$）。** 对优化方向而言，提高阵元方向性可增益，且 wZF 尤为明显；对随机方向，增大 $b$ 反而可能降低 wZF 性能，因为主瓣变窄使方向失配更严重。

**图 7（活动子空间 NMSE 与导频比例）。** 随 $\tau_p/T_c$ 增大，所有旋转策略的 NMSE 下降；按 NMSE 优化的指向得到最低 NMSE，与引理 1 相符。

**图 8（wZF 数据阶段与净频谱效率）。** 在全部导频比例下，wZF 速率最优方向的通信速率高于 NMSE 最优方向；尽管更多训练可以改善信道估计并提高数据阶段的谱效，净谱效还包含 $\eta=1-\tau_p/T_c$，导频过多后可能下降。这直接说明“估计最优”不等于“通信最优”。

**图 9（四用户角度间隔）。** 增大四个用户的方位角间隔使 MRC 性能渐增后饱和；wZF 在用户高度相关的小角距时尤其受益于 RA 优化，在中到大角距区间达到峰值，间隔再增大则可能因方向资源和倾角限制而略有下降。这对应由“相关性受限”向“增益受限”的转变，验证 MRC 偏向信号聚合、wZF 偏向误差感知的用户分离。

**图 10（单用户 LoS 特例）。** 将闭式球冠投影解与投影梯度数值解比较，发现二者在各种最大旋转角下基本重合，并随可旋转范围增大均优于固定正向指向，验证命题 1 及算法在可解析特例下的准确性。

## VIII. 结论

研究了不完美 CSI 下采用 RA 阵列的上行多用户 MIMO。RA 旋转不仅是硬件波束指向改进；它通过改变莱斯信道均值与协方差，同时改变数据阶段有效信道、LMMSE 估计器及接收机所面对的残余干扰和有效噪声。基于这种耦合提出双时间尺度设计，在较慢尺度上按统计 CSI 优化阵元方向，在每个相干块中按瞬时估计更新 MRC 或 wZF 合并器；进一步推导 MRC 的闭式 UatF 长尺度速率指标和 wZF 的闭式统计代理，并利用球冠直积上的投影梯度算法解决非凸方向优化。结论包括：改善归一化估计质量一般不代表通信速率最优；单用户纯 LoS 问题存在闭式球冠投影解；MRC 与 wZF 偏好的旋转模式不同，前者主要利用信号强度聚合，后者更依赖考虑估计误差的用户分离。仿真验证了代理指标与双时间尺度设计的实际价值，尤其是在用户几何不利的多用户条件下。未来可推广至宽带系统、下行预编码，以及位置与方向联合可调的阵列。

## 参考文献

原文参考文献见[原始 PDF](https://arxiv.org/pdf/2605.04775v1)末尾；本译稿尚未逐条转录，不将未完成的书目校对标记为全文验收。