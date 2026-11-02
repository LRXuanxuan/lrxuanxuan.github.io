---
layout: page
title: "TamedFlow：面向教师辅助扩散采样的轨迹感知蒸馏｜中文全文译文"
permalink: /papers/translations/2026-11-02-2610-26025-tamedflow-trajectory-aware-distillation-for-teacher-assisted-diffusion/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3e271bfeaf1775d0/) · [原文 arXiv](https://arxiv.org/abs/2610.26025/) · [全部目录](/papers/catalog/)

# TamedFlow：面向教师辅助扩散采样的轨迹感知蒸馏

**原题：** TamedFlow: Trajectory-Aware Distillation for Teacher-Assisted Diffusion Sampling  
**作者：** Shuaiqi Cheng¹,*、Jiahao Zhang¹,*、Boyuan Gu²、Yuxi Chen³、Haiying Xu¹、Zexin Lu⁴、Huiyu Zhou⁵、Xuming Hu¹,³（¹The Hong Kong University of Science and Technology (Guangzhou) 香港科技大学（广州）；²University of Electronic Science and Technology of China 电子科技大学；³The Hong Kong University of Science and Technology 香港科技大学；⁴Huawei Technologies Ltd. 华为技术有限公司；⁵Guangxi Zhuang Autonomous Region Information Center 广西壮族自治区信息中心；*表示同等贡献，即共同第一作者。单位按 PDF 首页原文转写。）  
**版本：** arXiv:2610.26025v2（v2 标注 2026-10-20）；24 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节全部正文与小节（§2.1–2.3、§3.1–3.4、§4.1–4.5）、命题 3.1（Proposition 3.1）及其附录 F 证明、算法 1、表 1–12（逐格转写）、图 1–10 图注、式 (1)–(8) 与式 (E.1)、(F.1)–(F.10)、(I.1)–(I.2)；附录 A–L；参考文献 [1]–[35]（英文原条目；原文采用作者—年份制、未编号，本页按原文出现顺序编号）；许可：CC BY 4.0。逐句逐式终校未做。

## 摘要

Diffusion Transformers（DiT）能够生成高保真的图像与视频，但推理需要大量顺序执行的模型评估。两类加速策略正变得日益重要：模型压缩使每次评估更便宜，而自适应推理则通过复用、预测或推测执行来跳过选定的教师计算。然而二者的组合是脆弱的：把已评估过的自适应方法直接施加到压缩学生上会降低质量，我们把这一观察到的失效模式称为**组合鸿沟（Combination Gap）**。我们把该鸿沟归因于逐点蒸馏与短时程执行之间的失配：一个在教师状态上训练的学生，当其自身的预测被逐级串联时，未必仍然可靠。我们提出 **TamedFlow**，通过跨架构特征对齐、近恒等速度对齐头（Velocity Alignment Head, VAH）与随机化轨迹展开监督，训练压缩 DiT 以承担这一部署角色。推理时，一个轻量的学习型轨迹估计器（Learnable Trajectory Estimator, LTE）对已完成的草稿进行路由：被接受的草稿绕过教师，被拒绝的草稿回滚并获得一次教师救援步。把 DiT-XL/2 蒸馏为 DiT-B/2 时，TamedFlow 在 ImageNet 256×256 上、相对 DDIM-50 取得 2.25× 实测加速的同时达到 FID 2.58。消融实验支持轨迹监督的作用，路由控制在延迟几乎相同的条件下更偏好 LTE 而非随机决策。在 ImageNet 512×512、MS-COCO 以及 Latte/FaceForensics 上的评估扩展了经验范围。

## 1 引言

Diffusion Transformers（DiT）已成为高保真视觉生成的主流骨干（Peebles & Xie, 2023），但迭代去噪带来了很高的推理延迟。每个样本都需要数十次顺序前向计算，其开销随模型参数、分辨率与序列长度迅速增长。已有的加速策略针对这一开销的互补侧面：步数缩减方法缩短求解器时间表（Song et al., 2023; Luo et al., 2023; Geng et al., 2026; Kim et al., 2025）；参数压缩降低每步计算量；自适应推理则复用或预测中间激活（Ma et al., 2024b; Selvaraju et al., 2024; Liu et al., 2025a;b）。把参数压缩与自适应执行结合起来在直觉上很有吸引力：既能降低单次评估成本，又能跳过冗余计算。下文所有主要实验都使用固定步长的 DDIM 积分，以便在统一的求解器约定下评估压缩与自适应执行。

在实践中，这种组合可能会失效。在我们的受控诊断中（附录表 11），把已评估的自适应复用方法直接附加到压缩学生上会降低样本质量，使 ImageNet 256×256 的 FID 从 5.56 升高到 10.40–13.18。我们把这一失效模式称为**组合鸿沟（Combination Gap）**。该结果暴露出一种操作层面的失配：一个为逐点一致而训练的学生，在其自身预测改变了后续所遇状态之后，未必仍然可靠。与其把内部复用原封不动地套用到紧凑模型上，我们让学生生成短时程的轨迹草稿，并把教师干预保留给那些被预测会偏离的草稿。

**图 1（原文 Fig. 1）：** 组合鸿沟与 TamedFlow。在我们的诊断中，把自适应复用直接施加到参数压缩的学生上会严重降低质量。TamedFlow 转而训练压缩学生以获得短时程的轨迹一致。一个 4M 参数的 LTE 对草稿进行路由：被接受的草稿绕过教师；被拒绝的草稿回滚以执行一次教师救援步。图中含两个面板：(a) 轨迹漂移（Trajectory Drift）——在扩散步（Diffusion Step）上对比完整计算（Full Computation）、未驯化学生（Student w/o Taming）与驯化学生（Student w Taming）的轨迹；(b) 轨迹驯化（Trajectory Taming）——LTE 依据置信度与阈值 \(c\le\tau\)、\(c\ge\tau\) 给出接受（Accept）/拒绝（Reject），未被接受的路线（Unaccepted Route）触发教师救援（Teacher Rescue）。

然而，把学生的预测串联成草稿会引入累积的积分漂移。命题 3.1 通过一个欧拉轨迹展开上界刻画这一点：空间敏感度可能沿顺序步放大局部的学生—教师速度失配。为了抑制这种放大、稳定草稿过程，我们提出 **TamedFlow**，把轨迹感知蒸馏与选择性教师救援结合起来（图 1）。训练期间，跨架构特征对齐（AlignNet）将学生表示锚定到教师层；近恒等速度对齐头（VAH）吸收残余速度误差；随机化 \(K\) 步轨迹展开监督（\(K\sim\mathcal U(1,5)\)）同时惩罚中间失配与累积的端点漂移。两阶段课程在特征对齐之后才引入多步目标。

推理时，TamedFlow 采用非对称执行策略。一个紧凑的学习型轨迹估计器（LTE，4M 参数）仅从池化的学生 token 与时间步嵌入对完成的草稿打分，不需要访问教师。若置信度超过阈值 \(\tau\)，草稿被接受，采样器前进 \(K\) 步并绕过教师；若被拒绝，采样器回滚到草稿前状态，并用教师救援前进一步。调整 \(\tau\) 可在吞吐与保真度之间的实测工作点之间切换，而无需顺序的教师验证。

把 DiT-XL/2 蒸馏为 130M 的 DiT-B/2 学生，在 ImageNet 256×256 上，TamedFlow 相对 DDIM-50 教师取得 2.25× 实测加速（0.464 s 对 1.044 s）的同时达到 FID 2.58。在相近延迟下，TamedFlow 的 FID 优于所评估的免训练自适应基线（例如 FoCa 的 FID 2.65、0.466 s）。受控消融支持轨迹监督与学习型路由（在延迟几乎相同的条件下），而 ImageNet 512×512、MS-COCO 与 Latte 视频 DiT 上的评估扩展了经验范围。总结而言，我们的贡献是：

- **组合鸿沟的诊断与分析。** 我们记录了把已评估的自适应复用方法施加到压缩 DiT 上的失效，并推导出一个 DDIM 轨迹展开上界，刻画顺序草稿过程如何放大局部速度误差。
- **轨迹稳定的推测式蒸馏。** 我们提出 TamedFlow，把特征对齐、残余速度校正与随机轨迹展开监督结合起来，使压缩 DiT 为自主多步草稿过程而优化。
- **学习型路由与部署评估。** 我们提出一种由 4M 参数 LTE 实现的非对称执行策略，用于接受可靠草稿或触发教师救援；并在多种分辨率、文本条件与视频设定下评估质量—延迟权衡以及实际部署成本。

## 2 相关工作

已有关于 DiT 加速的工作，或减少求解器评估次数，或降低每次评估成本，或减少自适应执行期间保留的教师计算。TamedFlow 研究的是它们之间的接口：压缩学生能否可靠地替代教师轨迹中的短片段。

### 2.1 扩散模型与流模型中的步数缩减

步数缩减降低求解器评估次数。高阶求解器提高固定模型下的数值效率（Song et al., 2021; Lu et al., 2025），而蒸馏则改变模型本身：渐进蒸馏缩短时间表（Salimans & Ho, 2022），一致性模型跨噪声水平匹配预测（Song et al., 2023; Luo et al., 2023），MeanFlow 与 Model-Guidance 改变目标或吸收引导（Geng et al., 2026; Tang et al., 2025）。其他表述对齐分布或得分、以自回归方式蒸馏、迁移轨迹，或以对抗方式训练少步学生（Yin et al., 2024; Zhou et al., 2025; Kim et al., 2025; Luo et al., 2025; Sauer et al., 2024）。这些方法优化的是一个稀疏的独立采样器，并完全依靠自身部署。TamedFlow 则保留多步教师作为可靠兜底，并用学生提出短轨迹片段，其接受与否在线自适应决定。

与之相关的一条研究路线考察轨迹几何。Rectified flow 与 InstaFlow 构造更直的路径（Liu et al., 2023）；interpolant transformer 统一扩散与流的参数化（Ma et al., 2024a）；引导路径采样在积分过程中修正轨迹（Li et al., 2026）。TCD 与 Hyper-SD 为少步采样学习一致性或轨迹片段（Zheng et al., 2024; Ren et al., 2024）。TamedFlow 保留教师路径作为参考，为择机接受的轨迹展开训练一个跨架构学生，并在部署采样器中保留教师救援。

### 2.2 每步计算加速与特征缓存

每步方法保留时间表，同时避免完整重算。特征复用方法跨时间步或模块缓存激活（Ma et al., 2024b; Chen et al., 2024; Selvaraju et al., 2024; Zou et al., 2025; 2026b; Wimbauer et al., 2024）；预测方法外推未来特征（Liu et al., 2025a;b; Cai et al., 2026; Huang et al., 2025）；学习型调度器为每个样本选择策略（Zhao et al., 2026）。这些方法利用中间计算中的局部规律性。我们的同一学生诊断表明，它们已评估的配置并不能直接迁移到压缩学生上，但该诊断并未分离出普适的缓存失效机制。

多数复用方法保持模型不变，只决定哪些内部计算可以跳过。TamedFlow 则改为在轨迹展开监督下训练学生，并学习一个由学生生成的完整片段能否在不调用教师的情况下推进。DisCa（Zou et al., 2026a）同样研究了步蒸馏视频 DiT 与特征缓存之间的不兼容性，但它用预测器与 Restricted MeanFlow 时间表修复缓存一侧；TamedFlow 作用的则是草稿学生一侧。

### 2.3 生成范式中的推测式验证

推测解码用一个目标模型验证候选 token（Leviathan et al., 2023）；因果掩码允许并行验证与精确纠正。扩散模型缺乏这种结构，因为每个教师状态都依赖于前一个预测。要精确重放一个 \(K\) 步草稿，就需要顺序的教师评估，从而抹去大部分节省。SpecDiff（Pan et al., 2026）在这一约束下研究自推测式扩散。TamedFlow 用学习型轨迹估计替代精确验证。LTE 在草稿之后对学生内部特征打分，其训练目标为轨迹展开一致性。被接受的草稿避开教师；被拒绝的草稿回到草稿前状态并接受一次教师步。因此路由廉价且在线，但它是近似的，并且从构造上就不保分布（not distribution-preserving）。

## 3 方法

### 3.1 预备知识：扩散模型、DiT 与流匹配

扩散模型（Ho et al., 2020）学习逆转一个逐渐加噪的过程，因此生成需要一系列依赖状态的模型评估。Diffusion Transformer（DiT）（Peebles & Xie, 2023）用作用于潜空间图像块的 transformer 实现去噪器，并通过自适应层归一化注入时间步与条件信息。我们的方法以速度（velocity）形式表述，因为其轨迹损失与稳定性分析都作用于采样过程中所跟随的向量场。流匹配（Lipman et al., 2023）把生成表述为一条概率路径 ODE。取 \(x_0\sim\mathcal N(0,I)\)、\(x_1\sim p_{\mathrm{data}}\)，以及线性插值 \(x_t=(1-t)x_0+tx_1\)，则条件速度 \(x_1-x_0\) 提供回归目标：

$$
\mathcal L_{\mathrm{FM}}=\mathbb E_{t,x_0,x_1}\left[\left\|v_\theta(x_t,t)-(x_1-x_0)\right\|_2^2\right],\qquad t\sim\mathcal U[0,1].\tag{1}
$$

我们使用前向流时间，即噪声在 \(t=0\)、数据在 \(t=1\)。主要实验使用前述 DDIM 时间表；下文的欧拉离散只是一个分析工具，同时也是用于定义轨迹目标的展开规则。

### 3.2 空间误差放大与轨迹展开稳定性

逐点速度匹配只在被采样的状态上约束学生，并不约束其自身预测被串联之后所到达的状态。下面的命题把引发漂移的局部失配与放大该失配的空间敏感度分开。它适用于顺序欧拉草稿，并不分析内部特征缓存或预测。

**命题 3.1（\(K\) 步轨迹对齐上界，\(K\)-Step Trajectory Alignment Bound）。** 令 \(\tilde v_S\equiv v_S^{\mathrm{aligned}}\) 表示部署的学生速度场，并令 \(x_S^{\mathrm{roll}}(K)\) 与 \(x_T^{\mathrm{roll}}(K)\) 为对齐学生与教师从状态 \(x_t\) 出发、以固定步长 \(h\) 经过 \(K\) 次顺序欧拉步之后的端点。在公共时刻 \(t_k=t+kh\) 处省略时间参数，定义基线速度失配 \(\delta_v^{(k)}\triangleq\tilde v_S(x_T^{(k)})-v_T(x_T^{(k)})\)，并记 \(\|\delta_v\|_\infty\triangleq\max_k\|\delta_v^{(k)}\|_2\)。令 \(L_T\triangleq\sup_{x,t}\|J_{v_T}(x,t)\|_2\)，\(\Delta J\triangleq\sup_{x,t}\|J_{\tilde v_S}(x,t)-J_{v_T}(x,t)\|_2\)。假设两个速度场在包含每对成对学生—教师状态之间线段的区域上连续可微，且 \(C\triangleq L_T+\Delta J<\infty\)，则空间偏差满足离散 Grönwall 上界：

$$
\left\|x_S^{\mathrm{roll}}(K)-x_T^{\mathrm{roll}}(K)\right\|_2\le\frac{\|\delta_v\|_\infty}{C}\left((1+hC)^K-1\right),\tag{2}
$$

其中 \(h>0\) 为固定的欧拉积分步长；当 \(C=0\) 时，右端解释为 \(Kh\|\delta_v\|_\infty\)。当 \(KhC\ll 1\) 时，这意味着少步展开 \(Kh\|\delta_v\|_\infty+\mathcal O(K^2h^2C\|\delta_v\|_\infty)\)。由 \(e_0=0\) 展开递推式 \(\|e_{k+1}\|_2\le(1+hC)\|e_k\|_2+h\|\delta_v\|_\infty\) 即得式 (2)；附录 F 给出证明。该结论对方法设计的启示有限但有用：当同一误差被反复传播时，仅降低单步失配是不够的，因此训练还应让学生接触短的轨迹展开。该上界既未建立普适的二次误差律，也不保证我们的目标函数会最小化 \(C\)。

### 3.3 分阶段训练

图 2 概括了用于特征对齐的 AlignNet、用于残余速度校正的 VAH，以及用于草稿打分的 LTE。两阶段课程（two-stage curriculum）把特征初始化与轨迹展开监督分开。

**图 2（原文 Fig. 2）：** TamedFlow 总览。左：AlignNet、VAH 与 LTE 附加在学生骨干上。中：两阶段课程，阶段 1 为特征对齐，阶段 2 为轨迹展开监督。右：推理时通过 LTE 对草稿进行路由；被接受的草稿绕过教师，被拒绝的草稿回滚并执行一次教师步。图中模块细节：(a) AlignNet 的模块架构（Linear、LayerNorm、GELU、Linear）；(b) VAH 为 Conv2D 与 MLP 构成的残差块（Conv2d Stack）；(c) LTE 接收池化 token、时间步与条件表示，经三个 Linear+SiLU 投影后拼接，送入 MLP 与 Sigmoid 输出置信度。中部示意教师骨干层与学生骨干层经 AlignNet 配对，并给出教师 \(K\) 步轨迹展开与学生 \(K\) 步轨迹展开，分别对应阶段 1 与阶段 2 的损失项。

**设定与状态提取。** 令 \(v_T\) 与 \(v_S\) 分别表示求解器所使用的教师与学生速度场。逐点蒸馏使用 \(\mathcal L_v=\mathbb E\left[D^{-1}\left\|v_S(x_t,t)-v_T(x_t,t)\right\|_2^2\right]\)，其中 \(D\) 为潜空间维数；阶段 2 把该损失作用到下文定义的对齐学生速度上。学生骨干在其常规前向过程中还会暴露隐藏 token，LTE 之后利用它们做路由，而无需额外的骨干评估。

**阶段 1：特征对齐。** 阶段 1 冻结 VAH，并以速度匹配与中间特征匹配训练骨干。AlignNet 使用 2 层 MLP 投影器，把学生层 \(\{3,7,11\}\) 与教师层 \(\{9,18,27\}\) 配对，覆盖从早期到后期的表示。

$$
\mathcal L_{\mathrm{align}}=\frac13\sum_{l\in\{3,7,11\}}\frac{\left\|\mathrm{Al}\left(f_S^l\right)-f_T^{\pi(l)}\right\|_2^2}{\left\|f_T^{\pi(l)}\right\|_2^2}.\tag{3}
$$

这里 \(\pi(3)=9\)、\(\pi(7)=18\)、\(\pi(11)=27\)。阶段 1 的目标 \(\mathcal L_{\mathrm{stage1}}=\mathcal L_v+\lambda_{\mathrm{align}}\mathcal L_{\mathrm{align}}\) 初始化出一个学生，其内部表示与速度预测在自由运行监督开始之前都已锚定到教师。

**阶段 2：轨迹展开监督。** 阶段 1 稳定之后，我们启动轨迹展开层面的监督。为了学习残余速度校正，我们解冻**速度对齐头（VAH）**——一个初始化为小幅输出校正的卷积残差头，使 \(v_S^{\mathrm{aligned}}\approx v_S\)：

$$
v_S^{\mathrm{aligned}}=v_S+\mathrm{VAH}(v_S;\phi).\tag{4}
$$

阶段 2 面向短时程使用来训练模型。我们在教师状态上比较对齐学生速度与教师速度，并分别惩罚两个模型各自沿自己的轨迹展开所得到的端点：

$$
\mathcal L_{\mathrm{stage2}}=\mathcal L_v+\lambda_{\mathrm{roll}}\mathcal L_{\mathrm{roll}}(K)+\lambda_z\mathcal L_z+\lambda_{\mathrm{conf}}\mathcal L_{\mathrm{conf}},\tag{5}
$$

其中 \(\mathcal L_{\mathrm{roll}}(K)=\frac{1}{KD}\sum_{k=0}^{K-1}\left\|v_S^{\mathrm{aligned}}\left(x_T^{(k)},t+k\Delta t\right)-v_T\left(x_T^{(k)},t+k\Delta t\right)\right\|_2^2\) 是教师状态上的速度锚定，而 \(\mathcal L_z=D^{-1}\left\|x_S^{\mathrm{roll}}(K)-x_T^{\mathrm{roll}}(K)\right\|_2^2\) 是自由运行的端点损失，它由两个场从同一初始状态出发、各自沿自身状态展开而得到。端点损失通过展开的学生步反传；训练时 \(K\) 从 \(\{1,2,3,4,5\}\) 中均匀采样，使模型不会专门化到单一水平。对任意固定的教师状态轨迹展开，有 \(\|\delta_v\|_\infty\le\sqrt{KD\mathcal L_{\mathrm{roll}}}\)；这把经验损失与命题 3.1 中的强迫项联系起来，但它并不是由平均训练目标给出的统一保证。LTE 用下式训练：

$$
\mathcal L_{\mathrm{conf}}=\mathrm{MSE}\left(\mathrm{LTE}\left(\mathrm{sg}\left[\bar f_S^{\mathrm{last}},e_{t_{K-1}},e_y\right]\right),\mathrm{sg}\left[c^\star\right]\right),\tag{6}
$$

其中 \(\bar f_S^{\mathrm{last}}\) 表示草稿中最后一次学生前向的均值池化隐藏 token，\(\mathrm{sg}[\cdot]\) 表示停止梯度（stop-gradient）。因此 LTE 从与在线可用信号同类型的信号中学习，而其损失不会扰动学生骨干。

### 3.4 通过置信度路由的自推测执行

对 \(K\) 步草稿，目标分数 \(c^\star\) 结合端点轨迹展开偏差与公共起始状态上的速度误差：

$$
c^\star=\exp\left(-\alpha\frac{\left\|x_S^{\mathrm{roll}}(K)-x_T^{\mathrm{roll}}(K)\right\|_2^2}{DT_z}-(1-\alpha)\frac{\left\|v_S^{\mathrm{aligned}}(x_t,t)-v_T(x_t,t)\right\|_2^2}{DT_v}\right),\tag{7}
$$

其中 \(D\) 为潜空间维数，\(T_z,T_v\) 为温度。任一项差异变大时该分数下降；它是一个回归目标，而不是“草稿保持了样本质量”的标定概率。推理时 LTE 仅从学生特征预测该分数。

**LTE 推理。** 对长度为 \(m\) 的截断草稿，LTE 使用均值池化 token、最后一次草稿前向在 \(t_{i+m-1}\) 处的时间步嵌入，以及条件表示：

$$
h_{\mathrm{LTE}}=\sigma(g_f)W_1\bar f_S+\sigma(g_t)W_2e_{t_{i+m-1}}+\sigma(g_y)W_3e_y,\qquad c=\sigma\left(w^\top\mathrm{MLP}(h_{\mathrm{LTE}})+b\right).\tag{8}
$$

LTE 没有显式的水平（horizon）输入，因此其分数是一种经验路由信号，而不是针对特定水平的误差保证。

**路由。** 学生起草 \(K\) 步，并在时间表边界处截断。若 \(c\ge\tau\)，采样器接受整段草稿并绕过教师；否则丢弃暂定状态、恢复草稿前状态，并用教师前进一步。附录 H 给出完整算法。

## 4 实验

**表 1（原文 Table 1）：** 使用 DiT-XL/2 的 ImageNet 256×256 类条件生成。“延迟”为单张 A800-80GB、批大小 1、10 次运行平均的实测墙钟时间；“加速比”相对 DDIM-50 教师；“FLOPs”统计骨干评估；括号内为相对教师的差值。粗体为 TamedFlow 行。

| 方法 | 延迟 (s)↓ | 加速比↑ | FLOPs (T)↓ | FID↓ | IS↑ |
|---|---|---|---|---|---|
| *DDIM-50 教师* | *1.044* | *1.00×* | *23.74* | *2.35* | *237.62* |
| **纯学生** | **0.180** | **5.80×** | **2.30** | **5.56 (+3.21)** | **195.07 (−42.55)** |
| **全规模少步蒸馏** | | | | | |
| 渐进蒸馏（step=4）(Salimans & Ho, 2022) | 0.068 | 15.35× | 0.474 | 10.25 (+7.90) | 181.58 (−56.04) |
| LCM（step=4）(Luo et al., 2023) | 0.072 | 14.50× | 0.476 | 6.81 (+4.46) | 202.73 (−34.89) |
| ARD（step=4）(Kim et al., 2025)（N=6） | 0.074 | 14.11× | 0.480 | 4.32 (+1.97) | 209.03 (−28.59) |
| **1.5×–2.0× 加速区间** | | | | | |
| DDIM-25 | 0.558 | 1.87× | 11.87 | 3.21 (+0.86) | 229.91 (−7.71) |
| ∆-DiT (Chen et al., 2024)（N=2） | 0.684 | 1.53× | 18.04 | 2.78 (+0.43) | 223.47 (−14.15) |
| TaylorSeer (Liu et al., 2025a)（N=2） | 0.630 | 1.66× | 12.35 | 2.47 (+0.12) | 230.21 (−7.41) |
| FoCa (Zheng et al., 2026)（N=2） | 0.634 | 1.65× | 12.35 | 2.37 (+0.02) | 233.70 (−3.92) |
| SpecDiff (Pan et al., 2026) | 0.644 | 1.62× | 14.58 | 2.39 (+0.04) | 235.18 (−2.44) |
| **TamedFlow（τ=0.85）** | **0.602** | **1.73×** | **8.53** | **2.33 (−0.02)** | **236.15 (−1.47)** |
| **2.0×–2.5× 加速区间** | | | | | |
| DDIM-20 | 0.442 | 2.36× | 9.49 | 3.87 (+1.52) | 219.40 (−18.22) |
| FORA (Selvaraju et al., 2024)（N=3） | 0.482 | 2.17× | 8.58 | 3.65 (+1.30) | 228.14 (−9.48) |
| TaylorSeer (Liu et al., 2025a)（N=3） | 0.477 | 2.19× | 8.56 | 2.73 (+0.38) | 229.36 (−8.26) |
| FoCa (Zheng et al., 2026)（N=3） | 0.466 | 2.24× | 8.56 | 2.65 (+0.30) | 230.56 (−7.06) |
| SpeCa (Liu et al., 2025b) | 0.504 | 2.07× | 4.76 | 2.78 (+0.43) | 229.74 (−7.88) |
| **TamedFlow（τ=0.80）** | **0.464** | **2.25×** | **6.83** | **2.58 (+0.23)** | **233.43 (−4.19)** |

### 4.1 实验设置

**模型与数据集。** 主设定在类条件 ImageNet 256×256 上，把 675M 参数的 DiT-XL/2 教师 \(T_\phi\)（Peebles & Xie, 2023）蒸馏为 130M 参数的 DiT-B/2 学生 \(B_\theta\)。我们在 ImageNet 512×512 上评估分辨率扩展，在 MS-COCO 上评估文本条件，并用 Latte 在 FaceForensics 上评估视频生成。对 COCO，一个共享的 19.9M 文本条件适配器把 77-token 的 CLIP ViT-L/14 特征映射到 DiT 条件空间；教师与学生共用该适配器，而 ImageNet 上训练的 VAH 与 LTE 保持固定。对 Latte，学生、AlignNet、VAH 与 LTE 都针对所评估的视频 DiT 设定重新训练。完整训练时间表、求解器设置与适配协议见附录 A 与附录 E。

**指标与报告。** 在 ImageNet 上，我们报告 FID-50K 与 Inception Score（IS）；在 MS-COCO 上，报告 FID-30K 与用 OpenAI CLIP ViT-L/14 计算的 CLIP-Score；在 FaceForensics 上，报告 FVD 与视频 Inception Score。图像与文本到图像的墙钟延迟和加速比在单张 A800-80GB GPU、批大小 1 下测量，并对 10 次运行取平均。所有基线的行都在我们的本地实现中、按相同的报告协议测量。加速比以对应教师归一化；LTE 接受率是保留学生草稿的路由事件所占比例。FLOPs 只统计骨干评估，而延迟还包含 VAH、LTE、回滚与求解器的开销。

**图 3（原文 Fig. 3）：** ImageNet 256×256 上的定性比较。各列类别为 Pizza、Airliner、Barrel、Bookcase、Horn、Schooner、Boxer、Tabby；各行方法及标注的加速比为 FoCa（N=3）2.24×、SpeCa（N=3）2.07×、TaylorSeer（N=3）2.19×、TamedFlow（τ=0.80）2.25×。

**基线。** 我们与以下方法比较：时间表缩减参考（DDIM-25 与 DDIM-20）、全规模少步蒸馏方法（渐进蒸馏（Salimans & Ho, 2022）、LCM（Luo et al., 2023）与 ARD（Kim et al., 2025）），以及自适应或推测式方法（∆-DiT（Chen et al., 2024）、TaylorSeer（Liu et al., 2025a）、FoCa（Zheng et al., 2026）、FORA（Selvaraju et al., 2024）、SpeCa（Liu et al., 2025b）与 SpecDiff（Pan et al., 2026））。自适应与推测式基线在匹配的 DiT-XL/2 流程中重新实现，并在相同的延迟协议下本地测量。少步蒸馏基线使用完整的教师架构、不做参数压缩。附录 B 详述比较范围与统计口径假设。

### 4.2 主要结果

**质量—延迟工作点。** 表 1 在不同加速区间上比较完整系统。四步蒸馏基线取得了激进的 14×–15× 加速，代价是 FID 严重退化。TamedFlow 则瞄准中等加速下的紧致保真：在 \(\tau=0.85\) 时，它以 1.73× 加速把 FID 保持在距 DDIM-50 教师 0.02 以内（2.33 对 2.35）；在默认 \(\tau=0.80\) 时，它以 2.25× 加速（0.464 s）达到 FID 2.58。

在 2.0× 至 2.5× 区间、约 0.46 至 0.48 s 的近乎匹配延迟下，TamedFlow 的质量优于 FoCa（FID 2.65）与 TaylorSeer（FID 2.73），同时 Inception Score 更高。这体现的是匹配延迟下的质量优势，而不是基于毫秒级差异的吞吐主张。尽管 SpeCa 报告了更低的骨干 FLOPs（4.76 T），其 FID 反而差 0.20；而且骨干 FLOPs 不含回滚、VAH 与 LTE 等运行时开销，而这些开销已被实测延迟完整计入。因此，TamedFlow 的优势在于部署系统上的经验帕累托权衡，而非仅凭 FLOPs 的主张。

**定性研究。** 图 3 在匹配加速（2.1×–2.25×）下比较生成样本。TamedFlow 在多种类别上更干净地保持了细纹理与物体边界。例如，它避免了竞争自适应方法在 Tabby 与 Boxer 上出现的过度平滑的毛发纹理，并在 Barrel 上保持了金属箍与木纹之间清晰的结构分离。这些视觉示例与总体 FID 趋势一致，而下文的消融实验则分离出其中的机制。

### 4.3 组件消融

表 2 在草稿长度 \(K=3\)、路由阈值 \(\tau=0.80\) 下逐一隔离各架构模块与训练目标的贡献。

**表 2（原文 Table 2）：** ImageNet 256×256 上的消融研究，\(K=3\)，\(\tau=0.80\)。加速比相对 50 步教师基线。

| 研究 | 变体 | 接受率 %↑ | 加速比↑ | FID↓ | IS↑ |
|---|---|---|---|---|---|
| 组件 | 完整 TamedFlow | 63.6 | 2.25× | 2.58 | 233.43 |
| 组件 | 去掉 AlignNet | 46.2 | 1.87× | 2.95 | 211.34 |
| 组件 | 去掉 VAH | 39.3 | 1.63× | 3.23 | 205.71 |
| 组件 | 去掉 LTE | – | 5.80× | 5.56 | 195.07 |
| 训练 | 完整 TamedFlow | 63.6 | 2.25× | 2.58 | 233.43 |
| 训练 | 去掉 \(\mathcal L_{\mathrm{roll}}\) | 54.2 | 2.02× | 2.71 | 230.15 |
| 训练 | 去掉 \(\mathcal L_z\) 预热 | 46.2 | 1.81× | 3.29 | 203.50 |
| 训练 | 去掉 \(\mathcal L_z\) | 28.1 | 1.45× | 4.15 | 198.80 |

**模块与训练目标。** AlignNet 用教师的中间层初始化学生表示；去掉它后接受率降到 46.2%，FID 升到 2.95，原因是表示锚定不充分。停用 VAH 会把接受率降到 39.3%、FID 升到 3.23，说明它的作用在于吸收局部残余速度失配（但并不主张它显式地在理论上降低了 \(\Delta J\)）。没有 LTE 时，无路由的学生执行达到 5.80× 加速，但由于缺乏纠错恢复，质量严重退化到 FID 5.56。就训练损失而言，省去轨迹展开监督 \(\mathcal L_{\mathrm{roll}}\) 会削弱中间速度一致性，使 FID 升到 2.71。去掉端点损失 \(\mathcal L_z\) 的影响最严重，接受率降到 28.1%、FID 升高到 4.15；其展开的多步梯度直接惩罚自主轨迹展开过程中的累积轨迹漂移。去掉 \(\mathcal L_z\) 上的 10 轮预热会得到 FID 3.29，原因是在特征表示稳定之前的早期优化冲击。

**图 4（原文 Fig. 4）：** 生成过程中的 LTE 路由行为。左：跨采样步的置信度；上轴采用噪声水平坐标，与正向流时间不同。右：\(\tau=0.80\) 下被接受与被拒绝草稿的分数分布。

**路由策略对照。** 表 9 在相同的已训练学生、VAH、欧拉网格与引导下比较不同策略。在几乎相同的延迟下（0.465 s 对 0.464 s），LTE 把 FID 由随机草稿接受的 4.05 改善到 2.58。随机对照每条轨迹强制进行八次教师更新；LTE 则保持无约束的 \(\tau=0.80\) 路由。因此这一比较支持在延迟几乎匹配时使用学习型路由，但并未证成二者教师使用量相同。静态对照更快，但 FID 更差。附录 I.1 给出执行与调用计数的细节。

### 4.4 路由动态与敏感性

草稿长度 \(K\) 与阈值 \(\tau\) 在加速与保真之间取得平衡（附录图 10）。加速比在 \(K=3\) 处达到峰值，因为更长的草稿会累积漂移，并在被拒绝时增加回滚成本。如图 4 所示，LTE 置信度在中噪声区间保持较高，但在所绘噪声水平 0.22 附近下降，从而在采样后期触发更多教师救援。在所选工作点 \(\tau=0.80\) 下，该分布显示出被接受草稿与被拒绝草稿之间清晰的运行层面分离。在 \(K=3\)、\(\tau=0.80\) 的参考轨迹中，22 个路由事件里有 14 个被接受，使学生轨迹展开覆盖 50 个积分步中的 42 步。详细的组件剖析显示，教师救援占实测墙钟延迟的 71.9%，学生轨迹展开占 14.9%，带状态回滚的拒绝占 12.7%，而 LTE 置信度打分只占 0.5%。轻量估计器本身引入的计算延迟可以忽略，但路由准确率仍然至关重要：错误接受会让细微的草稿误差累积并损害保真度，错误拒绝则会触发昂贵的教师干预、侵蚀吞吐。这一具体的延迟分解也解释了为何实测端到端加速比与骨干 FLOPs 并不严格对应：状态回滚、同步以及辅助模块的运行时成本并未计入名义 FLOPs。

### 4.5 跨设定评估

**表 3（原文 Table 3）：** 使用固定步长 DDIM 的 MS-COCO 30K、256×256 文本到图像生成。TaylorSeer、SpeCa 与 FoCa 在我们的 DiT-XL/2 流程中重新实现；\(N\) 表示各方法自身的加速设定，而不是 TamedFlow 的草稿水平 \(K\)。

| 方法 | 延迟 (s)↓ | 加速比↑ | FID↓ | CLIP-S↑ |
|---|---|---|---|---|
| *教师 DDIM-50* | *1.184* | *1.00×* | *13.54* | *30.2* |
| *教师 DDIM-25* | *0.622* | *1.90×* | *16.84* | *28.9* |
| **纯学生** | **0.203** | **5.83×** | **19.30** | **27.8** |
| TaylorSeer（N=3） | 0.580 | 2.04× | 15.47 | 29.1 |
| SpeCa | 0.561 | 2.11× | 16.63 | 28.4 |
| FoCa（N=3） | 0.565 | 2.09× | 16.27 | 28.5 |
| **TamedFlow（τ=0.80）** | **0.603** | **1.96×** | **14.86** | **29.6** |
| **TamedFlow（τ=0.75）** | **0.551** | **2.14×** | **15.52** | **29.2** |

在 MS-COCO 上，教师与学生共享一个已训练的 19.9M 文本适配器，而 ImageNet 上训练的 VAH 与 LTE 保持冻结。如表 3 所示，TamedFlow 在 \(\tau=0.80\) 时以 1.96× 加速达到 FID 14.86 与 CLIP-Score 29.6，在 \(\tau=0.75\) 时以 2.14× 加速达到 FID 15.52，在可比延迟下优于 SpeCa 与 FoCa。这支持冻结对齐模块在条件适配下的迁移，而不是未适配的零样本部署。收紧 \(\tau\) 换来 52 ms 的延迟代价，使 FID 改善 0.66、CLIP-Score 改善 0.4，说明保真度恢复来自教师干预而非学生容量。

我们进一步评估空间与时间扩展。在 ImageNet 512×512 上，在相同骨干下把潜空间网格扩大四倍，TamedFlow 以 2.41× 加速在 1.594 s 内达到 FID 3.39，优于附录 C 报告的 FoCa（FID 3.47、2.36× 加速）。在 FaceForensics 上以 256×256 分辨率、16 帧重新训练的 Latte 视频 DiT 上（表 4），TamedFlow 以 2.22× 加速达到 FVD 225.10 与 IS 68.90，超过 FoCa 的 FVD 248.30 与 TaylorSeer 的 FVD 253.10。这些结果确认草稿—救援机制能够可靠地迁移到不同分辨率、条件与视频模态。

**表 4（原文 Table 4）：** FaceForensics（256×256，16 帧）上的 Latte 视频 DiT 迁移。

| 方法 | 加速比 | FVD↓ | IS↑ |
|---|---|---|---|
| *教师（Latte-XL）* | *1.00×* | *208.50* | *71.20* |
| FoCa | 2.06× | 248.30 | 66.80 |
| TaylorSeer | 2.10× | 253.10 | 65.90 |
| **TamedFlow** | **2.22×** | **225.10** | **68.90** |

**部署成本。** TamedFlow 需要离线训练，并在内存中同时驻留教师、学生、VAH 与 LTE，使峰值已分配显存从 2.570 GB 增至 3.075 GB（约 0.5 GB 开销）。这一占用反映了刻意的取舍：保留高容量教师以支持选择性救援，而不是将其丢弃。主要延迟是在批大小 1、且不含 VAE 解码的潜空间积分上基准测试的，刻画的是交互式生成，而非批处理服务吞吐。教师卸载与权重量化是在生产环境中缓解共驻留开销的正交机会。

## 5 结论

在本工作中，我们提出了 TamedFlow——一个调和 Diffusion Transformer 参数压缩与自适应执行的加速框架。通过为短时程轨迹一致训练紧凑学生，并采用带选择性教师救援的非对称路由，TamedFlow 在 ImageNet 256×256 上相对 DDIM-50 以 2.25× 加速达到 FID 2.58，并在多种分辨率、文本条件与视频上评估了迁移能力。我们的发现表明，逐点对齐会在自主草稿过程中留下累积的轨迹发散，从而形成组合鸿沟。受控消融支持轨迹展开监督，路由控制在延迟几乎匹配时更偏好 LTE 而非随机决策；这提示：当紧凑模型被训练为多步草稿器、且采样器保留一条回到教师的恢复路径时，压缩与自适应推理可以变得相容。

## 参考文献

（原文采用作者—年份制、未编号；本页按原文出现顺序编号，条目保留英文原文。）

[1] Peiliang Cai, Jiacheng Liu, Haowen Xu, Xinyu Wang, Chang Zou, and Linfeng Zhang. Lesa: Learnable stage-aware predictors for diffusion model acceleration. arXiv preprint arXiv:2602.20497, 2026.

[2] Pengtao Chen, Mingzhu Shen, Peng Ye, Jianjian Cao, Chongjun Tu, Christos-Savvas Bouganis, Yiren Zhao, and Tao Chen. δ-dit: A training-free acceleration method tailored for diffusion transformers, 2024. URL https://arxiv.org/abs/2406.01125.

[3] Zhengyang Geng, Mingyang Deng, Xingjian Bai, Zico Kolter, and Kaiming He. Mean flows for one-step generative modeling. Advances in Neural Information Processing Systems, 38:75460–75482, 2026.

[4] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.

[5] Yushi Huang, Zining Wang, Ruihao Gong, Jing Liu, Xinjie Zhang, Jinyang Guo, Xianglong Liu, and Jun Zhang. Harmonica: Harmonizing training and inference for better feature caching in diffusion transformer acceleration. In ICML, 2025.

[6] Yeongmin Kim, Sotiris Anagnostidis, Yuming Du, Edgar Schönfeld, Jonas Kohler, Markos Georgopoulos, Albert Pumarola, Ali Thabet, and Artsiom Sanakoyeu. Autoregressive distillation of diffusion transformers. In 2025 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 15745–15756. IEEE, 2025.

[7] Yaniv Leviathan, Matan Kalman, and Yossi Matias. Fast inference from transformers via speculative decoding. In International conference on machine learning, pp. 19274–19286. PMLR, 2023.

[8] Haosen Li, Wenshuo Chen, Shaofeng Liang, Lei Wang, Haozhe Jia, and Yutao Yue. Guided path sampling: Steering diffusion models back on track with principled path guidance. In Companion Proceedings of the ACM Web Conference 2026, pp. 1295–1300, 2026.

[9] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow matching for generative modeling. In The Eleventh International Conference on Learning Representations, 2023. URL https://openreview.net/forum?id=PqvMRDCJT9t.

[10] Jiacheng Liu, Chang Zou, Yuanhuiyi Lyu, Junjie Chen, and Linfeng Zhang. From reusing to forecasting: Accelerating diffusion models with taylorseers. In 2025 IEEE/CVF International Conference on Computer Vision (ICCV), pp. 15853–15863. IEEE, 2025a.

[11] Jiacheng Liu, Chang Zou, Yuanhuiyi Lyu, Fei Ren, Shaobo Wang, Kaixin Li, and Linfeng Zhang. Speca: Accelerating diffusion transformers with speculative feature caching. In Proceedings of the 33rd ACM International Conference on Multimedia, pp. 10024–10033, 2025b.

[12] Xingchao Liu, Xiwen Zhang, Jianzhu Ma, Jian Peng, et al. Instaflow: One step is enough for high-quality diffusion-based text-to-image generation. In The twelfth international conference on learning representations, 2023.

[13] Cheng Lu, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. Dpm-solver++: Fast solver for guided sampling of diffusion probabilistic models. Machine Intelligence Research, 22(4):730–751, 2025.

[14] Simian Luo, Yiqin Tan, Longbo Huang, Jian Li, and Hang Zhao. Latent consistency models: Synthesizing high-resolution images with few-step inference. arXiv preprint arXiv:2310.04378, 2023.

[15] Yihong Luo, Tianyang Hu, Jiacheng Sun, Yujun Cai, and Jing Tang. Learning few-step diffusion models by trajectory distribution matching. In 2025 IEEE/CVF International Conference on Computer Vision (ICCV), pp. 17719–17728. IEEE, 2025.

[16] Nanye Ma, Mark Goldstein, Michael S Albergo, Nicholas M Boffi, Eric Vanden-Eijnden, and Saining Xie. Sit: Exploring flow and diffusion-based generative models with scalable interpolant transformers. In European Conference on Computer Vision, pp. 23–40. Springer, 2024a.

[17] Xinyin Ma, Gongfan Fang, and Xinchao Wang. Deepcache: Accelerating diffusion models for free. In 2024 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 15762–15772. IEEE, 2024b.

[18] Jiayi Pan, Jiaming Xu, Yongkang Zhou, and Guohao Dai. Specdiff: Accelerating diffusion model inference with self-speculation. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 40, pp. 8233–8241, 2026.

[19] William Peebles and Saining Xie. Scalable diffusion models with transformers. In 2023 IEEE/CVF International Conference on Computer Vision (ICCV), pp. 4172–4182. IEEE, 2023.

[20] Yuxi Ren, Xin Xia, Yanzuo Lu, Jiacheng Zhang, Jie Wu, Pan Xie, Xing Wang, and Xuefeng Xiao. Hyper-sd: Trajectory segmented consistency model for efficient image synthesis. Advances in neural information processing systems, 37:117340–117362, 2024.

[21] Tim Salimans and Jonathan Ho. Progressive distillation for fast sampling of diffusion models. In International Conference on Learning Representations, 2022. URL https://openreview.net/forum?id=TIdIXIpzhoI.

[22] Axel Sauer, Dominik Lorenz, Andreas Blattmann, and Robin Rombach. Adversarial diffusion distillation. In European Conference on Computer Vision, pp. 87–103. Springer, 2024.

[23] Pratheba Selvaraju, Tianyu Ding, Tianyi Chen, Ilya Zharkov, and Luming Liang. Fora: Fast-forward caching in diffusion transformer acceleration. arXiv preprint arXiv:2407.01425, 2024.

[24] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. In International Conference on Learning Representations, 2021. URL https://openreview.net/forum?id=St1giarCHLP.

[25] Yang Song, Prafulla Dhariwal, Mark Chen, and Ilya Sutskever. Consistency models. arXiv preprint arXiv:2303.01469, 2023.

[26] Zhicong Tang, Jianmin Bao, Dong Chen, and Baining Guo. Diffusion models without classifier-free guidance. arXiv preprint arXiv:2502.12154, 2025.

[27] Felix Wimbauer, Bichen Wu, Edgar Schoenfeld, Xiaoliang Dai, Ji Hou, Zijian He, Artsiom Sanakoyeu, Peizhao Zhang, Sam Tsai, Jonas Kohler, et al. Cache me if you can: Accelerating diffusion models through block caching. In 2024 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 6211–6220. IEEE, 2024.

[28] Tianwei Yin, Michaël Gharbi, Richard Zhang, Eli Shechtman, Fredo Durand, William T Freeman, and Taesung Park. One-step diffusion with distribution matching distillation. In 2024 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 6613–6623. IEEE, 2024.

[29] Wangbo Zhao, Yizeng Han, Zhiwei Tang, Jiasheng Tang, Pengfei Zhou, Kai Wang, Bohan Zhuang, Zhangyang Wang, Fan Wang, and Yang You. RAPID³: Tri-level reinforced acceleration policies for diffusion transformer. In The Fourteenth International Conference on Learning Representations, 2026. URL https://openreview.net/forum?id=sQ0g6EkpF7.

[30] Jianbin Zheng, Minghui Hu, Zhongyi Fan, Chaoyue Wang, Changxing Ding, Dacheng Tao, and Tat-Jen Cham. Trajectory consistency distillation: Improved latent consistency distillation by semi-linear consistency function with trajectory mapping. arXiv preprint arXiv:2402.19159, 2024.

[31] Shikang Zheng, Liang Feng, Xinyu Wang, Qinming Zhou, Peiliang Cai, Chang Zou, Jiacheng Liu, Yuqi Lin, Junjie Chen, Yue Ma, et al. Forecast then calibrate: Feature caching as ode for efficient diffusion transformers. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 40, pp. 13449–13457, 2026.

[32] Mingyuan Zhou, Yi Gu, Huangjie Zheng, Liangchen Song, Guande He, Yizhe Zhang, Wenze Hu, and Yinfei Yang. Score distillation of flow matching models. arXiv preprint arXiv:2509.25127, 2025.

[33] Chang Zou, Xuyang Liu, Ting Liu, Siteng Huang, and Linfeng Zhang. Accelerating diffusion transformers with token-wise feature caching. In The Thirteenth International Conference on Learning Representations, 2025. URL https://openreview.net/forum?id=yYZbZGo4ei.

[34] Chang Zou, Changlin Li, Songtao Liu, Zhao Zhong, Kailin Huang, and Linfeng Zhang. Disca: Accelerating video diffusion transformers with distillation-compatible learnable feature caching. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 4590–4601, June 2026a.

[35] Chang Zou, Shikang Zheng, Evelyn Zhang, Runlin Guo, Haohang Xu, Zhengyi Shi, Conghui He, Xuming Hu, and Linfeng Zhang. Rethinking token-wise feature caching: Accelerating diffusion transformers with dual feature caching. IEEE Transactions on Image Processing, 2026b.

## 附录 A 训练超参数

表 5 汇总了 TamedFlow 两个阶段的训练超参数。

**表 5（原文 Table 5）：** TamedFlow 的训练超参数。原表中“优化器”“权重衰减”“学习率时间表”“预热轮数”“批大小”“全局批大小”“梯度裁剪”等行跨两阶段共用一个取值，本表以“同左”表示；表中“轮”即 epoch。

| 组件 | 阶段 1 | 阶段 2 |
|---|---|---|
| **优化器** | AdamW（\(\beta_1=0.9\)，\(\beta_2=0.999\)） | 同左 |
| 基础学习率 | \(5\times10^{-5}\) | \(1\times10^{-4}\) |
| 权重衰减 | 0.0 | 同左 |
| 学习率时间表 | 带预热的余弦衰减 | 同左 |
| 预热轮数 | 5 | 同左 |
| 最大轮数 | 10 | 80 |
| 批大小（每 GPU） | 32 | 同左 |
| 全局批大小 | 256 | 同左 |
| 梯度裁剪 | 1.0 | 同左 |
| **损失项** | | |
| 速度损失 \(\mathcal L_v\) | ✓ | ✓ |
| 对齐损失 \(\mathcal L_{\mathrm{align}}\) | \(\lambda=0.25\) | – |
| 轨迹展开损失 \(\mathcal L_{\mathrm{roll}}(K)\) | – | \(\lambda=0.8\) |
| 端点损失 \(\mathcal L_z\) | – | \(\lambda_z\)（10 轮预热至 30.0） |
| 置信度损失 \(\mathcal L_{\mathrm{conf}}\) | – | \(\lambda=1.0\) |
| **模型细节** | | |
| 学生架构 | DiT-B/2（12 层） | 同左 |
| 学生参数量 | 130M | 同左 |
| 教师架构 | DiT-XL/2（28 层） | 同左 |
| 教师参数量 | 675M | 同左 |
| AlignNet 架构 | 3 个独立 MLP，768→1152→1152 | 同左 |
| VAH 架构 | 3 层 Conv2D 残差头，hidden=256 | 同左 |
| LTE 架构 | 3 个投影；MLP 1024→1024→256→1 | 同左 |
| LTE 参数量 | 约 4M（学生的 3%） | 同左 |
| **推理超参数** | | |
| 草稿长度 \(K\) | 3（训练时 \(K\sim\mathcal U(1,5)\)） | 同左 |
| 温度 \(T_z\) | 0.5 | 同左 |
| 温度 \(T_v\) | 0.1 | 同左 |
| 混合权重 \(\alpha\) | 0.7 | 同左 |
| 默认 \(\tau\) | 0.8 | 同左 |
| **LTE 训练** | | |
| 梯度隔离 | – | ✓（停止梯度） |
| LTE 预热轮数 | 5 | 同左 |
| LTE 学习率 | \(1\times10^{-4}\) | 同左 |

## 附录 B 基线比较范围

表 1 比较的是端到端工作点，而不是孤立的路由组件。自适应基线保留 675M 教师，而 TamedFlow 把 130M 草稿学生与选择性教师救援组合起来；因此压缩、训练、求解器选择、路由与回滚都对实测结果有贡献。所有基线条目（包括 SpecDiff）都在我们的本地实现中、按所述协议评估。TamedFlow 的 FLOPs 是骨干调用估计值；端到端延迟还包含 VAH、LTE、求解器与回滚开销。

表 11 服务于另一个目的。它是一个质量诊断：把自适应复用直接附加到压缩学生上，因此支持的是作为动机的“组合鸿沟”，而不是延迟匹配的路由比较。

## 附录 C 更高分辨率评估

我们在 ImageNet 512×512 上、使用 DiT-XL/2、DDIM-50 与一块 A800 GPU 评估空间扩展。该比较固定分辨率与协议，检验主要的质量—延迟排序能否在更大的潜空间网格上保持。

**表 6（原文 Table 6）：** 使用固定步长 DDIM 的 ImageNet 512×512 评估（DiT-XL/2）。

| 方法 | 延迟 (s)↓ | 加速比↑ | FID↓ | IS↑ |
|---|---|---|---|---|
| *教师（DiT-XL/2，675M）* | *3.842* | *1.00×* | *2.87* | *235.10* |
| TaylorSeer（N=3） | 1.715 | 2.24× | 3.76 | 226.75 |
| FoCa（N=3） | 1.628 | 2.36× | 3.47 | 228.10 |
| **TamedFlow（τ=0.80）** | **1.594** | **2.41×** | **3.39** | **230.85** |

## 附录 D 多种子评估

我们对三个评估种子各生成 50K 张 ImageNet 样本，使用固定检查点。这些重复量化的是采样变异性，而不是独立的训练运行变异性；每种方法遵循相同的评估协议。

**表 7（原文 Table 7）：** 三种子 ImageNet 评估（种子上的均值 ± 标准差）。

| 方法 | 加速比 | FID | IS |
|---|---|---|---|
| *DDIM-50 教师* | *1.00×* | *2.36 ± 0.02* | *237.24 ± 0.48* |
| TaylorSeer（N=3） | 2.19× | 2.71 ± 0.04 | 229.13 ± 0.62 |
| FoCa（N=3） | 2.21× | 2.64 ± 0.03 | 231.24 ± 0.58 |
| **TamedFlow，τ=0.80** | **2.26×** | **2.56 ± 0.03** | **233.89 ± 0.51** |

## 附录 E 效率与迁移统计

**部署占用。** 在受控的 A800、批大小 2、FP32、50 步纯潜空间（不含 VAE 解码）剖析中，教师的峰值已分配显存为 2.570 GB，FoCa（\(N=3\)）为 2.580 GB，TaylorSeer（\(N=3\)，\(O=3\)）为 3.066 GB，TamedFlow 为 3.075 GB。因此，共同部署学生与 LTE 相对仅教师的剖析约增加 0.5 GB。对 ImageNet 与 MS-COCO 图像实验，所有方法都使用尺度 3.5 的无分类器引导。教师 FLOP 参考包含完整的条件与无条件 CFG 评估，而 CFG 蒸馏学生的参考只计一次学生前向；这一约定定义了教师/学生参考与 TamedFlow 骨干估计。

**路由计数。** 在 \(\tau=0.80\) 的参考轨迹中，22 个路由事件里有 14 个被接受、8 个被拒绝，给出 63.6% 的事件接受率。由于每个被接受事件推进 \(K=3\) 个学生步，被接受的草稿覆盖名义轨迹的 42/50 = 84%；其余 8 步使用教师救援。单独测量的组件剖析记录：接受草稿桶 0.07075 s（14.9%），包含回滚的拒绝草稿桶 0.06031 s（12.7%），教师救援 0.34142 s（71.9%），LTE 打分 0.00237 s（0.5%）。这些桶合计 0.47485 s（四舍五入）。它们是剖析运行中的事件级计时桶，因此若用某个桶除以骨干调用次数，就会把回滚与路由开销错误地归因到单次前向上。组件剖析与主要延迟测量是在不同运行中收集的：0.464 s 的主要数值是单独测量的十次运行平均值。因此我们同时报告两条轨迹，而不用其中一条重建另一条。

**骨干 FLOP 计数。** 50 步参考意味着每次 CFG 蒸馏学生前向 \(f_S=2.30/50=0.046\) T，每次包含两个 CFG 分支的教师更新 \(f_T=23.74/50=0.4748\) T。在附录 I.1 定义的已执行调用次数下，

$$
F_{\mathrm{backbone}}=N_Sf_S+N_Tf_T.\tag{E.1}
$$

对于 14 次接受与 8 次拒绝全长草稿的参考执行，\(N_S=66\)、\(N_T=8\)、\(N_{\mathrm{LTE}}=22\)，得到 \(66(0.046)+8(0.4748)=6.8344\) T。全长 13 接受/11 拒绝的参考给出 \(72(0.046)+11(0.4748)=8.5348\) T。表 1 中四舍五入的条目是这些参考配置基于调用次数的估计，而不是评估集均值。相反，静态八教师策略有 42 次学生前向，在相同计数下骨干小计为 \(42(0.046)+8(0.4748)=5.7304\) T。VAH、LTE、回滚与求解器算术不计入这些骨干小计，但计入实测延迟。22 次 LTE 调用不需要额外的 22 次学生前向，因为其特征在草稿过程中已被复用。逻辑上的条件与无条件教师评估可以批处理；八次带引导的教师更新包含两个分支，而 CFG 蒸馏学生每次更新只用一个分支。仅凭骨干 FLOPs 无法预测实测延迟。

**Latte 视频协议。** 我们为所评估的 Latte 视频 DiT 设定重新训练学生、AlignNet、VAH 与 LTE，同时保持 TamedFlow 的训练与推理配置与主实验一致：阶段 1 训练 10 轮、阶段 2 训练 80 轮，推理时 \(K=3\)，轨迹展开训练时使用随机 \(K\sim\mathcal U(1,5)\)，损失权重与阈值与 ImageNet 相同。保留 Latte 原始的教师/学生模块配置；不进行宽度、深度或时间分解的搜索。空间与时间 token 被当作一个时空 token 序列，用于 AlignNet 匹配与 LTE 均值池化，因此 LTE 不额外增加时间骨干。评估使用 FaceForensics 在 256×256 分辨率、16 帧的片段。所有方法使用相同的片段与评估协议、批大小 1、确定性 50 步采样，延迟在 8 块 A800-80GB GPU 上端到端测量。VAE 解码不计入报告的延迟。视频表同时报告 FVD 与视频 Inception Score，以及相对教师归一化的加速比。

**MS-COCO 适配协议。** 共享的 19.9M 文本条件适配器与教师、学生联合训练 20 轮（阶段 1 训练 5 轮，阶段 2 训练 15 轮）。实现使用 AdamW，文本适配器学习率 \(10^{-4}\)，骨干参数学习率乘数 0.1，权重衰减 0.01，文本丢弃概率 0.05，梯度裁剪 1.0，EMA 衰减 0.9999。除文本条件参数外，DiT 骨干被冻结；LTE 与 VAH 在这一纯适配器适配期间冻结。适配器把 77-token CLIP ViT-L/14 特征映射到 DiT 条件宽度，并由教师与学生共享。

**图 5（原文 Fig. 5）：** \(K=3\)、\(\tau=0.80\) 下的紧凑路由与执行计数。各面板使用不同的分母：(a) 14 个被接受与 8 个被拒绝的路由事件；(b) 42 个由学生覆盖的名义步与 8 个教师救援步；(c) 单独收集的组件剖析。组件剖析总计 474.85 ms，并不是对另外那次 464 ms 主要平均值的分解。

**图 6（原文 Fig. 6）：** 跨设定迁移，以六个紧凑的原生单位面板展示。各列为 COCO、Latte/FaceForensics 与 ImageNet 512×512；上排报告质量指标，下排报告语义或识别分数。行标签包含该设定下相对教师的已报告加速比。

## 附录 F \(K\) 步轨迹对齐上界的证明

令 \(x_S^{(k)}\) 与 \(x_T^{(k)}\) 分别表示 \(K\) 步顺序欧拉轨迹展开中第 \(k\) 步的学生与教师状态，二者从相同初始状态 \(x_S^{(0)}=x_T^{(0)}=x_t\) 出发。我们假设固定的 ODE 求解器步长 \(h\)。在公共时刻 \(t_k=t+kh\) 处省略时间参数，定义严格在教师轨迹上评估的基线速度失配 \(\delta_v^{(k)}\triangleq\tilde v_S(x_T^{(k)})-v_T(x_T^{(k)})\)，其上确界记为 \(\|\delta_v\|_\infty\triangleq\max_k\|\delta_v^{(k)}\|_2\)。定义教师的 Lipschitz 常数 \(L_T\triangleq\sup_{x,t}\|J_{v_T}(x,t)\|_2\)，以及 Jacobian 失配 \(\Delta J\triangleq\sup_{x,t}\|J_{\tilde v_S}(x,t)-J_{v_T}(x,t)\|_2\)。

**证明。** *设定：递归误差累积。* 在多步轨迹展开中，每个模型把自己的预测送入下一次欧拉步：

$$
x_S^{(k+1)}=x_S^{(k)}+h\tilde v_S\left(x_S^{(k)}\right),\qquad
x_T^{(k+1)}=x_T^{(k)}+hv_T\left(x_T^{(k)}\right).\tag{F.1}
$$

令 \(e_k\triangleq x_S^{(k)}-x_T^{(k)}\) 表示第 \(k\) 步的空间偏差，初始条件为 \(e_0=0\)。把两个更新式相减，得到离散误差动态：

$$
e_{k+1}=e_k+h\left(\tilde v_S\left(x_S^{(k)}\right)-v_T\left(x_T^{(k)}\right)\right).\tag{F.2}
$$

*通过积分 Taylor 展开分解速度差。* 为了把逐点基线误差与累积空间漂移分开，我们加上并减去学生在教师状态处的速度 \(\tilde v_S(x_T^{(k)})\)：

$$
\tilde v_S\left(x_S^{(k)}\right)-v_T\left(x_T^{(k)}\right)
=\underbrace{\tilde v_S\left(x_T^{(k)}\right)-v_T\left(x_T^{(k)}\right)}_{\delta_v^{(k)}}
+\underbrace{\tilde v_S\left(x_S^{(k)}\right)-\tilde v_S\left(x_T^{(k)}\right)}_{\text{由 }e_k\text{ 引起的漂移}}.\tag{F.3}
$$

由于速度场 \(\tilde v_S:\mathbb R^D\to\mathbb R^D\) 是向量值函数，标量中值定理不适用。我们改为沿连接 \(x_T^{(k)}\) 与 \(x_S^{(k)}\) 的线段，用带积分余项的一阶 Taylor 展开写出空间漂移：

$$
\tilde v_S\left(x_S^{(k)}\right)-\tilde v_S\left(x_T^{(k)}\right)
=\left(\int_0^1 J_{\tilde v_S}\left(x_T^{(k)}+\tau e_k\right)\mathrm d\tau\right)e_k.\tag{F.4}
$$

对误差递推式取 \(L_2\) 范数，代入分解与积分展开，并应用三角不等式，得到：

$$
\begin{aligned}
\|e_{k+1}\|_2&\le\|e_k\|_2+h\|\delta_v\|_\infty+h\left\|\int_0^1J_{\tilde v_S}\left(x_T^{(k)}+\tau e_k\right)\mathrm d\tau\right\|_2\|e_k\|_2\\
&\le\|e_k\|_2+h\|\delta_v\|_\infty+h\left(\int_0^1\sup_x\left\|J_{\tilde v_S}(x)\right\|_2\mathrm d\tau\right)\|e_k\|_2.
\end{aligned}\tag{F.5}
$$

这里 \(\sup_x\|J_{\tilde v_S}(x)\|_2\) 是学生的 Lipschitz 常数 \(L_S\)。把学生的 Jacobian 拆成教师项与失配项，并用矩阵三角不等式给出上界：

$$
L_S=\sup_{x,t}\left\|J_{\tilde v_S}\right\|_2=\sup_{x,t}\left\|J_{v_T}+\left(J_{\tilde v_S}-J_{v_T}\right)\right\|_2\le L_T+\Delta J.\tag{F.6}
$$

由于在 \([0,1]\) 上的积分等于 1，把 Jacobian 上界代入前述不等式即得递推式：

$$
\|e_{k+1}\|_2\le\left(1+h(L_T+\Delta J)\right)\|e_k\|_2+h\|\delta_v\|_\infty.\tag{F.7}
$$

*求解递推式。* 令 \(C\triangleq L_T+\Delta J\)。以初始条件 \(e_0=0\) 展开该递推式，得到一个等比级数：

$$
\|e_K\|_2\le h\|\delta_v\|_\infty\sum_{i=0}^{K-1}(1+hC)^i=\frac{\|\delta_v\|_\infty}{C}\left((1+hC)^K-1\right).\tag{F.8}
$$

为了在少步区间中显式给出对 \(K\) 的多项式依赖，我们对精确标量项 \((1+hC)^K\) 做 Taylor 展开：

$$
(1+hC)^K=1+K(hC)+\frac{K(K-1)}{2}(hC)^2+\mathcal O\left(K^3(hC)^3\right).\tag{F.9}
$$

当 \(C=0\) 时，递推式给出 \(\|e_K\|_2\le Kh\|\delta_v\|_\infty\)。当 \(KhC\ll1\) 时，展开该等比上界得到：

$$
\|e_K\|_2\le Kh\|\delta_v\|_\infty+\frac{K(K-1)}{2}h^2C\|\delta_v\|_\infty+\mathcal O\left(K^3h^3C^2\|\delta_v\|_\infty\right).\tag{F.10}
$$

*解释。* 该精确上界分离出基线速度失配，并表明组合 Lipschitz/失配常数 \(C=L_T+\Delta J\) 如何随轨迹展开水平放大误差。在少步展开中，这产生了前述关于 \(K\) 的二次敏感度。逐点速度匹配直接监督强迫项，但并不显式约束空间放大常数；不过它可能同时影响二者。该展开针对的是一个上界，而不是实测的误差增长律。

## 附录 G VAH 机制的范围

VAH 是一个通过式 (5) 中阶段 2 的速度目标与轨迹目标训练出来的残差校正。该训练配方并未指定单独的、显式的 Jacobian 匹配目标。对 \(v_S^{\mathrm{aligned}}=v_S+\mathrm{VAH}(v_S)\)，链式法则给出 \(J_{v_S^{\mathrm{aligned}}}=(I+J_{\mathrm{VAH}})J_{v_S}\)。这允许局部导数发生改变，但并不保证 Jacobian 失配减小。图 9 只报告速度失配与端点漂移，不提供 Jacobian 诊断：\(\Delta J\) 的降低仍然只是一种理论可能性，而不是已被实验确立的机制。

**算法 1（原文 Algorithm 1，位于原文第 18 页顶部）：TamedFlow 推理（TamedFlow Inference）**

1. **输入：** \(x\sim\mathcal N(0,I)\)、\(y\)、离散时刻 \(\{t_0,\ldots,t_N\}\)、\(K=3\)、阈值 \(\tau\)
2. \(i\leftarrow0\)
3. **while** \(i<N\) **do**
4. \(\quad m\leftarrow\min(K,N-i)\) ▷ 截断终止草稿水平
5. \(\quad x_{\mathrm{start}}\leftarrow x\)
6. \(\quad\) **for** \(k=1\) **to** \(m\) **do** ▷ 学生起草 \(m\) 步
7. \(\quad\quad (v_S,\mathrm{tokens}_k)\leftarrow\mathcal B_\theta(x,t_{i+k-1},y)\)
8. \(\quad\quad v_S\leftarrow v_S+\mathrm{VAH}(v_S)\)
9. \(\quad\quad x\leftarrow x+(t_{i+k}-t_{i+k-1})\cdot v_S\)
10. \(\quad\) **end for**
11. \(\quad c\leftarrow\mathrm{LTE}(\mathrm{tokens}_m,e_{t_{i+m-1}},e_y)\) ▷ 最后一次草稿特征；不访问教师
12. \(\quad\) **if** \(c\ge\tau\) **then**
13. \(\quad\quad i\leftarrow i+m\) ▷ 接受：前进 \(m\) 步，不调用教师
14. \(\quad\) **else**
15. \(\quad\quad x\leftarrow x_{\mathrm{start}}\) ▷ 拒绝：回滚到草稿前状态
16. \(\quad\quad v_T\leftarrow\mathcal T_\phi(x,t_i,y)\) ▷ 教师救援评估步
17. \(\quad\quad x\leftarrow x+(t_{i+1}-t_i)\cdot v_T\)
18. \(\quad\quad i\leftarrow i+1\)
19. \(\quad\) **end if**
20. **end while**
21. **return** \(x\)

## 附录 H 推理细节

**速度场接口与引导。** 符号 \(v_T\) 表示欧拉求解器所使用的有效教师右端项，其中包含规定的条件与引导，而不是指底层 DiT 的原始预测类型。学生—教师速度损失与教师参考轨迹展开都在同一个求解器坐标系中表达。单分支学生朝带引导的教师场蒸馏；教师救援仍然评估完整的带引导教师更新。第 3.1 节的线性插值目标引入了速度形式的约定，但它本身既不能识别预训练教师原生的输出参数化，也不能识别其噪声时间表。仅凭一个架构名称，并不能确定一个检查点，也不能确定一种输出到 ODE 的转换。

**时间坐标。** 求解器与所有轨迹展开方程都使用递增的流时间 \(t\)，噪声在 \(t=0\)、数据在 \(t=1\)。图 4 在上轴保留了一个递减的噪声水平绘图坐标；该轴标签并不是求解器方程中的前向时间变量。所报告的数值 0.22 描述的是该绘图噪声坐标，而不是前向流时间。采样步索引用于把路由分布与执行顺序作比较。

在正向流时间约定 \(t_0<\cdots<t_N\) 下，算法 1 给出完整的路由循环。学生至多起草 \(K\) 步而不访问教师，LTE 依据最后一次学生前向来给草稿打分，这与 LTE 训练期间使用的输入类型相同。拒绝时先恢复草稿前状态，再执行一次教师救援步；打分不额外增加端点骨干调用。

## 附录 I LTE 校准与路由指标

表 8 报告 \(\tau=0.80\)、\(K=3\) 下在留出（held-out）集上的路由诊断。LTE 回归式 (7) 中的连续目标 \(c^\star\)；二值标签仅用于汇总阈值化之后的路由错误。

**参考标签与路由错误。** 若 \(c^\star\ge0.80\)，草稿事件在离线时被标为“接受”，否则标为“拒绝”；在线决策在预测 \(c\ge0.80\) 时接受。FAR 以 4,683 个参考拒绝事件为分母，FRR 以 11,984 个参考接受事件为分母，AUC 按连续 \(c\) 对事件排序。这些标签度量的是与指定教师一致性目标的一致程度，而不是对最终样本质量的保持。

**验证协议。** 阈值与分数温度的选取在标定划分上完成，随后冻结。表 8 在留出的轨迹级划分上计算，从而避免同一条轨迹的草稿事件同时出现在两个集合中。连续目标 ECE 是平均 \(c\) 与平均 \(c^\star\) 之间、以事件加权的 10 分箱差异；它度量的是分数一致程度，而不是“生成正确”的概率。

**表 8（原文 Table 8）：** ImageNet 256×256 验证集上 \(\tau=0.80\)、\(K=3\) 时的 LTE 分类与校准指标。支持计数为把 \(c^\star\) 在 0.80 处阈值化得到的参考标签；FAR 与 FRR 分别以参考拒绝事件与参考接受事件为分母；AUC 使用连续预测；连续目标 ECE 使用 10 个置信度分箱。

| 支持（参考） | 接受 | 拒绝 |
|---|---|---|
| 计数 | 11,984 | 4,683 |

| 指标 | 数值 |
|---|---|
| 错误接受率（FAR） | 0.063 |
| 错误拒绝率（FRR） | 0.051 |
| AUC | 0.94 |
| 连续目标 ECE（10 分箱） | 0.034 |

参考正类比例为 11,984/16,667 = 71.9%，而在线预测接受率为 63.6%。二者使用不同的标签与事件总体，因此仅凭其差异并不能识别分布漂移。留出诊断不能确定自由运行在线轨迹上的错误率。对预测置信度做阈值化在构造上就会把路由事件分开；这些留出诊断也不能确证相对真实草稿误差的校准性。

### I.1 路由对照协议与调用计数

表 9 中的对照使用相同的已训练学生检查点、VAH、50 步欧拉网格、CFG 配置与 ImageNet FID-50K 协议。延迟遵循主实验中的单卡 A800、批大小 1 协议。这些测量评估推理策略，而不重新训练学生。

**静态策略。** 纯学生对全部 50 次更新都使用学生，从不调用教师。随机步（Random Steps）在采样前为每条轨迹独立选择八个互不相同的积分步，并用教师更新替换这些学生更新。固定周期（Fixed Periodic）使用从 1 开始计数的积分步索引 6、12、18、24、30、36、42、48。两种静态策略都不在教师指定的步上执行推测式学生草稿。因此二者都恰好执行 42 次学生前向与八次教师更新。

**预算受限的随机决策。** 随机接受（Random Accept）使用与 LTE 相同的 \(K=3\) 草稿—回滚结构，但把接受决策替换为名义概率 \(p=0.636\) 的随机判定。该策略每条轨迹强制恰好八次教师更新。一旦该预算耗尽，后续草稿一律被接受。当接受一段草稿会导致剩余积分步太少、无法花掉剩余教师预算时，一个预算可行性覆盖机制强制拒绝。拒绝会丢弃草稿、恢复其起始状态，并推进一步教师。因此，实际的决策在整个轨迹上并非独立的伯努利抽样，而 \(p\) 也不是实测接受率。

**LTE 策略。** LTE 使用原始置信度阈值 \(\tau=0.80\)，没有固定的每轨迹教师预算。其教师与学生调用次数取决于轨迹。此前报告的 14 次接受与八次拒绝事件描述的是一次参考执行，而不是评估集上的实测均值。因此，随机对照与 LTE 共享执行框架、实测延迟也几乎相同，但并未被证成具有相同的平均教师使用量。

**LTE 评估与骨干调用。** 令 \(A\) 与 \(R\) 分别表示被接受与被拒绝的草稿事件。每段草稿恰好触发一次 LTE 评估，无论是否被接受；只有拒绝才会触发一次教师更新。对终止截断的 \(K=3\) 循环，有

$$
N_T=R,\qquad N_{\mathrm{LTE}}=A+R,\qquad N_S=\sum_{j=1}^{A+R}m_j,\qquad\sum_{j\in A}m_j+R=50.\tag{I.1}
$$

这里 \(m_j\) 是第 \(j\) 段草稿中执行的学生步数。只有终止处被接受的草稿才可能少于三步。在 \(R=8\) 的条件下，42 个已提交学生步因此恰好由 \(A=14\) 段被接受草稿构成，且 \(N_{\mathrm{LTE}}=14+8=22\)。事件接受率为 14/22 = 63.6%，而由学生执行的已提交积分步比例为 42/50 = 84%。这是两个不同的分母。若所有被拒绝草稿也都有长度三，则 \(N_S=66\)；在该情形下，终端截断可以减少学生工作量，而不改变 22 个路由事件。因此，在所述的 50 步轨迹中，八次教师更新对应 22 次 LTE 评估，而不是八次或 66 次 LTE 评估。预算受限的随机策略在 \(R=8\) 时同样有 22 个决策事件，但它使用随机判定，而不需要 LTE 网络打分。这一条件恒等式并不能确立无约束 LTE 在评估集上的平均教师使用量。

**推导出的学生前向次数。** 对随机对照，八次教师更新留下 42 个已提交学生步。实际执行的学生前向还包含每一段被丢弃的草稿：

$$
N_S=42+\sum_{j=1}^{8}m_j,\qquad1\le m_j\le3,\tag{I.2}
$$

其中 \(m_j\) 是第 \(j\) 段被拒绝草稿的执行长度。当八段被拒绝草稿长度都为三时，这给出 \(N_S=66\)；终端截断可以降低该计数。对参考 LTE 执行，全长草稿同样给出 \(N_S=3(14+8)=66\) 与 \(N_T=8\)。这些是条件性的统计值，而不是实测的平均调用次数或延迟预测。

**解释。** 该动态比较在 0.001 s 的延迟差异下给出 1.47 的 FID 差异，支持在实测工作点上使用学习型路由的有用性。0.001 s 的差异不被解释为速度优势。静态对照更快（0.335–0.348 s），但 FID 更高（3.45–3.72）。这些测量既不能确立 LTE 能识别高曲率区域，也不能在教师使用量完全匹配时分离出决策质量。路由对照表报告的是点估计；这里没有量化随机策略种子间的变异性。

**表 9（原文 Table 9）：** ImageNet 256×256 上的路由对照。延迟与 FID-50K 为实测值。教师更新次数由对照策略固定，或对 LTE 而言是自适应的；这不是与 LTE 在相同教师预算下的比较。

| 路由策略 | 教师更新次数 | 延迟 (s)↓ | FID↓ |
|---|---|---|---|
| 纯学生 | 0 | 0.180 | 5.56 |
| 静态：随机步 | 8 | 0.348 | 3.72 |
| 静态：固定周期 | 8 | 0.335 | 3.45 |
| 动态：随机接受 | 8 | 0.465 | 4.05 |
| **动态：LTE** | **自适应** | **0.464** | **2.58** |

## 附录 J 附加消融研究

表 10 用随机水平变体扩展了主要消融。除非另有说明，各行使用 ImageNet 256×256、\(K=3\) 与 \(\tau=0.80\)。

扩展行强化了主要消融的结论：表示对齐、残差校正、轨迹展开损失与端点损失各自都改善了可用的路由工作点。在 \(K\sim\mathcal U(1,3)\) 上随机化训练会得到一个相近但不同的工作点（FID 2.53，2.14×），而更宽的默认 \(\mathcal U(1,5)\) 在 2.25× 下达到 FID 2.58。

在固定 \(K=3\) 时，75.0% 的工作点对应 15 个接受与 5 个拒绝事件（在草稿均为全长时，对应 60 次学生调用与 5 次教师调用），而 63.6% 的工作点对应 14 个接受与 8 个拒绝事件（66 次学生调用与 8 次教师调用）。因此调用计数模型预测更高接受率的工作点具有更低的骨干工作量。其 2.14× 对 2.25× 的实测排序来自不同的检查点/运行时测量，而现有组件轨迹并未提供匹配的逐调用计时分解；因此我们不把这一排序解释为单调的“接受率—延迟”规律。

在共同的 DDIM-50 诊断下，把 FoCa、TaylorSeer 或 SpeCa 直接附加到压缩学生上，会比稠密学生执行更严重地损害 FID。这记录了这些实现中的组合鸿沟；它并未检验同样的方法在轨迹训练之后是否仍然脆弱。

**表 10（原文 Table 10）：** ImageNet 256×256 上协议一致的扩展消融。推理使用 \(K=3\)、\(\tau=0.80\)；随机水平只用于训练。

| 变体 | 接受率 %↑ | 加速比↑ | FID↓ | IS↑ |
|---|---|---|---|---|
| **完整 TamedFlow（默认）** | **63.6** | **2.25×** | **2.58** | **233.43** |
| **模块与损失消融** | | | | |
| 去掉 AlignNet | 46.2 | 1.87× | 2.95 | 211.34 |
| 去掉 VAH | 39.3 | 1.63× | 3.23 | 205.71 |
| 去掉 \(\mathcal L_{\mathrm{roll}}\) | 54.2 | 2.02× | 2.71 | 230.15 |
| 去掉 \(\mathcal L_z\) 预热 | 46.2 | 1.81× | 3.29 | 203.50 |
| 去掉 \(\mathcal L_z\) | 28.1 | 1.45× | 4.15 | 198.80 |
| **\(K\) 策略消融** | | | | |
| 随机 \(K\sim\mathcal U(1,3)\) | 75.0 | 2.14× | 2.53 | 233.22 |
| 随机 \(K\sim\mathcal U(1,5)\)（默认） | 63.6 | 2.25× | 2.58 | 233.43 |
| 纯学生（无 LTE、无路由） | – | 5.80× | 5.56 | 195.07 |

**表 11（原文 Table 11）：** 共同 DDIM-50 协议下的同一学生验证。只报告 FID，因为这些直接自适应基线是作为质量诊断评估的，而不是作为主要延迟比较。

| 策略 | FID | 策略 | FID |
|---|---|---|---|
| FoCa | 10.40 | TaylorSeer | 11.92 |
| SpeCa | 13.18 | 稠密学生 | 5.56 |

**表 12（原文 Table 12）：** ImageNet 256×256 上的求解器稳健性。DPM-Solver++(2M) 作为交接安全的高阶求解器诊断来评估；形式化上界仍然只针对 DDIM。

| 求解器 | 方法 | 延迟 (s) | 加速比 | 接受率 | FID | IS |
|---|---|---|---|---|---|---|
| Euler | 教师 | 1.044 | 1.00× | – | 2.35 | 237.62 |
| Euler | TamedFlow | 0.464 | 2.25× | 63.6% | 2.58 | 233.43 |
| DPM-Solver++(2M) | 教师 | 1.089 | 1.00× | – | 2.25 | 244.12 |
| DPM-Solver++(2M) | TamedFlow | 0.455 | 2.39× | 75.0% | 2.44 | 237.55 |

对 DPM-Solver++(2M) 诊断，多步历史与当前已接受状态相关联。当学生草稿被拒绝时，暂定的学生状态与导数历史一同被丢弃；采样器回滚，执行一次教师救援更新，并在救援后的状态处开启全新的求解器历史。任何学生导数都不会跨拒绝边界与教师导数混合，且交接之后的第一次更新使用求解器的一阶启动规则，随后再重建两步历史。因此表 12 检验的是显式重置策略下的端到端稳健性；命题 3.1 仍然只覆盖欧拉分析。

图 9 报告速度误差与端点误差，而不是 Jacobian 对齐。去掉 AlignNet 或 VAH 会改变实测的速度失配或端点失配，而去掉轨迹展开监督会增加短时程漂移。

**图 7（原文 Fig. 7）：** 来自表 2 与表 10 的模块与训练消融。各面板在 \(K=3\)、\(\tau=0.80\) 下把 FID 与接受率或加速比关联起来。无路由的学生没有接受率统计量，因此在接受率面板中被省略。各点为已报告的工作点；不隐含拟合趋势或不确定区间。

**图 8（原文 Fig. 8）：** Euler 与 DPM-Solver++(2M) 下的成对教师与 TamedFlow 测量，复现表 12。加速比相对对应的求解器教师。DPM++ 结果使用所述的历史重置策略；理论界仍然只针对 DDIM。左：延迟（s）；中：FID；右：IS；柱状值为 Euler 教师 1.044 / TamedFlow 0.464、DPM++ 教师 1.089 / TamedFlow 0.455；FID 为 2.35 / 2.58 / 2.25 / 2.44；IS 为 237.62 / 233.43 / 244.12 / 237.55；教师归一化加速比：Euler 2.25×，DPM++(2M) 2.39×。

**图 9（原文 Fig. 9）：** 各模型变体在留出（held-out）集上的速度失配与三步端点漂移。各面板取代了冗余的数值表，并使用各自独立的零基轴。这些均值并不度量 Jacobian 失配，也不能确立训练会最小化理论界常数；没有可用的不确定性估计。图中数值（速度失配 \(E_v\) / 端点漂移 \(E_{K=3}\)）：逐点学生 0.215 / 1.240；去掉 AlignNet 0.068 / 0.285；去掉 VAH 0.078 / 0.715；VAH 且无轨迹展开损失 0.082 / 0.485；完整 TamedFlow 0.052 / 0.128。

图 10 可视化草稿水平 \(K\) 与路由阈值 \(\tau\) 对生成质量和推理效率的影响。四个边缘面板分别展示 FID 与加速比随 \(\tau\)（上）和 \(K\)（下）的变化。这些一维扫描启发了默认工作点，但并未确立刻画全局最优的帕累托前沿。

**图 10（原文 Fig. 10）：** 草稿长度 \(K\) 与路由阈值 \(\tau\) 对生成质量和推理效率的影响。列：FID（左）与加速比（右）。行：阈值 \(\tau\)（上）与草稿长度 \(K\)（下）。扫描结果支持默认配置 \(K=3\)、\(\tau=0.80\)。

## 附录 K 局限

尽管 TamedFlow 在多个设定下都给出了经验收益，我们的发现仍受以下若干关键限制约束：

**轨迹展开分析的理论范围。** 命题 3.1 中的离散 Grönwall 上界刻画的是顺序欧拉草稿下的误差累积，用以启发多步轨迹监督。它并不构成针对内部特征缓存或预测方法的普适失效律，也不为 DPM-Solver++ 这类高阶 ODE 求解器提供形式化的收敛性或稳定性保证。

**轨迹路由的近似性质。** 学习型轨迹估计器（LTE）是一个在离线一致性目标上训练的经验回归模型，而不是精确的、保分布的验证机制。拒绝决策是启发式的；错误拒绝会通过冗余的教师评估带来延迟惩罚，而错误接受则可能让轻微的感知伪影传播进生成样本。

**部署与基础设施开销。** TamedFlow 依赖多阶段的离线训练课程，并在推理期间让教师、学生、VAH 与 LTE 模型共驻 GPU 显存（在我们的 FP32 剖析中约有 0.5 GB 显存开销）。因此，它并未把教师模型完全从部署中消除。此外，我们报告的加速反映的是单张 GPU 上批大小 1 的潜空间生成；在大批量吞吐、并发服务流水线以及极端内存受限的边缘环境中的特性刻画，仍是未来工作方向。

## 附录 L 大语言模型使用声明

在手稿撰写过程中使用了大语言模型进行语言编辑与一致性检查。实验结果由作者提供；作者负责检查最终方程、测量、引用与实现细节。

---

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、第 1–5 节正文与全部小节（§2.1–2.3、§3.1–3.4、§4.1–4.5）、命题 3.1（含附录 F 证明）、算法 1、表 1–12（逐格转写，含原文的粗体标记）、图 1–10 图注、式 (1)–(8) 与 (E.1)、(F.1)–(F.10)、(I.1)–(I.2)、附录 A–L 与参考文献 [1]–[35]（英文原条目）；许可：CC BY 4.0。**已知缺陷与核对说明：** ① pypdf 抽取把公式的分式、上下标与表格列边界打散；本页正文式 (1)–(8) 已按 PDF 渲染页（第 4–5 页）逐式核对，附录式 (E.1) 按第 15 页、式 (F.1)–(F.10) 按第 15–17 页、式 (I.1)–(I.2) 按第 20 页核对；表 1–12 均按 PDF 渲染页（第 6、8、9、13、14、19、20、21 页）逐格核对。② 图 1 与图 2 为流程图/架构图，抽取文本的标签顺序混乱；本页图注按 PDF 渲染页与抽取文本共同转写，未推测图中无法确读的细节（图 1 中各曲线没有可读的数值标注，故图注只描述其结构）。③ 图 2 的层号在原文中存在内部不一致：抽取文本显示“Teacher Backbone”一侧标注 Layer 3/7/11、“Student Backbone”一侧标注 Layer 9/18/27，而正文与式 (3) 的对应关系是 \(\pi(3)=9\)、\(\pi(7)=18\)、\(\pi(11)=27\)（即学生层 3/7/11 对应教师层 9/18/27）；本页正文与公式按正文口径转写，图注未强行指定层号归属，此点留待后续 QA 向作者确认。④ 图 3 为图像网格，其类别标签与各方法加速比取自抽取文本并对照渲染页，未逐像素核对样本内容。⑤ 附录 F 的式 (F.5) 在 PDF 中分两行排版，本页用 aligned 环境合并为一行编号，内容一致。⑥ 原文无关键词，也无编号定理/引理环境，仅有命题 3.1；参考文献采用作者—年份制且原文未编号，本页按出现顺序编号 [1]–[35]。⑦ 图 9 的速度失配与端点漂移数值按 PDF 渲染页核对后列入图注。⑧ 表 1 中 TamedFlow 行在原文以粗体标出（并非该列最优），本页照原样保留；SpeCa 的 4.76 T、2.07×、2.78 (+0.43)、229.74 (−7.88) 与 TamedFlow（τ=0.85）行的 8.53 T、2.33 (−0.02)、236.15 (−1.47) 均按渲染页核对。逐句逐式终校未做；建议后续 QA 重点复核：命题 3.1 与式 (2) 的常数定义、式 (7) 中两项的符号与温度归一化、附录 I.1 的调用计数恒等式，以及图 2 的层号对应。

---

**登记（2026-11-02）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
