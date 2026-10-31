---
layout: page
title: "贝叶斯多径的在线材料标注环境重建｜中文全文译文"
permalink: /papers/translations/2026-09-24-2609-19819-online-material-labeled-environment-reconstruction-via-bayesian-multip/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/f0bfaf2f0a67536d/) · [原文 arXiv](https://arxiv.org/abs/2609.19819) · [全部目录](/papers/catalog/)

# 贝叶斯多径的在线材料标注环境重建

**原题：** Online Material-Labeled Environment Reconstruction via Bayesian Multipath Attribution for Low-Altitude ISAC  
**作者：** Meihui Liu、Shu Sun（通讯作者）、Ruifeng Gao、Qiuming Zhu  
**单位：** 1）上海交通大学电子信息与电气工程学院（上海，中国）；2）南通大学交通与土木工程学院（南通，中国）；3）南京航空航天大学电子信息工程学院（南京，中国）。通讯邮箱：shusun@sjtu.edu.cn。  
**版本：** arXiv:2609.19819v1（cs.IT），2026 年 9 月 17 日，原文 6 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VII 节及全部小节、式 (1)–(9)、表 I–II（逐格转写）、图 1–4 图注、参考文献 [1]–[13]（英文原条目）均按原文结构录入；原文无附录、无致谢段。逐句逐式终校未做。

## 摘要

面向低空通信感知一体化（integrated sensing and communications，ISAC）的环境重建，目前大多聚焦于**以几何为中心**的地图，忽略了依赖材料的传播效应。因此，材料标注重建是迈向"传播感知建图"的关键一步，可支撑更具物理依据的信道预测与无人机（unmanned aerial vehicle，UAV）组网。然而，在室外多建筑场景中从无线多径观测构建此类地图颇具挑战：来自不同立面的多径分量（multipath components，MPC）相互混叠，路径—立面归因不确定，且 UAV 测量是在时变观测几何下**顺序**到达的。为应对这些挑战，我们提出一个统一的在线概率框架：把每个反射立面表示为一个虚拟锚点（virtual anchor，VA），并把贝叶斯 VA 定位、多径归因与材料推断耦合起来。该贝叶斯前端估计立面级几何，并利用镜面—漫射（specular-diffuse）似然模型计算软性 MPC 到 VA 的归因概率，从而同时兼顾主导镜面路径与漫射表面相互作用分量。这些归因概率被用于构造归因感知的 MPC 表示；这些表示以 VA 为中心聚合，再由材料推断网络映射为立面级材料证据。所得证据通过在线贝叶斯更新递归融合，产生稳定的材料后验与材料标注环境地图。在代表性城市街道场景中的射线追踪仿真表明，所提方法显著优于无归因基准，在留出 UAV 轨迹上取得 **93.75%** 的最终立面级材料准确率，并保持准确的基于 VA 的立面定位。

**关键词：** 低空 ISAC；材料标注环境重建；贝叶斯多径归因；虚拟锚点定位；传播感知建图。

## I. 引言

低空经济的快速增长正加速 UAV、城市空中交通平台及其他空中智能系统的部署 [1]。这些平台需要无线网络在提供连接的同时，持续感知传播环境以支持自适应决策。通信感知一体化（ISAC）——包括协同感知架构——通过复用无线基础设施同时完成通信与无线电感知，为该目的提供了天然框架 [2]。其核心任务是构建传播感知地图，刻画塑造低空无线信道的结构与传播相关属性。

在建筑密集的低空走廊中，无线电传播强烈受建筑立面、地面及其他城市结构产生的非视距（non-line-of-sight，NLoS）多径分量（MPC）影响。MPC 不只是信道损伤，还携带几何与材料敏感线索。具体而言，时延、角度与运动一致性约束相互作用表面的位置与朝向 [3], [4]；而路径增益、散射行为与衰减反映材料相关的电磁响应 [5], [6]。因此，MPC 为材料标注环境地图提供了通信原生（communication-native）的基础，可支撑信道预测、遮挡推理、波束管理与无线电数字孪生。

尽管潜力巨大，从无线 MPC 进行材料感知的环境重建仍研究不足。已有的以几何为中心的方法——包括几何反演 [7]、虚拟锚点（VA）建图 [3], [8] 与基于学习的散射体重建 [9], [10]——主要从信道观测推断反射点、结构地图特征或稀疏散射表示，但并未给重建表面赋予材料相关的传播证据。近期一项太赫兹单站感知研究 [11] 表明，在受控室内感知条件下，无线 MPC 可支持联合几何重建与材料识别。然而，不同于基站（base station，BS）到 UAV 的双站链路，单站感知在材料比较之前提供更直接的几何线索，可把测得 MPC 与室内结构关联起来。在 BS 到 UAV 链路中，发射机（transmitter，Tx）与接收机（receiver，Rx）的空间分离使一个观测 MPC 可能同时对应多个候选表面，因此决定材料证据归属的表面不能由感知几何直接确定，必须推断。这种归因模糊性在室外低空多建筑场景中被放大：Rx 会同时观测到来自多个立面的 MPC。室外建筑表面粗糙、会诱发镜面与漫射混合传播，进一步使推断复杂化：在理想镜面假设下解释时，漫射分量会偏置几何恢复 [12], [13]；但它们保留了依赖表面的散射线索，对材料推断有信息量。此外，随着 UAV 运动，含时延、角度与接收功率的 MPC 观测是在时变观测几何下逐次获取的。综合起来，这些因素导致三重挑战：在双站模糊下对每个新到 MPC 进行概率化表面归因；在非理想镜面—漫射传播下稳健更新表面级几何；融合顺序且不确定的 MPC 证据以递归精化材料后验。

为此，我们提出一个把贝叶斯 VA 多径归因与材料推断耦合起来的在线框架：每个 VA 是 BS 相对某个反射立面的镜像（图 1）。相比 [3] 中仅考虑镜面的基于置信传播（belief propagation，BP）的 BP-SLAM，该框架显式计入漫射立面回波。文献 [8], [12], [13] 进一步考虑非理想或漫射表面相互作用，但不推断立面材料。在这些工作基础上，我们引入**尾部感知的镜面—漫射似然**——它更能容纳漫射偏差，同时保留集中的镜面分量用于几何判别，从而改善非理想表面传播下的 VA 定位。更重要的是，这些工作均未涉及立面级材料推断。我们进一步整合软性 MPC 到 VA 归因、归因感知 token 与递归神经证据融合，以构建在线材料标注地图。

**符号说明：** 标量为斜体，如 \(d,p,r\)；向量与矩阵为粗体，如 \(\mathbf x,\mathbf z,\mathbf T\)。算子 \(\Pr(\cdot)\) 与 \(\mathbb E[\cdot]\) 分别表示概率与期望。花体字母（如 \(\mathcal Z\) 与 \(\mathcal C\)）表示集合。上标 \((\cdot)^T\) 表示转置。除非明确说明为随机量，各符号表示确定性参数、索引或已实现的观测。

## II. 系统模型

本节定义 BS–UAV ISAC 设定、MPC 观测模型以及贝叶斯前端所用的统计模型。

### A. 场景描述与目标

我们考虑低空 BS–UAV ISAC 链路：移动 UAV 发送上行信号，固定天线阵列基站接收这些信号，同时用于数据通信与无线电感知。发射信号可包含复用于感知的上行参考信号，也可包含专用 ISAC 波形。假定 UAV 在时刻 \(n\) 的位置 \(\mathbf u_n\) 可由机载导航系统获得。

在历元 \(n\)，在线地图为 \(\mathcal R_n^{\rm online}=\{(\widehat{\mathbf x}_{n,k},\hat c_{n,k},\widehat\Omega_{n,k})\}_{k=1}^{\widehat K_n}\)，其中 \(\widehat K_n\) 为已确认 VA 的数量。每个条目包含 VA 位置 \(\widehat{\mathbf x}_{n,k}\)、立面材料标签 \(\hat c_{n,k}\in\mathcal C\)（玻璃、金属、混凝土或砖）以及粗略可见范围 \(\widehat\Omega_{n,k}\)。新到的 MPC 更新已有条目；新结构只有在确认后才进入。在镜面几何下，VA 与已知 BS 位置确定反射平面，而被归因的 MPC 保留非理想传播效应供材料推断。非网格化的范围由被归因 MPC 的可见性与空间支撑累积得到。轨迹结束后，最终地图保留稳定确认的条目。

### B. MPC 观测模型

为构建上述以 VA 为中心的材料标注地图，基站首先从接收的上行波形中提取路径级 MPC 观测。每条保留的 MPC 由其**时延**、**到达角**与**功率**参数化。感知历元 \(n\) 处的第 \(l\) 条 MPC 表示为 \(\mathbf z_{n,l}=[\tau_{n,l},\theta_{n,l},\phi_{n,l},p_{n,l}]^T\)，其中 \(\tau_{n,l}\) 为到达时间，\(\theta_{n,l}\) 与 \(\phi_{n,l}\) 分别为基站侧到达天顶角与方位角，\(p_{n,l}\) 为接收功率。该观测的几何分量记为 \(\mathbf z_{n,l}^g=[d_{n,l},\theta_{n,l},\phi_{n,l}]^T\)，其中 \(d_{n,l}=c_0\tau_{n,l}\)、\(c_0\) 为光速。历元 \(n\) 提取的完整 MPC 集合为 \(\mathcal Z_n=\{\mathbf z_{n,l}\}_{l=1}^{L_n}\)，\(L_n\) 为提取的 MPC 数。

用于 VA 定位的几何导向路径集为 \(\mathcal Z_n^g=\{\mathbf z_{n,l}^g\}_{l\in\mathcal L_n^g}\)，其中 \(\mathcal L_n^g\subseteq\{1,\ldots,L_n\}\) 表示被几何导向门限保留的索引。类似地，用于材料证据提取的材料导向路径集为 \(\mathcal Z_n^m=\{\mathbf z_{n,l}\}_{l\in\mathcal L_n^m}\)，\(\mathcal L_n^m\subseteq\{1,\ldots,L_n\}\) 为被材料导向门限保留的索引。两个索引集不必相同：几何导向门限更严格，以抑制可能损害 VA 定位的漫射分量；而材料导向门限保留更多携带材料线索的漫射与弱反射 MPC。

### C. 统计模型

以下 VA 状态模型与似然模型支撑从 \(\mathcal Z_n^g\) 进行 VA 定位，以及随后把 \(\mathcal Z_n^m\) 归因到已确认 VA。

**VA 状态模型：** 我们沿用 [8] 的双站 VA 表述，省略单站感知变量与基站索引。第 \(k\) 个候选立面由增广 VA 状态 \(\mathbf y_{n,k}=[\mathbf x_{n,k}^T,r_{n,k}]^T\) 表示，其中 \(\mathbf x_{n,k}\in\mathbb R^3\) 为潜在 VA 位置，\(r_{n,k}\in\{0,1\}\) 为其存在指示。因此，每个立面级 VA 被视为随机实体，其位置与存在性由给定 \(\mathcal Z_n^g\) 的后验分布推断。由于立面静止，VA 位置服从近似静态的转移模型，例如 \(\mathbf x_{n,k}=\mathbf x_{n-1,k}+\mathbf w_{n,k}\)，\(\mathbf w_{n,k}\) 为小过程噪声。存在变量遵循面向传播与新生 VA 假设的生存—新生机制 [8]。

**双站测量与似然模型：** 令 \(\mathbf p_B\) 表示已知且固定的基站位置。给定 UAV 位置 \(\mathbf u_n\) 与候选 VA 位置 \(\mathbf x_{n,k}\)，记 \(f(\mathbf z_{n,l}^g\mid\mathbf x_{n,k};\mathbf u_n,\mathbf p_B)\) 为双站时延—角度似然模型。它利用反射路径长度与基站侧到达角，评估第 \(l\) 条 MPC 与第 \(k\) 个 VA 之间的几何一致性。由于 VA 是 BS 相对反射立面的镜像，相应的反射平面法向为 \(\mathbf n_{n,k}=\frac{\mathbf x_{n,k}-\mathbf p_B}{\|\mathbf x_{n,k}-\mathbf p_B\|}\)，且过中点 \(\mathbf p_{n,k}^{\rm mid}=\frac{\mathbf x_{n,k}+\mathbf p_B}{2}\)。镜面反射点由 UAV–VA 连线与该平面求交得到：

$$
\mathbf s_{n,k}=\mathbf u_n+\alpha_{n,k}(\mathbf x_{n,k}-\mathbf u_n),\qquad\text{其中}\ \alpha_{n,k}=\frac{\mathbf n_{n,k}^T(\mathbf p_{n,k}^{\rm mid}-\mathbf u_n)}{\mathbf n_{n,k}^T(\mathbf x_{n,k}-\mathbf u_n)}.
$$

预测路径长度为 \(\hat d_{n,k}=\|\mathbf x_{n,k}-\mathbf u_n\|\)。令 \(\mathbf v_{n,k}=\mathbf s_{n,k}-\mathbf p_B=[v_{n,k,x},v_{n,k,y},v_{n,k,z}]^T\)，则预测的基站侧角度为 \(\hat\theta_{n,k}=\arccos(v_{n,k,z}/\|\mathbf v_{n,k}\|)\)、\(\hat\phi_{n,k}=\operatorname{atan2}(v_{n,k,y},v_{n,k,x})\)。对观测 MPC \(\mathbf z_{n,l}^g\)，路径长度、天顶角与方位角残差分别定义为 \(\Delta d_{n,l,k}=d_{n,l}-\hat d_{n,k}\)、\(\Delta\theta_{n,l,k}=\theta_{n,l}-\hat\theta_{n,k}\)、\(\Delta\phi_{n,l,k}=\operatorname{wrap}(\phi_{n,l}-\hat\phi_{n,k})\)，其中 \(\operatorname{wrap}(\cdot)\) 把方位角残差映射到 \([-\pi,\pi)\)。对粗糙建筑立面，观测 MPC 可能是主导镜面反射，也可能是同一立面附近的漫射分量。为在容忍漫射偏差的同时保留几何判别力，我们采用**尾部感知的镜面—漫射似然**：

$$
f(\mathbf z_{n,l}^g\mid\mathbf x_{n,k};\mathbf u_n,\mathbf p_B)=\frac{f_{\rm sp}(\mathbf z_{n,l}^g\mid\mathbf x_{n,k};\mathbf u_n,\mathbf p_B)+\lambda_df_{\rm diff}(\mathbf z_{n,l}^g\mid\mathbf x_{n,k};\mathbf u_n,\mathbf p_B)}{1+\lambda_d},\tag{1}
$$

其中 \(f_{\rm sp}(\cdot)\) 是集中在理想双站 VA 几何附近的概率密度，\(f_{\rm diff}(\cdot)\) 是计入漫射偏差的较宽概率密度；参数 \(\lambda_d\ge0\) 控制漫射分量的相对贡献，因子 \((1+\lambda_d)^{-1}\) 保证混合分布归一化。

**两阶段使用：** 在贝叶斯 VA 定位过程中，(1) 与定位阶段针对 \(\mathcal Z_n^g\) 的数据关联变量结合以更新 VA 状态；在 VA 确认后，同一似然原理再应用于 \(\mathcal Z_n^m\)，以计算材料阶段的 MPC 到 VA 归因概率。

## III. 贝叶斯 VA 定位与多径归因

本节描述贝叶斯前端：它首先用 \(\mathcal Z_n^g\) 通过因子图推断 VA 状态与存在概率，再把 \(\mathcal Z_n^m\) 针对已确认 VA 重新打分，得到材料导向的归因权重。

### A. 贝叶斯 VA 后验分解

对贝叶斯 VA 定位，只使用 \(\mathcal Z_n^g\)。对保留的 MPC 重新局部索引得 \(\mathcal Z_n^g=\{\mathbf z_{n,l}^g\}_{l=1}^{m_n}\)，其中 \(m_n=|\mathcal L_n^g|\) 为历元 \(n\) 保留的几何导向 MPC 数。令 \(\mathbf y_{n,k}=[\mathbf x_{n,k}^T,r_{n,k}]^T\) 为第 \(k\) 个 VA 的增广状态，并令 \(\mathbf b_n=\{b_{n,l}\}_{l=1}^{m_n}\) 表示定位阶段的数据关联向量，其中 \(b_{n,l}=k\) 表示第 \(l\) 条几何导向 MPC 与第 \(k\) 个 VA 关联，而 \(b_{n,l}=0\) 表示未指派或杂波假设。

后验分解沿用 [8] 的双站因子图模型：先验、虚警、转移、新生与测量关联因子保持相同形式。为简洁，(2) 中省略对已知固定基站位置 \(\mathbf p_B\) 的依赖。所得后验写为

$$
\begin{aligned}
&f(\mathbf y_{0:n},\mathbf b_{1:n},\mathbf m_{1:n}\mid\mathbf z_{1:n}^g;\mathbf u_{0:n})\\
&\propto\prod_{k=1}^{K_0}f(\mathbf y_{0,k};\mathbf u_0)\prod_{n'=1}^{n}\prod_{l=1}^{m_{n'}}f_{\rm fa}(\mathbf z_{n',l}^g)\prod_{n'=1}^{n}\Bigg(\prod_{k=1}^{K_{n'}}q(\mathbf x_{n',k},r_{n',k}\mid\mathbf x_{n'-1,k},r_{n'-1,k})\prod_{l=1}^{m_{n'}}h_k(\mathbf x_{n',k},r_{n',k},b_{n',l};\mathbf z_{n',l}^g,\mathbf u_{n'})\\
&\quad\times\prod_{k'=1}^{m_{n'}}\bar q(\mathbf x_{n',k'},r_{n',k'};\mathbf u_{n'})g_{K_{n'}+k'}(\mathbf x_{n',k'},r_{n',k'},b_{n',k'};\mathbf z_{n',k'}^g,\mathbf u_{n'})\prod_{l=k'+1}^{m_{n'}}h_{K_{n'}+k'}(\mathbf x_{n',k'},r_{n',k'},b_{n',l};\mathbf z_{n',l}^g,\mathbf u_{n'})\Bigg).
\end{aligned}\tag{2}
$$

在 (2) 中，\(f_{\rm fa}(\cdot)\) 为虚警密度，\(q(\cdot)\) 与 \(\bar q(\cdot)\) 为遗留状态转移与新生密度，\(h_k(\cdot)\) 与 \(g_k(\cdot)\) 为测量关联因子。任务相关部分是双站时延—角度似然 \(\ell_{n,l,k}^g=f(\mathbf z_{n,l}^g\mid\mathbf x_{n,k};\mathbf u_n,\mathbf p_B)\)，其中 \(f(\cdot)\) 服从 (1)。其两个分量在时延—角度域实现为 \(f_\nu(\mathbf z_{n,l}^g\mid\mathbf x_{n,k};\mathbf u_n,\mathbf p_B)=\mathcal N(\Delta d_{n,l,k};0,\sigma_{d,\nu}^2)\mathcal N_w(\Delta\theta_{n,l,k};0,\sigma_{\theta,\nu}^2)\mathcal N_w(\Delta\phi_{n,l,k};0,\sigma_{\phi,\nu}^2)\)，其中 \(\nu\in\{{\rm sp},{\rm diff}\}\)，\(\Delta d_{n,l,k}\)、\(\Delta\theta_{n,l,k}\)、\(\Delta\phi_{n,l,k}\) 分别为相对基站侧反射几何的路径长度、天顶角与方位角残差。角度残差用卷绕高斯密度 \(\mathcal N_w(\cdot)\) 建模，且 \(\sigma_{\cdot,{\rm diff}}^2>\sigma_{\cdot,{\rm sp}}^2\)。

后验给出 VA 存在概率 \(\hat\rho_{n,k}=\Pr(r_{n,k}=1\mid\mathcal Z_{1:n}^g;\mathbf u_{0:n},\mathbf p_B)\) 与条件 MMSE 估计 \(\widehat{\mathbf x}_{n,k}=\mathbb E[\mathbf x_{n,k}\mid r_{n,k}=1,\mathcal Z_{1:n}^g;\mathbf u_{0:n},\mathbf p_B]\)（沿用 [8]）。\(\hat\rho_{n,k}\) 超过阈值的 VA 构成用于材料归因的已确认 VA 集。

### B. 面向材料的 MPC 归因

定位阶段的关联向量 \(\mathbf b_n\) 不会被直接送入材料识别网络。在 VA 确认后，材料阶段把更丰富的材料导向路径集 \(\mathcal Z_n^m\) 针对已确认 VA 实体重新打分。令 \(\widehat{\mathcal V}_n=\{(\widehat{\mathbf x}_{n,k},\hat\rho_{n,k})\}_{k=1}^{\widehat K_n}\) 表示已确认 VA 集，其中 \(\widehat{\mathbf x}_{n,k}\) 为第 \(k\) 个 VA 的估计位置，\(\hat\rho_{n,k}\) 为其存在可靠性。对材料阶段 MPC \(\mathbf z_{n,l}^m\)，令 \(\mathbf z_{n,l}^{m,g}\) 为其几何分量。在给定 \(\widehat{\mathcal V}_n\) 的条件下，每条路径—VA 边用第 II-C 节定义的同一尾部感知双站似然重新打分。具体地，定义

$$
\ell_{n,l,k}^m=f(\mathbf z_{n,l}^{m,g}\mid\widehat{\mathbf x}_{n,k};\mathbf u_n,\mathbf p_B),\qquad s_{n,l,k}=\kappa\hat\rho_{n,k}\ell_{n,l,k}^m,\tag{3}
$$

其中 \(\kappa\) 为似然比尺度，背景得分归一化为 1。令 \(S_{n,l}=\sum_{j=1}^{\widehat K_n}s_{n,l,j}\)。对 \(S_{n,l}>0\)，材料阶段归因量定义为

$$
q_{n,l}=\frac{S_{n,l}}{1+S_{n,l}},\qquad\beta_{n,l,k}=\frac{s_{n,l,k}}{S_{n,l}},\qquad\alpha_{n,l,k}=q_{n,l}\beta_{n,l,k}=\frac{s_{n,l,k}}{1+S_{n,l}}.\tag{4}
$$

若 \(S_{n,l}=0\)，该路径保持未指派，令 \(q_{n,l}=0\)、\(\alpha_{n,l,k}=0\)。这里 \(q_{n,l}\) 是**已确认 VA 置信度**，度量该路径是否被已确认 VA 集可靠解释；条件权重 \(\beta_{n,l,k}\) 描述路径在被视为与 VA 相关之后，如何在已确认 VA 之间分配；其乘积 \(\alpha_{n,l,k}\) 是无条件的 VA 特定归因，度量第 \(l\) 条 MPC 归属于第 \(k\) 个已确认 VA 的概率。

该分解用于材料 token 构造。对每个 MPC–VA 对，定义归因描述子 \(\boldsymbol\xi_{n,l,k}^{\rm att}=[\beta_{n,l,k},q_{n,l},\hat\rho_{n,k}]^T\)，它概括条件 VA 分配、路径级已确认 VA 置信度与 VA 存在可靠性。标量 \(\alpha_{n,l,k}\) 用作对与 VA \(k\) 相关的材料阶段路径排序或选择的归因权重。被选路径连同其物理 MPC 观测量与 \(\boldsymbol\xi_{n,l,k}^{\rm att}\) 一起被 token 化，从而可从被归因 MPC 中提取立面特定材料证据。

## IV. 归因感知的 VA 中心材料推断

对每个已确认 VA，材料模块构建以 VA 为中心的被归因 MPC token 集，用共享神经网络提取瞬时材料证据，并递归融合为在线材料后验。

### A. 归因感知的 MPC token 构造

对历元 \(n\) 第 \(k\) 个已确认 VA，保留条件分配为正（\(\beta_{n,l,k}>0\)）的材料阶段 MPC，并按 (4) 中的 \(\alpha_{n,l,k}=q_{n,l}\beta_{n,l,k}\) 排序。该排序仅用于确定性的 top-path 截断与下文排名特征，并非额外物理假设。令 \(\mathcal S_{n,k}\) 表示截断后所得的 VA 中心路径索引集。归一化排名为 \(\varrho_{n,l,k}=\frac{{\rm rank}_{n,l,k}}{\max(|\mathcal S_{n,k}|-1,1)}\)，其中 \({\rm rank}_{n,l,k}=0\) 对应归因最高的保留路径。因此 \(\varrho_{n,l,k}\) 记录了实现中已用于保留最可靠 MPC 证据的序数归因优先级。对每条被选路径 \(l\in\mathcal S_{n,k}\)，定义 \(\Delta p_{n,l,k}=p_{n,l}-p_{n,k}^{\max}\) 与 \(\Delta\tau_{n,l,k}=\tau_{n,l}-\tau_{n,k}^{\min}\)，其中 \(p_{n,k}^{\max}=\max_{l'\in\mathcal S_{n,k}}p_{n,l'}\)、\(\tau_{n,k}^{\min}=\min_{l'\in\mathcal S_{n,k}}\tau_{n,l'}\)。令 \(\mathbf o_{n,l}=[p,\tau,\theta,\phi,\sin\theta,\cos\theta,\sin\phi,\cos\phi]_{n,l}^T\) 汇集物理 MPC 观测量。则路径 \(l\) 相对 VA \(k\) 的最终归因感知 token 为

$$
\boldsymbol\chi_{n,l,k}=\left[\mathbf o_{n,l}^T,\ \Delta p_{n,l,k},\ \Delta\tau_{n,l,k},\ \varrho_{n,l,k},\ (\boldsymbol\xi_{n,l,k}^{\rm att})^T\right]^T,\tag{5}
$$

因此每个 token 同时包含物理传播特征与概率化路径—VA 归因信息。

### B. VA 级材料证据提取

材料证据网络在所有已确认 VA 间共享，并独立作用于每个 VA 中心 token 集（如图 1 所示）。对 VA \(k\)，token 编码器把每个被归因 MPC token 映射为 \(\mathbf h_{n,l,k}=f_\psi(\boldsymbol\chi_{n,l,k})\)；随后带填充掩码的 Transformer 产生 \(\bar{\mathbf H}_{n,k}=\operatorname{Transformer}(\{\mathbf h_{n,l,k}\}_{l\in\mathcal S_{n,k}})\)，以建模指派给同一 VA 的各路径之间的相互作用。一个可学习的注意力池化头把这些路径级嵌入概括为 \(\mathbf g_{n,k}=\operatorname{AttnPool}(\bar{\mathbf H}_{n,k})\)，再送入分类器得到瞬时材料证据

$$
\boldsymbol\gamma_{n,k}=\operatorname{softmax}\left(f_\omega(\mathbf g_{n,k})\right),\tag{6}
$$

其中 \(\boldsymbol\gamma_{n,k}\) 的第 \(c\) 个元素表示与 VA \(k\) 相关的立面属于材料类 \(c\in\mathcal C\) 的瞬时概率。

### C. 在线材料后验融合

由于 MPC 可见性与归因质量都随 UAV 轨迹变化，瞬时材料证据在 VA 级递归融合。令 \(\boldsymbol\pi_{n,k}\) 表示历元 \(n\) 之后 VA \(k\) 的累积材料后验。在纳入当前网络输出 \(\boldsymbol\gamma_{n,k}\) 之前，先预测先验材料信念，并计算当前被归因 MPC 证据的可靠性：

$$
\bar{\boldsymbol\pi}_{n,k}=\mathbf T^T\boldsymbol\pi_{n-1,k},\tag{7}
$$

$$
\zeta_{n,k}=\min\left(1,\ \frac{\sum_{l\in\mathcal S_{n,k}}\alpha_{n,l,k}}{N_{\rm ref}}\right),\tag{8}
$$

其中 \(\mathbf T\) 接近对角阵，因为立面材料在轨迹上静止。(8) 的分子度量 VA \(k\) 的有效被归因 MPC 证据量，\(N_{\rm ref}\) 为一次完全可靠更新所需的参考支撑量。因此 \(\zeta_{n,k}\in[0,1]\) 充当当前网络输出的自适应可靠性门控。后验按

$$
\boldsymbol\pi_{n,k}=\operatorname{Normalize}\left(\bar{\boldsymbol\pi}_{n,k}\odot\boldsymbol\gamma_{n,k}^{\eta\zeta_{n,k}}\right)\tag{9}
$$

更新，其中 \(\odot\) 表示逐元素相乘，\(\eta\) 控制证据强度。对每个材料类 \(c\)，有 \(\pi_{n,k}(c)\propto\bar\pi_{n,k}(c)\gamma_{n,k}(c)^{\eta\zeta_{n,k}}\)。弱归因支撑会减小 \(\zeta_{n,k}\) 并缓和网络证据，而足够支撑则允许更强的更新。轨迹结束后，\(\hat c_k=\arg\max_{c\in\mathcal C}\pi_{N,k}(c)\)。该标签、已确认 VA 位置与可见范围共同构成材料标注地图条目。

## V. 仿真设置与评估协议

我们在图 2 所示的代表性城市街道场景中评估所提框架。固定基站位于 \((0,-18,8)^T\) m，UAV 在低空街道走廊中运动。被评估立面为 W01–W04。

**表 I（原文 Table I）：Sionna RT 中使用的材料相关散射系数**

| 材料 | 散射系数 | 材料 | 散射系数 |
|---|---|---|---|
| 玻璃（Glass） | 0 | 金属（Metal） | 0.15 |
| 混凝土（Concrete） | 0.273 | 砖（Brick） | 0.4 |

**图 2（原文 Fig. 2）：** 代表性城市街道场景与 UAV 轨迹。左：三维视图；右：俯视轨迹布局。

MPC 观测用 Sionna RT 在 28 GHz、发射功率 44 dBm 下生成。目标立面取自材料集 \(\mathcal C=\{{\rm glass},{\rm metal},{\rm concrete},{\rm brick}\}\)，每个立面按 ITU-R P.2040-4 [5] 用相应的 Sionna ITU 无线电材料建模。所有材料上使用 0.1 m 厚度、方向性散射、交叉极化系数 0.4 与 \(\alpha_r=4\)；材料相关散射系数列于表 I。

为获得测量级 MPC 观测，对 RT 路径长度、基站侧天顶/方位 AoA 与接收功率施加零均值高斯噪声，标准差分别为 \(\sigma_d=0.2\) m、\(\sigma_\theta=\sigma_\phi=0.25^\circ\)、\(\sigma_p=1\) dB。噪扰路径通过快照级动态范围门限保留：VA 定位用 \(\Delta_{\rm loc}=20\) dB，材料归因用 \(\Delta_{\rm mat}=50\) dB，二者均相对快照中最强路径。

上述扰动刻画了提取 MPC 参数中的随机不确定性，包括信道估计不完美与接收机噪声。系统性 GPS、同步与校准误差在本评估中未显式建模。一个自然的扩展是用低维偏置状态（如 UAV 位置与公共时延/角度偏移）增强因子图，并在足够可观测时与 VA 状态联合推断。

我们使用 48 组均衡的四立面材料配置，按 32/8/8 划分为训练、验证与测试，各划分之间材料向量不相交。轨迹划分同样不相交：T1–T5 用于训练、T6 用于验证、留出的 T7 轨迹用于测试，每条轨迹约以 1 m 间隔采样。训练与验证使用多个 UAV 高度，而最终测试在未见高度 \(h=45\) m 处的 T7 上进行。

每个材料识别样本是 (5) 中按 \(\alpha_{n,l,k}\) 排序的 VA 中心 token 集 \(\{\boldsymbol\chi_{n,l,k}\}_{l\in\mathcal S_{n,k}}\)。所得数据集包含 111,803 个训练、8,526 个验证与 4,241 个测试 VA 级样本。对在线评估，初始 \(\boldsymbol\pi_{0,k}\) 均匀，转移矩阵对角概率 0.995、非对角概率 0.005/3。验证搜索取 \(\eta\in\{0.1,0.2,0.3,0.5\}\) 与 \(N_{\rm ref}\in\{4,8,16\}\)，优先保证最终 VA 的 macro-F1、其次为准确率；并列时取较小值。较大的 \(\eta\) 强化每次证据更新，较大的 \(N_{\rm ref}\) 要求更多归因支撑。两个动态范围门限在定位可靠性与材料证据覆盖之间取得平衡。当 top 后验连续四次可靠观测超过 0.9 时锁定最终材料决策；否则使用最后的可靠后验。

## VI. 结果与讨论

我们在留出的 T7 轨迹上、就 VA 定位、在线材料后验演化与最终材料标注地图精度评估所提框架。图 3 报告在线指标，图 4 展示代表性地图更新。对材料识别，所有比较方法使用相同网络架构与后验融合规则，只在 MPC 到立面的归因方式上不同。无归因基准使用混合的 MPC 证据；oracle 归因使用真值表面标签，作为上界。现有的非理想表面 SLAM 方法并不直接面向立面级材料标注，因此我们在共享材料推断流程下进行受控比较，以隔离 MPC 到立面归因的贡献。

图 3(a) 表明，所提尾部感知似然在各立面上取得稳定的 VA 定位。相比宽似然基准，它具有更快收敛与更小残差，说明镜面分量保持了 VA 可分离性，而漫射尾部改善了对非理想立面散射的稳健性。图 3(b) 表明，所提材料后验在多数立面上紧密跟随 oracle 趋势，并明显优于无归因基准。W03 更具挑战，主要因为它在 T7 上只在较短的区间被观测到，提供的材料证据较少、不利于后验累积，因此其材料后验收敛更慢、对归因不确定性更敏感——而 oracle 直接使用真值立面关联。图 3(c) 中的在线准确率呈现同样的图级趋势：所提方法始终明显好于无归因基准，并在整个可见评估区间内接近 oracle 归因。

图 4 展示了在线重建过程：随着累积更多 VA 归因的 MPC 证据，材料标注地图逐步被补全并修正。稳定 VA 位置表明，剩余材料错误主要源于归因困难或材料证据较弱，而非较大的几何漂移。

表 II 汇总最终重建性能。所有材料归因变体共享相同的 VA 定位，因而几何 RMSE 相同，为 0.0807 m。所提方法在 32 个立面实例中正确标注 30 个，取得 93.75% 准确率与 0.9365 的 macro-F1，而无归因为 50.00%、oracle 归因为 100%。这些结果证实：概率化立面归因驱动材料识别增益，而剩余差距反映残留归因不确定性。因子图代价随保留的 MPC、候选 VA 与消息更新增长。在 CUDA GPU 服务器上，材料网络推断与在线后验融合每次接收快照约耗时 7.9 ms，因此端到端实时可行性仍未验证。更密集的街道可能增大几何相似立面之间的归因模糊性，而这正是所提软性贝叶斯归因所自然表示的。非标准或风化材料可通过扩展训练集、加入更多样的材料响应来进一步覆盖。

**图 3（原文 Fig. 3）：** 街道场景的综合在线评估。(a) 所提方法与宽似然基准 [8] 的每个立面 VA 定位 RMSE；(b) 每个立面上指派到正确材料类的在线后验；(c) 沿留出 T7 轨迹的在线材料识别准确率，其中底部彩色虚线带表示 W01–W04 的可见评估区间。

**图 4（原文 Fig. 4）：** 留出 T7 轨迹上一个代表性材料配置的在线材料标注重建演化。图例：真值立面、重建立面（材料正确）、重建立面（材料错误）、当前 UAV、真值 VA、估计 VA、T7 采样点。

**表 II（原文 Table II）：留出 T7 测试轨迹上的最终材料标注重建性能**

| 方法 | RMSE（m） | 准确率 | Macro-F1 | 正确数 |
|---|---|---|---|---|
| 所提 | 0.0807 | 0.9375 | 0.9365 | 30/32 |
| 无归因 | 0.0807 | 0.5000 | 0.4507 | 16/32 |
| Oracle 归因 | 0.0807 | 1.0000 | 1.0000 | 32/32 |

## VII. 结论

本文为低空 BS–UAV ISAC 中的材料标注重建开发了一个在线框架，整合贝叶斯 VA 定位、尾部感知多径归因与 VA 中心后验融合。射线追踪结果表明，概率化归因可从混合的顺序 MPC 中实现可靠材料推断，在留出轨迹上达到 93.75% 的最终立面级准确率，同时保持准确的 VA 定位。

## 参考文献（英文原书目）

[1] Y. Jiang et al., “Integrated sensing and communication for low altitude economy: Opportunities and challenges,” IEEE Commun. Mag., vol. 63, no. 12, pp. 72–78, Dec. 2025.

[2] G. Liu et al., “Cooperative sensing for 6G ISAC: Concept, key technologies, performance evaluation, and field trial,” Engineering, vol. 56, pp. 130–148, 2026.

[3] E. Leitinger et al., “A belief propagation algorithm for multipath-based SLAM,” IEEE Trans. Wireless Commun., vol. 18, no. 12, pp. 5613–5629, Dec. 2019.

[4] S. Sun et al., “Modeling and analysis of land-to-ship maritime wireless channels at 5.8 GHz,” IEEE Trans. Wireless Commun., vol. 25, pp. 10 051–10 065, 2026.

[5] ITU-R, “Effects of building materials and structures on radio-wave propagation in the range of 1 MHz to 450 GHz,” International Telecommunication Union, Recommendation ITU-R P.2040-4, Sep. 2025.

[6] T. Zhang et al., “Diffuse scattering measurements and mechanism analysis at 8, 12, and 28 GHz for typical building surfaces,” npj Wireless Technol., vol. 2, no. 1, Jan. 2026.

[7] Z. Chang et al., “Environment reconstruction with multi-targets reflectors-merged sensing method based on THz single-sided channel characteristics,” IEEE Wireless Commun. Lett., vol. 14, no. 5, pp. 1471–1475, May 2025.

[8] M. Liu et al., “Fusion of monostatic and bistatic sensing for ISAC-enabled low-altitude environment mapping,” IEEE Trans. Commun., vol. 74, pp. 12 451–12 467, 2026.

[9] J. Song et al., “Deep learning-based dynamic environment reconstruction for vehicular ISAC scenarios,” IEEE Trans. Wireless Commun., vol. 25, pp. 14 198–14 211, 2026.

[10] T. Yang et al., “EnvReconGPT: A generative AI model for wireless environment reconstruction in the 6G metaverse,” in IEEE INFOCOM 2025 - IEEE Conference on Computer Communications Workshops (INFOCOM WKSHPS), London, United Kingdom, 2025, pp. 1–6.

[11] Y. Lyu et al., “Hybrid channel modeling and environment reconstruction for terahertz monostatic sensing,” IEEE Trans. Wireless Commun., vol. 24, no. 10, pp. 8492–8504, Oct. 2025.

[12] S. Zhai et al., “Multipath-based SLAM exploiting extended object estimation and classification,” IEEE Trans. Wireless Commun., vol. 24, no. 8, pp. 7029–7045, Aug. 2025.

[13] L. Wielandner et al., “MIMO multipath-based SLAM for non-ideal reflective surfaces,” in Proc. 27th Int. Conf. Inf. Fusion (FUSION), Venice, Italy, Jul. 2024, pp. 1–8.

## 图注与表注

**图注：** 图 1–4 的图注已随文置于相应位置：图 1（第 I 节末）、图 2（第 V 节）、图 3 与图 4（第 VI 节）。其中图 1 为所提材料标注环境重建流程的总体框架图，含三个模块——(1) MPC 观测与 VA 定位（任务相关 MPC 门限、严格几何门限与宽松材料门限、贝叶斯因子图 VA 定位、已确认 VA 集与存在概率）；(2) MPC 归因与 token 构造（材料导向 MPC 归因、似然打分、贝叶斯更新、归因权重与归因描述子、按归因权重 top-K 截断、归因感知 MPC token 构造：物理 MPC 观测量 + VA 内上下文特征 + 归因描述子）；(3) VA 中心材料推断与在线融合（共享的 VA 级材料证据网络：路径编码器 MLP、Transformer 编码器 ×2、注意力池化、MLP 头输出瞬时材料证据；在线材料后验融合：先验预测、可靠性权重、可靠性加权更新、材料决策锁定；输出材料标注地图，含 VA 位置、材料标签与可见范围）。

**表注：** 原文共两张表：表 I（Sionna RT 所用材料相关散射系数）与表 II（留出 T7 轨迹上的最终材料标注重建性能），均已在本页相应位置逐格转写。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VII 节全部正文与子节（含 II-A/B/C、III-A/B、IV-A/B/C）、式 (1)–(9)、图 1–4 图注（图 1 的框架模块说明按原图文字整理）、表 I–II（逐格转写）、参考文献 [1]–[13]（英文原条目，编号与原文一致）。原文无附录、无致谢段、无补充材料。全部公式按 PDF 渲染页（p3、p4）逐式核对；表 I、表 II 与图 2–4 的图注按渲染页 p5、p6 核对。**原文说明：** 源文文本抽取在第 4–5 页存在段落重复（同一段文字以不同公式编号出现），经 PDF 渲染页核对后确认实际公式编号为 (1)–(9)（原抽取中出现的 (10)、(11) 为重复段落所致）；本页按 PDF 实际编号录入。未发现需要加注的数值或逻辑矛盾；原文表 II 中三种归因变体共享同一 VA 定位，故几何 RMSE 相同（0.0807 m），与正文表述一致。逐句逐式终校未做；供后续 QA 重点核对：式 (2) 的因子图乘积结构、式 (4) 归因量定义与式 (8) 可靠性门控的归一化细节。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
