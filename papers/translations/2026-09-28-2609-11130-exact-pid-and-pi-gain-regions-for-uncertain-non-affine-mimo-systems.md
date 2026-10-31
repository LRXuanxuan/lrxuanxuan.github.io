---
layout: page
title: "不确定非仿射 MIMO 系统的精确 PID 与 PI 增益域｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-11130-exact-pid-and-pi-gain-regions-for-uncertain-non-affine-mimo-systems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/26682e24112600d7/) · [原文 arXiv](https://arxiv.org/abs/2609.11130) · [全部目录](/papers/catalog/)

# 不确定非仿射 MIMO 系统的精确 PID 与 PI 增益域

**原题：** Exact PID and PI Gain Regions for Uncertain Non-Affine MIMO Systems  
**作者：** Cheng Zhao（中国科学院数学与系统科学研究院，数学科学国家重点实验室，北京 100190）  
**版本：** arXiv:2609.11130v1（eess.SY），2026-09-10，原文 34 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–6 节（含 2.1–2.6、3.1–3.2、5.1–5.4 全部小节）、结论、图 1–2 图注、参考文献 [1]–[29]（英文原条目）按原文结构录入；原文无表格、无附录、无致谢段。第 5 节证明按原文结构逐小节译出主要论证与关键公式（(34)–(37)、(41)、(53) 等），部分长代数推导按原文逻辑概述。逐句逐式终校未做。

## 摘要

刻画所有能保证不确定非线性系统**一致指数调节**（uniform exponential regulation）的比例—积分—微分（proportional–integral–derivative，PID）增益，仍是一个基础性问题。现有结果大多只给出由某类特定 Lyapunov 构造导出的**充分条件**。本文针对两类具有 $m\ge2$ 个受控坐标与输入通道的非仿射多输入多输出（multi-input multi-output，MIMO）系统，给出**精确增益域**——它直接由在整个不确定性类上的一致调节性定义。对于 PID 控制下的二阶系统，我们分别刻画一个共同二次（common quadratic）内域与一个基于线性子类的外域；二者重合，从而在系统层面精确刻画 PID 增益域。对于 PI 控制下的一阶系统，借助不确定性边界上的线性族进行无损归约，并结合共同二次证书，得到精确 PI 域。这两个域都严格扩大现有充分域，PID 结果还给出序贯调参规则。一个含单参数不确定性的紧致线性族表明共同二次认证一般并非无损。这些结果确立了**端点重合**与**边界族等价**作为通向精确增益域的两条途径，并引出更广泛的问题：哪些非线性不确定性类允许此类刻画。

**关键词：** PID 与 PI 控制、不确定非仿射 MIMO 系统、鲁棒增益域、一致指数调节。

## 1 引言

比例—积分—微分（PID）控制及其常见的 PI、PD 变体，因其相对简单、易于实现，至今仍是工业自动化、机器人与航空航天中应用最广的反馈策略之一 [1]。由于闭环稳定性是实现各种性能目标的前提，PID 控制的广泛使用使可靠的增益选取成为兼具实践与理论重要性的问题。完整的镇定增益域不仅认证单个控制器，还揭示给定被控对象类的鲁棒性极限，并为面向性能的调参提供保稳域 [2, 3]。例如，$H_\infty$（最坏情形频率响应增益）准则可在这样的域上优化 [4]。经典极值搜索调参方法通常在搜索域内冻结闭环稳定的前提下分析，而经稳定性认证的策略学习方法要求整个时变策略序列始终保持认证 [5–8]。因此，一个锐利（尤其是精确）的镇定增益域为定义宽广的认证搜索域提供了基础，有助于在优化过程中保持闭环稳定而不排除潜在高性能控制器。

完整的镇定 PID 域刻画理论主要在**线性**对象上发展成熟，包括固定系统、区间族与时滞模型 [9–12]。密切相关的增益域问题与基本性能极限也在 PD 控制下的不确定随机非线性系统中得到研究 [13]。相应的线性 PID 理论主要依赖多项式、拟多项式、频域与参数空间方法 [14–20]。这些工具可给出完整镇定域或有限鲁棒稳定性检验；然而它们依赖闭环特征方程及其根分布，因而无法直接推广到一般非线性不确定性类。

对不确定非线性系统，Lyapunov、小增益、微分包含与 Lyapunov–Krasovskii 方法已取得大量进展，为具有结构不确定性、扩展 PID 反馈 [21]、随机扰动 [22]、输入或时变时滞 [23, 24] 以及采样数据实现 [25, 26] 的系统建立了全局或半全局调节、指数收敛与构造性 PID 设计。相关的反馈占优论证也为不确定平面非线性系统给出显式充分增益条件 [27]。

总体而言，现有针对不确定非线性系统的 PID 设计理论方法主要是**证书驱动**的：通常选取特定 Lyapunov 函数、比较估计、小增益论证或线性矩阵不等式（linear matrix inequality，LMI）表述，再导出充分增益条件。此类条件对控制器设计有用，但一般只认证所选构造能捕获的增益。即使对 Lyapunov 矩阵与辅助变量做优化，所得增益集往往仍是隐式的，并与某个既定证书类绑定。此外，证书层可行性问题的精确解未必能恢复内在的**系统级**增益域。因此未解决的问题是：直接以控制器增益与不确定性界来刻画所有能保证**每个**容许非线性系统一致指数调节的 PID 或 PI 增益，而不事先限制稳定性证书。这一系统级"全增益"问题对非仿射 MIMO 动力学尤为困难——此时既无共同特征方程，也无直接的标量稳定性判据。

我们通过**内—外策略**处理该问题：共同二次证书定义一个易处理的内域，而精心选取的线性检验族提供独立导出的必要条件，从而给出外域；二者分别刻画后，通过证明它们之间的间隙闭合来获得系统级精确性。对二阶 PID 类，记 $\Omega_{\mathrm{pid}}$ 为系统级增益域、$\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 为共同二次内域、$\Omega_{\mathrm{pid}}^{\mathrm{lin}}$ 为线性子类外域，该策略即

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{lin}}.
$$

对一阶 PI 类，同一原则通过无损的边界线性检验族与显式共同二次证书实现。两种构造给出完整增益域刻画的互补途径：PID 控制的**内—外端点重合**，与 PI 控制下的**边界线性等价**。相应 PI 域记为 $\Omega_{\mathrm{pi}}$ 与 $\Omega_{\mathrm{pi}}^{\mathrm{cq}}$。全文用 $\mathbb R_{>0}^r$ 表示分量严格为正的实 $r$ 维向量集合。

主要贡献把这两种精确性机制精确化：

**i）通过端点重合得到精确 PID 域。** 对二阶非仿射 MIMO 系统，我们独立且精确地刻画两个端点：共同二次内域被归约为关于 PID 增益与两个辅助标量的显式代数不等式；线性子类外域由精确的频域条件描述。尽管论证不同，对每个 $m\ge2$ 两端点重合：

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}=\Omega_{\mathrm{pid}}=\Omega_{\mathrm{pid}}^{\mathrm{lin}}.
$$

由此得到完整的系统级 PID 增益域：共同二次认证不丢失任何容许增益，线性子类也不丢失任何必要信息。对 $m=1$，两端点仍可精确刻画，但一般不同，给出系统级域的显式内、外界。

**ii）通过边界线性等价得到精确 PI 域。** 对一阶非仿射 MIMO 类，我们构造可数边界线性族，并证明对 $m\ge2$，一致指数调节该族等价于调节完整非线性不确定性类。把这一无损边界检验与显式共同二次 Lyapunov 函数结合，得到

$$
\Omega_{\mathrm{pi}}^{\mathrm{cq}}=\Omega_{\mathrm{pi}}=\left\{(k_p,k_i)\in\mathbb R_{>0}^2:\ k_i+Lk_p<bk_p^2\right\}.
$$

这通过不同于 PID 控制端点重合的机制建立了系统级精确性。

**iii）严格改进与结构性局限。** 精确 PID 与 PI 域严格扩大 [28] 中相应的充分域。对 PID 控制，新域包含了先前条件所排除的高增益缩放情形，并给出简单的序贯调参规则。我们进一步构造紧致的单参数线性族，其系统级 PID 增益域严格大于其共同二次域——因此共同二次无损性只是本文所考虑不确定性类的**结构性**性质，而非鲁棒稳定性的普遍特征。

全文其余部分组织如下：第 2 节发展二阶非仿射 MIMO 系统的精确 PID 增益域刻画，包括两个端点域、$m\ge2$ 时的重合及其调参含义；第 3 节建立一阶非仿射 MIMO 系统的边界线性等价与精确 PI 域；第 4 节给出线性反例，说明共同二次无损性并非普遍性质；第 5 节汇集 PID 与 PI 主要结果的证明，随后是结论。

**记号。** 对实或复向量 $v$，$\|v\|=(v^*v)^{1/2}$ 为其欧氏范数；对矩阵 $A$，同一记号表示诱导欧氏（谱或 2-）范数：

$$
\|A\|:=\sup_{v\ne0}\frac{\|Av\|}{\|v\|}=\sqrt{\lambda_{\max}(A^*A)}.
$$

上标 $\top$ 与 $*$ 分别表示转置与共轭转置。对实方阵 $A$，记 $\mathrm{Sym}(A):=(A+A^\top)/2$。符号 $\mathbb S^r$、$\mathbb S_+^r$、$\mathbb S_{++}^r$ 分别表示实对称 $r\times r$ 矩阵及其半正定、正定锥。对对称矩阵，$A\succeq B$（分别 $A\succ B$）表示 $A-B$ 半正定（分别正定），$\preceq$ 与 $\prec$ 含义相反。$\lambda_{\min}$ 与 $\lambda_{\max}$ 表示对称或 Hermitian 矩阵的最小、最大特征值。$I_r$ 为 $r\times r$ 单位阵，$0_{p\times q}$ 为 $p\times q$ 零矩阵，$0_r:=0_{r\times r}$；无下标的零块维数由其位置决定。$\mathrm{col}(v_1,\ldots,v_j)$ 表示纵向堆叠，$\mathrm{diag}(A_1,\ldots,A_j)$ 表示块对角矩阵。若矩阵全部特征值实部严格为负则称其为 Hurwitz 矩阵；若多项式全部零点如此则称其为 Hurwitz 多项式。最后，$\mathcal C^1(\mathbb R^p;\mathbb R^q)$ 表示从 $\mathbb R^p$ 到 $\mathbb R^q$ 的连续可微映射。

## 2 二阶非仿射 MIMO 系统的 PID 控制

本节研究二阶非仿射 MIMO 不确定性类在 PID 调节下的问题，目标是确定所有能保证在完整非线性类上一致指数调节的增益。我们首先直接以闭环轨迹定义系统级 PID 增益域；随后引入并刻画两个独立导出的端点域：共同二次内域与线性子类外域；在得到两端的仅含增益的描述后，证明它们对 $m\ge2$ 重合，从而得到精确的系统级 PID 增益域。标量情形单独讨论；最后把所得域与现有充分域比较，并导出简单的序贯 PID 调参规则。

### 2.1 问题表述与系统级 PID 增益域

对整数 $m\ge1$，考虑如下不确定二阶非仿射 MIMO 系统类：

$$
\dot x_1=x_2,\qquad \dot x_2=f(x_1,x_2,u),\qquad x_1,x_2,u\in\mathbb R^m, \tag{1}
$$

其中 $x_1$ 与 $x_2$ 分别表示广义位置与速度，$u$ 为控制输入，$f\in\mathcal C^1(\mathbb R^{3m};\mathbb R^m)$ 为未知非线性映射（不必关于 $u$ 仿射）。维数 $m$ 为受控坐标与输入通道数。在下述界约束下，该类涵盖耦合的二阶智能体以及具有状态相关非线性、跨通道耦合与静态输入非线性的多自由度力/力矩驱动系统。

我们采用标量增益 $k_p,k_i,k_d$ 的 PID 控制器：

$$
u(t)=k_pe(t)+k_i\int_0^te(s)\,ds+k_d\dot e(t),\qquad e(t)=y^*-x_1(t), \tag{2}
$$

其中 $y^*\in\mathbb R^m$ 为常值设定点。

对给定常数 $L_1,L_2,b>0$，令 $\mathcal F_{L_1,L_2,b}$ 为满足

$$
\left\|\frac{\partial f}{\partial x_1}\right\|\le L_1,\qquad\left\|\frac{\partial f}{\partial x_2}\right\|\le L_2,\qquad\mathrm{Sym}\left(\frac{\partial f}{\partial u}\right)\succeq bI_m \tag{3}
$$

的全部 $f\in\mathcal C^1(\mathbb R^{3m};\mathbb R^m)$ 构成的集合，其中 $\partial f/\partial x_i$（$i=1,2$）与 $\partial f/\partial u$ 为 $f$ 关于 $x_i$ 与 $u$ 的 $m\times m$ Jacobian 矩阵。写 $f=(f_1,\ldots,f_m)^\top$，其元素为

$$
\left[\frac{\partial f}{\partial x_i}\right]_{rs}=\frac{\partial f_r}{\partial(x_i)_s},\qquad\left[\frac{\partial f}{\partial u}\right]_{rs}=\frac{\partial f_r}{\partial u_s},\quad r,s=1,\ldots,m.
$$

式 (3) 中矩阵范数为上文定义的诱导 2-范数，且三个界在每一点 $(x_1,x_2,u)$ 成立。强单调性与强制性蕴含（见 [28] 中命题 4.1）：对每个 $f\in\mathcal F_{L_1,L_2,b}$ 与 $y^*\in\mathbb R^m$，存在唯一 $u^*$ 使 $f(y^*,0,u^*)=0$。

目标仅利用不确定性界 $(L_1,L_2,b)$ 选取 PID 增益，使每个容许闭环前向完备并一致指数收敛到调节平衡点。这自然引出如下系统级 PID 增益域定义：增益容许性直接由不确定性类中所有系统的闭环轨迹决定，而非由既定稳定性证书决定。全文为简化记号，省略增益域对维数 $m$ 与不确定性界的依赖。

**定义 1（系统级鲁棒 PID 增益域）。** 增益三元组 $(k_p,k_i,k_d)\in\mathbb R^3$（$k_i\ne0$）属于 $\Omega_{\mathrm{pid}}$，若存在仅依赖增益与不确定性界 $(L_1,L_2,b)$ 的常数 $M\ge1$ 与 $\lambda>0$，使得对每个 $f\in\mathcal F_{L_1,L_2,b}$、每个常值参考与每个初始条件，相应闭环解前向完备且满足

$$
\|z(t)\|\le Me^{-\lambda t}\|z(0)\|,\quad t\ge0, \tag{4}
$$

其中

$$
z=\mathrm{col}\left(\eta(t)-u^*/k_i,\ e(t),\ \dot e(t)\right),\qquad\eta(t)=\int_0^te(s)\,ds.
$$

集合 $\Omega_{\mathrm{pid}}$ 称为**系统级鲁棒 PID 增益域**。

**注 1。** 定义 1 中 $k_i\ne0$ 的限制不丢失任何容许 PID 增益。事实上，类 $\mathcal F_{L_1,L_2,b}$ 只通过偏导数约束 $f$，故任意常值加性扰动可吸收进 $f$ 而不改变不确定性界。因此在整个不确定性类上的鲁棒渐近调节要求积分作用；故每个容许增益三元组必满足 $k_i\ne0$，且 $u^*/k_i$ 有定义。

我们的主要目标是**精确**刻画 $\Omega_{\mathrm{pid}}$，即给出以 $(k_p,k_i,k_d)$ 与不确定性界 $(L_1,L_2,b)$ 表示的成员充要代数条件。与充分增益条件不同，精确刻画识别出所有能在整个不确定性类上保证一致指数调节的增益，从而显式给出给定不确定性界下的鲁棒性极限，并为面向性能的调参提供完整容许域。

直接获得这样的刻画很困难，因为容许动力学可能非线性且非仿射地依赖向量值状态与输入，并存在跨通道耦合；因此既无共同特征方程，也无直接标量稳定性判据。我们不对该非线性轨迹级集合直接进攻，而采用基于包含链

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{lin}}
$$

的内—外策略，其中 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 为共同二次内端点、$\Omega_{\mathrm{pid}}^{\mathrm{lin}}$ 为线性子类外端点（稍后定义）。

### 2.2 共同二次内域

我们先问一个**证书层**问题：哪些 PID 增益对由整族诱导矩阵构成的族存在**某个**共同二次 Lyapunov 函数？与基于给定二次型的构造不同，这在整族共同二次类上搜索。

值得指出，$\Omega_{\mathrm{pid}}$ 的非空性源自 [28]：该文用某个特定共同二次 Lyapunov 函数构造了包含于 $\Omega_{\mathrm{pid}}$ 的显式开、无界充分域。由于该构造未揭示其他证书能否容许额外增益，这促使我们确定存在共同二次证书的 PID 增益集合；该证书层问题为精确刻画系统级鲁棒 PID 增益域提供了易处理的第一步。

为表述该问题，先确定相关的**不确定闭环矩阵族**。考虑不确定性类的一个线性成员（在平衡点 $(y^*,0,u^*)$ 附近展开）：

$$
f(x_1,x_2,u)=D_1(x_1-y^*)+D_2x_2+\Theta(u-u^*),
$$

其中 $D_1,D_2,\Theta\in\mathbb R^{m\times m}$ 为该线性成员常值状态与输入 Jacobian。对 $k_i\ne0$，定义 $z:=\mathrm{col}(\eta-u^*/k_i,e,\dot e)$。利用 $x_1-y^*=-e$、$x_2=-\dot e$ 以及

$$
u-u^*=k_i\left(\eta-u^*/k_i\right)+k_pe+k_d\dot e,
$$

增广误差动力学变为

$$
\dot z=A(D_1,D_2,\Theta)z, \tag{5}
$$

其中

$$
A(D_1,D_2,\Theta):=\begin{bmatrix}0&I_m&0\\0&0&I_m\\-k_i\Theta D_1&-k_p\Theta D_2&-k_d\Theta\end{bmatrix}.
$$

对一般非线性函数 $f\in\mathcal F_{L_1,L_2,b}$，沿连接 $(y^*,0,u^*)$ 与 $(x_1,x_2,u)$ 的线段应用中值定理，可得同一表示 (5)，只是其中的**状态相关矩阵**满足

$$
\|D_j(z)\|\le L_j,\ j=1,2,\qquad\mathrm{Sym}(\Theta(z))\succeq bI_m.
$$

于是每个容许非线性闭环都逐点嵌入不确定矩阵族 $A(D_1,D_2,\Theta)$。该表示引出如下定义。

**定义 2（共同二次 PID 增益域）。** 增益三元组 $(k_p,k_i,k_d)\in\mathbb R^3$ 称为**共同二次容许**，若存在共同 $P=P^\top\succ0$（$P\in\mathbb R^{3m\times3m}$）与 $\alpha>0$ 使

$$
PA(D_1,D_2,\Theta)+A(D_1,D_2,\Theta)^\top P\preceq-\alpha I_{3m} \tag{6}
$$

对每个满足

$$
\|D_1\|\le L_1,\qquad\|D_2\|\le L_2,\qquad\mathrm{Sym}(\Theta)\succeq bI_m \tag{7}
$$

的 $D_1,D_2,\Theta\in\mathbb R^{m\times m}$ 成立。任何这样的 $P$ 称为**共同二次证书**。全部共同二次容许 PID 增益的集合记为 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$，称为**共同二次 PID 增益域**。

下述命题把该证书层概念与系统级 PID 域联系起来：每个共同二次容许 PID 增益都属于 $\Omega_{\mathrm{pid}}$。

**命题 1。** 每个共同二次容许 PID 增益三元组都保证不确定性类 $\mathcal F_{L_1,L_2,b}$ 上的一致指数调节 (4)。因此 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}$。

**证明。** 设 $P=P^\top\succ0$ 与 $\alpha>0$ 为共同二次证书及其一致衰减裕度。在 (6) 中取 $D_1=D_2=0$、$\Theta=bI_m$ 可见 $A(0,0,bI_m)$ 为 Hurwitz；其各通道特征多项式为

$$
s^3+bk_ds^2+bk_ps+bk_i.
$$

由 Routh–Hurwitz 判据得

$$
k_i>0,\quad k_p>0,\quad k_d>0,\quad bk_pk_d>k_i.
$$

特别地，(4) 中平移后的积分状态有定义。

固定任意容许非线性、常值参考与对象初始条件，写 $z=\mathrm{col}(z_0,z_1,z_2)$，$q:=k_iz_0+k_pz_1+k_dz_2$。上述逐段中值分解（与 [28] 定理 3.1 证明中用法类似）给出

$$
f(y^*-z_1,-z_2,u^*+q)=-D_1(z)z_1-D_2(z)z_2+\Theta(z)q, \tag{8}
$$

其中

$$
\|D_j(z)\|\le L_j,\ j=1,2,\qquad\mathrm{Sym}(\Theta(z))\succeq bI_m.
$$

因此增广误差动力学满足

$$
\dot z=A\left(D_1(z),D_2(z),\Theta(z)\right)z, \tag{9}
$$

且在每个闭环状态处都有容许的矩阵三元组。

对 $V(z):=z^\top Pz$，共同二次不等式给出

$$
\dot V\le-\alpha\|z\|^2\le-\frac{\alpha}{\lambda_{\max}(P)}V.
$$

于是 $\|z(t)\|\le Me^{-\lambda t}\|z(0)\|$，其中

$$
M:=\sqrt{\frac{\lambda_{\max}(P)}{\lambda_{\min}(P)}},\qquad\lambda:=\frac{\alpha}{2\lambda_{\max}(P)}.
$$

由于 $P$ 与 $\alpha$ 对整族矩阵共同成立，$M$ 与 $\lambda$ 与容许非线性、参考向量及初始条件无关，这证明了 (4)。最后，$f\in\mathcal C^1$ 使闭环向量场局部 Lipschitz，而前述估计阻止有限逃逸；标准延拓定理于是给出前向完备。■

命题 1 严格建立了包含 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}$，从而把 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 认定为系统级 PID 增益域的**共同二次内域**。然而其成员条件仍以半无限 LMI 隐式给出。下面精确刻画该内域：对 $m=1$，半无限条件无损地退化为四顶点 LMI 检验；对 $m\ge2$，Lyapunov 矩阵可被完全消去，得到以两个辅助标量表示的显式纯增益刻画。

对 $m=1$，令 $\mathcal V:=\{-1,1\}$ 为顶点符号集，并对 $s,t\in\mathcal V$ 定义

$$
A_{st}^{\mathrm{sc}}:=\begin{bmatrix}0&1&0\\0&0&1\\-bk_isL_1&-bk_ptL_2&-bk_d\end{bmatrix}. \tag{10}
$$

置 $e_3=[0\ 0\ 1]^\top$、$\kappa:=(k_i,k_p,k_d)^\top$。相应的**四顶点可行性条件**为

$$
\exists P_0=P_0^\top\succ0,\quad P_0e_3=\kappa,\quad P_0A_{st}^{\mathrm{sc}}+(A_{st}^{\mathrm{sc}})^\top P_0\prec0,\quad(s,t)\in\mathcal V^2. \tag{11}
$$

对 $m\ge2$ 的情形，令 $\mu,\rho\in(0,1)$ 并定义

$$
\Pi_{\mu,\rho}:=k_p^2-\frac{L_1^2}{4b^2\mu\rho(1-\mu)}, \tag{12}
$$

$$
\Delta_{\mu,\rho}:=k_d^2-\frac{k_p}{b(1-\mu)}-\frac{L_2^2}{4b^2\mu(1-\rho)(1-\mu)}. \tag{13}
$$

当 $(\mu,\rho)$ 固定且不引起混淆时，简记 $\Pi:=\Pi_{\mu,\rho}$、$\Delta:=\Delta_{\mu,\rho}$。下述定理给出标量与多变量两种情形下的精确共同二次域。

**定理 1（精确共同二次 PID 增益域）。** 精确共同二次 PID 增益域如下：

i）对标量系统 $m=1$，增益三元组属于 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 当且仅当其满足四顶点条件 (11)。

ii）对每个 $m\ge2$，

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}=\bigcup_{\mu,\rho\in(0,1)}\left\{(k_p,k_i,k_d)\in\mathbb R_{>0}^3\ \middle|\ \Pi_{\mu,\rho}>0,\ \Delta_{\mu,\rho}>0,\ k_i<\frac{\Pi_{\mu,\rho}}{2}\left(k_d-\sqrt{\Delta_{\mu,\rho}}\right)\right\}. \tag{14}
$$

值得说明：对 (14) 中每个增益，相应辅助参数满足 $0<\Delta_{\mu,\rho}<k_d^2$，故分母为正；此外，多变量域 (14) 中每个增益也满足标量四顶点条件。证明见第 5 节。

**注 2。** 定理 1 是证书层的无损消元结果：所有矩阵值证书变量与不确定性矩阵均已被消去。但它本身**不**蕴含 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 穷尽系统级域 $\Omega_{\mathrm{pid}}$；后者需要下面独立的外域分析。

### 2.3 线性子类外域

上一小节给出系统级域 $\Omega_{\mathrm{pid}}$ 的精确**内界**。为得到互补外界，现把完整非线性不确定性类限制到其容许线性子类：任何实现系统级鲁棒调节的增益都必须镇定该子类的每个成员。

**定义 3（线性子类 PID 增益域）。** 令 $\mathcal F_m^{\mathrm{lin}}$ 表示由满足 $\|D_1\|\le L_1$、$\|D_2\|\le L_2$、$\mathrm{Sym}(\Theta)\succeq bI_m$ 的矩阵生成的线性映射族 $f_{D_1,D_2,\Theta}(x_1,x_2,u):=D_1x_1+D_2x_2+\Theta u$。线性子类 PID 增益域定义为

$$
\Omega_{\mathrm{pid}}^{\mathrm{lin}}:=\left\{(k_p,k_i,k_d)\in\mathbb R^3:\ A(D_1,D_2,\Theta)\ \text{对每个}\ f_{D_1,D_2,\Theta}\in\mathcal F_m^{\mathrm{lin}}\ \text{为 Hurwitz}\right\}.
$$

由于 $\mathcal F_m^{\mathrm{lin}}\subseteq\mathcal F_{L_1,L_2,b}$，每个系统级容许增益必须调节线性子类的每个成员。更精确地，取 $y^*=0$，从而 $u^*=0$，并置

$$
\mathcal S_{\mathrm{pid}}:=\{0\}\times\mathbb R^m\times\mathbb R^m.
$$

对每个固定 $A=A(D_1,D_2,\Theta)$，系统级估计在 $\mathcal S_{\mathrm{pid}}$ 上成立。由于

$$
\mathcal S_{\mathrm{pid}}+A\mathcal S_{\mathrm{pid}}=\mathbb R^{3m},\qquad e^{At}A=Ae^{At},
$$

指数衰减可延拓到整个增广状态空间，因此 $A$ 为 Hurwitz。故 $\Omega_{\mathrm{pid}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{lin}}$。

下面以 PID 增益与不确定性界精确刻画该外近似。

**命题 2（精确线性子类 PID 增益域）。** 对 $m=1$，记 $\bar k_0=bk_i$、$\bar k_1=bk_p-L_1$、$\bar k_2=bk_d-L_2$，则

$$
\Omega_{\mathrm{pid}}^{\mathrm{lin}}=\left\{(k_p,k_i,k_d)\in\mathbb R_{>0}^3:\ \bar k_1>0,\ \bar k_1\bar k_2>\bar k_0\right\}. \tag{15}
$$

对 $m\ge2$，

$$
\Omega_{\mathrm{pid}}^{\mathrm{lin}}=\left\{(k_p,k_i,k_d)\in\mathbb R_{>0}^3:\ b\chi(\omega)-k_p\omega^4>(L_1\omega+L_2\omega^2)\sqrt{\chi(\omega)},\ \forall\omega>0\right\}, \tag{16}
$$

其中

$$
\chi(\omega):=(k_i-k_d\omega^2)^2+k_p^2\omega^2. \tag{17}
$$

证明见第 5 节。

### 2.4 端点重合与精确 PID 增益域

对 $m\ge2$，两个端点域经独立论证获得、且具有不同的精确描述：共同二次内域 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 由含两个辅助参数的代数不等式刻画，而线性子类外域 $\Omega_{\mathrm{pid}}^{\mathrm{lin}}$ 由对全部正频率的频域不等式描述。因此它们的重合先验上远非显然。

然而包含链 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{lin}}$ 表明：两端点相等将闭合内—外间隙并精确确定系统级域。下述定理说明情况确实如此。

**定理 2（端点重合与精确 PID 增益域）。** 对每个 $m\ge2$，三个增益域重合：

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}=\Omega_{\mathrm{pid}}=\Omega_{\mathrm{pid}}^{\mathrm{lin}}. \tag{18}
$$

证明见第 5 节。

**注 3。** 定理 2 与两端点域的精确刻画一起构成本文的**核心结果**，具有三个互补推论：第一，它给出系统级 PID 域 $\Omega_{\mathrm{pid}}$ 以 PID 增益与不确定性界 $(L_1,L_2,b)$ 表示的完整纯增益刻画；第二，每个能在完整非线性不确定性类上一致指数调节的增益都存在共同二次证书，因此共同二次认证在增益域层面是无损的；第三，镇定每个容许线性闭环矩阵足以保证完整非线性类的鲁棒调节，因此线性子类是无损外检验。

### 2.5 标量情形的端点间隙

上述重合是名副其实的**多变量**现象。为澄清定理 2 的适用范围，现转向标量情形 $m=1$：两个端点域仍可精确刻画（$\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 由 (11) 的四顶点 LMI，$\Omega_{\mathrm{pid}}^{\mathrm{lin}}$ 由 (15)），但内—外间隙不再闭合，如下所示。

**命题 3。** 对 $m=1$，

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subsetneq\Omega_{\mathrm{pid}}^{\mathrm{lin}}. \tag{19}
$$

**证明。** 包含 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{lin}}$ 直接由定义得到：共同二次证书使每个容许线性闭环矩阵为 Hurwitz。

为证严格性，设 $(k_p,k_i,k_d)\in\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。由定理 1，存在 $P_0=P_0^\top\succ0$ 满足 (11)。特别地，令

$$
Q_{++}:=-P_0A_{++}^{\mathrm{sc}}-(A_{++}^{\mathrm{sc}})^\top P_0\succ0,
$$

则归一化 $P_0e_3=(k_i,k_p,k_d)^\top$ 给出

$$
0<e_3^\top Q_{++}e_3=-2(P_0e_3)^\top A_{++}^{\mathrm{sc}}e_3=2\left[k_d(bk_d-L_2)-k_p\right]. \tag{20}
$$

故 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 中每个增益必满足

$$
k_d(bk_d-L_2)>k_p.
$$

现构造一个违反该条件的 $\Omega_{\mathrm{pid}}^{\mathrm{lin}}$ 中增益：取 $\epsilon_p,\epsilon_d>0$ 使 $\epsilon_d(L_2+\epsilon_d)<L_1+\epsilon_p$，并令

$$
k_p:=\frac{L_1+\epsilon_p}{b},\qquad k_d:=\frac{L_2+\epsilon_d}{b},\qquad k_i:=\frac{\epsilon_p\epsilon_d}{2b}.
$$

则 $\bar k_1=\epsilon_p$、$\bar k_2=\epsilon_d$、$\bar k_0=\frac{\epsilon_p\epsilon_d}{2}$，从而 $\bar k_1>0$、$\bar k_1\bar k_2>\bar k_0$，由命题 2 得 $(k_p,k_i,k_d)\in\Omega_{\mathrm{pid}}^{\mathrm{lin}}$。另一方面，

$$
bk_d(bk_d-L_2)=\epsilon_d(L_2+\epsilon_d)<L_1+\epsilon_p=bk_p,
$$

与必要条件 (20) 矛盾。故该增益不属于 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$，严格包含得证。■

**注 4。** 命题 3 与一般内—外包含一起给出

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{lin}},\qquad m=1.
$$

因此两个精确端点夹住但并未确定标量系统级 PID 域。

### 2.6 严格改进与序贯 PID 调参

现把上述精确系统级域与 Zhao 和 Guo [28] 的充分域比较。记其域为 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}$，由全部满足

$$
k_p^2>2k_ik_d+\bar k,\qquad k_d^2>k_p/b+\bar k \tag{21}
$$

的 $(k_p,k_i,k_d)\in\mathbb R_{>0}^3$ 组成，其中 $\bar k:=(L_1+L_2)(k_p+k_d)/b$。

**命题 4。** 对每个 $m\ge2$，

$$
\Omega_{\mathrm{pid}}^{\mathrm{ZG}}\subsetneq\Omega_{\mathrm{pid}}. \tag{22}
$$

此外，对每个 $c\in(0,b)$，存在 $T_c>0$ 使

$$
(t,ct^2,t)\in\Omega_{\mathrm{pid}}\setminus\Omega_{\mathrm{pid}}^{\mathrm{ZG}},\quad t\ge T_c. \tag{23}
$$

**证明。** 由定理 2，只需证 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}\subsetneq\Omega_{\mathrm{pid}}^{\mathrm{cq}}$，并证明关于 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 的相应高增益断言。

**包含。** 对 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}$ 中每个增益三元组，Zhao 和 Guo [28, 命题 4.2] 构造如下共同二次证书：

$$
P_{\mathrm{ZG}}^{(m)}:=\begin{bmatrix}2k_ik_pbI_m&2k_ik_dbI_m&k_iI_m\\2k_ik_dbI_m&(2k_pk_db-k_i)I_m&k_pI_m\\k_iI_m&k_pI_m&k_dI_m\end{bmatrix}.
$$

故 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。

**严格性。** 固定 $c\in(0,b)$，取 $0<\mu<1-c/b$ 与 $\rho\in(0,1)$，并置

$$
a_\mu:=\frac{1}{b(1-\mu)},\quad C_1:=\frac{L_1^2}{4b^2\mu\rho(1-\mu)},\quad C_2:=\frac{L_2^2}{4b^2\mu(1-\rho)(1-\mu)}.
$$

对 $(k_p,k_i,k_d)=(t,ct^2,t)$，定义

$$
\Pi(t):=t^2-C_1,\qquad\Delta(t):=t^2-a_\mu t-C_2.
$$

两者对充分大的 $t$ 都为正。(14) 中 $k_i$ 的容许上界为

$$
K_i(t):=\frac{\Pi(t)}{2}\left(t-\sqrt{\Delta(t)}\right).
$$

有理化给出

$$
\frac{2}{t-\sqrt{\Delta(t)}}=\frac{2(a_\mu t+C_2)}{t+\sqrt{\Delta(t)}}\longrightarrow a_\mu,\qquad\frac{K_i(t)}{t^2}\longrightarrow\frac{1}{a_\mu}=b(1-\mu)>c.
$$

因此对充分大的 $t$ 有 $ct^2<K_i(t)$，从而 $(t,ct^2,t)\in\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。

对域 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}$，$\bar k=2(L_1+L_2)t/b$，其第一个定义不等式将要求 $t^2>2ct^3+2(L_1+L_2)t/b$，这对充分大的 $t$ 不成立。故对充分大的 $t$ 有 $(t,ct^2,t)\in\Omega_{\mathrm{pid}}^{\mathrm{cq}}\setminus\Omega_{\mathrm{pid}}^{\mathrm{ZG}}$，这证明了 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}\subsetneq\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 及证书层的高增益断言；结合定理 2 的等式 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}=\Omega_{\mathrm{pid}}$ 即得 (22) 与 (23)。■

图 1 在固定 $k_i=0.5$ 的 $(k_p,k_d)$ 截面上说明了 (22) 的严格扩大：取 $L_1=L_2=5$、$b=1$ 时，精确域 $\Omega_{\mathrm{pid}}$ 远超出既有充分域 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}$，容许的 proportional 与 derivative 增益范围显著更宽。图中橙色区域为 [28] 导出的充分域 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}$，蓝色斜线区域为本文建立的精确域 $\Omega_{\mathrm{pid}}$，(21, 21) 处小圆圈标出既有域两条边界曲线的交点。

**注 5。** (23) 中的阈值 $c<b$ 是锐利的：沿该族，它恰好与对应 $D_1=D_2=0$、$\Theta=bI_m$ 的容许标称系统的 Routh–Hurwitz 条件一致。

$\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 的精确描述涉及对 $(\mu,\rho)$ 的二维搜索；平衡选取 $\mu=\rho=1/2$ 牺牲部分灵活性，换来一个透明的序贯调参规则。

**推论 1（简单的序贯 PID 调参规则）。** PID 增益可按如下顺序选取：

i）选取

$$
k_p>\frac{\sqrt{2}L_1}{b};
$$

ii）在固定 $k_p$ 后，选取

$$
k_d>\sqrt{\frac{2k_p}{b}+\frac{2L_2^2}{b^2}};
$$

iii）定义 $\Delta^*:=k_d^2-\frac{2k_p}{b}-\frac{2L_2^2}{b^2}$，并选取

$$
0<k_i<\frac{k_p^2-2L_1^2/b^2}{2}\left(k_d-\sqrt{\Delta^*}\right).
$$

该过程得到的每个增益三元组对每个 $m\ge2$ 都属于 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。

**证明。** 在 (12)、(13)、(14) 中取 $\mu=\rho=1/2$，则

$$
\Pi_{1/2,1/2}=k_p^2-\frac{2L_1^2}{b^2},\qquad\Delta_{1/2,1/2}=\Delta^*.
$$

三个条件恰为相应的正性与积分增益不等式。■

## 3 一阶非仿射 MIMO 系统的 PI 控制

上述 PID 结果通过闭合内—外间隙实现系统级精确性。一阶 PI 类呈现类似的精确性现象，但机制不同：必要性由边界线性检验族捕获，而充分性由共同二次证书给出。我们先定义相应的系统级与共同二次 PI 域，再建立边界线性等价与精确增益条件，最后把结果与既有充分域比较并讨论标量情形。

### 3.1 问题表述与系统级 PI 增益域

令 $m\ge1$，考虑一阶非仿射系统

$$
\dot x(t)=f(x(t),u(t)),\qquad x(t),u(t)\in\mathbb R^m, \tag{24}
$$

其中对给定常数 $L\ge0$、$b>0$，$\mathcal F_{L,b}$ 由全部满足（对每点 $(x,u)$）

$$
\left\|\frac{\partial f}{\partial x}\right\|\le L,\qquad\mathrm{Sym}\left(\frac{\partial f}{\partial u}\right)\succeq bI_m
$$

的 $f\in\mathcal C^1(\mathbb R^{2m};\mathbb R^m)$ 组成。这里 $\partial f/\partial x$ 与 $\partial f/\partial u$ 仍为 $m\times m$ Jacobian 矩阵，元素分别为 $\partial f_r/\partial x_s$ 与 $\partial f_r/\partial u_s$；范数为记号段规定的诱导 2-范数。对常值参考 $y^*\in\mathbb R^m$，施加 PI 控制器

$$
u(t)=k_pe(t)+k_i\int_0^te(s)\,ds,\qquad e(t)=y^*-x(t). \tag{25}
$$

置 $\eta(t):=\int_0^te(s)ds$，则 $\dot\eta=e$、$\eta(0)=0$。

对给定 $f\in\mathcal F_{L,b}$ 与 $y^*\in\mathbb R^m$，映射 $u\mapsto f(y^*,u)$ 强单调且强制，因此存在唯一零点 $u^*\in\mathbb R^m$；对任意 $k_i\ne0$ 的增益对，增广闭环平衡点为 $(x,\eta)=(y^*,u^*/k_i)$。

我们区分由轨迹定义的系统级 PI 域与其共同二次内域。以下定义引入这两个域。

**定义 4（系统级鲁棒 PI 增益域）。** 增益对 $(k_p,k_i)\in\mathbb R^2$（$k_i\ne0$）属于 $\Omega_{\mathrm{pi}}$，若存在仅依赖增益与不确定性界 $(L,b)$ 的常数 $M\ge1$ 与 $\lambda>0$，使得对每个 $f\in\mathcal F_{L,b}$、每个常值参考与每个初始条件，闭环解前向完备且满足

$$
\|z(t)\|\le Me^{-\lambda t}\|z(0)\|,\quad t\ge0, \tag{26}
$$

其中

$$
z(t):=\mathrm{col}\left(\eta(t)-u^*/k_i,\ e(t)\right),\qquad\eta(t):=\int_0^te(s)\,ds.
$$

集合 $\Omega_{\mathrm{pi}}$ 称为**系统级鲁棒 PI 增益域**。

为比较共同二次认证与系统级鲁棒性，定义

$$
A_{\mathrm{PI}}(D,\Theta):=\begin{bmatrix}0&I_m\\-k_i\Theta D&-k_p\Theta\end{bmatrix},\qquad D,\Theta\in\mathbb R^{m\times m}.
$$

**定义 5（共同二次 PI 增益域）。** 增益对 $(k_p,k_i)\in\mathbb R^2$ 称为**共同二次容许**，若存在 $P=P^\top\succ0$（$P\in\mathbb R^{2m\times2m}$）与常数 $\alpha>0$ 使

$$
PA_{\mathrm{PI}}(D,\Theta)+A_{\mathrm{PI}}(D,\Theta)^\top P\preceq-\alpha I_{2m}
$$

对任意满足 $\|D\|\le L$、$\mathrm{Sym}(\Theta)\succeq bI_m$ 的 $D,\Theta\in\mathbb R^{m\times m}$ 成立。任何这样的 $P$ 称为**共同二次证书**。全部共同二次容许 PI 增益的集合记为 $\Omega_{\mathrm{pi}}^{\mathrm{cq}}$，称为**共同二次 PI 增益域**。

与命题 1 相同的状态相关 Jacobian 论证表明每个共同二次证书都给出 $\mathcal F_{L,b}$ 上的一致指数调节，故可得 $\Omega_{\mathrm{pi}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pi}}$。

### 3.2 边界线性等价与精确 PI 增益域

为精确刻画 $\Omega_{\mathrm{pi}}$，我们构造一个**边界线性检验族**：其状态 Jacobian 与对称输入 Jacobian 达到不确定性界，而反对称输入分量可任意大。

对 $m\ge2$，定义

$$
J_2:=\begin{bmatrix}0&-1\\1&0\end{bmatrix},\qquad J_m:=\begin{bmatrix}J_2&0_{2\times(m-2)}\\0_{(m-2)\times2}&0_{m-2}\end{bmatrix}.
$$

对 $m=2$，上式中零维块不出现，故 $J_m=J_2$。令 $\mathbb N_0:=\{0,1,2,\ldots\}$，引入可数边界线性族

$$
\mathcal F_m^{\partial}:=\{f_\nu:\nu\in\mathbb N_0\},\qquad f_\nu(x,u):=Lx+(bI_m+\nu J_m)u. \tag{27}
$$

$\mathcal F_m^{\partial}$ 的每个成员都属于 $\mathcal F_{L,b}$，因为

$$
\left\|\partial f_\nu/\partial x\right\|=L,\qquad\mathrm{Sym}\left(\partial f_\nu/\partial u\right)=bI_m.
$$

因此 (27) 是非线性不确定性类 $\mathcal F_{L,b}$ 的子集，同时保留了一个无界的反对称方向。

包含 $\mathcal F_m^{\partial}\subseteq\mathcal F_{L,b}$ 只给出一个方向；非平凡的问题是：调节该边界族是否也能恢复完整的非线性增益域。为比较边界线性族与完整非线性类上的调节，引入如下术语：考虑系统 (24) 在 PI 控制器（增益 $(k_p,k_i)\in\mathbb R^2$、$k_i\ne0$）下。对任意子类 $\mathcal G\subseteq\mathcal F_{L,b}$，若存在与具体 $f\in\mathcal G$、参考与初始条件无关的常数 $M\ge1$、$\lambda>0$ 使 (26) 成立，则称该 PI 控制器**一致指数调节** $\mathcal G$。

**定理 3（边界线性等价与精确 PI 域）。** 设 $m\ge2$，则以下命题等价：

i）PI 控制器一致指数调节完整非线性类 $\mathcal F_{L,b}$；

ii）PI 控制器一致指数调节边界线性族 $\mathcal F_m^{\partial}$；

iii）增益满足

$$
k_p>0,\qquad k_i>0,\qquad k_i+Lk_p<bk_p^2. \tag{28}
$$

**注 6。** 定理 3 揭示两种不同的无损性：第一，命题 (i) 与 (ii) 的等价表明可数边界线性族 $\mathcal F_m^{\partial}$ 是**无损检验族**——在该族上的一致指数调节恰好恢复完整非线性不确定性类的增益域。这种边界归约原理令人联想到区间多项式的 Kharitonov 定理，尽管本文的等价涉及通过可数边界族对非线性 MIMO 类的一致指数调节。第二，(iii)⇒(i) 的证明为每个满足 (iii) 的增益对构造了共同二次证书；由于 (iii) 精确刻画 $\Omega_{\mathrm{pi}}$，这给出 $\Omega_{\mathrm{pi}}\subseteq\Omega_{\mathrm{pi}}^{\mathrm{cq}}$。与一般反向包含结合，得到

$$
\Omega_{\mathrm{pi}}^{\mathrm{cq}}=\Omega_{\mathrm{pi}}=\left\{(k_p,k_i)\in\mathbb R_{>0}^2:\ k_i+Lk_p<bk_p^2\right\}. \tag{29}
$$

因此无损性出现在两个不同层面：$\mathcal F_m^{\partial}$ 作为非线性不确定性类的检验族是无损的，而共同二次类作为系统级 PI 增益域的证书类是无损的。

**注 7。** 对 $m\ge2$，定理 3 中的精确条件通过去掉附加项 $L^2/(4b)$ 改进了 [28] 的充分条件：如图 2 所示，对每个固定 $k_p$，$k_i$ 的容许上界增加 $L^2/(4b)$。对 $m=1$，同一共同二次充分性构造仍然有效，而容许线性系统 $f(x,u)=Lx+bu$ 给出必要条件 $bk_p>L$。因此

$$
\left\{(k_p,k_i)\in\mathbb R_{>0}^2:\ k_i+Lk_p<bk_p^2\right\}\subseteq\Omega_{\mathrm{pi}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pi}}\subseteq\left\{(k_p,k_i)\in\mathbb R_{>0}^2:\ bk_p>L\right\}.
$$

最外集合是 [28] 得到的精确逐点鲁棒 PI 域。由于逐点渐近调节弱于一致指数调节，这些包含关系夹住但并未确定标量系统级 PI 增益域。

## 4 共同二次无损性的范围与局限

上述 PID 与 PI 结果表明，对前面考虑的两个非线性不确定性类且 $m\ge2$ 时，共同二次认证是无损的：

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}=\Omega_{\mathrm{pid}},\qquad\Omega_{\mathrm{pi}}^{\mathrm{cq}}=\Omega_{\mathrm{pi}}.
$$

然而这种无损性是那些不确定性类的**特定**性质。如下例所示，即便区间紧致上的单参数线性族，其系统级 PID 增益域也可严格大于相应共同二次域。

固定 $L>0$，考虑二阶线性族

$$
\dot x_1=x_2,\qquad\dot x_2=ax_2+u, \tag{30}
$$

其中 $x_1,x_2,u\in\mathbb R$，$a\in[0,L]$ 为未知但时不变的参数。施加 PID 控制器 (2)。由于常值参考对应的平衡输入为零，增广误差状态 $z=\mathrm{col}(\eta,e,\dot e)$ 满足

$$
\dot z=A(a)z,\qquad A(a):=\begin{bmatrix}0&1&0\\0&0&1\\-k_i&-k_p&a-k_d\end{bmatrix}. \tag{31}
$$

对该族，令 $R_{\mathrm{sys}}(L)$ 表示在全部固定 $a\in[0,L]$ 上一致满足定义 1 中一致指数要求的 PID 增益集合，并令

$$
R_{\mathrm{cq}}(L):=\left\{(k_p,k_i,k_d):\ \exists P\succ0\ \text{使}\ \forall a\in[0,L],\ PA(a)+A(a)^\top P\prec0\right\}
$$

表示其共同二次 PID 增益域。

**命题 5。** 对每个 $L>0$，

$$
R_{\mathrm{cq}}(L)\subsetneq R_{\mathrm{sys}}(L). \tag{32}
$$

**证明。** 包含 $R_{\mathrm{cq}}(L)\subseteq R_{\mathrm{sys}}(L)$ 直接由 Lyapunov 不等式得到：固定共同 $P\succ0$ 时，$[0,L]$ 的紧致性与 $A(a)$ 的连续性给出 $-(PA(a)+A(a)^\top P)$ 的一致正裕度，从而一致指数衰减。

只需证严格性。考虑增益三元组

$$
(k_p,k_i,k_d)=\left(\frac{3}{2}L^2,\ \frac{5}{2}L^3,\ 3L\right). \tag{33}
$$

对任意 $a\in[0,L]$，$A(a)$ 的特征多项式为

$$
p_a(s)=s^3+(3L-a)s^2+\frac{3}{2}L^2s+\frac{5}{2}L^3.
$$

其全部系数为正，且

$$
(3L-a)\frac{3}{2}L^2\ge3L^3>\frac{5}{2}L^3.
$$

由 Routh–Hurwitz 判据，$A(a)$ 对每个 $a\in[0,L]$ 为 Hurwitz。由于矩阵族连续、不确定性区间紧致，相应半群具有一致常数 $M\ge1$ 与 $\lambda>0$，故增益三元组 (33) 属于 $R_{\mathrm{sys}}(L)$。

下面证明同一三元组不属于 $R_{\mathrm{cq}}(L)$。令 $A_0:=A(0)$、$A_L:=A(L)$，直接计算给出

$$
\det(\mu I_3-A_LA_0)=\frac{1}{4}(\mu+L^2)\left(4\mu^2-16L^2\mu-25L^4\right). \tag{34}
$$

因此 $A_LA_0$ 具有负实特征值 $-L^2$。取相应非零实特征向量 $v$ 并置 $w:=A_0v$。若存在共同 $P=P^\top\succ0$，则对 $A_0$ 的 Lyapunov 不等式给出 $2v^\top PA_0v=2v^\top Pw<0$，故 $v^\top Pw<0$；另一方面，由 $A_Lw=A_LA_0v=-L^2v$，对 $A_L$ 的 Lyapunov 不等式将要求

$$
0>2w^\top PA_Lw=-2L^2w^\top Pv>0,
$$

矛盾。因此端点对不存在共同二次 Lyapunov 矩阵，从而整个区间也不存在。故 $(3L^2/2,5L^3/2,3L)\in R_{\mathrm{sys}}(L)\setminus R_{\mathrm{cq}}(L)$，命题得证。■

因此，上文建立的共同二次域与系统级域之间的重合是两类非线性不确定性类的结构性性质，而不是紧致参数族上鲁棒稳定性的自动推论。

## 5 主要结果的证明

本节按主要结果的结构组织：先建立精确共同二次 PID 刻画，再导出精确线性子类外域，二者的重合闭合 PID 内—外间隙；最后证明边界线性等价与精确 PI 刻画。

### 5.1 共同二次 PID 刻画

定理 1 的证明以两个结构归约开始：第一个说明不确定性类的各向同性使证书的 Kronecker 形式无损；第二个导出增益的正性并给出固定归约证书最后一列的正规化。

**引理 1。** 增益三元组共同二次容许，当且仅当 (6) 存在形如 $P_0\otimes I_m$ 的证书，其中 $P_0=P_0^\top\succ0$ 属于 $\mathbb R^{3\times3}$。这里 $\otimes$ 表示 Kronecker 积：若 $A=(a_{ij})$，则 $A\otimes B$ 为 $(i,j)$ 块为 $a_{ij}B$ 的块矩阵；特别地，$P_0\otimes I_m$ 的 $(i,j)$ 块为 $(P_0)_{ij}I_m$。

**证明。** 只需证必要性。设 $P=P^\top\succ0$ 为任意具有裕度 $\alpha>0$ 的证书，并令 $\mathcal G_m^\pm$ 表示符号置换群

$$
\mathcal G_m^\pm:=\left\{E_\epsilon P:\ E_\epsilon=\mathrm{diag}(\epsilon_1,\ldots,\epsilon_m),\ \epsilon_j\in\{-1,1\},\ P\ \text{为}\ m\times m\ \text{置换矩阵}\right\}.
$$

等价地，每个 $U\in\mathcal G_m^\pm$ 在每行每列恰有一个非零元，该元为 $1$ 或 $-1$；故 $\mathcal G_m^\pm$ 是正交群的有限子群，$U^\top U=I_m$、$|\mathcal G_m^\pm|=2^mm!$。对 $U\in\mathcal G_m^\pm$ 置 $T_U:=I_3\otimes U$。

不确定性集在如下同时共轭下不变：

$$
(D_1,D_2,\Theta)\longmapsto\left(UD_1U^\top,UD_2U^\top,U\Theta U^\top\right),
$$

且相应闭环矩阵满足

$$
A(UD_1U^\top,UD_2U^\top,U\Theta U^\top)=T_UA(D_1,D_2,\Theta)T_U^\top.
$$

把不等式对共轭后的不确定性三元组应用、再用 $T_U$ 共轭，可知 $T_U^\top PT_U$ 也是具有裕度 $\alpha$ 的证书。因此群平均

$$
\bar P:=\frac{1}{|\mathcal G_m^\pm|}\sum_{U\in\mathcal G_m^\pm}T_U^\top PT_U
$$

正定且仍为同裕度证书。群性质还给出 $T_U^\top\bar PT_U=\bar P$ 对所有 $U\in\mathcal G_m^\pm$ 成立。把 $\bar P$ 写成 $m\times m$ 块：在坐标符号变化下的不变性迫使每块为对角阵，而在坐标置换下的不变性迫使各对角元相等；故每块都是 $I_m$ 的标量倍，即 $\bar P=P_0\otimes I_m$，其中 $P_0=P_0^\top\succ0$。逆命题显然。■

引理 1 表明把证书限制为 $P_0\otimes I_m$ 不丢失容许增益。下一引理说明可行性还迫使增益为正，并允许对 $P_0$ 作有用归一化。

**引理 2。** 若 $(k_p,k_i,k_d)\in\Omega_{\mathrm{pid}}^{\mathrm{cq}}$，则

$$
k_i>0,\quad k_p>0,\quad k_d>0,\quad bk_pk_d>k_i.
$$

此外存在证书 $P_0\otimes I_m$ 使

$$
P_0(0,0,1)^\top=(k_i,k_p,k_d)^\top.
$$

**证明。** 首先，如命题 1 证明中所见，标称取法 $D_1=D_2=0$、$\Theta=bI_m$ 结合 Routh–Hurwitz 判据给出 $k_i,k_p,k_d>0$ 与 $bk_pk_d>k_i$。由引理 1 存在证书 $P_0\otimes I_m$（$P_0=P_0^\top\succ0$，具有某裕度 $\alpha>0$）。下面对该证书作归一化。记 $e_3=(0,0,1)^\top$、$\kappa=(k_i,k_p,k_d)^\top$，并置 $p:=P_0e_3$。对 $\tau\ge0$ 取 $D_1=D_2=0$、$\Theta=(b+\tau)I_m$，鲁棒不等式变为

$$
\left[H_b-\tau\left(p\kappa^\top+\kappa p^\top\right)\right]\otimes I_m\preceq-\alpha I_{3m},\qquad\tau\ge0,
$$

其中

$$
A_b:=\begin{bmatrix}0&1&0\\0&0&1\\-bk_i&-bk_p&-bk_d\end{bmatrix},\qquad H_b:=P_0A_b+A_b^\top P_0
$$

与 $\tau$ 无关。因此必有 $p\kappa^\top+\kappa p^\top\succeq0$，否则沿该矩阵的负方向取值会与上述不等式对充分大 $\tau$ 矛盾。

由于 $\kappa\ne0$，最后的半正定条件蕴含 $p=c\kappa$（某 $c\ge0$）。为看清这一点，写 $p=c\kappa+r$，其中 $r^\top\kappa=0$；若 $r\ne0$，则 $p\kappa^\top+\kappa p^\top$ 在 $\mathrm{span}\{\kappa,r\}$ 上的限制具有负行列式，这对半正定矩阵不可能。故 $r=0$，且半正定性又给出 $c\ge0$。进一步，

$$
e_3^\top p=e_3^\top P_0e_3>0,\qquad e_3^\top\kappa=k_d>0,
$$

故 $c>0$。定义 $\bar P_0:=c^{-1}P_0$，它是另一共同二次证书（裕度 $\alpha/c$）且满足 $\bar P_0e_3=\kappa$。■

**注 8。** 上述引理大幅简化证书可行性问题：引理 1 把搜索从 $P\in\mathbb S_{++}^{3m}$ 无损限制到 $P_0\in\mathbb S_{++}^3$，而引理 2 给出

$$
P_0=\begin{bmatrix}p_{11}&p_{12}&k_i\\p_{12}&p_{22}&k_p\\k_i&k_p&k_d\end{bmatrix}.
$$

因此在固定 PID 增益后，只剩 $p_{11},p_{12},p_{22}$ 需要消去。对 $m\ge2$，秩二 Gram 归约与极小极大论证精确完成该消元，并给出 (14) 中的辅助标量 $\mu$ 与 $\rho$——它们源于归约本身而非 $P_0$ 的先验参数化。唯一需要 $m\ge2$ 的步骤是秩二 Gram 可实现性。

**定理 1 的证明。** 置 $\kappa:=(k_i,k_p,k_d)^\top$ 与

$$
F:=\begin{bmatrix}0&1&0\\0&0&1\\0&0&0\end{bmatrix}.
$$

**第 I 部分：$m=1$ 的精确刻画。** 对 $m=1$，证明 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 的成员资格等价于 (11)。

先设 $(k_p,k_i,k_d)\in\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。由引理 2，增益为正且可归一化证书使 $P_0e_3=\kappa$。对容许标量 $d_1,d_2,\theta$ 定义

$$
A^{\mathrm{sc}}(d_1,d_2,\theta):=\begin{bmatrix}0&1&0\\0&0&1\\-\theta k_i&d_1-\theta k_p&d_2-\theta k_d\end{bmatrix}
$$

与 $Q(d_1,d_2,\theta):=-P_0A^{\mathrm{sc}}(d_1,d_2,\theta)-A^{\mathrm{sc}}(d_1,d_2,\theta)^\top P_0$。由于

$$
A^{\mathrm{sc}}(d_1,d_2,\theta)=A^{\mathrm{sc}}(d_1,d_2,b)-(\theta-b)e_3\kappa^\top,
$$

归一化 $P_0e_3=\kappa$ 给出

$$
Q(d_1,d_2,\theta)=Q(d_1,d_2,b)+2(\theta-b)\kappa\kappa^\top. \tag{35}
$$

因此 $\theta=b$ 是最不利取值。在 $\theta=b$ 时 $Q(d_1,d_2,b)$ 关于 $(d_1,d_2)$ 仿射；$[-L_1,L_1]\times[-L_2,L_2]$ 的每一点都是其四个顶点的凸组合，故对全部容许 $(d_1,d_2)$ 的正性等价于

$$
-\left(P_0A_{st}^{\mathrm{sc}}+(A_{st}^{\mathrm{sc}})^\top P_0\right)\succ0,\qquad(s,t)\in\mathcal V^2.
$$

于是 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$ 中每个增益满足 (11)。

反之，设 $\mathbb R^3$ 中三元组满足 (11)，$P_0$ 为相应四顶点证书。定义顶点平均

$$
A_b:=\begin{bmatrix}0&1&0\\0&0&1\\-bk_i&-bk_p&-bk_d\end{bmatrix}=\frac{1}{4}\sum_{(s,t)\in\mathcal V^2}A_{st}^{\mathrm{sc}}.
$$

对四个严格 LMI 取平均得 $P_0A_b+A_b^\top P_0\prec0$，故 $A_b$ 为 Hurwitz；其特征多项式为 $s^3+bk_ds^2+bk_ps+bk_i$，由 Routh–Hurwitz 判据得 $k_i,k_p,k_d>0$ 与 $bk_pk_d>k_i$。因此正性是四顶点条件的推论而非额外假设。再置

$$
\alpha_1:=\min_{(s,t)\in\mathcal V^2}\lambda_{\min}\left(-P_0A_{st}^{\mathrm{sc}}-(A_{st}^{\mathrm{sc}})^\top P_0\right)>0.
$$

由凸性与 (35) 得 $Q(d_1,d_2,\theta)\succeq\alpha_1I_3$ 对所有 $|d_j|\le L_j$ 与 $\theta\ge b$ 成立。于是 $P_0$ 满足一致鲁棒矩阵不等式，该增益属于 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$，标量等价得证。

**第 II 部分：显式多变量条件的充分性。** 设 $(k_p,k_i,k_d)$ 满足 (14) 右端条件。选取相应 $\mu,\rho\in(0,1)$ 并置

$$
\sigma:=2b(1-\mu),\quad\epsilon_1:=2b\mu\rho,\quad\epsilon_2:=2b\mu(1-\rho),
$$

则 $\sigma+\epsilon_1+\epsilon_2=2b$。令

$$
A_0:=\sigma\left(k_p^2-2k_ik_d\right)-\frac{L_1^2}{\epsilon_1}=\sigma\left(\Pi_{\mu,\rho}-2k_ik_d\right),
$$

$$
C_0:=\sigma k_d^2-2k_p-\frac{L_2^2}{\epsilon_2}=\sigma\Delta_{\mu,\rho}.
$$

(14) 的定义不等式给出 $C_0>0$ 与 $A_0+2k_i\sqrt{\sigma C_0}>0$，故可取 $\xi\in\mathbb R$ 使

$$
\max\left\{-\frac{A_0}{2},-k_i\sqrt{\sigma C_0}\right\}<\xi<k_i\sqrt{\sigma C_0}. \tag{36}
$$

定义

$$
P_0:=\begin{bmatrix}\sigma k_ik_p&\sigma k_ik_d-\xi&k_i\\\sigma k_ik_d-\xi&\sigma k_pk_d-k_i&k_p\\k_i&k_p&k_d\end{bmatrix},
$$

置 $P:=P_0\otimes I_m$，则 $P_0e_3=\kappa$。对每个容许三元组与 $z=\mathrm{col}(z_0,z_1,z_2)$，令 $q:=(\kappa^\top\otimes I_m)z$，并置 $Q_b:=-(P_0F+F^\top P_0)+2b\kappa\kappa^\top$。由 $P_0e_3=\kappa$ 得恒等式

$$
-z^\top\left[PA(D_1,D_2,\Theta)+A(D_1,D_2,\Theta)^\top P\right]z
=z^\top(Q_b\otimes I_m)z+2q^\top\left(\mathrm{Sym}(\Theta)-bI_m\right)q-2q^\top D_1z_1-2q^\top D_2z_2.
$$

对后两项用 Young 不等式并利用 $\mathrm{Sym}(\Theta)\succeq bI_m$ 得

$$
-2q^\top D_jz_j\ge-\epsilon_j\|q\|^2-\frac{L_j^2}{\epsilon_j}\|z_j\|^2,\qquad j=1,2,
$$

从而

$$
-z^\top\left[PA(D_1,D_2,\Theta)+A(D_1,D_2,\Theta)^\top P\right]z\ge z^\top(\hat Q\otimes I_m)z, \tag{37}
$$

其中

$$
\hat Q:=\begin{bmatrix}\sigma k_i^2&0&\xi\\0&A_0+2\xi&0\\\xi&0&C_0\end{bmatrix}.
$$

由 (36)，$A_0+2\xi>0$ 且 $\xi^2<\sigma k_i^2C_0$，故 $\hat Q\succ0$。

还需验证 $P_0\succ0$。由 $k_d^2-\Delta_{\mu,\rho}\ge k_p/[b(1-\mu)]$ 得

$$
k_d-\sqrt{\Delta_{\mu,\rho}}=\frac{k_d^2-\Delta_{\mu,\rho}}{k_d+\sqrt{\Delta_{\mu,\rho}}}>\frac{k_p}{2bk_d}.
$$

于是 $2bk_pk_d(k_d-\sqrt{\Delta_{\mu,\rho}})>k_p^2>\Pi_{\mu,\rho}$；结合 $k_i$ 的上界得 $k_i<bk_pk_d$，故 $s^3+bk_ds^2+bk_ps+bk_i$ 为 Hurwitz。令 $A_b:=(F-be_3\kappa^\top)\otimes I_m$、$Q_b^{\mathrm{nom}}:=-(PA_b+A_b^\top P)$；在 (37) 中取 $D_1=D_2=0$、$\Theta=bI_m$ 得 $Q_b^{\mathrm{nom}}\succeq\hat Q\otimes I_m\succ0$。由于 $A_b$ 为 Hurwitz，Lyapunov 方程唯一性给出

$$
P=\int_0^\infty e^{A_b^\top t}Q_b^{\mathrm{nom}}e^{A_bt}\,dt\succ0.
$$

故 $P_0\succ0$；(37) 现提供一致负裕度，该增益共同二次容许。因此 (14) 中每个满足显式条件的增益属于 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$，且实际上对每个 $m\ge1$ 成立。

**第 III 部分：显式多变量条件的必要性。** 设 $(k_p,k_i,k_d)\in\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。由引理 2，增益为正且可选归一化证书 $P_0$ 满足 $P_0e_3=\kappa$。定义 $Q_b:=-(P_0F+F^\top P_0)+2b\kappa\kappa^\top$；对 $z=\mathrm{col}(z_0,z_1,z_2)$ 令 $q:=(\kappa^\top\otimes I_m)z$，并简记 $A=A(D_1,D_2,\Theta)$。归一化 $P_0e_3=\kappa$ 给出精确恒等式

$$
-z^\top\left[(P_0\otimes I_m)A+A^\top(P_0\otimes I_m)\right]z
=z^\top(Q_b\otimes I_m)z+2q^\top\left(\mathrm{Sym}(\Theta)-bI_m\right)q-2q^\top D_1z_1-2q^\top D_2z_2.
$$

因此 $\Theta$ 的反对称部分被消去，$\Theta=bI_m$ 最不利。分别在两个范数球上独立极小化，并利用归一化证书的一致裕度，可得某 $\gamma>0$ 使对每个 $z\ne0$

$$
z^\top(Q_b\otimes I_m)z-2L_1\|q\|\|z_1\|-2L_2\|q\|\|z_2\|\ge\gamma\|z\|^2. \tag{38}
$$

事实上，当相关向量非零时，两个范数界中的等号可由 $D_j=L_j\frac{q}{\|q\|}\frac{z_j^\top}{\|z_j\|}$ 形式的取法达到；把该极值代入上式，再对 $z$ 的分解施行秩二 Gram 分析即得 (14) 中关于 $\mu,\rho$ 的不等式（详见原文后续推导）。■

### 5.2 线性子类 PID 刻画

**命题 2 的证明。** 先考虑 $m=1$，把容许矩阵写成标量 $d_1,d_2,\theta$，其中 $|d_1|\le L_1$、$|d_2|\le L_2$、$\theta\ge b$。增广 PID 闭环的特征多项式为

$$
p_{d_1,d_2,\theta}(s)=s^3+(\theta k_d-d_2)s^2+(\theta k_p-d_1)s+\theta k_i.
$$

由 Routh–Hurwitz 判据，该多项式为 Hurwitz 当且仅当

$$
\theta k_i>0,\quad\theta k_p-d_1>0,\quad\theta k_d-d_2>0,\quad(\theta k_p-d_1)(\theta k_d-d_2)>\theta k_i.
$$

取 $d_1=L_1$、$d_2=L_2$、$\theta=b$ 得必要性：上述条件给出 $\bar k_0>0$、$\bar k_1>0$、$\bar k_2>0$、$\bar k_1\bar k_2>\bar k_0$；由于 $\bar k_1>0$ 与 $\bar k_1\bar k_2>\bar k_0>0$ 已蕴含 $\bar k_2>0$，这些条件等价于 (15)。

反之，设 (15) 成立，则 $k_i,k_p,k_d>0$ 且 $\bar k_2>0$；于是对每个容许三元组有 $\theta k_p-d_1\ge\bar k_1>0$、$\theta k_d-d_2\ge\bar k_2>0$。定义

$$
g(\theta):=\frac{(\theta k_p-L_1)(\theta k_d-L_2)}{\theta}.
$$

由 $bk_p>L_1$、$bk_d>L_2$ 得

$$
g'(\theta)=k_pk_d-\frac{L_1L_2}{\theta^2}\ge k_pk_d-\frac{L_1L_2}{b^2}>0,\qquad\theta\ge b,
$$

故

$$
\frac{(\theta k_p-d_1)(\theta k_d-d_2)}{\theta}\ge g(\theta)\ge g(b)=\frac{\bar k_1\bar k_2}{b}>\frac{\bar k_0}{b}=k_i.
$$

于是全部 Routh–Hurwitz 不等式对每个容许 $d_1,d_2,\theta$ 成立，这证明了 (15)。

现转向 $m\ge2$。首先注意 (16) 中的频率不等式自动蕴含标称 Routh–Hurwitz 条件：令 $\omega_0:=\sqrt{k_i/k_d}$，把 $\omega_0$ 代入 (16) 可得 $k_i>0$、$k_p>0$、$k_d>0$ 与 $bk_pk_d>k_i$。为证充分性，需说明对每个容许 $(D_1,D_2,\Theta)$，$A(D_1,D_2,\Theta)$ 为 Hurwitz：把 $A$ 的特征多项式写成 $P_0(s)+\Delta(s)$ 形式，其中 $P_0$ 为标称 $D_1=D_2=0$、$\Theta=bI_m$ 的特征多项式，并对频率响应作估计，把 (16) 作为鲁棒 Nyquist 型条件使用；由 (16) 可推出对所有 $\omega>0$ 有 $|b\chi(\omega)-k_p\omega^4|>(L_1\omega+L_2\omega^2)\sqrt{\chi(\omega)}$，再由小增益/多变量 Nyquist 论证保证无右半平面闭环极点（完整代数推导见原文 5.2 节）。■

### 5.3 PID 端点重合

**定理 2 的证明。** 由定理 1 与包含 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{lin}}$，只需证明

$$
\Omega_{\mathrm{pid}}^{\mathrm{cq}}=\Omega_{\mathrm{pid}}^{\mathrm{lin}}.
$$

对 $t>0$（对应 $t=\omega^2$），定义

$$
S(t):=\sqrt{(k_i-k_dt)^2+k_p^2t},\qquad R(t):=L_1\sqrt{t}+L_2t,
$$

并置

$$
F(t):=bS(t)^2-k_pt^2-R(t)S(t).
$$

于是 (16) 中的频率不等式等价于

$$
F(t)>0,\qquad\forall t>0. \tag{41}
$$

**第 1 步：$\Omega_{\mathrm{pid}}^{\mathrm{cq}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{lin}}$。** 设 $(k_p,k_i,k_d)\in\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。由定理 1，存在 $\mu,\rho\in(0,1)$ 使 $\Pi_{\mu,\rho}>0$、$\Delta_{\mu,\rho}>0$ 且 $k_i<\frac{\Pi_{\mu,\rho}}{2}(k_d-\sqrt{\Delta_{\mu,\rho}})$。定义

$$
H(t):=b(1-\mu)S(t)^2-k_pt^2-\frac{L_1^2t}{4b\mu\rho}-\frac{L_2^2t^2}{4b\mu(1-\rho)}.
$$

利用 (12)、(13) 可证 $H(t)$ 与 $F(t)$ 通过代数恒等式相联系，且 (14) 的条件恰好保证 $H(t)>0$ 对所有 $t>0$ 成立（等价地 $F(t)>0$），从而该增益属于 $\Omega_{\mathrm{pid}}^{\mathrm{lin}}$。完整恒等式与逐项估计见原文。

**第 2 步：$\Omega_{\mathrm{pid}}^{\mathrm{lin}}\subseteq\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。** 设 (41) 成立。通过分析 $F$ 关于 $t$ 的二次结构，可显式构造 $\mu,\rho\in(0,1)$ 使 (14) 的三个不等式成立：取由 $F(t)$ 在临界点处的取值定义的 $\mu,\rho$（其显式表达由 $k_p,k_d,L_1,L_2,b$ 给出），利用 $F(t)>0$ 推出 $\Pi_{\mu,\rho}>0$、$\Delta_{\mu,\rho}>0$ 及 $k_i$ 的上界不等式。于是该增益属于 $\Omega_{\mathrm{pid}}^{\mathrm{cq}}$。■

结合两步即得 (18)，从而三个增益域重合。

### 5.4 精确 PI 刻画

**定理 3 的证明。** 证明 $(iii)\Rightarrow(i)\Rightarrow(ii)\Rightarrow(iii)$。

**第 1 步：$(iii)\Rightarrow(i)$。** 该充分性论证实际上对每个 $m\ge1$ 都成立。条件 (iii) 蕴含 $k_p>0$、$k_i>0$。对给定参考 $y^*$，令 $u^*$ 满足 $f(y^*,u^*)=0$，并定义 $z_0:=\eta-u^*/k_i$、$z_1:=e$、$q:=k_iz_0+k_pz_1$。中值定理与 $\mathcal F_{L,b}$ 的 Jacobian 界给出

$$
f(y^*-z_1,u^*+q)=-D(z)z_1+\Theta(z)q,
$$

其中状态相关矩阵满足 $\|D(z)\|\le L$、$\mathrm{Sym}(\Theta(z))\succeq bI_m$。于是 $z=\mathrm{col}(z_0,z_1)$ 满足 $\dot z=A_{\mathrm{PI}}(D(z),\Theta(z))z$。置

$$
\gamma:=\frac{k_i}{k_p},\qquad\delta:=bk_p-\gamma-L.
$$

(iii) 中不等式等价于 $\delta>0$。考虑

$$
P_0:=\begin{bmatrix}\gamma(2bk_p-L)&\gamma\\\gamma&1\end{bmatrix}. \tag{53}
$$

由于 $\det P_0=\gamma(2bk_p-L-\gamma)=\gamma(bk_p+\delta)>0$，有 $P_0\succ0$。

令 $P=P_0\otimes I_m$ 并定义 $Q(D,\Theta):=-(PA_{\mathrm{PI}}(D,\Theta)+A_{\mathrm{PI}}(D,\Theta)^\top P)$。写 $H=\mathrm{Sym}(\Theta)$，直接计算给出

$$
Q(D,\Theta)=Q_b(D)+2k_p\begin{bmatrix}\gamma^2&\gamma\\\gamma&1\end{bmatrix}\otimes(H-bI_m),
$$

其中

$$
Q_b(D)=\begin{bmatrix}2bk_p\gamma^2I_m&\gamma(LI_m-D)\\\gamma(LI_m-D^\top)&2\left((bk_p-\gamma)I_m-\mathrm{Sym}(D)\right)\end{bmatrix}.
$$

故 $Q(D,\Theta)\succeq Q_b(D)$。$Q_b(D)$ 左上块的 Schur 补为

$$
S(D)=2\left((bk_p-\gamma)I_m-\mathrm{Sym}(D)\right)-\frac{1}{2bk_p}(LI_m-D^\top)(LI_m-D).
$$

对任意非零 $v$，令 $r_v:=\frac{v^\top\mathrm{Sym}(D)v}{\|v\|^2}$。由 $\|D\|\le L$ 得 $\|(LI_m-D)v\|^2\le2L(L-r_v)\|v\|^2$，于是

$$
\frac{v^\top S(D)v}{\|v\|^2}\ge2\delta+\left(2-\frac{L}{bk_p}\right)(L-r_v)\ge2\delta>0,
$$

这是因为 $\delta>0$ 蕴含 $bk_p>L$，而 $r_v\le L$。故 $Q_b(D)\succ0$ 对每个 $\|D\|\le L$ 成立；由矩阵球 $\{D:\|D\|\le L\}$ 的紧致性，存在只依赖 $(k_p,k_i,L,b)$ 的 $\alpha>0$ 使 $Q(D,\Theta)\succeq\alpha I_{2m}$ 对所有容许 $D,\Theta$ 成立。标准 Lyapunov 估计结合 $\mathbb R^{2m}$ 上范数等价性给出 (26)，常数仅依赖 $(k_p,k_i,L,b)$；该估计对任意 $z(0)$ 成立，特别在 $\eta(0)=0$ 的初始化下成立。同一估计阻止有限逃逸，故前向完备，(i) 成立。此外 $P_0\otimes I_m$ 是共同二次证书。

**第 2 步：$(i)\Rightarrow(ii)$。** 由 $\mathcal F_m^{\partial}\subset\mathcal F_{L,b}$ 立得。

**第 3 步：$(ii)\Rightarrow(iii)$。** 先证增益必须为正。由于 $0\in\mathbb N_0$，边界族包含 $f_0(x,u)=Lx+bI_mu$。取 $y^*=0$，则 $u^*=0$；在未平移的增广坐标 $z=\mathrm{col}(\eta,e)$ 中，相应闭环矩阵为

$$
C_0=\begin{bmatrix}0&I_m\\-bk_iI_m&(L-bk_p)I_m\end{bmatrix}.
$$

把 (ii) 应用于任意对象初始条件且 $\eta(0)=0$，得指数衰减对每个初始状态 $z(0)\in\mathcal S:=\{0\}\times\mathbb R^m$ 成立。与相应 PID 论证一样，该受限初始条件集足以检验 Hurwitz 稳定性：由于 $\mathcal S+C_0\mathcal S=\mathbb R^{2m}$ 且 $e^{C_0t}C_0=C_0e^{C_0t}$，$\mathcal S$ 上的指数衰减延拓到 $C_0\mathcal S$，从而延拓到整个 $\mathbb R^{2m}$；故 $C_0$ 为 Hurwitz。其标量特征多项式为

$$
p_0(s)=s^2+(bk_p-L)s+bk_i.
$$

由 Routh–Hurwitz 判据得 $bk_p-L>0$、$bk_i>0$；由 $b>0$、$L\ge0$ 得 $k_p>0$、$k_i>0$。

还需证明严格增益不等式。置

$$
N:=bk_p^2-Lk_p-k_i.
$$

对 $f_\nu\in\mathcal F_m^{\partial}$，平移后的闭环矩阵为

$$
C_\nu=\begin{bmatrix}0&I_m\\-k_iB_\nu&LI_m-k_pB_\nu\end{bmatrix},\qquad B_\nu=bI_m+\nu J_m.
$$

考虑与主导 $J_2$ 块的特征值 $\mathrm i$ 相关联的复化不变子空间；在该子空间上特征方程为

$$
p_\nu(s)=s^2+\left(k_p(b+\mathrm i\nu)-L\right)s+k_i(b+\mathrm i\nu)=0.
$$

由于已证 $k_p>0$、$k_i>0$，当 $\nu\to\infty$ 时其两根满足

$$
s_{\nu,1}=-\frac{k_i}{k_p}+O(\nu^{-1}),\qquad s_{\nu,2}=-\mathrm i k_p\nu-\frac{N}{k_p}+O(\nu^{-1}).
$$

特别地 $\lim_{\nu\to\infty}\mathrm{Re}\,s_{\nu,2}=-\frac{N}{k_p}$。为计入 $\eta(0)=0$ 的初始化，取支撑在前两个坐标上的对象初始条件，把该实二维块与 $\mathbb C$ 等同；此时 $z_1(0)=1$ 表示容许实初始向量 $(1,0)^\top$。归一化初始状态 $z_0(0)=0$、$z_1(0)=1$，相应误差分量为 $z_{1,\nu}(t)=a_{\nu,1}e^{s_{\nu,1}t}+a_{\nu,2}e^{s_{\nu,2}t}$，其中

$$
a_{\nu,1}=\frac{s_{\nu,1}}{s_{\nu,1}-s_{\nu,2}}=O(\nu^{-1}),\qquad a_{\nu,2}=-\frac{s_{\nu,2}}{s_{\nu,1}-s_{\nu,2}}=1+O(\nu^{-1}).
$$

因此第二模态被一个容许对象初始条件以有界远离零的系数激发。若 $N\le0$，则 $\mathrm{Re}\,s_{\nu,2}\ge0$ 对充分大 $\nu$ 成立，导致误差不衰减，违背 (ii) 要求的一致指数衰减；故必有 $N>0$，即 $k_i+Lk_p<bk_p^2$（利用 $k_p>0$ 除之）。这完成 (iii) 的证明。■

## 6 结论

刻画所有能保证不确定非线性系统一致指数调节的 PID 与 PI 增益，是控制论中基础而极具挑战的问题。本文为两类 $m\ge2$ 的非仿射 MIMO 系统建立了精确的系统级 PID 与 PI 增益域。对二阶 PID 类，独立刻画的共同二次内域与线性子类外域被证明重合，因此共同二次认证在增益域层面无损，线性子类是无损外检验；对一阶 PI 类，可数边界线性族的一致指数调节被证明等价于完整非线性类的调节，所得精确条件可由共同二次证书认证。PID 域严格扩大相应既有充分域并给出序贯调参规则，而 PI 条件把相应既有界放宽了 $L^2/(4b)$。

除这两个增益域公式外，结果还引出更广泛的结构性问题：对哪些非线性不确定性类，易处理的 Lyapunov 内域与易处理的检验族外域能同时与完整系统级增益域重合？紧致线性反例表明共同二次无损性一般并不成立。识别保证这种精确内—外重合的可验证结构条件，是未来研究的重要方向。

## 图注与表注

**图 1：** $L_1=L_2=5$、$b=1$、$k_i=0.5$ 时 PID 增益域的比较。橙色区域为 [28] 导出的充分域 $\Omega_{\mathrm{pid}}^{\mathrm{ZG}}$，蓝色斜线区域为本文建立的精确域 $\Omega_{\mathrm{pid}}$；空心圆点 $(21,21)$ 标出既有域两条边界曲线的交点。横轴为比例增益 $k_p$（0–50），纵轴为微分增益 $k_d$（0–50）。

**图 2：** $L=5$、$b=1$ 时 PI 增益域的比较。灰色区域为 [28] 导出的域，斜线区域为精确条件额外容许的增益。两条边界的竖直差为 $L^2/(4b)=6.25$；图中标出精确边界 $bk_p^2=Lk_p+k_i$ 与 Zhao–Guo 边界 $bk_p^2=Lk_p+k_i+L^2/(4b)$。横轴为比例增益 $k_p$（4–10），纵轴为积分增益 $k_i$（0–50）。

> **原文说明：** 原文全文不含表格（Table），仅有上述 2 幅图，因此本页不设表格转写。原文标题页脚注给出作者单位（中国科学院数学与系统科学研究院数学科学国家重点实验室，北京 100190；邮箱 zhaocheng@amss.ac.cn）；原文无致谢段与附录（第 5 节即完整证明，参考文献后无其他内容）。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 32–34 页转录；未逐条核对 DOI）。

[1] K. J. Åström and T. Hägglund, "The future of PID control," Control Eng. Pract., vol. 9, no. 11, pp. 1163–1175, 2001.

[2] J. Zhu, C. Zhao, and L. Guo, "Towards guaranteed optimal PID tuning for uncertain nonlinear systems," in Proc. 23rd IFAC World Congr., Busan, Republic of Korea, 2026, to appear; also available as arXiv:2606.04787.

[3] L. Guo, "Learning and Adaptation in Uncertain Dynamical Systems: Theory, Algorithms, and Challenges," plenary talk presented at the 23rd IFAC World Congress, Busan, Republic of Korea, 2026.

[4] F. Blanchini, A. Lepschy, S. Miani, and V. Viaro, "Characterization of PID and lead/lag compensators satisfying given H∞ specifications," IEEE Trans. Autom. Control, vol. 49, no. 5, pp. 736–740, May 2004.

[5] K. B. Ariyur and M. Krstic, Real-Time Optimization by Extremum-Seeking Control. Hoboken, NJ, USA: Wiley, 2003.

[6] N. J. Killingsworth and M. Krstic, "PID tuning using extremum seeking: Online, model-free performance optimization," IEEE Control Syst. Mag., vol. 26, no. 1, pp. 70–79, Feb. 2006.

[7] B. Pang, T. Bian, and Z.-P. Jiang, "Robust policy iteration for continuous-time linear quadratic regulation," IEEE Trans. Autom. Control, vol. 67, no. 1, pp. 504–511, 2022.

[8] Y. Tan, D. Nešić, and I. Mareels, "On non-local stability properties of extremum seeking control," Automatica, vol. 42, no. 6, pp. 889–903, 2006, doi: 10.1016/j.automatica.2006.01.014.

[9] M.-T. Ho, A. Datta, and S. P. Bhattacharyya, "A linear programming characterization of all stabilizing PID controllers," in Proc. Amer. Control Conf., Albuquerque, NM, USA, 1997, vol. 6, pp. 3922–3928.

[10] A. Datta, M.-T. Ho, and S. P. Bhattacharyya, Structure and Synthesis of PID Controllers. London, U.K.: Springer-Verlag, 2000.

[11] G. J. Silva, A. Datta, and S. P. Bhattacharyya, PID Controllers for Time-Delay Systems. Boston, MA, USA: Birkhäuser, 2005.

[12] L. Ou, W. Zhang, and L. Yu, "Low-order stabilization of LTI systems with time delay," IEEE Trans. Autom. Control, vol. 54, no. 4, pp. 774–787, 2009, doi: 10.1109/TAC.2009.2014935.

[13] C. Zhao and Y. Zhang, "Understanding the capability of PD control for uncertain stochastic systems," IEEE Trans. Autom. Control, vol. 69, no. 1, pp. 495–502, Jan. 2024, doi: 10.1109/TAC.2023.3266508.

[14] Z. Shafiei and A. T. Shenton, "Frequency-domain design of PID controllers for stable and unstable systems with time delay," Automatica, vol. 33, no. 12, pp. 2223–2232, 1997.

[15] Y.-J. Huang and Y.-J. Wang, "Robust PID tuning strategy for uncertain plants based on the Kharitonov theorem," ISA Trans., vol. 39, no. 4, pp. 419–431, 2000.

[16] N. Hohenbichler, "All stabilizing PID controllers for time delay systems," Automatica, vol. 45, no. 11, pp. 2678–2684, 2009.

[17] X.-G. Li, S.-I. Niculescu, J.-X. Chen, and T. Chai, "Characterizing PID controllers for linear time-delay systems: A parameter-space approach," IEEE Trans. Autom. Control, vol. 66, no. 10, pp. 4499–4513, Oct. 2021.

[18] M.-T. Ho, A. Datta, and S. P. Bhattacharyya, "Robust and non-fragile PID controller design," Int. J. Robust Nonlinear Control, vol. 11, no. 7, pp. 681–708, 2001.

[19] W. Michiels and S.-I. Niculescu, "Characterization of delay-independent stability and delay interference phenomena," SIAM J. Control Optim., vol. 45, no. 6, pp. 2138–2155, 2007.

[20] P. Appeltans, S.-I. Niculescu, and W. Michiels, "Analysis and design of strongly stabilizing PID controllers for time-delay systems," SIAM J. Control Optim., vol. 60, no. 1, pp. 124–146, 2022.

[21] C. Zhao and L. Guo, "Control of nonlinear uncertain systems by extended PID," IEEE Trans. Autom. Control, vol. 66, no. 8, pp. 3840–3847, Aug. 2021.

[22] J. Zhang and L. Guo, "PID control of nonlinear stochastic systems with structural uncertainties," IFAC-PapersOnLine, vol. 53, no. 2, pp. 2189–2194, 2020.

[23] Y. Li and D. Ma, "Robust PID control of second-order uncertain nonlinear system with time-varying delay: An input-output approach," IFAC-PapersOnLine, vol. 54, no. 18, pp. 70–75, 2021.

[24] X. Lyu and Z. Lin, "Design of PID control for planar uncertain nonlinear systems with input delay," Int. J. Robust Nonlinear Control, vol. 32, no. 18, pp. 9407–9420, 2022.

[25] J. Zhang and E. Fridman, "Sampled-data implementation of extended PID control using delays," Int. J. Robust Nonlinear Control, vol. 32, no. 18, pp. 9610–9624, 2022.

[26] Y. Li and D. Ma, "Robust sampled-data PID controller design for regulation control of nonlinear systems with output delay," Int. J. Robust Nonlinear Control, vol. 33, no. 11, pp. 6371–6391, 2023.

[27] C.-C. Chen, S.-Y. Wu, and W.-S. Hsu, "PID control design for uncertain planar nonlinear systems via feedback domination technique," Int. J. Robust Nonlinear Control, vol. 36, no. 1, pp. 45–60, 2026.

[28] C. Zhao and L. Guo, "Towards a theoretical foundation of PID control for uncertain nonlinear systems," Automatica, vol. 142, Art. no. 110360, 2022.

[29] M. Sion, "On general minimax theorems," Pacific J. Math., vol. 8, no. 1, pp. 171–176, 1958, doi: 10.2140/pjm.1958.8.171.

**本页范围与校对状态：** 本页为 arXiv:2609.11130v1 的全文中文译稿：摘要、正文第 1–6 节（含 2.1–2.6、3.1–3.2、5.1–5.4 全部小节）、结论、图 1–2 图注与参考文献 [1]–[29]。公式编号沿用原文 (1)–(53) 中的主要编号：正文 (1)–(33) 全部译入；第 5 节证明按原文结构译出，包含 (34)–(38)、(41)、(53) 等关键编号式，对其中纯代数推导（如定理 1 第 III 部分末尾的秩二 Gram 分析、5.2 节多变量频率不等式的完整 Nyquist 论证、5.3 节第 2 步的显式构造）按原文逻辑作概述而非逐式复现——原 PDF 抽取文本在这些位置公式排版高度错乱，逐式转录有失真风险，故以概述方式如实呈现。**原文全文不含表格**，故未设表格转写（图注与表注节已注明）；原文无附录、无致谢段。图内曲线未数字化；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误。骨架"版本"行原为 2026-09-28（收录日），已按 BRIEF2 结构改为 arXiv:2609.11130v1（2026-09-10，依据 PDF 页眉 "arXiv:2609.11130v1 [eess.SY] 10 Sep 2026"）；作者为 Cheng Zhao；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
