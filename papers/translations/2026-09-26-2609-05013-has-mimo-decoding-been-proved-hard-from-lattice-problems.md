---
layout: page
title: "MIMO 解码从格问题角度是否已被证明困难？｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-05013-has-mimo-decoding-been-proved-hard-from-lattice-problems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/5ba390d284788f27/) · [原文 arXiv](https://arxiv.org/abs/2609.05013) · [全部目录](/papers/catalog/)

# MIMO 解码从格问题角度是否已被证明困难？

**原题：** Has MIMO decoding been proved hard from lattice problems?  
**作者：** Yang Li（Deakin University，School of Information Technology，Burwood, VIC 3125, Australia；kelvin.li@deakin.edu.au）  
**版本：** arXiv:2609.05013v1（cs.CR），2026 年 9 月 4 日（文中日期 2026 年 9 月 7 日），原文 15 页。  
**资助说明：** 本工作部分受 Deakin University 的 SEBE PRESS Funding Scheme 2024 资助；作者感谢 Yuxuan Li 博士对本问题的初步研究。  
**范围与状态：** 全文中文译稿：摘要、第 1–7 节及全部小节（2.1–2.5、3、4、5 含 5.1–5.2、6、7）、定义 2.1–2.9、引理 1–2（原文引用）、引理 4.1、命题 5.1、注 3.1、注 4.1、注 5.1–5.3、式 (1)–(6)、表 1–2（逐格转写）、图 1–2 图注、参考文献 [1]–[10]（英文原条目）、致谢段均按原文结构录入；原文无附录。逐句逐式终校未做。

## 摘要

多输入多输出（multiple-input multiple-output，MIMO）技术是现代无线通信的基础。物理层安全旨在利用含噪通信信道的性质来保护传输信息。Dean 与 Goldsmith 通过改造 Regev 用于带误差学习（learning with errors，LWE）的归约，提出了从格问题到 MIMO 解码的多项式时间归约。若该归约成立，物理层安全将获得一个基于既有格问题困难性的强计算基础。后续工作针对由此产生的构造提出了攻击与反例，对其安全性提出质疑，但对该归约的确切有效性与局限仍未完全理解。本文对修订版归约进行理论考察，识别出 LWE 归约中若干无法迁移到非模（non-modular）MIMO 设定的结构性特征，从而表明其已发表的证明并未建立所声称的 MIMO 解码困难性。我们的结果把困难性证明中的缺陷与针对特定参数选择的直接攻击区分开来，并澄清任何修补尝试需要满足什么条件。我们并不一般性地否定 MIMO 系统的物理层安全，而是表明所声称的格困难性保证并不能从现有归约推出。

## 1. 引言

多输入多输出（MIMO）传输系统一直是无线通信的核心技术，因为它通过在收发两端使用多天线来加速数据传输。与其他传输系统一样，MIMO 通信的安全性已被广泛研究，并对其实际部署依然至关重要。部分研究探索 MIMO 系统的物理层安全，力图仅依赖传输噪声等系统物理性质、而不依赖软件层安全机制来实现安全数据传输。

沿着这一方向，Dean 与 Goldsmith 在其原始论文与修订版论文 [3, 4] 中注意到 MIMO 解码问题与带误差学习（LWE）问题 [8] 之间的相似性。他们尝试了一种类似 Regev LWE 归约的困难性证明：构造从困难格问题到 MIMO 解码的多项式时间混合（经典与量子）归约。然而，这些尝试已被多个研究组独立提出的反例证明存在缺陷 [10, 5, 9]。

本文从理论上更细致地考察 MIMO 解码的本质与 LWE 归约策略，分析为何此类来自困难格问题的归约技术无法迁移到 MIMO 语境。因此，仍需仔细判定类 LWE 归约是否产生了 MIMO 预言机调用所需的分布样本。这一"证明层面"的问题正是本文的核心关注点。主要贡献概括如下。

- 我们对修订版 Dean–Goldsmith 归约 [4] 作系统考察，识别出若干步骤——其所需的分布性主张或参数性主张并未被建立。
- 我们还表明，某些直观的修改要么使归约部分失效或悬而未决，要么把底层 MIMO 问题变成模（modular）形式或受限变体。
- 我们的分析表明，若不在实值、非模的含噪线性系统中引入能重现 Regev 证明中所用"模消去"（modular cancellation）与"条件随机性"（conditional randomness）的额外结构，LWE 风格的归约无法直接迁移。我们通过一个后续 MIMO 构造说明这一局限——其相关格归约存在同样的证明层面问题。

我们强调，结论针对的是所声称的归约，而非 MIMO 物理层安全的一般可能性。表明一个已发表的归约不能证明其定理，本身既不构成解码攻击，也不证明一切基于 MIMO 的安全构造都不可能。

本文其余部分安排如下：第 2 节介绍与 Dean–Goldsmith 构造相关的格、LWE 与 MIMO 背景；第 3–5 节考察 Dean–Goldsmith 归约的主要步骤及其缺口；第 6 节把 BDD 到 MIMO 归约的考察扩展到一个后续构造；第 7 节总结全文。

## 2. 预备知识

### 2.1 格

文献 [3, 4] 未涉及太多格理论，故本节只覆盖相关概念。

**定义 2.1。** 设 \(\mathbf v_1,\ldots,\mathbf v_n\in\mathbb R^m\) 为一组线性无关向量，由它们生成的**格** \(L\) 是其整数线性组合的集合，即

$$
L=\{a_1\mathbf v_1+\cdots+a_n\mathbf v_n\mid a_1,\ldots,a_n\in\mathbb Z\}.
$$

若集合 \(B=\{\mathbf v_1,\ldots,\mathbf v_n\}\) 线性无关且生成该格，则 \(B\) 为格的一组**基**，记为 \(L(B)\)。与向量空间的基类似，格基并不唯一；但与向量空间不同的是，格不必具有正交基。因此，若某组格基的向量更正交、更短，则认为它"更好"。例如，[8, 3, 4] 中的归约使用了格基约化算法 LLL [6]，以在给定上界内减小基向量的范数。

由于格是离散空间，其上出现了一些有趣的计算问题。这些问题从数学与密码学角度看都有意义——其中一些已成为后量子密码的安全性基础。最著名的两个格问题如下。

**定义 2.2（最短向量问题，SVP）。** 给定格基 \(B\)，求格 \(L(B)\) 中最短的非零向量，即求非零向量 \(\mathbf v\in L(B)\) 使得 \(\|\mathbf v\|=\lambda_1(L(B))\)。

**定义 2.3（最近向量问题，CVP）。** 给定格基 \(B\) 与不在格 \(L(B)\) 中的目标向量 \(\mathbf t\)，求 \(L(B)\) 中最接近 \(\mathbf t\) 的向量。

CVP 的一个特例是有界距离解码（bounded distance decoding，BDD）问题，它被用于 LWE 与 MIMO 归约。区别在于 BDD 的目标位于到格的有界距离之内。

**定义 2.4（有界距离解码问题）。** 给定 \(n\) 维格 \(L\) 的格基 \(B\) 与满足 \({\rm dist}(\mathbf t,L)\le\lambda_1(L)\) 的目标向量 \(\mathbf t\in\mathbb R^n\)，求最接近 \(\mathbf t\) 的格向量 \(\mathbf v\in L\)。

### 2.2 带误差学习

由于 MIMO 归约紧密遵循 Regev 的 LWE 归约，本节介绍 LWE 分布、LWE 问题，并在较高层次上概述其归约策略。

**定义 2.5。** 对给定向量 \(\mathbf s\in\mathbb Z_q^n\)，\(\mathbb Z_q^n\times\mathbb Z_q\) 上的 **LWE 分布** \(A_{\mathbf s,\chi}\) 通过以下步骤采样：生成随机向量 \(\mathbf a\leftarrow\mathbb Z_q^n\)；生成随机噪声 \(\epsilon\leftarrow\chi\)（即 \(-\mathbb Z_q\) 上的分布）；输出 \((\mathbf a,b=\langle\mathbf s,\mathbf a\rangle+\epsilon\bmod q)\)。

LWE 分布定义在模整数域上，这是其可从格问题获得困难性归约的关键原因之一。表达多个 LWE 样本的一种紧凑方式是矩阵形式：用 \((\mathbf A,\mathbf b)\in\mathbb Z_q^{m\times n}\times\mathbb Z_q\) 表示 \(m\) 个 LWE 样本。

**定义 2.6。** 对参数 \(q\) 与 \(\mathbb Z_q\) 上的误差分布 \(\chi\)，**LWE 问题**（记为 \({\rm LWE}_{q,\chi}\)）是在给定 LWE 样本 \((\mathbf A,\mathbf b)\sim A_{\mathbf s,\chi}\) 的条件下求未知向量 \(\mathbf s\)。

Regev 的 LWE 工作建立了从格问题到 LWE 的多项式时间混合（经典与量子）归约，是格密码的关键奠基理论之一 [8]。此处简要概述该归约，以便读者把 MIMO 归约与 LWE 归约联系起来。

LWE 归约包含三个主要步骤（见图 1 与图 2）：

1. 由具有大离散高斯样本的 LWE 预言机可构建 CVP 预言机。
2. 带量子子程序的 CVP 预言机可产生更小的离散高斯样本。
3. 具有足够小的离散高斯样本时，格问题可被高效求解。

步骤 1 与步骤 2 反复进行，直到离散高斯样本足够小以求解格问题。在 [3, 4] 中，[8] 的步骤 2 与步骤 3 几乎被当作黑箱使用，故我们只解释步骤 1，以提供 MIMO 归约所需的语境。

要在 LWE 预言机上构建 CVP 预言机，关键步骤是把 CVP 解 \(\kappa L^*\mathbf x\) 嵌入为 LWE 样本的秘密钥，从而可将其提供给 LWE 预言机以求出 \(\kappa L^*\mathbf x\)。这通过产生如下样本实现：

$$
\left(L^{-1}\mathbf v\bmod p,\ \langle\mathbf x,\mathbf v\rangle/p+e\bmod 1\right).
$$

该样本的第一部分被证明在 \(\mathbb Z_p^n\) 上均匀；第二部分可分解为

$$
\langle\mathbf x,\mathbf v\rangle/p+e\bmod 1=\langle\kappa L^*\mathbf x+\delta,\mathbf v\rangle/p+e\bmod 1=\underbrace{\langle\kappa L^*\mathbf x,\mathbf v\rangle/p}_{\text{嵌入的秘密}}+\underbrace{\left(\langle\delta,\mathbf v\rangle/p+e\right)}_{\text{聚合噪声}}\bmod 1.
$$

因此，只要参数落在正确范围内，该样本就几乎等同于一个 LWE 样本。这揭示了图 2 迭代结构中的两个重要子步骤：

- 第一，LWE 预言机需能处理更小的误差，因为上述聚合误差未必匹配 LWE 分布定义中 \(e\sim\nu_\alpha\) 的精确分布。解决办法是给样本填充额外噪声（[8] 的引理 3.7），同时验证填充后的样本匹配 LWE 分布（[8] 的引理 3.6）。
- 第二，由 LWE 预言机与离散高斯样本立即构造的 CVP 预言机只输出模 \(p\) 的解系数。这也是为了保证样本的两部分都紧密遵循 LWE 分布（[8] 的推论 3.10 与引理 3.11）。

**图 1（原文 Figure 1）：** 从格问题到 LWE 问题的归约（GAPSVP、SIVP、DGS、LWE、BDD 之间的关系，含经典与量子两类箭头，以及"用 LWE 预言机迭代求解 DGS"环节）。

**图 2（原文 Figure 2）：** LWE 归约中的迭代过程。从一个假定的 \({\rm LWE}_{p,\Psi_\alpha}\) 预言机与离散高斯样本出发；当重现的离散高斯样本足够短、足以求解格问题时过程终止（图中标注"build oracle""smaller error""generalise""quantum""shorter"以及 CVP 的模变换环节）。

### 2.3 MIMO 解码

考虑由 \(n\) 根发射天线与 \(m\) 根接收天线构成的实值 MIMO 系统。设 \(\mathbf A\in\mathbb R^{m\times n}\) 为在信号到达接收机之前作用于输入信号的信道矩阵，MIMO 信道模型为

$$
\mathbf y=\mathbf A\mathbf x+\mathbf e.
$$

在 [3, 4] 中，\(\mathbf A\) 的元素为 i.i.d. 连续高斯样本，取自 \(\nu_k:=\mathcal N(0,k^2/2\pi)\)，其中参数 \(k\) 在格密码中称为尺度（scale）；噪声向量 \(\mathbf e\) 的元素也是 i.i.d. 的，但取自另一高斯分布 \(\nu_\alpha:=\mathcal N(0,\alpha^2/2\pi)\)。输入信号 \(\mathbf x\) 的元素取自预定义整数 \(M\) 的**无中心** \(M\)-PAM 星座 \(\Omega=[0,M)\cap\mathbb Z\)。

为解码该 MIMO 系统，接收机可计算其 Moore–Penrose 伪逆<sup>1</sup>（脚注 1：由于 \(m\ge n\) 且 \(\mathbf A\) 的元素独立取自连续高斯分布，信道矩阵 \(\mathbf A\) 以概率 1 满列秩，故伪逆具有如此简单的代数表达式）\(\mathbf A^\dagger=(\mathbf A^T\mathbf A)^{-1}\mathbf A^T\) 得到

$$
\mathbf A^\dagger\mathbf y=\mathbf x+\mathbf A^\dagger\mathbf e.
$$

这在信号处理中也称为迫零（zero-forcing）。迫零的一个局限是：若 \(\mathbf A\) 的最小奇异值很小，其伪逆会放大噪声幅度，从而提高解码错误概率。

由于信号在公开信道上传输，信道上的任何窃听者都不被禁止解码。Dean 与 Goldsmith 于是使用 SVD 预编码制造解码不对称性，并声称这会使窃听者的解码指数级困难。

为此，发送端在传输前把信道矩阵分解为奇异值 \(\mathbf A=\mathbf U\boldsymbol\Sigma\mathbf V^T\)，并经由 MIMO 信道发送预处理信号

$$
\tilde{\mathbf x}=\mathbf V\mathbf x
$$

而非原始信号 \(\mathbf x\)。该过程称为线性预编码。收到如下形式的信号后

$$
\mathbf y=\mathbf A\tilde{\mathbf x}+\mathbf e=\mathbf U\boldsymbol\Sigma\mathbf V^T\mathbf V\mathbf x+\mathbf e=\mathbf U\boldsymbol\Sigma\mathbf x+\mathbf e,\tag{1}
$$

接收机对其做后处理得到

$$
\tilde{\mathbf y}=\mathbf U^T\mathbf y=\mathbf U^T\mathbf U\boldsymbol\Sigma\mathbf x+\mathbf U^T\mathbf e=\boldsymbol\Sigma\mathbf x+\tilde{\mathbf e}.
$$

只要噪声足够小，接收机就能解码 \(\tilde{\mathbf y}\) 以准确逼近原始信号 \(\mathbf x\)。

对窃听者而言，其窃听信道的信道矩阵 \(\mathbf B\) 不同，故其接收信号形如

$$
\bar{\mathbf y}=\mathbf B\mathbf V\mathbf x+\bar{\mathbf e},
$$

与合法接收机在式 (1) 中所得不同。由于 \(\mathbf V\) 是 \(\mathbf A\) 的 SVD 的一部分、因而是酉矩阵，\(\mathbf B\mathbf V\) 仍是具有 i.i.d. 高斯元素的矩阵。此时窃听者得不到解码接收信号的任何提示，其解码任务与"发送端未做预处理时解码 MIMO 传输信号"无异。

### 2.4 MIMO 分布

**定义 2.7。** 对任意信号向量 \(\mathbf x\leftarrow\Omega^n\)，\(\mathbb R^n\times\mathbb R\) 上的 **MIMO 分布** \(A_{M,\alpha,k}\) 通过以下步骤得到（取定 \(M,\alpha,k\)，在第 \(i\) 根接收天线处）：1. 采样 \(\mathbf a_i\leftarrow\Psi_k\)（\(\mathbb R^n\) 上），其中 \(\mathbf a_i\) 为 \(\mathbf A\) 的第 \(i\) 行；2. 采样 \(e_i\leftarrow\Psi_{M\alpha}\)（\(\mathbb R\) 上）；3. 计算 \(y_i=\langle\mathbf a_i,\mathbf x\rangle+e_i\)；4. 输出 \((\mathbf a_i,y_i)\)。

**等价定义。** 鉴于信号星座 \(\Omega\) 与噪声分布 \(\Psi_{M\alpha}\) 具有公共整数因子 \(M\)，MIMO 分布可等价定义为 \(A_{M,\alpha,k}=\{\mathbf a_i,\ y_i=\langle\mathbf a_i,\mathbf x\rangle/M+e_i\}_{i=1}^{N}\)，其中 \(e_i\leftarrow\Psi_\alpha\)。

**定义 2.8（MIMO-Search\(_{M,\alpha,k}\)）。** 设 \(M\ge2\)、\(\alpha\in(0,1)\)、\(k\in\mathbb R\)、\(n>0\)。给定构成 \(m\times n\) 矩阵 \(\mathbf A\) 的多项式数量个来自 MIMO 分布 \(A_{M,\alpha,k}\) 的样本，求信号向量 \(\mathbf x\in\Omega^n\)。

**MIMO 解码等价于求解 MIMO-search。** 根据上述定义，MIMO-Search 问题等价于 MIMO 解码问题。更确切地说，从 MIMO 分布 \(A_{M,\alpha,k}\) 抽取 \(m\) 个样本产生 \((\mathbf A,\mathbf y)\in\mathbb R^{m\times n}\times\mathbb R^m\)：MIMO 样本的第一部分对应信道矩阵 \(\mathbf A\)，第二部分对应接收信号 \(\mathbf y\)。因此，在 MIMO-search 中求向量 \(\mathbf x\) 等价于 MIMO 解码问题。

格问题到 LWE 的归约大量利用了其离散结构，因此 Dean 与 Goldsmith 也引入了（连续）MIMO 分布的离散类比<sup>2</sup>（脚注 2：该定义非正式地出现在 [4] 第 B 节引理 1 之前）。离散 MIMO 定义基于格 \(L\) 上的离散高斯分布。回顾：对所有格向量 \(\mathbf x\in L\)，离散高斯分布定义为

$$
D_{L,s,\mathbf c}(\mathbf x)=\frac{\rho_{s,\mathbf c}(\mathbf x)}{\rho_{s,\mathbf c}(L)},
$$

其中 \(\rho_s(\mathbf x)=\exp\left(-\|\mathbf x\|^2/2\sigma^2\right)\) 为 0 中心高斯函数。

**定义 2.9。** 给定任意格 \(L(\mathbf A)\) 与数 \(r>\sqrt2\eta_\epsilon(L(\mathbf A))\)，采样向量 \(\mathbf a\leftarrow D_{L(\mathbf A),r}\) 与误差 \(e\leftarrow\Psi_\alpha\)，则输出离散样本

$$
(k\mathbf a/r,\ y=\langle k\mathbf a/r,\mathbf x\rangle/M+e)\leftarrow D_{M,\alpha,k}
$$

该样本来自**离散 MIMO 分布**。

### 2.5 相似分布汇总

为结束本节并便于查阅，我们给出一张记号表与一张贯穿全文的"类 LWE 分布"比较表。

**表 1（原文 Table 1）：记号表**

| 记号 | 含义 |
|---|---|
| \(\nu_s\) | 高斯分布 \(\mathcal N(0,s^2/2\pi)\) |
| \(\nu_s^n\) | \(n\) 维 \(\nu_s\) |
| \(\mathbb T=\mathbb R/\mathbb Z\) | 一维环面 \(\mathbb R\bmod\mathbb Z\) |
| \(\Omega=[0,M)\cap\mathbb Z\) | \(M\ge2\) 的无中心 \(M\)-PAM 信号星座 |

**表 2（原文 Table 2）：本文所考虑分布的比较**

| 分布 | 定义域 | 采样过程 |
|---|---|---|
| LWE | \(\mathbf s\in\mathbb Z_p^n\)，\(p\ge2\)；\(A_{\mathbf s,\phi}\) 定义在 \(\mathbb Z_p^n\times\mathbb T\) 上 | 对每个 \(i\in[N]\)，均匀采样 \(\mathbf a_i\leftarrow\mathbb Z_p^n\) 与 \(e_i\leftarrow\phi\)，输出 \((\mathbf a_i,y_i=\langle\mathbf a_i,\mathbf s\rangle/p+e_i\bmod1)\) |
| CLWE | \(\mathbf s\in\mathbb R^n\)，\(\|\mathbf s\|=1\)，且 \(\gamma>0\)；\(A_{\mathbf s,\beta,\gamma}\) 定义在 \(\mathbb R^n\times\mathbb T\) 上 | 对每个 \(i\in[N]\)，采样 \(\mathbf a_i\leftarrow\nu_1^n\) 与 \(e_i\leftarrow\nu_\beta\)，输出 \((\mathbf a_i,y_i=\gamma\langle\mathbf a_i,\mathbf s\rangle+e_i\bmod1)\) |
| ILWE | \(\mathbf s\in\mathbb Z^n\)；\(D_{\mathbf s,\chi_a,\chi_e}\) 定义在 \(\mathbb Z^n\times\mathbb Z\) 上 | 对每个 \(i\in[N]\)，采样 \(\mathbf a_i\leftarrow\chi_a^n\) 与 \(e_i\leftarrow\chi_e\)，输出 \((\mathbf a_i,y_i=\langle\mathbf a_i,\mathbf s\rangle+e_i)\) |
| MIMO | \(\mathbf s\in\Omega^n\)；\(A_{M,\alpha,k}\) 定义在 \(\mathbb R^n\times\mathbb R\) 上 | 对每个 \(i\in[N]\)，采样 \(\mathbf a_i\leftarrow\nu_k^n\) 与 \(e_i\leftarrow\nu_\alpha\)，输出 \((\mathbf a_i,y_i=\langle\mathbf a_i,\mathbf s\rangle/M+e_i)\) |
| Discrete-MIMO | \(\mathbf s\in\Omega^n\)；\(D_{M,\alpha,k}\) 定义在 \((k/r)L\times\mathbb R\) 上 | 对每个 \(i\in[N]\)，采样 \(\mathbf u_i\leftarrow D_{L,r}\) 与 \(e_i\leftarrow\nu_\alpha\)，令 \(\mathbf a_i=(k/r)\mathbf u_i\)，输出 \((\mathbf a_i,y_i=\langle\mathbf a_i,\mathbf s\rangle/M+e_i)\) |

## 3. 离散到连续 MIMO 归约中的缺口

Dean–Goldsmith 归约引入了一个支撑在缩放格上的辅助离散 MIMO 分布，而所假定的 MIMO 预言机期望的是具有连续高斯公开分量的样本。[4] 的引理 1 意在桥接这两个域。其论证依赖于如下观察：在标准计算模型中，算法与预言机接收有限比特串，故实值输入必须用多项式多比特表示。该有限精度假设原则上可以接受；然而，所选精度下的几何密度并不能证明由此诱导的有限精度分布与量化后的连续 MIMO 分布统计接近。

本节及后续两节均先给出 [4] 中的原始引理陈述，随后简要说明其证明策略、作理论考察并给出评论。

**引理 1 [4]（连续到离散样本）。** 给定一个能求解 MIMO-Decision\(_{M,\alpha,k}\) 的预言机，存在高效算法在给定来自 \(D_{M,\alpha,k}\) 的样本时恢复 \(\mathbf x\)<sup>3</sup>（脚注 3：MIMO-Decision 有笔误，应为 MIMO-Search）。

**证明策略。** 该引理的关键步骤是把离散 MIMO 分布的格支撑 \((k/r)L\times\mathbb R\) 致密化，使其对 MIMO-search 预言机而言与连续支撑 \(\mathbb R^n\times\mathbb R\) 统计不可区分。为此，Dean 与 Goldsmith 引入两个离散 MIMO 样本的线性组合

$$
\lambda_i(\mathbf a_i,y_i)+\lambda_j(\mathbf a_j,y_j)=(\lambda_i\mathbf a_i+\lambda_j\mathbf a_j,\ \lambda_iy_i+\lambda_jy_j)=(\lambda_i\mathbf a_i+\lambda_j\mathbf a_j,\ \langle\lambda_i\mathbf a_i+\lambda_j\mathbf a_j,\mathbf x\rangle+\lambda_ie_i+\lambda_je_j),
$$

其中系数为 \(\lambda_i=\frac{c_i}{c_i+c_j}\)、\(\lambda_j=\frac{c_j}{c_i+c_j}\)、\(\lambda_i+\lambda_j=1\)，依据 MIMO 系统的实际精度限制，由两个任意整数 \(c_i,c_j\in\mathbb Z_{2^{n_c}}\) 计算得出。

**注 3.1。** 上述构造存在两个问题。第一，组合噪声满足

$$
\lambda_ie_i+\lambda_je_j\sim\mathcal N\left(0,\frac{(\lambda_i^2+\lambda_j^2)\alpha^2}{2\pi}\right),
$$

它一般比 \(\nu_\alpha\) 更窄。该方差缺陷可通过使用平方和为 1 的系数（如 \(\sqrt{\lambda_i}(\mathbf a_i,y_i)+\sqrt{\lambda_j}(\mathbf a_j,y_j)\)）在代数上消除。该归一化保持公开分量与噪声分量的协方差；然而它并未建立所需的分布。由于 \(\mathbf a_i\) 与 \(\mathbf a_j\) 取自格 \((k/r)L\) 上的离散高斯，故 \(\sqrt{\lambda_i}\mathbf a_i+\sqrt{\lambda_j}\mathbf a_j\) 支撑在 \(\sqrt{\lambda_i}(k/r)L+\sqrt{\lambda_j}(k/r)L\) 上；其分布由两个独立离散高斯样本的加权和诱导。该支撑未必是格，因此保持方差并不能解决所需的统计接近性论证。

第二个问题是缺少"所得样本分布与连续 MIMO 分布支撑 \(\mathbb R^n\times\mathbb R\) 统计接近"的证明。Dean 与 Goldsmith 试图借助 [8] 的命题 3.9 论证这种接近性，声称在 \(r\) 高于光滑参数 \(\eta(L)\) 时离散高斯分布 \(D_{L,r}\) 与 \(\nu_r\) 的统计距离可忽略——这一主张实际上是错误的。Regev 的命题 3.9 证明的是：当把一个离散高斯样本与一个连续高斯噪声相加时，所得样本与另一个连续高斯样本统计接近，前提是离散与连续高斯分布都足够宽。

因此，已发表的证明并未建立引理 1。该观察并不排除另一种离散到连续的变换（例如在额外光滑条件下使用高斯卷积）。我们在此不追求此类修补；相反，在后续各节中我们**先承认引理 1**，并考察即便在该假设下，归约余下部分是否仍然成立。

## 4. 验证离散 MIMO 解中的缺口

与第 2.2 节所述的 LWE 归约类似，格解码实例的变换所得 MIMO 样本，其有效高斯噪声可能具有某个未知尺度 \(\beta\le\alpha\)，而非 MIMO 预言机所期望的尺度 \(\alpha\)。误差处理流程试图用独立高斯噪声填充该有效噪声，使所得样本具有所需的噪声分布。由于原始尺度 \(\beta\) 未知，该流程要尝试多项式数量个填充参数，并需要一种高效方法判断预言机是否返回了正确的秘密。[4] 的引理 2 意在提供该验证流程。

**引理 2 [4]（验证 MIMO-Search\(_{M,\alpha,k}\) 的解）。** 存在高效算法：给定 \(\mathbf x'\) 与多项式数量个来自 \(A_{\mathbf x,\alpha,k}\)、对应未知 \(\mathbf x\) 的样本，以压倒性概率输出是否 \(\mathbf x=\mathbf x'\)<sup>4</sup>（脚注 4：原文此处分布记号写作 \(A_{\mathbf x,\alpha,k}\)；按上下文其应为 \(A_{M,\alpha,k}\)（\(M\) 为星座参数、\(\mathbf x\) 为未知秘密），本页按原文照录并在此说明）。

**证明策略。** 为构建连续 MIMO 搜索问题的验证器，Dean 与 Goldsmith 的构造取差值 \(\mathbf y-\langle\mathbf a,\mathbf x'\rangle\)，其中 \(\mathbf y\) 是真实 MIMO 样本 \((\mathbf a,\mathbf y)\) 的一部分；随后区分两种分布以验证是否 \(\mathbf x=\mathbf x'\)。这与其 LWE 归约中的对应物（[8] 的引理 3.6）采用相同证明策略。区别在于：Dean 与 Goldsmith 构造中所得样本仍是 0 中心高斯分布，但方差比原始噪声分布 \(\nu_\alpha\) 更宽；而在 Regev 的 LWE 构造中，所得样本分布在环面 \(\mathbb T\) 上具有比原始缠绕噪声分布更小的周期 \(1/k\)。

**引理 4.1（修正后的验证引理）。** 设 \(\mathbf x,\mathbf x'\in\{0,\ldots,M-1\}^n\)，并假设对某个多项式 \(p\) 有 \(\frac{k}{M\alpha}\ge\frac{1}{p(n)}\)。则存在概率多项式时间算法：给定 \(\mathbf x'\) 与多项式数量个来自 \(A_{\mathbf x,\alpha,k}\)、对应未知 \(\mathbf x\) 的独立样本，以压倒性概率判定是否 \(\mathbf x=\mathbf x'\)。

该修正修复了 Dean 与 Goldsmith 引理 2 证明中的两个问题：第一，MIMO 分布样本中缺失的除数 \(M\)；第二，由于 Dean 与 Goldsmith 的方法基于分布连续且考察两样本方差之差，最佳做法是考察两方差的**相对差**而非绝对差。

**证明。** 该构造产生以下两种结果之一：

$$
\mathbf y-\langle\mathbf a,\mathbf x'\rangle/M=\mathbf e+\langle\mathbf a,\mathbf x-\mathbf x'\rangle/M=\begin{cases}\mathbf e,&\text{若 }\mathbf x=\mathbf x',\\ \mathbf e+\langle\mathbf a,\mathbf x-\mathbf x'\rangle/M,&\text{若 }\mathbf x\ne\mathbf x'.\end{cases}
$$

给定 \(\mathbf a\sim\nu_k^n\) 为取自 \(\mathcal N(0,k^2/2\pi)\) 的 i.i.d. 高斯向量、\(\mathbf d=\mathbf x-\mathbf x'\) 为常向量，其内积为 i.i.d. 高斯的线性组合，服从

$$
\langle\mathbf a,\mathbf d\rangle/M\sim\mathcal N\left(0,\frac{\|\mathbf d\|^2k^2}{M^22\pi}\right).
$$

将其与独立噪声相加，得到更宽的高斯分布

$$
\mathbf e+\langle\mathbf a,\mathbf d\rangle/M\sim\mathcal N\left(0,V_1=\frac{\alpha^2}{2\pi}+\frac{\|\mathbf d\|^2k^2}{M^22\pi}\right).
$$

余下任务是通过比较两方差的相对差来区分分布 \(\nu_\alpha=\mathcal N(0,V_0=\frac{\alpha^2}{2\pi})\) 与上述分布：

$$
\frac{V_1-V_0}{V_0}=\frac{\|\mathbf d\|^2k^2}{M^2\alpha^2}.
$$

当 \(\|\mathbf d\|=1\) 时该比值最小；证明其不可忽略需要 \(\frac{k}{M\alpha}\ge\frac{1}{{\rm poly}(n)}\)。

**注 4.1。** Dean 与 Goldsmith 对星座尺寸与噪声的下界组合——最小噪声 \(m\alpha/k^2>\sqrt n\)、星座尺寸 \(M>m2^n\log\log n/\log n\)——迫使比值 \(k/(M\alpha)\) 可忽略，从而与修正后的引理 2 矛盾。若该比值不可忽略，则使用足够大的多项式数量样本即可实现解验证。另有工作 [10, 9, 5] 中的攻击与 ILWE 恢复算法 [1] 表明，在涉及样本数、噪声幅度与公开矩阵分布的条件下可求解相关的非模含噪线性系统；进一步分析应表明，修补引理 2 所需的参数区域与这些攻击和恢复算法可高效恢复的区域重叠。

## 5. BDD 到离散 MIMO 归约中的缺口

在承认前述归约步骤的前提下，[4] 的引理 1 与引理 3 意在使 MIMO 预言机从所构造的、有效噪声具有未知尺度 \(\beta\le\alpha\) 的离散 MIMO 样本中恢复秘密<sup>5</sup>（脚注 5：本文分析中承认引理 4–6，聚焦于必须建立"所构造样本服从所需 MIMO 分布"的那些步骤）。该归约经典部分的中心步骤随即是用该预言机求解 BDD；所得 BDD 预言机随后被 Regev 式迭代归约的量子阶段用于产生更小尺度的离散高斯样本。引理 7 声称建立了从 BDD 到离散 MIMO 解码的这一归约。

**引理 7 [4]（MIMO-search\(_{M,\alpha,k}\) 到 BDD\(_{L,r}\)）。** 设 \(\alpha>0\)、\(k>0\)、\(m>0\)，且 \(M>m2^n\log\log n/\log n\)。假设可访问一个预言机，它对所有 \(\beta\le\alpha\)、在给定多项式数量个来自 \(A_{M,\beta,k}\) 的样本时能（在未知 \(\beta\) 的情况下）求出 \(\mathbf x\)。则存在高效算法：给定 \(n\) 维格 \(L(\mathbf A)\)、数 \(r>\sqrt2\eta(L(\mathbf A))\)、以及到 \(L(\mathbf A)\) 距离 \(d<M\sigma\alpha/(k^2r\sqrt2)\) 的目标点 \(\mathbf y\)（其中 \(\sigma\) 为 \(\mathbf A^T\mathbf A\) 的最小特征值），以压倒性概率返回 \(L(\mathbf A)\) 中唯一最接近 \(\mathbf y\) 的 \(\mathbf x\)。

**证明策略 [4]。** 该引理的证明试图改造 LWE 归约的引理 3.11 [8]：取 BDD 目标 \(\mathbf y\) 与随机对偶格向量 \(\mathbf v\leftarrow D_{L^*,r}\)，产生样本

$$
\left(k\mathbf v/r,\ k\langle\mathbf v,\mathbf A^{-1}\mathbf y\rangle/rM+k\mathbf e/r\right),
$$

并分别考察样本的两部分，论证它来自定义域 \((k/r)L^*\times\mathbb R\) 上的离散 MIMO 分布。第一部分显然匹配离散 MIMO 样本的第一部分。由 BDD\(_{L,d}\) 的定义，\(\mathbf y=\mathbf A\mathbf c+\delta\) 且 \(\|\delta\|<d\)，故第二部分可改写为

$$
k\langle\mathbf v,\mathbf A^{-1}\mathbf y\rangle/rM+k\mathbf e/r=\underbrace{\langle k\mathbf v/r,\mathbf c\rangle/M}_{\text{嵌入的秘密}}+\underbrace{\left(\langle k\mathbf v/r,\mathbf A^{-1}\delta\rangle/M+k\mathbf e/r\right)}_{\text{聚合噪声}}.
$$

证明随后继续讨论为何这也服从所需的离散 MIMO 分布。

### 5.1 分布失配

**命题 5.1。** 设 \(L(\mathbf A)\) 为满秩格，\(\mathbf y=\mathbf A\mathbf c+\delta\) 为任意 BDD\(_{L,d}\) 目标，其中 \(\mathbf c\in\mathbb Z^n\)、\(0<d<\lambda_1(L)/2\)。独立采样 \(\mathbf v\leftarrow D_{L^*,r}\) 与 \(\eta_0\leftarrow\nu_{k\alpha/r}\)，定义 \(\mathbf a=k\mathbf v/r\)，并构造

$$
b=\langle\mathbf a,\mathbf A^{-1}\mathbf y\rangle/M+\eta_0.
$$

若 \(\mathbf c\notin\Omega^n\) 或 \(\delta\ne\mathbf 0\)，则不存在秘密 \(\mathbf s\in\Omega^n\) 与参数 \(0<\beta\le\alpha\)，使得 \((\mathbf a,b)\) 具有如下得到的离散 MIMO 分布 \(D_{M,\beta,k}\)：独立采样 \(\mathbf a\leftarrow D_{(k/r)L^*,k}\) 与 \(e\leftarrow\nu_\beta\)，并输出 \((\mathbf a,\langle\mathbf a,\mathbf s\rangle/M+e)\)。

**证明。** 令 \(\mathbf z=\mathbf A^{-1}\mathbf y=\mathbf c+\mathbf A^{-1}\delta\)、\(\tau=k\alpha/r\)。由于 \(\mathbf v\leftarrow D_{L^*,r}\)，缩放样本 \(\mathbf a=k\mathbf v/r\sim D_{(k/r)L^*,k}\)。在该分布支撑上给定任意固定的 \(\mathbf a\)，所构造的第二分量服从

$$
P_{b|\mathbf a}=\mathcal N\left(\frac{\langle\mathbf a,\mathbf z\rangle}{M},\frac{\tau^2}{2\pi}\right).\tag{2}
$$

反设存在 \(\mathbf s\in\Omega^n\) 与 \(0<\beta\le\alpha\) 使 \((\mathbf a,b)\) 具有所声称的离散 MIMO 分布 \(D_{M,\beta,k}\)。则在同一个 \(\mathbf a\) 条件下必有

$$
Q_{b|\mathbf a}=\mathcal N\left(\frac{\langle\mathbf a,\mathbf s\rangle}{M},\frac{\beta^2}{2\pi}\right).\tag{3}
$$

两个条件高斯分布相等，就必须对 \(D_{(k/r)L^*,k}\) 支撑上的每个 \(\mathbf a\) 满足 \(\beta=\tau\) 且 \(\langle\mathbf a,\mathbf z-\mathbf s\rangle=0\)。由于 \((k/r)L^*\) 满秩且张成 \(\mathbb R^n\)，这蕴含 \(\mathbf z=\mathbf s\)。因此 \(\mathbf A^{-1}\mathbf y=\mathbf s\in\Omega^n\subseteq\mathbb Z^n\)，从而 \(\mathbf y=\mathbf A\mathbf s\in L(\mathbf A)\) 本身即为格向量。由于 \(\mathbf A\mathbf c\) 是距 \(\mathbf y\) 唯一的最近格向量，故 \(\mathbf A\mathbf c=\mathbf y=\mathbf A\mathbf s\)；由 \(\mathbf A\) 非奇异得 \(\mathbf c=\mathbf s\in\Omega^n\) 且 \(\delta=\mathbf 0\)，与"\(\mathbf c\notin\Omega^n\) 或 \(\delta\ne\mathbf 0\)"的假设矛盾。∎

以下关于 [4] 的证明策略为何失效的关键评论。

**注 5.1（缺失条件随机性）。** 在 Regev 的构造 [8] 中，映射 \(\mathbf v\mapsto\mathbf a=L^{-1}\mathbf v\bmod p\) 是多对一的，故揭示 \(\mathbf a\) 并不能完全确定 \(\mathbf v\)。在给定公开值 \(\mathbf a\) 的条件下，\(\mathbf v\) 仍按陪集 \(pL+L\mathbf a\) 上的离散高斯分布，即 \(\mathbf v|\mathbf a\sim D_{pL+L\mathbf a,r}\)。因此，在公开分量 \(\mathbf a\) 已知后，项 \(\langle\mathbf x',\mathbf v\rangle/p\) 仍然是随机的。Regev 对该条件分布应用推论 3.10 [8]，并证明该项连同独立高斯噪声 \(e\) 与某个未知尺度 \(\beta\le\alpha\) 的中心高斯统计接近。由于论证对每个可能的公开值 \(\mathbf a\) 都成立，它建立了所需的联合分布接近性。

Dean 与 Goldsmith 则定义 \(\mathbf a=\frac{k}{r}\mathbf v\)。对 \(k,r>0\)，该映射是单射，故揭示 \(\mathbf a\) 便完全确定 \(\mathbf v\)。对固定 BDD 目标，附加项 \(\langle\mathbf a,\mathbf q\rangle+\langle\mathbf a,\mathbf A^{-1}\delta\rangle/M\) 在给定 \(\mathbf a\) 时是确定性的；因此所构造样本 \((\mathbf a,b)\) 第二部分的**条件分布**是一个中心依赖公开分量的高斯，而非独立的 0 中心高斯。

**注 5.2（缺失模数）。** 在 LWE 归约的引理 3.10 [8] 中，所构造样本 \((\mathbf a,b)\) 具有形式

$$
\mathbf a=L^{-1}\mathbf v\bmod p,\qquad b=\langle\mathbf x,\mathbf v\rangle/p+e\bmod 1=\langle\kappa_{L^*}(\mathbf x),\mathbf v\rangle/p+\Big(\underbrace{\langle\mathbf x'/p,\mathbf v\rangle}_{\text{随机}}+e\Big)\bmod 1,\tag{4}
$$

$$
\langle\kappa_{L^*}(\mathbf x),\mathbf v\rangle\bmod p=\langle\mathbf s,\mathbf a\rangle\bmod p,\tag{5}
$$

故把式 (5) 两边除以 \(p\) 再模 1 约简可消去整数项，仅留下

$$
\langle\kappa_{L^*}(\mathbf x),\mathbf v\rangle/p\bmod 1=\langle\mathbf s,\mathbf a\rangle/p\bmod 1,
$$

这正是 LWE 分布样本所需项。此外，如上一注所述，以 \(\mathbf a\) 为条件使 \(\mathbf v\) 服从平移陪集上的离散高斯 \(D_{pL+L\mathbf a,r}\)，故与式 (4) 中的噪声 \(e\) 相加后成为尺度更大的连续高斯噪声。

在 [4] 引理 7 的构造中，若 \(\mathbf c\notin\Omega^n\) 则存在 \(\mathbf q\in\mathbb Z^n\) 使 \(\mathbf c=\mathbf s+M\mathbf q\)。所构造样本 \((\mathbf a,b)\) 形如

$$
\mathbf a=k\mathbf v/r,\qquad b=\langle\mathbf a,\mathbf s\rangle/M+\Big(\underbrace{\langle\mathbf a,\mathbf q\rangle+\langle\mathbf a,\mathbf A^{-1}\delta\rangle/M}_{\text{非整数，且固定}}+\eta_0\Big).\tag{6}
$$

由于 \(\mathbf a\sim D_{(k/r)L^*,k}\) 具有非整数格支撑，式 (6) 可改写为 \(b=\langle\mathbf a,\mathbf s\rangle/M+l(\mathbf a)+\theta(\mathbf a)+e\)，其中

$$
l(\mathbf a)=\left\lfloor\langle\mathbf a,\mathbf q\rangle+\langle\mathbf a,\mathbf A^{-1}\delta\rangle/M\right\rfloor,\qquad\theta(\mathbf a)\in[0,1).
$$

同样由注 5.1，在给定 \(\mathbf a\) 时 \(l(\mathbf a)+\theta(\mathbf a)\) 是确定性的。即便补上缺失的模 1，项 \(\theta(\mathbf a)\) 仍是常数项，它将平移噪声 \(e\) 从而与离散 MIMO 噪声分布失配。

**注 5.3（均值失配的统计可检测性）。** 命题 5.1 证明两个分布 \(P_{b|\mathbf a}\) 与 \(Q_{b|\mathbf a}\) 并不相同；但仍有可能它们在可忽略的统计距离之内，从而仍可利用离散 MIMO 预言机。

为分析其统计距离，先注意 \(P_{b|\mathbf a}\) 与 \(Q_{b|\mathbf a}\) 可以具有相同方差。在引理 7 [4] 的证明中，所构造样本 \((\mathbf a,b)\) 含独立噪声项 \(\eta_0=k\mathbf e/r\)（\(e\leftarrow\nu_\alpha\)）。为使 Dean 与 Goldsmith 能应用其引理 5，噪声尺度须满足 \(k\alpha/r\le\alpha\)，故可取 \(\beta=k\alpha/r\)。记 \(\sigma_0=\beta/\sqrt{2\pi}\)，两分布变为

$$
P_{b|\mathbf a}=\mathcal N\left(\frac{\langle\mathbf a,\mathbf z\rangle}{M},\sigma_0^2\right),\qquad Q_{b|\mathbf a}=\mathcal N\left(\frac{\langle\mathbf a,\mathbf s\rangle}{M},\sigma_0^2\right).
$$

两个等方差高斯分布的统计距离为

$$
\Delta\left(\mathcal N(\mu_1,\sigma^2),\mathcal N(\mu_2,\sigma^2)\right)=4\Phi\left(\frac{|\mu_1-\mu_2|}{2\sigma}\right)-2,
$$

其中 \(\Phi\) 为 \(\mathcal N(0,1)\) 的累积分布函数。由于所构造样本与离散 MIMO 样本在 \(\mathbf a\) 上有相同边缘分布，其联合分布的统计距离为

$$
\Delta\left(P_{(\mathbf a,b)},Q_{(\mathbf a,b)}\right)=\mathbb E_{\mathbf a}\left[4\Phi\left(\frac{\sqrt{2\pi}\,|\langle\mathbf a,\mathbf z-\mathbf s\rangle|}{2M\beta_0}\right)-2\right].
$$

回顾 \(\mathbf z=\mathbf c+\mathbf A^{-1}\delta=\mathbf s+M\mathbf q+\mathbf A^{-1}\delta\)。因此，较大的 \(M\) 可抑制 BDD 偏移项 \(\langle\mathbf a,\mathbf A^{-1}\delta\rangle/M\)，却**抑制不了**系数约简项 \(\langle\mathbf a,\mathbf q\rangle\)。故上述统计距离对某些限制性 BDD 目标（\(\langle\mathbf a,\mathbf q\rangle\) 较小者）可能可忽略，但 Dean 与 Goldsmith 未给出任何论证说明它对引理 7 所需的任意目标都可忽略。

### 5.2 对引理 7 的可能修补

我们简要考虑 [4] 中引理 7 证明的若干可能修改。它们似都不构成局部修补：要么使部分分布失配未解决，要么改变了所声称归约的源问题或目标问题。

第一种可能是把 \(\mathbf y=\mathbf A\mathbf c+\delta\) 中的 BDD 系数向量限制为 \(\mathbf c\in\Omega^n\)。这删除了系数约简项，因为可取 \(\mathbf s=\mathbf c\)、\(\mathbf q=\mathbf 0\)。然而 Dean 与 Goldsmith 的响应仍为

$$
b=\frac{\langle\mathbf a,\mathbf s\rangle}{M}+\frac{\langle\mathbf a,\mathbf A^{-1}\delta\rangle}{M}+\eta_0,
$$

故 BDD 偏移仍产生依赖 \(\mathbf a\) 的均值位移。此外，\(\mathbf c\in\Omega^n\) 的限制改变了源问题：归约不再接收靠近 \(L(\mathbf A)\) 的任意 BDD 目标，而是接收来自受限集合 \(\{\mathbf A\mathbf c+\delta\mid\mathbf c\in\Omega^n,\|\delta\|^2<d\}\) 的目标。这是有限子集 \(\mathbf A\Omega^n\subset L(\mathbf A)\) 附近的有界系数 BDD 问题；标准 BDD 允许最近格向量具有 \(\mathbb Z^n\) 中任意系数向量。因此，还需要一个从标准 BDD 到该变体的单独归约。该限制也不会产生与 Regev 归约 [8] 所用 BDD\({\rm mod}\ p\) 问题类似的 BDD\({\rm mod}\ M\) 问题。

第二种可能是仅揭示公开分量的模像，例如 \(\mathbf a=\mathbf a\bmod M\mathbb Z^n\)，而非完整向量 \(\mathbf a\)。这会使公开映射可能是多对一的，但并不能重现 Regev 所用的条件陪集结构。特别地，两个提升 \(\mathbf a\) 与 \(\mathbf a+M\mathbf t\) 具有相同模像，但其秘密项满足

$$
\frac{\langle\mathbf a+M\mathbf t,\mathbf s\rangle}{M}=\frac{\langle\mathbf a,\mathbf s\rangle}{M}+\langle\mathbf t,\mathbf s\rangle.
$$

由于 Dean 与 Goldsmith 的响应并未模 1 约简，该附加整数会留在响应中。定义公开分量为 \(\mathbf a\) 的新离散 MIMO 分布将改变离散 MIMO 问题，并需要新的引理 1 类比来把修改后的离散问题与原连续 MIMO 问题联系起来。

第三种可能是把响应替换为

$$
b=\left(\frac{\langle\mathbf a,\mathbf s\rangle}{M}+\mu_{\mathbf s}(\mathbf a)+\eta_0\right)\bmod1.
$$

如注 5.2 所示，该修改把不希望的位移替换为 \(\mu_{\mathbf s}(\mathbf a)\bmod1\)，但不保证其消失。此外，若完整向量 \(\mathbf a\) 仍公开，则注 5.1 中讨论的单射性不变；在给定 \(\mathbf a\) 时余下的模位移仍是确定性的，缠绕后的噪声仍以依赖 \(\mathbf a\) 的值居中。

把模 1 响应与精心选择的公开分量商结合起来，有可能同时恢复整数消去与条件随机性。然而此类构造将是一个缠绕或周期问题，更接近 LWE [8] 或连续 LWE [2]，而非 Dean 与 Goldsmith 原本的非模 MIMO 问题。

基于上述分析，修补引理 7 需要的远不止纠正某个孤立参数或添加一次模运算。成功的替代方案必须同时做到：把任意 BDD 系数映射进 MIMO 星座、在给定公开分量的条件下保留足够随机性、并产生允许尺度下的独立中心噪声。上述考虑过的修改目前都不满足全部三项要求。

## 6. 超越 Dean–Goldsmith 构造

受同一 MIMO 思想启发，后续工作 [7] 使用大规模 MIMO 信道与预编码引入了 MMIMO-Precoding\(_{S,\sigma_e,J}\) 问题。其构造为合法接收机提供秘密的"好"格基，而窃听者只得到相应的"坏"公开基。因此合法接收机被期望在多项式时间内解码，而窃听者据称面临指数级困难的 CVP 实例。该陷门不对称性旨在解决 [9] 所指出的 [4] 中的解码正确性问题。然而，[7] 的定理 2 所声称的从 BDD 到 MMIMO-Precoding 的归约，存在与 Dean 与 Goldsmith 引理 7 相同的问题（见第 5 节）。

**定理 2 [7]（MMIMO-Precoding\(_{S,\sigma_e,J}\) 到 BDD\(_{L(\mathbf A),\sqrt N\sigma_e}\) 问题）。** 设 \(S\ge m2^N\log\log N/\log N\)，\(\sigma_e\) 为噪声标准差，\(x\in[0,S)\)，\(J\) 为所提出的预编码矩阵，\(N\) 为天线数。假设存在能求解 MMIMO-Precoding\(_{S,\sigma_e,J}\) 问题的高效算法，则存在高效算法：给定 \(N\) 维格 \(L(\mathbf A)\) 时可求解 BDD\(_{L(\mathbf A),\sqrt N\sigma_e}\) 问题。因此，由于 BDD\(_{L(\mathbf A),\sqrt N\sigma_e}\) 问题被假定为困难，可得出结论 MMIMO-Precoding\(_{S,\sigma_e,J}\) 问题困难。

其预期归约证明中关键的问题步骤与 [4] 中的构造相同：第二项是确定性的，从而把高斯噪声分布平移到非 0 中心。

$$
\frac{k}{r}\langle\mathbf v,\mathbf B^{-1}\mathbf y\rangle+e'=\left\langle\frac{k}{r}\mathbf v,\mathbf B^{-1}(\mathbf B\mathbf X+\delta)\right\rangle+e'=\left\langle\frac{k}{r}\mathbf v,\mathbf X\right\rangle+\underbrace{\left\langle\frac{k}{r}\mathbf v,\mathbf B^{-1}\delta\right\rangle}_{\text{确定性}}+e'.
$$

## 7. 结论

我们考察了修订版 Dean–Goldsmith 从格问题到 MIMO 解码的归约，并表明其已发表的证明并未建立所声称的困难性结果。若干步骤未能论证所构造样本服从 MIMO 预言机所需的分布。这些问题的更广泛根源在于：Regev 的 LWE 归约所用的模消去与条件随机性在 MIMO 语境中缺失。我们的分析识别出归约中的证明层面失效，从而与已有的解码攻击形成互补，并对采用同一策略的后续构造提出了类似担忧。这些发现并不排除 MIMO 系统的物理层安全，但表明它并未由现有的格归约所建立。

**致谢。** 作者感谢 Yuxuan Li 博士对本问题的初步研究。本工作部分受 Deakin University 的 SEBE PRESS Funding Scheme 2024 资助。

## 参考文献（英文原书目）

[1] Jonathan Bootle, Claire Delaplace, Thomas Espitau, Pierre-Alain Fouque, and Mehdi Tibouchi. LWE without modular reduction and improved side-channel attacks against BLISS. In International Conference on the Theory and Application of Cryptology and Information Security, pages 494–524. Springer, 2018.

[2] Joan Bruna, Oded Regev, Min Jae Song, and Yi Tang. Continuous LWE. In Proceedings of the 53rd Annual ACM SIGACT Symposium on Theory of Computing, pages 694–707, 2021.

[3] Thomas Dean and Andrea Goldsmith. Physical-layer cryptography through massive MIMO. In 2013 IEEE Information Theory Workshop (ITW), pages 1–5. IEEE, 2013.

[4] Thomas R Dean and Andrea J Goldsmith. Physical-layer cryptography through massive MIMO. IEEE Transactions on Information Theory, 63(8):5419–5436, 2017.

[5] Valery Korzhik, Vladimir Starostin, and Kseniia Akhrameeva. Investigation of keyless cryptosystem proposed by Dean and Goldsmith. In 2017 21st Conference of Open Innovations Association (FRUCT), pages 194–201. IEEE, 2017.

[6] Arjen K. Lenstra, Hendrik Willem Lenstra, Jr., and László Lovász. Factoring Polynomials with Rational Coefficients. Mathematische Annalen, 261(4):515–534, 1982.

[7] Senlin Liu, Tong Gao, Yijian Liu, and Xianhui Lu. Physical-layer public key encryption through massive MIMO. In Proceedings of the 19th ACM Asia Conference on Computer and Communications Security, pages 353–365, 2024.

[8] Oded Regev. On lattices, learning with errors, random linear codes, and cryptography. Journal of the ACM (JACM), 56(6):1–40, 2009.

[9] Amin Sakzad and Ron Steinfeld. Comments on "Physical-layer cryptography through massive MIMO". arXiv preprint arXiv:2001.02632, 2020.

[10] Ron Steinfeld and Amin Sakzad. On massive MIMO physical layer cryptosystem. In 2015 IEEE Information Theory Workshop-Fall (ITW), pages 292–296. IEEE, 2015.

## 图注与表注

**图注：** 图 1（从格问题到 LWE 问题的归约关系图：GAPSVP、SIVP、DGS、LWE、BDD 之间的关系，含经典与量子两类箭头，以及"用 LWE 预言机迭代求解 DGS"环节）与图 2（LWE 归约的迭代过程：从假定的 \({\rm LWE}_{p,\Psi_\alpha}\) 预言机与离散高斯样本出发，直到重现的离散高斯样本足够短以求解格问题；图中标注"build oracle""smaller error""generalise""quantum""shorter"以及 CVP 的模变换环节）的图注已随文置于第 2.2 节相应位置。

**表注：** 原文共 2 张表：表 1（记号表，4 行）、表 2（本文所考虑分布的比较，5 行：LWE、CLWE、ILWE、MIMO、Discrete-MIMO），均已在本页第 2.5 节逐格转写。

**本页范围与校对状态：** 本页覆盖原文摘要、第 1–7 节全部正文与小节（2.1–2.5、3、4、5.1–5.2、6、7）、定义 2.1–2.9、原引理 1–2 的陈述与证明策略、修正后的引理 4.1 及其证明、命题 5.1 及其证明、注 3.1/4.1/5.1–5.3、式 (1)–(6)、表 1–2（逐格转写，用 PDF 渲染页 p6 核对）、图 1–2 图注、参考文献 [1]–[10]、致谢段。原文无附录。**原文疑点/说明（已加注）：** ① 引理 1 的脚注指出原文"MIMO-Decision"是笔误、应为"MIMO-Search"；② 引理 2 与引理 4.1 的样本分布原文写作 \(A_{\mathbf x,\alpha,k}\)（以未知秘密为下标），按上下文应为 \(A_{M,\alpha,k}\)，本页按原文照录并说明；③ 引理 7 中距离上界原文写作 \(d<M\sigma\alpha/(k^2r\sqrt2)\)，其中 \(\sigma\) 为 \(\mathbf A^T\mathbf A\) 的最小特征值、\(\alpha\) 为噪声参数——该乘积记法是否应理解为 \(\sigma\cdot\alpha\) 原文未进一步说明，本页按原文照录。逐句逐式终校未做；供后续 QA 重点核对：式 (2)–(6) 的分布/模运算记号，命题 5.1 证明中的 \(\tau=k\alpha/r\)，以及引理 7 参数条件。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
