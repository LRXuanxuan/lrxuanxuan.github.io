---
layout: page
title: "BeamCKMDiff：波束感知信道知识地图的扩散构建｜中文全文译文"
permalink: /papers/translations/2026-07-12-2601-10207-beamckmdiff-beam-aware-channel-knowledge-map-construction-via-diffusio/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/f25af54ef5c30a81/) · [原文 arXiv](https://arxiv.org/abs/2601.10207) · [全部目录](/papers/catalog/)

# BeamCKMDiff：波束感知信道知识地图的扩散构建

**原题：** BeamCKMDiff: Beam-Aware Channel Knowledge Map Construction via Diffusion Transformer  
**作者：** Le Zhao¹、Yining Wang¹、Xinyi Wang¹、Zesong Fei¹、Yong Zeng²˒³。单位：¹ 北京理工大学信息与电子学院（中国北京）；² 东南大学移动通信国家重点实验室（中国南京）；³ 紫金山实验室（南京 211111）。联系邮箱：tobinbit@icloud.com（原文排版为 "tobin bit@icloud.com"，按原样保留）。  
**版本：** arXiv:2601.10207v1（eess.SP），v1 日期 2026 年 1 月 15 日；原文 6 页（IEEE 会议论文格式）。本页对应论文库 2026-07-12 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—V 节、图 1—3 图注、表 I—II、式（1）—（14）、参考文献 [1]—[16]（英文原条目）。原文全文无算法伪代码；两张表格均已逐格转录并与 PDF 渲染核对；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文疑点）：** 原文缩写在本页首次出现时保留英文：CKM（channel knowledge map，信道知识地图）、BeamCKM（beam-aware CKM，波束感知信道知识地图）、GBS（ground base station，地面基站）、RSS（received signal strength，接收信号强度）、DDPM（denoising diffusion probabilistic model，去噪扩散概率模型）、VAE（variational autoencoder，变分自编码器）、DiT（Diffusion Transformer）、adaLN（adaptive layer normalization，自适应层归一化）、MHA（multi-head attention，多头注意力）、NMSE（normalized mean squared error，归一化均方误差）、ULA（uniform linear array，均匀线性阵列）。**原文疑点（均按原文照录并加注，未静默修改）：**
>
> 1. §II-B 中稀疏发射机位置图的定义在 PDF 中原样为 " $T_{\mathbf q}$ is set as □ for $\mathbf q=\mathbf q_{\mathrm{tx}}$, and 0 otherwise"，**该处疑漏写 "1"**；本页按上下文译作「在 $\mathbf q=\mathbf q_{\mathrm{tx}}$ 处置 1，否则置 0」并在此说明。
> 2. §III-B 正文称条件编码器输入是维数 $\mathbb R^{H\times W\times 2}$ 的多通道张量（由环境拓扑 $\mathbf B$ 与 GBS 位置图 $\mathbf T$ 拼接而成），而表 I 中 Cond. Encoder 写为 "Input: $3\times256\times256$"，两处通道数不一致（2 对 3），按原文照录。
> 3. §III-D 标题 "Diffusion Training and Interference" 中的 "Interference"（干扰）疑为 "Inference"（推断）之误：该节 2) 小节即 "Inference / Reverse Process"，按原文照录。
> 4. 式（14）下方说明 "$ \Psi(p) $ and $ \hat\Psi(q) $ denote the ground truth and predicted pathloss values at grid location $q$" 中，真值写作 $\Psi(p)$ 而位置记为 $q$，疑为 $\Psi(q)$ 之误；本页按原文照录。
> 5. 表 II 行名写作 "Beam-CKMDiff"，而正文方法名统一为 "BeamCKMDiff"，拼写不一致，按原文照录。
> 6. 参考文献 [3] 与 [4] 为同一篇 tutorial 的重复条目（作者、期刊卷期页码相同，仅年份标注一处为 2024、一处为 Feb. 2024），按原文保留。

## 摘要

信道知识地图（CKM）正成为环境感知 6G 网络的关键使能技术，它提供站点特定的数据库，可显著降低导频开销。然而现有 CKM 构建方法通常依赖稀疏采样测量，且局限于全向地图或离散码本，因而无法利用波束赋形增益。为解决这些局限，我们提出 **BeamCKMDiff**——一个以任意**连续**波束赋形向量为条件、无需站点特定采样即可构建高保真 CKM 的生成式框架。具体地，我们在 Diffusion Transformer（DiT）的噪声预测网络中引入一种新颖的自适应层归一化（adaLN）机制。该机制把连续波束嵌入作为全局控制参数注入，有效引导生成过程捕捉波束图样与环境几何之间的复杂耦合。仿真结果表明，BeamCKMDiff 显著优于最先进基线，在捕捉主瓣与旁瓣方面取得更优的重建精度。

**关键词：** 波束感知信道知识地图（BeamCKM）；生成式人工智能；扩散 Transformer（DiT）。

## I. 引言

向第六代（6G）通信系统的演进由对泛在连接、超高可靠性与海量容量的需求驱动 [1]、[2]。多输入多输出（MIMO）技术有望带来显著的频谱效率增益，却给波束训练带来严峻挑战 [3]。在复杂城市环境中，信道状态信息（CSI）反馈所需的导频开销随天线阵列尺寸成比例增长，成为系统吞吐量的瓶颈。为缓解该问题，信道知识地图（CKM）的概念被提出，作为从以导频为中心向环境感知通信的范式转变 [4]。通过提供位置特定的信道参数，CKM 成为高效波束管理与资源分配的有前景技术。

早期的 CKM 构建方法主要依赖 Kriging 等插值技术 [5]。这些方法计算代价低，却假设空间平稳性，无法建模密集城市峡谷中由阴影造成的信号陡降。此外，高保真 CKM 构建通常需要大量采样测量，往往不切实际。作为替代，射线追踪等模型驱动方法通过确定性建模提供较高的物理精度，但其过高的计算复杂度使其不适合实时或大规模 CKM 构建。

人工智能（AI）的融入革新了 CKM 构建。开创性工作如 RadioUNet [6] 与 IMNet [7] 利用卷积神经网络学习电磁传播特征，把地图构建视为图像翻译任务。后续研究进一步探索了多种神经架构以提高精度，包括图神经网络 [8]、图注意力网络 [9] 与生成对抗网络 [10]。最近，去噪扩散概率模型（DDPM）在建模复杂电磁特性方面展现出更优能力。例如 RadioDiff [11]、[12] 将 DDPM 应用于 CKM 构建，成功恢复了高频纹理细节与回归类方法常会抹平的锐利阴影边界。实验结果一致表明，基于扩散的 CKM 构建性能优于传统基线。

需要注意的是，上述工作主要聚焦于为单天线系统构建**全向** CKM，而现代通信系统广泛配备多天线阵列，因而需要波束感知的 CKM 能力。最近 [13] 提出 BeamCKM 来应对该需求：它用基于注意力的架构为特定码本构建 CKM。然而 BeamCKM 把波束索引当作**类别**嵌入而非连续向量，这从根本上无法刻画波束赋形向量与空间能量分布之间的连续关系，使模型局限于有限、预定义的离散图样集合；当用户与预定义栅格方向失配时，这不可避免地引入波束量化退化。

为填补该空白，我们提出 **BeamCKMDiff**——一个以任意连续波束赋形向量为条件构建高保真 CKM 的生成式框架。据我们所知，这是首个在**连续波束域**中处理 CKM 构建的工作。具体地，我们利用扩散 Transformer（DiT），引入一种条件生成机制，把连续波束赋形向量编码为全局控制参数；通过自适应层归一化（adaLN）注入这些描述子，模型动态地使生成的 CKM 与环境条件下的物理波束增益分布对齐。在高保真射线追踪数据集上的仿真表明，BeamCKMDiff 达到最先进性能。

本文其余部分组织如下：第 II 节描述系统模型与问题表述；第 III 节详述所提 BeamCKMDiff 框架；第 IV 节给出实验设置与仿真结果；最后第 V 节总结全文。

## II. 系统模型与问题表述

### A. 系统模型

我们考虑部署在物理尺寸为 $\{H\times W\}$ 米的密集城市区域 $\mathcal D$ 中的下行多天线通信系统。该区域被离散为尺寸 $\{H/\Delta\kappa\times W/\Delta\kappa\}$ 像素的均匀栅格地图，其中 $\Delta\kappa$ 表示分辨率。每个像素 $(x,y)$ 代表一个具体物理位置 $\mathbf q=[x,y]^T\in\mathbb R^2$。环境由静态建筑分布图 $\mathbf B\in\mathbb R^{H\times W}$ 刻画；令 $\mathcal B\subset\mathcal D$ 表示被建筑占据的位置集合，$B_{x,y}$ 表示 $[x,y]$ 处的建筑高度，目标 CKM 覆盖自由空间 $\mathcal D\setminus\mathcal B$。一座地面基站（GBS）部署在位置 $\mathbf q_{\mathrm{tx}}\in\mathcal D$（具有特定高度），配备由 $N_t$ 根天线构成的可重构天线阵列。

给定任意预编码向量 $\mathbf w\in\mathbb C^{N_t}$，发射信号向量为 $\mathbf x=\mathbf w s$，其中 $s$ 为归一化功率 $\mathbb E[|s|^2]=1$ 的数据符号，波束赋形向量满足功率约束 $\|\mathbf w\|^2\le P_{\max}$。位置 $\mathbf q$ 处的接收信号为

$$
y(\mathbf q)=\mathbf h^H(\mathbf q)\mathbf w s+n,\tag{1}
$$

其中 $\mathbf h(\mathbf q)\in\mathbb C^{N_t\times1}$ 表示刻画传播效应（包括路径损耗、阴影与多径衰落）的信道向量，$n\sim\mathcal{CN}(0,\sigma^2)$ 为加性高斯白噪声。平均接收信号强度（RSS）可计算为

$$
\mathbb E\left[|y(\mathbf q)|^2\right]=\left|\mathbf h^H(\mathbf q)\mathbf w\right|^2+\sigma^2.\tag{2}
$$

对特定波束赋形向量 $\mathbf w$，**波束感知 CKM**（记为 $\Psi_{\mathbf w}\in\mathbb R^{H\times W}$）定义为

$$
\Psi_{\mathbf w}(\mathbf q)=10\log_{10}\left(\left|\mathbf h^H(\mathbf q)\mathbf w\right|^2\right)\in\Psi_{\mathbf w},\qquad\forall\mathbf q\in\mathcal D\setminus\mathcal B.\tag{3}
$$

该表述明确显示：地图 $\Psi_{\mathbf w}$ 是环境（隐式体现在 $\mathbf h$ 中）与连续控制变量 $\mathbf w$ 的函数。关键在于，这种连续参数化旨在把波束赋形权重——即施加在每个天线单元上的复幅度与相位调整——编码进空间映射过程；这使模型能够为有限码本之外的任意方向灵活合成波束赋形向量，显著提升动态多天线系统的实用性与适应性。

### B. 问题表述

基于上述系统模型，我们把 CKM 构建表述为条件生成建模问题。目标是学习条件概率分布 $p(\Psi_{\mathbf w}|\mathcal C)$，其中条件集定义为 $\mathcal C=\{\mathbf B,\mathbf T,\mathbf w\}$。这里 $\mathbf T\in\{0,1\}^{H/\Delta\kappa\times W/\Delta\kappa}$ 是稀疏发射机位置图：当 $\mathbf q=\mathbf q_{\mathrm{tx}}$ 时 $T_{\mathbf q}$ 置 1（原文此处疑漏写数值，见页首译注 1），否则置 0。

形式上，我们旨在逼近由神经网络参数化的映射函数 $\mathcal F_\theta$：

$$
\hat\Psi_{\mathbf w}=\mathcal F_\theta(\mathbf B,\mathbf T,\mathbf w),\tag{4}
$$

使生成的地图 $\hat\Psi_{\mathbf w}$ 在整个空间域上最小化重建误差 $\|\hat\Psi_{\mathbf w}-\Psi_{\mathbf w}\|^2$，同时忠实复现无线信号传播所特有的复杂衰落图样、反射与阴影效应。通过迭代训练 $\mathcal F_\theta$，模型学会为任意连续波束赋形向量 $\mathbf w$ 重建高保真真值 $\Psi_{\mathbf w}$。

## III. 所提 BeamCKMDiff

本节介绍所提 BeamCKMDiff 架构。如图 1 所示，该框架由用于感知压缩的变分自编码器（VAE）、用于环境拓扑空间特征提取的条件编码器，以及带波束赋形向量嵌入的 DiT 主干组成，以实现波束感知的 CKM 生成式重建。

### A. 基于 VAE 的感知压缩

直接在高分辨率像素空间中训练扩散模型计算量巨大且不稳定。为缓解该问题，我们采用 VAE 把高维 CKM 投影到紧凑潜空间。VAE 由编码器 $\mathcal E(\cdot)$ 与解码器 $\mathcal D(\cdot)$ 组成。给定真值 CKM $\Psi_{\mathbf w}$，编码器把它映射为潜分布 $q(\mathbf z|\Psi_{\mathbf w})=\mathcal N(\mathbf z;\boldsymbol\mu,\sigma^2)$，其中 $\mathbf z\in\mathbb R^{h\times w\times D_{\mathrm{lat}}}$、$h=H/f$、$w=W/f$。解码器旨在从采样的潜变量 $\mathbf z$ 重建原地图。在训练条件编码器与基于 DiT 的去噪模块之前，我们预训练 VAE；训练目标是最小化证据下界（ELBO），即结合重建损失与 KL 散度正则：

$$
\mathcal L_{\mathrm{VAE}}=\left\|\Psi_{\mathbf w}-\mathcal D(\mathbf z)\right\|_2^2+\lambda_{\mathrm{KL}}D_{\mathrm{KL}}\left(q(\mathbf z|\Psi_{\mathbf w})\,\|\,\mathcal N(\mathbf 0,\mathbf I)\right).\tag{5}
$$

训练完成后 VAE 被冻结，扩散过程完全在高效的潜空间中进行。

### B. 条件编码器

为有效提取与潜噪声空间对齐的语义特征，我们的条件编码器采用深度 ResNet 架构。条件编码器输入是维数 $\mathbb R^{H\times W\times2}$ 的多通道张量，由环境拓扑 $\mathbf B$ 与 GBS 位置图 $\mathbf T$ 拼接而成。编码器施加一系列卷积模块与残差块，把条件输入下采样到与潜空间分辨率匹配的维数。输出为空间条件嵌入：

$$
\mathbf c_{\mathrm{env}}=\mathrm{Proj}\left(\mathrm{Concat}(\mathbf B,\mathbf T)\right)\in\mathbb R^{h\times w\times D_{\mathrm{cond}}},\tag{6}
$$

它编码环境布局信息与收发机空间关系等物理约束。条件编码器是确定性的，并与 DiT 端到端训练，从而自适应地学习生成式 CKM 重建的最优特征表示。

### C. 基于 DiT 的连续波束条件化

DiT 主干 [14] 是 BeamCKMDiff 的核心。我们把扩散步 $t$ 的潜变量 $\mathbf z_t$ 与空间条件 $\mathbf e_{\mathrm{env}}$ 视为 token 序列；扩散步 $t$ 与连续波束赋形向量 $\mathbf w$ 被嵌入为特征向量，用于生成 adaLN 机制所需的参数。主要组成部分如下。

**1）潜特征融合：** 把含噪潜变量 $\mathbf z_t\in\mathbb R^{h\times w\times D_{\mathrm{lat}}}$ 与空间条件 $\mathbf e_{\mathrm{env}}$ 拼接，以整合空间环境引导：

$$
\mathbf c_{\mathrm{spatial}}=\mathrm{Concat}\left(\mathbf z_t,\mathbf e_{\mathrm{env}}\right)\in\mathbb R^{h\times w\times\left(D_{\mathrm{lat}}+D_{\mathrm{cond}}\right)}.\tag{7}
$$

该融合图随后被投影为 token 序列，在进入 Transformer 块之前经线性嵌入并加上可学习位置嵌入。

**2）波束感知 adaLN：** 受 DiT 中类别条件嵌入策略的启发，BeamCKMDiff 框架引入一种新颖的条件机制，通过 adaLN 把连续波束赋形向量 $\mathbf w$ 注入扩散过程。该机制动态调制潜特征图的通道统计量，从而引导生成过程与特定波束赋形配置对齐。

具体地，我们融合时间步嵌入 $\mathbf t_{\mathrm{emb}}$ 与波束赋形向量嵌入 $\mathbf w_{\mathrm{emb}}$，得到全局条件 token $\mathbf c_{\mathrm{emb}}=\mathbf t_{\mathrm{emb}}+\mathbf w_{\mathrm{emb}}$。该 token 作为全局控制参数，同时包含扩散进度与物理波束赋形信息。在每个 DiT 块内部，我们采用接在 SiLU 激活之后的线性投影层，从 $\mathbf c_{\mathrm{emb}}$ 动态生成调制参数，尺度因子 $\gamma$ 与平移因子 $\beta$ 由下式给出：

$$
[\gamma,\beta]=\mathbf A_{\mathrm{mod}}\cdot\mathrm{SiLU}\left(\mathbf c_{\mathrm{emb}}\right)+\mathbf b_{\mathrm{mod}},\tag{8}
$$

其中 $\mathbf A_{\mathrm{mod}}$ 与 $\mathbf b_{\mathrm{mod}}$ 是 adaLN 模块中线性层的可学习权重与偏置。物理上，$\gamma$ 充当增益控制器，调整空间特征的幅度或差异以突出高能量波束主瓣；$\beta$ 充当偏置控制器，平移基线信号水平以匹配真值 RSS 分布。随后 adaLN 把调制后的特征 $\mathbf c_{\mathrm{spatial}}$ 输出到多头注意力（MHA）层：

$$
\mathrm{adaLN}\left(\mathbf f_{\mathrm{in}},\mathbf c_{\mathrm{emb}}\right)=(1+\gamma)\odot\mathcal N\left(\mathbf f_{\mathrm{in}}\right)+\beta,\tag{9}
$$

其中 $\odot$ 表示逐元素乘，$\mathcal N(\cdot)$ 为归一化过程。通过学习预测最优 $\gamma$ 与 $\beta$，模型引导中间特征的均值与方差，使生成的 CKM 与 $\mathbf w$ 的方向性与波束图样对齐。

### D. 扩散训练与推断

**1）训练 / 扩散过程：** 训练时我们采样随机时间步 $t\sim\mathcal U(0,T)$、高斯噪声项 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$ 以及训练元组 $\{\mathbf z_0,\mathbf c_{\mathrm{spatial}},\mathbf w\}$。前向扩散过程逐步把干净潜变量 $\mathbf z_0$ 腐蚀为含噪状态 $\mathbf z_t$。利用高斯转移的性质，$\mathbf z_t$ 可由闭式表达式直接采样：

$$
\mathbf z_t=\sqrt{\bar\alpha_t}\mathbf z_0+\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon,\tag{10}
$$

其中 $\bar\alpha_t=\prod_{s=1}^{t}\alpha_s=\prod_{s=1}^{t}(1-\beta_s)$ 决定噪声调度，$\beta_t$（$t\in\{1,\dots,T\}$）是一组预定义参数。

DiT 模型 $\boldsymbol\epsilon_\theta$ 以含噪潜变量 $\mathbf z_t$、时间步 $t$ 与条件集 $\{\mathbf c_{\mathrm{spatial}},\mathbf w_{\mathrm{emb}}\}$ 为输入，预测所加入的噪声。它被训练为近似以 $\mathbf c_{\mathrm{spatial}}$ 与 $\mathbf w_{\mathrm{emb}}$ 为条件的数据分布的分数函数。网络参数 $\theta$ 通过最小化简化的均方误差（MSE）损失训练：

$$
\mathcal L_{\mathrm{diff}}=\mathbb E_{t,\mathbf z_0,\boldsymbol\epsilon,\mathbf w}\left[\left\|\boldsymbol\epsilon-\boldsymbol\epsilon_\theta\left(\mathbf z_t,\mathbf c_{\mathrm{spatial}},\mathbf w_{\mathrm{emb}},t\right)\right\|^2\right].\tag{11}
$$

通过最小化该目标，模型学会在 $\mathbf c_{\mathrm{spatial}}$ 提供的物理条件与 $\mathbf w_{\mathrm{emb}}$ 提供的波束赋形引导下逆转扩散过程。

**2）推断 / 反向过程：** 推断时生成过程从纯高斯噪声 $\mathbf z_T\sim\mathcal N(\mathbf 0,\mathbf I)$ 开始。模型通过祖先采样过程从 $t=T$ 到 0 迭代地去噪潜变量。在每个步骤 $t$，模型的噪声预测 $\boldsymbol\epsilon_\theta$ 用于参数化反向条件分布 $p_\theta(\mathbf z_{t-1}|\mathbf z_t,\mathbf c_{\mathrm{spatial}},\mathbf w_{\mathrm{emb}})$；从该分布采样得到更新后的潜变量：

$$
\mathbf z_{t-1}=\mathbf z_t-\hat{\boldsymbol\epsilon}_t,\tag{12}
$$

其中估计噪声 $\hat{\boldsymbol\epsilon}_t$ 由模型预测与额外随机噪声按比例组合而成：

$$
\hat{\boldsymbol\epsilon}_t=\frac{1}{\sqrt{\alpha_t}}\left(\mathbf z_t-\frac{1-\alpha_t}{\sqrt{1-\bar\alpha_t}}\boldsymbol\epsilon_\theta\left(\mathbf z_t,\mathbf c_{\mathrm{spatial}},\mathbf w_{\mathrm{emb}},t\right)\right)+\sigma_t\boldsymbol\xi,\tag{13}
$$

其中 $\boldsymbol\xi\sim\mathcal N(\mathbf 0,\mathbf I)$ 表示 $t>0$ 时的随机噪声注入。最后，干净潜变量 $\mathbf z_0$ 经 VAE 解码器重建高保真、波束特定的 CKM $\hat\Psi=\mathcal D(\mathbf z_0)$。

**图 1：** 所提 BeamCKMDiff 的示意。VAE 用于把 CKM 编码到潜空间，从而降低扩散模型的维数。框架由 VAE 编码器/解码器、条件编码器（输入为拓扑 $\mathbf B$ 与 GBS 位置 $\mathbf T$）、以及带波束赋形向量与时间步嵌入的 Transformer 主干组成；图中同时给出训练（Diffusion/training）与推断（Reverse/inference）两条路径，以及 adaLN 调制、线性层/Projection、含 8×32×32 潜在特征与 1×512 嵌入的流程。（来源：原文第 3 页。）

## IV. 仿真结果

本节评估所提 BeamCKMDiff 框架的性能。我们首先介绍仿真设置（包括数据集与参数配置），随后把 BeamCKMDiff 与最先进方法比较，以评估它们在波束感知 CKM 构建中的精度。

### A. 仿真设置

BeamCKM 数据集由从 OpenStreetMap [15] 提取的 30 个地理参考城市拓扑构成。每个场景覆盖 $512\ \mathrm m\times512\ \mathrm m$ 区域，离散为空间分辨率 2 m 的栅格。对每张地图，一个配备 $16\times1$ 均匀线性阵列（ULA）的地面基站（GBS）被部署在 10 个随机位置，高度 1.5 m。对每次部署，应用 10 个随机波束赋形向量以生成多样的传播样本。高保真信道增益由 NVIDIA Sionna 射线追踪引擎 [16] 生成；Sionna 求解器配置 $10^9$ 条射线、最多 3 次反射并启用绕射。系统工作在 2.4 GHz 载波频率，电磁材料属性遵循 ITU-R 标准。

在前向扩散过程中，噪声在 $T=500$ 个时间步上注入潜表示，由从 $\beta_1=4\times10^{-5}$ 到 $\beta_T=5\times10^{-3}$ 的线性方差调度支配。模型参数用 Adam 优化器、学习率 $10^{-4}$ 优化。VAE 与 BeamDiT 模块的完整架构与具体超参数配置详见表 I。全部训练与推断流程在配备单块 NVIDIA GeForce RTX 4090 GPU 的工作站上执行。

**表 I：模型架构配置。**（来源：原文第 4 页。）

| 模块 | 核心组件与超参数 |
|---|---|
| VAE | 输入：$1\times256\times256$；潜变量：$8\times32\times32$ |
| - Encoder | 输入 $\xrightarrow{\mathrm{Conv}}$ $[\text{Downsample}\to\text{ResNetBlock}]\times3$；通道：$1\to[64\to128\to256]\to8$；map_latent：Conv2d(256, 8, $3\times3$) |
| - Decoder | 输入 $\mathbf z$ $\xrightarrow{\mathrm{Conv}}$ $[\text{ResNetBlock}\to\text{Upsample}\to\text{Conv}]\times3$；通道：$8\to256\to[128\to64\to32]\to1$；final：Conv2d(32, 1, $3\times3$)$\to$Sigmoid |
| ResNetBlock | gn1：GroupNorm(8, $C_{\mathrm{in}}$)$\to$SiLU；conv1：Conv2d($C_{\mathrm{in}},C_{\mathrm{out}},3\times3$)；gn2：GroupNorm(8, $C_{\mathrm{out}}$)$\to$SiLU；conv2：Conv2d($C_{\mathrm{out}},C_{\mathrm{out}},3\times3$) |
| Cond. Encoder | 输入：$3\times256\times256$；输出：$32\times32\times32$；head：Conv2d(3, 32, $3\times3$)；Body：$[\text{ResNetBlock}\to\text{Downsample}]\times3$；通道：$32\to[32\to64\to128]$；out：Zero-init Conv2d(128, 32, $3\times3$) |
| BeamDiT | 输入：$40\times32\times32$（8 个潜变量 + 32 个条件） |
| - Embedders | x_emb：Conv2d(40, 512, $2\times2$, stride=2)；pos_emb：Learnable ($1\times256\times512$)；t/w_emb：MLP(Linear$\to$SiLU$\to$Linear)，$D=512$ |
| - Backbone | 深度：12；头数：8；隐藏维：512 |
| - DiT Block | adaLN：回归参数 $(\gamma,\beta)$；attn：MultiheadAttention（dim=512, heads=8）；mlp：Linear(512$\to$2048)$\to$GELU$\to$Linear(512) |
| - Final Layer | norm：LayerNorm + adaLN（Scale $\gamma$，Shift $\beta$）；linear：Linear(512, $2^2\times8$) |

为评估所提框架的性能，我们把 BeamCKMDiff 与三种代表性方法比较，它们各自采用不同的建模范式：

1. **RadioUNet [6]：** 基于 U-Net 架构的经典判别式模型，使用带跳跃连接的 UNet 结构学习从环境几何到 CKM 的确定性映射。
2. **TransUNet [13]：** 面向 CKM 的 Transformer-UNet 框架；它把 DFT 码本中的离散波束索引嵌入网络来纳入波束信息，将波束赋形作为类别条件而非连续向量处理。
3. **RadioDiff-UNet [11]：** 采用标准 U-Net 主干的扩散概率模型基线；它依赖卷积层去噪，未使用自适应层归一化（adaLN）机制做连续全局条件化。

我们采用以 dB 为单位的归一化均方误差（NMSE）评估所构建 CKM 的质量，其表达式为

$$
\mathrm{NMSE}\ (\mathrm{dB})=10\log_{10}\left(\frac{\sum_{\mathbf q\in\mathcal D/\mathcal B}\left|\hat\Psi(\mathbf q)-\Psi(\mathbf q)\right|^2}{\sum_{\mathbf q\in\mathcal D/\mathcal B}\left|\Psi(\mathbf q)\right|^2}\right),\tag{14}
$$

其中 $\Psi(p)$ 与 $\hat\Psi(\mathbf q)$ 分别表示栅格位置 $\mathbf q$ 处的真值与预测路径损耗值（原文真值此处写作 $\Psi(p)$，疑为 $\Psi(\mathbf q)$ 之误，见页首译注 4）。

为评估模型泛化性，我们建立两种场景：

- **场景 1（未见波束）：** 在已训练位置上测试，但以新的连续波束赋形向量为条件，以评估波束流形插值能力。
- **场景 2（未见位置）：** 在新的发射机位置上测试，以评估空间插值能力。

### B. 结果讨论

表 II 给出定量比较。所提 BeamCKMDiff 取得低于 −20 dB 的显著 NMSE，表明即便在没有采样测量的情况下也具有出色的重建质量。该性能增益源于连续波束赋形向量条件化，它为方向性增益估计提供了显式物理引导。在计算效率方面，BeamCKMDiff 的平均推理延迟为 0.688 s；虽然迭代扩散过程天然比判别式基线耗时更长，但亚秒级推理时间对动态 CKM 构建仍然实用，是为显著精度提升所作的可接受折中。

**表 II：NMSE 性能比较。**（来源：原文第 5 页。）

| 方法 | 未见波束 | 未见位置 | 推理时间 |
|---|---|---|---|
| RadioUNet | −16.35 dB | −16.34 dB | 0.231 s |
| TransUNet | −18.91 dB | −17.34 dB | 0.234 s |
| RadioDiffUNet | −19.49 dB | −19.13 dB | 0.373 s |
| Beam-CKMDiff | −21.24 dB | −20.68 dB | 0.688 s |

图 2 与图 3 的视觉比较揭示了各方法不同的行为差异。RadioUNet 与 TransUNet 缺乏波束感知能力，无法重建特定传播路径，只能捕捉一般性的环境阴影。RadioDiff 生成了部分增益图样，但由于缺少显式波束引导，常使主瓣方向失配。相反，BeamCKMDiff 精确重建了方向性波束图样与细粒度的反射/绕射传播效应。

**图 2：** 在**已见** GBS 位置与**未见**波束下，不同方法构建的 CKM 比较。(a) RadioUNet；(b) TransUNet；(c) RadioDiff-UNet；(d) BeamCKMDiff；(e) Ground Truth。（来源：原文第 5 页。）

**图 3：** 在**未见** GBS 位置与波束下，不同方法构建的 CKM 比较。(a) RadioUNet；(b) TransUNet；(c) RadioDiff-UNet；(d) BeamCKMDiff；(e) Ground Truth。（来源：原文第 5 页。）

在具有挑战性的未见位置场景中，尽管所有模型在估计环境传播相互作用时都会退化，BeamCKMDiff 仍通过保持准确的波束图样结构展现出稳健的泛化能力；相反，基线方法遭受严重的波束失配。这证实所提波束赋形信息条件化有效解耦了波束可操纵性与空间几何，从而确保跨新配置的稳健泛化。

## V. 结论

本文提出了 BeamCKMDiff——一个用于构建波束感知 CKM 的生成式框架。通过把标准 U-Net 主干替换为 DiT 并引入波束赋形信息驱动的 adaLN 机制，我们的模型成功把波束操纵信息与环境几何解耦。仿真结果表明，它在连续波束流形内具备构建能力，在严格无采样的设定下取得低于 −20 dB 的 NMSE，并优于最先进基线。作为波束感知 CKM 构建的首项工作，BeamCKMDiff 为未来研究树立了新基准。未来工作中，我们将聚焦于如何利用稀疏 RSS 测量精化 BeamCKM，并研究最优 RSS 采样比例以实现精度—代价折中。

## 图注与表注

**图 1（原文第 3 页）：** 见正文 §III 图注（BeamCKMDiff 总体框架示意：VAE、条件编码器、DiT 主干、adaLN 调制与训练/推断流程）。

**图 2（原文第 5 页）：** 见正文 §IV-B 图注（已见 GBS 位置、未见波束下五种地图的视觉比较）。

**图 3（原文第 5 页）：** 见正文 §IV-B 图注（未见 GBS 位置与波束下五种地图的视觉比较）。

**表注汇总：** 表 I（原文第 4 页）为模型架构配置（VAE、ResNetBlock、条件编码器、BeamDiT 各模块的核心组件与超参数）；表 II（第 5 页）为 NMSE 性能比较（未见波束、未见位置、推理时间三列）。两张表均已在正文中逐格转录，并与 PDF 渲染图核对一致。

## 参考文献（英文原书目）

[1] R. Sun, N. Cheng, C. Li et al., "A comprehensive survey of knowledge-driven deep learning for intelligent wireless network optimization in 6G," IEEE Commun. Surv. Tutorials, pp. 1–1, 2025.
[2] H. Sun, Y. Liu, A. Al-Tahmeesschi, A. Nag, M. Soleimanpour, B. Canberk, H. Arslan, and H. Ahmadi, "Advancing 6G: Survey for explainable AI on communications and network slicing," IEEE Open J. Commun. Soc., vol. 6, pp. 1372–1412, 2025.
[3] Y. Zeng, J. Chen, J. Xu, D. Wu et al., "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Commun. Surv. Tutorials, vol. 26, no. 3, pp. 1478–1519, 2024.
[4] Y. Zeng, J. Chen, J. Xu et al., "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Commun. Surv. Tutorials, vol. 26, no. 3, Feb. 2024.
[5] E. Dall'Anese, S.-J. Kim, and G. B. Giannakis, "Channel gain map tracking via distributed Kriging," IEEE Trans. Veh. Technol., vol. 60, no. 3, pp. 1205–1211, 2011.
[6] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.
[7] L. Zhao, Z. Fei, X. Wang, J. Huang et al., "IMNet: Interference-aware channel knowledge map construction and localization," IEEE Wireless Commun. Lett., vol. 14, no. 3, pp. 856–860, 2025.
[8] G. Chen, Y. Liu et al., "A graph neural network based radio map construction method for urban environment," IEEE Commun. Lett., vol. 27, no. 5, pp. 1327–1331, 2023.
[9] X. Li, S. Zhang, H. Li et al., "RadioGAT: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks," IEEE Trans. Wireless Commun., vol. 23, no. 11, pp. 17 777–17 792, 2024.
[10] S. Zhang, A. Wijesinghe, and Z. Ding, "RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network," IEEE Internet Things J., vol. 10, no. 20, pp. 18 016–18 027, 2023.
[11] X. Wang, K. Tao et al., "RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction," IEEE Trans. Cogn. Commun. Netw., vol. 11, no. 2, pp. 738–750, 2025.
[12] L. Zhao, Z. Fei, X. Wang, J. Luo, and Z. Zheng, "3D-RadioDiff: An altitude-conditioned diffusion model for 3D radio map construction," IEEE Wireless Commun. Lett., vol. 14, no. 7, pp. 1969–1973, 2025.
[13] H. Wang, X. Shi, H. Zhang, Cao et al., "BeamCKM: A framework of channel knowledge map construction for multi-antenna systems," arXiv preprint arXiv:2511.18376, 2025.
[14] W. Peebles and S. Xie, "Scalable diffusion models with transformers," in Proc. IEEE/CVF Int. Conf. Comput. Vis. (ICCV), 2023, pp. 4195–4205.
[15] OpenStreetMap contributors, "Planet dump," 2017. [Online]. Available: https://www.openstreetmap.org
[16] J. Hoydis, S. Cammerer, F. Ait Aoudia et al., "Sionna: An open-source library for next-generation physical layer research," arXiv preprint arXiv:2203.11854, 2022.

**本页范围与校对状态：** 本页覆盖 arXiv:2601.10207v1（eess.SP，2026 年 1 月 15 日）全文 6 页：摘要、第 I—V 节、图 1—3 图注、表 I—II、式（1）—（14）、参考文献 [1]—[16]（英文原条目）。原文为 IEEE 会议论文格式，无算法伪代码。表格核对：用 `render.py` 渲染 PDF 第 4、5 页并逐格核对表 I（模型架构配置）与表 II（NMSE 比较：−16.35/−16.34/0.231 s；−18.91/−17.34/0.234 s；−19.49/−19.13/0.373 s；−21.24/−20.68/0.688 s）以及正文 §IV-A 的 $512\times512$ m、2 m、$16\times1$ ULA、$T=500$、$\beta_1=4\times10^{-5}$、$\beta_T=5\times10^{-3}$、学习率 $10^{-4}$ 等参数。已按页首译注列出 6 处原文疑点（稀疏位置图漏写数值、条件编码器输入通道数 2 对 3、§III-D 标题 Interference/Inference、式 (14) 说明中 $\Psi(p)$、表 II 行名 Beam-CKMDiff、参考文献 [3]/[4] 重复），均按原文照录并加注，未静默修改。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内曲线与地图视觉内容未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2601.10207v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
