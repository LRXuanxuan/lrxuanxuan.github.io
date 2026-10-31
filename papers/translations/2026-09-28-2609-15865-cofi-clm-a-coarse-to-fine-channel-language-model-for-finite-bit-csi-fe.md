---
layout: page
title: "CoFi-CLM：面向有限比特 CSI 反馈的粗到细信道语言模型｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-15865-cofi-clm-a-coarse-to-fine-channel-language-model-for-finite-bit-csi-fe/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/db25f5994cd60640/) · [原文 arXiv](https://arxiv.org/abs/2609.15865) · [全部目录](/papers/catalog/)

# CoFi-CLM：面向有限比特 CSI 反馈的粗到细信道语言模型

**原题：** CoFi-CLM: A Coarse-to-Fine Channel Language Model for Finite-Bit CSI Feedback  
**作者：** Chao Zhang、Cheng Luo（通讯作者）、Luping Xiang、Kun Yang  
**单位：** 南京大学计算机软件新技术全国重点实验室（南京 210008，中国）与南京大学智能软件与工程学院（苏州校区，苏州，中国）。通讯邮箱：chengluo@nju.edu.cn。  
**版本：** arXiv:2609.15865v1（eess.SP），2026 年 9 月 14 日，原文 6 页。  
**代码：** https://github.com/doovvv/CoFi-CLM  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–V 节及全部小节（含编号 1)、2) 子节外的 A–F 小节）、式 (1)–(18)、表 I–II（逐格转写）、图 1–3 图注、参考文献 [1]–[12]（英文原条目）均按原文结构录入；原文无附录、无致谢段。逐句逐式终校未做。

## 摘要

在频分双工（frequency-division duplex，FDD）大规模多输入多输出（multiple-input multiple-output，MIMO）系统中，用户设备（user equipment，UE）必须在严格受限的有限比特反馈预算下上报高维下行信道状态信息（channel state information，CSI）。深度学习（deep learning，DL）因能捕捉复杂信道相关结构并学习紧凑的 CSI 表示，已成为 CSI 压缩的有力工具。然而，从有限反馈中恢复精细尺度信道结构仍然具有挑战性。为应对该挑战，我们提出**粗到细信道语言模型**（Coarse-to-Fine Channel Language Model，CoFi-CLM）：一个部署在基站（base station，BS）侧的大型 AI 模型，显式学习粗尺度与细尺度 CSI 表示之间的依赖关系。具体地，UE 从学习到的码本上报粗 token 索引，而 CoFi-CLM 在一次 Transformer 前向传播中，以该反馈为条件预测未被上报的细 token 索引上的分布。一个双路径解码器把直接粗尺度重建与生成的细尺度重建相融合。把细 token 预测与融合集中在基站侧，使信道语言模型（channel language model，CLM）的容量可以扩展，而不增加 UE 侧的计算或存储开销。在 64 至 160 反馈比特范围内，CoFi-CLM 在已见场景与未见场景上都持续优于对比方法。在 128 比特下，其在两个数据集上相对近期大型 AI 模型基线的归一化均方误差（normalized mean square error，NMSE）改善约 1 dB。已见与未见场景之间的性能差距进一步支持了其在该信道模型下的泛化能力。源代码已公开于 https://github.com/doovvv/CoFi-CLM。

**关键词：** 大规模 MIMO、CSI 反馈、大型 AI 模型、信道语言模型、条件 token 预测、Transformer。

## I. 引言

在频分双工（FDD）大规模 MIMO 系统中，由于上下行互易性不可直接利用，基站依赖用户设备上报的下行 CSI 进行预编码。原始 CSI 的反馈开销随天线数与子载波数迅速增长 [1]。

传统 CSI 反馈主要采用基于码本的量化或压缩感知（compressive sensing，CS）。前者用预定义的有限码本量化信道方向或预编码器，并反馈所选条目的索引 [2]；随着基站天线数增长，维持足够量化分辨率需要更大码本，增加存储与搜索复杂度 [1]。基于 CS 的方法则利用大规模 MIMO 信道在角度—时延域的近似稀疏性以及子载波间的共同支撑 [3]，其重建性能依赖所假设稀疏模型的准确性，且迭代恢复带来额外计算开销 [1]。

数据驱动的 CSI 反馈改为从信道样本中学习压缩映射。CsiNet 提出一种自编码器，把角度—时延域 CSI 矩阵映射为低维隐向量并在基站重建 [4]；后续工作通过更深的神经架构与注意力机制改进学习式 CSI 压缩与重建 [5], [6]。

除从连续隐向量直接重建外，基于序列与生成式的 CSI 表示也已被探索：基于序列的方法把 CSI 特征组织为序列交由 Transformer 处理 [6]；掩码 token Transformer 用可学习掩码 token 恢复缺失的 CSI 特征 [7]；基于扩散的方法利用生成先验进行 CSI 重建 [8], [9]。然而，把这些方法应用于粗到细的有限比特反馈时仍存在三个问题。第一，序列元素并非从"反复出现的 CSI 模式"构成的有限学习词表中选择。第二，掩码 token Transformer 在单一表示尺度内运算，未显式建模从有限粗 token 到细尺度 CSI 结构的映射。第三，基于扩散的重建通常在推理时需要多步去噪。

为应对上述局限，我们提出粗到细信道语言模型（CoFi-CLM）：一个用于条件细 token 预测的基站侧信道语言模型（CLM）。它学习从粗反馈到细分辨率 CSI 的跨尺度依赖，并把生成的重建与直接粗解码结合。主要贡献概括如下。

- 我们把有限比特 CSI 恢复表述为"以有限比特粗 token 上下文为条件，预测细 token 分布"的问题。在不同空间分辨率上学习两个 CSI token 化器，分别提供粗、细码本；借助这些码本，该条件预测任务显式建模两种离散 CSI 表示之间的跨尺度依赖。
- 我们提出非对称的 CoFi-CLM 架构：UE 上报粗 token 索引，基站则在一次 Transformer 前向传播中并行预测全部细 token 分布，避免自回归解码与迭代扩散采样；随后把生成的重建与直接粗解码融合，以利用二者的互补信息。把预测与融合集中在基站侧，使模型容量可扩展而不增加 UE 计算或存储。
- 我们在已见与未见场景上、64 至 160 比特的六个实际反馈预算下评估 CoFi-CLM。大型 CLM 在每个评估率上都比最强基线优 0.490–1.245 dB。参数量匹配比较表明该增益不能仅由模型规模解释；重建路径比较表明生成的细尺度信息与直接粗重建互补。在 128 比特下，仅扩展基站侧 CLM 即可进一步提升 0.195–0.203 dB，且复杂度分析证实该扩展不改变 UE 侧计算与存储。

## II. 系统模型与问题表述

### A. FDD CSI 反馈模型

考虑一个 FDD 下行链路：配备 \(N_t\) 根发射天线的基站通过 \(N_f\) 个正交频分复用（orthogonal frequency-division multiplexing，OFDM）子载波服务一个单天线 UE。在子载波 \(n\in\{0,\ldots,N_f-1\}\) 上，接收复基带符号为

$$
y_n=\mathbf h_n^H\mathbf v_n s_n+w_n,\tag{1}
$$

其中 \(\mathbf h_n\in\mathbb C^{N_t}\) 为下行信道向量，\(\mathbf v_n\in\mathbb C^{N_t}\) 为预编码器，\(s_n\in\mathbb C\) 为发射符号，\(w_n\in\mathbb C\) 为加性噪声。下行预编码要求基站获得所有子载波上的 \(\mathbf h_n\)。

按行堆叠信道向量得到空间—频率 CSI 矩阵

$$
\mathbf H=[\mathbf h_0,\ldots,\mathbf h_{N_f-1}]^H\in\mathbb C^{N_f\times N_t}.\tag{2}
$$

由于信道能量通常更集中于角度—时延域 [4]，沿子载波与天线维施加二维离散傅里叶变换，并保留有效区域。令 \(\widetilde{\mathbf H}\in\mathbb C^{N_d\times N_a}\) 表示截断后的角度—时延域 CSI，其中 \(N_d\) 与 \(N_a\) 分别为保留的时延维与角度维。为形成实值神经网络输入，每个复角度—时延域 CSI 矩阵 \(\widetilde{\mathbf H}\) 被转换为双通道张量 \(\mathbf X\)：第一、二通道分别包含归一化实部与虚部，后两维对应时延与角度。令 \(\alpha>0\) 表示用于预处理的数据中保留的实部与虚部 CSI 系数的最大绝对值；除以 \(\alpha\) 把两部分缩放到 \([-1,1]\)，随后平移并重缩放到 \([0,1]\)：

$$
X_{1,:,:}=\frac12\left(\frac{\operatorname{Re}(\widetilde{\mathbf H})}{\alpha}+1\right),\qquad X_{2,:,:}=\frac12\left(\frac{\operatorname{Im}(\widetilde{\mathbf H})}{\alpha}+1\right).\tag{3}
$$

于是 \(\mathbf X\in[0,1]^{2\times N_d\times N_a}\) 是提供给神经网络的实值 CSI 表示。我们取 \(N_t=N_a=32\) 并保留 \(N_d=32\) 个时延系数，输入规模为 \(2\times32\times32\)。

### B. 有限比特 CSI 重建

令 \(B\in\mathbb N\) 为每个 CSI 样本的最大反馈比特数。UE 编码器 \(f_{\rm UE}\) 把 \(\mathbf X\) 映射为二值反馈向量 \(\mathbf b\)，基站解码器 \(g_{\rm BS}\) 产生 \(\widehat{\mathbf X}\)。该有限比特接口表述为

$$
\mathbf b=f_{\rm UE}(\mathbf X)\in\{0,1\}^{B_{\rm act}},\quad B_{\rm act}\le B,\qquad \widehat{\mathbf X}=g_{\rm BS}(\mathbf b),\tag{4}
$$

其中 \(\widehat{\mathbf X}\in\mathbb R^{2\times N_d\times N_a}\)，\(B_{\rm act}\) 为实际反馈长度。假设反馈链路无差错，以隔离数字比特预算的影响。

有限比特 CSI 反馈问题联合设计 \(f_{\rm UE}\) 与 \(g_{\rm BS}\)，以在反馈预算下最小化压缩后的 CSI 重建误差。对信道样本分布 \(p_{\mathbf X}\)，该问题表述为

$$
\min_{f_{\rm UE},g_{\rm BS}}\ \mathbb E_{\mathbf X\sim p_{\mathbf X}}\left[\left\|\mathbf X-g_{\rm BS}(f_{\rm UE}(\mathbf X))\right\|_F^2\right]\quad\text{s.t.}\ B_{\rm act}\le B.\tag{5}
$$

较小的 \(B\) 降低 CSI 反馈开销，但也限制了基站侧重建可用的信息。本工作在若干严格反馈比特预算范围内评估重建精度。

### C. 评价指标

令 \(\mathcal X=\{\mathbf X^{(q)}\}_{q=1}^{N_{\rm test}}\) 表示测试集，\(N_{\rm test}\) 为测试样本数。由于式 (3) 把零复信道系数映射为 0.5，我们先把目标样本与重建样本逐元素中心化，即 \(\bar{\mathbf X}^{(q)}=\mathbf X^{(q)}-0.5\) 与 \(\bar{\widehat{\mathbf X}}{}^{(q)}=\widehat{\mathbf X}^{(q)}-0.5\)。利用这些中心化 CSI 样本，以全局功率比归一化均方误差（NMSE）度量重建精度：

$$
{\rm NMSE}_{\rm dB}=10\log_{10}\frac{\sum_{q=1}^{N_{\rm test}}\left\|\bar{\mathbf X}^{(q)}-\bar{\widehat{\mathbf X}}{}^{(q)}\right\|_F^2}{\sum_{q=1}^{N_{\rm test}}\left\|\bar{\mathbf X}^{(q)}\right\|_F^2}.\tag{6}
$$

NMSE 越低表示 CSI 重建越准确。

## III. 大型 AI 信道语言模型

### A. 概览与非对称部署

图 1 给出所提基站侧大型 AI 信道语言模型的完整处理流程。上半部分描绘在线反馈过程，包含粗 token 提取、有限比特传输、基站侧细 token 生成与双路径重建。UE 只运行轻量粗 token 化器，把当前 CSI 转换为 \(4\times4\) 的粗 token 索引网格，并传输与预算相关的子集。基站利用收到的索引构造 \(4\times4\) 粗 token 上下文，并经直接粗重建路径解码；同时，该上下文为 CLM 提供条件，使 CLM 在一次前向传播中预测细码本上 \(8\times8\) 的分类分布网格。一个可学习融合模块作用于两路重建特征，产生最终 CSI 估计。

细 token 化器单独预训练，并在 CLM 训练期间保持冻结；其编码器与量化器（图 1 虚线下半部分）把真值 CSI 映射为更高分辨率空间网格上的细 token 索引，以提供监督。在线运行时，CLM 用当前样本上报的粗 token 索引构造上下文，并利用学习到的信道先验预测细 token 分布；冻结的细解码器把所得软细嵌入映射为细尺度 CSI 重建。因此主要生成负载留在基站侧，而 UE 只执行粗编码与码本匹配。

**图 1（原文 Fig. 1）：** CoFi-CLM 架构与非对称部署。上半部分展示在线 CSI 反馈与重建；虚线下半部分为离线监督提供细 token 目标。

### B. 粗、细 token 化器

粗、细 token 化器用各自独立学习的码本在不同空间分辨率上表示 CSI。每个码本包含有限个学习向量（称为 token），token 索引是在其码本内标识某 token 的整数；每个 token 化器把每个空间隐向量分配到一个 token 并输出其索引。全文所称"token 反馈"指传输相应索引，"token 预测"指预测这些索引上的分类分布。本节中 \(i\) 与 \(j\) 表示空间索引，而 token 索引标识相应码本中的条目。

粗 token 化器由编码器 \(E_c\)、向量量化器 \(Q_c\) 与解码器 \(D_c\) 组成。对 \(32\times32\) 空间 CSI 网格，它使用有效 \(8\times8\) 图块尺寸，产生 \(4\times4\) 共 \(L_c=16\) 个粗 token。编码器 \(E_c\) 把 \(\mathbf X\) 映射为 16 个 64 维隐向量；对第 \(i\) 个隐向量 \(\mathbf e_{c,i}\)，\(Q_c\) 从含 \(K_c\) 个向量的码本中选择最近条目：

$$
z_{c,i}=\arg\min_{k\in\{1,\ldots,K_c\}}\left\|\mathbf e_{c,i}-\mathbf c_{c,k}\right\|_2^2,\tag{7}
$$

其中 \(\mathbf c_{c,k}\in\mathbb R^{64}\) 为第 \(k\) 个粗 token。整数 \(z_{c,i}\) 为空间索引 \(i\) 处的粗 token 索引，\(\mathbf c_{c,z_{c,i}}\) 为相应量化隐向量；有序向量 \(\mathbf z_c=(z_{c,1},\ldots,z_{c,L_c})\) 为粗 token 索引序列。粗码本用指数滑动平均更新，并与其余模块联合训练。由于 UE 与基站共享该码本，传输一个整数索引即足以让基站恢复其 64 维 token。

细 token 化器在比粗 token 化器更高的空间分辨率上表示 CSI，它独立预训练，由编码器 \(E_f\)、向量量化器 \(Q_f\) 与解码器 \(D_f\) 组成。它使用有效 \(4\times4\) 图块尺寸，产生 \(8\times8\) 共 \(L_f=64\) 个细 token。首先，编码器把 \(\mathbf X\) 变换为细尺度隐矩阵

$$
\mathbf E_f=E_f(\mathbf X)=\left[\mathbf e_{f,1},\ldots,\mathbf e_{f,L_f}\right]^T\in\mathbb R^{L_f\times64}.\tag{8}
$$

每个隐向量 \(\mathbf e_{f,j}\) 对应 \(8\times8\) 细 token 网格中的空间索引 \(j\)。设细码本含 \(K_f=256\) 个 token \(\mathbf c_{f,k}\in\mathbb R^{64}\)，则向量量化器把每个隐向量分配到最近细 token，相应索引为

$$
z_{f,j}=\arg\min_{k\in\{1,\ldots,K_f\}}\left\|\mathbf e_{f,j}-\mathbf c_{f,k}\right\|_2^2,\qquad j=1,\ldots,L_f.\tag{9}
$$

有序向量 \(\mathbf z_f=(z_{f,1},\ldots,z_{f,L_f})\in\{1,\ldots,K_f\}^{L_f}\) 为细 token 索引序列。直接反馈完整序列需要 \(L_f\lceil\log_2K_f\rceil=512\) 比特，超过所考虑的 64–160 比特预算。因此 CoFi-CLM 把 \(\mathbf z_f\) 作为基站侧预测目标，而不纳入反馈载荷。为每个索引取出 token 得到量化隐矩阵，解码器 \(D_f\) 将其映射回 CSI 域：

$$
\widehat{\mathbf X}_{\rm oracle}=D_f\left(\left[\mathbf c_{f,z_{f,1}},\ldots,\mathbf c_{f,z_{f,L_f}}\right]^T\right).\tag{10}
$$

该 oracle 重建使用全部细 token 索引，因此不受反馈比特约束。预训练后，\(E_f\)、\(Q_f\)、\(D_f\) 与细码本保持冻结。两个码本从不同空间尺度的模式中学得，不共享条目或索引语义。

### C. 有限比特粗 token 上下文

令 \(\mathcal S_B\subseteq\{1,\ldots,L_c\}\) 表示预算 \(B\) 下被选用于反馈的空间索引集合，\(N_s=|\mathcal S_B|\)。对每个 \(i\in\mathcal S_B\)，传输粗 token 索引 \(z_{c,i}\) 需要 \(b_c=\lceil\log_2K_c\rceil\) 比特，故实际开销为

$$
B_{\rm act}=N_sb_c\le B.\tag{11}
$$

当预算不足以传输全部 \(L_c\) 个粗 token 索引时，依据训练数据上测得的各空间索引重要性构造嵌套选择集 \(\mathcal S_B\)。

在基站侧，空间索引不在 \(\mathcal S_B\) 中的粗 token 条目被填入共享可学习缺失嵌入 \(\mathbf m_c\in\mathbb R^{64}\)：

$$
\widetilde{\mathbf e}_{c,i}=\begin{cases}\mathbf c_{c,z_{c,i}},&i\in\mathcal S_B,\\ \mathbf m_c,&i\notin\mathcal S_B.\end{cases}\tag{12}
$$

向量 \(\mathbf m_c\) 表示一个未被上报的粗 token 条目，不含任何样本特定信道值。为 \(L_c\) 个空间位置各分配一个检索到的 token 或缺失嵌入，得到定长上下文 \(\widetilde{\mathbf E}_c\in\mathbb R^{L_c\times64}\)。基站在本地填充缺失位置，不增加式 (11) 中的反馈开销。

### D. 基站侧条件细 token 预测

CLM 的核心任务是：由当前 CSI 样本的有限比特粗 token 上下文预测其细 token 分布。训练时，冻结的细 token 化器从真值 CSI 中提取目标索引。参数为 \(\theta\) 的 CLM 把粗上下文投影到 \(d\) 维，并加上二维位置嵌入，形成 \(L_c\) 个粗记忆嵌入；同时，把投影后的粗特征图双线性插值到 \(8\times8\) 网格，并加到 \(L_f=64\) 个可学习细查询及其位置嵌入上。每个 Transformer 解码层在细查询之间施加非因果自注意力，并对整个粗记忆施加交叉注意力。

空间索引 \(j\) 处的最终表示产生 logits \(\boldsymbol\ell_j\in\mathbb R^{K_f}\)。对 \(k\in\{1,\ldots,K_f\}\)，条件概率与相应软细嵌入为

$$
p_{j,k}\triangleq\Pr_\theta\left(z_{f,j}=k\mid\widetilde{\mathbf E}_c\right)=\frac{\exp(\ell_{j,k})}{\sum_{r=1}^{K_f}\exp(\ell_{j,r})},\qquad \widetilde{\mathbf e}_{f,j}=\sum_{k=1}^{K_f}p_{j,k}\mathbf c_{f,k}.\tag{13}
$$

按空间索引顺序堆叠细嵌入得 \(\widetilde{\mathbf E}_f\in\mathbb R^{L_f\times64}\)。全部 \(L_f\) 个细 token 分布在一次前向传播中预测完成，既无需自回归解码、也无需迭代扩散采样。

### E. 双路径重建与训练目标

在有限比特反馈下，两条重建路径作用互补：粗路径从收到的 \(4\times4\) token 上下文直接重建 CSI；细路径则使用基站侧预测的 \(8\times8\) token 表示，它在更高空间分辨率上表示 CSI，但可能含有 token 预测误差。因此融合模块结合两个估计，而不是用生成结果替代直接解码的粗结果。直接粗重建与生成细重建分别为

$$
\widehat{\mathbf X}_c=D_c(\widetilde{\mathbf E}_c),\tag{14}
$$

$$
\widehat{\mathbf X}_f=D_f(\widetilde{\mathbf E}_f),\tag{15}
$$

二者均属于 \(\mathbb R^{2\times N_d\times N_a}\)，其第一维包含 CSI 实部与虚部通道。沿该维拼接 \(\widehat{\mathbf X}_c\)、\(\widehat{\mathbf X}_f\) 与 \(\widehat{\mathbf X}_f-\widehat{\mathbf X}_c\) 得 \(\mathbf s\in\mathbb R^{6\times N_d\times N_a}\)；空间门控 \(\mathbf G_\psi(\mathbf s)\in\mathbb R^{2\times N_d\times N_a}\) 与残差校正器 \(\mathbf R_\psi(\mathbf s)\in\mathbb R^{2\times N_d\times N_a}\) 产生

$$
\widehat{\mathbf X}=\widehat{\mathbf X}_c+\mathbf G_\psi(\mathbf s)\odot\left(\widehat{\mathbf X}_f-\widehat{\mathbf X}_c\right)+\mathbf R_\psi(\mathbf s).\tag{16}
$$

训练同时优化 CSI 重建与细 token 预测。对后者，冻结细 token 化器在每个细空间位置 \(j\) 提供目标索引 \(z_{f,j}\)，CLM 为该目标分配概率 \(p_{j,z_{f,j}}\)。为促使目标 token 获得更高概率，我们在全部 \(L_f\) 个细位置上最小化平均交叉熵损失：

$$
\mathcal L_{\rm token}=-\frac{1}{L_f}\sum_{j=1}^{L_f}\log p_{j,z_{f,j}}.\tag{17}
$$

记 \(\mathcal L_{\rm rec}\)、\(\mathcal L_{\rm coarse}\)、\(\mathcal L_{\rm fine}\) 分别为融合输出、粗输出与生成细输出的重建损失，每个都把 MSE 与对数域 NMSE 结合；分支级损失促使两条路径在融合之前各自保持信息量。\(\mathcal L_{\rm VQ}\) 为粗 token 化器的承诺损失；码本多样性与隐变量方差项构成 \(\mathcal L_{\rm reg}=\lambda_{\rm div}\mathcal L_{\rm div}+\lambda_{\rm var}\mathcal L_{\rm var}\)。完整目标为

$$
\mathcal L=\lambda_r\mathcal L_{\rm rec}+\lambda_c\mathcal L_{\rm coarse}+\lambda_f\mathcal L_{\rm fine}+\lambda_{\rm CE}\mathcal L_{\rm token}+\lambda_{\rm VQ}\mathcal L_{\rm VQ}+\mathcal L_{\rm reg}.\tag{18}
$$

重建项优化 CSI 保真度，而 \(\mathcal L_{\rm token}\) 学习条件分类分布。

## IV. 实验结果

### A. 数据集与评价协议

信道使用 QuaDRiGa [10] 在 3GPP TR 38.901 城市微小区非视距模型 [11] 下生成。载频 2 GHz、带宽 10 MHz，基站在 64 个子载波上使用 32 根天线。数据集含 3,200 个场景、每场景 400 个样本，共 128 万样本。从 3,000 个已见场景中，945,000 个样本用于训练、105,000 个用于验证、150,000 个用于测试；其余 200 个场景保留用于未见场景评估。

对每个未见场景，最后 50 个样本构成公共查询集，共 10,000 个查询样本。这些查询与同一场景中其余 350 个样本、以及与全部已见场景数据都不相交。所有方法均假设反馈链路无差错，并用式 (6) 评估。

### B. 实现细节与基线

细 token 化器预训练以重建绝对 CSI，并在 CLM 训练期间保持冻结。对粗反馈：64、96 与 112 比特设置使用 \(K_c=256\)，分别传输 8、12 与 14 个粗 token 索引；128 比特设置使用 \(K_c=256\) 传输全部 16 个索引，144 与 160 比特设置则分别使用 \(K_c=512\) 与 \(K_c=1024\) 传输全部 16 个索引。

大型 CLM 为 384 维、12 层、12 头的 Transformer，内部前馈维度 1,536。超参数取 \(\lambda_r=1\)、\(\lambda_c=0.25\)、\(\lambda_f=0.1\)、\(\lambda_{\rm CE}=0.02\)、\(\lambda_{\rm VQ}=0.25\)、\(\lambda_{\rm div}=0.05\)、\(\lambda_{\rm var}=0.05\)。优化器为 AdamW，训练 300,000 步、批大小 256；学习率在 1,500 个预热步内线性增至 \(8\times10^{-5}\)，随后按余弦衰减至 \(4\times10^{-6}\)。所有 CLM 运行使用种子 48、混合精度训练与梯度检查点。

我们比较六个模型。前两个是微型 AI 模型（仅在解码器保留一层 Transformer）与小型 AI 模型（编码器与解码器各一层 Transformer）；第三、四个遵循近期大型 AI 模型（large AI model，LAM）CSI 反馈框架 [12]，它在基站侧从连续隐向量重建 CSI，每个元素量化为 4 比特——LAM w/o Prompt 仅使用量化隐向量，Prompt-LAM 则额外以由支撑 CSI 计算出的场景平均幅度提示作为基站解码器条件；第五、六个分别为五层小型 CLM 与所提 12 层大型 CLM。对每个未见场景，前 350 个样本构成支撑集，与查询集不相交。

### C. 不同反馈率下的性能

图 2 比较六个反馈预算下的 NMSE。大型 CLM 在已见与未见场景、全部六个反馈率上都优于外部基线；小型 CLM 也在全部六个反馈预算上优于外部基线。在 128 比特下，大型 CLM 在已见场景上达到 −5.4708 dB、在未见查询上达到 −5.4907 dB，分别比 Prompt-LAM 改善 1.004 dB 与 1.002 dB。

除上述重建增益外，大型 CLM 在全部六个反馈率上的已见—未见 NMSE 最大绝对差仅为 0.043 dB。这一微小差距支持了其在该信道模型下对新散射体实现的泛化能力。这些未见场景结果不使用场景特定支撑数据或在线自适应，因为细 token 预测只依赖当前样本的粗上下文与离线学习的模型。

### D. 参数量匹配比较与基站侧扩展

表 I 列出 128 比特下的模型。小型 CLM 与 Prompt-LAM 的参数量几乎相同，分别为 5.678M 与 5.676M。小型 CLM 在已见与未见查询上的 NMSE 分别比 Prompt-LAM 改善 0.809 dB 与 0.798 dB。这一参数量匹配比较表明，该增益不能仅由模型规模解释。仅扩展基站侧 CLM 可带来进一步 0.195 dB 与 0.203 dB 的改善，同时 UE 架构保持不变。这部分额外增益刻画了一种局限于基站侧的性能—复杂度权衡。

**表 I（原文 Table I）：128 比特下的参数量匹配比较与基站侧扩展**

| 方法 | 参数量 | NMSE（dB）已见 | NMSE（dB）未见查询 |
|---|---|---|---|
| Prompt-LAM | 5.676M | −4.4665 | −4.4888 |
| 小型 CLM | 5.678M | −5.2757 | −5.2872 |
| 大型 CLM | 31.448M | −5.4708 | −5.4907 |

### E. CLM 生成与路径互补性

图 3 在已见场景测试集上，把"由上报粗 token 索引直接支持的重建"与"CLM 生成的重建"以及"完整 CoFi-CLM 输出"分离开来。在 128 比特下，生成分支把粗分支 NMSE 从 −5.1080 dB 改善到 −5.2810 dB；这 0.173 dB 的改善表明 CLM 提供了超出直接粗解码的细尺度信息。可学习融合进一步把 NMSE 降至 −5.4708 dB，相对生成分支再改善 0.190 dB。在 160 比特下，两个独立分支相差约 0.171 dB，而完整模型相对粗分支改善 0.465 dB。因此，CLM 生成为粗重建提供了有益的互补信息。

### F. 以基站为中心的复杂度与部署

CoFi-CLM 把 Transformer、两个解码器与融合模块放在基站侧，只在 UE 侧保留粗 token 化与索引传输。表 II 以批大小 1、每个 \(2\times32\times32\) CSI 样本的理论在线复杂度量化该部署。一次乘加运算（multiply–accumulate，MAC）计为两次浮点运算；离线细编码器不计入，共享粗码本在两端均计数。结果表明基站在参数与 MAC 上占主要部分，因此增加 CLM 容量会提高基站侧成本，而 UE 计算与存储保持不变。

**表 II（原文 Table II）：128 比特下每个 CSI 样本的部署复杂度**

| 模型 | UE 参数量 | UE MACs | 基站参数量 | 基站 MACs | 基站占比（参数） | 基站占比（MACs） |
|---|---|---|---|---|---|---|
| 小型 CLM | 0.811M | 0.224G | 4.302M | 0.828G | 84.1 | 78.7 |
| 大型 CLM | 0.811M | 0.224G | 30.071M | 2.355G | 97.4 | 91.3 |

> **原文疑点：** 表 I 给出大型 CLM 总参数量 31.448M、小型 CLM 5.678M；而表 II 的 UE 与基站参数量之和分别为 30.882M（=0.811+30.071）与 5.113M（=0.811+4.302），分别小约 0.566M 与 0.565M。该差异可由表 II 明确排除离线细 token 化器（"The offline fine encoder is excluded"）解释——两个差值几乎相同（≈0.57M），与同一冻结细编码器的参数规模一致。本页按原文照录两表数值，并在此说明，不作改动。

## V. 结论

本文把有限比特 CSI 恢复表述为"以粗 token 索引为条件预测细 token 索引分布"的问题，并提出 CoFi-CLM。UE 从学习到的粗 VQ 码本上报索引，基站侧 CLM 预测细码本上的分布并融合生成重建与直接重建。在 64–160 反馈比特范围内，CoFi-CLM 在所考虑协议下于每个评估率都优于对比方法；未见场景结果支持 CoFi-CLM 在该信道模型下的跨场景泛化能力。参数量匹配比较表明性能增益不能仅由模型规模解释；重建路径消融展示了 CLM 生成与粗解码之间的互补性。此外，扩展基站侧 CLM 可在不增加 UE 侧计算或存储的情况下进一步提升重建精度。未来工作将在更广泛信道条件下评估该框架，并研究具有更低基站推理成本的自适应速率模型。

**图 2（原文 Fig. 2）：** 64 至 160 反馈比特下的 CSI 重建性能。(a) 使用 150,000 个已见场景测试样本；(b) 所有方法使用相同的 10,000 个未见场景查询样本。横轴为实际反馈比特（64、96、112、128、144、160），纵轴为 NMSE（dB，越低越好）；曲线为微型 AI 模型、小型 AI 模型、LAM w/o Prompt、Prompt-LAM、小型 CLM 与大型 CLM。

**图 3（原文 Fig. 3）：** 直接粗分支、CLM 生成分支与完整 CoFi-CLM 在已见场景上按反馈率给出的 NMSE。横轴为反馈比特，纵轴为 NMSE（dB，越低越好）；数值越低表示重建越好。

## 参考文献（英文原书目）

[1] M. Boloursaz Mashhadi and D. Gündüz, “Deep learning for massive MIMO channel state acquisition and feedback,” Journal of the Indian Institute of Science, vol. 100, pp. 369–382, 05 2020.

[2] D. J. Love, R. W. Heath, V. K. N. Lau, D. Gesbert, B. D. Rao, and M. Andrews, “An overview of limited feedback in wireless communication systems,” IEEE Journal on Selected Areas in Communications, vol. 26, no. 8, pp. 1341–1365, 2008.

[3] Z. Gao, L. Dai, Z. Wang, and S. Chen, “Spatially common sparsity based adaptive channel estimation and feedback for FDD massive MIMO,” IEEE Transactions on Signal Processing, vol. 63, no. 23, pp. 6169–6183, 2015.

[4] C.-K. Wen, W.-T. Shih, and S. Jin, “Deep learning for massive MIMO CSI feedback,” IEEE Wireless Communications Letters, vol. 7, no. 5, pp. 748–751, 2018.

[5] J. Guo, C.-K. Wen, S. Jin, and G. Y. Li, “Convolutional neural network-based multiple-rate compressive sensing for massive MIMO CSI feedback: Design, simulation, and analysis,” IEEE Transactions on Wireless Communications, vol. 19, no. 4, pp. 2827–2840, 2020.

[6] Y. Cui, A. Guo, and C. Song, “TransNet: Full attention network for CSI feedback in FDD massive MIMO system,” IEEE Wireless Communications Letters, vol. 11, no. 5, pp. 903–907, 2022.

[7] M. Zhao, L. Liu, L. Liu, M. Li, and Q. Tian, “Joint channel estimation and feedback with masked token transformers in massive MIMO systems,” arXiv preprint arXiv:2306.06125v2, 2023.

[8] H. Kim, T. Lee, H. Kim, G. De Veciana, M. A. Arfaoui, A. Koc, P. Pietraski, G. Zhang, and J. Kaewell, “Generative diffusion model-based compression of MIMO CSI,” in ICC 2025 - IEEE International Conference on Communications, 2025, pp. 6323–6328.

[9] Y. Cheng, F. Meng, J. Zou, J. Xie, Z. Zhang, Y. Wang, and Y. Liang, “Variable-length finite-rate CSI feedback with generative priors,” arXiv preprint arXiv:2606.06846v2, 2026.

[10] S. Jaeckel, L. Raschkowski, K. Börner, and L. Thiele, “QuaDRiGa: A 3-D multi-cell channel model with time evolution for enabling virtual field trials,” IEEE Transactions on Antennas and Propagation, vol. 62, no. 6, pp. 3242–3256, 2014.

[11] 3GPP, “Study on channel model for frequencies from 0.5 to 100 GHz,” 3rd Generation Partnership Project, Tech. Rep. TR 38.901, V17.0.0, 2022.

[12] J. Guo, Y. Cui, C.-K. Wen, and S. Jin, “Prompt-enabled large AI models for CSI feedback,” IEEE Journal on Selected Areas in Communications, vol. 44, pp. 2654–2668, 2026.

## 图注与表注

**图注：** 图 1–3 的图注已随文置于相应位置（图 1 见第 III-A 节，图 2 与图 3 见第 IV 节末）。图 1 展示 CoFi-CLM 架构与非对称部署（上半部分为在线反馈/重建流程，虚线下半部分为离线提供细 token 目标的冻结细 token 化器与量化器）；图 2 含 (a) 已见场景与 (b) 未见场景查询两个子图；图 3 为直接粗分支、CLM 生成分支与完整 CoFi-CLM 的按率 NMSE 对比。

**表注：** 表 I（128 比特参数量匹配比较与基站侧扩展）与表 II（128 比特每 CSI 样本部署复杂度）均已在本页相应位置逐格转写；两表数值经 PDF 渲染页核对。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–V 节全部正文与小节（II-A/B/C、III-A–E、IV-A–F）、式 (1)–(18)、表 I–II（逐格转写）、图 1–3 图注、参考文献 [1]–[12]（英文原条目，编号与原文一致）。原文无附录、无致谢段。全部公式按正文逐式核对；表 I、表 II 按 PDF 渲染页（p5）逐格核对。**原文疑点（已加注）：** 表 I 与表 II 的参数量存在约 0.57M 的系统性差异，可由表 II 明确排除离线细 token 化器解释（两表小型/大型模型差值几乎相同），本页按原文照录并说明。逐句逐式终校未做；供后续 QA 重点核对：式 (3) 的归一化定义、式 (7)/(9) 的量化索引约定、式 (16) 的门控融合结构、式 (18) 的损失权重。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
