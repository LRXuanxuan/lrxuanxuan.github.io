---
layout: page
title: "Deep Bayesian REFoCUS：超声多基地数据的流匹配后验恢复｜中文全文译稿（待终校）"
permalink: /papers/translations/2026-10-23-deep-bayesian-refocus-2610-03419/
math: true
toc: true
---

[← 返回论文库](/papers/) · [arXiv](https://arxiv.org/abs/2610.03419) · [原始 PDF](https://arxiv.org/pdf/2610.03419v1) · [作者提供的补充结果](https://swpenninga.github.io/deep-bayesian-refocus)

# 深度贝叶斯 REFoCUS

**原题：** Deep Bayesian REFoCUS  
**作者：** Simon W. Penninga、Ruud J. G. van Sloun  
**单位：** 埃因霍温理工大学电气工程系  
**来源：** arXiv:2610.03419v1，2026 年 10 月 2 日，10 页。  
**译稿状态：** 正文 I—VII、公式（1）—（17）、算法 1、表 I、图 1—11 的说明已译；46 条英文参考文献已按 PDF 第 10 页补录，算法 1 的 14 行已逐行补入；公式（17）和算法第 8—10 行之间的符号一致性仍需与实现核验。译稿不重复存储论文图片。

## 摘要

本文将通过任意发射序列恢复超声多基地（multistatic）数据的问题表述为贝叶斯推断。为解决经典线性 REFoCUS 解码器在欠秩情形下失效的问题，我们在多基地数据集上训练深度生成先验。我们将此方法称为 **Deep Bayesian REFoCUS**。在所有考察的欠秩程度和噪声水平下，该方法均优于线性基线；当反演精确可解时，其性能退化至线性解码水平。模型还能够表达采集算子零空间中的不确定性，而线性 REFoCUS 解码器仅给出点估计。最后，我们研究仿真数据与活体采集之间的分布偏移，发现不进行微调或适配也表现出显著的泛化能力。

**索引词：** 超声成像、多基地数据恢复、全矩阵采集、回顾式发射波束形成、扩散模型、逆问题、后验采样。

## I. 引言

B 模式超声图像的诊断质量很大程度上取决于发射序列。经典的逐线成像通过依次将发射波束聚焦在不同空间焦点、扫描整个视场（Field of View，FOV）来成像。这可以获得较高对比度和较好分辨率，但需要大量发射覆盖视场，因此帧率较低。平面波、发散波等超快序列可以把帧率提高多个数量级，却通常降低对比度、横向分辨率和信噪比（SNR）[1]、[2]。将不同转向的多次发射进行相干复合，可以弥补部分性能损失 [1]、[3]，但帧率、SNR 和聚焦质量之间的基本权衡依然存在。此外，覆盖大视场的非聚焦发射序列在相干复合时会受到组织在序列期间运动的影响，也更难产生谐波成像所需的足够组织谐波。

在线性传播条件下，多基地数据集包含“每个发射阵元独立发射、每个接收阵元分别记录”产生的所有数据。通过对具有时间偏移的单阵元响应作线性组合，能够完全通过计算来实现整个阵列的回顾式发射和接收聚焦。但是，顺序进行单阵元发射会严重限制 SNR 和帧率，因此在实际中很难采集高质量的多基地数据集 [4]。

回顾式常规超声序列编码（Retrospective Encoding For Conventional Ultrasound Sequences，REFoCUS）[5] 则允许从任意发射序列恢复多基地数据，其核心是对单阵元响应的线性编码进行求逆。记录常规全孔径序列的通道数据，再施加编码的伴随算子，即跨发射事件重新延时并求和，就能恢复完整数据集的一个估计，并享有全孔径发射带来的 SNR。此后，该方法被改写到频域，通过 Tikhonov 正则化增强稳定性，能够处理转向波束及移动孔径序列 [6]。然而，两种解码最终都对测量线性，只有无噪声且满秩的发射集合才允许精确求逆。

本文提出 Deep Bayesian REFoCUS（DB-REFoCUS），解决这种秩亏限制。测量算子秩亏时，学习得到的先验可以利用已观测与未观测分量之间的统计依赖，推断合理多基地数据集的概率分布。实际多基地数据跨阵元具有高度结构性和空间相干性，因此训练深度生成模型捕捉此结构，再通过后验采样恢复数据集。

扩散和流匹配（flow matching）模型的出现 [7]—[10] 使学习大型生成先验成为可能，例如图像和视频生成。扩散后验采样（Diffusion Posterior Sampling，DPS）[14] 等方法 [11]—[13] 也已显示出解决不适定逆问题的能力。我们证明，此类方法还能学习原始超声通道数据的先验。我们把 DPS 引导与经典伴随型 REFoCUS 联系起来，说明模型能直接用于任意超声发射序列，不必为每一种序列单独训练，只需在推理时提供具体的采集算子。反复从后验采样得到的样本集合，其离散程度反映认知不确定性（epistemic uncertainty），且与模型误差高度相关。整体流程见图 1。

后文依次回顾相关工作，推导 REFoCUS 的贝叶斯表述，在理想化仿真多基地数据上训练生成先验，并用不同发射次数的活体心脏胸骨旁长轴（parasternal long axis，PLAX）记录评价。

## II. 相关工作

传统合成发射孔径（synthetic transmit aperture，STA）成像逐个激励阵元，以单阵元发射 SNR 获取多基地数据集 [4]、[15]。随后大量研究旨在改善这一 SNR：时间编码方法以经调制、在接收端压缩的波形替代短脉冲 [16]、[17]；多阵元同时发射通过离焦子孔径或阵列后方虚拟声源模拟球面波 [18]—[20]；空间编码通过全孔径施加正交 Hadamard 符号图案，使解码后恢复每个阵元的响应 [21]、[22]。但此类编码特意选取为可平凡正交解码，限制了发射设计。

回顾式发射聚焦最初通过对固定发射“透镜”进行反卷积，在焦区外合成聚焦图像，并使用最小二乘优化 [23]。REFoCUS 将回顾式聚焦扩展到整个数据集，并取消发射设计限制，可以用伴随算子 [5]、斜坡滤波伴随算子及 Tikhonov 正则化最小二乘 [6] 解码任意发射序列。然而，当发射事件数少于换能器阵元数，每个频率处的编码矩阵必然具有非平凡零空间；没有额外假设或先验，就不能仅从测量唯一恢复多基地响应。

现有方法采用不同假设处理非唯一性：压缩感知利用稀疏性 [24]，最小范数最小二乘则选取零空间分量为零的解 [25]。深度学习的发展使直接学习非线性解码器成为可能。文献 [26] 在 Hadamard 编码零空间中训练卷积网络回归残差；[27] 联合学习发射加窗权重和解码网络。

这些方法本质上是判别式方法：对于固定采集方案，通过某一损失函数训练网络来回归目标图像、加窗或信道估计；一旦改变发射设置，就需要重新训练。而且，非线性点回归器无法体现零空间的离散程度以及可能解的多样性。相对地，我们学习完整数据集上的生成先验，只在推理阶段把编码作为可微算子输入，从而在特定解剖领域和带宽内保持通用性。恢复借助后验采样实现：根据给定测量条件下未观测分量的条件分布，对零空间进行采样填充；重复采样揭示发射采集中哪些部分尚未得到充分约束。

## III. 方法

### A. 多基地数据集及其编码

沿用原始 REFoCUS 模型 [6] 的记号。考虑包含 $N_{\rm elem}$ 个阵元的阵列，$u_{TR}(t)$ 表示发射阵元 $T\in\{1,\ldots,N_{\rm elem}\}$ 激励后，接收阵元 $R\in\{1,\ldots,N_{\rm elem}\}$ 在时间 $t$ 记录的回波。所有发射—接收阵元对 $(T,R)$ 的响应集合即多基地数据集。声传播具有线性性质，因此任意发射事件的通道数据均可表示为单阵元响应的叠加。若第 $n$ 次发射事件以加窗权重 $w_{nT}$、延时 $\tau_{nT}$ 激励各阵元，则记录为

$$
s_{nR}(t)=\sum_{T=1}^{N_{\rm elem}}w_{nT}u_{TR}(t-\tau_{nT})+n_{nR}(t).\tag{1}
$$

$n_{nR}(t)$ 是测量噪声。沿快时间轴进行傅里叶变换，将延时变为相位斜坡，使各时间频率 $f$、各接收阵元 $R$ 的问题解耦：

$$
S_{nR}(f)=\sum_{T=1}^{N_{\rm elem}}H_{nT}(f)U_{TR}(f),\tag{2}
$$

编码矩阵元素为

$$
H_{nT}(f)=w_{nT}\exp(-j2\pi f\tau_{nT}).\tag{3}
$$

将 $N_{\rm beams}$ 次已记录发射事件按频率点和接收通道堆叠，得到 $\mathbf S_R(f)=\mathbf H(f)\mathbf U_R(f)$，其中 $\mathbf H(f)\in\mathbb C^{N_{\rm beams}\times N_{\rm elem}}$：

$$
\mathbf H(f)=\begin{bmatrix}H_{11}(f)&\cdots&H_{1N_{\rm elem}}(f)\\\vdots&\ddots&\vdots\\H_{N_{\rm beams},1}(f)&\cdots&H_{N_{\rm beams},N_{\rm elem}}(f)\end{bmatrix}.\tag{4}
$$

准确恢复 $\mathbf U_R(f)$ 取决于 $\mathbf H$ 的伪逆 $\mathbf H^\dagger$。早期用编码的伴随算子估计数据集：

$$
\widehat{\mathbf U}_R(f)=\mathbf H^*(f)\mathbf S_R(f),\tag{5}
$$

这里 $(\cdot)^*$ 按原文表示共轭转置；在时域中，该运算等价于跨发射事件重新延时并求和。随后引入斜坡滤波器校正伴随算子不均匀的频率加权，并给出 Tikhonov 正则化反演：

$$
\widehat{\mathbf U}_R(f)=\left[\mathbf H^*(f)\mathbf H(f)+\left(\gamma\sigma_{\max}(f)\right)^2\mathbf I\right]^{-1}\mathbf H^*(f)\mathbf S_R(f).\tag{6}
$$

其中 $\sigma_{\max}(f)$ 是 $\mathbf H(f)$ 的最大奇异值，$\gamma$ 为正则化参数 [6]。这种正则化反演在可逆子空间均衡编码，对不可逆方向抑制噪声放大。两类估计器均为线性，精度受 $\mathbf H(f)$ 的秩决定。当 $N_{\rm beams}<N_{\rm elem}$，每个频点的零空间维数至少为 $N_{\rm elem}-N_{\rm beams}$。

### B. 贝叶斯 REFoCUS

为引入概率分布，在时域中把多基地数据集写为可采样随机变量 $\mathbf x$，把测量集合 $\{s_{nR}(t)\}$ 写为 $\mathbf y$。采集模型为

$$
\mathbf y=\mathcal A(\mathbf x)+\mathbf n,\tag{7}
$$

其中 $\mathbf n$ 为协方差对角的复高斯噪声。根据式（2），发射波束形成算子为

$$
\mathcal A(\mathbf x)=\mathcal F^{-1}\left(\mathbf H\mathcal F(\mathbf x)\right),\tag{8}
$$

$\mathcal F$ 表示沿快时间轴的快速傅里叶变换，算子仍由 $w_{nT}$、$\tau_{nT}$ 决定。对测量 $\mathbf y$ 条件化后的多基地后验由贝叶斯法则给出：

$$
p(\mathbf x\mid\mathbf y)=\frac{p(\mathbf y\mid\mathbf x)p(\mathbf x)}{p(\mathbf y)}.\tag{9}
$$

用连续时间流匹配生成模型 [9]、[10]、[28] 表示先验 $p(\mathbf x)$。这类模型回归数据样本 $\mathbf x_0\sim p(\mathbf x)$ 与高斯噪声 $\boldsymbol\epsilon\sim\mathcal N(\mathbf0,\mathbf I)$ 之间线性插值轨迹的速度：

$$
\mathbf x_{\mathcal T}=(1-\mathcal T)\mathbf x_0+\mathcal T\boldsymbol\epsilon,\qquad \mathcal T\in[0,1].\tag{10}
$$

其速度为 $\partial\mathbf x_{\mathcal T}/\partial\mathcal T=\mathbf v=\boldsymbol\epsilon-\mathbf x_0$。以参数 $\theta$ 表示的网络 $\mathbf v_\theta(\mathbf x_{\mathcal T},\mathcal T)$ 最小化流匹配目标：

$$
\mathcal L(\theta)=\mathbb E_{\mathbf x_0,\boldsymbol\epsilon,\mathcal T}\left\|\mathbf v_\theta(\mathbf x_{\mathcal T},\mathcal T)-(\boldsymbol\epsilon-\mathbf x_0)\right\|_2^2.\tag{11}
$$

学习到速度场后，可逆向得到无条件多基地数据集估计：

$$
\widehat{\mathbf x}_0(\mathbf x_{\mathcal T},\mathcal T)=\mathbf x_{\mathcal T}-\mathcal T\mathbf v_\theta(\mathbf x_{\mathcal T},\mathcal T).\tag{12}
$$

对于得分匹配模型，后验可写为

$$
\log p(\mathbf x_{\mathcal T}\mid\mathbf y)=\log p(\mathbf y\mid\mathbf x_{\mathcal T})+\log p(\mathbf x_{\mathcal T})-\log p(\mathbf y),\tag{13}
$$

从而有

$$
\begin{aligned}
\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf x_{\mathcal T}\mid\mathbf y)
&=\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf y\mid\mathbf x_{\mathcal T})+\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf x_{\mathcal T})-\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf y)\\
&\approx\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf y\mid\widehat{\mathbf x}_0)+\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf x_{\mathcal T}).
\end{aligned}\tag{14}
$$

最后一行利用 $\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf y)=0$ 以及根据 DPS [14] 作出的近似 $p(\mathbf y\mid\mathbf x_{\mathcal T})\approx p(\mathbf y\mid\widehat{\mathbf x}_0)$。由式（7）的高斯噪声模型，似然梯度成为

$$
\begin{aligned}
\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf y\mid\widehat{\mathbf x}_0)
&=-\frac1{2\sigma_y^2}\nabla_{\mathbf x_{\mathcal T}}\left\|\mathbf y-\mathcal A\bigl(\widehat{\mathbf x}_0(\mathbf x_{\mathcal T},\mathcal T)\bigr)\right\|_2^2\\
&=\frac1{\sigma_y^2}\mathbf J_{\widehat{\mathbf x}_0}^*\mathcal A^*\left(\mathbf y-\mathcal A(\widehat{\mathbf x}_0(\mathbf x_{\mathcal T},\mathcal T))\right).
\end{aligned}\tag{15}
$$

这里 $\mathbf J_{\widehat{\mathbf x}_0}^*$ 是净化估计映射的伴随雅可比，$\mathcal A^*=\mathcal F^{-1}\mathbf H^*\mathcal F(\cdot)$ 是发射编码的伴随算子，作用于测量残差。这意味着似然项通过编码伴随算子把残差反投影回数据域，从而与经典 REFoCUS 使用相同的伴随运算实现测量一致性。

逐频点考虑，后验样本可近似分解为

$$
\widehat{\mathbf U}_R(f)\approx
\underbrace{\mathbf H^\dagger(f)\mathbf S_R(f)}_{\text{测量决定的分量}}
+\underbrace{\bigl(\mathbf I-\mathbf H^\dagger(f)\mathbf H(f)\bigr)\widehat{\mathbf U}_R(f)}_{\text{先验分布决定的零空间分量}}.\tag{16}
$$

这种分解并不精确，因为重建并非严格满足测量一致性，先验并未被禁止影响测量所覆盖的分量。这样设计是有意的：测量含有噪声，不应被精确复制。改为在离散扩散时间中对引导项归一化，并使用 $\zeta$ 控制其强度，得到更新式（原 PDF 此式的分母排印有歧义，见下方校对注记）：

$$
\mathbf x_{\mathcal T+1}=\mathbf x_{\mathcal T}-\zeta\,\frac{\nabla_{\mathbf x_{\mathcal T}}\log p(\mathbf y\mid\widehat{\mathbf x}_0)}{\sqrt{\log p(\mathbf y\mid\widehat{\mathbf x}_0)+\varepsilon}}.\tag{17}
$$

其中 $\varepsilon$ 为很小的稳定常数。完整恢复流程由算法 1 给出。

**译者校对注：** 原文式（17）的根号中使用对数似然，其符号及算法 1 中归一化残差的记法需要与作者实现再次比对。本文保留原 PDF 的式面，不自行把它改成另一种损失形式。

**图 1：** Deep Bayesian REFoCUS 后验采样过程。多基地数据以随机高斯噪声初始化；经发射波束形成得到的测量残差引导生成过程，神经网络步骤施加多基地先验统计，伴随引导步骤则逐步把生成结果推向观测约束。

### 算法 1：Deep Bayesian REFoCUS（原文 14 行逐行译录）

1. **输入：** 发射波束形成算子 $\mathcal A$、测量 $\mathbf y$、速度网络 $\mathbf v_\theta$、步数 $\Gamma$、后验样本数 $K$ 和引导强度 $\zeta$。
2. 设置递减时间序列 $1=\mathcal T_0>\mathcal T_1>\cdots>\mathcal T_\Gamma=0$。
3. 对 $k=0,\ldots,K-1$ 执行后验样本循环。
4. 令 $\mathbf x_{\mathcal T_0}\sim\mathcal N(\mathbf0,\mathbf I)$。
5. 对 $\rho=0,\ldots,\Gamma-1$ 执行反向时间步循环。
6. 计算净化预测 $\widehat{\mathbf x}_0\leftarrow\mathbf x_{\mathcal T_\rho}-\mathcal T_\rho\mathbf v_\theta(\mathbf x_{\mathcal T_\rho},\mathcal T_\rho)$。
7. 计算残差 $\mathbf r\leftarrow\mathbf y-\mathcal A(\widehat{\mathbf x}_0)$，并置 $L\leftarrow\|\mathbf r\|_2^2$。
8. 按原文算法行定义引导方向 $\nabla_{\mathbf x_{\mathcal T_\rho}}L\leftarrow\mathbf J_{\widehat{\mathbf x}_0}^{*}\mathcal A^*\mathbf r$。
9. 更新 $\mathbf x_{\mathcal T_{\rho+1}}\leftarrow\mathbf x_{\mathcal T_\rho}+\dfrac{\zeta}{\sqrt{L+\varepsilon}}\nabla_{\mathbf x_{\mathcal T_\rho}}L$。
10. 再进行流先验更新：$\mathbf x_{\mathcal T_{\rho+1}}\leftarrow\mathbf x_{\mathcal T_{\rho+1}}+\mathbf v_\theta(\mathbf x_{\mathcal T_\rho},\mathcal T_\rho)(\mathcal T_{\rho+1}-\mathcal T_\rho)$。
11. 结束内层时间步循环。
12. 保存样本 $\mathbf x^k\leftarrow\mathbf x_{\mathcal T_\Gamma}$。
13. 结束外层后验样本循环。
14. **返回：** $\{\mathbf x^0,\ldots,\mathbf x^{K-1}\}$，即从 $p(\mathbf x\mid\mathbf y)$ 近似抽取的后验样本。

**算法一致性校对：** 上述第 8–10 行忠实保留原 PDF 中的引导方向和更新符号，不将其擅自等同于普通平方误差损失的严格梯度。原文式（17）把归一化分母写作对数似然相关项，而算法 1 则使用残差能量 $L$；两者在符号与含义上需要进一步查作者实现，不能在未经验证的情况下断言完全等价。

## IV. 实验设置

### A. 模型先验

为训练生成先验，首先根据真实心脏解剖结构模拟一批多基地数据集。采用 EchoNet-LVH 数据集 [29] 中的心脏 PLAX 视角 B 模式图像，依照每帧像素强度采样点散射体。对散射体位置加随机扰动，将其映射至横向 $\pm70.7\,\mathrm{mm}$、深度 $0$—$100\,\mathrm{mm}$ 的范围，形成 $\pm45^\circ$ 的扇区。使用 zea [30] 模拟 Philips S5-1 探头的 STA 采集，设置 $N_{\rm elem}=80$、阵元节距 $0.25\,\mathrm{mm}$、$f_c=4\,\mathrm{MHz}$、$f_s=12.5\,\mathrm{MHz}$、声速 $c=1540\,\mathrm{m/s}$、轴向样本数 $N_{\rm ax}=1536$ 和发射次数 $N_{\rm beams}=80$。

模拟器是在线性频域中运算的模型，不包括随深度变化的衰减、测量噪声、声速变化或成像平面外的杂波。此外，从已处理的 B 模式图像生成散射密度图本身就引入分布偏置，因为此类图像已含噪声、像差和杂波。因此，我们并不声称这一仿真真实再现了多基地数据集；它是理想化表示，但仍充分丰富，可建立一个对源自某种解剖结构的入射波前多基地数据有用的生成先验。数据生成过程见图 2。

为降低模型计算开销，以 $f_{\rm demod}=4\,\mathrm{MHz}$ 解调为 IQ 数据，并沿轴向三倍降采样，使输入为 $\mathbf x\in\mathbb R^{80\times512\times80\times2}$，四个轴依次为发射、快时间、接收和复数通道。多基地张量归一化为零均值、单位方差，并在 $\pm7$ 个标准差截断。完整仿真语料包括 107,880 个训练样本和 11,205 个来自留出患者的验证样本。

速度场网络 $\mathbf v_\theta$ 使用带残差模块 [35] 的三维卷积 U-Net [34]，通过式（11）中的流匹配损失训练，前向计算采用经 XLA 编译的 TensorFlow [36]。采样和评估均使用权重的指数移动平均（EMA）。架构和训练参数见表 I。

**图 2：** EchoNet-LVH 图像帧生成多基地数据的示例：根据像素强度抽样散射体，使用 zea 仿真满秩 STA 发射，然后对多基地数据进行波束形成以供可视化比较。

**表 I：U-Net 架构和训练配置**

| 阶段 | 输出尺度（发射×轴向×接收） | 通道数 | 模块数 | 注意力 |
|---|---|---:|---:|---|
| Stem | 80×512×20 | 96 | — | — |
| 编码器 1 | 80×512×20 | 96 | 4 | — |
| 编码器 2 | 40×256×10 | 192 | 3 | 有 |
| 编码器 3 | 20×128×5 | 384 | 3 | 有 |
| 瓶颈 | 10×64×5 | 384 | 3 | 有 |
| 解码器 3 | 20×128×5 | 384 | 3 | 有 |
| 解码器 2 | 40×256×10 | 192 | 3 | 有 |
| 解码器 1 | 80×512×20 | 96 | 4 | — |
| Un-stem | 80×512×80 | 2 | — | — |

训练配置：时间采样使用 logit-normal 分布（$\mu=0,s=1$）；优化器 AdamW、权重衰减 $10^{-2}$；学习率按余弦曲线从 $10^{-4}$ 降至 $10^{-6}$；EMA 动量 $0.9999$；批量大小 32；训练 400,000 步；参数量 1.467 亿；混合 bfloat16 精度；硬件 8 张 NVIDIA B200；训练时长 240 小时。Stem/Un-stem 是单层带步幅的（转置）卷积；注意力是具有 8 个 QK 归一化头的按轴分解自注意力 [31]—[33]。

### B. 评价

将 DB-REFoCUS 与伴随型 REFoCUS [5]、斜坡滤波伴随型 REFoCUS，以及 Tikhonov 正则化反演 [6] 比较。对 Tikhonov 方法，在每个数据点上对 $\gamma\in[10^{-4},10^1]$ 做 26 个对数间隔网格的“先知”搜索，选取性能最佳的结果作为性能上界。DB-REFoCUS 使用 $\Gamma=1000$ 步、$K=8$ 个后验样本，并报告后验均值的性能。

通道域用增益补偿后的复相关 [6] 与归一化均方误差（NMSE）评价多基地恢复；图像域用峰值信噪比（PSNR）和结构相似性（SSIM）。多基地数据经带压力场加权的延时求和波束形成、包络检测、99.99 百分位归一化和对数压缩转换为图像，并以固定 50 dB 动态范围显示。

测试六种发射类型：**聚焦扇区波束（FOC）**，全孔径聚焦到半径 60 mm（约 F/3），并跨扇区转向，活体实验包含基波与谐波；**宽波束（WD）**，类似 FOC 但焦距 150 mm，活体实验也包含基波与谐波；**平面波（PW）**，采用线性发射延时的全孔径转向波；**发散波（DW）**，阵列后方半径 30 mm 的转向虚拟点源；**Hadamard（HAD）**，零延时、加窗取 80 阶 Hadamard 矩阵的不同行 [21]；**随机 $\pm1$（RND）**，零延时且加窗为独立同分布的伯努利 $\pm1$，是 HAD 的非相干压缩感知对应形式。这些类型覆盖逆问题从良态到严重病态的宽范围。在实验中，对可转向发射采用交织抽样，以保证子采样后仍覆盖整个扇区。

### C. 实验

**1）仿真：** 用 $\mathbf y=\mathcal A(\mathbf x)+\sigma G(z)\boldsymbol\epsilon$ 向发射数据加噪，复制活体采集的 SNR 深度分布。$\sigma$ 为随目标 SNR 缩放的系数，$z$ 是深度，$G(z)$ 是功率归一化的时间增益补偿（TGC）曲线，$\boldsymbol\epsilon\sim\mathcal{CN}(0,1)$。除非另有说明，全局测量 SNR 为 10 dB。$G(z)$ 由间隔 2.951 mm 的 32 个区块定义，把 10 dB 全局 SNR 对应到随深度变化的局部 SNR 序列 $[35.95,34.89,\ldots,1.99,0.94]$ dB。

首先在 50 个测试帧上，跨全部发射类型和 $N_{\rm beams}$ 扫描引导强度 $\zeta$，选择 DB-REFoCUS 统一的工作点。然后在 100 个不同测试帧上评价通道域和图像域的恢复质量。为测试噪声鲁棒性，在 FOC 与 HAD 两种发射条件下取 $N_{\rm beams}=[32,80]$，并扫描 SNR $=[-20,-10,0,10,20,\infty]$ dB；此时先在另 10 个测试帧上重调 $\zeta$，为各噪声级选取固定最优值，再在 100 个独立帧上评价。先知 Tikhonov 始终对每帧网格搜索。最后对每种发射及每个 $N_{\rm beams}$，计算多基地后验方差与通道域恢复损失的 Spearman 相关系数 $\rho$，考察认知不确定性是否揭示测量的秩亏位置。

**2）活体：** 使用 Verasonics Vantage 256 [37] 与阵元节距 0.254 mm 的 Philips S5-1 探头，由非专家操作人员为 12 位匿名志愿者在左侧卧位（LLR）采集心脏 PLAX 视角。每种发射类型以 33 Hz 记录 100 帧，约 3 秒。所有采集在 $f_c=3.906$ MHz 发射并解调，记录采样率 $f_s=15.625$ MHz。FOC 和 WD 的基波记录补充谐波模式，后者以 $f=1.953$ MHz 发射。数据经过带宽 2 MHz 的带通滤波、32 样本 Hanning 窗、解调和三倍降采样；对生成的 IQ 数据用相位斜坡将 4.1667 MHz 平移到 4 MHz，只保留前 512 个轴向样本，并以单一标量归一化至单位方差。活体图像处理流程与仿真一致，活体通道数据作为 OpenH-RF [38] 的一部分公开。

活体采集没有真实完整多基地数据，故用留出发射数据评价。分别从 $N_{\rm beams}\in\{8,16,32,64\}$ 次测量恢复多基地数据，再前向发射波束形成至其余 $\{72,64,48,16\}$ 次发射，与真实采集比较。图像域则将恢复多基地数据的 B 模式与 $N_{\rm beams}=80$ 的 B 模式比较。由于模型未在活体数据上训练，活体实验把 $\zeta$ 提高到 0.8，给予更强测量引导。

## V. 结果

图 3 展示不同方法的定性比较。仿真示例只发射一束 $0^\circ$ 平面波，目标是完整多基地真值。线性解码器忠实于测量，却把零空间分量压缩为零；DB-REFoCUS 则对 B 模式进行超出已观测范围的补全。尽管结果与真值存在差异，模型仍呈现与这些测量一致的心脏解剖结构认知。在活体示例中，输入测量是 40 束谐波宽波束，目标是同帧 80 束谐波宽波束；图中展示由恢复多基地数据形成的波束图像。经典恢复方法仍有放射状条纹的发射波束形成图案，因为这些条纹之间的零空间未被填充；DB-REFoCUS 没有这一问题，但明显向 EchoNet-LVH 分布发生偏移，导致对比度被人为增强。补充的交互式定性结果和视频见文章顶部作者网站。

**图 3：** 仿真和活体重建质量对比：发射波束形成、斜坡滤波伴随、先知 Tikhonov、Deep Bayesian REFoCUS 与目标。仿真使用单束平面波并以仿真多基地真值为目标；活体使用 40 束谐波宽波束，并以 80 束谐波宽波束为目标。

图 4 给出 $\zeta$ 扫描。对于仿真数据，结果对引导强度在各类发射和测量秩下都不太敏感。后续仿真实验取最优 $\zeta=0.35$。

**图 4：** 六种发射类型下，DB-REFoCUS 多基地恢复数据与真值的复相关。曲线表示不同发射事件数，扫描引导强度并选定全局工作点 $\zeta=0.35$。

图 5 表明，DB-REFoCUS 有时仅用 80 次发射中的 4 次就能达到接近 1 的复相关。在低秩条件下，发射聚焦程度与恢复效果呈现清晰关系：当 $N_{\rm beams}=1$，FOC 因对扇区的覆盖最小而表现最差；宽波束、平面波和发散波照射更大区域，效果更好。因此，DB-REFoCUS 在这里主要受认知不确定性限制，而非 SNR。尽管如此，在所有工作点上 DB-REFoCUS 均优于线性解码器。新增无噪声先知 Tikhonov 基线显示：线性恢复受到测量秩亏而非噪声限制；有噪与无噪 Tikhonov 在所有 $N_{\rm beams}$ 下表现接近。

原文脚注指出：转向角 $45^\circ$ 不满足 $d\leq\lambda/(1+\sin\theta_{\max})$，故大角度采集中存在栅瓣（$\theta_{\max}\approx33^\circ$）。因此，对转向发射类，线性解码器可能不能达到复相关 1；不转向的发射及以 1.953 MHz 发射的活体谐波模式不受此因素影响。

**图 5：** 10 dB 测量 SNR 下，针对不同 $N_{\rm beams}$ 的 DB-REFoCUS 与线性基线复相关。无噪声 Tikhonov 表明线性反演受到秩亏限制。

图 6 给出相对先知 Tikhonov 的 NMSE、PSNR 和 SSIM。通道域和图像域各指标均显示 DB-REFoCUS 更好；优势在 $N_{\rm beams}=8$—32 的欠采样区间最明显。低于该区间时，输入信息不足以完全恢复多基地数据，DB-REFoCUS 虽能生成合理样本，但后验离散范围较大；所有样本与测量相符，却未必与完整多基地真值对齐。发射次数进一步增大后，生成先验的收益减小，因为观测对多基地数据的约束更充分，线性解码器相对表现也更好，差距收窄。

**图 6：** DB-REFoCUS 相对最佳线性解码器——先知 Tikhonov——在通道 NMSE、B 模式 PSNR 和 B 模式 SSIM 上的热力图；横轴为发射次数，纵轴为六种发射类型。

图 7 对 FOC、HAD 在 $N_{\rm beams}=32,80$ 时扫描 SNR。$N_{\rm beams}=32$ 时，DB-REFoCUS 在所有噪声水平下都优于线性方法；当 $N_{\rm beams}=80$，不再有秩亏，DB-REFoCUS 在低 SNR 仍较好，但 SNR 足够高或无噪时线性解码器表现更佳，因为此时线性反演精确，而生成模型的采样仍引入随机性。

**图 7：** 不同 SNR 下与线性解码器的性能比较。虚线为 $N_{\rm beams}=32$，实线为 $N_{\rm beams}=80$。

图 8 分析后验不确定性与秩亏的关系：给定 8 束等间距聚焦发射，采样 8 组多基地恢复结果。把 Monte Carlo 后验均值相对于完整真值的残差进行波束形成；同样对后验样本方差进行波束形成并展示。（c）的损失和（d）的方差大体一致。图像上方因恢复正确而没有方差，无组织的暗区也没有明显方差或损失；最值得注意的是焦点周围，该处声压最高、组织恢复最佳，两个图中都出现相应放射状条纹。

**图 8：** （a）8 束聚焦波束测量，（b）模型恢复，（c）相对完整多基地真值的误差，（d）8 个后验样本的方差。

这种损失与后验方差的关系可用 Spearman 系数 $\rho$ 定量表示。图 9 表明，各发射类型在严重秩亏时均表现出较强的单调相关性；如预期，当 $N_{\rm beams}\geq16$，相关性急剧下降。随着认知不确定性减小，后验逐渐收敛为单一估计，此时相关性主要由固定的重建偏差和随机采样噪声决定。

**图 9：** 在不同秩亏程度、不同发射类型下，DB-REFoCUS 多基地恢复损失与后验方差之间的 Spearman 系数 $\rho$。

活体数据的复相关结果见图 10。由于分布偏移，模型效果显著差于仿真：它没有在该频率上训练，也未见过平面外杂波、非线性效应或真实三维波传播。尽管如此，它仍从仿真中学到了相干性和多基地结构，因而在低秩反演中能够优于线性解码器。但当发射次数增加，先验会把测量向训练分布拉动，这种偏置可能超过其对零空间进行结构化填补的收益。Hadamard 发射尤其值得注意：其编码被特意设计成正交，使未测编码在数据层面完全不可见；DB-REFoCUS 仍借助所学结构恢复了缺失采集中的大量分量。

**图 10：** 各发射类型在活体数据上的复相关，按 $N_{\rm beams}$ 展示。将恢复的多基地数据重新波束形成至同帧其余 $80-N_{\rm beams}$ 次留出发射，再计算复相关。

图 11 汇报其他指标。NMSE 基本支持复相关结果，但图像域指标存在偏差，这是因为恢复图像带有 EchoNet-LVH 的统计特征，如图 3 所示。作者指出，对分布外图像域恢复，视觉评价比这些数值指标可能更有意义，并引导读者查看上述交互式补充结果。

**图 11：** 活体数据中 DB-REFoCUS 相对于先知 Tikhonov 的 NMSE、PSNR 和 SSIM。NMSE 通过留出发射上的波束形成比较计算；图像指标以 $N_{\rm beams}=80$ 图像为参照。

## VI. 讨论

仿真结果表明，将深度生成模型引入超声成像通道域具有发展潜力。最主要的障碍是用于训练的高质量多基地数据集稀缺，这类数据并不普遍，而且很难覆盖所有人体解剖部位。作者预计，可借助 ambient diffusion [39] 等技术，从任意发射类型的真实活体采集中学习多基地结构；不过真实数据训练也带来权衡。

如图 3 所示，分布外引导可能产生积极作用。若模型只学过理想化仿真统计，它在恢复过程中会自然去噪、消除伪影、修正像差；如果训练数据自身包含这些伪影，模型可能失去这些能力，甚至在生成时重新引入像差或其他伪影。反过来，若活体分布与先验差距过大，又可能出现幻觉式重建 [40]。

模型展示了可用于谐波成像和轻微分布偏移的泛化能力，但实现真正通用的先验还需进一步扩展。当前 U-Net 架构限制了模型的适用域。作者设想采用 Transformer 架构，例如 DiT [41]，将探头类型、空间尺度、频率、带宽、深度、阵元数量、解剖部位等作为条件向量，而非固定在网络结构中，从而扩大泛化范围。

此外，目前模型比线性替代方案慢且昂贵多个数量级，关键瓶颈是把噪声初始化传输到多基地数据所需的 $\Gamma$ 次迭代。未来需研究模型蒸馏以减少步数、网络剪枝或改进传输初始化。用线性 REFoCUS 的结果初始化是一种可能；CovarianceDPS [42] 等更准确的似然估计可减少引导步骤；SeqDiff [43] 等方法有望进一步提升视频应用。

最后，能够产生不确定性图并适配任意发射设计，使本文与认知超声（cognitive ultrasound）框架 [44] 联系起来。寻求信息的智能体可以利用该生成先验，在贝叶斯重建闭环中自适应设计收发序列。近期研究已经展示智能体自动选择心脏超声聚焦发射 [45]、选择欠采样图案 [46]，以及跨帧摊销采样成本 [43] 的能力。不过这些实现均在波束形成、包络或图像域工作，并受限于固定的发射集合。本文为后续智能体缓解了上述限制。

## VII. 结论

本文提出 Deep Bayesian REFoCUS，一种学习超声通道域深度生成先验的方法，可针对各种发射类型条件生成多基地数据并获得后验分布。仿真中该方法总体优于传统线性 REFoCUS 解码器，在活体数据上也得到有前景的结果。它在严重秩亏的反演任务中表现最好，而在反演精确时接近线性解码器的性能。尽管活体测量超出了训练分布，模型仍能将多基地数据结构化，使其足以生成有意义的重建图像。未来可以通过大规模采集活体数据、改进模型架构的泛化能力及加速计算，进一步提升性能。

## 参考文献（原文 46 条，英文书目保留原貌）

[1] G. Montaldo, M. Tanter, J. Bercoff, N. Benech, and M. Fink, “Coherent plane-wave compounding for very high frame rate ultrasonography and transient elastography,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 56, no. 3, pp. 489–506, 2009.

[2] M. Tanter and M. Fink, “Ultrafast imaging in biomedical ultrasound,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 61, no. 1, pp. 102–119, 2014.

[3] C. Papadacci, M. Pernot, M. Couade, M. Fink, and M. Tanter, “Highcontrast ultrafast imaging of the heart,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 61, no. 2, pp. 288–301, 2014.

[4] J. A. Jensen, S. I. Nikolov, K. L. Gammelmark, and M. H. Pedersen, “Synthetic aperture ultrasound imaging,” Ultrasonics, vol. 44, pp. e5– e15, 2006.

[5] N. Bottenus, “Recovery of the complete data set from focused transmit beams,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 65, no. 1, pp. 30–38, 2018.

[6] R. Ali, C. D. Herickhoff, D. Hyun, J. J. Dahl, and N. Bottenus, “Extending retrospective encoding for robust recovery of the multistatic data set,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 67, no. 5, pp. 943–956, 2020.

[7] J. Ho, A. Jain, and P. Abbeel, “Denoising diffusion probabilistic models,” in Advances in Neural Information Processing Systems (NeurIPS), 2020.

[8] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, “Score-based generative modeling through stochastic differential equations,” in International Conference on Learning Representations (ICLR), 2021.

[9] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le, “Flow matching for generative modeling,” in International Conference on Learning Representations (ICLR), 2023.

[10] X. Liu, C. Gong, and Q. Liu, “Flow straight and fast: Learning to generate and transfer data with rectified flow,” in International Conference on Learning Representations (ICLR), 2023.

[11] Y. Song, L. Shen, L. Xing, and S. Ermon, “Solving inverse problems in medical imaging with score-based generative models,” in International Conference on Learning Representations (ICLR), 2022.

[12] B. Kawar, M. Elad, S. Ermon, and J. Song, “Denoising diffusion restoration models,” in Advances in Neural Information Processing Systems (NeurIPS), 2022.

[13] J. Song, A. Vahdat, M. Mardani, and J. Kautz, “Pseudoinverse-guided diffusion models for inverse problems,” in International Conference on Learning Representations (ICLR), 2023.

[14] H. Chung, J. Kim, M. T. McCann, M. L. Klasky, and J. C. Ye, “Diffusion posterior sampling for general noisy inverse problems,” in International Conference on Learning Representations (ICLR), 2023.

[15] M. Karaman, P.-C. Li, and M. O’Donnell, “Synthetic aperture imaging for small scale systems,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 42, no. 3, pp. 429–442, 1995.

[16] M. O’Donnell, “Coded excitation system for improving the penetration of real-time phased-array imaging systems,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 39, no. 3, pp. 341–351, 1992.

[17] T. Misaridis and J. A. Jensen, “Use of modulated excitation signals in medical ultrasound. Part I: Basic concepts and expected benefits,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 52, no. 2, pp. 177–191, 2005.

[18] K. L. Gammelmark and J. A. Jensen, “Multielement synthetic transmit aperture imaging using temporal encoding,” IEEE Transactions on Medical Imaging, vol. 22, no. 4, pp. 552–563, 2003.

[19] M.-H. Bae and M.-K. Jeong, “A study of synthetic-aperture imaging with virtual source elements in B-mode ultrasound imaging systems,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 47, no. 6, pp. 1510–1519, 2000.

[20] S. I. Nikolov and J. A. Jensen, “Virtual ultrasound sources in highresolution ultrasound imaging,” in Proc. SPIE Medical Imaging, vol. 4687, 2002, pp. 395–405.

[21] R. Y. Chiao, L. J. Thomas, and S. D. Silverstein, “Sparse array imaging with spatially-encoded transmits,” in IEEE Ultrasonics Symposium Proceedings, vol. 2, 1997, pp. 1679–1682.

[22] E. Tiran, T. Deffieux, M. Correia, D. Maresca, B.-F. Osmanski et al., “Multiplane wave imaging increases signal-to-noise ratio in ultrafast ultrasound imaging,” Physics in Medicine and Biology, vol. 60, no. 21, pp. 8549–8566, 2015.

[23] S. R. Freeman, P.-C. Li, and M. O’Donnell, “Retrospective dynamic transmit focusing,” Ultrasonic Imaging, vol. 17, no. 3, pp. 173–196, 1995.

[24] J. Liu, Q. He, and J. Luo, “A compressed sensing strategy for synthetic transmit aperture ultrasound imaging,” IEEE Transactions on Medical Imaging, vol. 36, no. 4, pp. 878–891, 2017.

[25] J. Zhang, J. Liu, W. Fan, W. Qiu, and J. Luo, “Partial Hadamard encoded synthetic transmit aperture for high frame rate imaging with minimal 𝑙2norm least squares method,” Physics in Medicine and Biology, vol. 67, no. 10, p. 105002, 2022.

[26] J. Zhang, L. Huang, and J. Luo, “Deep null space learning improves dataset recovery for high frame rate synthetic transmit aperture imaging,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 70, no. 3, pp. 219–236, 2023.

[27] Y. Chen, J. Liu, X. Luo, and J. Luo, “ApodNet: Learning for high frame rate synthetic transmit aperture ultrasound imaging,” IEEE Transactions on Medical Imaging, vol. 40, no. 11, pp. 3190–3204, 2021.

[28] M. S. Albergo and E. Vanden-Eijnden, “Building normalizing flows with stochastic interpolants,” in International Conference on Learning Representations (ICLR), 2023.

[29] G. Duffy et al., “High-throughput precision phenotyping of left ventricular hypertrophy with cardiovascular deep learning,” JAMA Cardiology, vol. 7, no. 4, pp. 386–395, 2022.

[30] T. S. W. Stevens, W. L. van Nierop, B. Luijten, V. van de Schaft, O. Nolan, B. Federici, L. D. van Harten, S. W. Penninga, N. I. P. Schueler, and R. J. G. van Sloun, “zea: A toolbox for cognitive ultrasound imaging,” Journal of Open Source Software, vol. 11, no. 121, p. 9881, 2026.

[31] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin, “Attention is all you need,” in Advances in Neural Information Processing Systems (NeurIPS), 2017.

[32] A. Henry, P. R. Dachapally, S. S. Pawar, and Y. Chen, “Query-key normalization for transformers,” in Findings of the Association for Computational Linguistics: EMNLP, 2020, pp. 4246–4253.

[33] M. Dehghani et al., “Scaling vision transformers to 22 billion parameters,” in International Conference on Machine Learning (ICML), 2023, pp. 7480–7512.

[34] O. Ronneberger, P. Fischer, and T. Brox, “U-net: Convolutional networks for biomedical image segmentation,” in Medical Image Computing and Computer-Assisted Intervention (MICCAI), 2015, pp. 234–241.

[35] K. He, X. Zhang, S. Ren, and J. Sun, “Deep residual learning for image recognition,” in IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 2016, pp. 770–778.

[36] M. Abadi et al., “Tensorflow: A system for large-scale machine learning,” in USENIX Symposium on Operating Systems Design and Implementation (OSDI), 2016, pp. 265–283.

[37] R. E. Daigle, “Ultrasound imaging system with pixel oriented processing,” U.S. Patent 8 287 456 B2, Oct. 2012, Verasonics, Inc., Kirkland, WA, USA.

[38] S. W. Penninga and R. J. G. van Sloun, “Tu/e cardiac plax multi-transmit rf,” OpenH-RF dataset, 2026.

[39] G. Daras, K. Shah, Y. Dagan, A. Gollakota, A. G. Dimakis, and A. Klivans, “Ambient diffusion: Learning clean distributions from corrupted data,” in Advances in Neural Information Processing Systems (NeurIPS), 2023.

[40] S. K. Aithal, P. Maini, Z. C. Lipton, and J. Z. Kolter, “Understanding hallucinations in diffusion models through mode interpolation,” in Advances in Neural Information Processing Systems (NeurIPS), 2024.

[41] W. Peebles and S. Xie, “Scalable diffusion models with transformers,” in IEEE/CVF International Conference on Computer Vision (ICCV), 2023.

[42] N. Yismaw, U. S. Kamilov, and M. S. Asif, “Gaussian is all you need: A unified framework for solving inverse problems via diffusion posterior sampling,” IEEE Transactions on Computational Imaging, vol. 11, pp. 1020–1030, 2025.

[43] T. S. W. Stevens, O. Nolan, J.-L. Robert, and R. J. G. van Sloun, “Sequential posterior sampling with diffusion models,” in IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2025.

[44] R. J. G. van Sloun, “Active inference and deep generative modeling for cognitive ultrasound,” IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, vol. 71, no. 11, pp. 1478–1490, 2024.

[45] W. L. van Nierop, O. Nolan, T. S. W. Stevens, and R. J. G. van Sloun, “Patient-adaptive echocardiography using cognitive ultrasound,” IEEE Transactions on Medical Imaging, vol. 45, no. 7, pp. 4034–4046, 2026.

[46] O. Nolan, T. S. W. Stevens, W. L. van Nierop, and R. J. G. van Sloun, “Active diffusion subsampling,” Transactions on Machine Learning Research, 2025.
