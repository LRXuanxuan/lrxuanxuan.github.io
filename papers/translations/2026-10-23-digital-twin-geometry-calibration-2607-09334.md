---
layout: page
title: "数字孪生辅助信道估计中的场景几何与标定不确定性｜中文译稿（待终校）"
permalink: /papers/translations/2026-10-23-digital-twin-geometry-calibration-2607-09334/
math: true
toc: true
---

[← 返回论文库](/papers/) · [原论文 arXiv](https://arxiv.org/abs/2607.09334) · [原文 PDF](https://arxiv.org/pdf/2607.09334v1)

# 数字孪生赋能信道估计中的场景几何与标定不确定性

**英文原题：** Site Geometry and Calibration Uncertainties in Digital Twin-enabled Channel Estimation  
**作者：** Lorenzo Del Moro、Francesco Linsalata、Umberto Spagnolini、Maurizio Magarini  
**单位：** 米兰理工大学电子、信息与生物工程系（DEIB）  
**版本：** arXiv:2607.09334v1，2026 年 7 月 10 日，16 页。  
**状态与边界：** 已按原文翻译摘要、正文 I—VI、主要公式（1）—（38）、表 I—III 与图 1—6 的正文解释，并整理附录推导的符号关系。附录 A—B 的逐式转录及英文参考文献条目尚待完整复核；不标记为已通过全文验收。本站不重复上传原 PDF、图像。

## 摘要

快速射线追踪（ray tracing，RT）推动了数字孪生（digital twin，DT）成为环境感知通信的新兴技术。无线传播由场景几何与环境电磁（electromagnetic，EM）特性共同决定，因此基于 DT 的方法能够为信道估计提供特定场景的先验。研究 DT 辅助信道估计的鲁棒性：利用 RT 提取多径特征，重建信道协方差矩阵的低秩（low-rank，LR）特征结构，并将其用于估计。然而传播环境的数字表示并不精确，因而会影响低秩先验。研究明确分析来自用户定位误差与电磁材料标定误差的模型失配：前者导致场景几何不一致，后者改变多径增益。建立一阶扰动模型，将影响角度、时延的几何扰动与影响路径增益的电磁扰动分离，并据此开展归一化均方误差（NMSE）分析。结果表明：低秩估计对电磁标定扰动具有固有鲁棒性，而定位误差改变信道特征子空间，是性能下降的主要因素。在城区、郊区和乡村场景的数值实验中，定位误差仍是首要限制因素，电磁标定误差的影响相对有限。在城区低信噪比设置下，DT 辅助估计相比基线可将 NMSE 改善多达 10 dB；在中等（小于 1 m）定位误差的高 SNR 场景中，性能与基线相当。

**索引词：** 数字孪生、射线追踪、信道估计。

## I. 引言

下一代网络面向更高数据速率、可靠性与更低时延；更高的中频段和毫米波有望提供宽带容量，却也带来更严重传播损耗 [1]。MIMO 是拓展这些频段的重要技术，但宽带 MIMO 信道参数数量很大，使准确估计更具挑战 [2]。低秩与 MMSE 估计器可利用信道协方差的特征结构：在空时（spatio-temporal，ST）域内，稀疏多径使宽带 MIMO 信道具有低秩特征 [3]。

这一特征结构在物理上取决于传播几何及环境中的电磁相互作用。基站与用户设备（UE）位置、场景几何共同确定主要传播路径；UE 定位误差则直接转化为基站视角的几何失配。但实际获取可靠的大维度协方差矩阵并不容易 [4]，因此研究者开展了学习辅助估计、堆叠智能超表面处理和利用传播先验的环境感知通信等研究 [5]—[9]。

数字孪生在无线接入网（RAN）中以虚拟环境映射物理系统 [10]。基于高保真三维场景、地图或多模态感知数据，RT 可估计反射、绕射及漫散射路径的到达角（AoA）、离开角（AoD）、传播时延和路径增益 [11]—[14]，进而构成协方差矩阵与特征结构。与纯数据驱动估计相比，这些先验直接受到电磁传播物理规律约束，但数字环境一旦与实际环境不一致，就会造成子空间及特征值失配。

既有工作主要研究 DT 建模精度、RT 计算效率与 RAN 协同机制 [10]—[17]；另有工作将 DT 用于定位、混合预编码/合并及 CSI 反馈 [18]—[20]。面向信道估计，有研究利用强化学习校准 DT 得到的子空间 [21]，作者先前利用 DT 重建 ST 特征结构实现上行低秩信道估计 [22]、[23]。另外一些工作标定射线追踪模型中的环境参数以匹配实测信道 [14]、[24]、[25]。然而，对于剩余几何与标定误差如何传播到协方差特征结构，以及由此如何影响 LR 与 MMSE 估计性能，仍缺少解析刻画。

高分辨率三维模型也可能含有 UE 定位误差或材料电磁参数标定误差。二者在本文采用的小扰动假设下作用不同：定位误差改变路径几何及角度、时延，而材料参数误差主要改变路径增益。在真实部署中，两种误差与 RT 近似误差往往耦合，难以通过实测单独分离。因此采用可控制的高保真 RT 仿真，以分析两类误差的独立作用。

主要贡献为：（1）建立由三维场景和 RT 提取多径参数、重建协方差特征结构的 DT 辅助 LR/MMSE 估计框架；（2）推导 UE 定位误差引起的 AoA/AoD/时延一阶扰动和材料标定引起的路径增益一阶扰动；（3）通过 NMSE 解析说明 LR 估计对仅改变特征值、保持子空间的扰动不敏感，而定位误差导致子空间失配；（4）在城区、郊区与乡村三维 RT 场景验证该框架，低 SNR 下可相较基线改进至多 10 dB。

**表 I（与相关工作的区别）。** 既有 RT-DT 构建研究侧重建模、协调和 RAN 优化；标定研究侧重匹配测量；定位、预编码及反馈研究不直接分析信道估计；文献 [21] 采用基于子空间的估计但无扰动分析；[22]、[23] 使用 DT-LR 估计但无失配分析；本工作同时考虑 LR/MMSE 估计和 DT 误差传播。

**记号。** $^*$、$^T$、$^H$ 和 $^\dagger$ 分别表示共轭、转置、共轭转置与 Moore–Penrose 伪逆；$\otimes$ 是 Kronecker 积，$\operatorname{diag}$ 构造对角矩阵，$\operatorname{vec}$ 表示向量化；$\operatorname{Tr}$、$\operatorname{rank}$ 与 $\operatorname{span}$ 分别表示迹、秩与列空间，$\mathbb E$ 为期望，$\mathcal N$ 与 $\mathcal{CN}$ 分别表示实与复高斯分布。

## II. 系统与信道模型

考虑基站具有 $N_r$ 根接收天线、UE 具有 $N_t$ 根发射天线的上行 MIMO-OFDM。OFDM 符号时长为 $T=(N_{\rm sc}+N_{\rm cp})T_s$，其中采样间隔 $T_s=1/B$、$B$ 为带宽，$N_{\rm cp}$ 为循环前缀长度，$N_{\rm sc}$ 为子载波数。

### A. 上行导频发送

每个 UE 发射天线使用一个相互正交、基站已知的导频序列。每序列包含 $N_p$ 个预定频率位置上的导频，持续 $M$ 个 OFDM 训练符号。第 $\ell$ 根 UE 天线在频域发送 $\mathbf x^\ell\in\mathbb C^{N_p}$，满足 $(\mathbf x^\ell)^H\mathbf x^{\ell'}=P_TN_p\delta(\ell-\ell')$，其中 $P_T$ 为每导频子载波的平均发射功率。假设循环前缀满足 $N_{\rm cp}\ge W-1$，$W$ 为信道冲激响应（CIR）的最大离散时延支撑。第 $m$ 个符号在基站天线 $q$ 上接收

$$\mathbf y^q(m)=\sum_{\ell=1}^{N_t}\operatorname{diag}(\mathbf x^\ell)\mathbf h_F^{\ell,q}(m)+\mathbf w^q(m).\tag{1}$$

$\mathbf h_F^{\ell,q}=\widetilde{\mathbf F}\mathbf h^{\ell,q}$；部分离散傅里叶矩阵满足

$$[\widetilde{\mathbf F}]_{k,w}=\frac{1}{\sqrt{N_{\rm sc}}}\exp(-j2\pi kw/N_{\rm sc}),\tag{2}$$

其中 $k$ 为导频子载波索引、$w=0,\dots,W-1$；噪声 $\mathbf w^q\sim\mathcal{CN}(0,\sigma_w^2\mathbf I_{N_p})$。堆叠所有 UE 发射天线的冲激响应 $\mathbf h^q$，令 $\mathbf B=[\operatorname{diag}(\mathbf x^1)\widetilde{\mathbf F},\dots,\operatorname{diag}(\mathbf x^{N_t})\widetilde{\mathbf F}]$，有

$$\mathbf y^q(m)=\mathbf B\mathbf h^q(m)+\mathbf w^q(m).\tag{3}$$

对 $N_r$ 根接收天线进一步向量化，得到标准线性观测模型

$$\mathbf y(m)=\operatorname{vec}(\mathbf Y(m))=\boldsymbol\Psi\mathbf h(m)+\mathbf w(m),\quad\boldsymbol\Psi=\mathbf I_{N_r}\otimes\mathbf B,\quad L=WN_tN_r.\tag{4}$$

可辨识性要求 $N_p\ge WN_t$。等功率、等间隔、相位正交的最优 ML 导频满足 $\boldsymbol\Psi^H\boldsymbol\Psi=\nu\mathbf I_L$，其中 $\nu=P_TN_p/N_{\rm sc}$。高斯情况下的最大似然估计为

$$\widehat{\mathbf h}_{\rm ML}(m)=\boldsymbol\Psi^\dagger\mathbf y(m).\tag{5}$$

### B. 空时 MIMO 信道

信道由 $P$ 条离散平面波多径组成，每条路径具有 AoA、AoD、传播时延及路径增益。路径 $p$ 的到达角 $\boldsymbol\theta_p=[\theta_p^{\rm az},\theta_p^{\rm el}]$，离开角 $\boldsymbol\gamma_p=[\gamma_p^{\rm az},\gamma_p^{\rm el}]$，时延 $\tau_p\ge0$，功率增益 $\Omega_p\ge0$。令 $\boldsymbol\xi_p=[\boldsymbol\theta_p,\boldsymbol\gamma_p,\tau_p]^T$，$\boldsymbol\xi$ 与 $\boldsymbol\Omega$ 堆叠全部路径参数。假设这些慢变参数在 $M$ 个训练符号期间恒定。

对于远场平面波，第 $p$ 条路径在基站的阵列响应向量为

$$\mathbf a_{\rm BS}(\boldsymbol\theta_p)=\left[e^{j\frac{2\pi}{\lambda}(\mathbf u_1^{\rm BS})^T\mathbf v_p^{\rm BS}},\dots,e^{j\frac{2\pi}{\lambda}(\mathbf u_{N_r}^{\rm BS})^T\mathbf v_p^{\rm BS}}\right]^T,\tag{6}$$

其中 $\mathbf v_p^{\rm BS}=[\cos\theta_p^{\rm az}\cos\theta_p^{\rm el},\sin\theta_p^{\rm az}\cos\theta_p^{\rm el},\sin\theta_p^{\rm el}]^T$。UE 阵列响应同理：

$$\mathbf a_{\rm UE}(\boldsymbol\gamma_p)=\left[e^{j\frac{2\pi}{\lambda}(\mathbf u_1^{\rm UE})^T\mathbf v_p^{\rm UE}},\dots,e^{j\frac{2\pi}{\lambda}(\mathbf u_{N_t}^{\rm UE})^T\mathbf v_p^{\rm UE}}\right]^T.\tag{7}$$

$\mathbf g(\tau_p)=[g(-\tau_p),\dots,g((W-1)T_s-\tau_p)]^T$ 为收发端脉冲成形滤波器级联后的离散 CIR。于是

$$\mathbf h(m)=\sum_{p=1}^P\sqrt{\Omega_p}\left[\mathbf a_{\rm BS}(\boldsymbol\theta_p)\otimes\mathbf a_{\rm UE}(\boldsymbol\gamma_p)\otimes\mathbf g(\tau_p)\right]e^{j\varphi_p(m)}.\tag{8}$$

相位 $\varphi_p(m)$ 独立、均匀分布于 $[-\pi,\pi)$，在符号间变化，表达快衰落；而 $\{\boldsymbol\xi,\boldsymbol\Omega\}$ 表达慢变传播结构。令 $\mathbf t(\boldsymbol\xi_p)=\mathbf a_{\rm BS}(\boldsymbol\theta_p)\otimes\mathbf a_{\rm UE}(\boldsymbol\gamma_p)\otimes\mathbf g(\tau_p)$，$\mathbf T(\boldsymbol\xi)=[\mathbf t(\boldsymbol\xi_1),\dots,\mathbf t(\boldsymbol\xi_P)]$，协方差为

$$\mathbf R(\boldsymbol\xi,\boldsymbol\Omega)=\mathbf T(\boldsymbol\xi)\operatorname{diag}(\boldsymbol\Omega)\mathbf T(\boldsymbol\xi)^H.\tag{9}$$

将其特征分解为 $\mathbf U\boldsymbol\Lambda\mathbf U^H$，其中 $\boldsymbol\Lambda=\operatorname{diag}(\lambda_1,\dots,\lambda_r)$ 包含非零特征值，$r\le P$，$\mathbf U$ 包含对应正交特征向量。信道子空间 $\mathcal S=\operatorname{span}(\mathbf U)=\operatorname{span}(\mathbf T(\boldsymbol\xi))$ 描述几何模态，特征值谱描述功率分布。由于宽带 MIMO 的 ST 域通常稀疏，采用这些低秩统计先验进行估计具有理论依据。

## III. 数字孪生信道估计

### A. 框架

如图 1，基站的 DT 将数字场景几何 $\widehat{\mathbf s}$、电磁材料参数 $\widehat{\mathbf e}$ 与基站/UE 位置 $\widehat{\mathbf p}=[\widehat{\mathbf p}_{\rm BS}^T,\widehat{\mathbf p}_{\rm UE}^T]^T$ 输入 RT，得到 $\{\widehat{\boldsymbol\xi},\widehat{\boldsymbol\Omega}\}$，并重建协方差、特征向量和特征值。平面波假设下，同一传播路径的角度及传播时延在阵列上公共，阵元位置差异由响应向量编码。

每个 ST 时间区间 $T_{\rm ST}$ 开始时运行 RT 并更新传播先验。作者此前的 GPU 加速 SBR 研究 [16] 表明，在典型部署中 RT 运行时间可显著小于 $T_{\rm ST}$；极高移动性时可能只能求得部分路径，但本文限制于全部 $P$ 条主导路径都被恢复。DT 提供的协方差为 $\widehat{\mathbf R}=\mathbf T(\widehat{\boldsymbol\xi})\operatorname{diag}(\widehat{\boldsymbol\Omega})\mathbf T(\widehat{\boldsymbol\xi})^H$，特征分解得到 $\widehat{\mathbf U}$、$\widehat{\boldsymbol\Lambda}$ 和维数 $\widehat r$，再结合观测 $\mathbf y(m)$ 进行信道估计。几何和材料误差不会直接进入估计器，而是通过 DT 重建的特征结构进入。

### B. DT 辅助低秩与 MMSE 估计

DT 辅助 LR 估计器将 ML 估计投影到 DT 提供的低秩子空间：

$$\widehat{\boldsymbol\Pi}_{\rm LR}=\widehat{\mathbf U}\widehat{\mathbf U}^H,\tag{10}$$

$$\widehat{\mathbf h}_{\rm LR}(m)=\widehat{\boldsymbol\Pi}_{\rm LR}\widehat{\mathbf h}_{\rm ML}(m).\tag{11}$$

投影矩阵厄米且幂等，仅取决于子空间，不依赖非零特征值大小。因此只改变功率谱而不改变子空间的扰动不影响该投影。协方差特征分解一般需 $O(L^3)$，但仅在每个 $T_{\rm ST}$ 区间计算一次；每训练符号的估计与投影复杂度为 $O(LN_rN_p+L\widehat r)$。

相较之下，DT 辅助 MMSE 用特征值加权投影：

$$\widehat{\boldsymbol\Pi}_{\rm MMSE}=\widehat{\mathbf U}\left[\widehat{\boldsymbol\Lambda}\left(\widehat{\boldsymbol\Lambda}+\frac{\widehat\sigma_w^2}{\nu}\mathbf I_{\widehat r}\right)^{-1}\right]\widehat{\mathbf U}^H,\tag{12}$$

$$\widehat\sigma_w^2=\frac{\nu}{M_w(L-\widehat r)}\sum_{m=1}^{M_w}\left\|\widehat{\boldsymbol\Pi}_{\rm LR}^{\perp}\widehat{\mathbf h}_{\rm ML}(m)\right\|^2,\quad\widehat{\boldsymbol\Pi}_{\rm LR}^{\perp}=\mathbf I_L-\widehat{\boldsymbol\Pi}_{\rm LR},\tag{13}$$

$$\widehat{\mathbf h}_{\rm MMSE}(m)=\widehat{\boldsymbol\Pi}_{\rm MMSE}\widehat{\mathbf h}_{\rm ML}(m).\tag{14}$$

这里由子空间正交补估计噪声方差；子空间失配可能使噪声估计产生偏差。MMSE 因为同时依赖子空间与特征值谱，对两类失配都敏感。每符号计算复杂度量级与 LR 相同，权值的 $\widehat r\times\widehat r$ 逆矩阵仅在每个 $T_{\rm ST}$ 区间计算一次；$M_w$ 可以远小于 $M$。

### C. DT 失配模型

为单独考察 UE 定位和材料标定误差，假设三维场景和基站位置已准确已知：$\widehat{\mathbf s}=\mathbf s$、$\widehat{\mathbf p}_{\rm BS}=\mathbf p_{\rm BS}$。令 $\widehat{\mathbf p}_{\rm UE}=\mathbf p_{\rm UE}+\Delta\mathbf p$、$\widehat{\mathbf e}=\mathbf e+\Delta\mathbf e$。由射线追踪算子 $f_{\rm RT}$ 得到

$$f_{\rm RT}(\mathbf s,\widehat{\mathbf e},\widehat{\mathbf p})=(\widehat{\boldsymbol\xi},\widehat{\boldsymbol\Omega}),\tag{15}$$

$$f_{\rm RT}(\mathbf s,\widehat{\mathbf e},\widehat{\mathbf p})\approx(\boldsymbol\xi+\Delta\boldsymbol\xi,\boldsymbol\Omega+\Delta\boldsymbol\Omega).\tag{16}$$

只研究主导路径集合不因扰动改变的局部小误差情形，即 $\widehat P=P$。忽略有限射线角分辨率、反射阶数等 RT 近似误差，也不考虑强扰动造成的新路径产生或已有路径消失。对镜面反射，材料属性不改变几何，$\partial\boldsymbol\xi/\partial\mathbf e=0$；为便于一阶解析，进一步忽略位置对路径增益的弱耦合，取 $\partial\boldsymbol\Omega/\partial\mathbf p=0$。后者是建模近似，并非严格物理恒等式。因而

$$\Delta\boldsymbol\xi=\frac{\partial\boldsymbol\xi}{\partial\mathbf p}\Delta\mathbf p,\qquad\Delta\boldsymbol\Omega=\frac{\partial\boldsymbol\Omega}{\partial\mathbf e}\Delta\mathbf e.\tag{17}$$

## IV. DT 扰动模型与 NMSE 分析

### A. 几何失配引起的 ST 特征扰动

令 UE 位置误差 $\Delta\mathbf p\sim\mathcal N(\mathbf0,\boldsymbol\Sigma_p)$。依据镜像法（图 2），经历 $K_p$ 次镜面反射的路径可等价为基站与 UE 虚像之间的视距线段。UE 虚像位置为 $\mathbf p_{\rm UE,p}^{\rm im}=\mathbf A_p^{\rm UE}\mathbf p_{\rm UE}+\mathbf b_p^{\rm UE}$，其中 $\mathbf A_p^{\rm UE}$ 为沿该路径各反射平面 Householder 反射矩阵的乘积，$\mathbf b_p^{\rm UE}$ 为仿射偏置。位置误差变为 $\Delta\mathbf p_p^{\rm im}=\mathbf A_p^{\rm UE}\Delta\mathbf p$，协方差为 $\mathbf A_p^{\rm UE}\boldsymbol\Sigma_p(\mathbf A_p^{\rm UE})^T$。

记等效 LoS 向量 $\mathbf r_p=\mathbf p_{\rm UE,p}^{\rm im}-\mathbf p_{\rm BS}$，长度 $R_p=\|\mathbf r_p\|$，单位方向 $\mathbf v_p^{\rm BS}=\mathbf r_p/R_p$，则一阶距离扰动为

$$\widehat R_p\approx R_p+(\mathbf v_p^{\rm BS})^T\Delta\mathbf p_p^{\rm im}.\tag{18}$$

由 $\tau_p=R_p/c$ 得路径时延的高斯扰动分布：

$$\widehat\tau_p\sim\mathcal N\left(\tau_p,\frac{1}{c^2}(\mathbf v_p^{\rm BS})^T\mathbf A_p^{\rm UE}\boldsymbol\Sigma_p(\mathbf A_p^{\rm UE})^T\mathbf v_p^{\rm BS}\right).\tag{19}$$

令 $\rho_p^2=r_{p,x}^2+r_{p,y}^2$，$\mathbf q_{\theta_p^{\rm az}}=[-r_{p,y},r_{p,x},0]^T$。方位 AoA 的一阶展开与分布为

$$\widehat\theta_p^{\rm az}\approx\theta_p^{\rm az}+\frac{\mathbf q_{\theta_p^{\rm az}}^T\Delta\mathbf p_p^{\rm im}}{\rho_p^2},\tag{20}$$

$$\widehat\theta_p^{\rm az}\sim\mathcal N\left(\theta_p^{\rm az},\frac{\mathbf q_{\theta_p^{\rm az}}^T\mathbf A_p^{\rm UE}\boldsymbol\Sigma_p(\mathbf A_p^{\rm UE})^T\mathbf q_{\theta_p^{\rm az}}}{\rho_p^4}\right).\tag{21}$$

设 $\mathbf q_{\theta_p^{\rm el}}=[-r_{p,z}r_{p,x},-r_{p,z}r_{p,y},\rho_p^2]^T$，仰角 AoA 一阶近似为

$$\widehat\theta_p^{\rm el}\approx\theta_p^{\rm el}+\frac{\mathbf q_{\theta_p^{\rm el}}^T\Delta\mathbf p_p^{\rm im}}{R_p^2\rho_p},\tag{22}$$

$$\widehat\theta_p^{\rm el}\sim\mathcal N\left(\theta_p^{\rm el},\frac{\mathbf q_{\theta_p^{\rm el}}^T\mathbf A_p^{\rm UE}\boldsymbol\Sigma_p(\mathbf A_p^{\rm UE})^T\mathbf q_{\theta_p^{\rm el}}}{R_p^4\rho_p^2}\right).\tag{23}$$

同一路径亦可表达为 UE 与 BS 虚像间的 LoS，令 $\mathbf d_p=\mathbf p_{\rm UE}-\mathbf p_{\rm BS,p}^{\rm im}$，$D_p=\|\mathbf d_p\|$，$\delta_p^2=d_{p,x}^2+d_{p,y}^2$，$\mathbf q_{\gamma_p^{\rm az}}=[-d_{p,y},d_{p,x},0]^T$，$\mathbf q_{\gamma_p^{\rm el}}=[-d_{p,z}d_{p,x},-d_{p,z}d_{p,y},\delta_p^2]^T$。AoD 的两个分量满足

$$\widehat\gamma_p^{\rm az}\sim\mathcal N\left(\gamma_p^{\rm az},\frac{\mathbf q_{\gamma_p^{\rm az}}^T\boldsymbol\Sigma_p\mathbf q_{\gamma_p^{\rm az}}}{\delta_p^4}\right),\tag{24}$$

$$\widehat\gamma_p^{\rm el}\sim\mathcal N\left(\gamma_p^{\rm el},\frac{\mathbf q_{\gamma_p^{\rm el}}^T\boldsymbol\Sigma_p\mathbf q_{\gamma_p^{\rm el}}}{D_p^4\delta_p^2}\right).\tag{25}$$

将 $\theta_p^{\rm az},\theta_p^{\rm el},\gamma_p^{\rm az},\gamma_p^{\rm el},\tau_p$ 的一阶系数组成 $\mathbf J_p\in\mathbb R^{5\times3}$：

$$\mathbf J_p=\begin{bmatrix}\rho_p^{-2}\mathbf q_{\theta_p^{\rm az}}^T\mathbf A_p^{\rm UE}\\(R_p^2\rho_p)^{-1}\mathbf q_{\theta_p^{\rm el}}^T\mathbf A_p^{\rm UE}\\\delta_p^{-2}\mathbf q_{\gamma_p^{\rm az}}^T\\(D_p^2\delta_p)^{-1}\mathbf q_{\gamma_p^{\rm el}}^T\\c^{-1}(\mathbf v_p^{\rm BS})^T\mathbf A_p^{\rm UE}\end{bmatrix}.\tag{26}$$

因此 $\Delta\boldsymbol\xi_p=\mathbf J_p\Delta\mathbf p\sim\mathcal N(0,\mathbf J_p\boldsymbol\Sigma_p\mathbf J_p^T)$；堆叠所有路径后，$\Delta\boldsymbol\xi\sim\mathcal N(0,\mathbf J\boldsymbol\Sigma_p\mathbf J^T)$。这一结果明确表明位置误差通过几何映射同时改变多个角度与时延，并在这些参数之间诱导相关性。

### B. 标定误差引起的路径增益扰动

对于经历 $K_p$ 次镜面反射的第 $p$ 条路径，RT 提供的路径增益可写为

$$\widehat\Omega_p=\Omega_p^{(0)}\prod_{k=1}^{K_p}|\widehat\Gamma_{p,k}|^2,\tag{27}$$

其中 $\Omega_p^{(0)}$ 为自由空间损耗项，$\widehat\Gamma_{p,k}$ 为数字模型中第 $k$ 次反射的 Fresnel 系数。局部入射角由射线方向和表面外法线决定，材料复相对介电常数写为 $\varepsilon_r=\varepsilon'-j\varepsilon''$，实部描述介电响应，虚部描述导电损耗。在空气—材料界面，TE、TM 极化反射系数为

$$\widehat\Gamma_{p,k}^{\rm TE}=\frac{\cos\theta_{p,k}-\sqrt{\widehat\varepsilon_{p,k}^r-\sin^2\theta_{p,k}}}{\cos\theta_{p,k}+\sqrt{\widehat\varepsilon_{p,k}^r-\sin^2\theta_{p,k}}},\tag{28}$$

$$\widehat\Gamma_{p,k}^{\rm TM}=\frac{\widehat\varepsilon_{p,k}^r\cos\theta_{p,k}-\sqrt{\widehat\varepsilon_{p,k}^r-\sin^2\theta_{p,k}}}{\widehat\varepsilon_{p,k}^r\cos\theta_{p,k}+\sqrt{\widehat\varepsilon_{p,k}^r-\sin^2\theta_{p,k}}}.\tag{29}$$

用 $\widehat\varepsilon^r_{p,k}=\varepsilon^r_{p,k}+\Delta e_{p,k}$ 表示标定误差，假设各路径与反射上的小扰动独立，$\Delta e_{p,k}\sim\mathcal{CN}(0,\sigma_{p,k}^2)$。对 $\Gamma(\varepsilon,\theta)$ 在真实参数处一阶展开：

$$\widehat\Gamma_{p,k}\approx\Gamma_{p,k}+c_{p,k}\Delta e_{p,k},\qquad c_{p,k}=\left.\frac{\partial\Gamma(\varepsilon,\theta_{p,k})}{\partial\varepsilon}\right|_{\varepsilon=\varepsilon_{p,k}^r}.\tag{30}$$

因此 $|\widehat\Gamma_{p,k}|^2\approx|\Gamma_{p,k}|^2+2\operatorname{Re}(\Gamma_{p,k}^*c_{p,k}\Delta e_{p,k})$。忽略二阶误差，对全路径反射系数乘积展开得到

$$\widehat\Omega_p\approx\Omega_p+\Omega_p\sum_{k=1}^{K_p}\operatorname{Re}(\alpha_{p,k}\Delta e_{p,k}),\quad \alpha_{p,k}=\frac{2c_{p,k}}{\Gamma_{p,k}}.\tag{31}$$

于是 $\widehat\Omega_p=\Omega_p+\Delta\Omega_p$，其中

$$\Delta\Omega_p\sim\mathcal N\left(0,\Omega_p^2\sum_{k=1}^{K_p}\frac{\sigma_{p,k}^2}{2}|\alpha_{p,k}|^2\right).\tag{32}$$

所有路径的增益扰动组成 $\Delta\boldsymbol\Omega\sim\mathcal N(0,\boldsymbol\Sigma_\Omega)$，其协方差为相应方差组成的对角阵。因此在小误差且传播路径集合不变时，材料标定误差改变传播模态间的功率分布，但不直接改变其几何子空间。

### C. NMSE 分析

在给定 DT 重建特征结构的条件下，对真实信道与独立噪声取期望。将估计误差 $\widetilde{\mathbf h}(m)=\widehat{\mathbf h}(m)-\mathbf h(m)$ 的 NMSE 定义为

$$\operatorname{NMSE}=\frac{1}{\Gamma}\mathbb E\|\widetilde{\mathbf h}(m)\|^2,\qquad\Gamma=\mathbb E\|\mathbf h(m)\|^2=\operatorname{Tr}\mathbf R(\boldsymbol\xi,\boldsymbol\Omega).\tag{33}$$

对 LR 估计器，可拆分为真实信道落在 DT 子空间之外的残差与投影噪声：

$$\operatorname{NMSE}_{\rm LR}^{\rm DT}=\underbrace{\frac{\operatorname{Tr}(\widehat{\boldsymbol\Pi}_{\rm LR}^{\perp}\mathbf R)}{\Gamma}}_{\sigma_{h,\rm LR}^2}+\underbrace{\frac{\sigma_w^2\operatorname{Tr}(\widehat{\boldsymbol\Pi}_{\rm LR})}{\nu\Gamma}}_{\sigma_{w,\rm LR}^2}.\tag{34}$$

由于 $\operatorname{Tr}\widehat{\boldsymbol\Pi}_{\rm LR}=\widehat r$，噪声项为 $\sigma_w^2\widehat r/(\nu\Gamma)$。设真实协方差非零特征对为 $(\lambda_j,\mathbf u_j)$，DT 子空间基向量为 $\widehat{\mathbf u}_k$，则

$$\sigma_{h,\rm LR}^2=1-\frac{1}{\Gamma}\sum_{j=1}^r\sum_{k=1}^{\widehat r}\lambda_j|\langle\widehat{\mathbf u}_k,\mathbf u_j\rangle|^2.\tag{35}$$

这一形式直接计算真实信道功率投射在 DT 子空间外的比例。对 MMSE，则

$$\operatorname{NMSE}_{\rm MMSE}^{\rm DT}=\frac{\operatorname{Tr}[(\mathbf I_L-\widehat{\boldsymbol\Pi}_{\rm MMSE})\mathbf R(\mathbf I_L-\widehat{\boldsymbol\Pi}_{\rm MMSE})^H]}{\Gamma}+\frac{\sigma_w^2}{\nu\Gamma}\operatorname{Tr}(\widehat{\boldsymbol\Pi}_{\rm MMSE}\widehat{\boldsymbol\Pi}_{\rm MMSE}^H).\tag{36}$$

引入每个 DT 特征模态的收缩权重 $\mu_k=\nu\widehat\lambda_k/(\nu\widehat\lambda_k+\widehat\sigma_w^2)$，噪声项为 $\frac{\sigma_w^2}{\nu\Gamma}\sum_{k=1}^{\widehat r}\mu_k^2$，信道失真项为

$$\sigma_{h,\rm MMSE}^2=1-\frac{1}{\Gamma}\sum_{j=1}^r\sum_{k=1}^{\widehat r}\lambda_j(2\mu_k-\mu_k^2)|\langle\widehat{\mathbf u}_k,\mathbf u_j\rangle|^2.\tag{37}$$

当 $\sigma_w^2\to0$ 且对应特征模态非零时，$\mu_k\to1$，MMSE 渐近变为 LR。若低估秩 $\widehat r<r$，LR 丢弃真实模态而增加信道残差；若高估秩 $\widehat r>r$，LR 包含更多纯噪声模态，而 MMSE 的收缩权重可一定程度减轻秩高估的不利影响。

在正确选择秩 $\widehat r=r$ 时，**只考虑标定增益扰动**（$\widehat{\boldsymbol\xi}=\boldsymbol\xi$）：真实与 DT 的 $\operatorname{span}\mathbf T(\boldsymbol\xi)$ 相同，因此 LR 投影不变，$\sigma_{h,\rm LR}^2=0$，仅保留噪声项 $\sigma_w^2r/(\nu\Gamma)$；MMSE 虽保持相同子空间，仍会因特征值谱变化而改变 $\mu_k$。**只考虑定位误差**（$\widehat{\boldsymbol\Omega}=\boldsymbol\Omega$）：$\mathbf T(\widehat{\boldsymbol\xi})$ 的列空间一般不同于真实 $\mathbf T(\boldsymbol\xi)$，LR 出现正的投影残差，MMSE 的向量与特征值也发生失配。这解释了定位误差比单纯电磁增益扰动更容易成为主要性能瓶颈。

## V. 数值结果

### A. 仿真框架

考察三个室外场景：意大利米兰约 $550\times670\ \mathrm{m}^2$ 的城区三维模型，基站位于高 21.7 m 的屋顶；以及从爱沙尼亚地理信息公开数据构造的两个塔林地区 $300\times300\ \mathrm{m}^2$ 场景，郊区、乡村基站高度分别为 20.5 m、21 m。场景具有不同的建筑密度与多径丰富程度。利用 NVIDIA Sionna RT **v0.18.0**，在物体上根据 ITU 建议分配电磁材料参数，进行射线追踪。原论文表 II 的主要参数为：载频 28 GHz，网格 UE 高度 1.5 m、分辨率 $2\times2\ \mathrm{m}^2$，车辆上 UE 天线高度 0.2 m，SUMO 采样周期 0.1 s，RT 采用 Fibonacci 射线发射（SBR），初始射线数 $10^6$，考虑反射。

为各场景分别生成网格仿真和车辆仿真：前者仅用于构建指纹数据库，在规则位置网格上取样；后者用于性能评价，将 UE 放在 SUMO 生成的真实车辆网格上，形成作为真值的信道实现。两者均记录各路径 AoA、AoD、时延和增益。

MIMO-OFDM 的 UE 阵列为 ULA、BS 阵列为 UPA，阵元间隔 $\lambda/2$；升余弦根脉冲成形滚降因子为 0.2；采用 5G NR numerology $\mu=4$（子载波间隔 240 kHz），每时隙 14 个 OFDM 符号，时隙长度 62.5 微秒，每时隙发送一个导频 OFDM 符号。取 $M=100$，$T_{\rm ST}=6.25$ ms，$N_t=2$，$N_p=N_{\rm sc}/2$。

比较方法为 ML；从 100 个 ML 信道估计学习协方差的传统数据驱动 LR 和 MMSE；根据 UE 估计位置查找最近网格特征结构的指纹 LR/MMSE；以及拥有真实特征结构的理想 LR/MMSE。为隔离特征结构失配的作用，对所有相关基线将秩设为真实子空间维度；除 ML 和理想方法外，用 $M_w=1$ 个训练符号估计噪声功率。

仿真中的路径增益扰动写为 $\Delta\Omega_p=\Omega_p\beta_p$，其中 $\beta_p\sim\mathcal N(0,\sigma_g^2)$；UE 位置扰动写为 $\Delta\mathbf p\sim\mathcal N(0,\sigma_p^2\mathbf I_3)$。$\sigma_g$ 是归一化相对增益扰动标准差，$\sigma_p$ 以米为单位。

### B. 子空间与特征结构相似性

定义真实协方差与 DT 协方差的归一化相关相似指标（原文式 38）：

$$\eta=\mathbb E\left[\frac{\operatorname{Tr}(\mathbf R(\boldsymbol\xi,\boldsymbol\Omega)^H\mathbf R(\widehat{\boldsymbol\xi},\widehat{\boldsymbol\Omega}))}{\operatorname{Tr}(\mathbf R(\boldsymbol\xi,\boldsymbol\Omega)^H)\operatorname{Tr}(\mathbf R(\widehat{\boldsymbol\xi},\widehat{\boldsymbol\Omega}))}\right].\tag{38}$$

此处相似性同时刻画子空间偏移和特征值谱失配，不能直接等同于纯子空间距离。

**表 III（城区协方差相似指标）。** 对系统配置 $(N_r,N_{\rm sc})=(4,32),(8,64),(16,128)$：定位误差 $\sigma_p=0.1$ m 时，$\eta$ 均约为 1.000；$\sigma_p=1$ m 时依次为 1.000、0.995、0.991；$\sigma_p=10$ m 时依次为 0.976、0.934、0.882。仅施加增益扰动 $\sigma_g=0.1$ 时依次为 0.995、0.995、0.995；$\sigma_g=0.25$ 时为 0.970、0.965、0.960；$\sigma_g=0.5$ 时为 0.918、0.917、0.905。高维高分辨率系统对定位误差更敏感；增益扰动主要改变功率谱，指标仍保持相对较高。

### C. 扰动条件下的 NMSE

**图 3（投影误差底限随定位误差变化）。** 当 SNR 趋于无穷大，噪声项消失，残余信道投影误差决定 NMSE 下界。$\sigma_p$ 较小（约低于 0.2 m）时，投影底限低于约 $-30$ dB；在 $\sigma_p\approx1$ m 时，系统分辨率越高，失配越明显。对 $N_r=16,N_{\rm sc}=128$ 的配置，在 20 dB SNR 的 ML 参照下可容忍的定位标准差约为 0.4—0.6 m；对 $N_r=8,N_{\rm sc}=64$ 则约 1 m。

**图 4（LR 的 NMSE）。** 在城区 $N_r=16,N_{\rm sc}=128$ 配置下，不同 SNR 的 $\sigma_g=0$ 与 $\sigma_g=0.5$ 曲线几乎重合，说明在传播模态集合不变时，单纯增益标定误差对 LR 投影基本没有影响，而定位误差可改变误差底限。

**图 5（MMSE 的 NMSE）。** 在城区、郊区和乡村，MMSE 对增益扰动呈现中等敏感性，因为收缩权重依赖协方差特征值；但这种恶化仍小于定位引起的子空间失配。在 $\sigma_p=1$ m 条件下，论文报告电磁增益扰动引发的额外 NMSE 劣化在所考察 SNR 下少于 2 dB。高 SNR 时性能逐渐受子空间误差底限主导；低 SNR 时噪声贡献较大，定位误差对 NMSE 的影响相对弱。

### D. 与基线的性能比较

**图 6（NMSE–SNR 曲线）。** 取 $\sigma_p=1$ m、$\sigma_g=0.5$，在城区、郊区和乡村分别比较 DT-LR、DT-MMSE、数据驱动估计、指纹估计、ML 及理想估计。DT 估计在中低 SNR 区间获得较准确的先验子空间，因而优于 ML 和许多基线；在高 SNR 时，位置失配带来的投影误差使性能饱和。DT-MMSE 在低 SNR 下接近理想 MMSE，但高 SNR 也受真实和 DT 协方差差异约束。乡村多径较稀疏、空间变化较平滑，最近网格指纹基线与 DT 的差距缩小；网格离散化仍可能导致非物理的路径出现/消失，从而影响子空间。

总体上，DT 提供了跨不同环境均具有物理一致性的信道估计先验，低 SNR 获益显著，增益扰动下仍较鲁棒，但受 UE 定位精度限制。

## VI. 结论

研究了由 RT 提取场景传播特征、重建信道协方差特征结构，再用于宽带 MIMO 低秩和 MMSE 信道估计时，数字孪生误差如何影响性能。通过一阶扰动模型证明：定位误差造成角度与时延的几何失配，从而改变信道子空间；材料电磁参数的标定误差主要改变特征值谱。LR 仅依赖子空间，因而对保持子空间的增益扰动具有固有鲁棒性；MMSE 同时依赖子空间与特征值，因而对两类误差都敏感。不同建筑密度与多径稀疏度的三类场景中，定位误差均为主要性能限制因素。后续研究方向包括大失配、三维场景重建误差、针对子空间畸变的自适应处理以及基于实测的验证。

## 附录 A—B：公式校对提示

**附录 A（几何角度灵敏度）。** 原文使用镜像坐标、距离范数及 `atan2`、`arcsin` 的一阶泰勒微分，依次得到式（18）—（26）的时延、方位与俯仰角梯度。上述正文已保留对应分布公式；附录 A 的辅助代数细节仍待逐式译录。

**附录 B（反射系数与路径增益灵敏度）。** 原文针对 TE/TM Fresnel 系数计算复介电常数偏导 $c_{p,k}$，再按 $\Omega_p^{(0)}\prod_k|\Gamma_{p,k}|^2$ 展开反射损耗乘积，得到式（30）—（32）的 $\alpha_{p,k}=2c_{p,k}/\Gamma_{p,k}$ 及增益方差。相关偏导的显式分式仍待逐项检查。

## 参考文献

全部英文参考书目见[原始 PDF](https://arxiv.org/pdf/2607.09334v1)末尾。由于书目及附录尚未逐条终校，此页仍标为“待终校”，不计入已验收的全文译文。