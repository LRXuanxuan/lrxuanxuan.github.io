---
layout: page
title: "RFDT：物理准确的可微射频逆渲染数字孪生｜中文全文译文"
permalink: /papers/translations/2026-10-30-rfdt-inverse-rendering-2603-18026/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原文 arXiv](https://arxiv.org/abs/2603.18026) · [RFDT 项目](https://rfdigitaltwin.github.io/)

# 面向射频数字孪生的物理准确可微逆渲染

**原题：** Physically Accurate Differentiable Inverse Rendering for Radio Frequency Digital Twin  
**作者：** Xingyu Chen、Xinyu Zhang、Kai Zheng、Xinmin Fang、Tzu-Mao Li、Chris Xiaoxuan Lu、Zhengxiong Li。  
**版本：** arXiv:2603.18026v1，2026 年 3 月 5 日，23 页。  
**范围与状态：** 2026-10-30 本轮依据 arXiv:2603.18026v1 补齐：第 5.2/5.3 节优化与实现细节、第 6—8 节评估与应用案例的全部数值、表 1 与图 1—22 逐项转写、英文参考文献 [1]—[92]、附录 A—F 的证明与推导。正文主体与上述补译已覆盖原 PDF 全部章节；仍余逐句逐式终校、图内曲线数值逐点核读以及三处原文疑点复核，因此本页标题保留原标注，不宣称完成全文验收。

## 摘要

数字孪生是物理场景的虚拟仿真副本，正在改变多个行业的系统设计。然而，在射频（radio frequency，RF）系统中，传统 RF 仿真器缺乏可微性，限制了数字孪生的潜力。传播路径的可见性会造成剧烈的不连续，而由于天线近似点源、镜面反射占主导，从计算机图形学借鉴的可微渲染技术不能直接应用于 RF 领域。

本文提出 RFDT，这是一套基于物理的可微射频仿真框架，可通过梯度实现物理世界与虚拟世界之间的双向交互。RFDT 使用具有物理依据的边缘衍射过渡函数解决不连续问题，再利用信号域变换的代理模型减轻傅里叶域处理导致的非凸性。实验表明，RFDT 可以依据真实 RF 测量精确重建数字孪生，还能支持机器学习 RF 感知系统的测试时适应，以及通信系统中受物理约束的优化。作者公布了补充材料及代码：<https://rfdigitaltwin.github.io/>。

**关键词：** 射频仿真、可微射线追踪、数字孪生、可微渲染、6G、信道估计。

## 1. 引言

RF 信号不仅承担通信媒介的角色，还会与物理环境发生丰富的交互。传播与反射中的细微模式能够编码环境信息，推动了微手势检测、生命体征监测、非视距（NLOS）成像等感知应用。无线通信系统也利用多径传播提升可靠性、覆盖与空间复用能力；在毫米波频段，系统表现对环境尤其敏感。

传统 RF 场景建模大致有两条路线：数据驱动的方法可从大数据中学习复杂模式，但往往难以推广到未见环境；基于传播理论与信号处理的模型驱动方法具有更强的泛化基础，却很难把关于物理环境的隐式经验知识纳入模型。

作者提出以构建物理对象的数字孪生（digital twin，DT）为核心的新框架。数字孪生不仅从场景参数模拟 RF 信号（数字到物理），也将观测到的 RF 信号反向用于推断未知场景参数（物理到数字），并通过连续的、梯度驱动的双向闭环交互使二者一致。常规射线追踪给定场景特征作为输入并求解传播模式；RFDT 则解决其逆问题，即根据可观测输出推断未知输入。由于它的核心受物理模型约束，既能减少对标签与专门训练的依赖，也能利用预训练神经模块表示几何类别等先验知识。

这一闭环优化的关键条件是**仿真过程对于场景参数可微**：几何或方向的微小扰动应该使模拟输出平滑且可预测地变化，从而能够计算梯度并更新场景参数。然而，可微计算机图形学通常借助蒙特卡洛路径采样，面光源和漫反射使采样能够覆盖许多有效光路；RF 场景中的天线接近点源，镜面反射严格选择少数路径，随机采样几乎必然错过这些路径。计算机图形学的一些几何求导近似也达不到 RF 波长尺度所需的梯度精度。

RFDT 识别两项主要障碍。

第一，**场景参数变化导致路径可见性不连续**。传统追踪器通过二值检测决定某条反射路径是否存在，场景几何的微小变化就可能使路径突然出现或消失，令幅度、相位与其梯度不连续。作者采用基于等效边缘衍射原理的过渡函数：当镜面反射点接近或跨越物体边缘时，路径贡献连续变化，反射与衍射成分之间平滑过渡。

第二，**波的周期性及信号域变换引起局部非凸性**。RF 波的相位周期性让多个不同路径长度产生相同或近似的观测相位，而 FFT 等处理还会引入旁瓣和局部极小值。直接在这类目标上执行梯度下降，很可能陷入波长尺度的歧义。作者设计变换域的代理模型，特别针对雷达距离谱，使梯度更平滑且计算开销更低。

RFDT 使用优化 C++/CUDA 实现可微射线追踪，提供原生 PyTorch 支持，并设计路径求导和代理信号变换模块。其评估包括车辆、人体姿态和日常物体的三维重建、多目标和 NLOS 场景，以及 RF 感知测试时适应和通信系统优化等案例。

**图 1：** RFDT 用逆射频仿真构造数字孪生。上方展示通过雷达仿真重建三维场景；下方展示用射频场景渲染优化通信系统。物理实体与仿真之间的损失经反向传播作用于形状、姿态、材料、运动、位置和旋转等参数。

## 2. 背景与相关工作

**RF 仿真流水线。** 射线追踪以场景状态 $\theta$ 为输入，描述几何与材料等物理参数。实际场景一般被离散为三角形网格，追踪器搜索满足反射、折射与衍射几何定律的 Tx—Rx 路径。镜面反射常采用镜像源法（method of images），折射遵循 Snell 定律，Fresnel 系数刻画介质边界的幅度衰减和相位变化。

对每条有效传播路径 $i$，仿真输出信道冲激响应（CIR）的时延 $\tau_i$、幅度 $\alpha_i$、相移 $\phi_i$。多径叠加后可转为频谱、空间信号强度等结构化表示。与直接求解 Maxwell 方程的全波电磁仿真不同，射线追踪通常忽略精细物体—电磁波交互与硬件效应，因此不能可靠恢复接收信号的绝对相位；但它可以表达影响多径相长/相消干涉的相对路径相位。

**可微渲染。** 传统计算机图形学可微渲染能从观测图像反推场景几何、材质等属性，经典方法依赖光源和面散射模型上的蒙特卡洛积分。点源与严格镜面路径使这些采样技术在 RF 中失效。现有射频仿真器多关注通信信道，或未能针对几何参数提供物理准确的梯度。

**表 1：相关可微渲染工作的功能比较。** 原论文从工作频段、射线追踪方法、点源、镜面反射、衍射、几何可微性、无偏梯度、雷达以及通信支持度等维度，比较 Direct AD、Edge Sampling、Path Space、Warped Area、MetaWave、Sionna 与 RFDT。作者强调，RFDT 组合了 RF 点源、镜面反射、衍射和针对几何的梯度，同时可面向雷达与通信。该表属于论文作者的比较判断，并非对所有后续软件版本的独立核验。

## 3. RFDT 可微渲染

### 3.1 不连续性挑战

RF 天线尺度通常小于波长，可近似为点源；表面交互又往往呈镜面反射。物理有效的路径只出现在采样方向空间中的零测度集合中，因而随机路径采样很难捕获。与此同时，一旦反射点越过物体三角面片边界，经典追踪器会将原本合法的路径突然删除，导致几何参数到接收场映射的梯度不适定。

原文提出一条命题：**在点光源照明的完美镜面表面上，朴素的蒙特卡洛积分无法正确采到辐射贡献**，因为有效路径由 Dirac delta 型的约束确定，在连续采样域中测度为零。该命题证明见原附录 D.1。

直接将不连续的可见性判定替换为 sigmoid 等光滑函数，虽然容易求导，却可能产生并不存在的反射贡献，破坏物理准确性。RFDT 因此先连续化反射点的几何构造，再用物理衍射规律处理边界贡献。

### 3.2 重新参数化的射线追踪

令发射机与接收机位置分别为 $\mathbf p_{\mathrm{tx}}$、$\mathbf p_{\mathrm{rx}}$。所有传播路径集合为 $\Omega(\mathbf p_{\mathrm{tx}},\mathbf p_{\mathrm{rx}})$，则接收电场为

$$
E(\mathbf p_{\mathrm{rx}})
=\sum_{\mathcal P\in\Omega(\mathbf p_{\mathrm{tx}},\mathbf p_{\mathrm{rx}})}
W(\mathcal P)A_{\mathcal P}e^{-jkL_{\mathcal P}},
\qquad k=\frac{2\pi}{\lambda}.
\tag{1}
$$

$\mathcal P$ 表示经过一系列交互点的传播路径；$W(\mathcal P)$ 是有效性权重，$A_{\mathcal P}$ 为幅度衰减，$L_{\mathcal P}$ 为路径总长度，$k$ 为波数。

为避免蒙特卡洛的零测度问题，作者首先随机发射射线，搜集大致连接 Tx 与 Rx 附近的候选三角形序列；然后用重新参数化的镜像法确定满足镜面反射条件的准确路径。与一般镜像法在碰撞检测失败时直接删除路径不同，RFDT 通过三角面的无界支撑平面，在可见性变化时继续保留候选反射路径。几何变化只重新分配路径能量，而不在路径构造阶段硬性创建或销毁路径。

$$
\mathcal P(\mathbf p_{\mathrm{tx}},\mathbf p_{\mathrm{rx}}
\mid\triangle_1,\ldots,\triangle_m)
=T_{\mathrm{path}}(\mathbf p_{\mathrm{tx}},\mathbf p_{\mathrm{rx}},
\{S(\triangle_i)\}_{i=1}^m).
\tag{2}
$$

其中 $S(\triangle)$ 是三角形的无限支撑平面，$T_{\mathrm{path}}$ 为确定性的镜像源几何构造。该表示中的反射点、路径长度、衰减和相位可以对顶点坐标求导。剩余的不连续性被集中到权重函数 $W$。

### 3.3 通过边缘衍射实现物理一致求导

传统面片判定使用重心坐标条件 $u\ge0$、$w\ge0$、$u+w\le1$，并把每次交点合法性连乘为二值权重。改用 sigmoid 近似虽然光滑，却可能使面片外的路径具有虚假贡献，并且平滑程度难以同时满足精度与稳定性。

RFDT 转而使用两个相邻面构成的楔形边缘，把镜面反射点逼近楔边时的极限与等效衍射点联系起来。该机制针对两种可见性问题：**主可见性**涉及反射点是否位于面片内部；**次可见性**涉及反射段是否遭其他物体遮挡。对于边界处的反射—衍射能量转移，采用一致性衍射理论（uniform theory of diffraction，UTD）的过渡函数

$$
F(x)=2j\sqrt{x}e^{jx}
\int_{\sqrt{x}}^\infty e^{-j\tau^2}\,d\tau .
\tag{8}
$$

这里 $x=kL_a$，$L_a$ 表示与楔边有关的有效距离。该函数可由复 Fresnel 积分计算；当 $x\to\infty$ 时 $F(x)\to1$，远离边界可恢复反射贡献；当 $x\to0$ 时 $F(x)\to0$，镜面贡献连续衰减，允许衍射主导。作者认为这同时保留了场的连续性和能量守恒，而不依赖经验式 sigmoid 平滑。

对于次可见性，RFDT 用基于层次包围盒（BVH）的遮挡测试寻找阻挡轮廓边，并引入其衍射路径。对于一条镜面反射路径，有

$$
E_{\mathrm{total}}
=w(\gamma)E^{\mathrm{spec}}_a+E_{\mathrm{diffract}},
\qquad w(\gamma)=F(kL_a).
\tag{9}
$$

$\gamma$ 为路径到障碍轮廓的有符号净空。当净空逼近零时，镜面反射项不再瞬间消失，而是平滑过渡到包含衍射的场。

对由若干网格顶点 $\mathbf v$ 决定的场，有

$$
\frac{\partial E(\mathbf p_{\mathrm{rx}})}{\partial\mathbf v}
=\sum_{\mathcal P\in\Omega}
\frac{\partial}{\partial\mathbf v}
\left(W(\mathcal P)A_{\mathcal P}e^{-jkL_{\mathcal P}}\right).
\tag{10}
$$

RFDT 用各次路径交互的物理过渡权重相乘构造 $W_{\mathrm{RFDT}}$。在单条路径上，

$$
\frac{\partial E_{\mathcal P}}{\partial\mathbf v}
=\left(
\frac{\partial A_{\mathcal P}}{\partial\mathbf v}
-jkA_{\mathcal P}\frac{\partial L_{\mathcal P}}{\partial\mathbf v}
\right)e^{-jkL_{\mathcal P}}.
\tag{17}
$$

这是幅度变化与相位路径长度变化共同贡献的梯度。完整的权重求导在式（11）—（17）与本节补译中给出，UTD 系数式（7）已在下文逐项转录，附录 D 的三项证明也已补入本页附录 D。

## 4. 信号域变换的代理模型

射频系统通常从调制信号推断距离与角度。由于电磁波相位有 $2\pi$ 周期，不同传播路径长度可能对应相同相位；不同多径又可能相消，产生接收功率的急剧低谷。宽带 FMCW 或 OFDM 通过多频信号减轻相位模糊，但有限带宽、有限采样和 Fourier 旁瓣仍会造成局部极小值。

在几何与材质的梯度优化中，这些伪极小值会产生错误的下降方向。高分辨谱估计（如 MUSIC）虽然能抑制旁瓣，但涉及样本协方差特征值分解，其梯度方差过高，不适合直接嵌入稳定的端到端优化。

作者设计信号变换代理：在初始阶段，以较平滑的距离谱近似提供梯度；随后逐渐退火到传统信号域变换，减少初始局部极小值和最终估计偏差。代理谱由路径 CIR 和 Dirichlet 型核合成，能解析求取对各路径时延与增益的导数。相应主公式见原式（18）—（22）。

**图 4：** 上方为常规 FFT 信号变换具有旁瓣和局部极小值的起伏损失面，下方为代理模型与逐步退火带来的平滑优化路径。**图 5** 展示 RFDT 的前向仿真与反向传播流水线。

## 5. RFDT 系统集成

### 5.1 数字孪生参数化

数字孪生由灵活的参数集合 $\Theta$ 表示，包括网格或体素等几何描述、平移/旋转/缩放等刚体变换、反射系数和介电常数等材料参数、雷达配置及其他下游任务特有变量。

作者提出两种与神经网络结合的路线。**替代神经表示：** 与抽象的神经网络权重不同，DT 的每个可学习参数均具有明确物理含义，模拟网络中的矩阵运算可由射线追踪或波传播算子替代，从而用少量真实测量对场景进行标定，缩小仿真—现实差距。**增强神经网络：** DT 作为可微物理模块提供自监督的一致性约束，也能嵌入前向网络，用可学习的物理参数从观测推断场景状态。图 6 和图 7 分别展示这两类思路。

### 5.2 优化与实现

在所有可微组成部分之上，RFDT 以观测与仿真间的误差为目标，通过反向传播更新场景参数。实现使用 C++/CUDA 和 PyTorch 接口，借助 NVIDIA OptiX 射线追踪 RT Core、BVH 加速结构，以及 Dr.JIT 在运行时生成自动微分函数。对 $M$ 条射线、$N$ 个三角形，文中给出的射线追踪复杂度近似为 $O(M\log N)$；动态场景利用路径速度投影计算多普勒，并对涉及运动物体的 BVH 局部区域重拟合，而非每次全量重建。

## 6. 评估

论文首先评估**前向电场与梯度的物理准确性**。图 8 显示电场实部及相对于场景参数的梯度；图 9 评估对几何参数求导的结果。进一步以真实雷达信号重建车辆、人体姿态和日常物体，图 10 给出数字孪生迭代收敛过程，图 11 展示人体姿态和未知物体的重建，图 12 检验不同类别先验知识粒度的影响。

作者进一步研究遮挡环境与多目标重建：在塑料板、纸板、泡沫板遮挡的 NLOS 场景以及同时存在多个目标的场景下比较重建精度。图 15 展示不同遮挡物与视野内目标数量的影响。图 16 分析材质类别及代理模型；作者报告，在人体重建示例中，没有代理模型时优化可能需要超过 200 轮才能稳定，而采用代理模型可在前约 50 轮收敛，显示出约 4 倍的收敛加速。这是论文所报告的特定场景结果，并非对所有任务的保证。

**室内无线电地图实验：** 在包含水泥墙、金属椅及木桌等材料的室内环境中，以华硕 RT-AC86U（802.11ac）路由器为 2.4 GHz 接入点，使用 iPhone 14 Pro 收集接收信号强度。TurtleBot 在约 700 平方英尺区域采集约 300 个测量样本。环境几何由 PolyCam 重建，材料参数参考 ITU-R P.2040 手工指定。作者在相同测量位置比较 RFDT 和 Sionna 的模拟 RSS。**图 13** 给出真实环境和两种仿真无线电地图；**图 14** 给出重建误差和迭代历史；**图 17** 给出射线数量、网格规模等开销与误差关系。

## 7. 应用案例

### 7.1 案例 I：数据驱动 RF 感知的测试时适应

RF 感知神经网络往往随测试环境变化出现域偏移。常见测试时适应依赖伪标签，但当测试域与训练域差距较大时，伪标签本身可能不可靠。RFDT 用环境和波传播共同服从的物理定律提供适应目标：在人体姿态识别示例中，已有 DNN 先输出姿态参数，将它们送入数字孪生仿真，再比较仿真雷达观测与实际雷达信号，通过物理一致性损失改进适应，而无需新场景的真实姿态标签。

### 7.2 案例 II：通信系统的物理约束优化

传统反射超表面（metasurface，MS）部署搜索需要遍历候选位置、方向及结构；不可微仿真使梯度无关搜索的代价很高。RFDT 则能对 MS 的平移、转动甚至形变计算信号强度梯度，以梯度优化提高目标区域覆盖。

论文采用与 AutoMS 相似的实验条件：在约 50 平方米走廊中放置 60 GHz 802.11ad 接入点；固定设计的超表面具有 45° 方位反射角与 15° 俯仰反射角，包含约 10,000 个单元，尺寸为 13 × 13 平方厘米。优化空间包括沿墙体平移 ±3 m 和旋转 ±30°。图 18 展示场景、覆盖图及相对于超表面位移的覆盖梯度；图 19 比较 RSS 预测及动态场景结果。作者报告，对比仅调材料参数的 AutoMS，联合几何和材料标定能够降低接收功率误差。

## 3.3 节补译：边缘过渡、二次可见性及导数

原文首先比较三类楔边处理：传统几何光学使用二值 Heaviside 可见性函数，光滑三角面片使用 sigmoid 近似，而 RFDT 试图用一致性衍射理论（UTD）的边缘过渡函数同时保障场连续性与物理一致性。

对于一条路径上某次镜面交互，传统判定要求反射点位于三角形内部。令重心坐标为 $(u,w)$，则

$
\mathbf p\in\triangle(\mathbf v_0,\mathbf v_1,\mathbf v_2)
\iff (u\ge0)\land(w\ge0)\land(u+w\le1).\tag{3}
$

对所有 $m$ 次反射接触执行二值判断，即得到路径权重 $W(\mathcal P)$（式（3））。这一函数在反射点跨过边界时突然从 1 变为 0；使用 $\sigma(ku)$、$\sigma(kw)$ 和 $\sigma(k(1-u-w))$ 组成的光滑面片函数（式（4））虽可求导，却会为三角面片外的虚假路径分配非零权重；小 $k$ 使几何过度光滑，大 $k$ 又导致不稳定梯度。原文式（4）的软化面片与软化权重为

$
\begin{aligned}
\mathbf p\in\operatorname{soft}\triangle(\mathbf v_0,\mathbf v_1,\mathbf v_2)
&\triangleq\min\left(\sigma(ku),\ \sigma(kw),\ \sigma(k(1-u-w))\right),\\
W_{\mathrm{soft}}(\mathcal P)
&\triangleq\prod_{i=1}^{m}\left(\mathbf p_{\mathrm{ref}}^{(i)}\in\operatorname{soft}\triangle_i\right).
\end{aligned}\tag{4}
$

**边缘衍射点与反射路径极限。** 令两个三角面 $\triangle_a$、$\triangle_b$ 在边 $E$ 处构成楔形。对满足反射定律的镜面路径，当反射点逼近边缘时，存在位于 $E$ 的唯一极限点 $\mathbf p^\star$，其入射和出射方向在相邻面上的反射角于极限意义下相等（原文式（5））。这个极限点与 UTD 的边缘衍射点相对应。作者借此论证：应由衍射过渡而非任意 sigmoid 处理镜面路径的连续消失。原文式（5）的极限条件为

$
\lim_{\epsilon\to0}\angle\left(\mathbf p_{\mathrm{tx}}-\mathbf p^{\star}_{\epsilon},\ \mathbf p_1\right)
=\lim_{\epsilon\to0}\angle\left(\mathbf p_{\mathrm{rx}}-\mathbf p^{\star}_{\epsilon},\ \mathbf p_2\right),\tag{5}
$

其中 $\mathbf p^{\star}_{\epsilon}$ 表示从相邻面内部逼近楔边的点，$\mathbf n_1$、$\mathbf n_2$ 为两个面的法向。

原文对衍射场的描述为

$
E_{\mathrm{diffract}}(L)
=E_i(\mathbf p_d)\,D_{\mathrm{diffract}}\,A(L)e^{-jkL},
\qquad A(L)=L^{-1/2}.\tag{6}
$

其中 $E_i$ 是衍射点入射电场，$D_{\mathrm{diffract}}$ 为楔边衍射系数，$k=2\pi/\lambda$，$L$ 为衍射点到观察点的传播长度。原文式（7）采用 UTD 楔边系数，由四个余切—过渡函数项组成，楔形尖锐度 $n=\pi/\alpha$（$\alpha$ 为楔的内角），$\phi,\phi'$ 分别为观察与入射角，参数 $L_{a\pm}$、$L_{b\pm}$ 为有效路径距离。该长式按原图逐项转录为

$
D_{\mathrm{diffract}}
=-\frac{e^{-j\pi/4}}{2n\sqrt{2\pi k}}
\left[
\cot\left(\frac{\pi-(\phi\mp\phi')}{2n}\right)F\left(kL_{a\mp}\right)
+\cot\left(\frac{\pi+(\phi\mp\phi')}{2n}\right)F\left(kL_{b\mp}\right)
\right],
\tag{7}
$

其中 $\mp$ 记号紧凑表示四个余切—过渡函数项，覆盖 $(L_{a-},L_{a+})$ 与 $(L_{b-},L_{b+})$ 两组组合，不应随意省略。

过渡函数采用式（8），$x=kL_a$。其 Fresnel 积分给出两类极限：$x\to\infty$ 时 $F(x)\to1$，恢复镜面反射；$x\to0$ 时 $F(x)\to0$，压低几何奇异项，使衍射成分主导，避免边缘处场强出现不连续。RFDT 将这一机制推广到传播路径中的多次交互，通过

$
W_{\mathrm{RFDT}}(\mathcal P)
=\prod_{i=1}^{m}F(kL_a(\alpha_i)) \tag{11}
$

将每个交互处的边缘过渡相乘。这里原文对几何角 $\alpha$ 的使用与式（7）的楔角记号不同，需要参照原稿几何图理解。

**主可见性与次可见性的区别。** 主可见性判定的是各镜面点是否落在其三角面范围内；次可见性判定的是一个原本合法的镜面反射段是否又遭到其他障碍物遮挡。RFDT 首先由候选路径搜索保留镜面路径；随后利用 BVH 遮挡测试寻找沿段的障碍物及其轮廓边，以此建立新的边缘衍射路径。

对于某传播段与轮廓边的有符号净空 $\gamma$，传统模型是 $E^{\mathrm{GO}}=H(\gamma)E_a^{\mathrm{spec}}$，因此在 $\gamma=0$ 不连续。RFDT 改用 $w(\gamma)=F(kL_a)$ 逐渐衰减镜面场，并添加经过衍射点的场：

$
E_{\mathrm{total}}
=w(\gamma)E_a^{\mathrm{spec}}+E_{\mathrm{diffract}}.\tag{9}
$

从两个楔面看，传统方法为

$
E^E_{\mathrm{dire}}=H(\alpha(\mathbf v_0,\mathbf v_1))E_a+H(-\alpha(\mathbf v_0,\mathbf v_1))E_b,\tag{12}
$

sigmoid 近似为

$
E^E_{\mathrm{soft}}=\sigma(\triangle_a)E_a+\sigma(\triangle_b)E_b,\tag{13}
$

RFDT 使用

$
E^E_{\mathrm{RFDT}}=F(x_a)E_a+F(x_b)E_b,\tag{14}
$

其中 $x_a=kL_aa_a$、$x_b=kL_ab_a$，系数 $a_a,a_b$ 为反射/边缘角距离的归一化几何因子。

对顶点 $\mathbf v$ 求导时，乘积法则给出

$
\begin{aligned}
\frac{\partial E^E}{\partial\mathbf v}
={}&\frac{\partial F(x_a)}{\partial\mathbf v}E_a+
F(x_a)\frac{\partial E_a}{\partial\mathbf v}\\
&+\frac{\partial F(x_b)}{\partial\mathbf v}E_b+
F(x_b)\frac{\partial E_b}{\partial\mathbf v}.
\end{aligned}\tag{15}
$

而

$
\frac{\partial F(x)}{\partial\mathbf v}
=F'(x)\frac{\partial x}{\partial\mathbf v}
=F'(x)\frac{\partial(kL_a)}{\partial\mathbf v}.\tag{16}
$

几何导数由重新参数化镜像法中的矢量加法、点积和叉积等连续操作经自动微分计算，因此可以反向传播至三角形顶点坐标。每条路径的幅度与相位求导共同构成式（17）。

## 4 节补译：Dirichlet 核代理与退火优化

RF 系统的距离、角度估计会受到周期相位和多径相消造成的局部非凸性影响。即使采用 FMCW 或 OFDM 等宽带波形将时延分辨到 Fourier 域，有限带宽和采样点仍导致分辨率不足与旁瓣。MUSIC 等子空间高分辨谱方法虽然可降低旁瓣，却需要样本协方差特征分解，其梯度方差可能过高，不适合直接用于场景几何的稳定优化。

RFDT 不使用任意的高斯平滑，而是利用有限长度正弦信号在矩形窗下 FFT 谱的 Dirichlet 核结构，构造路径级代理响应：

$
R(f)_s=\sum_i G_i(\tau_i,f)\,\alpha_i.\tag{18}
$

其核函数写为

$
G_i(\tau_i,f)=
\left[\frac{\sin(N\pi r_i/2)}{N\sin(\pi r_i/2)}\right]^2,
\qquad
r_i=\frac{\tau_i-D(f)}{\sigma},\tag{19}
$

其中 $D(f)$ 将频率 bin 映射为时延，$N$ 为 FFT 点数，$\sigma$ 控制频率分辨率；当 $r_i\to0$ 时将 $G_i$ 定义为 1。由于单个多径可视作有限窗中的正弦分量，这个核同时保留主瓣与旁瓣的物理结构。

在优化初期，代理响应暂时忽略各路径相位 $\phi_i$，降低相位周期性导致的局部极小值，以短期偏差换取较稳定的下降方向。随后，随迭代次数 $t$ 增大，以单调的 $\lambda(t)\in[0,1]$ 从代理谱逐渐过渡到精确 FFT 谱：

$
R(f)=\lambda(t)R_{\mathrm{FFT}}(f)+(1-\lambda(t))R(f)_s.
\tag{20}
$

作者将其称为由粗到细的代理优化。需要注意，在退火终点使用精确 FFT 不等于保证非凸优化全局收敛，只意味着最终代价不再持续包含代理的初始平滑偏差。

原文式（21）列出如下解析时延导数（保留原文印刷形式）：

$
\frac{\partial G_i}{\partial\tau_i}
=\frac{2G_i}{\sigma}\frac{\pi}{2}
\left[
\frac{N\cos(N\pi r_i/2)}{\sin(\pi r_i/2)}
-\frac{\cos(\pi r_i/2)\sin(N\pi r_i/2)}{\sin^2(\pi r_i/2)}
\right].\tag{21}
$

该式采用原文排印记号；鉴于式（19）以**平方**定义 $G_i$，式（21）右侧带 $2G_i$ 的写法与直接对平方比值求导的结果可能存在额外因子差异，复现前应核对作者实现。作者随后在式（22）给出

$
\frac{\partial R(f)_s}{\partial\tau_i}
=\frac{\partial G_i}{\partial\tau_i}\alpha_i,\qquad
\frac{\partial R(f)_s}{\partial\alpha_i}=G_i.\tag{22}
$

这些导数结合式（15）—（17）构成从射频距离谱到场景物理参数的端到端梯度路径。对照原 PDF 第 8 页，式（21）已在上文逐项转录完成（含 $N$、$r_i$、$\sigma$ 与两类三角函数项）；上文对该式前置 $2G_i$ 因子的疑点仍保留为待核对项，不改动原式。

## 5 节补译：优化闭环

在可微 RF 追踪和谱域代理均就绪后，数字孪生参数可通过迭代最小化仿真输出与真实 RF 观测的偏差：

$
\boldsymbol\theta^\star
=\arg\min_{\boldsymbol\theta}
\mathcal L(\operatorname{RFDT}(\boldsymbol\theta),\mathbf y).
\tag{23}
$

其中 $\boldsymbol\theta$ 表征几何、姿态、材料、运动与传感器配置，$\mathbf y$ 为观测。原文图 5 展示从场景初值开始模拟传播、计算损失、反向传播并更新参数的闭环。图 6 显示数字孪生代替隐式神经表示；图 7 显示数字孪生作为可训练物理模块增强神经网络。

**5.2 节优化目标与正则项。** 式（23）中 $\mathcal L(\cdot,\cdot)$ 为损失函数；$\mathbf y$ 是所有可用测量堆叠成的向量，其维数取决于联合优化中使用的观测数量，既可以是真实测量的射频数据，也可以是任务定义的目标分布。作者采用多尺度 MSE 损失，以在不同分辨率上刻画频谱结构，缓解射频频谱的稀疏性。为求解该问题，原文使用带 Laplacian 正则的 Adam 优化器：

$$
\boldsymbol\theta_{t+1}
\leftarrow\mathrm{Adam}\left(
\boldsymbol\theta_t,\ 
\nabla_{\boldsymbol\theta}\mathcal L\big(S(\boldsymbol\theta),\mathbf y\big)
+\beta\mathbf L\boldsymbol\theta
\right).\tag{24}
$$

其中 $\mathbf L\in\mathbb R^{n\times n}$ 是稀疏、对称正定的 Laplacian 矩阵，用于离散 Dirichlet 能量 [75]；$\beta$ 控制正则强度。该项的作用是避免对带噪梯度过拟合，并鼓励参数平滑更新。使用正则化 Adam 时，作者按批次采样部分射频信号、计算偏差梯度并更新数字孪生参数；收敛后，射频仿真输出应接近观测信号，同时得到物理场景的准确参数化数字孪生 $\boldsymbol\theta^\star$。

**5.3 节软件实现。** RFDT 是从零实现的完整系统，约 34,000 行优化过的 Python、C++ 与 CUDA 代码，并非在已有框架（如 Sionna）上改动；它在通信与感知任务上都取得更高效率，并专门针对动态场景以及单站、双站雷达配置设计。射线追踪借助 NVIDIA OptiX [64] 在 RT Core [61] 上做硬件加速，使用层次包围盒（BVH）[78] 作为加速结构，使 $M$ 条射线、$N$ 个三角形时的复杂度降为 $O(M\log N)$。多普勒与场景动态通过把速度投影到射线方向来计算各路径的频移，并只对与运动物体相关的 BVH 区域做选择性重拟合（见附录 E.3），从而避免运动场景下全量重建 BVH 的开销。

数字孪生优化把前向仿真器作为可微算子直接嵌入。求导主要由 Dr.JIT [31] 负责，它在运行时生成反向函数。不过，自动生成的函数未必最优 [9]，会产生很大的计算图，成为反向传播的瓶颈；因此作者对路径求导与代理模型手工实现了自定义反向传播，以提高效率。

> **原文疑点：** 第 5.3 节说明手写反向传播时写作 "path differentiation (Sec. 3.3) and the surrogate model (Sec. 3.3)"，两个交叉引用编号相同；按正文结构，代理模型位于第 4 节，疑为 "Sec. 4" 之误。本页按上下文理解并加注，不改变原文章节编号。

## 6 节补译：评估设置、数值与开销

### 6.1 可微性验证

作者首先评估 RFDT 在梯度估计上的有效性。图 8 是受控实验：经典双缝干涉场景，载频 5 GHz；波长较长使相位变化在可视化中更易解释，但方法本身适用于很宽的载频范围。目标参数 $\theta$ 控制发射源沿竖直方向的平移；作者把 $\theta$ 的切向值设为 1，并用 PyTorch 前向模式自动微分 [67] 分别对基线方法与 RFDT 计算梯度。

**真值。** 采用有限差分（FD）作为真值，遵循可微渲染与仿真中的常见做法 [41, 43, 53]。FD 用 $\frac{\partial f}{\partial x}\approx\frac{f(x+\epsilon)-f(x)}{\epsilon}$ 估计梯度，其中施加小扰动 $\epsilon$。FD 虽准确，但一次只能算一个梯度分量，对需要同时更新上千个参数的高维问题不实用，因此通常只用于小规模受控仿真环境。

**基线。** 与三种替代设计比较：（i）把计算机图形学中的路径空间可微渲染（PSDR）[88] 适配到射频仿真（作者使用其 RF 版本 [12]）；（ii）软化三角面片方法（式（4））；（iii）NVIDIA Sionna 仿真器。投稿时 Sionna 有两个版本：v1.10（无衍射）与 v0.19（含衍射）；实验用 v0.19，v1.10 的结果放在附录 C.4。所有方法都在其仿真场分布与 FD 真值之间计算结构相似度（SSIM）与峰值信噪比（PSNR）。注意 SSIM 侧重结构保真，PSNR 对幅度精度敏感，因此衍射不完善的基线可能因空间布局正确而得到较高 SSIM，却因相位与幅度偏差使 PSNR 偏低。

**结果。** 由图 8：PSDR 的 SSIM 为 0.8534、PSNR 为 17.09 dB，但这只是因为它在假定所有材料都有小的非零粗糙度而非严格镜面，从而绕开零测度的镜面路径（第 3.1 节），把注意力全放在散射效应上；这样做平滑了角度不连续，却扭曲了相位精度，图 8(h) 中噪声化、被扰动的梯度即为例证。Sionna 的梯度不适定，因为它对几何场景参数不可微；其无线覆盖前向仿真（图 8(a)）不考虑复值相干干涉，而采用简化的非相干功率求和（附录 C.4），仿真结果不准确。软化三角面片方法的 SSIM 为 0.8785、PSNR 为 21.60 dB，但其几何层面的近似无法重现锐利边缘，并存在能量泄漏。RFDT 的结果与真值几乎一致：SSIM 0.9908，PSNR 35.94 dB。

图 9 进一步评估 RFDT 对几何参数的梯度：对物体位置、旋转与发射机位置，RFDT 均给出与真值几乎一致的结果（位置：SSIM 0.9994、PSNR 53.15 dB；旋转：SSIM 0.9940、PSNR 36.65 dB；发射机：SSIM 0.9997、PSNR 63.09 dB）。

### 6.2 数字孪生重建的收敛性与精度

作者用 60 GHz Vayyar TrigB 成像雷达 [4]（20T×20R MIMO 天线 [1]）采集的真实信号评估三维重建；雷达与 Intel RealSense D455 RGBD 相机 [2] 共位，由后者提供真值三维形状（附录 C.1）。此外使用文献 [46] 的雷达信号数据集：77 GHz TI MMWCAS（Cascade）雷达（12T×16R MIMO 天线），前方放置多种三维物体。默认把场景几何初始化为球体、材料设为金属（按 ITU 数据库 [28]），随后按第 5.2 节联合优化几何与材料属性。

图 10 给出桌面物体与汽车的重建过程快照，图 11 展示人体与汽车的重建结果。重建汽车的中位误差为 15.4 cm、MAE 为 16.7 cm；重建金属剪刀与金属字母的中位误差为 1.7 cm、MAE 为 2.4 cm。各类物体的顶点误差分布见图 14(a)。这些结果表明 RFDT 通过正确处理几何求导，能以较低顶点误差重建目标的形状与位姿；相比之下 Sionna 产生的网格破损，顶点误差与方差都很大。图 14(b) 给出逐轮损失：RFDT 在 300 轮内收敛，在单块 NVIDIA A6000 GPU 上总耗时仅 3.5 分钟；Sionna 未能收敛（图 11 的两个例子同样如此），根源在于它无法在几何边界处捕获梯度，梯度被破坏，优化过程发散，重建结果随机、破损。

**先验知识的影响。** 按第 5.2 节给 RFDT 嵌入三个层级的知识以辅助汽车重建："Small Car"（嵌入 ShapeNet 中轿车、SUV、MPV、掀背车与旅行车的三维模型）；"Vehicles"（嵌入汽车、公交、卡车、火车与摩托车）；"Road Objects"（嵌入各类车辆、路牌、长椅与垃圾桶）。图 12 右侧表明，即使是较粗的知识（"vehicles"）也能加快收敛、提升精度；图 12 的结果进一步显示，一般而言知识粒度越细收益越明显，说明 RFDT 能有效整合预训练神经模型中的隐式知识。

**NLOS 场景重建。** 作者用三类遮挡物评估非视距（NLOS）条件：塑料板（0.7 cm 厚）、纸板（0.3 cm 厚）与泡沫板（2 cm 厚）。目标物体（不同姿态的汽车与人体）的反射信号被遮挡物进一步衰减与散射，结果见图 15(a)。即使没有关于遮挡与物体的先验知识，由于直视（LoS）路径占主导，重建仍能保留大致形状与姿态（人体姿态 SSIM 高于 0.74，物体形状 SSIM 高于 0.75）。值得注意的是，RFDT 的重建性能可与甚至超过先进数据驱动方法（如 80%—90% 的形状相似度 [50, 79, 86]、30 cm 深度误差与 30—50 cm 尺寸误差 [23]），而这些工作依赖更大的孔径（如 SAR）或更短的感知距离；RFDT 不限于特定雷达硬件或物体类别，也不需要训练数据，还能与数据驱动模型结合以增强其泛化（第 7.1 节）。

**多目标场景。** RFDT 可以从单一的球体统一初始化重建复杂多目标场景，且无需预先知道物体数量。作者用与上面相同的硬件评估包含 1—5 个物体（人体、车辆、家具等）的多种场景；物体随机摆放，在雷达视场内至少相隔 5°。图 15(b) 显示：单目标场景保真度高（SSIM > 0.8，MSE ≈ 0.2 m），随物体增多性能逐渐下降（5 个物体时 SSIM 降至约 0.5，MSE 升至约 0.4 m）。这一趋势反映了拥挤场景中更强的多径干扰与回波重叠，但重建质量仍属可接受。作者还做了压力测试：单个静态雷达视角下，物体超过 6 个后雷达空间分辨率成为瓶颈，偶尔漏掉较小物体；而从多个雷达视角联合优化（6 个雷达位置环绕布置）时，即使物体超过 10 个也未观察到明显退化。多视角观测提供互补约束，缓解多径模糊与反射重叠，使 RFDT 能扩展到密集多目标环境。

**材料的影响。** 图 16(a) 报告金属、人体、室内物体与介质等代表性材料类别的重建误差。所有类别都达到较高相似度（SSIM > 0.75）；金属表面因其反射更具确定性而精度最好，人体与杂乱的室内环境稍难。值得注意的是类别间差异在 0.1 以内，说明 RFDT 无需按材料调参即可在多种材料上泛化。

**代理模型的有效性。** 图 16(b) 给出重建人体时的损失。没有信号域变换代理（第 4 节）时，优化很快陷入振荡，需要 200 多轮才稳定；采用代理后损失持续下降并在前 50 轮内收敛。这说明代理显著加快收敛（约 4 倍）并提升稳定性，这对把系统扩展到更大、更复杂的场景很关键。

**复杂环境中的性能。** 作者在材料多样的复杂室内环境（混凝土墙、金属椅、木桌）中比较 RFDT 与 Sionna 的无线电地图估计。真值 RSS 用华硕 RT-AC86U 路由器（802.11ac，2.4 GHz）作接入点、iPhone 14 Pro 作接收端采集；为保证空间采样一致，用 TurtleBot [6] 遍历环境，在约 700 ft² 区域内采集约 300 个样本（约 0.428 个/ft²）。环境三维几何用 PolyCam [66] 重建，材料参数按 ITU-R P.2040 数据库 [28] 手工指定；环境几何与无线电地图见图 13。

作者在完全相同的测量点上比较两种仿真器与真值 RSS，指标包括中位误差 [54]、均方根误差（RMSE）与误差标准差（SD）。RFDT 的中位误差 5.2 dB、RMSE 8.46 dB（SD 6.67 dB）；Sionna 的中位误差更大，为 7.7 dB，RMSE 也高得多，为 14.28 dB（SD 12.03 dB）。作者观察到 Sionna 存在大的误差尖峰，尤其在阴影边界与深阴影区（图 13 可视化）；原因是其非相干求和忽略了 UTD 边界处物理连续性所需的相位干涉，产生人为不连续。RFDT 则建模相位相干，给出平滑的 RSS 过渡，在这些复杂边界处表现稳健。

计算效率方面，RFDT 完成前向仿真用时 0.739 s；Sionna v0.19 需 3.235 s，优化后的 Sionna v1.10 需 1.22 s。显存方面，由于底层框架异构（TensorFlow、Dr.JIT、PyTorch 与原生 CUDA），精确的等条件对比困难；但通过监测 10 次独立运行的总 GPU 显存占用，作者观察到 RFDT 的显存消耗与 Sionna v1.10 相当，而 Sionna v0.19 消耗约两倍的 GPU 资源。值得注意的是，RFDT 是在执行完整相位相干计算（Complex64 运算）的前提下达到这一效率的，而 Sionna 主要使用 float32。

### 6.3 计算开销

RFDT 的开销取决于场景复杂度、参数数量以及反向传播所用计算图的规模。前向仿真实现（第 5.3 节）很高效，即使在上述多目标场景中，在 NVIDIA A6000 GPU 上每帧约 0.01 s。主要瓶颈在反向传播，根源是自动微分（AD）：编译器必须跟踪前向过程中的所有变量与运算，然后执行相应的反向运算（有 $P$ 个参数、$M$ 条射线、$N$ 个三角形时为 $O(P\cdot M\log N)$）。该 AD 步骤耗时 0.05—0.2 s，取决于参数数量。另一项显著开销是形状更新，约 0.03 s（$N_v$ 为网格顶点数，复杂度 $O(N_v)$），并且可能需要额外的校验步骤以确保物理正确、防止网格破损。总迭代次数依任务而定：例如人体姿态估计通常约 50 轮，而三维重建因数字孪生场景参数更多，可能需要约 300 轮。作者预计，随着现代 GPU 中 RT Core 数量增加与 AD 编译器更高效，还有进一步改进空间。

图 17(a) 用实验验证了随 $M$ 条射线与 $N$ 个三角形的渐近标度：$M$ 增大时误差收敛需要更多射线，但总体趋势相对 $N$ 仍是次线性的。例如 10k 三角形的场景约需 5k 条射线使误差收敛，50k 三角形约需 10k 条，100k 三角形约需 15k 条。实践中典型单目标场景（如汽车或人体）约有 $10^4$ 至 $5\times10^4$ 个三角形，多目标室内场景可达 $10^5$ 至 $10^6$ 个三角形。这印证了理论复杂度，也说明场景复杂度（$N$）与射线采样预算（$M$）之间的权衡。

## 7 节补译：应用案例的实现与结果

### 7.1 案例 I：数据驱动 RF 感知的测试时适应（细节）

**背景与动机。** 由于射频信号对多径环境敏感，机器学习射频感知模型的泛化长期受到关注。测试时适应（TTA）是提升模型泛化的一类方法 [47]；例如无源域适应 [18] 可以给无标签样本分配伪标签，从而在未见测试情形下实现 TTA。但伪标签仍依赖训练数据的知识，遇到明显域偏移时效果不佳。

**RFDT 增强泛化。** RFDT 可用于让已有感知模型适应未见测试情形，从而提升泛化。虽然目标场景可能与训练场地差异很大，但支配射频信号的物理定律是一致的；RFDT 可以把这一物理知识嵌入仿真与优化，有效引导 TTA。以人体姿态识别为例（按图 7 的 PINN 模型架构）：给定人体反射的无标签雷达信号，已有 DNN 先输出一组描述姿态的物理参数，这些参数用于生成受试者的网格数字孪生表示，再送入 RFDT 仿真相应射频信号；以仿真射频与原始输入射频之间的误差为损失，让梯度反传并更新模型参数直到收敛。

**实验设置与结果。** 作者采用先进 DNN 人体姿态识别模型 mmMesh [86]，用在室外环境中由一名身高 180 cm、体型中等的男性参与者采集的基本正向姿态（T-pose、A-pose、投降姿态）训练。按图 7 实现 TTA 模型，用单个未标注测试样本精调骨干 DNN（即 mmMesh [86]）。作为额外基线，作者还使用开源生成式数据合成方法 RFGen [16] 来多样化 mmMesh 的训练数据。评估在另一名受试者（女性，160 cm）与另一组姿态（弯腰、行走等侧视图）上进行，设置遵循 RFGen [16]。评价指标是顶点误差，即重建网格与真值深度网格之间的平均逐点欧氏距离（cm）。结果（图 17(b) 左）显示：在未见姿态上，RFDT 相对 mmMesh 与 RFGen 分别降低重建误差 75% 与 53%；在未见受试者上同样降低 71% 与 65%。这一改进来自它能利用现场测试样本做 TTA，克服了生成式数据增强适应性有限的问题。

**多径对泛化的影响。** 作者进一步在三种设置下考察场地相关多径的影响：室外开阔空间（多径极少）、室内走廊（中等多径）与室内办公室（多径严重）。结果（图 17(b) 右）显示 RFDT 始终优于 mmMesh 与 RFGen，将它们的误差降低 38% 至 77%。虽然 RFGen 使用环境扩散模型在大量视觉场景上多样化合成信号，但覆盖每一个测试场地并不现实；RFDT 支持的 TTA 能让骨干 DNN 做场地相关适应，从而提升其鲁棒性与泛化。

### 7.2 案例 II：通信系统的物理约束参数搜索（细节）

**背景与动机。** 新兴无线应用越来越需要在受物理约束的系统中搜索最优参数配置；由于这类系统对物理定律敏感，传统数据驱动模型往往力不从心 [27, 70, 87]。现有方法要么手工设计符号算法（难以规模化），要么用复杂仿真器做无梯度搜索（极其耗时）。作者以超表面（MS）部署优化为例，说明 RFDT 如何克服这些局限。

**超表面背景。** 传统 MS 设计聚焦优化反射波束方向图 [44, 69]。最近 AutoMS [54] 提出基于仿真的方法，同时优化反射方向图与部署位置；但受不可微仿真器限制，AutoMS 需在所有可能位置上做穷举式无梯度搜索，计算负担很高。Sionna [26] 对 MS 反射方向图可微，但对朝向不可微（第 6.1 节）。相比之下，RFDT 能准确估计 MS 平移与形变参数的梯度，从而支持基于梯度的最优 MS 部署搜索。

**实验设置。** 实验设置与 AutoMS [54] 类似：在实验室空间的已知位置放置 60 GHz 802.11ad 接入点（AP）（图 18），目标是在周围平整墙面上优化一块预先设计的 MS 的位置，以把 AP 覆盖扩展到目标区域。MS 设计为方位角 45°、俯仰角 15° 的固定反射角；制造遵循文献 [84] 的三维打印流程（1 万个单元，13 × 13 cm²）。实验在一条走廊（约 50 m²）中进行，环境含干墙、木材与金属/非金属混合家具；作者用相机扫描环境，把得到的三维网格作为 RFDT 输入。优化搜索空间允许 MS 沿墙平移 ±3 m、旋转 ±30°。

**信道仿真精度。** 作者先比较 RFDT 的仿真 RSS 与实际测量样本以评估前向仿真精度。共采集 20 个样本，均匀分布在场景内各位置。与 AutoMS [54] 比较——AutoMS 同样支持用真实样本调校射线追踪，但只限于调材料参数。如图 19(a)，AutoMS 的 RSS 中位误差为 2.9 dB；本文方法联合调整几何与材料，把中位误差降到 1.8 dB，缩小了仿真—现实的差距。

**场景动态仿真。** 作者在含运动主体（人体、椅子、门等，材料属性取自 [28]）的动态场景中进一步评估。图 19(b) 展示信号谱与误差统计：上排是动态仿真器生成的典型距离—多普勒剖面，刻画多径时延与速度引起的频移；下排箱线图比较走廊场景中有无显式多普勒仿真时的 RSS 误差分布。不建模动态时误差可超过 8 dB，反映时变多径的难度；采用第 5.3 节的多普勒与场景动态仿真后，中位误差降至约 3 dB，说明 RFDT 在场景动态下仍保持高保真。

**面向信号覆盖的超表面优化。** AutoMS 依赖无梯度搜索，在配 A6000 GPU 的消费级 PC 上约需 8 小时；RFDT 利用梯度下降，在同一台机器上仅 15 分钟就找到最优位置。这一优化部署进一步把目标区域（图 18 中的 Rx）的 RSS 提高 5.7 dB（静态场景）与 5.1 dB（随机小幅环境动态下）。

## 8. 结论与致谢（补译）

作者提出了 RFDT 的设计：首个求解射频仿真逆问题、用射频信号重建数字孪生的全可微仿真系统。通过高效估计仿真信号对各类场景参数的梯度，RFDT 独特地从输出反推仿真输入。借助在统一框架内跨多种用例的演示，作者期待 RFDT 成为开创性的一步，为未来计算射频研究开辟新方向。

**致谢。** 作者感谢匿名审稿人与 shepherd 的洞见与反馈。本工作部分受 NSF 资助（Grants 2127544、2403124、2408393、2346550、2312715、2238839、2426470、2436428）以及 NVIDIA 学术资助（NVIDIA Academic Grant）。

## 图表逐项转写（表 1、图 1—图 22）

### 表 1：RFDT 与相关可微渲染工作的功能比较（原 PDF 第 3 页）

> 原表脚注：$\partial$-Geometry 指对几何可微（Differentiable w.r.t. Geometry）；Spec. Reflec. 指镜面反射；Comm. 指通信；Radio Freq. 指射频。"潜在"对应原表 Potential。

| 工作 | 频谱 | 射线追踪方法 | 点源 | 镜面反射 | 衍射 | 几何可微 | 无偏梯度 | 雷达 | 通信 |
|---|---|---|---|---|---|---|---|---|---|
| Direct AD [60] | 光学 | 蒙特卡洛 | 否 | 否 | 否 | 否 | 否 | 否 | 否 |
| Edge Sampling [43] | 光学 | 蒙特卡洛 | 否 | 否 | 否 | 是 | 是 | 是 | 潜在 |
| Path Space [88, 89] | 光学 | 蒙特卡洛 | 是 | 否 | 否 | 是 | 是 | 潜在 | 潜在 |
| Warped Area [8, 53] | 光学 | 蒙特卡洛 | 否 | 是 | 否 | 是 | 是 | 潜在 | 潜在 |
| MetaWave [15] | 射频 | 蒙特卡洛 | 是 | 否 | 否 | 是 | 否 | 是 | 否 |
| Sionna [26] | 射频 | 两者 | 是 | 是 | 是 | 否 | 否 | 否 | 是 |
| RFDT（本文） | 射频 | 两者 | 是 | 是 | 是 | 是 | 是 | 是 | 是 |

### 图注逐项转写

**图 1（原 PDF 第 1 页）：** RFDT 通过求解射频仿真的逆问题来构造数字孪生。上：通过雷达仿真做三维重建。下：通过射频场景渲染优化通信系统。图中标注"可观测信号 / 不可观测状态"、仿真与反传构成的闭环，以及形状、材料、运动、位置、旋转、姿态等梯度通道（$\nabla$Shape、$\nabla$Material、$\nabla$Motion、$\nabla$Location、$\nabla$Rotation、$\nabla$Posture）；Tx 与雷达位于物理实体一侧，损失在 Sim 与 Real 之间。

**图 2（原 PDF 第 5 页）：** 重新参数化的射频射线追踪与 RFDT 的二次可见性。左：由三角形的无限支撑平面 $S(\triangle)$ 确定性构造候选反射路径（$p_{\mathrm{tx}}$、$p^{0}_{\mathrm{ref}}$、$p^{1}_{\mathrm{ref}}$、$p^{2}_{\mathrm{ref}}$、$p^{0}_{\mathrm{rx}}$、$p^{t}_{\mathrm{rx}}$）。右：接收机由 $p^{0}_{\mathrm{rx}}$ 平移至 $p^{t}_{\mathrm{rx}}$ 时，相邻面 $\triangle_a$、$\triangle_b$ 与边 $E$ 构成的二次可见性情形。

**图 3（原 PDF 第 5 页）：** 接收机位置由 $P^{0}_{\mathrm{rx}}$ 平移到 $P^{t}_{\mathrm{rx}}$ 时的楔形不连续性。C 表示信号强度变化的连续性，S 表示平移过程中的总能量守恒。传统方法（$H(\cdot)$）：不连续阶跃；软化三角面片（$\sigma(\cdot)$）：启发式 sigmoid，物理不正确；本文（$F(\cdot)$）：连续且物理正确——当反射点逼近边缘时，纯反射贡献被平滑地重新分配为衍射成分（由过渡函数 $F(\cdot)$ 刻画）。

**图 4（原 PDF 第 7 页）：** RFDT 的代理模型在优化早期提供更平滑的损失面以便更快收敛，随后逐步退火到传统信号域变换以获得无偏结果。图中并列展示原始信号、数字孪生、路径、代理模型与传统信号变换在角度（二维）、距离（一维）与空间（三维）三类情形下的损失面：传统变换呈崎岖损失面（存在局部极小），代理模型呈更平滑损失面并有"初始退火"箭头指向全局极小。

**图 5（原 PDF 第 7—8 页）：** RFDT 的前向仿真与反向传播流程。

**图 6（原 PDF 第 8 页）：** 用数字孪生替代神经表示（Replacing Neural Representation with DT）。

**图 7（原 PDF 第 8 页）：** 用数字孪生增强神经网络（Enhancing Neural Network with DT）。

**图 8（原 PDF 第 9 页）：** 场仿真（上：实部）与对场景参数 $\theta$ 的梯度估计（下）。子图 (a)—(h) 分别对应不同方法/参数设置的场与梯度对比；正文指出其中 (a) 为 Sionna 的覆盖前向仿真，(h) 为 PSDR 的含噪梯度。

**图 9（原 PDF 第 9 页）：** 场幅度对不同场景参数（物体位置、旋转与发射机位置）的梯度。图内三个面板分别标注 SSIM 0.9994 / PSNR 53.15 dB（位置）、SSIM 0.9940 / PSNR 36.65 dB（旋转）、SSIM 0.9997 / PSNR 63.09 dB（发射机）。

**图 10（原 PDF 第 10 页）：** 数字孪生优化过程的快照。左：用 Cascade 雷达重建金属桌面物体；右：用 Vayyar 雷达重建真实汽车，分别不使用与使用"汽车可能形状"的预训练知识。

**图 11（原 PDF 第 10 页）：** 利用雷达信号重建人体姿态与未知物体形状，对比 RFDT（本文）与 Sionna。

**图 12（原 PDF 第 10 页）：** 知识粒度对 RFDT 形状重建的影响：无知识、"Road Objects"、"Vehicles"、"Small Car" 四种设置。

**图 13（原 PDF 第 11 页）：** 给定场景中的归一化接收信号强度（RSS）。(a) 三维扫描环境与平面布局，右上角插图给出实际测量点；(b) Sionna 仿真的无线电地图（非相干）；(c) RFDT 生成的结果（相干）。图中标有 Tx 与归一化 RSS（dB）。

**图 14（原 PDF 第 11 页）：** (a) 数字孪生重建的平均顶点误差（按人体、汽车、剪刀、字母分类，纵轴 Vertex Error (cm) 0—40）；(b) 人体姿态收敛的损失历史（横轴 Epoch 0—250，纵轴 Loss，对比 Ours 与 Sionna）。**原文疑点：** 原图注把两个面板都写成 "(a)"，第二个按正文（"Fig. 14(b) shows the loss over epochs"）应为 (b)，此处加注说明，不改原图编号。

**图 15（原 PDF 第 11 页）：** (a) 不同 NLOS 遮挡（None、Plastic、Paper、Foam）下的三维重建精度，纵轴 SSIM，对比 Car 与 Human；(b) 每个雷达视角内物体数量（1、3、5）的影响，给出 SSIM 与 MSE(m) 随数量变化。

**图 16（原 PDF 第 11 页）：** (a) 材料对数字孪生重建的影响（Dielectric、Metal、Human、Indoor，纵轴 SSIM 0.6—1）；(b) 代理模型的有效性（横轴 Epoch 0—250，纵轴 Loss，对比 w/o Surrogate 与 w Surrogate）。

**图 17（原 PDF 第 12 页）：** (a) 场景复杂度下射线密度的影响（每个 Tx 的射线数 0—20k，三角形数 10k/50k/100k，纵轴误差 dB 5—30）；(b) 用例 I：增强机器学习感知模型的泛化能力。左侧对比 Backbone、RFGen、TTA(Ours) 在未见姿态/未见受试者上的误差 (cm)；右侧为跨域泛化，多径环境分 Min、Mild、Heavy。

**图 18（原 PDF 第 13 页）：** 优化超表面（MS）部署以最大化覆盖。总览：三维扫描网格；覆盖：各位置的仿真信号强度；梯度：信号强度对 MS 平移的变化。图中标出 Tx、Rx、MS 与 APSetup Metasurface。

**图 19（原 PDF 第 13 页）：** (a) 射频场仿真精度，比较在数字孪生中优化与不优化形状/材料参数（横轴 RSSI 误差 dB 2.5—12.5，纵轴 CDF，对比 w/o Finetune、Material、Shape+Mat）；(b) 场景动态仿真的影响：上排为距离与多普勒剖面（横轴 Range (m)、Doppler (m/s)），下排为走廊场景中 RSS 误差箱线图（对比 w/o 与 w 显式动态仿真）。

**图 20（原 PDF 第 18 页）：** RFDT 估计覆盖地图对 Tx 平移 $\theta$ 的梯度以用于优化；子图含 Overview、Coverage 与 Gradient。

**图 21（原 PDF 第 18 页）：** 时域有限差分（FDTD）全波仿真结果。左：射频场仿真；右：对 Tx 平移的梯度。

**图 22（原 PDF 第 18 页）：** 不同版本 Sionna 的结果。v0.19 含衍射仿真，v1.10 已移除该特性；由于非相干组合，两者结果都与全波解差异显著（纵轴幅值约 -100 至 0 dB）。

## 参考文献（英文原始书目，[1]—[92]）

> 以下按原 PDF 第 14—16 页的编号逐条转录英文书目，保留英文原貌与原始编号；本轮未逐条核验 DOI、页码与在线链接。第 [4] 条在抽取文本中只剩日期，属源文本不可靠，按原样保留并加注。

[1] awr1843boost evaluation board | ti.com. https://www.ti.com/tool/AWR1843BOOST. Accessed: 2023-2-3.

[2] Introducing the intel real sense depth camera d455. https://www.intelrealsense.com/depth-camera-d455/. Accessed: 2023-1-3.

[3] Vayyar imaging - home. https://www.vayyar.com/. Accessed: 2023-1-29.

[4] Jul 2024.（**源文本不可靠：** 原 PDF 该条书目在抽取文本中只剩 "Jul 2024."，按原样保留，未凭推测补写作者或题名；正文以 [4] 指代 Vayyar TrigB 雷达。）

[5] Fayçal Aït Aoudia, Jakob Hoydis, Merlin Nimier-David, Baptiste Nicolet, Sebastian Cammerer, and Alexander Keller. Sionna rt: Technical report. arXiv preprint arXiv:2504.21719, 2025.

[6] TurtleBot Authors. TurtleBot 4 User Manual. TurtleBot, n.d. Accessed: 2026-01-21.

[7] Constantine A Balanis. Advanced engineering electromagnetics. John Wiley & Sons, 2012.

[8] Sai Praveen Bangaru, Tzu-Mao Li, and Frédo Durand. Unbiased warped-area sampling for differentiable rendering. ACM Transactions on Graphics (TOG), 39(6):1–18, 2020.

[9] Sai Praveen Bangaru, Lifan Wu, Tzu-Mao Li, Jacob Munkberg, Gilbert Bernstein, Jonathan Ragan-Kelley, Frédo Durand, Aaron Lefohn, and Yong He. Slang. d: Fast, modular and differentiable shader programming. ACM Transactions on Graphics (TOG), 42(6):1–28, 2023.

[10] Angel X. Chang, Thomas Funkhouser, Leonidas Guibas, Pat Hanrahan, Qixing Huang, Zimo Li, Silvio Savarese, Manolis Savva, Shuran Song, Hao Su, Jianxiong Xiao, Li Yi, and Fisher Yu. ShapeNet: An Information-Rich 3D Model Repository. Technical Report arXiv:1512.03012 [cs.GR], Stanford University — Princeton University — Toyota Technological Institute at Chicago, 2015.

[11] Weiyan Chen, Hongliu Yang, Xiaoyang Bi, Rong Zheng, Fusang Zhang, Peng Bao, Zhaoxin Chang, Xujun Ma, and Daqing Zhang. Environment-aware multi-person tracking in indoor environments with mmwave radars. Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies, 7(3), 2023.

[12] Xingyu Chen, Jianrong Ding, Kai Zheng, Xinmin Fang, Xinyu Zhang, Chris Xiaoxuan Lu, and Zhengxiong Li. Invertwin: Solving inverse problems via differentiable radio frequency digital twin. arXiv preprint arXiv:2508.14204, 2025.

[13] Xingyu Chen, Zihao Feng, Kun Qian, and Xinyu Zhang. Radio frequency ray tracing with neural object representation for enhanced rf modeling. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 21339–21348, 2025.

[14] Xingyu Chen, Zihao Feng, Ke Sun, Kun Qian, and Xinyu Zhang. Rf-canvas: Modeling rf channel by fusing visual priors and few-shot rf measurements. In Proceedings of the 22nd ACM Conference on Embedded Networked Sensor Systems, pages 464–477, 2024.

[15] Xingyu Chen, Zhengxiong Li, Baicheng Chen, Yi Zhu, Chris Xiaoxuan Lu, Zhengyu Peng, Feng Lin, Wenyao Xu, Kui Ren, and Chunming Qiao. Metawave: Attacking mmwave sensing with meta-material-enhanced tags. In The 30th Network and Distributed System Security (NDSS) Symposium, volume 2023, 2023.

[16] Xingyu Chen and Xinyu Zhang. Rf genesis: Zero-shot generalization of mmwave sensing through simulation-based data synthesis and generative diffusion models. In ACM Conference on Embedded Networked Sensor Systems (SenSys '23), pages 1–14, Istanbul, Turkiye, 2023. ACM, New York, NY, USA.

[17] Zhe Chen, Shohei Nobuhara, and Ko Nishino. Invertible neural brdf for object inverse rendering. In European Conference on Computer Vision, pages 767–783. Springer, 2020.

[18] Boris Chidlovskii, Stephane Clinchant, and Gabriela Csurka. Domain adaptation in the absence of source domain data. In Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, pages 451–460, 2016.

[19] NVIDIA Corporation. Sionna: Discussion #838. https://github.com/NVlabs/sionna/discussions/838, 2025. Accessed: 2025-09-02.

[20] NVIDIA Corporation. Sionna's coverage map implementation. https://github.com/NVlabs/sionna/blob/6a85e1c4dc8338d51af1e45ad8843bb86c5794a2/sionna/rt/solver_cm.py, 2025. Commit ID: 6a85e1c4dc8338d51af1e45ad8843bb86c5794a2.

[21] Chandler Davis and William Morton Kahan. The rotation of eigenvectors by a perturbation. iii. SIAM Journal on Numerical Analysis, 7(1):1–46, 1970.

[22] Nist digital library of mathematical functions. https://dlmf.nist.gov/, 2023. Release 1.1.11 of 2023-06-15.

[23] Junfeng Guan, Sohrab Madani, Suraj Jog, Saurabh Gupta, and Haitham Hassanieh. Through fog high-resolution imaging using millimeter wave radar. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2020.

[24] Junfeng Guan, Sohrab Madani, Suraj Jog, and Haitham Hassanieh. High resolution millimeter wave imaging for self-driving cars. arXiv preprint arXiv:1912.09579, 2019.

[25] Chi-Jui Ho, Yash Belhe, Steve Rotenberg, Ravi Ramamoorthi, Tzu-Mao Li, and Nick Antipa. A differentiable wave optics model for end-to-end imaging system optimization. In AI and Optical Data Sciences V, page PC129030E. SPIE, 2024.

[26] Jakob Hoydis, Sebastian Cammerer, Fayçal Ait Aoudia, Avinash Vem, Nikolaus Binder, Guillermo Marcus, and Alexander Keller. Sionna: An open-source library for next-generation physical layer research. arXiv preprint, Mar. 2022.

[27] Rakhoon Hwang, Jae Yong Lee, Jin Young Shin, and Hyung Ju Hwang. Solving pde-constrained control problems using operator learning. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 36, pages 4504–4512, 2022.

[28] International Telecommunication Union. Effects of building materials and structures on radiowave propagation above about 100 MHz. Recommendation ITU-R P.2040-1, 2021. Available: https://www.itu.int/rec/R-REC-P.2040/en.

[29] Cesar Iovescu and Sandeep Rao. The fundamentals of millimeter wave radar sensors. Texas Instruments, pages 1–7, 2020.

[30] Fabian Jaensch, Giuseppe Caire, and Begüm Demir. Radio map estimation – an open dataset with directive transmitter antennas and initial experiments, 2024.

[31] Wenzel Jakob, Sébastien Speierer, Nicolas Roussel, and Delio Vicini. Dr. jit: A just-in-time compiler for differentiable rendering. ACM Transactions on Graphics (TOG), 41(4):1–19, 2022.

[32] Wenjun Jiang, Hongfei Xue, Chenglin Miao, Shiyang Wang, Sen Lin, Chong Tian, Srinivasan Murali, Haochen Hu, Zhi Sun, and Lu Su. Towards 3d human pose construction using wifi. In Proceedings of the 26th Annual International Conference on Mobile Computing and Networking, pages 1–14, 2020.

[33] James T Kajiya. The rendering equation. In Proceedings of the 13th annual conference on Computer graphics and interactive techniques, pages 143–150, 1986.

[34] Hiroharu Kato, Deniz Beker, Mihai Morariu, Takahiro Ando, Toru Matsuoka, Wadim Kehl, and Adrien Gaidon. Differentiable rendering: A survey. arXiv preprint arXiv:2006.12057, 2020.

[35] Tosio Kato. Perturbation theory for linear operators, volume 132. Springer Science & Business Media, 2013.

[36] Bernhard Kerbl, Georgios Kopanas, Thomas Leimkühler, and George Drettakis. 3d gaussian splatting for real-time radiance field rendering. ACM Transactions on Graphics, 42(4), July 2023.

[37] Hao Kong, Xiangyu Xu, Jiadi Yu, Qilin Chen, Chenguang Ma, Yingying Chen, Yi-Chao Chen, and Linghe Kong. m3track: mmwave-based multi-user 3d posture tracking. In Proceedings of the 20th Annual International Conference on Mobile Systems, Applications and Services, pages 491–503, 2022.

[38] Robert G Kouyoumjian and Prabhakar H Pathak. A uniform geometrical theory of diffraction for an edge in a perfectly conducting surface. Proceedings of the IEEE, 62(11), 2005.

[39] Karl S Kunz and Raymond J Luebbers. The finite difference time domain method for electromagnetics. CRC press, 1993.

[40] G Lejeune Dirichlet. Sur la convergence des séries trigonométriques qui servent à représenter une fonction arbitraire entre des limites données. 1829.

[41] Randall J LeVeque. Finite difference methods for differential equations. Draft version for use in AMath, 585(6):112, 1998.

[42] Ren-Cang Li. Matrix perturbation theory. Chapman and Hall/CRC Boca Raton, FL, 2006.

[43] Tzu-Mao Li, Miika Aittala, Frédo Durand, and Jaakko Lehtinen. Differentiable monte carlo ray tracing through edge sampling. ACM Transactions on Graphics (TOG), 37(6):1–11, 2018.

[44] Xinyi Li, Gaoteng Zhao, Ling Chen, Xinyu Zhang, and Ju Ren. Rfmagus: Programming the radio environment with networked metasurfaces. In Proceedings of the 30th Annual International Conference on Mobile Computing and Networking, pages 16–30, 2024.

[45] Yadong Li, Dongheng Zhang, Jinbo Chen, Jinwei Wan, Dong Zhang, Yang Hu, Qibin Sun, and Yan Chen. Towards domain-independent and real-time gesture recognition using mmwave signal. IEEE Transactions on Mobile Computing, 2022.

[46] Yadong Li, Dongheng Zhang, Ruixu Geng, Zhi Lu, Zhi Wu, Yang Hu, Qibin Sun, and Yan Chen. A high-resolution handheld millimeter-wave imaging system with phase error estimation and compensation. Communications Engineering, 3(1):4, 2024.

[47] Jian Liang, Ran He, and Tieniu Tan. A comprehensive survey on test-time adaptation under distribution shifts. International Journal of Computer Vision, pages 1–34, 2024.

[48] Jaime Lien, Nicholas Gillian, M Emre Karagozler, Patrick Amihood, Carsten Schwesig, Erik Olson, Hakim Raja, and Ivan Poupyrev. Soli: Ubiquitous gesture sensing with millimeter wave radar. ACM Transactions on Graphics (TOG), 35(4):1–19, 2016.

[49] Feng Lin, Chen Song, Yan Zhuang, Wenyao Xu, Changzhi Li, and Kui Ren. Cardiac scan: A non-contact and continuous heart-based user authentication system. In Proceedings of the 23rd Annual International Conference on Mobile Computing and Networking, MobiCom '17, pages 315–328, New York, NY, USA, 2017. ACM.

[50] Jian Liu, Hongbo Liu, Yingying Chen, Yan Wang, and Chen Wang. Wireless sensing for human activity: A survey. IEEE Communications Surveys & Tutorials, 22(3):1629–1645, 2019.

[51] Shichen Liu, Weikai Chen, Tianye Li, and Hao Li. Soft rasterizer: Differentiable rendering for unsupervised single-view mesh reconstruction. arXiv preprint arXiv:1901.05567, 2019.

[52] Matthew Loper, Naureen Mahmood, Javier Romero, Gerard Pons-Moll, and Michael J Black. Smpl: A skinned multi-person linear model. In Seminal Graphics Papers: Pushing the Boundaries, Volume 2, pages 851–866. 2023.

[53] Guillaume Loubet, Nicolas Holzschuch, and Wenzel Jakob. Reparameterizing discontinuous integrands for differentiable rendering. ACM Transactions on Graphics (TOG), 38(6):1–14, 2019.

[54] Ruichun Ma, Shicheng Zheng, Hao Pan, Lili Qiu, Xingyu Chen, Liangyu Liu, Yihong Liu, Wenjun Hu, and Ju Ren. Automs: Automated service for mmwave coverage optimization using low-cost metasurfaces. In Proceedings of the 30th Annual International Conference on Mobile Computing and Networking, pages 62–76, 2024.

[55] Stephen R Marschner and Donald P Greenberg. Inverse lighting for photography. In Color and Imaging Conference, volume 1997, pages 262–265. Society for Imaging Science and Technology, 1997.

[56] Stephen Robert Marschner. Inverse rendering for computer graphics. Cornell University, 1998.

[57] James Clerk Maxwell. Viii. a dynamical theory of the electromagnetic field. Philosophical transactions of the Royal Society of London, (155):459–512, 1865.

[58] Ben Mildenhall, Pratul P Srinivasan, Matthew Tancik, Jonathan T Barron, Ravi Ramamoorthi, and Ren Ng. Nerf: Representing scenes as neural radiance fields for view synthesis. In European conference on computer vision, pages 405–421. Springer, 2020.

[59] Tomas Möller and Ben Trumbore. Fast, minimum storage ray-triangle intersection. Journal of graphics tools, 2(1):21–28, 1997.

[60] Merlin Nimier-David, Delio Vicini, Tizian Zeltner, and Wenzel Jakob. Mitsuba 2: A retargetable forward and inverse renderer. Transactions on Graphics (Proceedings of SIGGRAPH Asia), 38(6), December 2019.

[61] NVIDIA Corporation. Rtx ray tracing, 2024. Accessed: 2024-09-05.

[62] Alan V Oppenheim and Ronald T Schafer. Digital signal processing, 2nd Edition. Prentice-Hall Inc., 1998.

[63] Jeong Joon Park, Peter Florence, Julian Straub, Richard Newcombe, and Steven Lovegrove. Deepsdf: Learning continuous signed distance functions for shape representation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 165–174, 2019.

[64] Steven G Parker, James Bigler, Andreas Dietrich, Heiko Friedrich, Jared Hoberock, David Luebke, David McAllister, Morgan McGuire, Keith Morley, Austin Robison, et al. Optix: a general purpose ray tracing engine. Acm transactions on graphics (tog), 29(4):1–13, 2010.

[65] Felix Petersen, Bastian Goldluecke, Christian Borgelt, and Oliver Deussen. Gendr: A generalized differentiable renderer. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 4002–4011, 2022.

[66] polycam. Polycam - LiDAR & 3D Scanner for iPhone & Android. https://poly.cam/, 2023.

[67] PyTorch Documentation. Forward-mode automatic differentiation (beta). https://docs.pytorch.org/tutorials/intermediate/forward_ad_usage.html, 2021. Accessed: 2025-08-15.

[68] Kun Qian, Zhaoyuan He, and Xinyu Zhang. 3d point cloud generation with millimeter-wave radar. Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies, 4(4):1–23, 2020.

[69] Kun Qian, Lulu Yao, Xinyu Zhang, and Tse Nga Ng. Millimirror: 3d printed reflecting surface for millimeter-wave coverage expansion. In Proceedings of the ACM Annual International Conference on Mobile Computing And Networking (MobiCom), 2022.

[70] Maziar Raissi, Paris Perdikaris, and George E Karniadakis. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational physics, 378:686–707, 2019.

[71] Yili Ren, Zi Wang, Yichao Wang, Sheng Tan, Yingying Chen, and Jie Yang. 3d human pose estimation using wifi signals. In Proceedings of the 19th ACM Conference on Embedded Networked Sensor Systems, pages 363–364, 2021.

[72] Clement Ruah, Osvaldo Simeone, Jakob Hoydis, and Bashir Al-Hashimi. Calibrating wireless ray tracing for digital twinning using local phase error estimates. IEEE Transactions on Machine Learning in Communications and Networking, 2:1193–1215, 2024.

[73] Ralph Schmidt. Multiple emitter location and signal parameter estimation. IEEE transactions on antennas and propagation, 34(3):276–280, 1986.

[74] Yoke Leen Sit, Christian Sturm, Lars Reichardt, Thomas Zwick, and Werner Wiesbeck. The ofdm joint radar-communication system: An overview. In Proc. Int. Conf. Advances in Satellite and Space Communications (SPACOMM 2011), pages 69–74, 2011.

[75] Justin Solomon, Keegan Crane, and Etienne Vouga. Laplace-beltrami: The swiss army knife of geometry processing. In Symposium on Geometry Processing graduate school, volume 2, Cardiff, UK, 2014.

[76] Elias M Stein and Rami Shakarchi. Fourier analysis: an introduction, volume 1. Princeton University Press, 2011.

[77] William Kelvin Thomson. On the mathematical theory of electricity in equilibrium. 1845.

[78] Ingo Wald and Vlastimil Havran. On building fast kd-trees for ray tracing, and on doing that in o (n log n). In 2006 IEEE symposium on interactive ray tracing, pages 61–69. IEEE, 2006.

[79] Chen Wang, Jian Liu, Yingying Chen, Hongbo Liu, and Yan Wang. Towards in-baggage suspicious object detection using commodity wifi. In 2018 IEEE Conference on Communications and Network Security (CNS), pages 1–9. IEEE, 2018.

[80] Yichao Wang, Yili Chen, Yingying Chen, and Jie Yang. Wi-mesh: A wifi vision-based approach for 3d human mesh construction. In Proceedings of the 18th Conference on Embedded Networked Sensor Systems (SenSys), 2022.

[81] Li-Yi Wei, Jianwei Han, Kun Zhou, Hujun Bao, Baining Guo, and Heung-Yeung Shum. Inverse texture synthesis. In ACM SIGGRAPH 2008 papers, pages 1–9. 2008.

[82] Teng Wei and Xinyu Zhang. mtrack: High-precision passive tracking using millimeter wave radios. In Proceedings of the 21st Annual International Conference on Mobile Computing and Networking, pages 117–129, 2015.

[83] Teng Wei, Anfu Zhou, and Xinyu Zhang. Facilitating robust 60 GHz network deployment by sensing ambient reflectors. In 4th USENIX Symposium on Networked Systems Design and Implementation (NSDI), 2017.

[84] Timothy Woodford, Kun Qian, and Xinyu Zhang. Metasight: High-resolution nlos radar with efficient metasurface encoding. In Proceedings of the 21st ACM Conference on Embedded Networked Sensor Systems, 2023.

[85] Hongfei Xue, Qiming Cao, Yan Ju, Haochen Hu, Haoyu Wang, Aidong Zhang, and Lu Su. M4esh: mmwave-based 3d human mesh construction for multiple subjects. In Proceedings of the 18th Conference on Embedded Networked Sensor Systems (SenSys), 2022.

[86] Hongfei Xue, Yan Ju, Chenglin Miao, Yijiang Wang, Shiyang Wang, Aidong Zhang, and Lu Su. mmmesh: towards 3d real-time dynamic human mesh construction using millimeter-wave. In Proceedings of the 19th Annual International Conference on Mobile Systems, Applications, and Services, pages 269–282, 2021.

[87] Shuqi Yang, Xingzhe He, and Bo Zhu. Learning physical constraints with neural projections. Advances in Neural Information Processing Systems, 33:5178–5189, 2020.

[88] Cheng Zhang, Bailey Miller, Kai Yan, Ioannis Gkioulekas, and Shuang Zhao. Path-space differentiable rendering. ACM Trans. Graph., 39(4):143:1–143:19, 2020.

[89] Cheng Zhang, Zihan Yu, and Shuang Zhao. Path-space differentiable rendering of participating media. ACM Transactions on Graphics (TOG), 40(4):1–15, 2021.

[90] Mingmin Zhao, Yingcheng Liu, Aniruddh Raghu, Tianhong Li, Hang Zhao, Antonio Torralba, and Dina Katabi. Through-wall human mesh recovery using radio signals. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 10113–10122, 2019.

[91] Mingmin Zhao, Yonglong Tian, Hang Zhao, Mohammad Abu Alsheikh, Tianhong Li, Rumen Hristov, Zachary Kabelac, Dina Katabi, and Antonio Torralba. Rf-based 3d skeletons. In Proceedings of the 2018 Conference of the ACM Special Interest Group on Data Communication, pages 267–281, 2018.

[92] Yue Zheng, Yi Zhang, Kun Qian, Guidong Zhang, Yunhao Liu, Chenshu Wu, and Zheng Yang. Zero-effort cross-domain gesture recognition with wi-fi. In Proceedings of the 17th Annual International Conference on Mobile Systems, Applications, and Services, pages 313–325, 2019.

## 附录 A：局限性与讨论（原 PDF 第 16 页）

**射线追踪近似。** RFDT 对基于射线追踪的射频仿真实现了完全可微，但它工作在几何光学固有的高频、远场假设下。把可微性推广到近场传播或全波电磁求解器，仍是未来工作的重要方向。

**梯度方差与条件数。** RFDT 用符号代理缓解相位周期性带来的局部非凸性；然而底层损失面往往仍是病态的，在复杂优化任务中不可避免地带来较高的梯度方差。后续研究可把代理框架扩展到数据驱动的统计方法，例如自适应预条件器或学习式梯度估计器，以进一步缓解这种不稳定性。

**高阶交互。** RFDT 需要显式的衍射追踪来建模高阶衍射与多次反弹反射，计算开销会随交互阶数增加。实践中可以把仿真截断到一阶与二阶衍射来控制成本；这种近似会引入建模偏差，但在高阶贡献可忽略的大多数实用场景中仍然足够。

**相干与非相干射线追踪。** 与通常用非相干求和近似平均大尺度路径损耗的覆盖地图工具 [30] 不同，RFDT 强制采用相干求和——这通常是感知任务才采用的 [72]。这对可微性是必要的：UTD 梯度计算所需的阴影边界处数学连续性，只有通过相干分量之间的干涉才能保持。

**可选的先验知识。** RFDT 的一个关键优势是能引入跨域先验，以驯服射频逆渲染中规模大、维数高的优化问题。作者不直接优化无约束的几何/材料参数（既昂贵又高度非凸），而是把可学习参数 $\Theta$ 限制到预训练结构化形状模型诱导的低维隐流形上。这降低了自由度，改善梯度条件，并使优化在稀疏射频观测下通常更稳定。

对于以人为中心的场景（例如图 5），作者采用 SMPL 人体模型 [52]：它用仅 10 个形状参数 + 72 个姿态参数 + 3 个全局平移参数表示含 6,890 个顶点的网格。RFDT 优化这些紧凑参数，再解码为全分辨率网格并送入可微射频射线追踪引擎。类似地，在汽车感知中，可以把数字孪生约束到"道路物体"类，利用 ShapeNet [10] 的预训练三维形状解码器：把未知形状表示为目标分辨率（如 $512^3$ 个采样）下的动态密度场，压缩成紧凑隐编码，再解码回网格表示用于仿真。与纯数据驱动的射频感知不同，这使图形学先验与射频仿真解耦，减少了对繁琐射频训练数据采集的需求。更强的先验会缩小搜索空间、简化优化，但也会降低对分布外目标的灵活性，这体现了一种偏差—方差权衡。

**偏差—方差权衡。** RFDT 中可优化参数依任务而定，利用先验知识（第 2 节）可有效正则化参数空间。虽然充足观测与强先验通常能改善优化结果，但存在根本性权衡：更细粒度的约束带来更高任务精度，却可能妨碍泛化；更粗的约束提升鲁棒性，却牺牲精度。这种偏差—方差权衡是传感与机器学习逆问题的基本性质。

## 附录 B：未来工作（原 PDF 第 17 页）

### B.1 基于 Hessian 的二阶优化

借助 Hessian 矩阵的二阶优化能加快收敛、提升稳定性并更好地处理病态问题。Hessian 提供优化损失面的额外曲率信息，从而更有效地逃离鞍点、提高对超参数变化的容忍度。带一般二次正则项的阻尼牛顿法更新规则为

$$
\mathbf x\leftarrow\mathbf x-\eta
\left(\frac{\partial^2\Phi}{\partial\mathbf x^2}+\lambda\mathbf L\right)^{-1}
\left(\frac{\partial\Phi}{\partial\mathbf x}+\lambda\mathbf L\mathbf x\right).\tag{25}
$$

当目标函数 $\Phi$ 是复合函数（例如 $\Phi(R(\mathbf x))$）时，其二阶导数需要链式法则。对单变量情形 $\Phi=\Phi(R(x))$，二阶导数的正确链式法则为

$$
\frac{d^2\Phi}{dx^2}
=\frac{d^2\Phi}{dR^2}\left(\frac{dR}{dx}\right)^2
+\frac{d\Phi}{dR}\frac{d^2R}{dx^2}.\tag{26}
$$

## 附录 C：补充实验与细节（原 PDF 第 17—18 页）

本附录给出第 6 节所述实验设置与扩展评估结果的完整细节，包括真实数据采集的硬件配置、扩展仿真环境，以及与全波求解器和基线方法的对比，用以进一步验证 RFDT 的精度与鲁棒性。

### C.1 真实世界设置与数据采集

作者用 Vayyar TrigB [3] 与 TI-AWR1843 雷达 [1] 以及一台 Intel RealSense 深度相机采集原始雷达信号。雷达高出地面 1.2 m，使其视场覆盖目标；测量过程中物体保持静止；对每个目标/场景采集 20 秒雷达样本。对 Vayyar TrigB 雷达，使用其 77 GHz 步进频率波形并采集 20 帧，取平均以降低噪声。对 TI-AWR1843 雷达，配置遵循 mmMesh：工作频率 77 GHz；每个 chirp 在触发后 6 μs 开始，以 60 MHz/μs 的斜率线性扫频；每个 chirp 以 4.4 Msps 采样 256 个 ADC 点，接收增益 30 dB，持续约 65 μs，chirp 间空闲 7 μs，并以 100 ms 周期在每帧中重复 128 个 chirp 循环；使用一个发射配置（每循环三个 chirp），并启用自动触发。

### C.2 大规模仿真室内环境评估

作者在含复杂房间布局、多样几何结构与异构材料的大规模仿真室内环境中评估 RFDT（图 20）。考虑两个代表性载频——5 GHz 与 60 GHz，分别对应典型 WiFi 与毫米波频段。仿真器能稳定计算多径分量的相干叠加，并给出接收信号场对发射机位置的准确梯度。这些结果说明 RFDT 应用于困难室内传播场景时的可扩展性与数值稳定性。

### C.3 全波仿真

虽然 RFDT 主要关注射线追踪的可微性而非其精度本身，作者仍做了实验验证其前向射线追踪仿真的准确性，与计算 Maxwell 方程全波解的时域有限差分（FDTD）求解器 [39] 对比。FDTD 提供高度可靠的参照，但差异可能来自场景表示（Yee 网格与三角网格导致物体厚度不同）、源建模（FDTD 中的体素发射器与射线追踪中的点源）、数值色散以及边界条件。

设置中使用 15 层完美匹配层（PML）模拟开放空间边界条件，并以每格 $\lambda/20$ 的网格分辨率离散区域。图 21 给出 FDTD 仿真的稳态场。为做基于梯度的对比，作者进一步采用与第 6.1 节相同的有限差分法，计算接收场强对发射机 $y$ 轴位移的导数。尽管离散化与边界建模存在固有差异，射线追踪引擎仍捕获了所有直达、反射与衍射分量（Sionna 等基线方法无法建模这些分量），且 RFDT 的梯度趋势与 FDTD 求解器高度吻合，说明其物理正确性。

### C.4 Sionna 配置

作者采用 NVIDIA 开发的开源射频仿真库 Sionna [26] 作为基线之一。Sionna 对材料属性等有限参数提供可微性，但不支持对几何场景参数求导。投稿时最新版本为 v1.10（2025 年 6 月）[5]，它是对更早的 v0.19（2024 年 9 月）的大幅重构；值得注意的是，v0.19 中可用的衍射模块在 v1.10 中被移除 [19]。然而两个版本对几何都不可微：v0.19 的 coverage_map 算子与 v1.10 的 radiomap 算子都不会把梯度从位置参数传播到输出覆盖地图。

**求解器架构：路径求解器与无线地图求解器。** 需要区分 Sionna 的路径求解器与其 radiomap（或 coverage_map）求解器。路径求解器支持含完整相位信息的相干组合，但它面向稀疏的点对点链路仿真；把它用于稠密无线地图生成在计算上不可行——例如生成一张标准 $512\times512$ 热图需要实例化超过 260,000 个独立接收器对象，作者测试中即使在高端的 NVIDIA A6000（48 GB）GPU 上也会持续导致显存耗尽与系统卡死。因此在覆盖预测任务中，作者使用专用的 radiomap 求解器。但作者检查发现该求解器执行的是简化的非相干功率求和 [20]：它丢弃相位信息、只聚合标量功率值，无法刻画相长或相消干涉图样。尽管 v0.19 名义上包含衍射能量项，结果却不一致且在物理上不正确（图 22）。

**配置。** 作者用 Sionna 的路径求解器做雷达仿真，用覆盖地图求解器做射频场仿真。所有覆盖地图实验中，Sionna 与 RFDT 使用相同设置：每个发射机的采样数设为一百万，最大深度设为 3，单元尺寸设为波长的八分之一（例如 2.4 GHz 时约 0.016 m）。

**面向雷达仿真的修改。** 由于 Sionna 默认不支持雷达仿真，作者扩展其功能：分别仿真发射与接收天线，并构造可由距离计算相位的传播路径。作者不对每个天线单元做射线追踪，而是从阵列质心计算一次传播路径，再根据阵列几何决定的相对相位偏移导出完整的 MIMO 响应。这一修改保证了基于 TensorFlow 的算子与底层 Mitsuba 射线追踪引擎的兼容性，从而可获得可微的信道冲激响应（CIR）。

利用这些计算出的路径，作者通过聚合各条射线的贡献合成雷达回波。对广泛使用的 FMCW 雷达 [29]，接收信号建模为

$$
S_{\mathrm{IFS}}(t)=\sum_{i=0}^{N}A(\alpha,\gamma)\exp\left(2\pi j(\mu t+f_ct)\right),\tag{27}
$$

其中 $N$ 表示传播射线总数；$A(\alpha,\gamma)$ 为在方位角 $\alpha$ 与俯仰角 $\gamma$ 处评估的天线方向图；$f_c$ 为载频；$\mu$ 为调频斜率，定义为 $\mu=B/T$，$B$ 为信号带宽，$T$ 为 chirp 持续时间。然而，由于该方法依赖直接的自动微分而不处理边缘不连续，它无法正确捕获几何边界，导致梯度含噪且不正确。

## 附录 D：证明（原 PDF 第 18—20 页）

本附录给出第 3 节所介绍可微渲染理论的正式数学证明与推导：严格建立第 3.1 节所述蒙特卡洛积分与点源镜面反射的不相容性，并推导第 3.3 节所用边缘衍射过渡函数的渐近性质，以保证平滑的梯度传播。

### D.1 镜面路径的零测度性质

**背景与预备。** 从法向为单位向量 $\mathbf n$ 的表面点、出射方向 $\omega_o$ 处的标准渲染方程出发：

$$
L_o(\omega_o)=\int_{\Omega^+}f_r(\omega_i,\omega_o)L_i(\omega_i)(\mathbf n\cdot\omega_i)\,d\omega_i,\tag{28}
$$

其中 $\Omega^+$ 为上半球，$L_i$ 为入射辐亮度，$f_r$ 为双向反射分布函数（BRDF）。

回顾两个理想化模型。**完美镜面 BRDF：** 对镜面反照率 $\rho_s\in[0,1]$ 的理想镜面，BRDF 用方向域上的 Dirac delta 分布强制反射定律：

$$
f_r(\omega_i,\omega_o)=\rho_s\frac{\delta_\Omega(\omega_i-R(\omega_o))}{|\mathbf n\cdot\omega_i|},\tag{29}
$$

其中 $R(\omega_o)$ 表示唯一能反射到 $\omega_o$ 的入射方向；因子 $1/|\mathbf n\cdot\omega_i|$ 保证在余弦因子下的正确能量归一化。**点源：** 来自方向 $\omega_l$ 的点光源表示为

$$
L_i(\omega_i)=L_{\mathrm{src}}\cdot\delta_\Omega(\omega_i-\omega_l).\tag{30}
$$

把镜面 BRDF 与点源模型代入渲染方程，求得出射辐亮度 $L_o(\omega_o)$：

$$
L_o(\omega_o)=\int_{\Omega^+}\left(\rho_s\frac{\delta_\Omega(\omega_i-R(\omega_o))}{|\mathbf n\cdot\omega_i|}\right)\left(L_{\mathrm{src}}\cdot\delta_\Omega(\omega_i-\omega_l)\right)(\mathbf n\cdot\omega_i)\,d\omega_i.\tag{31}
$$

整理各项得

$$
L_o(\omega_o)=\rho_sL_{\mathrm{src}}\int_{\Omega^+}\frac{\mathbf n\cdot\omega_i}{|\mathbf n\cdot\omega_i|}\delta_\Omega(\omega_i-R(\omega_o))\delta_\Omega(\omega_i-\omega_l)\,d\omega_i.\tag{32}
$$

由于积分在上半球 $\Omega^+$ 上进行，条件 $(\mathbf n\cdot\omega_i)\ge0$ 成立，即 $|\mathbf n\cdot\omega_i|=\mathbf n\cdot\omega_i$，于是余弦项相互抵消，积分简化为

$$
L_o(\omega_o)=\rho_sL_{\mathrm{src}}\int_{\Omega^+}\delta_\Omega(\omega_i-R(\omega_o))\delta_\Omega(\omega_i-\omega_l)\,d\omega_i.\tag{33}
$$

为计算该积分，作者利用 Dirac delta 分布的基本筛选性质：对一般函数 $g(x)$ 与 delta 函数 $\delta(x-a)$，有

$$
\int g(x)\delta(x-a)\,dx=g(a).\tag{34}
$$

把该性质用于式（33），取 $g(\omega_i)=\delta_\Omega(\omega_i-R(\omega_o))$ 为待求值函数、$\delta_\Omega(\omega_i-\omega_l)$ 为筛选 delta，则积分通过把 $\omega_i=\omega_l$ 代入 $g(\omega_i)$ 求得：

$$
\int_{\Omega^+}\delta_\Omega(\omega_i-R(\omega_o))\delta_\Omega(\omega_i-\omega_l)\,d\omega_i=\delta_\Omega(\omega_l-R(\omega_o)).\tag{35}
$$

由此得到出射辐亮度的最终表达式：

$$
L_o(\omega_o)=\rho_sL_{\mathrm{src}}\cdot\delta_\Omega(\omega_l-R(\omega_o)).\tag{36}
$$

该结果有明确的物理解释：除观察方向 $\omega_o$ 恰为光源方向 $\omega_l$ 的完美镜面反射方向外，出射辐亮度处处为零；这发生在 delta 函数自变量为零时，即 $\omega_l=R(\omega_o)$，等价于反射定律 $\omega_o=R(\omega_l)$。

**朴素蒙特卡洛估计器的低效性。** 标准蒙特卡洛（MC）估计器从连续概率密度 $p(\omega)$ 中采样 $K$ 个方向 $\{\omega_{i,k}\}$，并计算

$$
\hat L_o=\frac{1}{K}\sum_{k=1}^{K}\frac{f_r(\omega_{i,k},\omega_o)L_i(\omega_{i,k})(\mathbf n\cdot\omega_{i,k})}{p(\omega_{i,k})}.\tag{37}
$$

在本文情形中，被积函数仅在单一方向 $\omega^\ast=R(\omega_o)=\omega_l$ 上有支撑。数学上，连续角度域中的单个方向构成零测度集。对任意绝对连续密度 $p(\omega)$，

$$
\Pr[\omega_{i,k}=\omega^\ast]=0,\tag{38}
$$

因此以概率 1 没有任何样本落在被积函数的支撑上。于是

$$
\hat L_o=0\quad\text{几乎必然},\tag{39}
$$

即使真实积分等于 $\rho_sL_{\mathrm{src}}>0$。形式上，两个 delta 的乘积定义的测度关于 $p(\omega)\,d\omega$ 是奇异的，因此无偏重要性采样所需的 Radon–Nikodym 导数不存在。这解释了蒙特卡洛估计器为何崩溃。

### D.2 通过边缘衍射实现可微射线追踪

**衍射点构造。** 回忆楔形由共享边 $E$ 的两个相邻平面 $\triangle_a$、$\triangle_b$ 定义，边参数化为 $e(t)=v_0+t\hat{\mathbf e}$，其中 $\hat{\mathbf e}=(v_1-v_0)/\|v_1-v_0\|$。给定发射机与接收机位置 $x_{\mathrm{tx}}$、$x_{\mathrm{rx}}$，经过点 $e(t)$ 的光程为

$$
d(t)=\|\mathbf x_{\mathrm{tx}}-\mathbf e(t)\|+\|\mathbf e(t)-\mathbf x_{\mathrm{rx}}\|.\tag{40}
$$

按 Fermat 原理，衍射点 $x_d=e(t_d)$ 定义为 $d(t)$ 在 $t\in[0,L]$ 上的唯一极小点。每个距离项的凸性意味着 $d(t)$ 严格凸（零测度的退化情形除外），从而保证 $t_d$ 的存在性与唯一性。

**与镜面反射的联系。** 对法向为 $\mathbf n$ 的单个平面 $\Pi$，镜面点 $x_\Pi$ 由在约束 $x\in\Pi$ 下最小化同一光程得到。驻值条件给出

$$
\frac{\mathbf x-\mathbf x_{\mathrm{tx}}}{\|\mathbf x-\mathbf x_{\mathrm{tx}}\|}
-\frac{\mathbf x_{\mathrm{rx}}-\mathbf x}{\|\mathbf x_{\mathrm{rx}}-\mathbf x\|}
\perp T_\Pi,\tag{41}
$$

其中 $T_\Pi$ 表示该平面的切空间。这正是反射定律：入射与出射方向的切向分量一致，法向分量镜像对称。

**楔形上的极限论证。** 考虑由 $\Pi_1$、$\Pi_2$ 构成、边方向为 $\hat{\mathbf e}=\mathbf n_1\times\mathbf n_2$ 的楔形。对每个 $\varepsilon>0$，平行于 $\Pi_i$ 的偏移平面 $\Pi_i(\varepsilon)$ 存在唯一镜面点 $x_i(\varepsilon)$。当 $\varepsilon\to0^+$ 时，可行区域向边 $E$ 收缩。$x_i(\varepsilon)$ 的一阶最优性条件要求光程沿 $\hat{\mathbf e}$ 的导数为零：

$$
\frac{(\mathbf e(t)-\mathbf x_{\mathrm{tx}})^T\hat{\mathbf e}}{\|\mathbf e(t)-\mathbf x_{\mathrm{tx}}\|}
+\frac{(\mathbf e(t)-\mathbf x_{\mathrm{rx}})^T\hat{\mathbf e}}{\|\mathbf e(t)-\mathbf x_{\mathrm{rx}}\|}=0.\tag{42}
$$

式（42）与定义 $t_d$ 的驻值条件完全一致。因此当 $\varepsilon\to0$ 时，两个序列 $x_1(\varepsilon)$、$x_2(\varepsilon)$ 都收敛到 $x_d$。在这种极限意义下，唯一衍射点 $x_d$ 同时是两个面的镜面点。

**推论。** 作者已证明 UTD 衍射点 $x_d$ 与两面上镜面反射变得不可区分的边点重合。因此，镜面贡献在楔形处连续过渡为衍射贡献。这一性质正是能通过边缘对可见性求导的原因：经由 $x_d$ 的光程对几何参数是平滑依赖的，而包络定理保证其梯度可通过在保持 $t_d$ 隐式的前提下对光程长度求导得到。因此边缘衍射提供了使镜面可见性可微所需的、具有物理依据的连续极限。

### D.3 过渡函数的渐近性质

回忆式（8）的过渡函数，作者证明其在 $x\to\infty$ 与 $x\to0^+$ 时的极限行为。

**通过互补误差函数表示的闭式。** 令 $a=\sqrt x$。把积分路径旋转，设 $\tau=e^{-j\pi/4}u$。则 $\tau^2=e^{-j\pi/2}u^2=-ju^2$，$e^{-j\tau^2}=e^{-(-j)u^2}=e^{-u^2}$，而 $d\tau=e^{-j\pi/4}du$。积分上下限映射为 $\tau\in[a,\infty)\mapsto u\in[ae^{j\pi/4},\infty e^{j\pi/4}]$。由于 $e^{-u^2}$ 是整函数，Cauchy 定理允许沿 $\pi/4$ 角度的射线积分，得到

$$
\int_{\sqrt x}^{\infty}e^{-j\tau^2}\,d\tau
=e^{-j\pi/4}\int_{ae^{j\pi/4}}^{\infty e^{j\pi/4}}e^{-u^2}\,du
=e^{-j\pi/4}\frac{\sqrt\pi}{2}\operatorname{erfc}\left(e^{j\pi/4}a\right).\tag{43}
$$

把式（43）代入式（8），得到方便的闭式

$$
F(x)=j\sqrt\pi e^{-j\pi/4}\sqrt x\,e^{jx}\operatorname{erfc}\left(e^{j\pi/4}\sqrt x\right),\tag{44}
$$

其中取主值分支 $\sqrt x\ge0$ 与 $\sqrt j=e^{j\pi/4}$。

**大参数展开（$x\to\infty$）。** 令 $z=e^{j\pi/4}\sqrt x$，使 $z^2=jx$。对 $|\arg z|<3\pi/4$（此处满足），互补误差函数允许 Poincaré 渐近级数 [22, §7.12(ii)]：

$$
\operatorname{erfc}(z)\sim\frac{e^{-z^2}}{\sqrt\pi z}
\left(1-\frac{1}{2z^2}+\frac{3}{(2z^2)^2}-\frac{15}{(2z^2)^3}+\cdots\right),
\quad |z|\to\infty,\tag{45}
$$

在任意闭子扇区 $|\arg z|\le\theta<3\pi/4$ 内，截断到 $M$ 阶后的余项一致地被 $O(|z|^{-2M-1})$ 界住。

把式（45）代入式（44）。指数因子因 $e^{jx}e^{-z^2}=e^{jx}e^{-jx}=1$ 而相消，且 $je^{-j\pi/4}/z=je^{-j\pi/4}/(e^{j\pi/4}\sqrt x)=je^{-j\pi/2}/\sqrt x=-j^2/\sqrt x=1/\sqrt x$。乘以 $\sqrt\pi\sqrt x$ 并收集 $z^{-2}=(jx)^{-1}$ 的幂次，得到

$$
F(x)=1+\frac{j}{2x}-\frac{3}{4x^2}+\frac{15j}{8x^3}+O\left(\frac{1}{x^4}\right),
\quad x\to\infty,\tag{46}
$$

因此 $\lim_{x\to\infty}F(x)=1$，且以 $O(1/x)$ 的速度趋近。$O(1/x^m)$ 余项由式（45）中的 $O(|z|^{-2m-1})$ 余项得到，因为 $|z|=\Theta(\sqrt x)$。

**小参数展开（$x\to0^+$）。** 使用 $\operatorname{erfc}$ 的 Maclaurin 级数 [22, §7.12(i)]

$$
\operatorname{erfc}(z)=1-\frac{2}{\sqrt\pi}z+\frac{2}{3\sqrt\pi}z^3+O(z^5),\quad z\to0,\tag{47}
$$

连同 $z=e^{j\pi/4}\sqrt x$ 与 $e^{jx}=1+jx+O(x^2)$，代入式（44）得

$$
F(x)=j\sqrt\pi e^{-j\pi/4}\sqrt x\left(1+jx+O(x^2)\right)\left(1-\frac{2}{\sqrt\pi}e^{j\pi/4}\sqrt x+\frac{2}{3\sqrt\pi}e^{3j\pi/4}x^{3/2}+O(x^{5/2})\right),\tag{48}
$$

即

$$
F(x)=\sqrt\pi e^{j\pi/4}\sqrt x-2jx+O(x^{3/2}),\quad x\to0^+.\tag{49}
$$

特别地，$\lim_{x\to0^+}F(x)=0$，且主导阶标度为 $F(x)\sim\sqrt\pi e^{j\pi/4}\sqrt x$，它抑制了边缘处的几何光学奇异性。

## 附录 E：前向仿真细节（原 PDF 第 20—22 页）

本附录详述 RFDT 前向射线追踪的算法实现：第 3.2 节介绍的用于确定性路径构造的重新参数化镜像法、非视距传播中材料相互作用的物理建模，以及场景动态与多普勒效应的仿真机制。

### E.1 重新参数化的镜像法

具体地，对网格中顶点为 $(v_0,v_1,v_2)$ 的任意三角形，用映射 $S:\mathbb R^3\times\mathbb R^3\to\mathbb R^3\times\mathbb R^3$ 定义对应平面：

$$
S(\mathbf v_0,\mathbf v_1,\mathbf v_2)=\left(\mathbf v_0,\;(\mathbf v_1-\mathbf v_0)\times(\mathbf v_2-\mathbf v_0)\right).\tag{50}
$$

该表示同时编码了平面上参考点 $p_0$ 与法向量 $\mathbf n$。任意点 $p$ 关于平面 $S=(p_0,\mathbf n)$ 的镜像按下式计算：

$$
\operatorname{Mirror}(\mathbf p,S):=\mathbf p-2\frac{(\mathbf p-\mathbf p_0)\cdot\mathbf n}{\|\mathbf n\|^2}\mathbf n,\quad S=(\mathbf p_0,\mathbf n).\tag{51}
$$

递归应用镜像法，作者计算接收机经连续反射后的虚像：从最后一个反射面开始，沿反射面序列反推，构造像点链

$$
\mathbf p_{\mathrm{rx}}^{(0)}:=\mathbf p_{\mathrm{rx}},\quad
\mathbf p_{\mathrm{rx}}^{(i)}:=\operatorname{Mirror}\left(\mathbf p_{\mathrm{rx}}^{(i-1)},S(\triangle_{m-i+1})\right).\tag{52}
$$

实际反射点通过计算从发射机到最终虚像的射线与各中间反射平面的交点确定：

$$
\mathbf p_{\mathrm{ref}}^{(i)}:=\operatorname{Intersect\_plane}\left(\mathbf p_{\mathrm{ref}}^{(i-1)}\to\mathbf p_{\mathrm{rx}}^{(m-i)},\;S(\triangle_i)\right),\tag{53}
$$

其中 $\mathbf p_{\mathrm{ref}}^{(0)}:=\mathbf p_{\mathrm{tx}}$。于是完整传播路径构造为由发射机、所有中间反射点与接收机组成的有序序列：

$$
\mathcal P(\mathbf p_{\mathrm{tx}},\mathbf p_{\mathrm{rx}}\mid\triangle_1,\ldots,\triangle_m)
:=\{\mathbf p_{\mathrm{tx}},\mathbf p_{\mathrm{ref}}^{(1)},\ldots,\mathbf p_{\mathrm{ref}}^{(m)},\mathbf p_{\mathrm{rx}}\}
=T_{\mathrm{path}}\left(\mathbf p_{\mathrm{tx}},\mathbf p_{\mathrm{rx}},\{\triangle(\mathbf v_{i,0},\mathbf v_{i,1},\mathbf v_{i,2})\}_{i=1}^m\right).\tag{54}
$$

第二行把显式点序列改写为 $T_{\mathrm{path}}$ 的输出，它把式（50）至式（53）中的反射与求交操作封装为单个函数。该 $T_{\mathrm{path}}$ 是一个确定性函数，把一组三角形顶点映射为完整传播路径。所得路径长度 $L_{\mathcal P}$、路径幅度 $A_{\mathcal P}$ 与相位对每个顶点 $v_{i,j}$、$p_{\mathrm{tx}}$、$p_{\mathrm{rx}}$ 都连续且可微，因为该映射通过三角形支撑平面的求交定义。不过，这些点可能落在实际三角形边界之外，需要额外的边缘校验；校验用重心坐标 [59] 完成。对点 $p$ 与顶点为 $(v_0,v_1,v_2)$ 的三角形，

$$
\begin{bmatrix}u\\ w\end{bmatrix}
=\begin{bmatrix}\mathbf e_1\cdot\mathbf e_1 & \mathbf e_1\cdot\mathbf e_2\\ \mathbf e_1\cdot\mathbf e_2 & \mathbf e_2\cdot\mathbf e_2\end{bmatrix}^{-1}
\begin{bmatrix}\mathbf e_1\cdot\mathbf t\\ \mathbf e_2\cdot\mathbf t\end{bmatrix},\tag{55}
$$

其中 $\mathbf e_1=\mathbf v_1-\mathbf v_0$、$\mathbf e_2=\mathbf v_2-\mathbf v_0$、$\mathbf t=\mathbf p-\mathbf v_0$。点位于三角形内当且仅当重心坐标满足 $u\ge0$、$w\ge0$ 且 $u+w\le1$。

### E.2 材料与 NLOS 仿真

在基于射线追踪的无线传播仿真器中，电磁波与材料的相互作用通过反射、透射与吸收的组合建模。穿透建模对刻画射频信道中的非视距（NLOS）传播至关重要，因为许多射线会穿过墙壁、玻璃或其他建筑材料或在其表面反射。场景中每个表面都关联一种材料，用复介电常数 $\epsilon_r=\epsilon'-j\epsilon''$、磁导率 $\mu_r$ 与电导率 $\sigma$ 描述；这些参数决定控制 Fresnel 系数的边界条件。

**反射与透射。** 当平面波入射到两种材料之间的平面界面时，入射、反射与透射场满足切向电场与磁场的连续性。对从介质 1 入射到介质 2、相对介电常数为 $\epsilon_{r,1}$ 与 $\epsilon_{r,2}$ 的波，垂直（s）与平行（p）极化的 Fresnel 反射系数为

$$
\Gamma_\perp(\theta_i)=\frac{\eta_2\cos\theta_i-\eta_1\cos\theta_t}{\eta_2\cos\theta_i+\eta_1\cos\theta_t},\quad
\Gamma_\parallel(\theta_i)=\frac{\eta_1\cos\theta_i-\eta_2\cos\theta_t}{\eta_1\cos\theta_i+\eta_2\cos\theta_t},\tag{56}
$$

其中 $\eta_k=\sqrt{\dfrac{j\omega\mu_0}{\sigma_k+j\omega\epsilon_0\epsilon_{r,k}}}$ 为介质 $k$ 的本征阻抗，$\theta_i$ 为入射角，$\theta_t$ 为透射角，由 Snell 定律确定：

$$
n_1\sin\theta_i=n_2\sin\theta_t,\quad n_k=\sqrt{\epsilon_{r,k}\mu_{r,k}}.\tag{57}
$$

**穿透与吸收。** 为计入材料穿透，透射波按传播常数衰减：

$$
\gamma=\alpha+j\beta=j\omega\sqrt{\mu\epsilon}\left(1-j\frac{\sigma}{\omega\epsilon}\right),\tag{58}
$$

其中 $\alpha$ 为衰减常数、$\beta$ 为相位常数。材料内部的场幅度按

$$
|E(z)|=|E_0|e^{-\alpha z}\tag{59}
$$

衰减，其中 $z$ 为传播深度。

**射线追踪中的实现。** 仿真时每条射线携带复幅度与极化状态；在每次表面交互处，射线按 $\Gamma_{\perp,\parallel}$ 与 $T_{\perp,\parallel}=1+\Gamma_{\perp,\parallel}$ 分裂为反射与透射分量。仿真器沿长度为 $d$ 的射线路径累积相移 $e^{-j\beta d}$ 与衰减 $e^{-\alpha d}$。对异构材料采用分段传播，多个段的贡献以乘性方式计入最终路径增益。

**实际考虑。** 实践中使用表格化的材料参数（如混凝土、玻璃、金属）。导体通过令 $\sigma\to\infty$ 建模，此时 $|\Gamma|\approx1$；墙壁等有损介质用有限的 $\epsilon''$ 建模，它决定 $\alpha$。这使仿真器能捕获与经验信道模型一致的多径、阴影与穿透损耗效应。

**可微性。** 材料参数以连续、可微的形式出现在 Fresnel 系数与传播常数中。由于它们只通过乘性因子影响每条射线路径的复幅度，路径增益对 $\epsilon_r$、$\mu_r$、$\sigma$ 的依赖是平滑的；因此可解析地得到例如

$$
\frac{\partial\Gamma_\perp}{\partial\epsilon_r},\quad
\frac{\partial\Gamma_\parallel}{\partial\epsilon_r},\quad
\frac{\partial e^{-\alpha d}}{\partial\epsilon_r}\tag{60}
$$

等闭式梯度，便于基于梯度的优化以及与学习框架集成。

### E.3 多普勒与动态仿真

作者把射线追踪公式扩展到考虑多普勒与动态场景演化。对每条传播路径，与运动物体的交点随时间更新，使路径长度 $L_p(t)$ 随时间变化。相对径向速度 $v_r$ 取物体线速度在射线方向上的投影，即沿路径的速度分量。该径向速度引起多普勒频移 $\Delta f=v_r/\lambda$，相应路径贡献被 $\exp(j2\pi\Delta ft)$ 调制。于是每个多径分量随时间演化，产生的接收信号自然包含多普勒扩展与时变衰落。

动态场景仿真还需要更新底层加速结构。作者不在每帧重建完整 BVH（对 $N$ 个图元复杂度为 $O(N\log N)$），而是只对与动态网格相关的包围盒做选择性重拟合。利用 OptiX 9 的 MegaGeometry API，可以只高效更新运动物体的子集，同时复用环境的静态 BVH。这种混合策略显著降低开销，使大规模、高移动性环境的仿真成为可能。

通过这一形式，射线追踪器不仅输出静态覆盖地图，还输出随时间演化的信道冲激响应与多普勒功率谱。例如运动车辆在信道谱中产生清晰的频移，人体运动则引入快速时间变化与阴影效应。这些扩展使仿真器能在保持高计算效率的同时对移动条件下的真实无线信道建模。

## 附录 F：可微仿真与基线实现（原 PDF 第 22—23 页）

本附录介绍基线方法——Sionna、软化三角面片，以及作者在射频上对路径空间可微渲染的适配——的可微渲染详细实现；后者同时构成 RFDT 的散射仿真组件。

### F.1 基线：软化三角面片

作者基于重新参数化的镜像法，按式（4）与式（13）实现软化三角面片基线。其核心思想是用 sigmoid 平滑在不同传播路径上替换硬可见性。这种平滑引入了几何近似，破坏了能量守恒，使某些路径损失或泄漏能量。一个关键局限在于 sigmoid 参数 $k$ 的选取：其取值是任意的，不与任何物理量挂钩，而取决于三角形尺寸。结果，即使对同一三维扫描场景，不同的网格拓扑或三角化也可能给出不一致的结果。因此软化三角面片不适合作为实现可微射频渲染的方法。

### F.2 可微信号处理算法

信号处理算法的可微性是实现完全端到端优化的关键前提。作者在此分析多重信号分类（MUSIC）算法的可微性。MUSIC 理论上可微，但特征值分解的存在导致梯度病态、方差极大，使其不适合基于优化的学习任务。

**前向处理。** MUSIC 是用于 MIMO 雷达空间谱估计的高分辨率子空间方法。输入原始 MIMO 时域复值雷达信号 $X(t)\in\mathbb C^{M\times N\times T}$，其中 $M$ 为发射天线数、$N$ 为接收天线数、$T$ 为时间采样数；先做距离 FFT 预处理。距离 FFT 后，选取包含目标回波的感兴趣距离单元，得到用于空间处理的窄带信号矩阵。与传统延迟相加波束形成直接用相移组合天线信号不同，MUSIC 利用信号子空间结构获得超分辨成像能力。第一步是构造空间相关矩阵：把频域 MIMO 信号张量按空间维向量化，重排为矩阵 $Y\in\mathbb C^{MN\times T}$；随后计算相关矩阵 $R=YY^H$，其中 $(\cdot)^H$ 表示共轭转置。该相关矩阵刻画不同天线对之间的空间关系。MUSIC 依赖相关矩阵的特征分解 $R=U\Lambda U^H$，其中 $U=[U_s;U_n]$ 含特征向量，$\Lambda$ 含按降序排列的特征值；$U_s$ 张成对应 $K$ 个最大特征值的信号子空间，$U_n$ 张成噪声子空间。三维空间谱通过在每个空间位置 $(x,y,z)$ 处计算 MUSIC 伪谱得到：

$$
P(x,y,z)=\frac{1}{\mathbf a^H(x,y,z)\mathbf U_n\mathbf U_n^H\mathbf a(x,y,z)},\tag{61}
$$

其中 $\mathbf a(x,y,z)$ 为编码位置 $(x,y,z)$ 处目标预期相位关系的导向矢量。

**求导。** MUSIC 算法因依赖特征分解，给自动微分带来显著挑战。

作者分析 MUSIC 伪谱的可微性。令 $R\in\mathbb C^{p\times p}$ 为 Hermitian 空间相关矩阵，其特征分解为 $R=U\Lambda U^H$，$\Lambda=\operatorname{diag}(\lambda_1\ge\cdots\ge\lambda_p)$，$U=[u_1,\ldots,u_p]$。对选定模型阶数 $K$，把基分为 $U=[U_s,U_n]$，其中 $U_s$ 对应 $K$ 个主导特征值、$U_n$ 对应其余特征值。噪声投影算子为 $P_n=U_nU_n^H$，伪谱定义为

$$
P(\mathbf a)=\frac{1}{\mathbf a^H\mathbf P_n\mathbf a}\tag{62}
$$

对任意导向矢量 $\mathbf a$。

**特征向量的扰动。** 对单重特征值，在归一化 $u_i^Hu_i=1$ 下对特征值方程 $Ru_i=\lambda_iu_i$ 求导，得到经典一阶扰动公式 [35, 42]：

$$
d\lambda_i=\mathbf u_i^H(d\mathbf R)\mathbf u_i,\quad
d\mathbf u_i=\sum_{j\ne i}\frac{\mathbf u_j\mathbf u_j^H(d\mathbf R)\mathbf u_i}{\lambda_i-\lambda_j}.\tag{63}
$$

分母表明特征值间隙闭合时的不稳定性；在完全退化处导数无定义，因为特征子空间只在酉旋转意义下不变。

**投影算子的扰动。** 直接对谱投影算子 $P_s=U_sU_s^H$ 求导更稳定。在特征基下，其变分满足 Sylvester 方程

$$
d\mathbf P_s=\mathbf U\begin{bmatrix}0&\boldsymbol\Gamma\\ \boldsymbol\Gamma^H&0\end{bmatrix}\mathbf U^H,\quad
\Lambda_s\boldsymbol\Gamma-\boldsymbol\Gamma\Lambda_n=\mathbf U_s^H(d\mathbf R)\mathbf U_n,\tag{64}
$$

于是 $\boldsymbol\Gamma$ 的每个元素为 $(\boldsymbol\Gamma)_{ij}=\dfrac{(\mathbf U_s^H(d\mathbf R)\mathbf U_n)_{ij}}{\lambda_i-\lambda_{K+j}}$。若 $\Delta=\lambda_K-\lambda_{K+1}$ 表示信噪间隙，则

$$
\|d\mathbf P_s\|_2\le\frac{\|d\mathbf R\|_2}{\Delta},\quad d\mathbf P_n=-d\mathbf P_s,\tag{65}
$$

这正是 Davis–Kahan $\sin\Theta$ 定理 [21] 的无穷小形式。

**对伪谱的影响。** 令 $s(\mathbf a)=\mathbf a^H\mathbf P_n\mathbf a$。由式（62）与式（65），微分为

$$
dP(\mathbf a)=-s(\mathbf a)^{-2}\mathbf a^H(d\mathbf P_n)\mathbf a,\quad
|dP(\mathbf a)|\le\frac{\|\mathbf a\|_2^2}{s(\mathbf a)^2}\cdot\frac{\|d\mathbf R\|_2}{\Delta}.\tag{66}
$$

因此只要 $\Delta>0$，伪谱的梯度就是良定义的；但其尺度像 $1/\Delta$，在特征值交叉附近会变得任意大。

**到数据矩阵的链式关系。** 由于 $R=YY^H$，任何扰动满足 $dR=(dY)Y^H+Y(dY)^H$。因此对原始信号矩阵 $Y$ 的梯度继承了同样的谱间隙依赖。小 $\Delta$ 处的不稳定性解释了为何把 MUSIC 纳入可微端到端学习系统很困难。

## 本页范围与校对状态（2026-10-30 更新）

**本轮依据 arXiv:2603.18026v1 补齐的内容：**

1. **第 5.2/5.3 节**：多尺度 MSE 损失与 Laplacian 正则化 Adam 更新式（24）、约 34,000 行代码的从零实现、OptiX/RT Core/BVH 加速与 $O(M\log N)$ 复杂度、多普勒速度投影与 BVH 选择性重拟合、Dr.JIT 运行时反向与手写反向传播。
2. **第 6 节**：6.1 可微性验证（双缝 5 GHz、FD 真值、PSDR/软化三角面片/Sionna 三类基线与 SSIM/PSNR 全部数值，含图 9 三组 SSIM/PSNR）；6.2 重建精度（Vayyar 20T×20R 与 TI MMWCAS 12T×16R 硬件、初始球体与 ITU 材料、汽车 15.4/16.7 cm 与剪刀字母 1.7/2.4 cm、300 轮/3.5 分钟、先验知识三档、NLOS 三类遮挡物与 SSIM、1—5 目标与多视角扩展、材料类别、代理模型约 4 倍加速、复杂室内无线电地图 5.2/8.46/6.67 dB 对 Sionna 7.7/14.28/12.03 dB、0.739 s 对 3.235/1.22 s、Complex64 对 float32）；6.3 计算开销（0.01 s 前向、0.05—0.2 s AD、0.03 s 形状更新、50/300 轮、5k/10k/15k 射线与 10k/50k/100k 三角形、$10^4$—$10^6$ 三角形规模）。
3. **第 7 节**：7.1 测试时适应（mmMesh/RFGen 基线、180 cm 男性训练与 160 cm 女性测试、75%/53% 与 71%/65% 降误差、多径 38%—77%）；7.2 超表面部署（AutoMS 设置、45°/15° 反射角、1 万单元与 13×13 cm²、±3 m 与 ±30°、20 样本、2.9 dB 对 1.8 dB、动态场景 8 dB 对约 3 dB、8 小时对 15 分钟、5.7/5.1 dB 覆盖提升）。
4. **第 8 节与致谢**：结论与 NSF/NVIDIA 资助信息。
5. **图表逐项转写**：表 1 全表逐格转写；图 1—图 22 的图注逐条翻译，并补入图内面板标注、坐标轴与关键数值。
6. **参考文献**：按原编号 [1]—[92] 逐条转录英文书目，保留英文原貌；第 [4] 条在抽取文本中只剩日期，已按源文本不可靠加注，未凭推测补写。
7. **附录 A—F**：附录 A 的局限性讨论与 SMPL/ShapeNet 先验；附录 B 的 Hessian 二阶优化（式 25—26）；附录 C 的真实数据采集配置、大规模室内场景、FDTD 全波对比（PML 15 层、$\lambda/20$）、Sionna 版本与求解器配置、FMCW 合成式（27）；附录 D 的渲染方程、镜面 BRDF 与点源推导（式 28—39）、楔边衍射点存在唯一性证明（式 40—42）、过渡函数闭式与两侧渐近展开（式 43—49）；附录 E 的平面映射、镜像法与求交构造（式 50—55）、Fresnel 系数/传播常数/衰减（式 56—60）、多普勒与动态 BVH 重拟合；附录 F 的软化三角面片基线与 MUSIC 可微性分析（式 61—66）。

**主文长式补录。** 式（4）软化面片与软化权重、式（5）楔边极限条件、式（7）UTD 衍射系数的四项余切—过渡函数组合、式（12）（13）两种楔面过渡形式，本轮均补为带原文编号的显示式（此前页面只有文字描述）。

**校验方式。** 全部内容对照源 PDF 抽取文本（`sources/rfdt-inverse-rendering-2603-18026.txt`，23 页，含分页标记）逐段翻译；公式、数值、表项与图注按原文录入，原文编号保留（式 1—66、表 1、图 1—22、文献 [1]—[92]）。页面结构自检脚本运行结果为 PROBLEMS: 0。

**仍余事项（如实声明）：** 本轮未做逐句逐式的语体终校；图内曲线（如图 17(a) 的误差收敛曲线、图 19(b) 的箱线分布）只转录图注与正文数值，未逐点核读曲线；参考文献仅按源文本转录，未逐条联网核验 DOI、页码与在线链接；三处原文疑点以 `> **原文疑点：**` 或行内注解标注（式（21）前置 $2G_i$ 因子、第 5.3 节重复的 "Sec. 3.3" 交叉引用、图 14 图注两处 "(a)"），均未静默改动，需对照原 PDF 复核；第 [4] 条书目源文本残缺，不排除需要查 arXiv 页面补全。

**版权口径。** 本文为 arXiv 预印本（arXiv:2603.18026v1），本页从正文到附录均为该预印本内容的中文翻译，保留作者名单与 arXiv 链接；未引入原文之外的数据、公式或书目。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}
