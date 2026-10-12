---
layout: page
title: "PiX-MC：时间并行贝叶斯成像｜方法与理论译读（非全文）"
permalink: /papers/translations/pix-mc-reading/
math: true
toc: true
---

[← 返回 PiX-MC 论文条目](/papers/items/874ff950767bb3f7/) · [原文 PDF](https://arxiv.org/pdf/2608.17666v1)

**译稿说明：** 此文是原文 arXiv:2608.17666v1 的中文逐章译读，包含方法、主要定理、算法、实验及附录结构，**尚未逐句翻译与校对 55 页全文，尤其未覆盖全部长篇证明及参考文献**。不可作为完整译本引用。原文 CC BY 4.0；中文版本为改编，保留原作者署名与原文链接。[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。

# PiX-MC：基于 Score 生成先验的时间并行贝叶斯成像后验采样

原题：*Picard Proximal Monte Carlo for Parallel Bayesian Imaging with Score-Based Generative Priors*  
作者：Deliang Wei、Evan Bell、Wenhan Guo、Yifan Chen、Yu Sun。来源：arXiv:2608.17666v1，55 页；https://arxiv.org/pdf/2608.17666v1

原文 arXiv 页面提供 CC BY 4.0 许可。**此稿为方法、主要定理、实验及附录结构的中文逐章译读，尚未逐句翻译/核对第 28–55 页的长篇证明与全部参考文献，不能标为“完整全文翻译”。**

## 摘要

贝叶斯成像逆问题常需要对高维后验分布采样。Score-based 与扩散模型提供了表达力强的图像先验，但采样轨迹高度串行，难以满足大规模成像任务的计算开销需求。本文提出 PiX-MC，一种以近端 Langevin 动力学与 Picard 迭代为基础的时间并行后验采样框架。似然近端形式利用成像中高效、问题专用的 proximal operator；Picard 迭代使离散时间节点可以并行更新，支持多 GPU。为进一步提高实用性，作者提出多时间块版本与退火版本。理论在弱凸似然、非对数凹后验、近似 score、多块及退火调度下给出收敛保证，实验表明能够大幅缩短墙钟时间且保持重建质量。对于 $512\times512\times80$ 稀疏视角 CT，8 GPU 的退火多块 APiX-MC 相对于标准串行 Langevin 达到约 50 倍加速。

## 1 引言

考虑观测 $y=A(x)+e$（式 1），$A:\mathbb R^d\to\mathbb R^c$ 是成像正向算子，$e$ 是噪声。稀疏和含噪观测可能对应许多合理图像，因此贝叶斯方法不只求单个最优重建，还刻画完整后验 $\pi(x\mid y)\propto \ell(y\mid x)p(x)$，对于医疗与科学成像的可靠决策尤为重要。传统 TV 与稀疏先验不能全面表达自然图像分布，近年来 score-based 扩散模型因能提供高质量先验受到关注。现有后验方法大致分为直接引导逆向扩散，以及将训练好的 score 与 Langevin/Gibbs 等 MCMC 结合。前者后验目标与精确性不总有严格保证；后者具有更清晰的采样目标但往往要沿很长的随机轨迹逐步更新。

PiX-MC 的突破是**沿时间维度并行化同一条采样轨迹**，而不是仅在图像像素/不同独立链之间并行。先通过前向—后向分裂把 learned prior 的梯度与 likelihood 的 prox 分开，再将离散采样轨迹写成不动点问题，用 Picard 迭代并行更新轨迹的多个节点。相比直接串行 Langevin，它更容易利用多个 GPU。作者还提出分块以适应有限显存，并结合退火缩短达到目标质量所需的有效采样阶段。

## 2 背景与相关工作

### 2.1 贝叶斯成像与近端算子

对负对数似然 $L(x)=-\log\ell(y\mid x)$ 和负对数先验 $V(x)=-\log p(x)$，MAP 是

$$\widehat x=\arg\min_x\{L(x)+V(x)\}.\tag{2}$$

高斯观测时 $L(x)=\|y-A(x)\|_2^2/(2\beta^2)$。对函数 $F$ 的 proximal operator 定义为

$$\operatorname{prox}_{\eta F}(z)=\arg\min_x\left\{\frac12\|x-z\|_2^2+\eta F(x)\right\}.\tag{3}$$

它相当于隐式/后向梯度更新。前向—后向分裂（FBS）分别处理光滑先验和易求 prox 的似然：

$$x_{n+1}=\operatorname{prox}_{\gamma L}(x_n-\gamma\nabla V(x_n)).\tag{4}$$

### 2.2 Score-based 生成先验

干净图像 $x\sim p$，带高斯噪声的 $z=x+\sigma\zeta$，$\zeta\sim\mathcal N(0,I)$。高斯平滑后的密度 $p_\sigma$ 满足 Tweedie 公式

$$\nabla\log p_\sigma(z)=\frac{\mathbb E[x\mid z]-z}{\sigma^2}.\tag{5}$$

学习网络 $S_\theta(z;\sigma)\approx-\nabla\log p_\sigma(z)$，相应去噪 score matching 可用 $\mathbb E\|S_\theta(z;\sigma)-\zeta/\sigma\|^2$ 训练（式 6）。当 $\sigma\to0$，网络近似 $\nabla V$。无条件 Langevin SDE 为

$$dx_t=-S_\theta(x_t,\sigma_t)dt+\sqrt2\,dB_t.\tag{7}$$

噪声退火令采样器先在大噪声探索全局结构，再逐步恢复细节。论文也回顾了逆向扩散 SDE 与图像、医学、科学成像中的应用。

### 2.3 后验采样方法

标准 Langevin MC 将先验网络与观测梯度合并：

$$x_{n+1}=x_n-\gamma[\nabla L(x_n)+S_\theta(x_n;\sigma_n)]+\sqrt{2\gamma}W_n.\tag{9}$$

近端 Langevin 采用隐式似然/显式先验更新：

$$x_{n+1}=\operatorname{prox}_{\gamma L}\big(x_n-\gamma\nabla V(x_n)+\sqrt{2\gamma}W_n\big).\tag{11}$$

另两类方法包括引入辅助变量交替采样的 split Gibbs（式 12），以及以近似后验 score 引导的反向扩散。已有并行成像算法多在单次迭代内部并行或用于确定性 MAP 优化，未直接消除同一条随机采样轨迹的时间串行依赖。

## 3 PiX-MC 方法

### 3.1 从 FBS 构造近端似然漂移

将 $\nabla V$ 换为预训练的 $S_\theta$，写出

$$x_{n+1}=\operatorname{prox}_{\eta L}(x_n-\eta S_\theta(x_n;\sigma)),\tag{14}$$

其中 $\eta$ 是分裂参数，不是后面 Langevin 离散化步长 $\gamma$。定义

$$T_{\eta,\sigma}(x)=\frac1\eta\big[x-\operatorname{prox}_{\eta L}(x-\eta S_\theta(x;\sigma))\big].\tag{16}$$

连续动力学 $dx_t=-T_{\eta,\sigma}(x_t)dt$，加布朗噪声则变为

$$dx_t=-T_\eta(x_t)dt+\sqrt2\,dB_t.\tag{20}$$

Euler–Maruyama 离散的 X-MC 是

$$x_{n+1}=x_n-\gamma T_\eta(x_n)+\sqrt{2\gamma}W_n.\tag{21}$$

它是时间并行的串行参照算法。作者指出在精确 score 且特殊 $\gamma=\eta$ 的变换下，X-MC 与经典 proximal Langevin 有密切联系，只是先验梯度的评价中还包含噪声扰动。

**假设 1：** $L$ 是 $\alpha_L$-弱凸和 $\beta_L$-光滑，$V$ 是 $\alpha_V$-弱凸和 $\beta_V$-光滑，且后验归一化常数有限正。对于 $0<\eta<1/\alpha_L$，prox 单值且 Lipschitz。**假设 2：** 学习 score 与 $\nabla V$ 的误差被 $\delta$ 一致界定，同时网络 Lipschitz 常数为 $L_S$。这两项假设使复合漂移 Lipschitz，常数 $\Lambda_\eta=L_S+\beta_L(1+\eta L_S)/(1-\eta\alpha_L)$（式 18）。

**引理 1：** 分裂漂移对理想后验漂移 $\nabla L+\nabla V$ 的误差受 score 误差 $\delta^2$ 与 $\eta^2\beta_L^2\|\nabla L+\nabla V\|^2$ 控制（原文式 19）；因此控制 $\eta$、score 失配和似然平滑性，才能保证近端漂移接近目标动力学。

### 3.2 用 Picard 不动点迭代并行时间节点

对上述 SDE，Picard 迭代定义为

$$x_t^{(k+1)}=x_0-\int_0^tT_\eta(x_s^{(k)})ds+\sqrt2B_t.\tag{24}$$

选择 $t_n=n\gamma$，$n=0,\ldots,N$，共享**同一组布朗运动实现**（保证各 Picard 轨迹比较有意义），左端 Riemann 和离散化后

$$x_n^{(k+1)}=x_0-\gamma\sum_{i=0}^{n-1}T_\eta(x_i^{(k)})+\sqrt2B_{n\gamma},\quad x_n^{(0)}=x_0.\tag{25}$$

核心并行点：计算第 $k+1$ 条轨迹时，右端只依赖上一轮 $\{x_i^{(k)}\}$，因此 $T_\eta(x_i^{(k)})$ 对不同 $i$ 可分派到不同 GPU 并行，之后以并行前缀和或累加获得各节点新状态。**算法 1：** 采样 $x_0$ 和 $N$ 个独立高斯增量，形成布朗累积和；初始化所有时间节点为 $x_0$；重复 $K$ 次并行计算漂移及整条轨迹更新；最后返回 $x_N^{(K)}$。

**定义 1：相对 Fisher 信息**

$$\mathrm{FI}(\mu\|\pi)=\int\left\|\nabla\log\frac{d\mu}{d\pi}\right\|_2^2d\mu.\tag{26}$$

FI 为 0 对应分布与目标后验相同（适当正则条件下），是本文收敛的分布级驻点指标。**引理 2：** 若 $q_{sing}=\gamma N\Lambda_\eta<1$，相邻 Picard 轨迹误差 $\varepsilon_k=\max_n\mathbb E\|x_n^{(k)}-x_n^{(k-1)}\|^2$ 以 $q_{sing}^{2K-2}$ 几何衰减（式 27–29）。

**定理 1：** 在相应假设、小 $\gamma,\eta$ 下，连续插值轨迹的时间平均相对 FI 满足如下结构性误差界：

$$\begin{aligned}
\Big(0.75-O(\eta^2)-O(\gamma^2)\Big)\frac1T\int_0^T\mathrm{FI}(\mu_t\|\pi)dt
\le&\frac{\mathrm{KL}(\mu_0\|\pi)}{T}
+O(\eta^2)+O(\delta^2)+O(\gamma)\\
&+O(q_{sing}^{2K-2})(1+\mathrm{FI}(\mu_0\|\pi)).
\end{aligned}\tag{30}$$

右侧依次反映初始瞬态、前向后向分裂近似、score 失配、时间离散化和有限 Picard 次数。因此不能只增大 $K$ 就宣称严格后验收敛，还需控制模型与离散误差。

### 3.3 多块 PiX-MC

单块要求一次存储整条长度为 $T$ 的轨迹，也要求 $T\Lambda_\eta<1$ 才有上述 Picard 收缩。当轨迹长、GPU 少、图像大时不实用。于是划为 $M$ 个顺序时间块，每块 $N$ 个节点：$T=MN\gamma$，块长 $\tau=N\gamma$（式 32）。每块内执行 $K$ 次并行 Picard，块与块之间顺序衔接。显存与并行节点只按 $N$ 缩放；局部收缩因子 $q_{mult}=\tau\Lambda_\eta$ 更容易小于 1。

**算法 2：** 采样全轨迹的布朗增量；对每个块，从上一块终点初始化本块全部时间节点；在当前块内并行计算近端漂移并更新 $K$ 次；用本块末端作为下一块初值；返回最终节点。

由于每块初值是前面随机块的结果，加入**假设 3**：所有块起点的二阶矩一致有界（式 33）。引理 3 给出块内误差 $\varepsilon_{m,K}\le q_{mult}^{2K-2}\mathcal R$（式 34–36）。定理 2 与定理 1 类似，仍有 $O(\eta^2)$、$O(\delta^2)$、$O(\gamma)$ 等误差项，但 Picard 项用 $O(q_{mult}^{2K-2})\mathcal R$ 替换（式 37），从而对长轨迹具有更好伸缩性。

### 3.4 退火多块 APiX-MC

固定噪声采样可能需要很多时间步。为先捕捉图像粗结构再逐步细化，使用全局几何降噪调度

$$\sigma_n=\max\{\sigma_{max}\xi^n,\sigma_{min}\},\quad0<\xi<1.\tag{38}$$

另设随全局节点减小、最终趋于 1 的先验 score 权重 $\alpha_n\ge1$。时间相关漂移为

$$T_{\eta,\sigma_n}^{\alpha_n}=\frac1\eta\big[I-\operatorname{prox}_{\eta L}\circ(I-\eta\alpha_nS_\theta(\cdot;\sigma_n))\big].\tag{39}$$

多块之间**不重启噪声调度**，让退火跨完整轨迹连续。算法 3 与算法 2 相同，只是每个时间节点采用其自身 $\sigma_n,\alpha_n$。

**假设 4：** 每噪声层的 score 失配 $\delta_n$ 有界、网络具有统一 Lipschitz 常数，且网络输出范数被 $R_S$ 界定。于是加权后与 $\nabla V$ 的误差不超过 $\delta_n+(\alpha_n-1)R_S$（式 43），可定义最大及平均退火误差（式 44），局部收缩因子变为 $q_{ann}=\tau\Lambda_{\eta,ann}$（式 45）。**定理 3** 保留前述 FI 界结构，将 $O(\delta^2)$ 替换为退火误差均值 $O(\overline\delta_{ann}^2)$，Picard 项替换为 $O(q_{ann}^{2K-2})\mathcal R_{ann}$（式 46）。若权重在有限阶段后恒为 1，因权重造成的平均额外偏差可随总采样步数稀释。退火改善**底层顺序轨迹**的收敛速度，Picard 改善**执行轨迹的墙钟时间**，两种加速互补。

## 4 理论数值验证

构造可知精确后验的 32×32 灰度 Gaussian 图像先验，并从 70,000 张 FFHQ 图像估计 $\mu_{prior},\Sigma_{prior}$。测量矩阵 $A\in\mathbb R^{100\times1024}$ 的随机高斯行归一化，噪声 $\sigma_y=0.001$。线性高斯问题精确后验仍为高斯：

$$\Sigma_{post}=(\Sigma_{prior}^{-1}+A^TA/\sigma_y^2)^{-1},\quad\mu_{post}=\Sigma_{post}(\Sigma_{prior}^{-1}\mu_{prior}+A^Ty/\sigma_y^2).\tag{50}$$

比较理论解析 score 的 PiX-MC、预训练 score 的 PiX-MC 和退火 APiX-MC，均运行 150 条独立链，每 10 步记录样本，使用最大均值差异 MMD² 检查最终分布。解析 score 的最终 MMD² 最低为 0.0036；预训练 score 的 APiX-MC 与 PiX-MC 分别为 0.1361、0.1480。表明退火改善了实际学习 score 的采样演化，但模型误差仍存在。

## 5 真实成像实验

实验在 8× NVIDIA RTX PRO 6000 Blackwell GPU 节点上开展。并行法使用 8 GPU，串行比较方法使用 1 GPU，因此加速数字包含多 GPU 资源收益，应同时报告总 GPU 成本。PiL-MC 为不用 likelihood prox 的 Picard Langevin；X-MC、PiX-MC 用 prox；前缀 A 表示退火。作者用 DPS、DAPS、TV 等作为外部基线。

### 5.1 MRI 与 Rician 去噪

8× 加速 MRI 使用 FastMRI 的 10 张 320×320 脑图、径向欠采样掩码、AWGN 标准差 0.05；Rician 去噪采用 CBSD68 子集 10 张 256×256 图像，噪声参数 0.1。MRI 多块配置为 $M=10,N=75,K=100$；Rician 为 $M=5,N=100,K=50$。图 3 对数纵轴表明，各方法在短暂初期波动后 Picard 块内迭代误差近似几何下降；图 4 描述 MSE 轨迹由分段常数逐渐细化为平滑曲线。MRI 中 APiX-MC 平均 PSNR=31.69 dB、SSIM=0.8472，为表中最高。Rician 任务不同指标赢家并不统一，APiL-MC 在 PSNR/SSIM 较好，APiX-MC 在 LPIPS 较好。

### 5.2 1024×1024 大图去模糊

测试选取 DIV2K 验证集 10 张自然图像，裁剪到 1024×1024，使用相机抖动模糊并叠加 $\sigma_y=0.05$ 高斯噪声。卷积型 likelihood prox 可在傅里叶域高效处理。每块 Picard 最多 20 轮，或标准化误差 $\varepsilon_{m,k}/d<3\times10^{-4}$ 时提前停止。

在 8 GPU、每块 8 时间节点设置下，达到平均 PSNR 26 dB 的时间：L-MC 491 s、X-MC 365 s、AL-MC 190 s、AX-MC 157 s、PiL-MC 171 s、PiX-MC 127 s、APiL-MC 63 s、APiX-MC **54 s**。相比 L-MC，总墙钟约 9× 加速；其中 157→54 s 是相对 AX-MC 的 2.91× 额外并行加速。若 4 GPU 却每块安排 32 时间节点，所有并行变体都**比其串行对应算法更慢**，说明不能把最大并行度等同于最快时间。

最终图像质量近似保持：X-MC 为 27.24 dB、PiX-MC 为 27.23 dB；AX-MC 与 APiX-MC 均 27.98 dB。图 7 展示 PSNR-时间曲线，图 8 以固定 200 s 墙钟对比恢复结果。

### 5.3 512×512×80 稀疏视角 CT

从 AMOS 和 LDCT 训练 EDM score 网络，Hounsfield 单位裁剪至 $[-1000,1000]$ 再归一化。CT 使用 30 个覆盖 180° 的均匀平行束投影视角，目标体积为 80 个 512×512 横断面，sinogram 观测加入 $\sigma_y=0.5$ 高斯噪声，FBP 初始化，正投影和反投影由 LEAP 实现。为了约束切片连续性，在漂移中加入沿切片维的 Huber-TV 正则（原文式 52）。8 GPU、每块 $N=8$。

以平均 PSNR 32.5 dB 为目标，L-MC 的阈值时间约 474 min，而 APiX-MC 约 9 min，因此最高约 **50 倍墙钟加速**。同类成对比较，PiX-MC vs. X-MC 为 37 vs.116 min，APiX-MC vs. AX-MC 为 9 vs.28 min，额外并行加速约 3 倍。图 10 的典型切片在各法收敛后比较，APiX-MC 达 33.64 dB，仅花 35 min；图 11 对 35 min 固定预算下体数据进行对照。prox、退火与时间轴并行分别提升轨迹质量、优化有效时间步数和加快硬件执行，不能将 50× 完全归功于 Picard 迭代。

## 6 结论

PiX-MC 把成熟的近端似然更新和 learned score prior 结合，并借 Picard 不动点迭代在时间维度并行评估后验采样轨迹。多块设计控制显存、满足局部收缩条件，退火进一步改善样本精细化过程。理论通过相对 Fisher 信息给出含分裂、网络误差、时间离散和有限 Picard 迭代的分解界；实验从解析高斯后验到 MRI、Rician 去噪、大图去模糊和三维 CT 验证性能与墙钟加速。该加速高度依赖多 GPU、每块时间节点数及 forward/prox 实现。

## 附录与参考文献

论文附录 A–E（原文第 28–约 48 页）给出弱凸近端漂移的 Lipschitz/分裂误差证明、单块和多块 Picard 收缩、带退火权重的相对 FI 误差分解，以及稳定性条件；附录 F 详细记录各任务的 score 网络、导频/成像前向算子、prox 的数值实现、超参数和 Huber-TV。上述证明和实现细节**没有在本译读稿中逐式逐段完整翻译**，不得将此稿标为 55 页论文全文。参考文献完整书目请查原 PDF 最后几页。