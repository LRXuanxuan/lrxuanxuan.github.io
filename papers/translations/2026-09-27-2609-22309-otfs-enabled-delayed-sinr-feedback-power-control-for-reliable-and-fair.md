---
layout: page
title: "OTFS 时延 SINR 反馈功率控制｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-22309-otfs-enabled-delayed-sinr-feedback-power-control-for-reliable-and-fair/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c430c3db39ff0393/) · [原文 arXiv](https://arxiv.org/abs/2609.22309) · [全部目录](/papers/catalog/)

# OTFS 时延 SINR 反馈功率控制

**原题：** OTFS-Enabled Delayed SINR-Feedback Power Control for Reliable and Fair High-Mobility UAV Communications  
**作者：** Thuan Van Le、Nguyen Cong Luong、Trong-Dai Hoang、Vo Nguyen Quoc Bao（Senior Member, IEEE）、Thien Huynh-The（Senior Member, IEEE）、Xingwang Li（Senior Member, IEEE）、Ngo Hoang Tu（Member, IEEE）  
**单位：** T. V. Le 为越南河内 Phenikaa 大学 Phenikaa 工程学院电气与电子工程系；N. C. Luong 为 Phenikaa 大学 Phenikaa 计算学院（河内，越南）；T.-D. Hoang 为澳大利亚悉尼科技大学全球大数据技术中心；V. N. Q. Bao 与 N. H. Tu 为越南胡志明市文朗大学文朗技术学院信息技术系（通讯作者：Ngo Hoang Tu）；T. Huynh-The 为越南胡志明市理工大学电子与信息工程系；X. Li 为中国河南理工大学物理与电子信息工程学院（焦作）。  
**版本：** arXiv:2609.22309v1（eess.SP），2026-09-15，原文 6 页（含表 I 与图 1—5）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—V 节、算法 1、命题 1 及证明、表 I（逐格）、图 1—5 图注、参考文献 [1]—[18] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "2026-09-27"；本地 PDF 为 **arXiv:2609.22309v1 [eess.SP]，2026-09-15**，"2026-09-27" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

本文针对高移动性下工作的正交时频空间（OTFS）无人机（UAV）通信，提出一个由**时延信干噪比（SINR）反馈**驱动的功率控制框架，以可靠性与公平性为主要设计目标。配备均匀线阵的基站在一帧公共 OTFS 帧上服务多架 UAV，路径时延、多普勒频移与 UAV 间干扰由三维传播几何与基站阵列响应决定，而非由假定的耦合模型决定。所提控制器代替瞬时信道状态信息，**仅从时延 SINR 测量**刷新发射功率向量，契合快速衰落空中链路的实际限制。一个"预测—平滑—投影"规则混合可靠性份额、公平性份额与谱效份额，每项分别归一化，使效用权重直接控制该闭环。仿真表明：在相同参数配置下，70 m/s 时 OTFS 每帧有效 SINR 的变化比正交频分复用（OFDM）少 37.8%；所得控制器在 40 m/s 时相比等功率分配把平均最小 SINR 提升 1.21 dB，同时把 Jain 公平性指数从 0.833 提升到 0.970，代价是 24.6% 的和速率损失，而该损失可由效用权重控制在设计者手中。在相同控制器内，OTFS 相对 OFDM 的优势从 10 m/s 的 0.18 dB 扩大到 90 m/s 的 0.81 dB，表明波形对"过期 SINR 反馈"有效性的贡献随移动性增强。

**索引词**：UAV 通信；SINR 反馈；功率控制；正交时频空间（OTFS）；可靠性；公平性；高移动性。

## I. 引言

得益于部署灵活、以视距（LoS）传播为主以及覆盖监视、应急响应、数据采集与临时覆盖增强等广泛任务，无人机（UAV）通信预计将在下一代无线网络中占据核心地位 [1]。然而这种敏捷性的代价是快速时变信道：显著的多普勒效应与非可忽略的反馈时延，使部署中难以获得及时准确的瞬时信道状态信息（CSI）[2]。因此，依赖 CSI 的自适应往往基于过期测量工作，一旦控制或资源分配回路要求频繁刷新，可靠性便会下降。

正交时频空间（OTFS）调制已成为高移动性通信的有前景波形：它在时延—多普勒（DD）域工作，该域中的信道表示比传统 OFDM 系统更结构化、往往也更稳定 [3], [4]。近期工作已在波形设计、检测与收发机开发方面奠定坚实基础，展示了多输入多输出 OTFS 在高多普勒环境中的潜力 [4], [5]，并开始处理面向 UAV 的移动性感知链路管理 [6], [7]。然而，针对高移动性下可靠且公平的 UAV 通信、以弱用户保护与均衡性能（而非激进吞吐最大化）为焦点的**时延反馈功率控制**仍存在明显空白。

在此背景下，时延 SINR 反馈控制颇具吸引力，因为标量 SINR 的测量与上报远比完整瞬时 CSI 便宜 [8]。SINR 反馈功率控制的经典收敛保证——从 [9] 的分布式自治递推到 [10] 的标准干扰函数框架——原则上可应用于 OTFS UAV 系统。但其传统收敛保证依赖足够平稳的干扰映射与可行的目标；在高移动性空中链路中，二者都可能在反馈时域内变化，故过期反馈递推可能跟踪过时的工作点。基于优化的分配（如 [11] 的加权最小均方误差 WMMSE 方法）去除了固定目标假设，但需要完整的 $K\times K$ 链路增益矩阵（$K$ 为同时服务的 UAV 数）。本文所处理的限制是**所报链路质量的有效时域**，而不只是其反馈开销。时延 SINR 继承有效链路响应的时间变化：在 OFDM 下它反映快速变化的时频响应，而在 OTFS 下它由物理时延与多普勒随传播几何演化的 DD 分量构成。

基于上述考虑，本文研究高移动性下可靠且公平的 OTFS UAV 通信的时延 SINR 反馈功率控制。贡献有三：第一，建立多 UAV OTFS 下行模型，其 DD 信道、逐路径多普勒与 UAV 间耦合由三维空地几何与基站（BS）阵列响应导出，使 OTFS 与 OFDM 两条支路共享同一路径集。第二，设计仅消费时延 SINR 的控制器，在实际预测时域上对其进行校正，并通过效用权重合并可靠性份额、公平性份额与谱效份额，同时给出投影递推的可行性与有界变化保证。第三，分别量化波形贡献与控制器贡献，并报告可靠性与公平性增益及其和速率代价。

## II. 系统模型

我们考虑一个下行 UAV 通信系统：一个 BS 在 OTFS 空中接口上服务 $K$ 个 UAV 终端，$\mathcal K=\{1,2,\ldots,K\}$ 表示 UAV 集合。BS 配备水平均匀线阵（ULA），$N_t$ 个阵元、半波长间距；各 UAV 通过逐 UAV 发射波束成形在同一 OTFS 帧上被同时服务，因此 UAV 间干扰来自阵列的波束泄漏，而非抽象耦合。

### A. OTFS 帧与基于几何的时延—多普勒信道

一个 OTFS 帧携带 $M$ 个时延格与 $N$ 个多普勒格，子载波间隔 $\Delta f$、符号时长 $T=1/\Delta f$、带宽 $B=M\Delta f$、帧时长 $T_f=NT$。一帧即一个功率控制时隙，故接收机的时延与多普勒分辨率分别为 $1/B$ 与 $1/T_f$ [3], [12]。第 $t$ 个时隙 UAV $k$ 的 DD 信道写为

$$
h_k(\tau,\nu;t)=\sum_{p=0}^{P-1}h_{k,p}(t)\delta\left(\tau-\tau_{k,p}(t)\right)\delta\left(\nu-\nu_{k,p}(t)\right),\tag{1}
$$

其中 $p=0$ 索引 LoS 路径，$p\ge1$ 索引经静态地面散射体反射的路径。设 $\mathbf q_k(t)\in\mathbb R^3$ 与 $\mathbf v_k(t)\in\mathbb R^3$ 表示 UAV $k$ 的位置与速度，$\mathbf u_{k,p}(t)$ 为路径 $p$ 到达 UAV 的单位方向向量。路径时延为传播长度除以 $c$，多普勒频移取速度在到达方向上的投影，即

$$
\nu_{k,p}(t)=\frac{f_c}{c}\mathbf v_k^T(t)\mathbf u_{k,p}(t),\tag{2}
$$

其中 $f_c$ 为载频。因此每条路径的多普勒由速度与相对该路径的飞行方向共同决定，不含任何假定的速度相关因子。LoS 功率份额遵循随 UAV 仰角 $\phi_k(t)$ 增大的 Rician 因子：$K_k(t)|_{\mathrm{dB}}=K_{\min}+(K_{\max}-K_{\min})2\phi_k(t)/\pi$，该式复现了空地链路报告过的仰角依赖性 [13]；路径幅度遵循距离相关路损 $G_0\left(d_{\mathrm{ref}}/d_{k,p}(t)\right)^{\nu_{\mathrm{PL}}}$。

### B. 波束成形与有效时延—多普勒增益

设 $\mathbf e_A$ 表示沿 BS ULA 轴的单位向量，$\mathbf s_{k,p}^{\mathrm{BS}}(t)$ 表示路径 $p$ 离开 BS 的单位离开方向。相应归一化空间频率为 $\zeta_{k,p}(t)\triangleq\mathbf e_A^T\mathbf s_{k,p}^{\mathrm{BS}}(t)$。对半波长天线间距，BS 阵列响应为 $\mathbf a(\zeta)=[1,e^{-j\pi\zeta},\ldots,e^{-j\pi(N_t-1)\zeta}]^T$。BS 为每个 UAV 赋一个单位范数波束 $\mathbf w_j(t)=\mathbf a^*(\zeta_{j,0}(t-d))/\sqrt{N_t}$，与 $d$ 个时隙前观测到的 LoS 空间频率匹配——该时延与影响 SINR 反馈的时延相同。UAV $k$ 的路径 $p$ 经波束 $j$ 到达接收机的系数表示为

$$
c_{k,p}^{(j)}(t)=h_{k,p}(t)\mathbf a^T\left(\zeta_{k,p}(t)\right)\mathbf w_j(t).\tag{3}
$$

因此 UAV $k$ 从波束 $j$ 收到的干扰，由 UAV $k$ 自身的信道经指向别处的波束观测而产生。用于波束指向的时延 LoS 方向假定可由常规导航与波束跟踪获得，且不是所提功率控制器的输入——其更新仅使用时延 SINR 反馈。

在标准 DD 域表示下，时隙 $t$ UAV $k$ 的接收 OTFS 网格写为

$$
Y_k[l,q;t]=\sum_{j\in\mathcal K}\sqrt{P_j(t)}\sum_{l',q'}H_k^{(j)}[l',q';t]X_j\left([l-l']_M,[q-q']_N;t\right)+Z_k[l,q;t],\tag{4}
$$

其中 $X_j[l,q;t]$ 表示发往 UAV $j$ 的单位功率 DD 域符号网格，即 $\mathbb E[|X_j[l,q;t]|^2]=1$；$Z_k[l,q;t]$ 为噪声；$H_k^{(j)}[l',q';t]$ 由（1）中的路径经（3）的波束系数导出。分数时延或多普勒偏移会按相应 Dirichlet 核把一条路径扩散到相邻 DD 格 [14]。对功率控制器所用的有效 SINR 抽象，接收机以最大比合并（MRC）叠加（4）中所分辨 DD 系数的保留能量，故共享同一格的路径相干叠加、不同格则功率相加。把落入时延格 $l$ 与多普勒格 $q$ 的路径收集为 $\mathcal B_{l,q}$，得

$$
g_{k,j}^{O}(t)=\sum_{(l,q)}\left|\sum_{p\in\mathcal B_{l,q}}\sqrt{\epsilon_{k,p}(t)}c_{k,p}^{(j)}(t)\right|^2,\tag{5}
$$

其中 $\epsilon_{k,p}$ 为探测器在其处理的时延与多普勒抽头内保留的路径能量比例。对分数偏移 $\kappa$，保留比例遵循变换长度的 Dirichlet 核，剩余份额 $1-\epsilon_{k,p}$ 泄漏到未处理抽头上并充当自干扰：

$$
\varepsilon_k^{O}(t)\approx\sum_{p=0}^{P-1}\left[1-\epsilon_{k,p}(t)\right]\left|c_{k,p}^{(k)}(t)\right|^2
$$

[14]。

在相同参数配置下，OFDM 支路发送 $N$ 个符号、$M$ 个子载波。多普勒频移 $\nu$ 破坏子载波正交性，路径能量中留在目标子载波上的比例为 $\eta_{k,p}=\operatorname{sinc}^2(\nu_{k,p}T)$，其余表现为载波间干扰 [15]。资源元素 $(m,n)$ 的信道频率响应为

$$
H_k^{(j)}[m,n]=\sum_{p}\sqrt{\eta_{k,p}}c_{k,p}^{(j)}e^{-j2\pi m\Delta f\tilde\tau_{k,p}}e^{j2\pi\nu_{k,p}nT},\tag{6}
$$

其中 $\tilde\tau_{k,p}$ 为过剩时延。每个资源元素都有各自的实现，故 UAV 可为该帧上报的标量是**容量有效 SINR**，即使速率等于逐资源元素平均速率的那个值。

### C. 信道获取下限

为在相同的 $MN$ 网格导频预算 $\rho_p$ 下比较两种接口，我们采用有效系数计数抽象。跨最大过剩时延 $\tau_k^{\max}$ 与最大多普勒 $\nu_k^{\max}$ 的时频响应，按每帧计数 $D_k^{F}=\lceil2\tau_k^{\max}B+1\rceil\lceil2\nu_k^{\max}T_f+1\rceil$ 建模并每帧刷新；而稀疏 DD 表示使用在 $N_{\mathrm{re}}$ 帧上摊薄的负载 $D_k^{O}=|\mathcal B_k|/N_{\mathrm{re}}$ [16]。在仿真所用的归一等导频能量约定下，残余估计噪声下限建模为

$$
\sigma_{e,k}^2=\sigma^2D_k/(\rho_pMN).\tag{7}
$$

这里 $\mathcal B_k$ 表示 UAV $k$ 的显著 DD 抽头集合，$D_k=D_k^{F}$（OFDM）或 $D_k=D_k^{O}$（OTFS）。两种接口采用相同约定，只有有效系数计数不同，故 OFDM 的下限通过 $D_k^{F}$ 随多普勒而升高。

### D. SINR、速率与时延反馈

设 $P_k(t)$ 表示分配给 UAV $k$ 的发射功率，$g_{k,j}(t)$ 与 $\varepsilon_k(t)$ 分别表示所考虑空中接口的有效波束增益与残余自干扰，OTFS 时 $g_{k,j}(t)=g_{k,j}^{O}(t)$。噪声功率记为 $\sigma^2$。UAV $k$ 的接收 SINR 为

$$
\gamma_k(t)=\frac{P_k(t)g_{k,k}(t)}{\sum_{j\in\mathcal K\setminus\{k\}}P_j(t)g_{k,j}(t)+P_k(t)\varepsilon_k(t)+\sigma_{e,k}^2(t)+\sigma^2},\tag{8}
$$

可达速率为 $R_k(t)=\log_2(1+\gamma_k(t))$。发射功率服从总预算 $P_{\max}$ 与逐 UAV 下限 $P_{\min}$，即 $\sum_{k\in\mathcal K}P_k(t)\le P_{\max}$、$P_k(t)\ge P_{\min}$（$\forall k$）；所达速率分布的公平性以 Jain 指数评估 [17]：

$$
J(t)=\frac{\left(\sum_{k\in\mathcal K}R_k(t)\right)^2}{K\sum_{k\in\mathcal K}R_k^2(t)}.\tag{9}
$$

我们不假定 BS 拥有完整瞬时 CSI，而考虑**时延 SINR 反馈**模型：BS 从 UAV $k$ 收到观测 $\gamma_k^{\mathrm{fb}}(t)=\gamma_k(t-d)$，其中 $d\ge0$ 为以时隙计的反馈时延。

设计目标是在保留谱效激励的同时兼顾可靠性与公平性。由于三个量具有不同单位与量纲，需先分别归一化再组合，得到效用

$$
U(t)=\omega_1\frac{\min(\gamma_{\min}(t),\gamma_{\mathrm{th}})}{\gamma_{\mathrm{th}}}+\omega_2J(t)+\omega_3\frac{\sum_{k\in\mathcal K}R_k(t)}{K\log_2(1+\gamma_{\mathrm{ub}})},\tag{10}
$$

其中 $\gamma_{\min}(t)=\min_{k\in\mathcal K}\gamma_k(t)$，$\gamma_{\mathrm{th}}$ 为可靠性阈值，$\gamma_{\mathrm{ub}}$ 为链路预算的 SINR 上限，$\omega_1,\omega_2,\omega_3\ge0$ 且 $\omega_1+\omega_2+\omega_3=1$。此时（10）中每一项都落在 $[0,1]$，故权重表达的是真实偏好而非偶然的量纲。直接最大化（10）很困难，因为 UAV 通过干扰耦合，且 BS 只能观测时延 SINR 反馈。因此本文采用反馈控制视角，把功率更新问题表述为设计低复杂度映射

$$
\mathbf P(t+1)=\mathcal F\left(\mathbf P(t),\boldsymbol\gamma^{\mathrm{fb}}(t)\right),\tag{11}
$$

其中 $\mathbf P(t)=[P_1(t),\ldots,P_K(t)]^T$、$\boldsymbol\gamma^{\mathrm{fb}}(t)=[\gamma_1^{\mathrm{fb}}(t),\ldots,\gamma_K^{\mathrm{fb}}(t)]^T$。

## III. 所提时延 SINR 反馈功率控制

### A. 预测、平滑与加权优先级

反馈携带的是 $d$ 个时隙前测得的 SINR，故校正必须跨越同样长的时域。把反馈的单时隙斜率写为 $\gamma_k^{\mathrm{fb}}(t)-\gamma_k^{\mathrm{fb}}(t-1)$，预测 SINR 表示为

$$
\hat\gamma_k(t)=\left[\gamma_k^{\mathrm{fb}}(t)+\min(\lambda d,\Lambda_{\max})\left(\gamma_k^{\mathrm{fb}}(t)-\gamma_k^{\mathrm{fb}}(t-1)\right)\right]_{\gamma_{\mathrm{lb}}}^{\gamma_{\mathrm{ub}}},\tag{12}
$$

其中 $\lambda\ge0$ 为时延补偿因子，$[\cdot]_{\gamma_{\mathrm{lb}}}^{\gamma_{\mathrm{ub}}}$ 表示裁剪到规定 SINR 区间。外推增益随 $d$ 增大（需跨越的时域更长），并在 $\Lambda_{\max}$ 处饱和（线性外推只在有效增益的相干时间内可信）。随后用平滑估计抑制短期波动：

$$
\bar\gamma_k(t)=\alpha\bar\gamma_k(t-1)+(1-\alpha)\hat\gamma_k(t),\tag{13}
$$

其中 $\alpha\in[0,1)$ 为平滑系数。

为通过低复杂度的逐 UAV 更新实现（10）中的三个偏好，我们把它们与非负优先级代理相对应：可靠性代理为归一化 SINR 短缺，公平性代理为相对群体平均的归一化速率亏欠，谱效代理为 SINR 与功率之比构成的链路质量指标：

$$
s_k(t)=\frac{[\gamma_{\mathrm{th}}-\bar\gamma_k(t)]_+}{\gamma_{\mathrm{th}}},\qquad f_k(t)=\frac{[\bar R(t)-\bar R_k(t)]_+}{\bar R(t)},\qquad e_k(t)=\frac{\gamma_k^{\mathrm{fb}}(t)}{P_k(t-d)},\tag{14}
$$

其中 $\bar R_k(t)=\log_2(1+\bar\gamma_k(t))$，$\bar R(t)$ 为其在群体上的平均。由于 BS 知道自己 $d$ 个时隙前发射的功率 $P_k(t-d)$，$e_k(t)$ 由时延 SINR 与 BS 的功率历史构成，因而**不需要额外信道质量反馈**。

每个分量被转换为和为 $K$ 的份额，使值为 1 表示无偏好、非活跃分量返回中性向量；各份额再按效用权重混合：

$$
\tilde q_k(t)=\sum_{i=1}^{3}\omega_i\left(\frac{Kx_k^{(i)}(t)}{\sum_{n\in\mathcal K}x_n^{(i)}(t)}-1\right),\tag{15}
$$

其中 $x_k^{(1)}=s_k$、$x_k^{(2)}=f_k$、$x_k^{(3)}=e_k$，当 $\sum_n x_n^{(i)}=0$ 时第 $i$ 个括号取零。按构造 $\sum_k\tilde q_k(t)=0$，故更新重新分配功率而非整体缩放功率向量，而（10）中的权重直接进入该闭环。

### B. 投影乘性更新

功率更新在对数功率域进行：

$$
u_k(t)=\left[\mu_t\tilde q_k(t)+\beta\left(\tilde q_k(t)-\tilde q_k(t-1)\right)\right]_{-\Delta_{\max}}^{\Delta_{\max}},\tag{16}
$$

其中 $\mu_t=\mu/(1+\eta d)$ 为时延感知步长，$\mu>0$ 为标称步长，$\beta\ge0$ 为动量系数，$\eta\ge0$ 控制时延敏感度，$\Delta_{\max}>0$ 为最大对数功率增量。试探分配 $\tilde P_k(t+1)=P_k(t)\exp(u_k(t))$ 可能违反功率预算，故把向量 $\tilde{\mathbf P}(t+1)$ 投影到可行集：

$$
\mathcal P=\left\{\mathbf P\in\mathbb R_+^K:\ \sum_{k\in\mathcal K}P_k\le P_{\max},\ P_k\ge P_{\min},\ \forall k\right\}.\tag{17}
$$

从而得到最终更新 $\mathbf P(t+1)=\Pi_{\mathcal P}(\tilde{\mathbf P}(t+1))$，其中 $\Pi_{\mathcal P}(\cdot)$ 为欧氏投影 [18]，如算法 1 所示。

**算法 1**　所提时延 SINR 反馈功率控制

**输入**：$P_{\max}$、$P_{\min}$、$\gamma_{\mathrm{th}}$、$d$、$\Delta_{\max}$、$\mu$、$\beta$、$\eta$、$\lambda$、$\Lambda_{\max}$、$\alpha$、$\gamma_{\mathrm{lb}}$、$\gamma_{\mathrm{ub}}$、$\{\omega_i\}$。
1: 初始化 $P_k(1)=P_{\max}/K$、$\bar\gamma_k(0)=\gamma_{\mathrm{th}}$、$\tilde q_k(0)=0$，$\forall k$；
2: **for** $t=1,2,\ldots,T-1$ **do**
3: 　接收各 UAV 的时延 SINR 反馈 $\gamma_k^{\mathrm{fb}}(t)$（$\forall k$）；
4: 　按（12）预测 $\hat\gamma_k(t)$，按（13）平滑为 $\bar\gamma_k(t)$（$\forall k$）；
5: 　按（14）构造可靠性、公平性与谱效分量（$\forall k$）；
6: 　按（15）混合为中心化优先级 $\tilde q_k(t)$（$\forall k$）；
7: 　按（16）计算 $u_k(t)$ 与 $\tilde P_k(t+1)=P_k(t)e^{u_k(t)}$（$\forall k$）；
8: 　按（17）投影：$\mathbf P(t+1)=\Pi_{\mathcal P}(\tilde{\mathbf P}(t+1))$；
9: **end for**

**命题 1**：设 $\mathbf P(1)\in\mathcal P$，且 $\mathbf P(t+1)=\Pi_{\mathcal P}(\mathbf P(t)\odot e^{\mathbf u(t)})$、$\|\mathbf u(t)\|_\infty\le\Delta_{\max}$。则对每个 $t\ge1$：(i) $\mathbf P(t)\in\mathcal P$；(ii) 归一化功率更新残差 $\rho_P(t)\triangleq\|\mathbf P(t+1)-\mathbf P(t)\|_1/P_{\max}\le\sqrt{K}(e^{\Delta_{\max}}-1)$ 关于反馈时延与信道实现**一致成立**；(iii) 在冻结反馈状态下，任何满足 $\tilde{\mathbf q}(t)=\tilde{\mathbf q}(t-1)=\mathbf 0$ 的可行分配都是该单步递推的不动点。

**证明**：(i) 由 $\Pi_{\mathcal P}$ 映入 $\mathcal P$ 即得。(ii) 由（16）中裁剪有 $|\tilde P_k(t+1)-P_k(t)|=P_k(t)|e^{u_k(t)}-1|\le P_k(t)(e^{\Delta_{\max}}-1)$。由于 $\mathcal P$ 闭且凸，$\Pi_{\mathcal P}$ 非扩张，且由 (i) $\Pi_{\mathcal P}(\mathbf P(t))=\mathbf P(t)$，故 $\|\mathbf P(t+1)-\mathbf P(t)\|_2\le\|\tilde{\mathbf P}(t+1)-\mathbf P(t)\|_2\le(e^{\Delta_{\max}}-1)\|\mathbf P(t)\|_2$。结合 $\|\mathbf x\|_1\le\sqrt{K}\|\mathbf x\|_2$ 与 $\|\mathbf P(t)\|_2\le\|\mathbf P(t)\|_1\le P_{\max}$ 即得上界。(iii) $\tilde{\mathbf q}(t)=\tilde{\mathbf q}(t-1)=\mathbf 0$ 使 $\mathbf u(t)=\mathbf 0$，故 $\tilde{\mathbf P}(t+1)=\mathbf P(t)\in\mathcal P$，投影不起作用。证毕。

因此命题 1 保证可行性以及逐时隙功率变化的一致上界，而零优先级分配在冻结反馈状态下是静止点。对时变 UAV 信道不宣称渐近收敛，其相应的有界跟踪行为在第 IV 节评估。

在首个时延 SINR 报告可用之前采用等功率。首次控制器更新时，把上一反馈样本用当前报告初始化，即 $\gamma_k^{\mathrm{fb}}(t-1)=\gamma_k^{\mathrm{fb}}(t)$，从而初始预测斜率为零；且（14）中的 $P_k(t-d)$ 定义良好，因为该更新只会在相应发射功率进入 BS 功率历史之后发生。

**表 I　$K=6$、$I_w=8$ 时每时隙的信息与计算代价**（按原表逐格转录）

| 方案 | 输入 | 复杂度 | 时间（µs） |
| --- | --- | --- | --- |
| 所提方案 | $K$ 个时延 SINR | $O(K\log K)$ | 11.1 |
| 等功率 | 无 | $O(1)$ | 2.5 |
| 瞬时 GB | $K$ 个瞬时增益 | $O(K\log K)$ | 3.8 |
| 时延 SB [9], [10] | $K$ 个时延 SINR | $O(K\log K)$ | 6.6 |
| WMMSE [11] | $K^2$ 个时延增益 | $O(I_wK^2)$† | 54.5 |

> † $I_w$ 表示 WMMSE 的迭代次数。

### C. 计算复杂度

预测、平滑、分量构造与对数域更新各需 $O(K)$ 次运算，投影由一次排序主导，故每时隙代价为 $O(K\log K)$、内存 $O(K)$。表 I 把它与各基准并列，并给出各自消耗的信息与在 Intel Core i9 平台 MATLAB R2024a 上测得、对所有时隙取平均的每次更新运行时间。

## IV. 数值结果与讨论

配备 $N_t=32$ 阵元的 BS 服务 $K=6$ 架 UAV，UAV 在 120 m 高度、$180^\circ$ 方位扇形内以 100—600 m 水平距离飞行。两种接口均用 $f_c=5.8$ GHz、$\Delta f=15$ kHz、$M=128$ 与 $N=64$，得 $B=1.92$ MHz、$T_f=4.27$ ms、时延分辨率 521 ns、多普勒分辨率 234 Hz；两者均把网格的 $\rho_p=5\%$ 用于导频且 $N_{\mathrm{re}}=10$。信道取 $\nu_{\mathrm{PL}}=2.2$，Rician 因子从掠射仰角的 3 dB 增至天顶的 12 dB [13]；每架 UAV 有 5 个静态地面散射体，置于其地面投影 50—400 m 处。除另有说明，每架 UAV 保持 40 m/s 的标称速度，逐时隙航向增量标准差 $2^\circ$、一阶速度变化标准差 3%，并在环带边界反射。功率以 $P_{\max}=1$ 归一化、$P_{\min}=0.02$，发射 SNR 为 $P_{\max}/\sigma^2=10$ dB，$d=2$ 时隙。控制器参数为 $\gamma_{\mathrm{th}}=6$ dB、$\lambda=0.35$（$\Lambda_{\max}=1.2$）、$\alpha=0.6$、$\mu=0.05$、$\beta=0.1$、$\eta=0.25$、$\Delta_{\max}=0.18$，选自稳定工作区。效用权重设为 $(\omega_1,\omega_2,\omega_3)=(0.5,0.3,0.2)$，对应可靠性—吞吐折中的拐点。每个数据点对 60 种拓扑、每种 400 帧取平均，前 40% 作为瞬态丢弃，所有方案共享同一组抽样。曲线绘制试验均值，任意 SINR 曲线上 95% 置信半宽低于 1.41 dB、任意公平性曲线低于 0.069、任意速率曲线低于 0.93 bit/s/Hz；所提控制器在工作点处分别为 0.40 dB 与 0.011。

除所提控制器（运行于 OTFS 与 OFDM）外，还考虑四个基准：**等功率分配**把 $P_{\max}$ 均分；**瞬时增益（GB）分配**令 $P_k\propto g_{k,k}(t)$，因而需要瞬时 CSI，充当"神谕"参考；**时延 SINR 均衡（SB）**为阻尼 Foschini–Miljanic 递推 [9],[10]，把每架 UAV 驱向其反馈的几何均值附近；**时延 CSI WMMSE** 在时延 $K\times K$ 增益矩阵上以 $I_w=8$ 次内迭代最大化速率 [11]。图 1 在无控制器、等功率分配下评估两种接口，以分离波形贡献。

**图 1**：等功率分配、无控制器时的空口行为：(a) 归一化逐帧 SINR 增量随 UAV 速度的变化；(b) 70 m/s 时有效 SINR 自相关随反馈时滞的变化。
**图 2**：UAV 速度对 (a) 平均最小 SINR 与 (b) 和速率的影响。
**图 3**：70 m/s 时反馈时延对 (a) 平均最小 SINR 与 (b) Jain 公平性指数的影响。
**图 4**：(a) Jain 公平性指数随 UAV 速度的变化；(b) 第 5 百分位 SINR 随平均 SNR 的变化。
**图 5**：(a) 功率更新残差随时隙的变化（经九时隙滑动平均平滑）；(b) 可靠性权重 $\omega_1$ 的影响（取 $\omega_2=0.6(1-\omega_1)$、$\omega_3=0.4(1-\omega_1)$）对平均最小 SINR 与和速率的影响。

图 1(a) 中，OFDM 的归一化逐帧 SINR 增量在整个速度范围内接近 0.053，而 OTFS 增量从 20 m/s 的 0.049 降到 90 m/s 的 0.030。该差距在 40 m/s 以内仍处于试验均值的置信半宽内，之后愈发明显：70 m/s 时减少 37.8%、90 m/s 时减少 42.5%。一旦路径多普勒扩展与 DD 分辨率 $1/T_f=234$ Hz 相当或超过，分离便显著，因为更多多径结构可在 DD 网格上被分辨。时域中，图 1(b) 给出 70 m/s、时滞两个时隙时 OTFS 自相关为 0.873，而 OFDM 为 0.825，故过期报告在 OTFS 下更接近描述当前链路。残余自干扰也更小：为期望增益的 0.019%，而 OFDM 为 0.402%；但在 $\Delta f=15$ kHz 下二者都太小，不足以驱动该差异。

图 2 给出 UAV 速度对平均最小 SINR 与和速率的影响。如图 2(a)，所提 OTFS 控制器在整个范围内取得最高最小 SINR：40 m/s 时达到 0.31 dB，比等功率分配高 1.21 dB、比时延 SINR 均衡高 3.95 dB、比瞬时 GB 分配高 6.48 dB、比时延 CSI WMMSE 高 8.79 dB；后两者最低，因为二者把功率集中于本就链路最强的 UAV，而（14）中的短缺份额避免了这一倾向。同一控制器内 OTFS 相对 OFDM 的优势随移动性单调增大，从 10 m/s 的 0.18 dB 增至 90 m/s 的 0.81 dB，与图 1(a) 的分离一致。所有曲线都温和上移，因为更快的 UAV 在观测窗内穿越小区更大范围，但排序不变。图 2(b) 报告该保护的代价：40 m/s 时为 7.08 bit/s/Hz，而等功率分配为 9.38 bit/s/Hz，损失 24.6%；时延 CSI WMMSE 取得最高和速率 10.92 bit/s/Hz，这正是其目标所决定的。

图 3 评估 70 m/s（代表高移动性工况）下反馈时延的影响。图 3(a) 中，所提 OTFS 控制器平缓退化，从 $d=0$ 的 0.57 dB 降至 $d=8$ 的 $-0.04$ dB，并全程高于等功率分配。时延 SINR 均衡行为相反：在 $d\le1$ 时是最接近的竞争者，随后在 $d=2$ 时崩塌到 $-3.10$ dB、$d=8$ 时降到 $-8.93$ dB，因为其递推把时延 SINR 比值直接映射为功率更新，未采用（16）中的时延相关步长缩减与裁剪。图 3(b) 在公平性上确认同一机制：所提指数仅从 0.969 降至 0.937，而均衡基准从 0.986 降至 0.527。等功率分配按构造与时延无关，瞬时 GB 分配读取当前增益。时延 CSI WMMSE 本身即过期信息基准，却仅从 $-7.62$ dB 变到 $-7.69$ dB：它已是 $d=0$ 处的最低曲线，且图 1(b) 中有效 OTFS 链路的缓慢演化使其时延输入仍具代表性，故其弱点在于和速率目标而非输入过期。

图 4 给出 Jain 公平性指数随 UAV 速度的变化，以及第 5 百分位 SINR 随平均 SNR 的变化。图 4(a) 中，所提控制器把指数保持在 0.960—0.972 之间，而等功率分配为 0.833、时延 SINR 均衡为 0.771、瞬时 GB 分配为 0.610。如此高的水平源于（15）中面向可靠性与公平性的份额，它们把功率转向不利 UAV；在冻结反馈下，命题 1(iii) 指出当聚合中心化优先级消失时即达静态。Jain 指数也在速率上计算，而对数压缩了残余 SINR 散布。公平性随速度近乎平坦，故其排序由分配规则而非由移动性决定。图 4(b) 中尾部随 SNR 改善并在约 16 dB 后饱和——此时限制最弱 UAV 的是残余干扰而非噪声——所提控制器全程保持最高第 5 百分位 SINR：12 dB 时比等功率分配高 0.52 dB、比瞬时 GB 分配高 5.35 dB。

图 5 报告闭环行为与效用权重的影响。图 5(a) 中，初始瞬态后所提环路的九时隙平滑残差保持在 0.013—0.024 区间，比命题 1(ii) 的界 $\sqrt{K}(e^{\Delta_{\max}}-1)=0.483$ 低约二十倍；而时延 SINR 均衡因反复用过期测量重新缩放功率向量，残差保持在 0.26 附近。图 5(b) 给出最小 SINR 与和速率之间的权衡：把 $\omega_1$ 从 0 提高到 0.5 使平均最小 SINR 从 $-0.74$ dB 升到 0.31 dB，而和速率从 7.93 降到 7.08 bit/s/Hz；同一扫描中 Jain 指数（为可读性未绘出）从 0.756 升到 0.970。超过 $\omega_1=0.5$ 后各指标仅微变，确认所选工作点位于可靠性—吞吐折中的拐点附近。

## V. 结论

本文在基于几何、带时延波束方向的 DD 信道上，为可靠且公平的高移动性 OTFS UAV 链路建立了时延 SINR 反馈功率控制。预测器、加权优先级规则与投影乘性更新仅凭时延 SINR 自适应功率，命题 1 保证可行性以及逐时隙功率变化的一致有界性。在共同的物理路径集上，70 m/s 时 OTFS 的逐帧 SINR 变化比 OFDM 低 37.8%；所提控制器在 40 m/s 时相比等功率分配获得 1.21 dB 的平均最小 SINR 增益，并把 Jain 指数从 0.833 提升到 0.970，代价是由效用权重设定的 24.6% 和速率损失。其 OTFS 相对 OFDM 的优势从 10 m/s 的 0.18 dB 增至 90 m/s 的 0.81 dB；时延扫描表明其鲁棒性远强于经典时延 SINR 均衡。未来工作将考虑 MIMO-OTFS、联合波束与功率控制，以及量化 SINR 反馈。

## 图注与表注

**图 1**：等功率分配、无控制器时的空口行为：(a) 归一化逐帧 SINR 增量随 UAV 速度变化；(b) 70 m/s 时有效 SINR 自相关随反馈时滞变化。
**图 2**：UAV 速度对 (a) 平均最小 SINR 与 (b) 和速率的影响（所提 OTFS/OFDM、等功率、瞬时 GB、时延 SB、时延 WMMSE）。
**图 3**：70 m/s 时反馈时延对 (a) 平均最小 SINR 与 (b) Jain 公平性指数的影响。
**图 4**：(a) Jain 公平性指数随 UAV 速度的变化；(b) 第 5 百分位 SINR 随平均 SNR 的变化。
**图 5**：(a) 功率更新残差随时隙的变化（九时隙滑动平均）；(b) 可靠性权重 $\omega_1$ 对平均最小 SINR 与和速率的影响。

**表注**：表 I（$K=6$、$I_w=8$ 时每时隙的信息与计算代价）已在本页第 III-C 节按原表逐格转录，并用 PyMuPDF 渲染原 PDF 第 4 页核对。

## 参考文献

> 以下按原文编号 [1]—[18] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “¨” 等变音伪影与断行伪影已按常规写法整理，书目内容未改动。

[1] N. N. Dao, Q. V. Pham, N. H. Tu, T. T. Thanh, V. N. Q. Bao, D. S. Lakew, and S. Cho, “Survey on aerial radio access networks: Toward a comprehensive 6G access infrastructure,” IEEE Commun. Surv. Tut., vol. 23, no. 2, pp. 1193–1225, Secondquarter 2021.

[2] Y. Zeng, R. Zhang, and T. J. Lim, “Wireless communications with unmanned aerial vehicles: Opportunities and challenges,” IEEE Commun. Mag., vol. 54, no. 5, pp. 36–42, 2016.

[3] R. Hadani, S. Rakib, M. Tsatsanis, A. Monk, A. J. Goldsmith, A. F. Molisch, and R. Calderbank, “Orthogonal time frequency space modulation,” in Proc. IEEE Wireless Commun. Netw. Conf., 2017, pp. 1–6.

[4] M. Aldababsa, S. Özyurt, G. K. Kurt, and O. Kucur, “A survey on orthogonal time frequency space modulation,” IEEE Open J. Commun. Soc., vol. 5, pp. 4483–4518, 2024.

[5] M. Kollengode Ramachandran and A. Chockalingam, “MIMO-OTFS in high-Doppler fading channels: Signal detection and channel estimation,” in Proc. IEEE Global Commun. Conf., 2018, pp. 206–212.

[6] E. M. Mohamed and M. M. Fouda, “OTFS-based proactive dynamic UAV positioning for high-speed train coverage,” IEEE Open J. Commun. Soc., vol. 5, pp. 5718–5734, 2024.

[7] B. Li, T. Xiao, K. Zhou, L. Xu, G. Liu, B. Wang, J. Gao, J. Guan, and Z. Di, “Research on OTFS systems for 6G,” in Proc. IEEE Int. Conf. Trust Secur. Privacy Comput. Commun., 2022, pp. 1498–1503.

[8] D. J. Love, R. W. Heath, V. K. N. Lau, D. Gesbert, B. D. Rao, and M. Andrews, “An overview of limited feedback in wireless communication systems,” IEEE J. Sel. Areas Commun., vol. 26, no. 8, pp. 1341–1365, 2008.

[9] G. Foschini and Z. Miljanic, “A simple distributed autonomous power control algorithm and its convergence,” IEEE Trans. Veh. Technol., vol. 42, no. 4, pp. 641–646, 1993.

[10] R. Yates, “A framework for uplink power control in cellular radio systems,” IEEE J. Sel. Areas Commun., vol. 13, no. 7, pp. 1341–1347, 1995.

[11] Q. Shi, M. Razaviyayn, Z.-Q. Luo, and C. He, “An iteratively weighted MMSE approach to distributed sum-utility maximization for a MIMO interfering broadcast channel,” IEEE Trans. Signal Process., vol. 59, no. 9, pp. 4331–4340, 2011.

[12] P. Raviteja, K. T. Phan, Q. Jin, Y. Hong, and E. Viterbo, “Low-complexity iterative detection for orthogonal time frequency space modulation,” in Proc. IEEE Wireless Commun. Netw. Conf., 2018, pp. 1–6.

[13] 3GPP, “Study on enhanced LTE support for aerial vehicles,” 3GPP TR 36.777, 3rd Generation Partnership Project, Dec. 2017.（原文引用期号，具体卷页未在抽取文本中给出）

[14] P. Raviteja, K. T. Phan, Y. Hong, and E. Viterbo, “Interference cancellation and iterative detection for orthogonal time frequency space modulation,” IEEE Trans. Wireless Commun., vol. 17, no. 10, pp. 6501–6515, 2018.

[15] Y. Li and L. Cimini, “Bounds on the interchannel interference of OFDM in time-varying impairments,” IEEE Trans. Commun., vol. 49, no. 3, pp. 401–404, 2001.

[16] P. Raviteja, K. T. Phan, and Y. Hong, “Embedded pilot-aided channel estimation for OTFS in delay–Doppler channels,” IEEE Trans. Veh. Technol., vol. 68, no. 5, pp. 4906–4917, 2019.

[17] R. K. Jain, D.-M. W. Chiu, and W. R. Hawe, “A quantitative measure of fairness and discrimination for resource allocation in shared computer systems,” Digital Equipment Corporation, Eastern Research Laboratory, Tech. Rep. DEC-TR-301, 1984.

[18] L. Condat, “Fast projection onto the simplex and the $\ell_1$ ball,” Mathematical Programming, vol. 158, p. 575–585, 2016.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（贡献概述）；第 II 节系统模型（A OTFS 帧与基于几何的 DD 信道，式（1）—（3）；B 波束成形与有效 DD 增益，式（4）—（6）；C 信道获取下限，式（7）；D SINR、速率与时延反馈，式（8）—（11））；第 III 节所提时延 SINR 反馈功率控制（A 预测、平滑与加权优先级，式（12）—（15）；B 投影乘性更新，式（16）—（17）、算法 1、命题 1 及证明；C 计算复杂度，表 I）；第 IV 节数值结果与讨论（图 1—5）；第 V 节结论；图 1—5 图注与表注；参考文献 [1]—[18] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—5 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I 已按原表逐格转录并用 PyMuPDF 渲染原 PDF 第 4 页核对；④作者简介与版权声明不在正文范围，未收录；⑤参考文献 [13]（3GPP TR 36.777）在 PDF 抽取文本中未给出具体卷页信息，已加注；⑥骨架版本日期 "2026-09-27" 与 PDF 实际 v1 2026-09-15 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
