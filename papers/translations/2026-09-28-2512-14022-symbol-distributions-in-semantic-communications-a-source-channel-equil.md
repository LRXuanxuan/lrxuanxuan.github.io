---
layout: page
title: "语义通信中的符号分布：源信道联合视角｜中文全文译文"
permalink: /papers/translations/2026-09-28-2512-14022-symbol-distributions-in-semantic-communications-a-source-channel-equil/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/43a2ec2929ad10c6/) · [原文 arXiv](https://arxiv.org/abs/2512.14022) · [全部目录](/papers/catalog/)

# 语义通信中的符号分布：源信道联合视角

**原题：** Symbol Distributions in Semantic Communications: A Source-Channel Equilibrium Perspective  
**作者：** Hanju Yoo（Graduate Student Member, IEEE）、Dongha Choi（Graduate Student Member, IEEE）、Songkuk Kim（Member, IEEE）、Chan-Byoung Chae（Fellow, IEEE）、Robert W. Heath, Jr.（Fellow, IEEE）。单位：H. Yoo、D. Choi、S. Kim、C.-B. Chae 为韩国延世大学融合技术学院（Seoul 03722, South Korea）；R. W. Heath, Jr. 为美国加州大学圣地亚哥分校电气与计算机工程系（La Jolla, CA 92093, USA）。  
**版本：** arXiv:2512.14022v2（cs.IT），v2 于 2026 年 6 月 27 日更新（原文页眉标注 Submitted to IEEE Trans. on Communications, Nov. 2025），13 页（IEEE 双栏期刊投稿格式，含图 1–11、公式 (1)–(42)、命题 1、参考文献 32 条；**原文无表格**）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VII 节（含 III-A–B、IV-A–D、V-A–E、VI-A–D 等全部小节）、结论、全部图注（图 1–11，含子图说明）、命题 1 及其证明、公式 (1)–(42) 与 32 条参考文献英文原条目；原文无附录、无作者简介、无表格；逐句逐式终校未做。

## 摘要

语义通信系统常用端到端神经网络把输入数据映射为连续符号。这些符号本质上是神经网络特征，维数固定且往往呈重尾分布；然而，由于编码器训练的端到端特性，这种分布形状背后的机制仍未被充分研究，阻碍了系统化分析与设计。本文提出语义符号分布的参数化模型：我们把端到端训练建模为对符号分布施加两种耦合压力——偏好使平均描述代价最小化的功率分配的**源压力**，以及偏好更高信道利用率的分布的**信道压力**。在刻画这两种效应的替代目标下，我们得到以 Student's $t$ 分布作为语义符号的模型。基于图像的语义系统实验表明，该模型能准确预测形状参数如何随 (i) 显式符号速率控制与 (ii) 数据集熵变化性而变化；此外，通过正则化（如高斯先验）施加目标符号分布可改善训练收敛，这与我们的假设一致。

**关键词：** 语义通信、功率分配、符号分布、信息论。

## I. 引言

语义通信已作为一种联合优化整个通信过程的深度学习方法出现 [1]。语义系统不追求比特级保真，而关注传输任务相关信息，从而为物体检测、图像分类与数据重建等任务实现高效通信 [2]–[7]。

诸如深度联合信源–信道编码（DeepJSCC）的模拟语义通信系统由端到端神经网络编码器与解码器组成。编码器把输入数据映射为低维连续值符号，这与基于离散星座（如 QAM）的传统数字调制形成对比。给定噪声信道与有限功率约束，编码器须追求两个目标：(i) 以尽可能少的冗余表示信源（信源编码效率）；(ii) 对发射符号进行整形，使信息可靠地通过信道（信道编码效率）¹。在传统系统中，这两个目标可由独立模块与可变长比特串处理。相反，多数语义编码器输出**定长**连续符号向量 [2]–[5]，因此二者必须在功率约束下主要通过整形同一发射符号分布来实现。这种耦合形成内在折中，产生既非纯信源编码导向、也非纯信道编码导向的符号分布。这些学习系统的符号分布仍基本未被解释，因为带任务特定损失函数的端到端训练掩盖了塑造符号的机制，从而阻碍了实际语义系统的系统化分析与有原则的设计 [8]。

本文为端到端语义编码器所学符号分布建立一个简单的参数化框架，以便对实际语义收发机进行更有原则的分析与设计。我们的目标不是提出最大化语义重建性能的新方法，而是对这类系统中涌现的学习符号统计特性进行建模。我们聚焦定长模拟语义系统：编码器无法分别优化信源压缩与传输可靠性，两种效应必须通过在平均功率约束下的同一组定长连续符号向量——即符号分布的形状——来表达。

我们通过把端到端训练理解为对符号分布施加两种并发的压力来形式化这种耦合：

- **信道压力。** 符号分布被驱动以有效利用信道。在 AWGN 中，由互信息驱动的信道利用率在 Shannon 渐近区间自然与熵最大化相关。
- **源压力。** 符号分布被驱动在平均功率约束下把更多信源信息装入定长符号向量。这由一种频率–能量分配所促进：低能量符号表示频繁特征，高能量符号表示稀有特征，从而有效实现隐式变长描述并诱导重尾幅度。

¹ 本文中“信道编码”取其广义信息论含义，包括一切旨在最大化跨信道互信息的机制。

**图 1：** AWGN 信道上定长语义通信的概念示意。端到端学习通过平衡源压力（描述效率）与信道压力（互信息最大化）塑造符号分布 $p(Y)$，产生从重尾（Cauchy 型）到类高斯分布的行为。该趋势的经验证据见第 V 节。

为以可处理形式刻画这些竞争压力，我们为描述效率与信道利用率引入替代目标，导出所学符号分布的参数化 Student's $t$ 模型，并用训练好的 DeepJSCC 系统对该模型进行经验验证。本文主要贡献如下。

- **语义符号分布的参数化建模。** 我们把语义编码器建模为平衡两个竞争目标：最大化跨信道互信息（信道压力），以及通过功率分配降低发射符号的有效比特长度（源压力）。通过可处理的替代目标表述该折中，我们证明所得符号分布服从 Student's $t$ 分布。
- **所提模型的经验验证。** 在基于图像的语义通信系统上的大量实验表明，学习到的符号分布与所提 Student's $t$ 模型高度吻合；此外，观测到的形状参数变化与模型预测一致，尤其体现在 (i) 变长编码机制的使用与 (ii) 数据集的熵特性两方面。
- **作为框架经验支撑的分布感知正则化。** 基于所提模型，我们引入一种正则化损失，显式引导编码器的经验符号分布趋向目标先验。实验结果表明该方法可改善训练收敛与稳定性，为“符号分布整形影响端到端学习行为”提供了实际证据。

## II. 先前工作

基于深度学习的端到端优化已成功应用于语义通信系统。奠基性工作 [3] 提出 DeepJSCC，用神经网络直接把图像映射为同相/正交（I/Q）符号。该方法相较传统系统展现出更优重建质量，并保证性能平缓退化——在低 SNR 区间仍保持可接受的图像质量而无需重传。后续研究通过硬件原型验证了这些语义系统 [2], [8]–[11]，展示了其在真实无线环境中的鲁棒性。然而，学习编码器的黑箱特性使实际硬件约束难以被有原则地纳入 [8]，这可能在空口部署中导致性能退化 [2], [8]–[11]。

经典联合信源–信道编码（JSCC）理论也为本文提供了有用参照 [12], [13]。特别地，源–信道匹配结果通过耦合的信源侧与信道侧信息论结构刻画高效通信 [13]。在信道侧，最优性条件可写成相对于诱导输出分布的 Kullback–Leibler（KL）散度量；在高斯/AWGN 情形下，这退化为熟悉的二次功率代价视角 [13]。在信源侧，最优通信可理解为在工作点上要求信源侧信息需求与信道侧信息预算相匹配 [12], [13]。我们的工作与该匹配视角一致，但处理不同的问题：我们不把问题表述为精确匹配，而是把实际学习语义系统视为源侧与信道侧目标之间的优化折中，并使用与相应经典匹配原理类似的可处理替代项，对定长模拟传输下学习到的连续符号分布建模。

DeepJSCC 架构在精神上与学习图像压缩 [14]–[16] 密切相关——后者训练神经变换以优化率–失真折中。在学习压缩中，率通常是量化潜在表示的熵，并经熵编码转换为变长比特流；训练时该率用学习到的潜在先验估计 [14]–[16]，形成组合失真与估计熵的 Lagrange 损失。我们的分析同样受率–失真与信息论概念启发，但目的不同：我们不似学习压缩那样定义训练损失，而是把 Lagrange 表述用作分析工具，以解释并导出端到端训练编码器所产生的连续语义符号的分布形式。此外，与依赖量化与变长比特流的学习压缩不同，我们的设定是定长、连续值的：速率自适应无法通过改变码字长度实现，而必须体现在符号分布本身。

近期理论研究探索了语义熵、语义容量等分析框架 [17], [18]。这些高层框架虽有概念价值，却未解决对 DeepJSCC 编码器所产生物理层符号分布建模这一具体工程问题。最相关的工作利用信息瓶颈（IB）原理或变分自编码器（VAE）[19], [20]。例如，[19] 采用基于符号熵的信息论视角；然而该途径本质上把信道噪声视为 VAE 随机采样机制的一部分，分析聚焦于加噪后的符号。编码器在加噪前生成的、反映其固有功率分配策略的具体分布仍未被充分研究。本文通过给出首个面向加噪前语义符号分布形状的符号分布模型与经验验证来填补这一空白。

近期基于矢量量化（VQ）-VAE 的正则化方法在动机上也相关，因为互信息或基于 KL 的目标可被解释为鼓励更好地利用固定通信接口。特别地，[21] 中互信息正则化的 VQ-VAE 框架在固定反馈预算下抑制码字坍缩、促进离散码本更均匀的使用；这在精神上与我们信道利用压力密切相关。但建模对象不同：该工作正则化的是离散潜在表示，而我们研究连续加噪前发射符号分布本身，并通过信道利用率与源侧描述效率之间的平衡解释其形状。

另一相关研究方向是概率星座整形（PCS）：它在功率约束下优化符号分布以逼近信道容量，包括经典 Maxwell–Boltzmann 整形与近期基于深度学习的几何/概率整形方法 [22]–[26]。类似地，我们的语义编码器可被解释为执行一种隐式概率整形，以在平均功率约束下最大化传输效率。然而，现有 PCS 方法仍停留在离散信号以最大化信道吞吐，而我们的语义编码器工作在连续符号空间并优化联合信源–信道目标。我们的分析揭示这种双重源–信道压力产生 Student's $t$ 分布，与概率星座整形中常见的、以信道为中心的 Maxwell–Boltzmann 分布形成对比。

## III. 端到端训练的语义通信系统

本节回顾神经语义通信系统的标准端到端架构，并引入分析所用记号。全节中，标量随机变量用大写字母表示（如 $X$、$Y$），其实现用小写字母表示（向量用粗体），如 $x$、$y$、$\mathbf x$、$\mathbf y$。

### A. 语义通信系统的典型架构

图 1 描绘了语义通信系统的典型架构，含三个主要部分：编码器、AWGN 信道与解码器。编码器通常实现为深度神经网络，把输入数据向量 $\mathbf x$（如图像或文本）映射为捕获关键语义信息的复数值符号向量 $\mathbf y$：

$$
\mathbf y=f_{\rm enc}(\mathbf x), \tag{1}
$$

其中 $f_{\rm enc}(\cdot)$ 表示由网络实现的编码函数。

为在神经网络训练中施加功率约束，编码器输出依据训练批次上的经验二阶矩归一化。具体地，为近似单位平均功率条件（即 $\mathbb E[\|\mathbf Y\|^2]=1$），符号向量被缩放，使其在批次上的平均平方范数等于 1：

$$
\tilde{\mathbf y}=\frac{\mathbf y}{\sqrt{\frac{1}{B}\sum_{b=1}^{B}\left\|\mathbf y^{(b)}\right\|^2}}, \tag{2}
$$

其中 $B$ 为批大小，$\mathbf y^{(b)}$ 表示批次中第 $b$ 个样本的符号向量实现，$\tilde{\mathbf y}$ 为归一化符号向量。批次级功率归一化是标准 DeepJSCC 发射机的组成部分，因而也是我们所分析输出分布的学习系统的一部分。在分布拟合时，我们收集评估集上的归一化发射符号，只施加一次全局方差归一化以固定尺度；这种分析时重缩放改变所分析边缘分布的尺度而不改变其分布形状，这与我们采用方差归一化 Student's $t$ 模型一致。

归一化符号向量 $\tilde{\mathbf y}$ 随后经可微信道层传输，该层建模物理通信环境，通常包含噪声与衰减。一个常用选择是 AWGN 信道，建模为

$$
\hat{\mathbf y}=\tilde{\mathbf y}+\mathbf n,\qquad
\mathbf n\sim\mathcal N\left(\mathbf 0,\sigma^2\mathbf I\right). \tag{3}
$$

这里 $\hat{\mathbf y}$ 表示接收符号，$\sigma^2$ 为信噪比（SNR）决定的噪声方差，$\mathbf I$ 为适当维数的单位阵。

解码器同样实现为深度神经网络，处理接收符号向量 $\hat{\mathbf y}$ 以完成特定任务，如重建原始输入：

$$
\hat{\mathbf x}=f_{\rm dec}(\hat{\mathbf y}). \tag{4}
$$

训练时依据解码器输出 $\hat{\mathbf x}$ 计算损失函数。对重建任务，损失通常定义为原始输入 $\mathbf x$ 与重建输出 $\hat{\mathbf x}$ 之间的均方误差（MSE）：

$$
\ell=\frac{1}{B}\sum_{b=1}^{B}\left\|\mathbf x^{(b)}-\hat{\mathbf x}^{(b)}\right\|^2. \tag{5}
$$

此处为简便采用 MSE 损失，但核心系统架构与后续分析可推广到其他可微失真度量（如感知损失或任务特定损失）。编码器与解码器的参数均通过反向传播更新以最小化 $\ell$。

### B. 端到端失真与源–信道编码目标的联系

语义通信系统经端到端训练以最小化信源 $X$ 与重建 $\hat X$ 之间的失真 $\ell$。尽管训练目标是任务级的，它可被理解为对符号分布 $p(Y)$ 施加两种耦合压力：信道符号应携带足够信息以降低失真，但不应使用明显多于实际所需的信道信息。我们通过如下信息论分解形式化这一联系。

**1）失真最小化诱导有效速率需求：** 理想的率–失真最优系统只需 Shannon 率–失真极限 $R(D)$ 即可达到失真水平 $D$，其中

$$
R(D)\triangleq\inf_{p(\hat x|x):\mathbb E[d(X,\hat X)]\le D}I(X;\hat X). \tag{6}
$$

从失真–速率视角看，达到更小失真需要更大的任务相关信息预算。因此，当端到端训练把系统推向更低失真时，也把系统推向与更大 $R(D)$ 相关联的工作点。

端到端神经编解码器对通常并非率–失真最优，原因包括有限模型容量、有限块长效应与优化失配。我们通过定义达到失真 $D$ 的**有效需求速率**来综合刻画这些非理想性：

$$
R_{\rm eff}(D)\triangleq R(D)+\delta_{\rm model},\qquad\delta_{\rm model}\ge0, \tag{7}
$$

其中 $\delta_{\rm model}$ 汇集架构与训练效率损失。在符号整形分析中，我们简单假定 $\delta_{\rm model}$ 对给定架构与训练设置是常数，因而与符号分布 $p(Y)$ 无关。该假设反映我们的意图：把有限神经网络容量与优化失配的效应作为聚合非理想项处理，而不对它们关于所学符号分布的详细依赖建模。

**2）符号生成阶段与信道信息预算：** 编码器把输入信源 $X$ 映射为信道符号 $Y$，其经 AWGN 信道

$$
\hat Y=Y+N,\qquad N\sim\mathcal N\left(0,\sigma^2\right) \tag{8}
$$

传输，并对 $Y$ 施加平均功率约束。该符号管道的信息承载能力由 $I(Y;\hat Y)$ 量化，并受训练 SNR 下信道容量 $C$ 上界约束：

$$
I(Y;\hat Y)\le C, \tag{9}
$$

其中容量定义为

$$
C\triangleq\sup_{p(y):\mathbb E[|Y|^2]\le1}I(Y;\hat Y). \tag{10}
$$

为达到失真水平 $D$，信道须至少提供学习系统所需的有效速率。因此我们假定系统工作在可行区间

$$
R_{\rm eff}(D)\lesssim I(Y;\hat Y)\le C. \tag{11}
$$

反过来，对给定学习符号分布，可用信道信息预算 $I(Y;\hat Y)$ 决定端到端系统可达的失真工作点；随着该工作点移动，相应有效速率需求 $R_{\rm eff}(D)$ 也通过其对 $D$ 的依赖而改变。

重要的是，不应把信源侧速率需求直接等同于 $I(Y;\hat Y)$。$R_{\rm eff}(D)$ 指模型为达到失真 $D$ 所需的、任务相关的信源信息；而 $I(Y;\hat Y)$ 度量符号接口所支持的总信息预算。实践中，信源信息必须映射到固定数目的连续信道符号上，这种消息到符号的指派通常带来额外表示开销。当信源统计与符号统计失配、或无法使用显式变长熵编码时，该开销更加明显。因此，只有一部分信道信息预算（而非全部 $I(Y;\hat Y)$）用于传递由 $R_{\rm eff}(D)$ 量化的任务相关信源信息。

**3）作用于 $p(Y)$ 的两种压力：** 式 (11) 意味着学习通过两种相反压力塑造 $p(Y)$：

a) **压力 1：信道利用率。** 任何与容量的差距

$$
\delta_{\rm under}\triangleq C-I(Y;\hat Y)\ge0 \tag{12}
$$

表示未被利用的容量（图 2 中 ④ 区）。减小 $\delta_{\rm under}$ 鼓励更大的 $I(Y;\hat Y)$。在 AWGN 的 Shannon 渐近设定中，由于噪声熵固定，这与熵最大化密切相关。受此启发，我们随后用可处理的基于熵的替代项建模信道压力。

b) **压力 2：描述效率。** 同时，使用远高于目标失真实际所需的信道速率是浪费的。我们定义描述低效为

$$
\delta_{\rm desc}\triangleq I(Y;\hat Y)-R_{\rm eff}(D)\ge0, \tag{13}
$$

对应图 2 中 ③ 区。直观地，$\delta_{\rm desc}$ 是符号分布在失真 $D$ 下超出任务实际需求所消耗的“多余管道宽度”。在经典信源编码与学习图像压缩中，这种多余量由概率建模与熵编码支持的变长比特分配来削减。相反，DeepJSCC 类语义系统通常每样本发送固定数目的连续符号，故无法使用显式变长编码；因此速率自适应必须在定长符号空间内隐式实现。一种自然机制是符号能量分配：频繁特征以低能量发送，稀有特征分配更高能量，从而起到类似变长编码的作用。这促使我们采用以信源为中心的目标，惩罚由符号幅度诱导的平均逐符号“载荷代价”。

**4）由此形成的平衡：** 综上，在固定训练 SNR 下，神经网络通过在信道利用率与描述效率之间折中来塑造 $p(Y)$。如图 2 所示，在相同容量约束下，平衡区间可比任一极端取得更小失真。下一节我们用可处理的替代目标形式化这些压力，并证明所得最大熵解构成 Student's $t$ 族。

**图 2：** 固定训练 SNR（容量为 $C$）下 AWGN 端到端语义通信的速率分解。不同符号分布在未被利用的容量（④）与描述低效（③）之间折中，产生不同工作失真 $D_a$、$D_b$、$D_c$。

## IV. 语义通信的符号分布

承上节，我们把符号整形视为在两种竞争压力下选择输入分布 $p(y)$：(i) **信道利用率**（减小未利用容量 $\delta_{\rm under}$）与 (ii) **描述效率**（减小超出失真 $D$ 所需速率的多余开销 $\delta_{\rm desc}$）。

直接在经验符号分布上优化 $\delta_{\rm under}$ 或 $\delta_{\rm desc}$ 不可处理，因此我们引入可处理替代项并优化加权组合目标：

$$
\min_{p(y)}\ \mathcal L_{\rm desc}(p)+\lambda\mathcal L_{\rm util}(p), \tag{14}
$$

其中 $\mathcal L_{\rm util}$ 促进信道利用率，$\mathcal L_{\rm desc}$ 促进描述效率，权重 $\lambda$ 控制两项折中。下面各小节具体给出用于建模描述效率与信道利用率的替代目标。

### A. 信道利用率替代项

在 Shannon 渐近设定中，信道利用率可解释为减小未利用容量 $\delta_{\rm under}\triangleq C-I(Y;\hat Y)$。在固定训练 SNR 下 $C$ 为常数，故最小化 $\delta_{\rm under}$ 等价于最大化 $I(Y;\hat Y)$。对 AWGN 信道 $\hat Y=Y+N$（$N\sim\mathcal N(0,\sigma^2)$），

$$
I(Y;\hat Y)=h(\hat Y)-h(N), \tag{15}
$$

其中 $h(N)$ 固定。虽然 $I(Y;\hat Y)$ 依赖 $h(Y+N)$，但熵功率不等式意味着对固定噪声 $N$，增大 $h(Y)$ 倾向于增大 $h(Y+N)$；且高斯输入在功率约束下同时最大化 $h(Y)$ 与 AWGN 上的 $I(Y;\hat Y)$。受这一极值性质启发，我们采用 $-h(Y)$ 作为可处理的分布级替代项，并定义

$$
\mathcal L_{\rm util}\triangleq-h(Y), \tag{16}
$$

从而最小化 $\mathcal L_{\rm util}$ 鼓励高熵输入分布。²

² 我们把熵最大化作为可处理的、分布层面的替代项，而非对有限块长最优性的断言。

### B. 基于能量–载荷模型的描述效率替代项

在经典熵编码中，最优变长码给符号 $y$ 分配约 $\ell(y)\approx-\log p(y)$ 的码长，使常见符号获得短描述、稀有符号获得长描述。相反，我们的设定每样本使用固定数目的信道符号，无法显式以比特改变码字长度。若系统仍需逐样本（或逐特征）的速率自适应，一种自然方式是通过符号能量隐式实现：频繁特征以低能量（低“载荷”）发送，稀有特征以更高能量（高“载荷”）发送。这引出关键建模问题：**瞬时载荷应如何与符号能量关联？** 为使该机制可分析，我们引入能量–载荷替代项 $\ell_{\rm pay}(y)$，把符号幅度映射为 AWGN 下可可靠区分的状态（或比特）数。

**a) APSK 启发的比特–功率关系（启发式）：** 考虑 I/Q 平面上按目标误差概率、在方差 $\sigma^2$ 的 AWGN 下设计的稠密星座。若可靠区分要求最小欧氏间隔 $d_0$，则每个判决区域面积约为

$$
A_0\asymp d_0^2, \tag{17}
$$

其中 $\asymp$ 表示相等至常数缩放因子。在近似均匀填充下，半径 $r$ 圆盘内可区分点数随面积缩放：

$$
M(r)\approx1+\frac{\kappa\pi r^2}{A_0}, \tag{18}
$$

其中加性 1 保证 $M(0)=1$（原点处载荷为零），$\kappa\in(0,1]$ 刻画填充效率。相应以 nats 计的载荷为

$$
b(r)\triangleq\ln M(r)=\ln\left(1+\frac{\kappa\pi r^2}{A_0}\right). \tag{19}
$$

**b) 从几何到能量：** 我们把几何半径与符号能量关联，即把 $r^2$ 等同于发射符号的瞬时平方幅度 $r^2\propto|y|^2$（对实标量分量 $|y|^2=y^2$）。(18)–(19) 中全部常数——包括填充因子 $\kappa$、区域面积尺度 $A_0$ 以及所需间隔 $d_0$ 对工作噪声水平的依赖——被吸收进单一非负常数 $\beta$，得到逐符号载荷替代项

$$
\ell_{\rm pay}(y)\triangleq\ln\left(1+\beta|y|^2\right), \tag{20}
$$

其中 $\beta$ 概括每单位能量的有效分辨率（并隐含目标可靠性水平）。

虽然实际语义符号是连续的，这种对数能量代价可作为区分符号所需离散描述长度的连续松弛。具体地，当可区分符号间最小间隔 $d_0$ 减小时，(18) 中的离散状态数 $M(r)$ 变大，使阶梯式计数函数可被连续载荷替代项 $\ell_{\rm pay}(y)$ 精确近似。值得注意的是，(20) 的形式与 Shannon 的 $\log(1+{\rm SNR})$ 定律一致——在此解释于瞬时层面：更高符号能量在符号空间内支持更大局部 SNR，从而容纳更大信息载荷。

最后，我们把描述效率替代项定义为期望载荷：

$$
\mathcal L_{\rm desc}\triangleq\mathbb E\left[\ell_{\rm pay}(Y)\right]. \tag{21}
$$

该替代项并非被声称等于精确码长；它是可处理的代理，用以刻画定长连续信号中通过符号能量实现隐式速率分配的机制。

### C. 联合目标与最大熵解

回顾我们的符号整形目标直接在输入分布 $p(y)$ 上表述为

$$
\min_{p(y)}\ \mathcal L_{\rm desc}(p)+\lambda\mathcal L_{\rm util}(p), \tag{22}
$$

其中 $\mathcal L_{\rm util}(p)\triangleq-h(Y)$ 促进信道利用率，描述效率项由能量–载荷替代项定义：

$$
\mathcal L_{\rm desc}(p)\triangleq\mathbb E\left[\ell_{\rm pay}(Y)\right]. \tag{23}
$$

**a) 从二维（I/Q）载荷视角到标量整形模型：** APSK 启发的载荷视角本质上是二维的：可区分状态随 I/Q 圆盘面积缩放。然而实际语义编码器产生实值特征，两个连续特征被组合为一个复信道符号。设 $Y_C\in\mathbb C$ 表示由两个实编码器特征配对形成的复信道符号，$Y_C=Y_1+jY_2$。为拟合与分析，我们对实分量 $Y\in\{\Re\{Y_C\},\Im\{Y_C\}\}$ 的公共一维边缘建模，并使用标量能量–载荷替代项

$$
\ell_{\rm pay}(y)\triangleq\ln\left(1+\beta y^2\right). \tag{24}
$$

**b) 最大熵形式：** 对任意 $\lambda>0$，最小化 (22) 是某最大熵问题的无约束（Lagrange）形式：存在常数 $L_0$（依赖 $\lambda$），使最优解也求解

$$
\begin{aligned}
\max_{p(y)}\ &h(Y)\\
\text{s.t.}\ &\mathbb E\left[\ell_{\rm pay}(Y)\right]=L_0,\qquad
\int p(y)\,dy=1.
\end{aligned} \tag{25}
$$

这是标准的 KKT/Lagrange 对应关系：$\lambda$ 在折中曲线上选择工作点 $L_0$。

**命题 1.** 在 $\mathbb E[\ell_{\rm pay}(Y)]=L_0$ 约束下最大化 $h(Y)$ 的分布形如

$$
p(y)\propto\left(1+\beta y^2\right)^{-a}, \tag{26}
$$

即缩放的 Student's $t$ 族。

**证明：** 我们在约束 $\int p(y)dy=1$ 与

$$
\int p(y)\ln\left(1+\beta y^2\right)dy=L_0 \tag{27}
$$

下最大化 $h(Y)=-\int p(y)\ln p(y)dy$。Lagrange 泛函为

$$
J[p]=\int\left(-p(y)\ln p(y)-\mu_0p(y)-\mu_1p(y)\ln\left(1+\beta y^2\right)\right)dy. \tag{28}
$$

令泛函导数为零得

$$
-\ln p(y)-1-\mu_0-\mu_1\ln\left(1+\beta y^2\right)=0, \tag{29}
$$

因此

$$
p(y)\propto\exp\left(-\mu_1\ln\left(1+\beta y^2\right)\right)=\left(1+\beta y^2\right)^{-\mu_1}. \tag{30}
$$

定义 $a\triangleq\mu_1>0$ 即得 (26)。以 $s^2\triangleq1/\beta$ 重写得 $p(y)\propto(1+y^2/s^2)^{-a}$，即（缩放）Student's $t$ 分布的核。$\square$

**c) 方差归一化的单参数模型：** 最大熵解 (26) 的核为 $p(y)\propto(1+\beta y^2)^{-a}$，含两个自由参数 $(a,\beta)$，其中 $\beta$ 为尺度相关参数。在实际语义系统中，确定性的功率归一化层强制每个实分量单位平均功率，即 $\mathbb E[Y^2]=1$，故尺度不是独立自由度。据此，我们采用仅由自由度 $\nu>2$ 参数化的方差归一化 Student's $t$ 族：

$$
p(y;\nu)=\frac{\Gamma\left(\frac{\nu+1}{2}\right)}
{\sqrt{\pi(\nu-2)}\,\Gamma\left(\frac{\nu}{2}\right)}
\left(1+\frac{y^2}{\nu-2}\right)^{-\frac{\nu+1}{2}}, \tag{31}
$$

它满足 $\mathbb E[Y]=0$ 且 $\mathbb E[Y^2]=1$。在此归一化下，核参数对应 $a=(\nu+1)/2$ 与 $\beta=1/(\nu-2)$。

### D. 编码方案与训练数据集对符号分布的影响

模型中的参数 $\nu$ 量化源目标（重尾）与信道目标（高斯）之间的内在折中：$\nu$ 越小尾部越重，反映对类似变长编码的、基于能量的隐式速率适配依赖越强；$\nu$ 越大越接近类高斯、更高熵的分布，通常与 AWGN 上的信道利用率相一致。因此我们预期，在隐式功率适配不太关键的场景中 $\nu$ 较大，例如熵均匀的数据集或支持显式符号速率控制的架构。受此观点启发，我们聚焦以下两个因素分析端到端训练的语义通信系统。

**编码方案。** 具有固定符号预算的架构（如 DeepJSCC [3]）显式速率控制能力有限，预期通过基于能量的适配来补偿，可能产生更重尾的边缘分布（更小 $\nu$）。相反，显式改变符号预算的架构（如 NTSCC [27]）可能减轻基于能量适配的负担，使边缘分布转向类高斯行为（更大 $\nu$）。

**训练数据集。** 我们进一步预期训练数据的速率变化性会影响 $\nu$。当数据集熵变化性高时，定长发射机必须跨样本更激进地适配，这可能把符号边缘推向更重尾（更小 $\nu$）；反之，更同质的数据集需要更少适配，倾向于产生更类高斯的边缘（更大 $\nu$）。

**训练 SNR。** 我们进一步预期训练 SNR 会影响学到的尾部参数 $\nu$。在更高 SNR 下，模型可使用更小间隔（更小 $A_0$），这增大 (20) 中的 $\beta$（大致 $\beta\propto1/A_0$），把边缘推向更重尾（更小 $\nu$）；反之，在更低 SNR 下，学习分布转向更类高斯的信号（更大 $\nu$）。

下一节我们通过从跨架构、跨数据集的学习符号边缘拟合 $\nu$，对这些假设进行经验检验。

**图 3：** APSK 启发的填充示意：半径 $r$ 内可可靠区分点数随面积缩放，故 $M(r)\propto r^2$。

## V. 符号分布的经验验证

本节经验检验所学语义符号能否被所提 Student's $t$ 族很好地建模，以及拟合出的形状参数 $\nu$ 如何随架构、数据集与运行条件变化。由于编码器不提供显式密度，我们先用经验样本近似符号分布，再对所得边缘分布拟合 $\nu$。

### A. 由经验样本近似符号分布

一个关键挑战是编码器输出是确定性的，模型不提供显式似然。尽管如此，输入 $X\sim q(x)$ 的随机性在符号上诱导出分布。形式上，令 $\mathbf y=f_{\rm enc}(\mathbf x)$，条件分布为 Dirac delta：

$$
q(\mathbf y|\mathbf x)=\delta\left(\mathbf y-f_{\rm enc}(\mathbf x)\right), \tag{32}
$$

而诱导边缘为

$$
q(\mathbf y)=\int q(\mathbf y|\mathbf x)q(\mathbf x)\,d\mathbf x. \tag{33}
$$

由于 $q(\mathbf y)$ 无闭式，我们用经验样本估计它。

设 $\{\mathbf x^{(b)}\}_{b=1}^{B}$ 为一批输入，$\mathbf y^{(b)}=f_{\rm enc}(\mathbf x^{(b)})$ 为相应确定性符号向量。记 $y_i^{(b)}$ 为 $\mathbf y^{(b)}$ 的第 $i$ 个分量。我们用高斯核密度估计（KDE）估计第 $i$ 维的一维边缘密度：

$$
\hat q_i(y)\triangleq\frac{1}{B}\sum_{b=1}^{B}
\mathcal N\left(y;\ y_i^{(b)},\sigma^2_{{\rm KDE},i}\right), \tag{34}
$$

其中 $\sigma_{{\rm KDE},i}$ 为带宽。我们按 Silverman 经验法则 [28] 设定 $\sigma_{{\rm KDE},i}$：

$$
\sigma_{{\rm KDE},i}\approx1.06\,\hat\sigma_iB^{-1/5}, \tag{35}
$$

$\hat\sigma_i$ 为 $\{y_i^{(b)}\}_{b=1}^{B}$ 的经验标准差。

为便于处理，我们通过假定各维边缘形状相同（即对所有 $i$ 有 $q(y_i)\approx q(y)$）而聚焦一个代表性一维边缘。

> **原文疑点：** 式 (34)、(36) 把高斯核的第二个参数写作 $\sigma^2_{{\rm KDE},i}$ 与 $\sigma^2_{\rm KDE}$（即方差），而式 (35) 以 $\sigma_{{\rm KDE},i}\approx1.06\hat\sigma_iB^{-1/5}$ 的形式给出（Silverman 带宽，属标准差尺度）；$\sigma$ 与 $\sigma^2$ 的记号在原文中混用。本译按原文照录并加注。

该近似是为以可处理方式约束各符号维的边缘分布形状。据此，我们构造池化 KDE 作为公共边缘：

$$
\hat q(y)\triangleq\frac{1}{MB}\sum_{i=1}^{M}\sum_{b=1}^{B}
\mathcal N\left(y;\ y_i^{(b)},\sigma^2_{\rm KDE}\right), \tag{36}
$$

其中 $\sigma_{\rm KDE}$ 按 Silverman 法则应用于池化样本（有效样本量 $MB$）选取。

利用该公共边缘，我们采用标准乘积形式近似

$$
\hat q(\mathbf y)\approx\prod_{i=1}^{M}\hat q(y_i), \tag{37}
$$

它作为分布级计算（如可视化与正则化）的可处理代理，而非精确因子分解的断言。该近似有两方面依据：(i) 在大规模数据集上以小批量做可靠的逐维密度估计不现实；(ii) 经验证据表明不同符号维呈现相似的零均值钟形边缘（见图 4）。此外，图 10 中 CIFAR-10 实验表明使用池化边缘对性能影响可忽略。

注意 KDE 仅用于定性可视化与计算分布级正则项。用于正则化时，我们在编码器样本上用 KDE 密度以 Monte Carlo 方式近似 KL 项（见第 VI 节）。对 Student's $t$ 模型的参数拟合，我们直接把最大似然估计（MLE）应用于池化经验样本 $\{y_i^{(b)}\}_{i,b}$（经方差归一化后），无需 KDE。

**图 4：** 各符号维度的经验符号分布 $q_i(y)$（以不同颜色表示）。结果来自在 ImageNet 数据集上训练的定长模型；可视化表明各维经验分布呈现相似的零均值钟形分布。

### B. 实验设置

实验中考虑一个以最小 MSE 重建图像为目标的图像语义通信系统，在多种图像数据集（CIFAR-10 [29] 与 ImageNet [30]）上评估，并探索不同神经网络架构（如基于 ViT 的模型 [9] 与基于 CNN 的模型 [31]）；我们还比较不同类型压缩（恒定符号率 [9], [31] 与变长编码 [27]），并考察不同传输速率（每像素符号数）与 0 至 20 dB 的 AWGN 信道 SNR 下的性能。

神经网络用 Adam 训练，学习率 $10^{-4}$，ImageNet 批大小 8、CIFAR-10 批大小 32。对 ImageNet，我们遵循 [31]，在从 8,000 张图像随机裁剪的 $256\times256$ 图块上训练。除另有说明，CIFAR-10 使用 [9] 中较小模型，其余使用 [31] 中较大的基于 CNN 的模型。这些模型是恒速率的，即对每张输入图像生成固定数目的符号；不同于 NTSCC [27] 所用变长编码，后者将在第 V-C 节比较。

为定量分析，我们把经验符号拟合到所提基于 Student's $t$ 的符号概率模型，并考察拟合的 $\nu$ 以判断符号分布更接近高斯还是 Cauchy 分布。在拟合 (31) 的单位方差 Student's $t$ 模型前，我们先归一化符号方差，使唯一自由参数为尾部指标 $\nu$。具体地，为从经验样本估计最优 $\nu$，我们使用如下 MLE：

$$
\nu=\arg\max_{\nu}\sum_{i=1}^{M}\sum_{b=1}^{B}\log p\left(y_i^{(b)};\nu\right), \tag{38}
$$

其中 $p(y;\nu)$ 为 (31) 给出的 Student's $t$ 分布概率密度函数，$y_i^{(b)}$ 表示由第 $b$ 张图像产生符号 $\mathbf y$ 的第 $i$ 维元素，$M$ 为总维数，$B$ 为图像总数。估计的 $\nu$ 作为尾部指标：$\nu$ 越大越接近高斯极限，$\nu$ 越小则越重尾、越像 Cauchy。由于符号方差仅在 $\nu>2$ 时有定义，我们把搜索空间限制为 $(2,\infty)$。

### C. 符号分布随编码方案的变化

为验证假设，我们比较 DeepJSCC [3] 与 NTSCC [27] 的符号分布。DeepJSCC 使用固定符号预算，而 NTSCC 显式按图像熵调整发射符号数（图 5），从而降低对基于功率的速率分配的依赖。

如上一节所假设，较小 $\nu$（更重尾、Cauchy 型尾部行为）表示更依赖基于功率的隐式速率适配——它在定长连续信号中扮演类似变长编码的角色；相反，类高斯符号（大 $\nu$）与信道利用率一致，在单位功率约束下接近类高斯（高熵）信号。因此，使用固定符号预算、缺乏显式速率控制的 DeepJSCC 预期学到介于高斯与重尾区间之间的符号边缘；相比之下，NTSCC 显式改变发射符号数，减轻功率域适配负担，使学习分布更接近高斯。

图 6 给出这两个系统的符号分布：包括符号直方图、KDE 估计的符号分布、高斯分布、标准 Cauchy 分布以及具有拟合 $\nu$ 的 Student's $t$ 分布。如预期，DeepJSCC 产生的分布呈现更重尾、接近 Cauchy 的形状（拟合 $\nu=2.84$）；NTSCC 的分布则更接近高斯（$\nu=7.92$）。平均 NLL 对 DeepJSCC 为 1.27、对 NTSCC 为 1.41，表明拟合合理，且低于朴素高斯或标准 Student's $t$ 建模。注意 NLL 越低对应似然越高。

虽然尾部分布似乎被我们的模型合理捕获，但在稀疏采样区域（尤其较高分位数处）仍观察到一些偏差。这些差异可能源于这些区域符号样本有限，或 Student's $t$ 模型的表示局限。尽管如此，这些经验观察总体上支持模型预测，说明了所选编码方案对语义通信系统中符号分布的影响。

**图 5：** DeepJSCC 与 NTSCC 的系统架构。NTSCC 相较 DeepJSCC 的关键差异在于其逐特征熵计算模块，可显式控制符号长度，使符号长度随图像或所提取特征变化，从而减少对基于功率的变长编码的需求。

**图 6：** 随编码方案变化的符号分布。(a, d) 线性尺度概率密度图，比较经验符号分布（直方图与 KDE）与高斯、标准 Cauchy 及 Student's $t$ 分布；(b, e) 对数尺度 PDF 图，突出各分布尾部行为差异；(c, f) 分位数–分位数（Q-Q）图，比较经验符号分布与拟合的 Student's $t$ 模型以评估拟合优度。上排为 DeepJSCC 结果，下排为 NTSCC 结果。

> **原文疑点：** 此处原文称平均 NLL“低于朴素高斯或标准 Student's t 建模”，但未给出这两类对比模型的具体 NLL 数值，读者无法核验该比较；本译按原文照录并加注。

### D. 符号分布随训练数据集的变化

我们考察数据集熵的变化性如何影响符号分布。数据集中样本间熵的方差直接影响变长编码的有效性，进而影响所得符号分布。为近似熵变化性，我们比较各数据集图像的无损压缩尺寸（PNG 格式）。如图 8 所示，ImageNet 数据集相较 CIFAR-10 呈现显著更高的图像熵变化性。这种增大的熵方差使变长编码对 ImageNet 更有优势，因为系统可动态调整符号长度以匹配不同图像的信息量。

这种熵变化性的效应反映在所得符号分布上。图 7 表明，ImageNet 训练系统的符号分布更偏向 Cauchy 型重尾（$\nu=2.84$），而 CIFAR-10 训练系统更接近高斯（$\nu=4.75$）。该观察与我们的预测一致：熵方差更高的数据集偏好变长编码，自然把符号分布推向重尾区；反之，CIFAR-10 这类熵相对均匀的数据集减少了对变长编码的需求，使分布更接近高斯。NLL 分别为 ImageNet 1.27、CIFAR-10 1.38。这些结果强调了数据集特性与符号分布整形之间的相互作用，凸显神经网络依据训练数据特性在信息最大化与比特描述代价最小化之间取得平衡的自适应本质。

**图 7：** 随训练数据集变化的符号分布。(a, d) 线性尺度 PDF 图，比较经验符号分布（直方图与 KDE）与高斯、标准 Cauchy 及 Student's $t$ 分布；(b, e) 对数尺度 PDF 图，突出尾部行为差异；(c, f) Q-Q 图，比较经验符号分布与拟合的 Student's $t$ 模型。上排为 ImageNet 训练模型，下排为 CIFAR-10 训练模型。

**图 8：** 来自 ImageNet（8,000 张）与 CIFAR-10（50,000 张）随机裁剪输入图像的压缩率分布。

### E. 符号分布随信道 SNR 的变化

我们进一步考察信道 SNR 对所学符号分布的影响。为此，我们把经验样本拟合到所提基于 Student's $t$ 的模型，评估语义通信系统在不同 SNR 条件下的符号分布，考察 20 dB、10 dB 与 0 dB。除另有说明，编码器/解码器在每个 SNR 下重新训练，故观察到的 $\nu$ 变化反映训练在不同噪声水平下如何调整输出分布。

图 9 给出结果。在 20 dB 下拟合 $\nu=2.66$、平均 NLL 1.21；在 10 dB 下 $\nu$ 增至 2.84（NLL 1.27）；在 0 dB 下进一步增至 2.96（NLL 1.30）。尽管 $\nu$ 的绝对变化不大，趋势在各 SNR 下一致：更高 SNR 导致更小 $\nu$，即更重尾的符号边缘。

该趋势也与所提能量–载荷替代项一致：在更高 SNR 下，可靠区分需要更小的判决区域面积 $A_0$，增加单位能量可区分状态数；在 (20) 中这对应更大的有效 $\beta$（$\beta\propto1/A_0$），增强基于能量的速率适配收益，偏好更重尾分布（更小 $\nu$）。反之，在更低 SNR 下可靠区分更受限（等效 $A_0$ 更大、$\beta$ 更小），减小基于功率适配的收益，使学习分布转向更类高斯信号（更大 $\nu$），此时信道利用率变得更关键。

**图 9：** 随信道 SNR 变化的符号分布。(a, b, c) 对数尺度 PDF 图，比较经验符号分布（直方图与 KDE）与高斯、标准 Cauchy 及 Student's $t$ 分布；(d, e, f) Q-Q 图，比较经验符号分布与拟合的 Student's $t$ 模型以评估拟合优度。各列对应不同 SNR：20 dB（左）、10 dB（中）、0 dB（右）。

## VI. 所提分布调节损失函数

为进一步考察框架的实际相关性，我们检验显式引导符号分布是否影响系统训练。这主要用作对所提源–信道解释的经验探针，而非声称其为普遍更优的训练目标。

### A. 所提损失函数

所提损失定义为

$$
\mathcal L(\theta)=d(\mathbf x,\hat{\mathbf x})
+\lambda D_{\rm KL}\left(\hat q(\mathbf y)\,\|\,p(\mathbf y)\right), \tag{39}
$$

其中 $d(\cdot,\cdot)$ 为任务失真度量（如 MSE 或交叉熵），$p(\mathbf y)$ 为所选目标先验（如零均值单位方差高斯）。由于确定性编码器不提供显式似然，我们以 (37) 中基于池化 KDE 的乘积形式代理 $\hat q(\mathbf y)$ 近似编码器输出分布。

KL 项惩罚经验符号分布与目标先验之间的失配：

$$
D_{\rm KL}\left(\hat q(\mathbf y)\,\|\,p(\mathbf y)\right)
\triangleq\mathbb E_{\mathbf y\sim\hat q}\left[\log\hat q(\mathbf y)-\log p(\mathbf y)\right]. \tag{40}
$$

实践中，我们通过对编码器输出 $\mathbf y^{(b)}=f_{\rm enc}(\mathbf x^{(b)})$ 做 Monte Carlo 平均来近似 (40)：

$$
D_{\rm KL}\left(\hat q\,\|\,p\right)
\approx\frac{1}{B}\sum_{b=1}^{B}\left(\log\hat q\left(\mathbf y^{(b)}\right)
-\log p\left(\mathbf y^{(b)}\right)\right), \tag{41}
$$

其中 $\log\hat q(\mathbf y^{(b)})$ 用 KDE 密度估计计算。这种正则化鼓励编码器产生匹配所需先验的符号边缘，同时通过失真项保持任务性能。

虽然我们的分析表明 Student's $t$ 分布可能是合理的先验族，但其合适自由度参数 $\nu$ 事先未知，评估 KL 项时需在训练中重新估计（或调参），这可能不稳定且计算昂贵。因此我们采用零均值单位方差高斯作为 $p(\mathbf y)$ 的简单稳定选择，它对应 Student's $t$ 族 $\nu\to\infty$ 的极限情形，并把超参数搜索缩减为仅正则强度 $\lambda$。所提基于 KDE 的正则项仅在训练时增加计算，其代价来自对所分析符号样本的 KDE 密度评估，随 KDE 计算所用样本数二次增长，而网络架构、参数量与推断时复杂度保持不变。在我们的 CIFAR-10 设置（512 符号、10 dB）下，这相当于 100 轮训练中实际耗时（wall-clock）增加约 4.8%。

### B. 跨压缩率与信道 SNR 的性能评估

我们首先在 CIFAR-10 数据集上评估带所提损失的语义通信系统在不同压缩比与信道 SNR 下的性能。我们按 [3], [5] 报告信道带宽比（CBR），其计算为

$$
{\rm CBR}=\frac{S}{H\times W\times C}, \tag{42}
$$

其中 $S$ 表示每张图像的复符号总数，$H\times W\times C$ 对应输入图像维数。

图 10 的训练曲线展示了所提损失函数的效果。我们采用较小的正则参数 $\lambda=10^{-4}$，因为更大取值会损害性能（未展示），而更小取值影响可忽略、行为与不含 KL 项的原始损失相近。结果表明该方法主要加速训练，尤其在高压缩与高 SNR 设置下——此时信源编码考量更显著。这表明把符号分布弱正则到高斯分布可改善收敛行为。

一种可能解释是：在以信源编码为主的区间，符号分布倾向于更重尾，模型更难学到稳定表示；因此低 $\lambda$ 的温和高斯正则可改善训练稳定性与收敛。我们还比较了所提损失的相同 KDE 与非相同 KDE 变体（图 10 中绿色曲线）：二者训练行为总体相近，非相同版本在验证集上略优。但对更大数据集与模型，由于批大小与内存限制，我们使用相同 KDE 版本。

**图 10：** CIFAR-10 数据集上带（橙色）与不带（蓝色）所提损失的语义系统训练曲线，按压缩比与信道 SNR 评估；较低透明度曲线对应验证集，绿色曲线表示不含相同边缘假设的所提损失（见第 V-A 节）。

### C. 跨系统架构的性能评估

随后我们在 ImageNet 上比较带与不带所提损失的 DeepJSCC 与 NTSCC，以在大型数据集上隔离定长（DeepJSCC）与变长（NTSCC）传输的影响。Kodak 数据集 [32] 用于验证。由于 NTSCC 发送可变数目符号，我们同时报告重建质量与实现的符号率（压缩比），因为更高率自然带来更高 PSNR。作为参考，我们的 DeepJSCC 模型在信道带宽比 0.083 下运行，即每张 $256\times256$ 彩色图像 16,384 个复符号。

图 11a–11c 展示了 DeepJSCC 与 NTSCC 在基线损失与所提损失下的训练动态。在所测试的正则强度（$\lambda\in[10^{-4},1]$）中，我们报告表现最佳的设置（DeepJSCC 为 $\lambda=10^{-4}$，NTSCC 为 $\lambda=1$）。对 DeepJSCC，观察到的趋势与 CIFAR-10 一致，支持我们观察的普遍性。相反，NTSCC 对 $\lambda$ 基本不敏感：把 $\lambda$ 从 $10^{-4}$ 扫到 $1$ 得到几乎相同的轨迹。该行为与我们的框架一致：NTSCC 已提供显式速率控制并产生近高斯符号（拟合 $\nu=7.92$），因此额外高斯正则基本冗余。

**图 11：** (a)、(b) DeepJSCC 与 NTSCC 分别带与不带所提损失时重建图像质量的训练曲线（DeepJSCC 的信道带宽比为 0.083）；(c) NTSCC 平均压缩率的训练曲线。SNR 设为 10 dB，较低透明度曲线对应验证集。

### D. 讨论

虽然我们的分析为 AWGN 信道提供了稳健的源–信道框架，它也为实际部署与理论扩展打开若干重要方向：

- **峰值功率限制与截断分布分析。** 实际发射机施加严格峰值功率限制，这会在实践中截断观测到的 Student's $t$ 分布的重尾。未来理论研究应聚焦于对这种**截断** Student's $t$ 分布模型的源–信道平衡进行分析与优化。
- **更多样信道与实际约束。** 我们聚焦 AWGN 信道与连续值模拟信号，因为该设定最干净地隔离了所提源–信道折中。把框架扩展到衰落、多输入多输出（MIMO）、非线性或数字/量化系统——其中信道不确定性、空间耦合、限幅与离散信号约束同样重要——是未来工作的重要方向。

## VII. 结论

本文通过把失真目标与作用于符号整形的两种诱导压力（信道利用率与描述效率）联系起来，分析了端到端语义通信中学习到的符号分布。利用这些压力的可处理替代目标，我们导出了 Student's $t$ 符号模型，并把其尾部参数解释为反映各压力相对强度的单一旋钮。模型很好地预测了形状参数如何随系统对功率域速率控制的依赖、以及训练数据集的样本间熵变化性而变化。此外，所提朝高斯目标的 KL 正则化改善了训练稳定性并常常加速收敛，为框架提供了支持性的经验证据。总体而言，这些洞见超越了对神经编码器的黑箱视角，为设计更稳定、更高效的语义通信系统提供了有原则的基础。

## 参考文献（英文原条目，按原文顺序）

[1] D. Gündüz, Z. Qin, I. E. Aguerri, H. S. Dhillon, Z. Yang, A. Yener, K. K. Wong, and C.-B. Chae, “Beyond transmitting bits: Context, semantics, and task-oriented communications,” *IEEE J. Sel. Areas Commun.*, vol. 41, pp. 5–41, Jan. 2023.

[2] H. Yoo, T. Jung, L. Dai, S. Kim, and C.-B. Chae, “Demo: Real-time semantic communications with a vision transformer,” in *Proc. IEEE Int. Conf. Commun. Workshops (ICC WKSHPS)*, pp. 1–2, May 2022.

[3] E. Bourtsoulatze, D. Burth Kurka, and D. Gündüz, “Deep joint source-channel coding for wireless image transmission,” *IEEE Trans. Cogn. Commun. Netw.*, vol. 5, pp. 567–579, Sept. 2019.

[4] H. Xie, Z. Qin, G. Y. Li, and B.-H. Juang, “Deep learning enabled semantic communication systems,” *IEEE Trans. Signal Process.*, vol. 69, pp. 2663–2675, Apr. 2021.

[5] Z. Weng and Z. Qin, “Semantic communication systems for speech transmission,” *IEEE J. Sel. Areas Commun.*, vol. 39, pp. 2434–2444, Aug. 2021.

[6] T.-Y. Tung and D. Gündüz, “DeepWiVe: Deep-learning-aided wireless video transmission,” *IEEE J. Sel. Areas Commun.*, vol. 40, pp. 2570–2583, July 2022.

[7] J. Xu, B. Ai, W. Chen, A. Yang, P. Sun, and M. Rodrigues, “Wireless image transmission using deep source channel coding with attention modules,” *IEEE Trans. Circuits Syst. Video Technol.*, vol. 32, pp. 2315–2328, Apr. 2022.

[8] H. Yoo, D. Choi, Y. Kim, Y. Kim, S. Kim, C.-B. Chae, and R. W. Heath, Jr., “Bridging neural networks and wireless systems with MIMO-OFDM semantic communications,” *IEEE Wireless Commun.*, vol. 32, pp. 48–55, Oct. 2025.

[9] H. Yoo, L. Dai, S. Kim, and C.-B. Chae, “On the role of ViT and CNN in semantic communications: Analysis and prototype validation,” *IEEE Access*, vol. 11, pp. 71528–71541, July 2023.

[10] J. Ding, P. Jiang, C.-K. Wen, and S. Jin, “Adaptive wireless image semantic transmission: Design, simulation, and prototype validation,” *arXiv preprint arXiv:2410.17536*, Oct. 2024.

[11] M. Liu, W. Chen, J. Xu, and B. Ai, “Real-time implementation and evaluation of SDR-based deep joint source-channel coding,” in *Proc. IEEE Veh. Technol. Conf. (VTC-Fall)*, pp. 1–5, Sept. 2022.

[12] M. Gastpar and M. Vetterli, “Source-channel communication in sensor networks,” in *Proc. Inf. Process. Sensor Netw.*, pp. 162–177, Jan. 2003.

[13] M. Gastpar, B. Rimoldi, and M. Vetterli, “To code, or not to code: Lossy source-channel communication revisited,” *IEEE Trans. Inf. Theory*, vol. 49, pp. 1147–1158, May 2003.

[14] J. Ballé, V. Laparra, and E. P. Simoncelli, “End-to-end optimized image compression,” in *Proc. Int. Conf. Learn. Representations (ICLR)*, Apr. 2017.

[15] J. Ballé, D. Minnen, S. Singh, and G. Toderici, “Variational image compression with a scale-mixture model for the rate term,” in *Proceedings of the International Conference on Machine Learning*, pp. 435–444, July 2018.

[16] Z. Cheng, H. Sun, M. Takeuchi, and J. Katto, “Learned image compression with discretized gaussian mixture likelihoods,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, pp. 7939–7948, June 2020.

[17] K. Niu and P. Zhang, “A mathematical theory of semantic communication,” *arXiv preprint arXiv:2401.13387*, Mar. 2024.

[18] Y. Shao, Q. Cao, and D. Gündüz, “A theory of semantic communication,” *IEEE Trans. Mobile Comput.*, vol. 23, pp. 12211–12228, May 2024.

[19] S. Xie, S. Ma, M. Ding, Y. Shi, M. Tang, and Y. Wu, “Robust information bottleneck for task-oriented communication with digital modulation,” *IEEE J. Sel. Areas Commun.*, vol. 41, pp. 2577–2591, June 2023.

[20] Y. Feng, J. Xu, L. Hu, G. Yu, and X. Duan, “Variational source-channel coding for semantic communication,” *arXiv preprint arXiv:2410.08222*, Oct. 2024.

[21] X. Chen, H. Esfahanizadeh, and F. Sohrabi, “Precoding-oriented CSI feedback design with mutual information regularized VQ-VAE,” *arXiv preprint arXiv:2602.02508*, Jan. 2026.

[22] F. Kschischang and S. Pasupathy, “Optimal nonuniform signaling for Gaussian channels,” *IEEE Trans. Inf. Theory*, vol. 39, pp. 913–929, May 1993.

[23] G. Böcherer, F. Steiner, and P. Schulte, “Bandwidth efficient and rate-matched low-density parity-check coded modulation,” *IEEE Trans. Commun.*, vol. 63, pp. 4651–4665, Dec. 2015.

[24] G. Forney, R. Gallager, G. Lang, F. Longstaff, and S. Qureshi, “Efficient modulation for band-limited channels,” *IEEE J. Sel. Areas Commun.*, vol. 2, pp. 632–647, Sept. 1984.

[25] M. Stark, F. Ait Aoudia, and J. Hoydis, “Joint learning of geometric and probabilistic constellation shaping,” in *Proc. IEEE Globecom Workshops (GC WKSHPS)*, pp. 1–6, Mar. 2019.

[26] V. Aref and M. Chagnon, “End-to-end learning of joint geometric and probabilistic constellation shaping,” in *Optical Fiber Communication Conference and Exhibition*, pp. 1–3, Apr. 2022.

[27] S. Wang, J. Dai, X. Qin, Z. Si, K. Niu, and P. Zhang, “Improved nonlinear transform source-channel coding to catalyze semantic communications,” *IEEE J. Sel. Topics Signal Process.*, vol. 17, pp. 1022–1037, Sept. 2023.

[28] B. W. Silverman, *Density Estimation for Statistics and Data Analysis*. Routledge, Apr. 1998.

[29] A. Krizhevsky, G. Hinton, et al., “Learning multiple layers of features from tiny images,” Apr. 2009.

[30] J. Deng, W. Dong, R. Socher, L.-J. Li, K. Li, and F.-F. Li, “ImageNet: A large-scale hierarchical image database,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, pp. 248–255, June 2009.

[31] D. He, Z. Yang, W. Peng, R. Ma, H. Qin, and Y. Wang, “ELIC: Efficient learned image compression with unevenly grouped space-channel contextual adaptive coding,” in *IEEE/CVF Conference on Computer Vision and Pattern Recognition*, pp. 5718–5727, June 2022.

[32] R. Franzen, “Kodak lossless true color image suite,” 1999.

**原文插图：** 原 PDF 中的图 1–11 未重传至本页，仅保留中文图注与图中关键标注（如概念/架构示意、速率分解区 ③④、符号分布直方图与 KDE、Q-Q 图、训练曲线图例）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2512.14022v2（cs.IT，13 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–VII 节（含 III-A–B、IV-A–D、V-A–E、VI-A–D 等全部小节）、结论、全部图注（图 1–11，含子图说明）、命题 1 及其证明、公式 (1)–(42) 与 32 条参考文献英文原条目；原文无附录、无作者简介、无表格（原 PDF 经逐页检索确认不含 TABLE，故本页无表可渲染核对）。**逐句终校未做**：关键式 (6)–(13)、(20)–(26)、(31)、(34)–(37)、(39)–(42) 已对照 PDF 页面核对；但尚未完成逐句逐式的独立复核。页内 2 条“原文疑点”加注：①第 V-C 节称平均 NLL 低于朴素高斯或标准 Student's $t$ 建模，但未给出这两类对比模型的具体 NLL 数值；②式 (34)/(36) 中核参数写作 $\sigma^2_{{\rm KDE},i}$（方差），而式 (35) 以 $\sigma_{{\rm KDE},i}=1.06\hat\sigma_iB^{-1/5}$ 的形式（标准差/带宽）给出，$\sigma$ 与 $\sigma^2$ 记号使用不一致。均按原文照录并说明，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
