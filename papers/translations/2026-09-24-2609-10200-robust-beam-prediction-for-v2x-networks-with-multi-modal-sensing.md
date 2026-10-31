---
layout: page
title: "多模态感知下 V2X 网络的鲁棒波束预测｜中文全文译文"
permalink: /papers/translations/2026-09-24-2609-10200-robust-beam-prediction-for-v2x-networks-with-multi-modal-sensing/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/58d2f204b53b9219/) · [原文 arXiv](https://arxiv.org/abs/2609.10200) · [全部目录](/papers/catalog/)

# 多模态感知下 V2X 网络的鲁棒波束预测

**原题：** Robust Beam Prediction for V2X Networks with Multi-Modal Sensing  
**作者：** Chen Shang、Dinh Thai Hoang、Diep N. Nguyen、Jiadong Yu  
**版本：** arXiv:2609.10200v1（cs.LG），2026-09-09，原文 6 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VI 节（含 II、III-A/B/C、IV、V-A/B 全部小节）、结论、表 I／表 II 逐格、图 1–3 图注、参考文献 [1]–[23]（英文原条目）按原文结构录入；原文无附录、无致谢/基金段。逐句逐式终校未做。

## 摘要

集成感知与通信（integrated sensing and communication，ISAC）为未来车联网（vehicle-to-everything，V2X）网络中的波束预测提供了有前景的基础。然而现有感知辅助波束成形方法仍严重依赖射频感知，而射频感知在复杂车辆环境中可能变得不可靠。与此同时，摄像头与 LiDAR 等异构传感器的日益普及，为借助更丰富的环境感知来改进波束预测提供了新机会。受此启发，本文提出一种面向 V2X 网络的多模态波束预测框架。具体而言，我们开发 **BeamTransFuser**——一种分层 Transformer 架构，逐级融合摄像头、LiDAR、雷达与 GPS 观测以实现鲁棒波束预测。此外，为处理实际部署中可能出现的模态缺失，我们引入一个生成模块，从可用观测中重建缺失模态特征。在真实世界多模态 V2X 数据集上的实验结果表明，所提框架持续优于代表性基线，而生成模块进一步改善了感知不完整条件下的鲁棒性。

**索引词：** 集成感知与通信、多模态波束预测、V2X 网络、模态生成、6G。

## I. 引言

过去数十年间，无线通信系统持续朝着更智能、更高效的运行方式演进。在面向第六代（6G）网络的技术中，集成感知与通信（ISAC）已成为尤为重要的范式 [1]。通过在同一框架内统一感知与通信，ISAC 可降低信令开销、减少波束对齐时延并提升频谱效率 [2]。这些优势对车联网（V2X）尤为相关：快速移动性与快速变化的链路条件要求高度准确的波束对齐，以维持高速率、低时延的通信服务 [3]、[4]。

尽管前景广阔，ISAC 在车辆环境中的实际部署仍面临重大挑战。一方面，现有 ISAC 设计范式通常涉及感知精度、通信效率与实现复杂度之间的内在折中 [5]、[6]：以感知为中心的设计通常优先保证感知性能，但可能牺牲通信吞吐与标准兼容性；以通信为中心的设计则聚焦传输效率而牺牲感知能力。因此这两种设计都无法以平衡方式同时提供强感知与强通信性能。另一方面，联合设计方法试图兼顾两种功能，但往往需要更精细的信号处理、更严格的同步与更高的硬件开销，使实际实时实现更具挑战 [5]。

此外，这些方法的一个共同特征是仍以射频（radio-frequency，RF）感知为主。在密集城市道路上，RF 观测质量会因遮挡、多径效应与非视距（non-line-of-sight，NLoS）传输条件而显著恶化 [7]。此类损伤会降低感知保真度、扭曲环境感知，并最终削弱波束对齐可靠性。该问题在 V2X 网络中更为关键：车辆高移动性与快速变化的道路条件对准确、及时的波束预测提出了更严格要求。因此在现实 V2X 场景中，仅依赖 RF 感知往往不足以保证实用可靠的波束预测。

在此背景下，利用 RF 信号之外的异构感知模态成为提升波束预测鲁棒性的自然途径 [8]。例如，[9] 中基于位置的方法主要依赖 GPS 信息进行波束预测，而 TII [10] 通过基于 Transformer 的设计纳入摄像头与 GPS 数据；CMDF [11] 与 ICMFE [12] 进一步利用摄像头—雷达感知完成波束成形相关任务；此外，[9] 中的多模态方法考虑了涉及摄像头、LiDAR、雷达与 GPS 的更丰富感知组合。这些工作验证了引入额外感知模态可通过提供互补的几何、语义与环境信息来改进波束预测。然而，多数现有方法要么只考虑可用感知模态的一部分，要么缺少能充分利用摄像头、LiDAR、雷达与 GPS 数据之间互补性的统一架构。此外，它们通常假设推理时感知输入完整；但在实际部署中，某些模态可能因传感器故障、环境干扰或硬件限制而不可用。此时用固定多模态输入训练的模型会遇到输入失配，在推理时无法正常工作。

受上述观察启发，本文通过联合利用摄像头、LiDAR、雷达与 GPS 观测，为实际 V2X 网络开发一种鲁棒的多模态波束预测框架。具体而言，我们提出 BeamTransFuser，一种分层 Transformer 架构，它提取模态特定特征并通过多阶段跨模态交互逐级融合，从而更好地利用这些异构感知模态所携带的互补信息。此外，为处理实际部署中的感知条件不完整，我们进一步引入生成模块，从可用观测重建缺失模态特征；由此，即使部分感知输入不可用，所提框架也能支持有效的波束预测。本文主要贡献概括如下：

- 我们提出 BeamTransFuser——一种分层多模态波束预测框架，联合利用摄像头、LiDAR、雷达与 GPS 观测，实现 V2X 网络中鲁棒的波束选择。
- 我们设计一种模态生成机制，从可用感知输入重建缺失模态特征，从而改善感知不完整条件下波束预测的鲁棒性。
- 我们在真实世界多模态 V2X 数据集上进行大量实验。结果表明所提框架在波束预测性能上持续超越代表性基线方法，且生成模块能有效重建缺失模态特征，在感知不完整条件下实现可靠的波束预测。

## II. 系统概览与问题建模

图 1 给出本文考虑的多模态感知辅助通信系统：路侧单元（road-side unit，RSU）使用均匀线阵进行信号收发。与传统主要依赖单一感知源的 ISAC 框架不同，该 RSU 集成多种感知模态——GPS、摄像头、LiDAR 与雷达——以获取对周围环境的实时感知。由于这些模态提供不同类型的信息，它们可在多样化的传播与移动条件下彼此互补。例如，当 RF 感知因遮挡或 NLoS 传播而退化时，LiDAR 仍可提供几何结构信息，而摄像头观测可为波束预测提供有用的语义线索。因此 RSU 可利用这些异构感知输入，在实际 V2X 条件下支持更可靠的波束预测。

考虑 RSU 处预定义的波束成形码本 $\mathcal F=\{\mathbf f_m\}_{m=1}^{M}$，其中每个 $\mathbf f_m$ 表示复值波束成形向量，$M$ 为候选波束总数。设 $\mathbf f_m$ 为施加于下行符号的发射波束成形器，则车辆处的接收信号为

$$
C=\mathbf h^H\mathbf f_ms+z_c, \tag{1}
$$

其中 $\mathbf h$ 为 RSU 与车辆之间的下行信道向量，$z_c\sim\mathcal{CN}(0,\sigma^2)$ 表示循环对称复高斯噪声。相应地，信噪比（signal-to-noise ratio，SNR）与可达速率可分别写为

$$
\gamma(\mathbf f_m)=\frac{\left|\mathbf h^H\mathbf f_m\right|^2}{\sigma^2},\qquad R=\log_2\left(1+\gamma(\mathbf f_m)\right). \tag{2}
$$

因此最优波束成形向量选为

$$
\mathbf f^*=\arg\max_{\mathbf f_m\in\mathcal F}\ \log_2\left(1+\gamma(\mathbf f_m)\right). \tag{3}
$$

本文不采用在线传输期间的穷举波束搜索，而考虑多模态感知辅助波束预测：直接用异构感知观测推断目标波束索引。令 $\mathcal M_\Theta(\cdot)$ 表示由 $\Theta$ 参数化的波束预测模型。设训练数据集为 $\mathcal X=\{X_i\}_{i=1}^{N}$，每个样本包含多模态感知输入；令 $\mathcal Y=\{Y_i\}_{i=1}^{N}$ 为相应的波束索引标签。于是学习任务可表述为

$$
\mathrm{P1}:\ \Theta^*=\arg\min_{\Theta}\sum_{i=1}^{N}\mathcal L\left(\mathcal M_\Theta(X_i),Y_i\right), \tag{4}
$$

其中 $\mathcal L(\cdot)$ 表示训练损失。P1 的核心难点在于如何从异构感知模态中有效提取有用表示，并把它们融合到统一特征空间中以实现准确的波束预测。为解决该问题，下面介绍所提 BeamTransFuser 框架。

## III. 所提多模态框架

如图 2 所示，所提 BeamTransFuser 由分别面向摄像头、LiDAR、雷达与 GPS 输入的四个模态特定分支，以及其后基于 Transformer 模块的分层融合骨干组成。具体而言，每个分支先从其对应的感知模态提取特征，使模态感知表示在引入跨模态交互之前得以学习；随后，提取的特征通过插入在骨干不同阶段的多模态融合块逐步融合，从而可从低级表示到高级语义特征建模跨模态依赖。此外，骨干采用四阶段分层设计：每个模态经逐级网络层处理，多模态融合块交错插入相邻阶段之间，以在不同表示层级上实现跨模态交互。为保留模态特定信息并改善训练稳定性，还采用残差连接（即 $\oplus$）。在最后一个融合阶段之后，所得模态特征被池化，并由带 softmax 归一化权重的可学习融合模块（即 $\otimes$）整合，然后送入解码器与波束生成器进行波束索引预测。所提框架的细节如下。

### A. 多模态分支

如图 2 所示，摄像头、LiDAR 与雷达输入首先由专门的卷积编码器处理，把原始数据变换为空间特征表示；相比之下，GPS 数据维度较低，通过多层感知机映射到公共特征空间，不依赖相同的空间编码流程。在这一初始编码步骤之后，每个模态进一步由模态感知特征提取器处理。具体而言，摄像头流使用 ResNet34 [13] 从 RGB 图像提取有判别力的视觉特征，而 LiDAR 与雷达分支采用更轻量的 ResNet16 [13] 网络，在保留关键结构线索的同时降低计算复杂度。

为支持逐级跨模态交互，编码后的模态特定表示进一步由分层融合骨干处理。在每个阶段，特征先被对齐到公共表示尺度，再转换为 token 序列以供基于 Transformer 的融合。该设计允许在逐步整合不同感知源互补信息的同时保留模态特定特性。因此，低级几何模式与高级语义线索能以渐进方式融合——这在动态 V2X 场景中特别有用，因为局部结构细节与全局上下文信息都会影响波束预测。

### B. 多模态融合块

有效整合摄像头、LiDAR、雷达与 GPS 特征并非易事，因为这些模态在空间结构、语义含义与信息密度上差异很大。为此，我们采用 Transformer [14] 在统一表示空间内融合异构模态特征并建模跨模态依赖。在每个融合阶段，模态特定特征先被池化并投影为公共 token 表示；通过拼接全部感知模态的 token，得到统一 token 序列 $\mathbf F\in\mathbb R^{N\times D}$，其中 $N$ 表示 token 总数，$D$ 为嵌入维度。相应地，查询（Q）、键（K）与值（V）矩阵按 [14] 计算为

$$
\mathbf Q=\mathbf F\mathbf W_Q,\quad \mathbf K=\mathbf F\mathbf W_K,\quad \mathbf V=\mathbf F\mathbf W_V, \tag{5}
$$

其中 $\mathbf W_Q$、$\mathbf W_K$ 与 $\mathbf W_V$ 为可学习投影矩阵。随后由缩放点积注意力 [14] 得到融合 token 表示 $\tilde{\mathbf F}\in\mathbb R^{N\times D}$：

$$
\mathrm{Attention}(\mathbf Q,\mathbf K)=\mathrm{softmax}\left(\frac{\mathbf Q\mathbf K^\top}{\sqrt{D/h}}\right), \tag{6}
$$

$$
\tilde{\mathbf F}=\mathrm{Attention}(\mathbf Q,\mathbf K)\mathbf V, \tag{7}
$$

其中 $h$ 为注意力头数。通过该操作，$\mathbf F$ 中每个 token 通过从共享多模态序列的其他 token 中选择性聚合信息特征而更新，产生融合表示 $\tilde{\mathbf F}$。融合之后，$\tilde{\mathbf F}$ 按其原始模态划分重新组织，并返回相应分支以供后续处理：对摄像头、LiDAR 与雷达，融合后的 token 被重塑为特征图并送入下一阶段；对 GPS，由于其没有天然的二维空间结构，融合表示保持 token 形式并直接前向传递到下一阶段。

### C. 波束生成器与模型训练

在最后一个融合阶段之后，各模态特征通过带 softmax 归一化权重的可学习融合模块（即 $\otimes$）整合，使各模态的贡献可自适应调整。具体地，设 $\mathbf f_m$ 表示模态 $m$ 的全局池化特征，$\alpha_m$ 与 $w_m$ 分别表示其归一化重要度权重与可学习标量分数，则归一化权重由 softmax 操作得到：

$$
\alpha_m=\frac{\exp(w_m)}{\sum_j\exp(w_j)}, \tag{8}
$$

最终融合表示为

$$
\hat{\mathbf F}=\sum_m\alpha_m\mathbf f_m. \tag{9}
$$

该融合表示被送入紧凑的基于 MLP 的波束生成器以产生波束分数向量：

$$
\hat{\mathbf Y}=\mathrm{MLP}\left(\hat{\mathbf F}\right), \tag{10}
$$

预测波束索引对应码本中分数最大的波束成形向量。这样，更准确的波束预测可直接转化为更好的波束对齐，从而改善通信性能。

## IV. 通过模态生成增强 BeamTransFuser 的鲁棒性

为改善 BeamTransFuser 在感知条件不完整下的鲁棒性，我们引入一个用于缺失模态补全的生成模块。该模块的作用是从其余观测推断不可用感知模态的表示，使多模态输入不完整时下游波束预测流程仍能运行。具体而言，生成模型学习如何把隐变量映射到数据样本，从而产生遵循训练数据中所观察到的语义与结构模式的输出 [15]。

本文把所提生成机制构建在变分自编码器（variational auto-encoder，VAE）框架 [16] 之上。这一选择出于所考虑 V2X 场景的部署需求：与生成对抗网络（generative adversarial network，GAN）[17] 相比，基于 VAE 的模型通常更易优化、训练行为更稳定，尤其当目标数据分布复杂或高度多样时；与基于扩散的模型 [18] 相比，基于 VAE 的生成更适合时延敏感应用，因为基于扩散的生成在推理时通常涉及一长串去噪更新，产生显著更高的时延，而基于 VAE 的生成可以轻量前馈方式完成，更契合 V2X 系统中的实时波束预测 [16]。此外，由于缺失模态补全要求生成输出与当前观测到的感知输入保持一致，我们进一步采用条件变分自编码器（conditional VAE，CVAE），其编码器与解码器均以可用模态为条件 [19]。

令 $x\in\mathcal X$ 表示可用模态，$y\in\mathcal X$ 表示待生成的缺失模态。在此设置下，目标是推断以 $x$ 为条件的 $y$，等价于建模条件分布 $p(y\mid x)$。例如，若雷达观测缺失而摄像头与 LiDAR 可用，则摄像头与 LiDAR 构成 $x$，缺失的雷达模态对应 $y$。这样，生成过程由观测到的感知上下文而非无条件数据先验引导 [19]。具体而言，为增加条件生成过程的灵活性，引入隐变量 $z$ 以捕获观测模态未显式表示的隐含因素。于是给定 $x$ 时 $y$ 的条件分布可表示为

$$
p(y\mid x)=\int_zp_\theta(y\mid x,z)p(z\mid x)\,dz, \tag{11}
$$

其中 $p_\theta(y\mid x,z)$ 表示给定 $x$ 与 $z$ 时生成 $y$ 的条件似然（由 $\theta$ 参数化，即解码器），$p(z\mid x)$ 为隐变量的先验分布。随后训练该生成模型学习此条件分布，等价于最大化相应条件似然。然而该似然涉及对隐变量 $z$ 的边缘化，一般难以直接优化。为此引入由 $\phi$ 参数化的变分后验 $q_\phi(z\mid x,y)$（即编码器）近似真实后验，并通过优化标准 CVAE 目标训练模型 [16]、[19]：

$$
\mathcal L_{\mathrm{CVAE}}(\theta,\phi)=-\mathbb E_{z\sim q_\phi(z\mid x,y)}\left[\log p_\theta(y\mid x,z)\right]+\mathrm{KL}\left(q_\phi(z\mid x,y)\,\|\,p(z\mid x)\right). \tag{12}
$$

(12) 中第一项对应重构目标，促使解码器产生与目标 $y$ 对齐的模态表示；第二项把变分后验正则化到隐先验附近，有助于改善生成模块的稳定性与泛化能力。此外，在初始 CVAE 训练阶段之后，我们进一步执行轻量的任务感知微调步骤，把重构目标与下游波束预测损失联合优化。该精修在保持与目标特征空间一致的同时，提高了生成模态的任务相关性。

值得注意的是，显式建模依赖输入的条件先验 $p(z\mid x)$ 通常需要额外的先验网络，这会增加优化复杂度与推理开销。为使生成模块对时延敏感的 V2X 部署保持轻量，我们沿用 [19]、[20] 的做法，把条件先验松弛为固定的各向同性高斯分布，即 $p(z\mid x)=p(z)=\mathcal N(0,\mathbf I)$。注意该简化只影响隐先验：整体模型仍通过变分后验 $q_\phi(z\mid x,y)$ 与解码器 $p_\theta(y\mid x,z)$ 保持条件性。于是 (12) 中的损失可结合重参数化技巧、通过随机梯度下降高效优化 [19]。

我们按如下方式说明模态生成过程：首先，生成模块用成对的不完整/完整模态样本离线训练，且独立于 BeamTransFuser；训练完成后，仅保留解码器用于推理。给定可用模态 $x$，我们采样隐变量 $z\sim p(z)$，并把 $x$ 与 $z$ 一同送入解码器以重建缺失模态。生成的模态特征随后在特征层面注入 BeamTransFuser，即注入图 2 中特征提取阶段与多模态融合骨干之间。最后，生成的特征与观测模态特征一起由分层融合骨干联合处理，以完成波束预测。

## V. 性能评估

### A. 数据集与设置

我们在 DeepSense 6G 数据集 [21] 上评估所提 BeamTransFuser，这是一个面向研究社区公开可访问的真实世界多模态 V2X 数据集。该数据集提供同步的摄像头、LiDAR、雷达、GPS 与波束标签数据，其中每个标签对应从 64 波束码本中选出的最优波束索引。此外，该数据集非常适合评估所考虑任务，因为它反映了具有 LoS/NLoS 转换、多径传播、交通动态与光照变化的真实城市 V2X 环境。具体而言，我们聚焦城市街道场景 31–34 [21]，其中 RSU 从 RGB 摄像头、雷达、LiDAR、毫米波接收机与 GPS 采集多模态感知数据。合并开发集与适配集后，我们共得到 11,243 个样本，其中 90% 用于训练、其余 10% 用于验证。

对 BeamTransFuser，卷积编码器配置为核大小 $7\times7$、步长 2，每个多模态融合块使用四个注意力头、前馈扩展比为四。模型用 focal loss 训练 30 个 epoch，学习率为 $10^{-4}$。评估中我们采用 DBA-score 与 Top-$k$ 准确率作为主要性能指标 [21]。具体而言，DBA-score 刻画预测波束与目标波束的距离，因而可作为波束对齐质量的细粒度度量 [21]。我们进一步把所提框架与在同一数据集上报告的以下基线比较，包括 Avatar [22]、[9] 中基于位置与多模态的方法、TII [10]、CMDF [11]、ICMFE [12] 与 QTNs [23]。

### B. 实验结果

**1）收敛行为与训练时间。** 我们首先考察图 3 中的收敛行为与训练时间。如图 3(a) 所示，训练与验证损失在训练期间稳步下降并随后逐渐稳定，后期 epoch 未出现验证损失明显上升。这表明所提模型没有明显过拟合，在验证集上保持了令人满意的泛化性能。图 3(b) 进一步给出损失随训练时间的演化。全部训练实验在 NVIDIA GeForce RTX 4090 GPU 上完成。可以看到，约一小时后损失曲线变得平坦得多，表明优化已大体收敛，进一步训练仅带来边际改善。

**2）波束预测性能。** 我们随后按 DBA-score 评估波束预测性能。如表 I 所示，所提方法在所有对比方案中取得最高总体 DBA-score；它在全部四个场景中也表现稳定，场景 31、32、33、34 的 DBA-score 分别为 1.0000、0.9038、0.8988 与 0.8945。这种整体稳定性表明，所提框架可在多样城市条件下维持可靠波束预测，包括白天场景（场景 31 与 32）与夜间场景（场景 33 与 34）的光照变化，以及 LoS 与 NLoS 设置下不同的传播条件。

然而部分基线呈现不同趋势。例如，Avatar [22] 与 TII [10] 在场景 33 的 DBA-score 都高于场景 32，分别提升 0.15 与 0.061。这可能表明某些夜间场景（如背景杂波更弱或光照更均匀）对这些方法更有利。同时，各基线的改善幅度并不一致，说明其有效性强烈依赖不同感知模态的利用与融合方式。

与这些基线相比，BeamTransFuser 从场景 32 到 34 稳定得多，反映出对环境变化更强的鲁棒性。还值得注意的是，尽管 QTNs [23] 与 [12] 中的方法在场景 34 取得略高的 DBA-score，但差距很小，分别仅为 1.99% 与 1.42%。从总体看，BeamTransFuser 仍以 0.9129 的 DBA-score 排名第一。这些结果表明，尽管某些基线在个别场景中有竞争力，BeamTransFuser 在全部评估条件上更稳定，对现实 V2X 部署展现出更强的泛化与更可靠的波束预测。

**表 I　所选波束预测方案的 DBA-score 结果**

| 方案 | 总体 | S31 | S32 | S33 | S34 |
|---|---|---|---|---|---|
| Avatar [22] | 0.7162 | 0.6536 | 0.7074 | 0.8576 | 0.7120 |
| [9] | – | – | 0.8906 | – | – |
| TII [10] | 0.7844 | 0.7298 | 0.7852 | 0.8462 | 0.8433 |
| CMDF [11] | 0.8910 | – | – | – | – |
| ICMFE [12] | 0.8969 | 1.0000 | 0.9020 | 0.8874 | 0.9074 |
| QTNs [23] | – | 0.7605 | 0.8707 | 0.8864 | 0.9124 |
| BeamTransFuser（本文） | **0.9129** | 1.0000 | 0.9038 | 0.8988 | 0.8945 |

注：表中 "–" 表示所引工作未报告该结果。

BeamTransFuser 的优异 DBA 性能可归因于两个主要因素。第一，模型联合利用摄像头、LiDAR、雷达与 GPS 的互补信息，使几何结构、视觉语义、运动线索与位置信息以统一方式得到利用；这在城市 V2X 场景中尤为有益，因为单一感知模态在遮挡、NLoS 传播或环境变化下可能变得不可靠。第二，分层 Transformer 融合设计使跨模态信息可在多个表示层级上逐步整合，而非仅在最终阶段合并一次；因此 BeamTransFuser 能更好地同时捕获模态特定的结构信息与语义上下文，从而在多样场景中产生更鲁棒、更一致的波束预测。

**3）模态补全下的性能。** 我们接着研究 BeamTransFuser 在模态缺失时的鲁棒性。为模拟某一感知模态不可用的实际情形（如因传感器故障或不完整部署），我们用零填充数据或高斯噪声替代缺失输入，并把所得输出视为退化基线；随后把这些基线与所提生成模型重建缺失模态的情形比较。

**表 II　模态缺失条件下的 Top-$k$ 波束预测准确率**

| 缺失模态 | 替代条件 | Top-1（%） | Top-2（%） | Top-3（%） |
|---|---|---|---|---|
| 雷达 | 零填充 | 6.67 | 9.07 | 15.02 |
| 雷达 | 高斯噪声 | 6.67 | 9.42 | 14.22 |
| 雷达 | 生成（摄像头+LiDAR） | **45.51** | **70.31** | **82.58** |
| LiDAR | 零填充 | 6.67 | 9.07 | 13.96 |
| LiDAR | 高斯噪声 | 6.67 | 9.07 | 13.78 |
| LiDAR | 生成（摄像头+雷达） | **56.18** | **79.82** | **89.07** |
| 摄像头 | 零填充 | 2.40 | 4.27 | 6.40 |
| 摄像头 | 高斯噪声 | 3.02 | 6.31 | 8.27 |

如表 II 所示，当雷达或 LiDAR 不可用时，无论采用零填充还是高斯噪声替代，Top-1 准确率都急剧下降，表明这些感知输入的缺失严重劣化波束预测性能。相反，用 CVAE 生成的特征替代缺失模态可大幅恢复预测准确率，验证了所提模态生成机制在感知不完整条件下的有效性。具体而言，缺失雷达时 Top-1 准确率从 6.67% 提升到 45.51%，缺失 LiDAR 时从 6.67% 提升到 56.18%。这些显著增益表明，生成模块可从其余观测中恢复有信息量的模态特征，并在某一感知源不可用时提供有意义的补偿。我们未报告生成摄像头的情形，因为重建高维 RGB 特征要困难得多且会引入高得多的复杂度。即便如此，缺失雷达与缺失 LiDAR 设置下取得的强劲恢复已足以证明所提生成机制在感知不完整条件下实现鲁棒波束预测的实用价值。

## VI. 结论

本文提出了基于分层融合与模态生成的 V2X 网络多模态波束预测框架。具体而言，我们开发了 BeamTransFuser，它通过渐进式 Transformer 融合利用摄像头、LiDAR、雷达与 GPS 的互补信息，实现准确而鲁棒的波束预测。为进一步处理实际部署中可能出现的感知条件不完整，我们引入了生成模块，从可用观测重建缺失模态特征，从而在无需重新训练的情况下改善鲁棒性。真实世界多模态 V2X 数据集上的实验结果表明，所提方法在提升波束预测准确率方面优于竞争方案，也证实生成模块可在部分感知输入不可用时实现稳定的波束预测。未来工作中，我们将把该框架扩展到更具挑战性的城市场景与多车辆设置。

## 图注与表注

**图 1：** 多模态感知辅助波束预测系统。RSU 采集实时观测，用预训练模型处理，然后确定波束成形决策（图中包含窄波束、摄像头、LiDAR 与雷达、RSU、GPS）。

**图 2：** BeamTransFuser 架构：模态特定分支与分层跨模态融合（含四阶段多模态融合骨干、多模态融合块 1/4、编码器/解码器、BeamGenerator、池化与残差连接 $\oplus$、可学习融合 $\otimes$）。

**图 3：** 所提模型的训练行为。（a）训练与验证损失随 epoch 的变化；（b）训练与验证损失随训练时间的变化（约 1 小时后收敛）。

**表 I：** 所选波束预测方案的 DBA-score 结果（逐格见正文表 I，含 "–" 表示所引工作未报告）。

**表 II：** 模态缺失条件下的 Top-$k$ 波束预测准确率（缺失雷达/LiDAR/摄像头，分别与零填充、高斯噪声、生成特征替代对照；逐格见正文表 II）。

> **原文说明：** 原文无附录、无致谢/基金段落；正文第 VI 节结论后直接为参考文献。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 6 页转录；未逐条核对 DOI）。

[1] ITU-R WP5D, "Draft New Recommendation ITU-R M. [IMT. Framework for 2030 and Beyond]," 2023.

[2] D. Zhang et al., "Integrated sensing and communications over the years: An evolution perspective," IEEE Commun. Surv. Tutor., pp. 1–1, 2026.

[3] C. Shang, J. Yu, and D. Thai Hoang, "Energy-efficient and intelligent isac in V2X networks with spiking neural networks-driven DRL," IEEE Trans. Wireless Commun., vol. 25, pp. 1182–1195, 2026.

[4] C. Shang, D. T. Hoang, and J. Yu, "Multi-modal beamforming with model compression and modality generation for v2x networks," IEEE Trans. Mobile Comput., pp. 1–15, 2026.

[5] Y. Xiong et al., "On the fundamental tradeoff of integrated sensing and communications under gaussian channels," IEEE Trans. Inf. Theory, vol. 69, no. 9, pp. 5723–5751, 2023.

[6] C. Shang et al., "Sensing-assisted swipt with hybrid learning for low-power sensors on aerial-to-ground mobile platforms," IEEE J. Sel. Areas Commun., vol. 44, pp. 5043–5059, 2026.

[7] Z. Du et al., "Toward ISAC-empowered vehicular networks: Framework, Advances, and Opportunities," IEEE Wireless Commun., vol. 32, no. 2, pp. 222–229, 2025.

[8] X. Cheng et al., "Intelligent multi-modal sensing-communication integration: Synesthesia of machines," IEEE Commun. Surv. Tutorials, vol. 26, no. 1, pp. 258–301, 2024.

[9] B. Shi et al., "Multimodal deep learning empowered millimeter-wave beam prediction," in 2024 IEEE 99th Vehicular Technology Conference, 2024, pp. 1–6.

[10] Y. Tian et al., "Multimodal transformers for wireless communications: A case study in beam prediction," arXiv preprint arXiv:2309.11811, 2023.

[11] Q. Zhu et al., "Advancing multi-modal beam prediction with multipath-like data augmentation and efficient fusion mechanism." New York, NY, USA: Association for Computing Machinery, 2024.

[12] Q. Zhu, Y. Wang, W. Li, H. Huang, and G. Gui, "Advancing multi-modal beam prediction with cross-modal feature enhancement and dynamic fusion mechanism," IEEE Trans. Commun., vol. 73, no. 9, pp. 7931–7940, 2025.

[13] K. He et al., "Deep residual learning for image recognition," in Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, 2016, pp. 770–778.

[14] A. Vaswani et al., "Attention is all you need," Advances in neural information processing systems, vol. 30, 2017.

[15] S. Bond-Taylor et al., "Deep generative modelling: A comparative review of vaes, gans, normalizing flows, energy-based and autoregressive models," IEEE Trans. Pattern Anal. Mach. Intell., vol. 44, no. 11, pp. 7327–7347, 2022.

[16] D. P. Kingma and M. Welling, "Auto-encoding variational bayes," in International Conference on Learning Representations, Apr. 2014, pp. 1–14.

[17] I. J. Goodfellow et al., "Generative adversarial nets," Advances in neural information processing systems, vol. 27, 2014.

[18] F.-A. Croitoru et al., "Diffusion models in vision: A survey," IEEE Trans. Pattern Anal. Mach. Intell., vol. 45, no. 9, pp. 10 850–10 869, 2023.

[19] K. Sohn et al., "Learning structured output representation using deep conditional generative models," in Advances in Neural Information Processing Systems, C. Cortes, N. Lawrence, D. Lee, M. Sugiyama, and R. Garnett, Eds., vol. 28. Curran Associates, Inc., 2015.

[20] D. P. Kingma et al., "Semi-supervised learning with deep generative models," Advances in neural information processing systems, vol. 27, 2014.

[21] A. Alkhateeb et al., "Deepsense 6G: A large-scale real-world multi-modal sensing and communication dataset," IEEE Commun. Mag., vol. 61, no. 9, pp. 122–128, 2023.

[22] "Deepsense ITU multi modal beam prediction challenge 2022 – deepsense," Deepsense6g.net, 2022. [Online]. Available: https://www.deepsense6g.net/challenge2022

[23] S. Tariq et al., "Deep quantum-transformer networks for multimodal beam prediction in isac systems," IEEE Internet Things J., vol. 11, no. 18, pp. 29 387–29 401, 2024.

**本页范围与校对状态：** 本页为 arXiv:2609.10200v1 的全文中文译稿：摘要、正文第 I–VI 节（含 II、III-A/B/C、IV、V-A/B 全部小节）、结论、表 I／表 II 逐格、图 1–3 图注与参考文献 [1]–[23]。公式编号沿用原文 (1)–(12)；原文 P1 的优化式在抽取文本中记作 $\Theta^*=\arg\min_\Theta\sum_i\mathcal L(\mathcal M_\Theta(X_i),Y_i)$，译文按原式保留。表 I 与表 II 已用 PDF 第 5 页与第 6 页渲染图逐格核对（数值、加粗与 "–" 标记一致）。原文无附录、无致谢/基金段落，故未设"致谢"节。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误。骨架"版本"行原为 2026-09-24（收录日），已按 BRIEF2 结构改为 arXiv:2609.10200v1（2026-09-09，依据 PDF 页眉 "arXiv:2609.10200v1 [cs.LG] 9 Sep 2026"）；作者为 Chen Shang、Dinh Thai Hoang、Diep N. Nguyen、Jiadong Yu；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
