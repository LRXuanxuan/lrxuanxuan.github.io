---
layout: page
title: "基于 AMP 的 IRS 辅助免授权接入联合活跃检测与信道估计：精确信道与稀疏建模｜中文全篇译稿（IEEE 正式版，许可待核验）"
permalink: /papers/translations/2026-10-08-2025-36477-amp-based-joint-activity-detection-and-channel-estimation-in-irs-aided/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e2d993c9ad616fd4/) · [IEEE DOI](https://doi.org/10.1109/TCOMM.2025.3647746) · [IEEE Xplore](https://ieeexplore.ieee.org/document/11313557/) · [全部目录](/papers/catalog/)

# 基于 AMP 的 IRS 辅助免授权接入联合活跃检测与信道估计：精确信道与稀疏建模

**原题：** AMP-Based Joint Activity Detection and Channel Estimation in IRS-Aided Grant-Free Access With Accurate Channel and Sparsity Modeling  
**作者：** Hao Zhang、Qingfeng Lin、Yang Li、Yik-Chung Wu（IEEE Member / Senior Member）  
**版本：** IEEE Transactions on Communications，vol. 74，2026，pp. 2482–2497；DOI: 10.1109/TCOMM.2025.3647746（本地 PDF 16 页；2025-02-01 收稿，2025-06-15、2025-09-16 修回，2025-12-13 录用，2025-12-23 出版，2026-01-02 当前版本）。  
**范围与状态：** 全文中文译稿：摘要、第 I—VIII 节、算法 1—2、表 I、图 1—12 图注与正文数值、参考文献 [1]—[53] 英文原条目均按原文结构录入；作者简介、卷首基金/收稿信息与 IEEE 版权声明未逐段翻译（见页尾说明）；逐句逐式终校未做。


> **来源与许可说明：** 原文为 IEEE Transactions on Communications 正式录用版（Vol. 74, 2026, pp. 2482–2497；DOI 10.1109/TCOMM.2025.3647746），本地 PDF 无 arXiv 版本；本页为中文全篇译稿，按 IEEE 版权口径**不登记为“可公开全文译文”**，公开传播许可需另行核验。

## 摘要

联合活跃检测与信道估计是面向大规模机器类通信（mMTC）的免授权随机接入中的关键任务。为提升通信质量，智能反射面（IRS）通过无源反射单元控制传播环境，被视为有前景的技术。然而，由于 IRS 的无源特性以及设备—IRS—基站复合信道的非高斯性，IRS 给联合活跃检测与信道估计带来了显著挑战。为此，本文为复合信道建立了精确统计模型，证明其服从方差-Gamma（variance-gamma，VG）分布。基于精确信道统计，本文采用 Bernoulli-VG 先验，并在期望最大化（EM）框架内扩展标准近似消息传递（AMP）算法以学习服从 Gamma 分布的信道方差。此外，本文提出一种新方法，将活跃检测任务转化为对每个设备专属活跃概率的估计，从而在所有基站天线上强制设备活跃状态的一致性。大量仿真验证了所提 VG 信道模型，并表明在多天线上施加一致的活跃概率可带来显著性能提升。

**索引词**：免授权随机接入；活跃检测；智能反射面（IRS）；近似消息传递；方差-Gamma IRS 信道模型。

## I. 引言

大规模机器类通信（mMTC）被期望支撑 6G 及未来无线网络中的高密度连接 [1]–[3]。在典型的 mMTC 场景中，一台配备多天线的基站（BS）服务大量具有偶发业务（sporadic traffic）的设备。由于任一时刻只有一小部分设备发送短数据包，传统的基于协调的多址策略 [4] 变得低效。为提供低时延通信，一种称为免授权随机接入的新范式被提出，以降低信令开销 [5]。

在免授权随机接入方案下，每个设备被分配一条唯一但非正交的导频序列，并在实际数据包之前发送该导频。由于基站事先并不知道哪些设备会在某个时隙发送，基站需要首先检测哪些设备处于活跃状态，并估计其对应信道。由于设备数量巨大且发送具有偶发性，基于协方差的方法 [6]–[10] 在活跃检测中很流行。这类方法虽把活跃检测表述为最大似然估计问题，却无法把信道估计纳入框架 [11]。因此，压缩感知类方法——包括近似消息传递（AMP）[12]–[15] 与稀疏贝叶斯学习（SBL）[16]、[17]——在联合活跃检测与信道估计中占主导地位。

另一方面，为增强基站覆盖，智能反射面（IRS）近来受到研究界推崇，因其具有克服设备与基站之间遮挡的独特能力 [18]–[24]。IRS 由大量反射单元组成，以受控方式反射信号以绕开传播路径中的遮挡，从而提升信号质量。IRS 不主动放大信号，因而能效高，是扩展基站覆盖的有力候选。

然而，由于 IRS 没有处理单元，所有信号在到达基站前被叠加在一起 [18]，IRS 辅助网络中的 mMTC 活跃检测变得更加困难。更具体地，在设备—IRS 与 IRS—基站信道均为 Rayleigh 衰落的典型设置下（即小尺度衰落分量为标准复高斯分布），从设备到基站的级联信道不再服从高斯分布 [25]–[27]。这使得现有严重依赖高斯信道假设的活跃检测与信道估计方法 [6]–[17] 不再适用。虽然 AMP [28]、[29] 与基于神经网络的方法 [30]、[31] 已被用于 IRS 辅助系统的信道估计，但 IRS 辅助系统中的联合活跃检测与信道估计受到的关注相对较少。

### A. 相关工作

近期，[25] 提出一种三阶段方法，分别估计设备—IRS 与 IRS—基站信道，随后再检测活跃性。然而，前两阶段的估计误差会显著恶化活跃检测阶段的性能。此外，该三阶段方法利用 IRS 相移矩阵的稀疏模式，因此必须一次关断一部分反射单元（例如 50%），这会为控制 IRS 反射单元消耗额外时间 [32]。尽管 [33] 进一步提出通过求解矩阵分解问题联合估计设备—IRS 与 IRS—基站信道，但它利用毫米波系统中 IRS—基站信道模型在虚拟角度（空间）域的稀疏性，因而无法用于 Rayleigh 衰落信道 [34]。为克服这些局限，[26]、[27] 提出用近似高斯信道模型联合检测设备活跃性并估计设备—IRS—基站复合信道，从而可直接应用标准 AMP 算法。但根据中心极限定理，复合信道的近似高斯性只在反射单元数趋于无穷时成立。实际中该假设未必可靠 [35]、[36]，由此造成的信道统计失配会显著影响活跃检测结果，尤其是反射单元数不够大时。

### B. 主要贡献

鉴于 IRS 辅助无线系统中联合活跃检测与信道估计的现有研究有限，本文作出以下贡献。

- **精确统计建模以克服高斯近似的局限。** 由于复合信道是两个独立复高斯向量的内积，从某设备到基站各天线的复合信道实际上服从方差-Gamma（VG）分布 [37]。
- **适配新统计模型的 AMP 扩展。** 由于新建立的 IRS 信道统计模型违背高斯假设，现有 AMP 算法 [12]、[13]、[26] 不再适用。为此，本文将 AMP 算法中复合信道的先验扩展为方差服从 Gamma 分布的 Bernoulli-Gaussian 先验，并在期望最大化（EM）框架内迭代估计未知信道及其方差。
- **跨天线一致的活跃状态建模。** 除使用不精确的高斯近似 IRS 信道模型外，现有工作的另一不足是：联合活跃检测与信道估计在各基站天线上独立执行。初看这似乎合理，因为各设备到不同基站天线的信道相互独立；但被忽略的是，同一设备在各天线上的信道共享同一活跃状态。若在最后一步基于各天线估计出的信道做活跃检测，则难以在信道估计过程中强制活跃状态一致。为此，本文在 VG 信道模型基础上，进一步为 AMP 算法的先验分布赋予每个设备专属的稀疏参数（即活跃概率）。这不仅在所有基站天线上强制同一设备活跃状态一致，还从根本上改变了 AMP 算法中稀疏参数的含义：从“所有设备的平均活跃概率”变为“当前本轮检测中每个设备各自的活跃概率”。活跃检测任务于是变为对每个设备活跃概率的估计，可纳入所提基于 EM 的 AMP 算法的最大化步。
- **仿真验证。** 大量仿真结果表明，所提 IRS 辅助系统 VG 信道模型无论 IRS 反射单元数少还是多，都能给出稳定的活跃检测性能；此外，在 AMP 模型中为每个设备引入专属活跃概率可使检测性能提升一个数量级以上。

本文其余部分组织如下：第 II 节描述系统模型与现有方法；第 III 节建立精确 IRS 信道模型并提出用于信道估计的 EM 框架；第 IV 节推导所提基于 AMP 的 EM 算法；第 V 节将所提方法扩展到在各基站天线上为每个设备引入一致活跃状态；第 VI 节把所提算法用于含直达链路与未知噪声方差的场景；第 VII 节给出仿真结果与讨论；第 VIII 节总结全文。

**记号**：粗体大写字母表示矩阵，粗体小写字母表示向量，小写字母表示标量。$(\cdot)^{-1}$、$(\cdot)^H$ 分别表示求逆与共轭转置。大小为 $L$ 的单位矩阵记为 $\mathbf I_L$，全零向量记为 $\mathbf 0$。$\mathbb E[\cdot]$ 表示随机变量的期望；$\|\cdot\|_2$ 表示 $\ell_2$ 范数，$\|\cdot\|_F$ 表示 Frobenius 范数。

## II. 系统模型与高斯近似 AMP

### A. 系统模型

考虑图 1 所示的 IRS 辅助免授权多址接入系统：一台配备 $M$ 根天线的基站、一个具有 $P$ 个反射单元的 IRS，以及 $N$ 个潜在的单天线设备。第 $n$ 个设备与第 $p$ 个反射单元之间的信道建模为 $\sqrt{\beta_{1,n}}g_{1,np}\in\mathbb C$，其中 $\beta_{1,n}$ 表示第 $n$ 个设备与 IRS 之间的大尺度衰落系数，$g_{1,np}$ 是第 $n$ 个设备与 IRS 第 $p$ 个单元之间的小尺度衰落分量。类似地，第 $p$ 个反射单元与基站第 $m$ 根天线之间的信道建模为 $\sqrt{\beta_2}g_{2,pm}\in\mathbb C$，其中 $\beta_2$ 与 $g_{2,pm}$ 分别表示大尺度与小尺度衰落分量。小尺度衰落分量 $\{g_{1,np}\}_{n=1,p=1}^{N,P}$ 与 $\{g_{2,pm}\}_{p=1,m=1}^{P,M}$ 假设为独立复高斯变量 $\mathcal{CN}(0,1)$。

由于 mMTC 数据包较小，且在此传输时间内设备不会移动很远，本文对信道采用块衰落模型：$\{\sqrt{\beta_{1,n}}g_{1,np}\}_{n=1,p=1}^{N,P}$ 与 $\{\sqrt{\beta_2}g_{2,pm}\}_{p=1,m=1}^{P,M}$ 在每个相干块内保持不变 [34]、[38]。IRS 的散射矩阵建模为 $\operatorname{diag}\{\alpha e^{j\theta_1},\alpha e^{j\theta_2},\ldots,\alpha e^{j\theta_P}\}$，其中 $\alpha$ 与 $\theta_p\in[0,2\pi)$ 分别为第 $p$ 个反射单元的反射幅度与相移 [20]。假设设备与基站之间的直达链路被遮挡 [39]（含直达链路场景的扩展见第 VI 节），则从第 $n$ 个设备到基站第 $m$ 根天线的复合信道 $h_{nm}\in\mathbb C$ 为

$$
h_{nm}=\alpha\sqrt{\beta_{1,n}\beta_2}\sum_{p=1}^{P}g_{1,np}g_{2,pm}e^{j\theta_p}.\tag{1}
$$

假设每个设备 $n$ 以未知概率独立地偶发发送数据。定义 $a_n\in\{0,1\}$ 为第 $n$ 个设备在单个相干块内的活跃指示变量：$a_n=1$ 表示第 $n$ 个设备活跃，$a_n=0$ 表示不活跃。在每个相干块内，若第 $n$ 个设备活跃，则向基站发送唯一导频序列 $\mathbf s_n\in\mathbb C^L$。假设所有设备的导频序列 $\mathbf S=[\mathbf s_1,\ldots,\mathbf s_N]^T$ 在基站已知，则基站第 $m$ 根天线接收信号 $\mathbf y_m\in\mathbb C^L$ 为

$$
\mathbf y_m=\sum_{n=1}^{N}a_n\mathbf s_nh_{nm}+\mathbf w_m=\mathbf S\mathbf x_m+\mathbf w_m,\tag{2}
$$

其中 $\mathbf x_m=[a_1h_{1m},\ldots,a_Nh_{Nm}]^T$ 表示从所有设备到基站第 $m$ 根天线的信道向量，$\mathbf w_m\in\mathbb C^L$ 是零均值、方差 $\sigma_w^2$ 的加性白高斯噪声。本文关注对 $\{\mathbf x_m\}_{m=1}^M$ 的估计，该任务同时包含活跃检测与信道估计。

由于 $\mathbf x_m$ 的元素只有在第 $n$ 个设备活跃（即 $a_n=1$）时才非零，而设备活跃具有偶发性，因此信道向量 $\mathbf x_m$ 呈稀疏模式，其恢复可表述为压缩感知问题 [13]。

在无 IRS 的传统场景中，所有小尺度衰落分量假设为复高斯分布，故有效信道 $\tilde x_{nm}\triangleq a_nh_{nm}$ 服从 Bernoulli-Gaussian 分布 [5]。为从贝叶斯角度利用未知向量 $\mathbf x_m$ 的这一先验知识，AMP 是一种流行且低复杂度的方法：它通过最小化均方误差（MSE）获得稀疏信道估计，其性能由状态演化（state evolution，SE）刻画。

然而在 IRS 辅助系统中，由于所有小尺度衰落分量 $\{g_{1,np},g_{2,pm}\}_{n=1,p=1,m=1}^{N,P,M}$ 独立同分布（i.i.d.）且为复高斯，并在式（1）的复合信道中相乘，$\{h_{nm}\}$ 当然不再服从高斯分布。因此，基于 Bernoulli-Gaussian 先验推导的现有 AMP 方法不能直接用于式（1）。尽管存在分布失配，[26]、[27] 提出用高斯分布近似 $h_{nm}$ 的分布。

### B. 高斯近似 IRS 信道下的 AMP

考虑到式（1）中元素 $\{g_{1,np}g_{2,pm}e^{j\theta_p}\}_{p=1}^P$ 相互独立，在 $P$ 较大时可假设 $h_{nm}$ 近似服从高斯分布 [26]、[27]：

$$
p(h_{nm})\approx\mathcal{CN}\!\left(h_{nm}\,\middle|\,0,\ \alpha^2\beta_{1,n}\beta_2P\right).\tag{3}
$$

基于对每个 $h_{nm}$ 的近似，$\mathbf x_m$ 的 Bernoulli-Gaussian 先验为 [26]、[27]

$$
p(\mathbf x_m)=\prod_{n=1}^{N}p(x_{nm})=\prod_{n=1}^{N}\left[\lambda\mathcal{CN}\!\left(0,\alpha^2\beta_{1,n}\beta_2P\right)+(1-\lambda)\delta(x_{nm})\right],\tag{4}
$$

其中 $x_{nm}$ 是 $\mathbf x_m$ 的第 $n$ 个元素，$\lambda$ 表示每个 $x_{nm}$ 非零的概率，并假设已知。然而，式（4）与似然函数 $\mathcal{CN}(\mathbf y_m\,|\,\mathbf S\mathbf x_m,\sigma_w^2)$ 不共轭，直接推断后验分布 $p(\mathbf x_m|\mathbf y_m)$ 不可行。

为克服这一困难，可采用 AMP 技术恢复稀疏信道向量 $\mathbf x_m$ [5]。具体地，在大系统极限下（即 $N\to\infty$ 且 $L/N$ 固定）且导频矩阵 $\mathbf S$ 含 i.i.d. 高斯元素时，第 $t$ 次 AMP 迭代中假设 $\mathbf x_m$ 可由虚拟含噪观测 $\mathbf r_m^t=[r_{1m}^t,\ldots,r_{Nm}^t]^T$ 恢复，其分布为

$$
p(\mathbf r_m^t)=\prod_{n=1}^{N}p(r_{nm}^t)=\prod_{n=1}^{N}\mathcal{CN}\!\left(r_{nm}^t\,\middle|\,x_{nm},(\gamma_m^t)^{-1}\right),\tag{5}
$$

其中 $(\gamma_m^t)^{-1}$ 是从上一迭代学到的虚拟噪声方差。基于该假设，可应用迭代 AMP 算法估计 $\mathbf x_m$ [40]：

$$
\hat x_{nm}^t=\eta^t\!\left(r_{nm}^t,\gamma_m^t\right),\tag{6}
$$

$$
\alpha_m^t=\frac{1}{N}\sum_{n=1}^{N}\eta'^{t}\!\left(r_{nm}^t,\gamma_m^t\right),\tag{7}
$$

$$
\mathbf v_m^t=\mathbf y_m-\sum_{n=1}^{N}\mathbf s_n\hat x_{nm}^t+\frac{N}{L}\alpha_m^t\mathbf v_m^{t-1},\tag{8}
$$

$$
\mathbf r_m^{t+1}=\hat{\mathbf x}_m^t+\mathbf S^H\mathbf v_m^t,\tag{9}
$$

$$
\gamma_m^{t+1}=\left[\frac{N}{L}\mathbb E\left|\eta^t\!\left(x_{nm}+\frac{\nu}{\sqrt{\gamma_m^t}},\gamma_m^t\right)-x_{nm}\right|^2+\sigma_w^2\right]^{-1},\tag{10}
$$

其中 $\eta^t(\cdot,\cdot)$ 表示阈值函数，$\eta'^t(r_{nm}^t,\gamma_m^t)$ 是 $\eta^t(r_{nm}^t,\gamma_m^t)$ 关于虚拟观测 $r_{nm}^t$ 的一阶导数；式（10）中的期望关于服从先验（4）的 $x_{nm}$ 与 $\nu\sim\mathcal{CN}(0,1)$ 求取。

在 [26]、[27] 中，阈值函数 $\eta^t$ 采用最小均方误差（MMSE）去噪器，即通过最小化

$$
\mathbb E_{x_{nm}|r_{nm}^t}\left[|\hat x_{nm}-x_{nm}|^2\right]\tag{11}
$$

获得。结合式（4）与（5），每个 MMSE 估计器 $\hat x_{nm}$ 的闭式解为

$$
\hat x_{nm}=\eta^t\!\left(r_{nm}^t,\gamma_m^t\right)
=\mathbb E\left[x_{nm}\mid r_{nm}^t\right]
=\frac{1}{1+\frac{1-\lambda}{\lambda}\left(\alpha^2\beta_{1,n}\beta_2P\gamma_m^t+1\right)\exp\!\left(-\dfrac{(\gamma_m^t)^2\alpha^2\beta_{1,n}\beta_2P\|r_{nm}^t\|_2^2}{\alpha^2\beta_{1,n}\beta_2P\gamma_m^t+1}\right)}
\times\frac{\alpha^2\beta_{1,n}\beta_2P\gamma_m^t\,r_{nm}^t}{\alpha^2\beta_{1,n}\beta_2P\gamma_m^t+1}.\tag{12}
$$

AMP 算法（6）—（10）是为单个接收天线设计的。为合并全部 $M$ 根天线的估计结果，[26]、[27] 提出用下式合并每个设备 $n$ 的对数似然比（LLR）检验结果：

$$
\ell_n=\sum_{m=1}^{M}\ln\frac{p(\hat x_{nm}|a_n=1)}{p(\hat x_{nm}|a_n=0)}
=\sum_{m=1}^{M}\ln\frac{\mathcal{CN}\!\left(\hat x_{nm}\,\middle|\,0,\alpha^2\beta_{1,n}\beta_2P+(\gamma_m^t)^{-1}\right)}{\mathcal{CN}\!\left(\hat x_{nm}\,\middle|\,0,(\gamma_m^t)^{-1}\right)},\tag{13}
$$

其中每个独立结果由两个似然函数之比（即活跃与不活跃）得到。随后，若 $\ell_n$ 大于预设阈值，则判定第 $n$ 个设备活跃。

尽管 [26]、[27] 是把 AMP 算法用于 IRS 辅助系统联合活跃检测与信道估计的开创性工作，但它们显然存在以下局限：

(i) 式（3）中 $h_{nm}$ 服从高斯分布的假设仅在 IRS 尺寸较大时成立；
(ii) 不同天线 $m$ 上的信道 $\{x_{nm}\}_{m=1}^M$ 被独立恢复，而它们实际上共享同一 $a_n$。

为克服局限 (i) 与 (ii)，本文将在第 III、IV 节建立精确信道模型及其对应估计方法，并在第 V 节进一步扩展结果以纳入一致的 $a_n$。

## III. 精确信道统计下的 IRS 辅助活跃检测与信道估计

### A. 精确信道统计建模

考虑式（1）中所有设备到基站第 $m$ 根天线的复合信道所共有的部分 $\{g_{2,pm}\}_{p=1}^{P}$，则条件分布为

$$
p\left(\{h_{nm}\}_{n=1}^{N}\mid\{g_{2,pm}\}_{p=1}^{P}\right)=\prod_{n=1}^{N}p\left(h_{nm}|\{g_{2,pm}\}_{p=1}^{P}\right)=\prod_{n=1}^{N}\alpha\sqrt{\beta_{1,n}\beta_2}\,\mathcal{CN}\!\left(0,\underbrace{\sum_{p=1}^{P}|g_{2,pm}|^2}_{\triangleq z_m}\right),\tag{14}
$$

其中第二个等号利用了 $\{g_{1,np}\}_{p=1}^{P}$ 相互独立且单位方差这一事实，$z_m=\sum_{p=1}^{P}|g_{2,pm}|^2$ 表示 IRS 到基站第 $m$ 根天线各信道的总功率。注意式（14）不依赖 IRS 的相移参数 $\{\theta_p\}_{p=1}^{P}$，因此后续活跃检测与信道估计均与 IRS 相移设计无关。

式（14）表明，$\{h_{nm}\}_{n=1}^{N}$ 的方差依赖于随机变量 $z_m$。由于 $\{g_{2,pm}\}_{p=1}^{P}$ 假设为零均值、单位方差的独立复高斯变量，$z_m$ 服从 Gamma 分布 [41]：

$$
p(z_m)=\operatorname{Gamma}(z_m|P,1)=\frac{1}{\Gamma(P)}z_m^{P-1}e^{-z_m},\tag{15}
$$

其中超参数 $P$ 由反射单元数决定。不同 $P$ 取值下 $z_m$ 的分布绘于图 2。可以看到，只有当 $P$ 超过 $10^4$ 时，$z_m$ 的取值才紧密集中在 $P$ 附近；这意味着近似高斯信道（3）仅在反射单元数很大时成立。

另一方面，定义 $\boldsymbol\Lambda=\operatorname{diag}(\sqrt{\beta_{1,1}},\ldots,\sqrt{\beta_{1,N}})$ 与 $\mathbf q_m=[h_{1m}/(\alpha\sqrt{\beta_{1,1}\beta_2}),\ldots,h_{Nm}/(\alpha\sqrt{\beta_{1,N}\beta_2})]^T$，则 $\mathbf h_m$ 的精确联合边缘分布为

$$
\mathbf h_m\sim\int p(\mathbf h_m|z_m)p(z_m)\,dz_m=\alpha\sqrt{\beta_2}\boldsymbol\Lambda\int\mathcal{CN}(\mathbf q_m|\mathbf 0,z_m\mathbf I_N)\operatorname{Gamma}(z_m|P,1)\,dz_m\triangleq p(\mathbf q_m).\tag{16}
$$

结合（14）与（15），联合分布 $p(\mathbf q_m)$ 可推得为 [42]

$$
p(\mathbf q_m)=\frac{2\|\mathbf q_m\|^{\frac{P-N}{2}}}{\pi^N\Gamma(P)}K_{P-N}\left(\|\mathbf q_m\|^2\right),\tag{17}
$$

其中 $\Gamma(\cdot)$ 表示 Gamma 函数，$K_{P-N}(\cdot)$ 为 $(P-N)$ 阶第二类修正 Bessel 函数。

为说明式（17）把高斯近似作为特例包含在内，注意归一化 $\mathbf q_m/\sqrt{P}$ 的特征函数为 [42]

$$
\Phi(\boldsymbol\omega)=\left(1+\frac{1}{4P}\|\boldsymbol\omega\|_2^2\right)^{-P}.\tag{18}
$$

当 $P\to\infty$ 时，由洛必达法则，特征函数（18）变为

$$
\lim_{P\to\infty}\Phi(\boldsymbol\omega)=\lim_{P\to\infty}\left(1+\frac{1}{4P}\|\boldsymbol\omega\|_2^2\right)^{-P}=\exp\left(-\frac{1}{4P}\|\boldsymbol\omega\|_2^2\times P\right)=\exp\left(-\frac{1}{4}\|\boldsymbol\omega\|_2^2\right),\tag{19}
$$

这正是标准复高斯分布 $\mathcal{CN}(0,\mathbf I_N)$ 的特征函数。

鉴于 $P$ 不太大时高斯近似信道模型并不精确，本文提出在活跃检测与信道估计中采用复合信道 $\{h_{nm}\}_{n=1,m=1}^{N,M}$ 的精确概率模型。然而，由于 $\mathbf h_m$ 各元素之间的耦合，精确分布（16）无法直接用于 Bernoulli-Gaussian 先验（4）。为绕过这一困难，本文采用等价的层次先验（14）与（15），其中条件独立性 $\prod_{n=1}^{N}p(h_{nm}|z_m)$ 适用于 AMP 算法 [40]。

具体地，结合偶发设备活跃性与精确信道模型，本文提出用（14）替换（4）中的高斯分布。由于（14）中模型的方差服从 Gamma 分布，我们称该模型为 **Bernoulli-VG 先验**。由此得到如下稀疏强制信道先验：

$$
p(\mathbf x_m|z_m)=\prod_{n=1}^{N}p(x_{nm}|z_m)=\prod_{n=1}^{N}\left[\lambda\mathcal{CN}\!\left(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m\right)+(1-\lambda)\delta(x_{nm})\right],\tag{20}
$$

其中超参数 $z_m$ 服从（15）的分布。这与 [26]、[27] 假设 $z_m$ 固定形成鲜明对比。因此，标准 AMP 算法 [40] 不能直接用于（20）。

为学习服从 Gamma 分布（15）的随机超参数 $z_m$，本文提出基于（20）推导 EM 算法，交替估计稀疏信道 $\mathbf x_m$ 并获得 $z_m$ 的最大后验估计。

### B. EM 框架下的稀疏信道与超参数学习

由（2）中受白高斯噪声污染的信号，似然函数 $p(\mathbf y_m|\mathbf x_m)$ 为

$$
p(\mathbf y_m|\mathbf x_m)=\mathcal{CN}(\mathbf y_m|\mathbf S\mathbf x_m,\sigma_w^2)=\left(\frac{1}{\pi\sigma_w^2}\right)^{L}\exp\left(-\frac{\|\mathbf y_m-\mathbf S\mathbf x_m\|_2^2}{\sigma_w^2}\right).\tag{21}
$$

把（21）与（20）中 $\mathbf x_m$ 的先验分布结合，条件于 $z_m$ 的联合分布为

$$
p(\mathbf y_m,\mathbf x_m|z_m)=p(\mathbf y_m|\mathbf x_m)p(\mathbf x_m|z_m)=\mathcal{CN}(\mathbf y_m|\mathbf S\mathbf x_m,\sigma_w^2\mathbf I_L)\prod_{n=1}^{N}\left[\lambda\mathcal{CN}\!\left(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m\right)+(1-\lambda)\delta(x_{nm})\right].\tag{22}
$$

遗憾的是，由于信道向量 $\mathbf x_m$ 不可观测，无法通过直接最大化（22）获得 $z_m$ 的最大似然估计。

为绕过该困难，可用 EM 算法联合估计 $\mathbf x_m$ 与 $z_m$。具体地，EM 算法迭代更新“期望对数似然函数加上先验 $p(z_m)$ 的对数”（即期望对数后验）[43]：

$$
\text{(E 步)}\quad Q(z_m|z_m^{t-1})\triangleq\mathbb E\left[\ln p(\mathbf y_m,\mathbf x_m|z_m)\right]+\ln p(z_m),\tag{23}
$$

其中期望在给定第 $(t-1)$ 次 EM 迭代的 $z_m$ 估计时，对后验分布 $p(\mathbf x_m|\mathbf y_m,z_m^{t-1})$ 求取；随后最大化期望对数后验：

$$
\text{(M 步)}\quad z_m^t=\arg\max_{z_m}Q(z_m|z_m^{t-1}).\tag{24}
$$

重复 E 步（23）与 M 步（24），即可得到使边缘似然最大的 $z_m$ [43]。

为计算期望对数后验（23），需要后验分布 $p(\mathbf x_m|\mathbf y_m,z_m^{t-1})$。由贝叶斯公式，$\mathbf x_m$ 的后验分布为

$$
p(\mathbf x_m|\mathbf y_m,z_m^{t-1})=\frac{p(\mathbf y_m|\mathbf x_m)p(\mathbf x_m|z_m^{t-1})}{p(\mathbf y_m|z_m^{t-1})},\tag{25}
$$

其中分母由联合分布（22）对 $\mathbf x_m$ 的边缘化得到：

$$
p(\mathbf y_m|z_m^{t-1})=\int p(\mathbf y_m,\mathbf x_m|z_m^{t-1})\,d\mathbf x_m=\int p(\mathbf y_m|\mathbf x_m)p(\mathbf x_m|z_m^{t-1})\,d\mathbf x_m.\tag{26}
$$

然而，由于概率模型（22）复杂，E 步中的后验分布（25）不可解。为克服该困难，本文提出用 AMP 算法近似（25）中的后验分布 $p(\mathbf x_m|\mathbf y_m,z_m^{t-1})$。

## IV. 基于方差-Gamma IRS 信道模型的 AMP-EM 算法

### A. 用 AMP 近似后验分布

为近似后验分布 $p(\mathbf x_m|\mathbf y_m,z_m^{t-1})$，把 AMP 迭代（6）—（10）应用于概率模型（22），其中 MMSE 去噪器（12）中的 $P$ 替换为上一轮估计 $z_m^{t-1}$。与（4）中方差固定的 Bernoulli-Gaussian 先验不同，所提 Bernoulli-VG 先验（20）使其可从接收信号 $\mathbf y_m$ 中学习。

基于 AMP 迭代，可进一步得到每个隐变量 $x_{nm}$ 的后验分布 [44]、[45]。具体地，每个 $x_{nm}$ 服从 Bernoulli-Gaussian 分布：

$$
\hat p(x_{nm}|\mathbf y_m,z_m^{t-1})=\hat\pi_{nm}^t\mathcal{CN}(x_{nm}|\hat\mu_{nm}^t,\hat\sigma_{nm}^t)+(1-\hat\pi_{nm}^t)\delta(x_{nm}),\tag{27}
$$

其中

$$
\hat\pi_{nm}^t=\left[1+\frac{1-\lambda}{\lambda}\left(\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t+1\right)\exp\left(-\frac{(\gamma_m^t)^2\alpha^2\beta_{1,n}\beta_2z_m^{t-1}|r_{nm}^t|^2}{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t+1}\right)\right]^{-1},\tag{28}
$$

$$
\hat\mu_{nm}^t=\frac{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t r_{nm}^t}{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t+1},\tag{29}
$$

$$
\hat\sigma_{nm}^t=\frac{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}}{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t+1}.\tag{30}
$$

式（28）—（30）中，$r_{nm}^t$ 与 $\gamma_m^t$ 来自 AMP 算法的第 $t$ 次迭代。

结合所得各 $x_{nm}$ 的后验分布（27），联合后验分布（25）近似为

$$
\hat p(\mathbf x_m|\mathbf y_m,z_m^{t-1})=\prod_{n=1}^{N}\hat p(x_{nm}|\mathbf y_m,z_m^{t-1})=\prod_{n=1}^{N}\left[\hat\pi_{nm}^t\mathcal{CN}(x_{nm}|\hat\mu_{nm}^t,\hat\sigma_{nm}^t)+(1-\hat\pi_{nm}^t)\delta(x_{nm})\right].\tag{31}
$$

### B. EM 框架下的 $z_m$ 估计

基于第 $t$ 次迭代得到的近似后验分布（31），E 步中的期望为

$$
Q(z_m|z_m^{t-1})=\int\ln p(\mathbf y_m,\mathbf x_m|z_m)\hat p(\mathbf x_m|\mathbf y_m,z_m^{t-1})\,d\mathbf x_m+\ln p(z_m)=\int\ln p(\mathbf x_m|z_m)\hat p(\mathbf x_m|\mathbf y_m,z_m^{t-1})\,d\mathbf x_m+\ln p(z_m)+\text{const},\tag{32}
$$

其中第二个等号把完全数据似然 $p(\mathbf y_m,\mathbf x_m|z_m)$ 用（22）的因子分解替换，const 表示与 $z_m$ 无关的项。把（32）代入（24），$z_m^t$ 的更新由求解

$$
\max_{z_m}\int\ln p(\mathbf x_m|z_m)\hat p(\mathbf x_m|\mathbf y_m,z_m^{t-1})\,d\mathbf x_m+\ln p(z_m)\tag{33}
$$

得到。$z_m$ 的最优值必然使期望对数后验的导数为零，即满足

$$
\frac{d}{dz_m}\int\sum_{n=1}^{N}\ln p(x_{nm}|z_m)\hat p(x_{nm}|\mathbf y_m,z_m^{t-1})\,dx_{nm}+\frac{d}{dz_m}\ln p(z_m)=0,\tag{34}
$$

其中把先验 $p(\mathbf x_m|z_m)$ 用（20）的因子分解替换。注意 $\hat p(\mathbf x_m|\mathbf y_m,z_m^{t-1})$ 如（31）所示也是因子化形式，因此对 $\{x_{jm}\}_{j\neq n}$ 的积分为 1。

在（20）的 $p(x_{nm}|z_m)$ 中采用 Dirac 近似 $\delta(x_{nm})\approx\mathcal{CN}(x_{nm}|0,\epsilon)$（$\epsilon>0$ 任意小），被积函数及其关于 $z_m$ 的偏导数的连续性允许用莱布尼茨积分法则交换（34）左端的微分与积分次序 [46]：

$$
\sum_{n=1}^{N}\int\lim_{\epsilon\to0}\frac{d}{dz_m}\ln\left[\lambda\mathcal{CN}(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m)+(1-\lambda)\mathcal{CN}(x_{nm}|0,\epsilon)\right]\hat p(x_{nm}|\mathbf y_m,z_m^{t-1})\,dx_{nm}+\frac{d}{dz_m}\ln p(z_m).\tag{35}
$$

对（35）中的对数项求导并整理（原文式（36）列出了中间步骤），可化为如下等价形式：

$$
\lim_{\epsilon\to0}\frac{\lambda\mathcal{CN}(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m)}{\lambda\mathcal{CN}(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m)+(1-\lambda)\mathcal{CN}(x_{nm}|0,\epsilon)}\left(\frac{|x_{nm}|^2}{\alpha^2\beta_{1,n}\beta_2z_m^2}-\frac{1}{z_m}\right),\tag{36}
$$

即

$$
\lim_{\epsilon\to0}\frac{\lambda\mathcal{CN}(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m)}{\lambda\mathcal{CN}(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m)+(1-\lambda)\mathcal{CN}(x_{nm}|0,\epsilon)}\times\left(\frac{|x_{nm}|^2}{\alpha^2\beta_{1,n}\beta_2z_m^2}-\frac{1}{z_m}\right)=\begin{cases}\dfrac{|x_{nm}|^2}{\alpha^2\beta_{1,n}\beta_2z_m^2}-\dfrac{1}{z_m},&x_{nm}\neq0,\\[2mm]0,&x_{nm}=0.\end{cases}\tag{37}
$$

把（37）代入（35），该式等价于

$$
\begin{aligned}
&\lim_{\epsilon\to0}\sum_{n=1}^{N}\int\left(\frac{|x_{nm}|^2}{\alpha^2\beta_{1,n}\beta_2z_m^2}-\frac{1}{z_m}\right)\hat p(x_{nm}|\mathbf y_m,z_m^{t-1})\,dx_{nm}+\frac{d}{dz_m}\ln p(z_m)\\
&\quad=\frac{\sum_{n=1}^{N}\left[\hat\pi_{nm}^t|\hat\mu_{nm}^t|^2+\hat\pi_{nm}^t\hat\sigma_{nm}^t\right]}{\alpha^2\beta_{1,n}\beta_2z_m^2}-\frac{\sum_{n=1}^{N}\hat\pi_{nm}^t}{z_m}+\frac{P-1}{z_m}-1\\
&\quad=\frac{1}{z_m^2}\left\{\sum_{n=1}^{N}\frac{\hat\pi_{nm}^t|\hat\mu_{nm}^t|^2+\hat\pi_{nm}^t\hat\sigma_{nm}^t}{\alpha^2\beta_{1,n}\beta_2}-z_m^2-z_m\left(\sum_{n=1}^{N}\hat\pi_{nm}^t+1-P\right)\right\}.
\end{aligned}\tag{38}
$$

由于（38）中 $\{\cdot\}$ 内的表达式是关于 $z_m$ 的二次型，令（38）为零即得 $z_m$ 的最优值：

$$
z_m^t=\frac{\Delta+\sqrt{\Delta^2+4\sum_{n=1}^{N}\hat\pi_{nm}^t\left[|\hat\mu_{nm}^t|^2+\hat\sigma_{nm}^t\right]\big/\left(\alpha^2\beta_{1,n}\beta_2\right)}}{2},\tag{39}
$$

其中 $\Delta=\left(P-1-\sum_{n=1}^{N}\hat\pi_{nm}^t\right)$。

### C. 所提 VG-AMP 算法总结

基于 AMP 近似后验分布（31）执行 E 步（32）、并迭代执行 M 步（39），即得到所提基于 VG 信道模型的 AMP 算法，在每根基站天线上分别执行。但要注意，实现时并不需要显式设置单独步骤来计算近似后验分布与期望步，因为最大化步只依赖近似后验分布的超参数；一旦获得 $\{z_m^t\}_{m=1}^M$ 的估计，即可立即进入下一轮 AMP 算法。整个过程总结于算法 1（本文称之为 **VG-AMP**）。

收敛后，第 $n$ 个设备的活跃状态由下式判定：用不同基站天线恢复的 $\{\hat x_{nm}^t=\eta^t(r_{nm}^t,\gamma_m^t)\}_{m=1}^M$ 计算 LLR（13），并与阈值 $\rho$ 比较。对于活跃设备，其对应信道由 AMP 算法最后一次迭代的 $\{\hat x_{nm}^t\}_{m=1}^M$ 给出，这是信道 $\{h_{nm}\}_{m=1}^M$ 的贝叶斯最优 MMSE 估计。

**算法 1**　基于方差-Gamma IRS 信道模型的 AMP-EM 算法（VG-AMP）

**输入**：$\{\mathbf y_m\}_{m=1}^{M}$ 与 $\mathbf S$。

1. **初始化**：$\{r_{nm}^1=\mathbf s_n^H\mathbf y_m\}_{n=1,m=1}^{N,M}$；$\left\{z_m^0=P,\ \gamma_m^1=\dfrac{1}{L+\|\mathbf y_m\|_2^2/\|\mathbf S\|_F^2}\right\}_{m=1}^{M}$。
2. **repeat**
3. 　**AMP：**
4. 　用（6）—（10）更新虚拟观测 $\{r_{nm}^t\}_{n=1,m=1}^{N,M}$ 与虚拟噪声 $\{\gamma_m^t\}_{m=1}^{M}$，其中 $P$ 替换为 $z_m^{t-1}$；
5. 　**后验分布近似：**
6. 　用（28）—（30）更新近似后验分布 $\{\hat p(\mathbf x_m|\mathbf y_m,z_m^{t-1})\}_{m=1}^{M}$ 的参数；
7. 　用（39）更新 $\{z_m^t\}_{m=1}^{M}$；
8. **until** $\sum_{n=1}^{N}\sum_{m=1}^{M}\dfrac{|\hat x_{nm}^t-\hat x_{nm}^{t-1}|^2}{NM|\hat x_{nm}^{t-1}|^2}<10^{-4}$，或达到最大迭代次数；
9. **输出**：对 $n=1,\ldots,N$，若 $\ell_n>\rho$ 则判定活跃 $\hat a_n=1$，否则 $\hat a_n=0$；所有设备的信道由最后一次迭代的 $\{\hat x_{nm}^t=\eta^t(r_{nm}^t,\gamma_m^t)\}_{n=1,m=1}^{N,M}$ 估计。

## V. 强制一致的活跃状态

尽管 VG IRS 信道概率模型（22）利用了精确信道统计，但与前文其他基于 AMP 的活跃检测与信道估计一样，上一节所提方法仍在各天线上独立执行检测与估计算法，忽略了每个设备在所有天线上活跃状态的一致性。

实际上，无论基站天线数多少，每个设备只有一个活跃状态；且在每一相干块内，每个用户要么活跃要么不活跃。这与（4）（20）中把活跃概率规定为“活跃设备数占总设备数之比”的先验模型不一致。

为纠正这一失配，本文为 $\{x_{nm}\}_{n=1,m=1}^{N,M}$ 提出一种新的 Bernoulli 组稀疏强制先验分布：

$$
p\left(\{x_{nm}\}_{n=1,m=1}^{N,M}\mid\{z_m\}_{m=1}^{M},\{p_n\}_{n=1}^{N}\right)=\prod_{n=1}^{N}\prod_{m=1}^{M}p(x_{nm}|z_m,p_n)=\prod_{n=1}^{N}\prod_{m=1}^{M}\left[p_n\mathcal{CN}\!\left(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m\right)+(1-p_n)\delta(x_{nm})\right].\tag{40}
$$

与（20）相比，（40）中第 $n$ 个设备的所有信道 $\{x_{nm}\}_{m=1}^{M}$ 由一致的活跃概率 $p_n$ 控制，从而显式地在所有基站天线上强制第 $n$ 个设备的状态一致。

遗憾的是，由于 mMTC 系统中设备活跃具有随机性，所有 $\{p_n\}_{n=1}^{N}$ 均未知。为克服该挑战，本文提出把 $\{p_n\}_{n=1}^{N}$ 与（40）中的 $\{z_m\}_{m=1}^{M}$ 一并视为未知超参数，并通过 EM 框架学习其取值。

### A. 一致活跃概率下的 VG-AMP 算法

把（22）中的先验 $p(x_{nm}|z_m)$ 替换为（40）给出的 $p(x_{nm}|z_m,p_n)$ 后，条件于 $\{\{z_m\}_{m=1}^{M},\{p_n\}_{n=1}^{N}\}$ 的全部基站天线接收信号 $\{\mathbf y_m\}_{m=1}^{M}$ 的联合似然为

$$
\begin{aligned}
&p\left(\{\mathbf y_m\}_{m=1}^{M},\{\mathbf x_m\}_{m=1}^{M}\mid\{z_m\}_{m=1}^{M},\{p_n\}_{n=1}^{N}\right)=\prod_{m=1}^{M}p(\mathbf y_m|\mathbf x_m)\prod_{n=1}^{N}\prod_{m=1}^{M}p(x_{nm}|z_m,p_n)\\
&\quad=\prod_{m=1}^{M}\mathcal{CN}(\mathbf y_m|\mathbf S\mathbf x_m,\sigma_w^2\mathbf I_L)\prod_{n=1}^{N}\prod_{m=1}^{M}\left[p_n\mathcal{CN}\!\left(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m\right)+(1-p_n)\delta(x_{nm})\right].
\end{aligned}\tag{41}
$$

基于近似后验分布（31）（但其中 $\lambda$ 换为第 $(t-1)$ 次迭代得到的 $p_n^{t-1}$），用于估计 $\{z_m\}_{m=1}^{M}$ 与 $\{p_n\}_{n=1}^{N}$ 的 EM 期望对数后验为

$$
\begin{aligned}
&Q\left(\{z_m\}_{m=1}^{M},\{p_n\}_{n=1}^{N}\mid\{z_m^{t-1}\}_{m=1}^{M},\{p_n^{t-1}\}_{n=1}^{N}\right)=\mathbb E\left[\ln p\left(\{\mathbf y_m\}_{m=1}^{M},\{\mathbf x_m\}_{m=1}^{M}\mid\{z_m\}_{m=1}^{M},\{p_n\}_{n=1}^{N}\right)\right]+\sum_{m=1}^{M}\ln p(z_m)\\
&\quad=\int\ln p\left(\{\mathbf y_m\}_{m=1}^{M},\{\mathbf x_m\}_{m=1}^{M}\mid\{z_m\}_{m=1}^{M},\{p_n\}_{n=1}^{N}\right)\prod_{n=1}^{N}\prod_{m=1}^{M}\hat p(x_{nm}|\mathbf y_m,z_m^{t-1},p_n^{t-1})\,d\{x_{nm}\}_{n=1,m=1}^{N,M}+\sum_{m=1}^{M}\ln p(z_m)\\
&\quad=\sum_{n=1}^{N}\sum_{m=1}^{M}\int\ln p(x_{nm}|z_m,p_n)\hat p(x_{nm}|z_m^{t-1},p_n^{t-1})\,dx_{nm}+\sum_{m=1}^{M}\ln p(z_m)+\text{const}.
\end{aligned}\tag{42}
$$

注意（42）是（32）的推广，增加了未知超参数 $\{p_n\}_{n=1}^{N}$。因此，估计 $\{z_m\}_{m=1}^{M}$ 与 $\{p_n\}_{n=1}^{N}$ 的 M 步为

$$
\max_{\{z_m\}_{m=1}^{M},\{p_n\}_{n=1}^{N}}\sum_{n=1}^{N}\sum_{m=1}^{M}\int\ln p(x_{nm}|z_m,p_n)\hat p(x_{nm}|\mathbf y_m,z_m^{t-1},p_n^{t-1})\,dx_{nm}+\sum_{m=1}^{M}\ln p(z_m).\tag{43}
$$

（43）中 $\{z_m\}_{m=1}^{M}$ 与 $\{p_n\}_{n=1}^{N}$ 的估计可用块坐标下降（BCD）方法求解：每次在其余超参数固定为最近更新值时，依次优化一个块坐标（超参数）。细节如下。

### B. $\{z_m\}_{m=1}^{M}$ 的估计

略去（43）中与 $z_m$ 无关的项，估计 $z_m$ 的目标函数为

$$
\sum_{n=1}^{N}\int\ln p(x_{nm}|z_m,p_n)\hat p(x_{nm}|\mathbf y_m,z_m^{t-1},p_n^{t-1})\,dx_{nm}+\ln p(z_m).\tag{44}
$$

（44）的导数与（34）左端同形，只是 $\lambda$ 换为 $p_n^{t-1}$。因此，最大化（44）的最优 $z_m$ 仍由（39）给出，只是（39）中（$\hat\pi_{nm}^t$ 内的）$\lambda$ 换为 $p_n^{t-1}$。

### C. $\{p_n\}_{n=1}^{N}$ 的估计

关注（43）中依赖 $p_n$ 的项，估计 $p_n$ 的目标函数为

$$
\sum_{m=1}^{M}\int\ln p(x_{nm}|z_m,p_n)\hat p(x_{nm}|\mathbf y_m,z_m^{t-1},p_n^{t-1})\,dx_{nm}.\tag{45}
$$

在（40）中采用 Dirac 近似 $\delta(x_{nm})\approx\mathcal{CN}(x_{nm}|0,\epsilon)$（$\epsilon>0$ 任意小），对（45）关于 $p_n$ 求导得

$$
\lim_{\epsilon\to0}\frac{d}{dp_n}\sum_{m=1}^{M}\int\ln p(x_{nm}|z_m,p_n)\hat p(x_{nm}|\mathbf y_m,z_m^{t-1},p_n^{t-1})\,dx_{nm}=\sum_{m=1}^{M}\int\lim_{\epsilon\to0}\frac{d}{dp_n}\ln\left[p_n\mathcal{CN}(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m^{t-1})+(1-p_n)\mathcal{CN}(x_{nm}|0,\epsilon)\right]\hat p(x_{nm}|\mathbf y_m,z_m^{t-1},p_n^{t-1})\,dx_{nm},\tag{46}
$$

其中等号通过莱布尼茨积分法则交换微分与积分得到。（46）中关于 $p_n$ 的微分可算得

$$
\lim_{\epsilon\to0}\left[\mathcal{CN}(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m^{t-1})-\mathcal{CN}(x_{nm}|0,\epsilon)\right]\times\frac{1}{p_n\mathcal{CN}(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m^{t-1})+(1-p_n)\mathcal{CN}(x_{nm}|0,\epsilon)}=\begin{cases}\dfrac{1}{p_n},&x_{nm}\neq0,\\[2mm]-\dfrac{1}{1-p_n},&x_{nm}=0.\end{cases}\tag{47}
$$

把（47）代入（46）并令其为零，最优 $p_n$ 应满足

$$
\frac{\sum_{m=1}^{M}\hat\pi_{nm}^t}{p_n}-\frac{\sum_{m=1}^{M}(1-\hat\pi_{nm}^t)}{1-p_n}=0,\tag{48}
$$

即 $\sum_{m=1}^{M}\hat\pi_{nm}^t-p_n\sum_{m=1}^{M}\hat\pi_{nm}^t-Mp_n+p_n\sum_{m=1}^{M}\hat\pi_{nm}^t=0$。解出 $p_n$ 得

$$
p_n^t=\frac{\sum_{m=1}^{M}\hat\pi_{nm}^t}{M}.\tag{49}
$$

### D. 一致活跃概率 VG-AMP 的总结

作为算法 1 中 VG-AMP 的扩展，具有一致活跃概率的 VG-AMP 总结于算法 2。具体地，每次迭代中 AMP 部分与后验分布近似与算法 1 相同，只是 $\lambda$ 换为 $p_n^{t-1}$；$\{z_m\}_{m=1}^{M}$ 的估计仍由（39）给出，而 $\{p_n\}_{n=1}^{N}$ 的估计由（49）给出。算法 2 收敛后，通过把 $p_n^t$ 与阈值 $\rho$ 比较判定设备 $n$ 的活跃状态。注意，由于本文用专属的 $p_n$ 建模每个设备的活跃概率，估计出的 $p_n$ 反映设备 $n$ 的活跃状态，而不是所有设备的平均活跃概率。

**算法 2**　具有一致活跃概率的 VG-AMP

**输入**：同算法 1。

1. **初始化**：同算法 1，只是 $\{p_n^0=0.5\}_{n=1}^{N}$；
2. **repeat**
3. 　**AMP：**
4. 　用（6）—（10）更新 $\{r_{nm}^t\}_{n=1,m=1}^{N,M}$ 与 $\{\gamma_m^t\}_{m=1}^{M}$，其中 $P$ 替换为 $z_m^{t-1}$、$\lambda$ 替换为 $p_n^{t-1}$；
5. 　**后验分布近似：**
6. 　用（28）—（30）更新 $\{\hat p(\mathbf x_m|\mathbf y_m,z_m^{t-1})\}_{m=1}^{M}$，其中 $\lambda$ 替换为 $p_n^{t-1}$；
7. 　用（39）更新 $\{z_m^t\}_{m=1}^{M}$；
8. 　用（49）更新 $\{p_n^t\}_{n=1}^{N}$；
9. **until** $\sum_{n=1}^{N}\sum_{m=1}^{M}\dfrac{|\hat x_{nm}^t-\hat x_{nm}^{t-1}|^2}{NM|\hat x_{nm}^{t-1}|^2}<10^{-4}$，或达到最大迭代次数；
10. **输出**：对 $n=1,\ldots,N$，若 $p_n^t>\rho$ 则判定活跃 $\hat a_n=1$，否则 $\hat a_n=0$；所有设备的信道由最后一次迭代的 $\{\hat x_{nm}^t=\eta^t(r_{nm}^t,\gamma_m^t)\}_{n=1,m=1}^{N,M}$ 估计。

### E. 收敛性与状态演化（SE）分析

在算法 2 的 E 步中，AMP 用于近似后验分布。文献 [47] 已从理论上证明：在 i.i.d. 零均值高斯感知矩阵与高斯混合先验（Bernoulli-Gaussian 先验是其特例）下，广义 AMP 类 EM 算法中估计的超参数收敛到真值，且广义 AMP 的渐近性能与已知正确参数值的“oracle 广义 AMP”一致。在所提 VG-AMP 中，导频矩阵可预先设计为含 i.i.d. 零均值高斯元素，且 AMP 迭代是高斯混合先验下广义 AMP 的特例，因此所提 EM 框架保证学习到的 $\{\{z_m\}_{m=1}^{M},\{p_n\}_{n=1}^{N}\}$ 收敛到其准确值。

对于由 AMP 迭代得到的信道估计，在温和条件下其 MSE 收敛到具有真实超参数的 AMP 状态演化（SE）[48]。具体地，在大系统极限下（即 $N,L\to\infty$，且 $L/N\to\epsilon$），AMP 迭代的行为可由 SE 分析精确预测 [48]。对所提算法 2 中的 AMP 算法，SE 递归给出为

$$
(\gamma_m^{t+1})^{-1}=\sigma_w^2+\frac{N}{L}\hat\tau^t,\tag{50}
$$

$$
\hat\tau^{t+1}=\mathbb E\left[\left|\eta^{t+1}\!\left(x_{nm}+\frac{\nu}{\sqrt{\gamma_m^{t+1}}},\gamma_m^{t+1}\right)-x_{nm}\right|^2\right]=\int\left|\eta^{t+1}\!\left(x_{nm}+\frac{\nu}{\sqrt{\gamma_m^{t+1}}},\gamma_m^{t+1}\right)-x_{nm}\right|^2\times p(x_{nm},z_m|p_n)p(\nu)\,dx_{nm}dz_md\nu,\tag{51}
$$

其中 $x_{nm}$、$z_m$ 分别服从（40）与（15）的分布，$\nu\sim\mathcal{CN}(0,1)$。基于（12）中的 MMSE 去噪器 $\eta^t$，算法 2 中 AMP 迭代的渐近 MSE 性能可由递归（50）（51）的不动点得到。由于算法 1 是算法 2 在 $p_n$ 固定为 $\lambda$ 且不估计时的特例，上述收敛分析对算法 1 同样成立。特别地，算法 1 中 AMP 迭代的 SE 由递归（50）（51）给出，只需把 $x_{nm}$ 的分布换为（20）。计算出的 SE 将在第 VII 节与信道估计 MSE 比较。

标准 AMP 的收敛以导频矩阵 $\mathbf S$ 含 i.i.d. 零均值高斯元素为条件 [48]。这在此处的活跃检测与信道估计中成立，因为 $\mathbf S$ 被预先设计以满足该条件。然而，若 $\mathbf S$ 病态，AMP 的收敛性不再有保证。对于病态 $\mathbf S$ 下的应用，可在所提 EM 算法中用矢量 AMP（vector AMP）替换 AMP 迭代。矢量 AMP 在理论上已证明：对大的右正交不变导频矩阵，其 MSE 收敛到 SE；数值结果也证实，即使有限维导频矩阵非常病态，其收敛仍相当稳健 [49]、[50]。需要强调，所提算法允许把 AMP 迭代直接替换为矢量 AMP，从而在感知矩阵 $\mathbf S$ 病态时保证收敛。

### F. 计算与存储复杂度分析

由于所提算法 1 与 2 涉及标准 AMP 算法 [40]，其计算复杂度量级为 $\mathcal O(IMNL)$。此外，由于 AMP 迭代不涉及协方差矩阵及其求逆，所提算法的存储复杂度量级为 $\mathcal O(LM+NM)$。这些复杂度量级与第 VII 节对比方法的复杂度一起汇总于表 I。

**表 I 不同方法的复杂度量级**（逐格转录）

| 方法 | 计算复杂度 | 存储复杂度 |
| --- | --- | --- |
| 标准 AMP [26], [27] | $\mathcal O(INML)$ | $\mathcal O(LM+NM)$ |
| EM-AMP [44] | $\mathcal O(INML)$ | $\mathcal O(LM+NM)$ |
| 带矢量去噪器的 AMP [12] | $\mathcal O(IN(ML+M^2))$ | $\mathcal O(LM+NM+NM^2)$ |
| SBL [16] | $\mathcal O(INLM^2)$ | $\mathcal O(NM+NM^2)$ |
| VG-AMP | $\mathcal O(INML)$ | $\mathcal O(LM+NM)$ |
| 一致活跃概率 VG-AMP | $\mathcal O(INML)$ | $\mathcal O(LM+NM)$ |

## VI. 含直达链路与未知噪声方差场景的扩展

### A. 含直达链路的信道

若第 $n$ 个设备到基站的直达链路存在，其大尺度衰落系数为 $\beta_n^{\mathrm{DL}}$（无直达链路时取 0）、小尺度衰落为复高斯，则（14）中复合信道的精确分布变为 $\mathcal{CN}(0,\alpha^2\beta_{1,n}\beta_2z_m+\beta_n^{\mathrm{DL}})$。把（20）先验中的信道方差替换为 $\alpha^2\beta_{1,n}\beta_2z_m+\beta_n^{\mathrm{DL}}$ 后，算法 1 与 2 可按如下改动扩展到支持潜在直达链路。

具体地，对算法 1（算法 2 的修改类似，不再重复），近似后验分布的超参数（28）—（30）只需把 $\alpha^2\beta_{1,n}\beta_2z_m$ 替换为 $\alpha^2\beta_{1,n}\beta_2z_m+\beta_n^{\mathrm{DL}}$：

$$
\hat\pi_{nm}^t=\left[1+\frac{1-\lambda}{\lambda}\left(\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t+\beta_n^{\mathrm{DL}}\gamma_m^t+1\right)\exp\left(-\frac{(\gamma_m^t)^2\left(\alpha^2\beta_{1,n}\beta_2z_m^{t-1}+\beta_n^{\mathrm{DL}}\right)|r_{nm}^t|^2}{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t+\beta_n^{\mathrm{DL}}\gamma_m^t+1}\right)\right]^{-1},\tag{52}
$$

$$
\hat\mu_{nm}^t=\frac{\left(\alpha^2\beta_{1,n}\beta_2z_m^{t-1}+\beta_n^{\mathrm{DL}}\right)\gamma_m^t r_{nm}^t}{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t+\beta_n^{\mathrm{DL}}\gamma_m^t+1},\tag{53}
$$

$$
\hat\sigma_{nm}^t=\frac{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}+\beta_n^{\mathrm{DL}}}{\alpha^2\beta_{1,n}\beta_2z_m^{t-1}\gamma_m^t+\beta_n^{\mathrm{DL}}\gamma_m^t+1}.\tag{54}
$$

另一方面，期望对数后验的导数更为复杂。含直达链路时，（35）变为

$$
\sum_{n=1}^{N}\int\lim_{\epsilon\to0}\frac{d}{dz_m}\ln\left[\lambda\mathcal{CN}\!\left(x_{nm}|0,\alpha^2\beta_{1,n}\beta_2z_m+\beta_n^{\mathrm{DL}}\right)+(1-\lambda)\mathcal{CN}(x_{nm}|0,\epsilon)\right]\hat p(x_{nm}|\mathbf y_m,z_m^{t-1})\,dx_{nm}+\frac{d}{dz_m}\ln p(z_m).\tag{55}
$$

为记号简洁，记 $\zeta_n=\alpha^2\beta_{1,n}\beta_2z_m+\beta_n^{\mathrm{DL}}$。则（55）中的第一个微分算得为

$$
\lim_{\epsilon\to0}\frac{d}{dz_m}\frac{\lambda\mathcal{CN}(x_{nm}|0,\zeta_n)}{\lambda\mathcal{CN}(x_{nm}|0,\zeta_n)+(1-\lambda)\mathcal{CN}(x_{nm}|0,\epsilon)}=\lim_{\epsilon\to0}\frac{\lambda\mathcal{CN}(\cdot)}{\lambda\mathcal{CN}(\cdot)+(1-\lambda)\mathcal{CN}(x_{nm}|0,\epsilon)}\left(\frac{\alpha^2\beta_{1,n}\beta_2|x_{nm}|^2}{\zeta_n^2}-\frac{\alpha^2\beta_{1,n}\beta_2}{\zeta_n}\right).\tag{56}
$$

利用公共项 $\lambda\mathcal{CN}(x_{nm}|0,\zeta_n)$，（56）等价于

$$
\lim_{\epsilon\to0}\left(\frac{\alpha^2\beta_{1,n}\beta_2|x_{nm}|^2}{\zeta_n^2}-\frac{\alpha^2\beta_{1,n}\beta_2}{\zeta_n}\right)\times\frac{\lambda\mathcal{CN}(x_{nm}|0,\zeta_n)}{\lambda\mathcal{CN}(x_{nm}|0,\zeta_n)+(1-\lambda)\mathcal{CN}(x_{nm}|0,\epsilon)}=\begin{cases}\dfrac{\alpha^2\beta_{1,n}\beta_2|x_{nm}|^2}{\zeta_n^2}-\dfrac{\alpha^2\beta_{1,n}\beta_2}{\zeta_n},&x_{nm}\neq0,\\[2mm]0,&x_{nm}=0.\end{cases}\tag{57}
$$

把（57）代入（55），该式等价于

$$
\begin{aligned}
&\lim_{\epsilon\to0}\sum_{n=1}^{N}\int\left(\frac{\alpha^2\beta_{1,n}\beta_2|x_{nm}|^2}{\zeta_n^2}-\frac{\alpha^2\beta_{1,n}\beta_2}{\zeta_n}\right)\hat p(x_{nm}|\mathbf y_m,z_m^{t-1})\,dx_{nm}+\frac{d}{dz_m}\ln p(z_m)\\
&\quad=\frac{P-1}{z_m}-1+\sum_{n=1}^{N}\frac{\alpha^2\beta_{1,n}\beta_2\left[\hat\pi_{nm}^t|\hat\mu_{nm}^t|^2+\hat\pi_{nm}^t\hat\sigma_{nm}^t\right]}{\left(\alpha^2\beta_{1,n}\beta_2z_m+\beta_n^{\mathrm{DL}}\right)^2}-\sum_{n=1}^{N}\frac{\alpha^2\beta_{1,n}\beta_2}{\alpha^2\beta_{1,n}\beta_2z_m+\beta_n^{\mathrm{DL}}}.
\end{aligned}\tag{58}
$$

由于（58）是高次多项式，令其为零时不存在闭式根。但可用数值方法（如 MATLAB 中的 `fzero` 函数 [51]）获得近似根。`fzero` 所用 Brent 方法虽是数值方法，只要函数在区间端点处异号，其解质量即可保证 [52]。特别地，由介值定理，该迭代方法保证在区间内获得一个根。由于（58）在 $z_m=0$ 处为正、在 $z_m\to\infty$ 时为负，Brent 方法保证收敛到（53）的某个局部极大点。

### B. 未知噪声方差

在加性白高斯噪声方差 $\sigma_w^2$（为方便记为 $\phi$）未知的场景下，所提 EM 算法可扩展到在 M 步中估计其取值 [46]。为此，$\phi$ 的期望对数似然函数为

$$
\begin{aligned}
&\sum_{m=1}^{M}\int\ln p(\mathbf y_m|\mathbf x_m,\phi)\prod_{n=1}^{N}\hat p(x_{nm}|\mathbf y_m,z_m^{t-1},p_n^{t-1},\phi^{t-1})\,d\{x_{nm}\}_{n=1}^{N}\\
&\quad=-LM\ln\phi-\int\frac{\sum_{m=1}^{M}\|\mathbf y_m-\mathbf S\mathbf x_m\|^2}{\phi}\,d\{x_{nm}\}_{n=1}^{N}\\
&\quad=-LM\ln\phi-\frac{1}{\phi}\sum_{m=1}^{M}\left[\left\|\mathbf y_m-\sum_{n=1}^{N}\mathbf s_n\hat\pi_{nm}^t\hat\mu_{nm}^t\right\|^2+\sum_{n=1}^{N}\|\mathbf s_n\|^2\hat\pi_{nm}^t\hat\sigma_{nm}^t\right].
\end{aligned}\tag{59}
$$

对（59）关于 $\phi$ 求导并令其为零，最优 $\phi$ 应满足

$$
-\frac{LM}{\phi}+\frac{1}{\phi^2}\sum_{m=1}^{M}\left[\left\|\mathbf y_m-\sum_{n=1}^{N}\mathbf s_n\hat\pi_{nm}^t\hat\mu_{nm}^t\right\|^2+\sum_{n=1}^{N}\|\mathbf s_n\|^2\hat\pi_{nm}^t\hat\sigma_{nm}^t\right]=0.\tag{60}
$$

解出 $\phi$ 得

$$
\phi^t=\frac{1}{LM}\sum_{m=1}^{M}\left[\left\|\mathbf y_m-\sum_{n=1}^{N}\mathbf s_n\hat\pi_{nm}^t\hat\mu_{nm}^t\right\|^2+\sum_{n=1}^{N}\|\mathbf s_n\|^2\hat\pi_{nm}^t\hat\sigma_{nm}^t\right].\tag{61}
$$

把（61）加到算法 1 或算法 2 中更新 $\{z_m^t\}_{m=1}^{M}$ 之后，即可同时估计噪声方差。

## VII. 仿真结果

为评估所提 VG-AMP（含与不含一致活跃概率两种），我们将其与对 IRS 信道作高斯近似的 AMP 算法比较。具体地，虽然只有标准 AMP 被用于 IRS 辅助活跃检测 [26]、[27]，一旦对设备—IRS—基站复合信道作高斯近似，AMP 的其他变体或 SBL 也可使用。更具体地，比较以下采用高斯近似 IRS 信道的算法：

- 标准 AMP [26]、[27]；
- EM-AMP [44]：不使用任何先验分布而估计信道统计量；
- 带矢量去噪器的 AMP [12]：通过修改阈值函数，试图在 AMP 中利用一致的稀疏性；
- SBL [16]。

其中，标准 AMP [26]、[27] 使用 Bernoulli-Gaussian 先验（4），并假设设备活跃概率与信道统计量已知；EM-AMP [44] 则把它们视为未知，并用 EM 框架学习其取值。

仿真设置如下：IRS 辅助系统包含一台配备 $M=40$ 根天线的基站、一个具有 $P$ 个反射单元且反射幅度 $\alpha=1$ 的 IRS，以及 $N=200$ 个单天线潜在设备。IRS 到基站的距离 $d_2=50$ m，第 $n$ 个设备到 IRS 的距离均匀分布 $d_{1,n}\sim\mathcal U(0,500)$（米）。路损参考距离为 50 m，参考距离处的路损值在设备—IRS 之间为 20 dB、在 IRS—基站之间为 15 dB；设备—IRS 与 IRS—基站的路损指数分别设为 2 与 2.5 [26]。小尺度衰落假设为复高斯分布。设备最大发射功率设为 23 dBm，噪声功率为 −99 dBm。基于距离相关的路损进行功率控制，使基站处接收信噪比达到 10 dB。每个设备的活跃概率为 0.1，导频序列长度设为 $L=30$。图中每点为 $10^5$ 次仿真试验的平均。

### A. 直达链路被遮挡时的性能

图 3 与图 4 分别给出 $P=10$ 与 $P=1000$ 个反射单元时，通过设置不同活跃检测阈值 $\rho$ 得到的各方法漏检概率（PMD）对虚警概率（PFA）曲线。

由图 3 可见，所有基于近似高斯信道的方法性能都很差，原因是 $P$ 较小时复合信道的近似高斯分布不准确。相比之下，考虑复合信道精确统计的所提 VG-AMP 取得更低错误概率。特别地，把高斯信道近似的 EM-AMP 与 VG-AMP 比较可见，由精确信道模型得到的先验带来显著性能提升。此外，所提具有一致活跃概率的 VG-AMP 进一步显著降低错误概率；所提 VG-AMP 与一致活跃概率 VG-AMP 之间的差异，揭示了在所有天线上建模一致稀疏性的重要性。

图 4 表明，当反射单元数较大时，近似高斯信道结合各种现有算法的性能接近所提 VG-AMP。这是合理的：$P$ 较大时高斯分布接近复合信道的真实统计，与图 2 中 $z_m$ 的波动在 $P$ 超过 1000 时渐近消失的结果一致。此外，标准 AMP 算法可达与 SBL 相当的性能，这是因为 SBL 引入平均场（mean-field）假设，而这也是对后验分布的一种近似。另一方面，与图 3 一样，所提一致活跃概率 VG-AMP 因一致稀疏建模而明显优于其他方法。值得注意的是，虽然带矢量去噪器的 AMP 也考虑了公共稀疏模式，但由于其不可分离的矢量去噪器导致不收敛行为 [53]，其错误概率远高于所提一致活跃概率 VG-AMP。

为进一步考察近似高斯信道（3）在不同 $P$ 下的有效性，我们评估各方法在不同 IRS 反射单元数下的活跃检测精度。为描述活跃检测精度，比较 PMD 与 PFA 相等时（通过选择合适的检测阈值）的错误概率。图 5 表明，无论使用哪种算法，近似高斯信道模型在反射单元数较少时性能都很差；相比之下，所提 VG-AMP 算法（含/不含一致活跃概率）在很大范围的 $P$ 内提供稳定检测精度，使所提方法无论 IRS 配备多少反射单元都可适用。此外，VG-AMP 与一致活跃概率 VG-AMP 的对比表明，显式强制一致活跃概率可显著提升检测精度。

图 6 比较 $P=10$ 时不同基站天线数下的活跃检测性能。可以看到，基于近似高斯信道的方法错误率至少比所提 VG-AMP 差一个数量级，且该差距不随基站天线数增加而减小。此外，除一致活跃概率 VG-AMP 外，其他方案在增加天线时的检测性能提升缓慢；相反，配备一致活跃概率后，VG-AMP 的检测性能随基站天线数增加快速提升，表明在建模层面（而非最后用 LLR 一步处理）强制活跃状态一致所带来的好处。虽然带矢量去噪器的 AMP 也考虑公共稀疏模式，但其性能在更多天线时出现波动，甚至比标准 AMP 更差，原因是带矢量去噪器的 AMP 出现不收敛行为的概率随基站天线数增加 [53]。

图 7 给出 $P=10$ 时不同导频序列长度下各方法的性能。可以看到，所有方法的错误概率随导频序列长度增加而下降；值得注意的是，基于近似高斯信道的方法与 VG-AMP 之间的性能差距在所有导频长度下都保持。此外，利用精确信道统计与公共稀疏模式，所提一致活跃概率 VG-AMP 即使在短导频序列下也能取得很低错误概率，而其他 AMP 方法需要长得多的导频序列才能达到所提方法的性能。

图 8 在与图 7 相同设置下，以归一化均方误差（NMSE，即 $\sum_{n=1}^{N}\sum_{m=1}^{M}\|\hat h_{nm}-h_{nm}\|_2^2/\|h_{nm}\|_2^2$）评估各方法的信道估计性能。可以看到，凭借精确信道统计，所提 VG-AMP 与一致活跃概率 VG-AMP 的信道估计精度高于其他采用近似高斯信道的 AMP 类与 SBL 方法，提升超过一个数量级。此外，与图 3—7 的结果一致，所提一致活跃概率 VG-AMP 的估计误差低于 VG-AMP，说明学到的一致活跃概率使 AMP 迭代中的建模更准确，从而降低信道恢复误差。

图 3—8 是在 $\{\{\beta_{1,n}\}_{n=1}^{N},\beta_2\}$ 对所有 AMP 方法已知时得到的。实际中未必总能准确获知大尺度衰落系数；即使可以估计，估计误差也不可避免 [53]。为考察 $\{\{\beta_{1,n}\}_{n=1}^{N},\beta_2\}$ 不同扰动水平下的错误概率，我们给每个大尺度衰落系数加上独立的零均值高斯扰动（以 dB 计）。图 9 给出 $P=10$ 时错误概率随高斯扰动方差的变化。可以看到，所有方案的性能都受大尺度衰落系数不准确的影响；但与其他采用高斯信道近似的 AMP 类与 SBL 方案相比，所提方法仍保持最佳性能。

### B. 状态演化结果

图 10 在 $P=10$ 时比较所提两种算法与用（50）（51）计算的 SE 的信道估计 NMSE 随迭代次数的变化。为展示平均性能，图中给出 1000 次试验的平均 NMSE。可以看到，所提算法的信道估计性能被相应 SE 精确跟踪；此外，利用一致活跃概率的优势也被 SE 准确预测。这为“利用一致活跃性有助于显著改善联合活跃检测与信道估计性能”提供了另一理论证据。

### C. 含直达链路场景下的性能

图 11 在 $P=10$ 时比较不同比例设备具有直达链路时各方法的活跃检测性能。对于直达链路，参考距离处的路损值为 30 dB，路损指数为 5 [26]。具体地，对所提方法，我们评估算法 1 与 2 及其按第 VI 节加入直达链路的扩展。图 11 可见，当直达链路越多，基于近似高斯信道的方法错误概率越低，这是因为存在直达链路时复合信道更接近高斯分布。另一方面，未扩展以纳入直达链路的原始算法 1 与 2 的性能会因直达链路存在而下降；相反，经扩展纳入直达链路后，由于建模精确，所提算法在具有直达链路的设备比例增加时取得更低错误概率。

### D. 噪声估计性能

为评估两种所提算法中使用（61）的噪声估计性能，图 12 在 $P=10$ 时给出不同基站天线数下噪声方差估计的 NMSE。具体地，在高斯信道近似的基准方案 EM-AMP 中也加入噪声方差估计步骤。可以看到，虽然所有 AMP 方法的噪声方差估计性能都随天线数增加而改善，但凭借精确信道统计，所提 VG-AMP 比现有 EM-AMP 方法估计误差更低，从而在每根天线上获得更准确的估计。此外，由于一致活跃概率改善了 VG-AMP 的性能，它进一步降低了噪声方差估计误差。

## VIII. 结论

本文为 IRS 辅助 mMTC 系统建立了方差-Gamma 信道模型。利用设备—基站复合信道的精确分布，所提贝叶斯建模覆盖 IRS 具有任意反射单元数的场景。基于该模型，在 EM 框架下推导了 VG-AMP 算法，以联合检测设备活跃性并恢复对应信道。此外，针对现有基于 AMP 的方法忽略跨基站天线一致活跃概率的问题，进一步提出了具有一致活跃概率的 VG-AMP 算法。仿真结果表明，所提方差-Gamma 信道模型在很大的 IRS 尺寸范围内提供稳定检测精度，而近似高斯模型仅适用于反射单元数很多的场景；此外，通过在基站天线上强制一致的信道稀疏模式，所提一致活跃概率 VG-AMP 相比现有最优方法取得至少一个数量级的检测性能提升，且基站天线数越多该优势越明显。最后，结果还表明所提算法可方便地扩展到某些设备与基站之间存在直达链路的情形。

## 图注与表注

**图 1**：IRS 辅助网络模型。
**图 2**：不同 $P$ 取值下 $z_m$ 的分布。
**图 3**：$P=10$ 时不同方法的 PMD 随 PFA 的变化。
**图 4**：$P=1000$ 时不同方法的 PMD 随 PFA 的变化。
**图 5**：PMD$=$PFA 随 IRS 反射单元数的变化。
**图 6**：PMD$=$PFA 随基站天线数的变化。
**图 7**：PMD$=$PFA 随导频序列长度的变化。
**图 8**：信道估计 NMSE 随导频序列长度的变化。
**图 9**：PMD$=$PFA 随 $\beta$ 中扰动方差的变化。
**图 10**：信道估计 NMSE 与状态演化（SE）。
**图 11**：PMD$=$PFA 随具有直达链路的设备百分比的变化。
**图 12**：噪声方差估计 NMSE 随基站天线数的变化。

**表 I**：不同方法的复杂度量级。原表为三列（Method / Computational Complexity / Memory Complexity），已在本页第 V.F 节逐格转录；原文表内方法顺序为：标准 AMP [26], [27]、EM-AMP [44]、带矢量去噪器的 AMP [12]、SBL [16]、VG-AMP、一致活跃概率 VG-AMP。

## 参考文献

> 以下按原文编号 [1]—[53] 转录英文原书目，条目文字不翻译；抽取文本中的 “Y .” 等空格为 PDF 提取伪影，已按常规写法整理（如 “Y. Zhou”），书目内容未改动。

[1] S. Hu, F. Rusek, and O. Edfors, “Beyond massive MIMO: The potential of data transmission with large intelligent surfaces,” IEEE Trans. Signal Process., vol. 66, no. 10, pp. 2746–2758, May 2018, doi: 10.1109/TSP.2018.2816577.

[2] Y. Zhou et al., “Service-aware 6G: An intelligent and open network based on the convergence of communication, computing and caching,” Digit. Commun. Netw., vol. 6, no. 3, pp. 253–260, Aug. 2020, doi: 10.1016/j.dcan.2020.05.003.

[3] C.-W. Yau et al., “NB-IoT coverage and sensor node connectivity in dense urban environments: An empirical study,” ACM Trans. Sensor Netw., vol. 18, no. 3, pp. 1–36, Aug. 2022, doi: 10.1145/3536424.

[4] L. Liu, Y. Zhou, J. Yuan, W. Zhuang, and Y. Wang, “Economically optimal MS association for multimedia content delivery in cache-enabled heterogeneous cloud radio access networks,” IEEE J. Sel. Areas Commun., vol. 37, no. 7, pp. 1584–1593, Jul. 2019, doi: 10.1109/JSAC.2019.2916280.

[5] L. Liu, E. G. Larsson, W. Yu, P. Popovski, C. Stefanovic, and E. de Carvalho, “Sparse signal processing for grant-free massive connectivity: A future paradigm for random access protocols in the Internet of Things,” IEEE Signal Process. Mag., vol. 35, no. 5, pp. 88–99, Sep. 2018, doi: 10.1109/MSP.2018.2844952.

[6] Q. Lin, Y. Li, W.-B. Kou, T.-H. Chang, and Y.-C. Wu, “Communication-efficient activity detection for cell-free massive MIMO: An augmented model-driven end-to-end learning framework,” IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 12888–12903, Oct. 2024, doi: 10.1109/TWC.2024.3396798.

[7] Y. Li, Q. Lin, Y.-F. Liu, B. Ai, and Y.-C. Wu, “Asynchronous activity detection for cell-free massive MIMO: From centralized to distributed algorithms,” IEEE Trans. Wireless Commun., vol. 22, no. 4, pp. 2477–2492, Apr. 2023, doi: 10.1109/TWC.2022.3211967.

[8] Q. Lin, Y. Li, and Y.-C. Wu, “Sparsity constrained joint activity and data detection for massive access: A difference-of-norms penalty framework,” IEEE Trans. Wireless Commun., vol. 22, no. 3, pp. 1480–1494, Mar. 2023, doi: 10.1109/TWC.2022.3204786.

[9] Z. Wang, Y.-F. Liu, and L. Liu, “Covariance-based joint device activity and delay detection in asynchronous mMTC,” IEEE Signal Process. Lett., vol. 29, pp. 538–542, 2022, doi: 10.1109/LSP.2022.3144853.

[10] S. Haghighatshoar, P. Jung, and G. Caire, “Improved scaling law for activity detection in massive MIMO systems,” in Proc. IEEE Int. Symp. Inf. Theory (ISIT), Jun. 2018, pp. 381–385, doi: 10.1109/ISIT.2018.8437359.

[11] H. Iimori, T. Takahashi, K. Ishibashi, G. T. F. de Abreu, D. González G., and O. Gonsa, “Joint activity and channel estimation for extra-large MIMO systems,” IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 7253–7270, Sep. 2022, doi: 10.1109/TWC.2022.3157271.

[12] L. Liu and W. Yu, “Massive connectivity with massive MIMO—Part I: Device activity detection and channel estimation,” IEEE Trans. Signal Process., vol. 66, no. 11, pp. 2933–2946, Jun. 2018, doi: 10.1109/TSP.2018.2818082.

[13] Z. Chen, F. Sohrabi, and W. Yu, “Sparse activity detection for massive connectivity,” IEEE Trans. Signal Process., vol. 66, no. 7, pp. 1890–1904, Apr. 2018, doi: 10.1109/TSP.2018.2795540.

[14] J. Ahn, B. Shim, and K. B. Lee, “EP-based joint active user detection and channel estimation for massive machine-type communications,” IEEE Trans. Commun., vol. 67, no. 7, pp. 5178–5189, Jul. 2019, doi: 10.1109/TCOMM.2019.2907853.

[15] A. Rajoriya and R. Budhiraja, “Joint AMP-SBL algorithms for device activity detection and channel estimation in massive MIMO mMTC systems,” IEEE Trans. Commun., vol. 71, no. 4, pp. 2136–2152, Apr. 2023, doi: 10.1109/TCOMM.2023.3244225.

[16] C. Ji, J. Dai, H. Fu, and W. Xu, “Joint device activity detection and channel estimation for mMTC,” IEEE Internet Things J., vol. 11, no. 16, pp. 27232–27244, Aug. 2024, doi: 10.1109/JIOT.2024.3399562.

[17] H. Zhang, Q. Lin, Y. Li, L. Cheng, and Y.-C. Wu, “Activity detection for massive connectivity in cell-free networks with unknown large-scale fading, channel statistics, noise variance, and activity probability: A Bayesian approach,” IEEE Trans. Signal Process., vol. 72, pp. 942–957, 2024, doi: 10.1109/TSP.2024.3361090.

[18] E. Basar, M. Di Renzo, J. De Rosny, M. Debbah, M.-S. Alouini, and R. Zhang, “Wireless communications through reconfigurable intelligent surfaces,” IEEE Access, vol. 7, pp. 116753–116773, 2019, doi: 10.1109/ACCESS.2019.2935192.

[19] S. Abeywickrama, R. Zhang, and C. Yuen, “Intelligent reflecting surface: Practical phase shift model and beamforming optimization,” in Proc. ICC - IEEE Int. Conf. Commun. (ICC), Jun. 2020, pp. 1–6, doi: 10.1109/ICC40277.2020.9148961.

[20] Q. Wu and R. Zhang, “Intelligent reflecting surface enhanced wireless network via joint active and passive beamforming,” IEEE Trans. Wireless Commun., vol. 18, no. 11, pp. 5394–5409, Nov. 2019, doi: 10.1109/TWC.2019.2936025.

[21] Y. Yang, Y. Gong, and Y.-C. Wu, “Intelligent-reflecting-surface-aided mobile edge computing with binary offloading: Energy minimization for IoT devices,” IEEE Internet Things J., vol. 9, no. 15, pp. 12973–12983, Aug. 2022, doi: 10.1109/JIOT.2022.3173027.

[22] C. Huang, A. Zappone, G. C. Alexandropoulos, M. Debbah, and C. Yuen, “Reconfigurable intelligent surfaces for energy efficiency in wireless communication,” IEEE Trans. Wireless Commun., vol. 18, no. 8, pp. 4157–4170, Aug. 2019, doi: 10.1109/TWC.2019.2922609.

[23] C. Pan et al., “Intelligent reflecting surface aided MIMO broadcasting for simultaneous wireless information and power transfer,” IEEE J. Sel. Areas Commun., vol. 38, no. 8, pp. 1719–1734, Aug. 2020, doi: 10.1109/JSAC.2020.3000802.

[24] Z. Liu, Z. Li, Y. Gong, and Y.-C. Wu, “RIS-aided cooperative mobile edge computing: Computation efficiency maximization via joint uplink and downlink resource allocation,” IEEE Trans. Wireless Commun., vol. 23, no. 9, pp. 11535–11550, Sep. 2024, doi: 10.1109/TWC.2024.3382759.

[25] S. Xia and Y. Shi, “Intelligent reflecting surface for massive device connectivity: Joint activity detection and channel estimation,” in Proc. IEEE Int. Conf. Acoust., Speech Signal Process. (ICASSP), May 2020, pp. 5175–5179, doi: 10.1109/ICASSP40776.2020.9054415.

[26] M. Guo and M. C. Gursoy, “Joint activity detection and channel estimation for intelligent-reflecting-surface-assisted wireless IoT networks,” IEEE Internet Things J., vol. 10, no. 12, pp. 10207–10221, Jun. 2023, doi: 10.1109/JIOT.2023.3238972.

[27] M. Guo and M. C. Gursoy, “Sparse activity detection in intelligent reflecting surface assisted wireless networks,” in Proc. IEEE Int. Symp. Person Indoor Mobile Radio Commun. (PIMRC), Sep. 2021, pp. 543–548, doi: 10.1109/PIMRC50174.2021.9569626.

[28] H. Liu, X. Yuan, and Y.-J.-A. Zhang, “Matrix-calibration-based cascaded channel estimation for reconfigurable intelligent surface assisted multiuser MIMO,” IEEE J. Sel. Areas Commun., vol. 38, no. 11, pp. 2621–2636, Nov. 2020, doi: 10.1109/JSAC.2020.3007057.

[29] T. Lin, X. Yu, Y. Zhu, and R. Schober, “Channel estimation for IRS-assisted millimeter-wave MIMO systems: Sparsity-inspired approaches,” IEEE Trans. Commun., vol. 70, no. 6, pp. 4078–4092, Jun. 2022, doi: 10.1109/TCOMM.2022.3168876.

[30] H. Sun, L. Zhu, W. Mei, and R. Zhang, “Power-measurement-based channel autocorrelation estimation for IRS-assisted wideband communications,” IEEE Trans. Wireless Commun., vol. 24, no. 6, pp. 4647–4662, Jun. 2025, doi: 10.1109/TWC.2025.3543202.

[31] H. Sun, L. Zhu, W. Mei, and R. Zhang, “Power measurement-based channel estimation for IRS-enhanced wireless coverage,” IEEE Trans. Wireless Commun., vol. 23, no. 12, pp. 19183–19198, Dec. 2024, doi: 10.1109/TWC.2024.3480314.

[32] L. Zhou, J. Dai, W. Xu, and C. Chang, “Sparse channel estimation for intelligent reflecting surface assisted massive MIMO systems,” IEEE Trans. Green Commun. Netw., vol. 6, no. 1, pp. 208–220, Mar. 2022, doi: 10.1109/TGCN.2022.3146188.

[33] S. Xia, Y. Shi, Y. Zhou, and X. Yuan, “Reconfigurable intelligent surface for massive connectivity: Joint activity detection and channel estimation,” IEEE Trans. Signal Process., vol. 69, pp. 5693–5707, 2021, doi: 10.1109/TSP.2021.3115938.

[34] A. Goldsmith, Wireless Communications. Cambridge, U.K.: Cambridge Univ. Press, 2005, doi: 10.1017/CBO9780511841224.

[35] D. Li, “How many reflecting elements are needed for energy- and spectral-efficient intelligent reflecting surface-assisted communication,” IEEE Trans. Commun., vol. 70, no. 2, pp. 1320–1331, Feb. 2022, doi: 10.1109/TCOMM.2021.3128544.

[36] A. Zappone, M. Di Renzo, X. Xi, and M. Debbah, “On the optimal number of reflecting elements for reconfigurable intelligent surfaces,” IEEE Wireless Commun. Lett., vol. 10, no. 3, pp. 464–468, Mar. 2021, doi: 10.1109/LWC.2020.3034686.

[37] R. Gaunt, “Variance-gamma approximation via Stein’s method,” Electron. J. Probab., vol. 19, no. none, pp. 1–33, Jan. 2014, doi: 10.1214/ejp.v19-3020.

[38] G. Durisi, T. Koch, and P. Popovski, “Toward massive, ultrareliable, and low-latency wireless communication with short packets,” Proc. IEEE, vol. 104, no. 9, pp. 1711–1726, Sep. 2016, doi: 10.1109/JPROC.2016.2537298.

[39] Q.-U.-A. Nadeem, A. Kammoun, A. Chaaban, M. Debbah, and M.-S. Alouini, “Asymptotic max-min SINR analysis of reconfigurable intelligent surface assisted MISO systems,” IEEE Trans. Wireless Commun., vol. 19, no. 12, pp. 7748–7764, Dec. 2020, doi: 10.1109/TWC.2020.2986438.

[40] D. L. Donoho, A. Maleki, and A. Montanari, “Message-passing algorithms for compressed sensing,” Proc. Nat. Acad. Sci. USA, vol. 106, no. 45, pp. 18914–18919, Nov. 2009, doi: 10.1073/pnas.0909892106.

[41] H. Stark and J. Woods, Probab., Random Processes, Estimation Theory for Engineers. Prentice-Hall, 1986.

[42] T. J. Kozubowski, K. Podgórski, and I. Rychlik, “Multivariate generalized Laplace distribution and related random fields,” J. Multivariate Anal., vol. 113, pp. 59–72, Jan. 2013, doi: 10.1016/j.jmva.2012.02.010. [Online]. Available: https://www.sciencedirect.com/science/article/pii/S0047259X12000516

[43] C. M. Bishop and N. M. Nasrabadi, Pattern Recognition and Machine Learning, vol. 4. New York, NY, USA: Springer, 2006.

[44] M. Ke, Z. Gao, Y. Wu, X. Gao, and R. Schober, “Compressive sensing-based adaptive active user detection and channel estimation: Massive access meets massive MIMO,” IEEE Trans. Signal Process., vol. 68, pp. 764–779, 2020, doi: 10.1109/TSP.2020.2967175.

[45] F. R. Kschischang, B. J. Frey, and H.-A. Loeliger, “Factor graphs and the sum-product algorithm,” IEEE Trans. Inf. Theory, vol. 47, no. 2, pp. 498–519, Feb. 2001, doi: 10.1109/18.910572.

[46] J. P. Vila and P. Schniter, “Expectation-maximization Gaussian-mixture approximate message passing,” IEEE Trans. Signal Process., vol. 61, no. 19, pp. 4658–4672, Oct. 2013, doi: 10.1109/TSP.2013.2272287.

[47] U. S. Kamilov, S. Rangan, A. K. Fletcher, and M. Unser, “Approximate message passing with consistent parameter estimation and applications to sparse learning,” IEEE Trans. Inf. Theory, vol. 60, no. 5, pp. 2969–2985, May 2014, doi: 10.1109/TIT.2014.2309005.

[48] M. Bayati and A. Montanari, “The dynamics of message passing on dense graphs, with applications to compressed sensing,” IEEE Trans. Inf. Theory, vol. 57, no. 2, pp. 764–785, Feb. 2011, doi: 10.1109/TIT.2010.2094817.

[49] S. Rangan, P. Schniter, and A. K. Fletcher, “Vector approximate message passing,” IEEE Trans. Inf. Theory, vol. 65, no. 10, pp. 6664–6684, Oct. 2019, doi: 10.1109/TIT.2019.2916359.

[50] J. Ma and L. Ping, “Orthogonal AMP,” IEEE Access, vol. 5, pp. 2020–2033, 2017, doi: 10.1109/ACCESS.2017.2653119.

[51] D. Anderson, “Algorithms for minimization without derivatives,” IEEE Trans. Autom. Control, vol. AC-19, no. 5, pp. 632–633, Oct. 1974, doi: 10.1109/TAC.1974.1100629.

[52] R. P. Brent, Algorithms for Minimization Without Derivatives. North Chelmsford, MA, USA: Courier Corporation, 2013.

[53] A. Fengler, S. Haghighatshoar, P. Jung, and G. Caire, “Non-Bayesian activity detection, large-scale fading coefficient estimation, and unsourced random access with a massive MIMO receiver,” IEEE Trans. Inf. Theory, vol. 67, no. 5, pp. 2925–2951, May 2021, doi: 10.1109/TIT.2021.3065291.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；第 I 节（含 A 相关工作、B 主要贡献、组织结构与记号）；第 II 节（系统模型、高斯近似 AMP，式（1）—（13））；第 III 节（精确信道统计建模与 EM 框架，式（14）—（26））；第 IV 节（VG-AMP 推导，式（27）—（39）及算法 1）；第 V 节（一致活跃概率 VG-AMP，式（40）—（49）、算法 2、收敛与 SE 分析式（50）（51）、复杂度与表 I）；第 VI 节（直达链路与未知噪声方差扩展，式（52）—（61））；第 VII 节（仿真，图 3—12 的逐段结果）；第 VIII 节结论；图 1—12 图注；参考文献 [1]—[53] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②全部编号公式（1）—（61）均已录入，个别中间求导步骤（如（36）（56））按等价结果整理并已核对；③作者简介、卷首收稿日期/基金信息与 IEEE 版权声明未逐段翻译（本页范围段已说明）；④图内曲线未作数字化估读，仅转录正文给出的性能结论与设置。**qa_complete=false。**

{% endraw %}
