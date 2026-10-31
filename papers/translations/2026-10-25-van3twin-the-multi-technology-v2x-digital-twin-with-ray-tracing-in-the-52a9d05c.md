---
layout: page
title: "VaN3Twin：射线追踪在环的多技术 V2X 数字孪生｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-25-van3twin-the-multi-technology-v2x-digital-twin-with-ray-tracing-in-the-52a9d05c/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/52a9d05cd84ac7c2/) · 原文为期刊/会议正式版，许可待核验 · [全部目录](/papers/catalog/)

# VaN3Twin：射线追踪在环的多技术 V2X 数字孪生

**原题：** VaN3Twin: The Multi-Technology V2X Digital Twin With Ray Tracing in the Loop  
**作者：** Roberto Pegurri<sup>*</sup>、Diego Gasco<sup>†</sup>、Francesco Linsalata<sup>*</sup>、Marco Rapelli<sup>†</sup>、Eugenio Moro<sup>*</sup>、Francesco Raviglione<sup>‡</sup>、Claudio Casetti<sup>†</sup>  
**单位：** ∗ 米兰理工大学电子、信息与生物工程系（Politecnico di Milano, Italy）；† 都灵理工大学控制与计算机工程系（Politecnico di Torino, Italy）；‡ 都灵理工大学电子与电信系。邮箱：{roberto.pegurri, francesco.linsalata, eugenio.moro}@polimi.it、{diego.gasco, marco.rapelli, francesco.raviglione, claudio.casetti}@polito.it。  
**版本：** 期刊/会议正式版：IEEE Transactions on Wireless Communications, vol. 25, 2026, pp. 16812–16827，DOI 10.1109/TWC.2026.3685710（IEEE postprint/Author's Accepted Manuscript，PolitEcnico di Torino 机构库版本，2026-10-25）；本地 PDF 17 页。**再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。**  
**范围与状态：** 全文中文译稿：摘要、Index Terms、第 I–VI 节及全部小节（II-A–C、III-A–B、IV-A–C、V-A–D）、式 (1)–(16)、算法 1、表 I–VI（表 II、III、IV、V、VI 逐格转写，表 I 按原文条目列出）、图 1–10 图注、参考文献 [1]–[70]（英文原条目）均按原文结构录入；原文无附录。逐句逐式终校未做。

## 摘要

本文提出 **VaN3Twin**——首个开源、全栈的网络数字孪生（Network Digital Twin，NDT）框架，用于在通过射线追踪实现精确物理层建模的前提下，仿真多种车联网（Vehicle-to-Everything，V2X）通信技术的**共存**。VaN3Twin 通过把 **Sionna 射线追踪器**（Ray Tracer，RT）**在环**集成到 ms-van3t 仿真器中，扩展了后者，从而实现无线传播的高保真表示，包括多样的视距（Line of Sight，LoS）条件（重点关注其他车辆网格造成的 LoS 遮挡）、Doppler 效应以及站点相关效应（如散射与绕射）。与传统仿真工具不同，所提框架支持在**共享频谱**上运行的专用短程通信（Dedicated Short Range Communication，DSRC）与蜂窝 V2X（Cellular-V2X，C-V2X）技术之间的真实共存分析。一个专用的干扰跟踪模块在**时频资源块**级别捕捉跨技术干扰，并通过消除"LoS/NLoS 分离传播模型导致的双峰行为"等伪影来改进信干噪比（SINR）估计。与现场测量相比，VaN3Twin 相对当前最先进的仿真工具在农村环境中把**应用层不一致率降低 50%**，在城市环境中降低**超过 70%**，证明了其在可扩展、准确的基于数字孪生的 V2X 共存分析中的价值。

**Index Terms：** V2X、射线追踪器、车辆网络、Sionna RT、ms-van3t、ns-3、同信道共存、NDT。

## I. 引言

2016 年，丰田成为首家发布具备 V2X 通信能力商用车的厂商，在日本市场采用基于 IEEE 802.11p 的 DSRC [1]。此后不久，美国和欧洲也出现类似部署 [2], [3]（通用汽车与大众集团）。如今 V2X 市场持续增长，越来越多车辆能够与部署在主要高速公路沿线的数千个路侧单元（RSU）通信 [4]。

然而从技术角度看，格局日益复杂。自 3GPP Rel. 14（2017）引入 LTE-V2X 以来，丰田把亚洲 V2X 市场引向 C-V2X 技术；相反，欧洲仍主要依赖 IEEE 802.11p。同时，奥迪、奔驰、福特等主要车厂频繁宣布未来采用 C-V2X（即 LTE-V2X 与新兴 NR-V2X 标准）的部署计划 [5]–[7]。因此来自不同厂商、可能采用不同 V2X 技术的车辆很快将在路上共存，给互操作性、标准化与协同部署带来显著挑战。为应对该情形，许多车载单元（OBU）与 RSU 厂商已开始在其产品中支持多种 V2X 技术。然而这些技术的共存仍是重大挑战：在美国，FCC 把 5.9 GHz 安全频段中的 45 MHz 重新分配给非授权业务、并把剩余 30 MHz 专用于 C-V2X，2024 年 12 月通过的后续规则要求既有 DSRC 装置迁移；在欧洲，C-V2X 与 IEEE 802.11p 都在 5.8–5.9 GHz 频段内运行，故**同信道干扰**成为 V2X 领域的关键研究方向，众多研究者与车辆产业联盟正在积极研究这些挑战 [8]–[10]。

在真实共存场景中预测 C-V2X 与 DSRC 的性能极为复杂，尤其在城市大规模环境、车队混合配备一种或两种技术的场景中。尽管车辆现场测试的仿真框架 [11] 近期显著提升了评估能力，但在真实场景中开展全面的共存与同信道干扰研究需要大规模配备一种或多种 V2X 无线接入技术（RAT）的车队；而当前厂商 OBU 通常一次只支持单一 RAT（要么 DSRC、要么 C-V2X），这使大规模现场共存测试在后勤、经济与技术上都极具挑战。因此，先进仿真工具对未来车辆网络中复杂大规模场景的分析至关重要。此外，准确的干扰建模对敏捷频谱利用与异构无线技术间有效频谱共享的研究也至关重要。

除传统仿真目标外，高保真建模也是新兴**网络数字孪生**（NDT）范式的基石 [12]。NDT 旨在实时创建网络的精确副本，要求仿真模型在通信协议栈各层都保持高精度 [13]。该要求对 V2X 无线网络尤为关键——其运行条件因高移动性、复杂传播环境（尤其城市场景）以及多 RAT 共存而快速变化。在此类设定中，精度对确保数字副本忠实反映物理对应物不可或缺；通常仿真器越真实，所得模型越可靠。

然而迄今为止，很少有车辆仿真工具包含真实信道模型。例如基于 ns-3 [14] 的仿真器常依赖随机信道模型，忽略确定性阴影、多径效应刻画与完整传播损耗模型等关键特征；另一个在 V2V 场景中极重要的局限是它们未考虑**周围车辆对接收信号的影响**。此外，只有少数车辆仿真器原生支持多种通信技术（含 IEEE 802.11p、LTE-V2X、NR-V2X）的全栈实现，以及与 ETSI 所标准化上层协议的集成。这些局限阻碍了基于车辆仿真的稳健同信道干扰研究。

本文提出 **VaN3Twin**<sup>1</sup>（脚注 1：https://github.com/DriveX-devs/VaN3Twin），一个基于把开源<sup>2</sup>（脚注 2：https://github.com/nvlabs/sionna）高保真信道建模射线追踪引擎 Sionna RT [15] 集成进 ms-van3t V2X 仿真器 [16] 的框架，形成可靠、为 NDT 就绪的全栈多 RAT V2X 仿真框架。VaN3Twin 还内建支持多通信技术共存建模，并在仿真传播环境中同时考虑**静态对象**（建筑、树木、路侧基础设施）与**动态对象**（车辆、行人等）。ms-van3t 是 ns-3 平台上最先进的开源 V2X 仿真器，支持 ETSI 兼容 V2X 应用的设计、仿真与硬件在环仿真；但作为 ns-3 原生仿真器，它传统上依赖概率模型模拟无线信道效应——这些模型对大尺度仿真有效，却常过度简化物理层现象，动态与易受干扰环境中的精度受限。通过使用射线追踪，VaN3Twin 克服该局限，弥合高层车辆仿真与真实建模之间的差距。

主要贡献概括如下。

- 实现首个开源、全栈、多 RAT 的 V2X NDT——VaN3Twin，用射线追踪克服传统随机与频率相关信道模型的局限。与 [13] 仅关注把 Sionna RT 集成进 ns-3 不同，本文提出完整 V2X NDT，重点在于多种 V2X 技术共享同一频谱场景的精确仿真，从而显式考虑其共存。
- 提出可适配、模块化框架：射线追踪组件可运行在配备 GPU 的专用服务器上，而 VaN3Twin 其余部分可在另一台机器上执行；这种分工既优化计算资源，也提升高保真城市级 V2X 仿真的可扩展性。
- 以 NDT 标准验证 VaN3Twin：在真实农村与城市场景的现场测量上验证，结果显示传播层与分组接收层保真度均显著改善（应用层不一致率降低 50%/70% 以上）。

## II. VaN3Twin 框架

本节介绍所提架构，它把 Sionna RT 集成进现有 ms-van3t 工作流（图 1）。图 1 展示完整 ms-van3t 协议栈，从应用层到物理层，后者展开显示 ms-van3t 中所有可用 RAT；图 1 还给出 ms-van3t 的移动性接口，可与 SUMO [17] 或 CARLA [18] 移动性仿真器或预录制车辆轨迹交互。使用 SUMO 或 CARLA 时，通过标准 V2X 消息交换接口（SUMO 的 TraCI [19]、CARLA 的 OpenCDA）获取每辆车的移动性状态；移动性数据最终由 ms-van3t Mobility 模型接收，并通过车辆数据提供者（VDP）模块分发给相应各层。图 1 底部展示与 Sionna RT 的集成——通过 **UDP socket** 进行数据交换，实现快速、模块化的架构。因此射线追踪器既可与 ms-van3t 在同一台本机运行，也可运行在算力更强的专用远程服务器上，模块化是 VaN3Twin 的关键特性。此外，依托 ms-van3t 及其底层 ns-3 引擎，VaN3Twin 的每个模块（协议栈、信道模型、移动性模式、性能指标）都可替换、扩展或从头重新实现；所用射线追踪引擎 Sionna RT 开源且完全可定制，通过专用适配器接口可整体替换而不影响集成逻辑。该设计最大化了二次开发的灵活性（遵循 ns-3 的模型、helper、属性等扩展惯例），并便于采纳射线追踪技术的未来改进；同时提供文档与 API 指导开发者。

ms-van3t 与射线追踪引擎之间的信息交换分为三条数据流（图 1 与图 2 中以匹配颜色标识）：(i) 数字孪生（DT）初始化（含建筑与路侧基础设施）与车辆网格映射（蓝色箭头）；(ii) 动态位置更新传输（红色）；(iii) 信道参数的请求与响应交换（绿色）。以下小节详述。

### A. DT 模型初始化与车辆网格映射

射线追踪器在三维（3D）场景中运行，场景含静态与动态对象，每个对象由 3D 网格表示：网格几何定义对象物理形状，材料属性（金属、玻璃、塑料等）决定其电磁特性，从而影响电磁波与对象表面的相互作用。静态对象（建筑、路牌、路侧单元）在仿真全程固定，构成我们的 DT 模型。为支持在所建模环境中仿真车流，场景拓扑（含建筑多边形）从 OpenStreetMap（OSM）[20] 提取并导入 SUMO 交通仿真器，从而构建场景基础设施的完整 DT 模型（图 2a）。动态对象是车辆等移动实体：我们从受支持的移动性仿真器中选择多种车辆网格（乘用车、轿车、卡车、公交车等），并把每种车辆网格进一步分割为车身、车灯、车窗、轮毂等不同部件，以便为每个部件分配适当的无线材料属性。

过程从定义参与整体仿真的车辆集合 \(\mathcal V=\{v_1,v_2,\ldots,v_N\}\) 开始；为区分时刻 \(t\) 参与仿真的车辆，定义活跃车辆子集 \(\mathcal V_{\rm active}(t)\subseteq\mathcal V\)。3D 车辆网格集合记为 \(\mathcal M=\{\mathbf M_{v_1},\mathbf M_{v_2},\ldots,\mathbf M_{v_N}\}\)，其中每个 \(\mathbf M_{v_n}\in\mathcal M\) 表示车辆 \(v_n\) 的几何与材料属性。每个活跃车辆 \(v_n\in\mathcal V_{\rm active}(t)\) 配备两个天线 \((a_{v_n,{\rm Tx}},a_{v_n,{\rm Rx}})\)（发射与接收各一），安装在网格 \(\mathbf M_{v_n}\) 上的位置为

$$
\mathbf p_{\rm ant}(t')=\mathbf p_{v_n}(t')+\mathbf p_{\rm dis},\tag{1}
$$

其中 \(\mathbf p_{\rm dis}=[x_{\rm dis},y_{\rm dis},z_{\rm dis}]\) 表示天线相对车辆参考位置 \(\mathbf p_{v_n}(t')\) 的位移，\(t'<t\) 为最后一次应用到网格 \(\mathbf M_{v_n}\) 的更新时刻。每辆车 \(v_n\in\mathcal V\) 通过一一映射 \(\phi:v_n\mapsto\mathbf M_{v_n}\) 与射线追踪场景中唯一 3D 网格关联（图 2c）。DT 初始化与车辆网格映射 \(\phi\) 只在仿真开始时执行一次、全程不变，不产生运行时开销；每当车辆 \(v_n\) 变为活跃（即 \(v_n\in\mathcal V_{\rm active}(t)\)），其网格 \(\mathbf M_{v_n}\) 被更新以反映物理状态与动态位置变化。

**图 1（原文 Figure 1）：** 所提 VaN3Twin 框架总览：ms-van3t 高层架构与 Sionna RT 集成。

**图 2（原文 Figure 2）：** 整个 VaN3Twin 框架的流程图。

### B. 动态位置更新

在仿真时刻 \(t\)，每辆车 \(v_n\in\mathcal V\) 由位置向量 \(\mathbf p_{v_n}(t)=[x_{v_n}(t),y_{v_n}(t),z_{v_n}(t)]\)、速度向量 \(\boldsymbol\nu_{v_n}(t)=[\nu_{x,v_n}(t),\nu_{y,v_n}(t),\nu_{z,v_n}(t)]\) 与航向角 \(\theta_{v_n}(t)\) 刻画。每个仿真时间步，从 ms-van3t 的 Mobility 模型获取活跃车辆信息（类别、ID、位置、朝向）。为保证移动对象表示连贯且时间一致，由移动性仿真器生成的位置更新从 ms-van3t Mobility 模型传向射线追踪器（图 2d）：每当车辆 \(v_n\) 在时刻 \(t\) 有更新的移动性状态，就向射线追踪器发送包含元组 \(\{\mathbf p_{v_n}(t),\boldsymbol\nu_{v_n}(t),\theta_{v_n}(t)\}\) 的位置更新消息。射线追踪器接收后把该信息整合进场景，按收到的位置与朝向重新放置车辆网格并设置相应车辆配置，从而更新无线传播环境。于是每次更新时 \(\mathbf p_{v_n}(t)\)、\(\boldsymbol\nu_{v_n}(t)\)、\(\theta_{v_n}(t)\) 被更新以反映各活跃车辆当前状态，各网格 \(\mathbf M_{v_n}\) 同步更新。提供速度 \(\boldsymbol\nu_{v_n}(t)\) 是为了计算 Doppler 频移及相应信道相干时间。该同步确保传播环境忠实反映车联网时变几何与运动学，这是移动性下真实建模无线信道动态所必需的。

为限制射线追踪场景更新的计算开销，仅当车辆移动超过最小阈值距离 \(\Delta d_{\min}\) 时才执行同步：

$$
\Delta d_{\min}=\max\left(\Delta d_0,\ \nu_{v_n}(t)\cdot\tau_{\rm coh}\right),\tag{2}
$$

其中 \(\Delta d_0\) 为基础距离阈值、\(\tau_{\rm coh}\) 为信道相干时间、\(\nu_{v_n}(t)\) 为车辆当前速率。基于 Doppler 的机制使阈值自适应于信道相干距离，未来可扩展为更先进、更高效的机制（也可与具体场景几何关联）。仅当如下条件成立时才应用动态位置更新：

$$
\left\|\mathbf p_{v_n}(t)-\mathbf p_{v_n}(t')\right\|>\Delta d_{\min}.\tag{3}
$$

### C. 信道参数请求与响应

当车辆需要发送数据时，ms-van3t 的各 RAT 模块向射线追踪器请求某发射—接收对 \((v_i,v_j)\) 的信道参数。射线追踪器利用 GPU 并行化分担场景分析的计算开销，并把初始化开销分摊到多次信道查询上。在信道互易假设下，所得可容许传播路径集合为

$$
\mathcal R_{v_i,v_j}=\left\{\text{满足最多 }N_{\rm max}\text{ 次交互的可容许传播路径}\right\},
$$

其中 \(N_{\rm max}=5\)（见表 I）。若以 \(\alpha_k\)、\(\phi_k\)、\(\vartheta_k\)、\(\psi_k\)、\(\tau_k\) 分别表示第 \(k\) 条路径的复增益、Doppler 相位、发射与接收方向、传播时延，则 \(v_i\) 与 \(v_j\) 之间的信道脉冲响应为

$$
\mathbf h_{v_i,v_j}(t)=\sum_{k=1}^{K}\alpha_k e^{\mathrm{j}2\pi\phi_k t}\,\mathbf a_{v_i}(\vartheta_k)\mathbf a_{v_j}^\top(\psi_k)\,g(t-\tau_k),\tag{5}
$$

其中 \(K=|\mathcal R_{v_i,v_j}|\)、\(g(\cdot)\) 为脉冲成形滤波器，\(\mathbf a_{v_i}(\cdot)\) 与 \(\mathbf a_{v_j}(\cdot)\) 为相应天线阵列导向矢量。由该响应可得总路径增益

$$
G_{v_i,v_j}(t)=\frac{\left\|\mathbf h_{v_i,v_j}(t)\right\|^2}{2},\tag{6}
$$

其中 \(\|\cdot\|^2\) 为 \(L_2\) 范数平方（除以 2 以计入复基带表示）。\(v_i\) 与 \(v_j\) 之间的传播时延取所有单路径时延中的最小值：

$$
\tau_{v_i,v_j}=\min\left\{\tau_1,\tau_2,\ldots,\tau_K\right\};\tag{7}
$$

而 LoS 指示变量定义为

$$
\lambda_{v_i,v_j}=\begin{cases}1,&\text{若 }\exists\,r_k\in\mathcal R_{v_i,v_j}\text{ 为 LoS 路径},\\ 0,&\text{否则}.\end{cases}\tag{8}
$$

该二元输出 \(\lambda_{v_i,v_j}\) 将被后续共存模块与验证实验直接使用。

## III. 基于真实数据的 VaN3Twin 验证

为以 NDT 标准验证 VaN3Twin，我们在两次真实测量活动中采集数据：一次在意大利 Vercelli 周边的 Sali Vercellese 农村地区（图 3a），一次在意大利都灵市中心（图 3c）。现场测试使用专门装置（细节见 [11] 与图 4）：图 4a 展示 PC Engines 的 APU2E4 嵌入式板 [23]（图中红框）与 ArduSimple simpleRTK2B Fusion 板 [24]；OBU 运行最新版本 OpenWrt-V2X [25] 及最新版 Open Stack for car（OScar）框架 [11]，后者提供完整 ETSI C-ITS 协议栈。ArduSimple 板通过实时动态（RTK）服务实现厘米级全球导航卫星系统（GNSS）定位。图 4b 展示 MobileMark SMWG-313 天线 [26]——一款磁吸式车规多频段天线，同时支持 GNSS 接收机与两个 MIMO 天线元（在 V2X 频率上收发）。相同装置部署于两辆车：一辆停在路边作为发射机 Tx，按固定时间间隔周期发送车辆协作感知消息（CAM）；另一辆行驶作为接收机 Rx。两套现场测试（图 3a、3c）中用 Tx 与 Rx 测量了一系列参数；Rx 收到分组时记录载荷、UNIX 时间戳、平均测量 RSSI 与当前 GPS 坐标。

VaN3Twin 中用于射线追踪的 DT（图 3b、3d）在 Blender 中用 Blosm 插件建模，后者从 OpenStreetMap 导入传播环境的 2.5D 表示。按 ITU-R P.2040 建议 [27]，建筑建模为混凝土结构；树木（如有）建模为全木质对象，地面为混凝土；车辆以金属车身完整 3D 网格计入其散射贡献。射线追踪引擎仿真镜面反射、漫反射与折射，每条射线最多 5 次交互（弹射）。收发天线建模为各向同性，这是对实测所用天线的有效近似。射线追踪参数汇总于表 I。虽然本文聚焦低速率 CAM 业务，VaN3Twin 支持广泛的应用层剖面，包括协作感知、传感器共享等高速率、时延敏感负载；选择 CAM 是为了能与仅支持此类业务生成的硬件实测数据直接验证，扩展到其他业务剖面是直接的（底层 ns-3 仿真器支持任意业务模式，如自适应视频流 [28]）。

验证在两层进行：(i) **传播层**，把真实 Rx RSSI 测量与虚拟对应值比较；(ii) **分组接收层**，评估虚拟 Rx 与物理数据集的分组接收对齐程度。对 (ii) 我们提出专门指标**不一致率**（Disagreement Ratio，DR），以评估 VaN3Twin 提升整体复制精度的程度。DR 量化 VaN3Twin 与基线在二值判定结果上的不一致水平：设 \(\mathcal R\) 与 \(\mathcal M\) 分别为 VaN3Twin 与基线产生的判定结果集合（正或负），对称差 \(\mathcal R\triangle\mathcal M\) 表示被一方判为正/负而未被另一方如此判定的结果集合（即二者判定不一致的实例），\(\mathcal R\cup\mathcal M\) 表示全部判定。DR 定义为

$$
{\rm DR}=\frac{\left|\mathcal R\triangle\mathcal M\right|}{\left|\mathcal R\cup\mathcal M\right|}.\tag{9}
$$

DR 越低表示二者对齐越好，越高则决策结果差异越大。

为全面评估随机模型（当前最先进 V2X 仿真工具所采用）、基于射线的传播模型与真实测量之间的差异，同一仿真也用原版 ms-van3t 进行。该配置下 ms-van3t 依赖基于 3GPP TR 36.885 [29] 规范的随机传播模型，该模型包含随距离变化的概率性 LoS 状态判定。具体地，LoS 概率为

$$
P_{\rm LoS}(d)=\min\left(1,\frac{18}{d}\right)\left(1-e^{-d/36}\right)+e^{-d/36},\tag{10}
$$

其中 \(d\) 为收发机间距离。与射线追踪不同，该模型没有可调参数，由 3GPP 规范刚性确定。值得注意的是，该模型与两个场景的条件高度吻合：农村测量中收发之间为完全 LoS，与理论假设接近；城市场景中发射机放置在接近典型蜂窝微基站的高度，正是该模型的设计工作条件。这些是该模型预期用途的理想条件，使比较尤为相关。总之，真车现场测试与 VaN3Twin、ms-van3t 的仿真都使用 IEEE 802.11p 的……（原文续见 PDF）。

**表 I（原文 Table I）：VaN3Twin 射线追踪参数**

| 类别 | 设置 |
|---|---|
| 建筑与道路材料 | 混凝土 [27] |
| 反射 | 镜面反射 + 漫反射 |
| 树木 | 全木质对象（如存在） |
| 地面 | 混凝土 |
| 车辆 | 金属车身完整 3D 网格 |
| 每射线最大交互次数（弹射） | 5 |
| 收发天线 | 各向同性 |
| 频率/带宽 | 5.9 GHz / 10 MHz（V2X） |

**图 3（原文 Figure 3）：** 两次测量活动区域：意大利 Vercelli 的 Sali Vercellese 农村（a）及其 DT（b）；意大利都灵城市（c）及其 DT（d）。两个 DT 中静态 Tx 天线为红色标记，Rx 为黄色并沿绿色轨迹移动。

**图 4（原文 Figure 4）：** 现场测试的车辆装置。

### A. LoS 农村场景

该测量活动在 Vercelli 周边乡村 Sali Vercellese 附近完全开阔平坦的环境中进行，环境中没有建筑或树木等障碍物。发射车辆沿直线道路行驶、往返一圈（轨迹见图 3a、3b）；移动车辆 Rx 与停放的发射车辆 Tx 之间保持不间断 LoS。该场景是校准更复杂实验（如存在建筑与其他障碍物的城市场景）的必要基线。

图 5 比较了不同模型下的信号传播：现场测量值为蓝色、VaN3Twin 为绿色、ms-van3t 为红色。图 5a 的 RSSI 曲线显示测量信号紧密跟随 VaN3Twin 复现的趋势，在移动车辆 Rx 的整条轨迹上取值持续对齐；如预期，鉴于场景简单，ms-van3t 也与测量数据吻合良好，但其 RSSI 趋势过于平滑、缺乏局部起伏——这是其理论表述的固有局限（未考虑小尺度传播效应）。图 5b 中三个数据集 PDF 的整体趋势一致，进一步支持该观察。关于分组接收 DR，ms-van3t 得到的真实测量与仿真结果不一致率为 **12.82%**；尽管传播环境简单，VaN3Twin 几乎把该差异减半，降至 **6.5%**。

**图 5（原文 Figure 5）：** 农村测量活动（意大利 Vercelli 的 Sali Vercellese）中实测与仿真的 RSSI 值（a）及其概率密度函数（b）。

### B. NLoS 城市场景

与农村情形相比，城市场景的传播环境显著更复杂。这些测量在都灵市中心附近一个非常繁忙的区域进行，其特点是多树木、停放车辆与其他多种障碍物，导致发射信号与周围环境的交互次数显著增加，从而影响 RSSI。与 Sali Vercellese 不同，此处可见性条件随车辆在环境中的相对位置而变化：测量开始时停放的发射车辆 Tx 与移动接收车辆 Rx 处于 NLoS 条件；如图 3c、3d 所示，发射机沿从右到左的直线轨迹移动，在中点附近出现短暂的 LoS 区间，随后车辆回到 NLoS 状态并持续到测试结束。该模式复现了典型城市场景——位于垂直道路上的两辆车试图相互通信……

图 6 展示该场景下的传播比较：ms-van3t 的 RSSI 曲线呈现突变且持续的波动，这是按式 (10) 在 LoS 与 NLoS 传播模型之间刚性切换的结果；图 6b 的 PDF 中，VaN3Twin 生成的分布与测量分布高度接近，准确捕捉了 RSSI 的均值与变异性，而原版 ms-van3t 产生明显双峰分布，导致不真实的聚类、无法反映现场测试中观察到的平滑变化。表 II 汇总了分组接收 DR：农村场景 ms-van3t 为 12.82%、VaN3Twin 为 6.5%、差异 49.3%；城市场景 ms-van3t 为 27.9%、VaN3Twin 为 8.16%、差异 70.8%。

**表 II（原文 Table II）：ms-van3t 与 VaN3Twin 相对实测数据的分组接收不一致率（DR）**

| 场景类型 | ms-van3t | VaN3Twin | 差异 |
|---|---|---|---|
| 农村（Sali Vercellese） | 12.82% | **6.5%** | 49.3% |
| 城市（都灵市） | 27.9% | **8.16%** | 70.8% |

**图 6（原文 Figure 6）：** NLoS 城市场景中实测与仿真的 RSSI 值（a）及其概率密度函数（b）。

## IV. VaN3Twin 的多 RAT 共存

### A. 所提共存实现

原版 ms-van3t 为各 RAT 包含不同的默认传播模型，但 LTE-V2X 与 NR-V2X 模块通常依赖 3GPP 传播模型 [29], [30]，与 IEEE 802.11p 模块所用模型互不兼容；此外，其默认信道模型采用概率性 LoS 判定，在复杂场景中精度受限。为部分缓解这些局限，ms-van3t 允许通过外部输入手动调整信道条件——可直接注入 LoS 状态（如来自射线追踪引擎），或在仿真器内生成二维建筑地图以自动做 LoS/NLoS 分类；但后者既耗时又不精确（用基本盒状几何表示建筑）。相反，VaN3Twin 利用射线追踪提供显著更高的建模精度，以及跨不同 RAT **统一**的信道抽象；该统一方法实现一致、真实的信道估计（如式 (5) 所述），对需要共享或部分重叠频谱真实建模的多 RAT 共存场景尤为关键。

在 V2X 仿真场景中，设 \(\mathcal W\) 为启用共存模块的仿真 RAT 集合。每个 \(w\in\mathcal W\) 在带宽 \(B^{(w)}\)、中心载频 \(f_c^{(w)}\) 的频段上运行，采用正交频分复用（OFDM）波形、含 \(L^{(w)}\) 个子载波、子载波间隔 \(\Delta f^{(w)}\)。相应子信道网格为

$$
\mathcal F^{(w)}=\left[f_c^{(w)}-\frac{B^{(w)}}{2},\ f_c^{(w)}+\frac{B^{(w)}}{2}\right]\times\left\{l\Delta f^{(w)}\right\}_{l=0}^{L^{(w)}-1},\tag{11}
$$

其中 \(l\in L^{(w)}\) 为整数。为评估跨 RAT 干扰，必须定义覆盖 \(\mathcal W\) 中所有技术的**全局资源网格**；对每个 \(w\in\mathcal W\)，其网格定义为

$$
\mathcal Z^{(w)}=\mathcal F^{(w)}\times\mathcal S^{(w)},\tag{12}
$$

其中 \(\mathcal S^{(w)}\) 为相应时隙集合。整体资源网格为

$$
\mathcal F=\bigcup_{w\in\mathcal W}\mathcal F^{(w)},\qquad\mathcal S=\bigcup_{w\in\mathcal W}\mathcal S^{(w)},\qquad\mathcal Z=\mathcal F\times\mathcal S.\tag{13}
$$

给定资源块 \(z\in\mathcal Z\)，令 \(\mathcal W(z)\subseteq\mathcal W\) 表示正在使用该块的 RAT 集合。为监测潜在跨 RAT 干扰，共存模块持续观察信道并跟踪每个 \(w\in\mathcal W(z)\) 的所有传输<sup>4</sup>（脚注 4：该特性使 IEEE 802.11p 与 NR-V2X 的并发仿真成为可能）。为此引入跟踪对象集合 \(\mathcal H\)：对时刻 \(t\) 每个发射车辆 \(v_n\in\mathcal V_{\rm tx}(t)\subseteq\mathcal V_{\rm active}(t)\)，建立相应跟踪对象

$$
\mathcal H_{v_n}=\left(v_n,\ w,\ f_c^{(w)},\ B^{(w)},\ T,\ S(f)\right),\tag{14}
$$

其中 \(T\) 为传输时长、\(S(f)\) 为功率谱密度（PSD）。现考虑两辆分别使用技术 \(w\) 与 \(w'\)（\(w\ne w'\)，且均属 \(\mathcal W(z)\)）的发射车辆，使用技术 \(w\) 的传输在资源块 \(z\) 上的 SINR 为

$$
{\rm SINR}_{w,z}=\frac{P_{{\rm Rx},w,z}}{N_{0,z}+P_{{\rm int},w}+\sum_{w'\ne w}P_{{\rm Rx},w',z}},\tag{15}
$$

其中 \(P_{{\rm Rx},w,z}\) 为期望信号接收功率、\(N_{0,z}\) 为 \(z\) 上的噪声功率、\(P_{{\rm int},w}\) 为其他使用 \(w\) 的车辆带来的**同 RAT 干扰**、\(P_{{\rm Rx},w',z}\) 为技术 \(w'\) 带来的干扰功率。式 (15) 中 \(P_{{\rm Rx},w',z}\) 的贡献计算如下：设 \(v_{\rm int}\) 为使用技术 \(w'\in\mathcal W(z)\) 的干扰车辆，具有跟踪对象 \(\mathcal H_{v_{\rm int}}\)。为剔除可忽略干扰，引入总路径增益阈值 \(G_{\rm thr}\)；若 \(G_{v_{\rm int},v_r}<G_{\rm thr}\)，则接收车辆 \(v_r\)（使用 \(w\ne w'\)）忽略来自 \(v_{\rm int}\) 的干扰；否则按 PSD \(S\) 与总路径增益 \(G_{v_{\rm int},v_r}\) 计算接收干扰功率。技术 \(w\) 的整体 SINR 由对所有资源块 \(z\in\mathcal Z\) 的带宽加权平均得到：

$$
{\rm SINR}_w=\frac{1}{|\mathcal Z|}\sum_{z\in\mathcal Z}\omega_z\cdot{\rm SINR}_{w,z},\tag{16}
$$

其中 \(\omega_z\) 为与资源块 \(z\) 带宽相关的权重。为清晰与便于理解，上述 SINR 计算过程也汇总于**算法 1**。此外，为说明共存模块的能力，下小节给出并分析一个多 RAT 通信的车辆场景仿真；其目标不是对车辆多 RAT 仿真做穷尽的同信道干扰研究，而是评估当共存技术的干扰分别用 VaN3Twin 与 ms-van3t 建模时，SINR 计算及其应用层影响有何差异，从而量化在 NDT 框架内集成精确物理层建模的收益。

**算法 1：含跨 RAT 贡献的 SINR 评估**

- 输入：活跃 RAT 集合 \(w\in\mathcal W\)；各 RAT 子信道 \(\mathcal F^{(w)}\)；各 RAT 时隙 \(\mathcal S^{(w)}\)。
1. 跟踪每个发射车辆 \(v_n\in\mathcal V_{\rm tx}(t)\subseteq\mathcal V_{\rm active}(t)\)。
2. 对每个资源块 \(z\in\mathcal Z\)：识别活跃 RAT 集合 \(\mathcal W(z)\subseteq\mathcal W\)。
3. 初始化干扰为仅含同 RAT 贡献。
4. 对每个 \(w'\in\mathcal W(z)\)（\(w'\ne w\)）：对每个使用 \(w'\) 的被跟踪干扰车辆 \(v_{\rm int}\)：若总路径增益 \(G_{v_{\rm int},v_r}\ge G_{\rm thr}\)，则把 \(P_{{\rm Rx},w',z}\) 累加到总干扰。
5. 按式 (15) 计算该资源块 SINR。
6. 计算以 \(\omega_z\) 加权的平均 \(\mathrm{SINR}_w\)（式 (16)）。

**表 III（原文 Table III）：VaN3Twin 用于 NR-V2X 的参数**

| 参数 | 取值 |
|---|---|
| 调制编码方案（MCS） | 14 |
| PSSCH 侧链阈值（RSRP） | 21 dB |
| 每资源块发送次数 | 3 |
| 资源选择方法 | 随机 [31] |
| 传播损耗模型 | 3GPP-based [30] |

**表 IV（原文 Table IV）：VaN3Twin 用于 IEEE 802.11p 的参数**

| 参数 | 取值 |
|---|---|
| 信道接入协议 | CSMA/CA |
| 传播损耗模型 | 3GPP-based [29] |

### B. 含共存模块的多 RAT 仿真

为在真实干扰条件下验证共存机制，我们考虑 20 辆车穿越含建筑与障碍物、具有 LoS 与 NLoS 传播条件的城市环境的多 RAT 场景。DT 按第 III 节相同流程创建，射线追踪参数见表 I。每辆车按 ETSI 传输规则周期发送 CAM 与协作感知消息（CPM），使用 5.9 GHz 公共载频与 10 MHz 带宽；车辆平均分为两种技术：10 辆用 IEEE 802.11p、10 辆用 NR-V2X。表 III、表 IV 分别汇总 NR-V2X 与 IEEE 802.11p 的主要仿真参数。

该设置以 ns-3 仿真实现于 VaN3Twin，用于定义通信环境。配置过程首先读取 SUMO 的 `.xml` 路径文件（定义要生成的车辆），随后实例化 ns-3 节点（每节点代表一个 C-ITS 站），各节点装备所需设施（如协作感知（CA）基础服务），然后为所用每种通信技术创建 PHY 与 MAC 层。所有组件正确初始化后仿真开始，ns-3、SUMO 与 Sionna RT 之间的同步按先前所述进行。由于所有车辆工作在相同频段，一种技术的传输会依频谱重叠与传播条件成为另一种技术的干扰。为建立代表当前最先进水平的基线，先在不启用共存模块的 ms-van3t 中仿真；随后分别在启用共存模块的 ms-van3t 与 VaN3Twin 中重复同一仿真。该流程可评估不同传播建模方式（ms-van3t 基于 3GPP、VaN3Twin 基于射线）如何影响每个接收分组的估计 SINR、潜在干扰源识别以及最终的分组解码结果。为确保两种模型具有相同传播条件，ms-van3t 中的 LoS 判定由 VaN3Twin 射线追踪器信息注入，从而进行公平、有意义的比较。

图 7 展示三种仿真器产生的 SINR PDF：VaN3Twin 的分布呈类高斯趋势，而 ms-van3t 的两个版本都显示两个显著峰。该双峰特征源于通信链路二值 LoS/NLoS 分类驱动的刚性模型切换（验证阶段图 6 已观察到）。然而真实传播环境中 LoS 与 NLoS 之间的过渡并非离散而是渐进的：即使在 LoS 条件下，周围障碍物也会造成信号折射与衰减、导致接收质量下降；这些效应未被 ms-van3t 的离散切换逻辑捕捉，而是在 VaN3Twin 的射线追踪行为中被考虑。更一般地，图 7 表明使用 3GPP 传播模型的仿真器倾向**高估** SINR，即使注入了射线追踪引擎的确定性 LoS 状态信息；原版 ms-van3t 缺乏共存感知建模导致 SINR 估计显著更高。

车辆通信系统中另一个关键方面是周围车辆的影响，它会导致**车致非视距**（Non-Line of Sight due to Vehicles，NLoSv）条件，真实建模不能忽略。例如 millicar [32]（专为 FR2 通信设计的 ns-3 V2V 模块）通过概率方法处理该问题，对车辆遮挡的可能性与物理尺寸的统计分布建模。如第 II-C 节所述，射线追踪引擎提供两车 \((v_i,v_j)\) 间 LoS 状态的二元输出 \(\lambda_{v_i,v_j}\)，其判定完全基于可容许传播射线集合 \(\mathcal R_{v_i,v_j}\) 中是否存在至少一条 LoS 路径。此外 ms-van3t 现有模型不支持 NLoSv 条件，因此这类情形在 ms-van3t 中被保守地当作（建筑等大障碍造成的）NLoS 处理。该局限在图 8 中明显：对仿真中频繁经历 NLoSv 的车辆子集，VaN3Twin 的分布保持前文观察到的类高斯轮廓，而 ms-van3t 两个版本（无论是否把 NLoSv 当作 NLoS）都显著高估 SINR，并在 10 dB 附近呈现明显峰。

总之，图 7、8 中 VaN3Twin 的类高斯分布反映了第 III 节所述的更真实传播行为。如第 IV-A 节所详述，把其他 RAT 的邻近发射机识别为潜在干扰源直接塑造所得 SINR，而该估计最终决定进行中的传输在接收端是否可解码。这些机制的组合使 VaN3Twin 能给出与 ms-van3t 不同的期望接收结果判定。图 9 报告两组仿真车辆的**传播层 DR**：启用共存模块的 ms-van3t 与 VaN3Twin 之间，干扰源检测的 DR 为 **21.72%**，在频繁 NLoSv 场景下升至 **34.69%**。这表明多达 35% 的情形中 ms-van3t 错误地丢弃了某干扰信号（视其可忽略），而 VaN3Twin 正确识别其对传输有显著影响。这些错误假设与 VaN3Twin 更高的建模精度叠加，也传播到最终的分组可解码性判定，进一步扩大两个模型的分歧：一般情形 DR 达 **49.11%**，即 ms-van3t 与 VaN3Twin 在近一半实例上对分组接收判定不同；在频繁 NLoSv 条件下升至 **60.18%**，凸显 ms-van3t 无法捕捉瞬时遮挡。例如，对图 10 中两辆 NR-V2X 车辆之间的通信，ms-van3t 与 VaN3Twin 的干扰功率估计差异可达 **17.53 dBm**，相应 SINR 偏差为 **4 dB**。

至于应用层性能，先看共存模块对 NR-V2X 通信整体**分组接收率**（PRR，衡量最终成功处理的分组数）的影响：使用原版 ms-van3t 时 PRR 为 97%，启用共存模块后降至 93%；而 VaN3Twin 计算出的 PRR 更低、为 **84%**。跨 RAT 干扰对 PRR 的整体影响有限，主要因为 CAM 与 CPM 载荷较小、且 NR-V2X 提供稳健的重传机制。然而此类聚合指标无法捕捉 NDT 中至关重要的**单分组级**差异：考虑启用共存模块的 ms-van3t 与 VaN3Twin 之间的分组接收 DR，一般情形为 **30.56%**，表明两个仿真器之间存在实质性失配；在频繁 NLoSv 的 LoS 主导场景中 DR 略低、为 **18.43%**，这主要归因于 5.9 GHz 下车辆近距离时更高的分组成功投递概率。

总之，共存对聚合分组投递指标的整体影响似乎有限；但这种应用层的表观一致具有误导性，因为高分组接收 DR 是在底层建模不准确的情况下观察到的。这削弱了 ms-van3t（以及一般而言 ns-3）作为 NDT 组件的适用性——NDT 不仅要求统计上准确的结果，还要求忠实复现真实通信动态。此外，SINR 估计上观察到显著差异，尤其在意瞬态遮挡期间；这些差异在更苛刻的用例中预计影响更大（更大数据载荷与更高频谱效率需求加剧了对准确信道建模的需要，尤其在高频段）。因此在涉及先进通信任务（如共享视觉、协作感知或编队行驶）的场景中，两个模型的分歧很可能更明显——这些用例本质上需要更高 SINR 以保证更低误块率（BLER）并最大化可达传输速率，从而进一步暴露 ms-van3t 在真实车辆条件下的局限。

**图 7（原文 Figure 7）：** 所有仿真 V2V 链路的测量 SINR 概率密度函数：原版 ms-van3t（无共存模块，蓝色）、启用共存模块的 ms-van3t（红色）与 VaN3Twin（绿色）。

**图 8（原文 Figure 8）：** 频繁 NLoSv 场景下 V2V 链路 SINR 的概率密度函数（三种配置同上）。

**图 9（原文 Figure 9）：** 干扰源检测与基于 SINR 的分组可解码性判定的传播层不一致率（一般场景与频繁 NLoSv 场景）。

**图 10（原文 Figure 10）：** NR-V2X 通信（Rx 与红色 Tx）被 802.11p 车辆（蓝色）干扰、且易发生 NLoSv 的仿真快照；蓝色显示干扰源到接收机的选中传播路径。

### C. 运行时与可扩展性分析

VaN3Twin 在大规模场景中的实际部署关键取决于射线追踪计算的开销。为量化可扩展性，我们记录每次信道参数计算所需的墙钟时间，在 5、10、20、40、60 辆车规模下测量；表 V 给出台阶分析结果。随着车辆数增加，缓存命中率从 **92.65%** 升至 **99.58%**，加速比从 **13.5×** 升至 **237.1×**，平均开销从 **168.56 ms** 增至 **446.25 ms**，P95 开销从 **204.14 ms** 增至 **847.61 ms**。在所测范围内，VaN3Twin 的摊销运行时呈**次线性**增长，并具有有利的复用动态。这些结果表明，只要恰当设计与配置传播路径复用机制，并在有限空间区域内以小型边缘部署 NDT 联邦的形式部署，高保真射线追踪在大规模 V2X 场景中在计算上是可达的。

**表 V（原文 Table V）：VaN3Twin 可扩展性分析**

| 车辆数 | 缓存命中率 | 加速比 | 平均开销/ms | P95/ms |
|---|---|---|---|---|
| 5 | 92.65% | 13.5× | 168.56 | 204.14 |
| 10 | 95.97% | 24.7× | 196.30 | 253.25 |
| 20 | 98.46% | 64.1× | 232.98 | 295.65 |
| 40 | 99.02% | 150.6× | 252.03 | 468.66 |
| 60 | 99.58% | 237.1× | 446.25 | 847.61 |

## V. 文献综述

本节综述精确 V2X 仿真与 NDT 的最新技术，重点在同信道共存与射线追踪集成。我们先分析既有共存研究以及开源仿真器对其的支持程度，再考察射线追踪作为复杂城市环境中物理层精确仿真关键使能技术的使用，最后强调本方法相对现有开源方案的新颖性，并概述车辆 DT 领域——VaN3Twin 所属方向。表 VI 汇总 VaN3Twin 与当前主要 V2X 仿真/仿真设备框架的差异。

### A. 同信道共存的仿真

车辆通信是更高阶驾驶自动化（尤其 SAE 4、5 级 [45]）的基石。在此背景下，仿真在 NDT 开发中起关键作用，可在安全、低成本条件下测试新服务 [12], [46]；为此，对 PHY 与 MAC 层及其交互的精确仿真是必需的。虽然已有多种研究通过仿真 [16], [47], [48] 与现场测试 [49], [50] 独立评估各技术，但针对多技术同信道共存的研究仍然稀少。例如 [51] 分析下一代 6G 网络对无源感知卫星系统可能造成的干扰；在 V2X 通信方面，Maglogiannis 等 [52] 考虑独立信道、从而排除干扰效应；[53] 中 Elloumi 等提出面向车—基础设施（V2I）通信频谱共享的基于学习的资源分配框架，但未实现全栈方法，只关注单一 RAT 内的干扰感知调度。特别地，IEEE 802.11p 与 C-V2X Mode 4 [54] 的共存仍是开放挑战：两种技术共享拥挤的 5.8–5.9 GHz 频谱，同时部署会因相互干扰而降低性能 [55]。[55] 提出通过用于 C-V2X 的增强前导序列解决该问题，并在基于 LTEV2VSim [34] 的 WiLabV2XSim 仿真器 [33] 上测试；该 MATLAB 工具支持 IEEE 802.11p 与 C-V2X，也被 [56] 用于评估不同信道分配策略。Jayaweera 等 [35] 认识到共存的重要性，提出基于优化的动态技术与信道选择方法，但其仿真依赖 MATLAB、不含全功能 V2X 协议栈。

尽管这些工具能建模不同技术，标准版 ns-3 等仿真器不支持 Wi-Fi 与蜂窝协议之间的相互干扰 [14]；C-V2X 扩展 [57], [58] 与原生 IEEE 802.11p 支持虽有，精确共存建模仍具挑战性。基于 ns-3、SUMO [17] 与 CARLA [18] 的 ms-van3t 支持多技术与 ETSI 基础服务，但在本工作之前缺乏对相互干扰的详细建模。OMNeT++ [59] 是另一流行网络仿真器，已通过 Veins [36] 与 OpenCV2X [37] 等框架扩展到 V2X，但它不提供蜂窝与 Wi-Fi 技术共存的一体化仿真手段，且与 ns-3 相比面向真实部署的架构更复杂。在本工作之前，WiLabV2XSim [33] 是唯一能原生建模多 V2X 技术同信道干扰的开源仿真器。

### B. V2X 仿真器与射线追踪器的集成

虽然 ns-3、OMNeT++ 与基于 MATLAB 的工具在共存建模上不同，它们普遍依赖随机或解析信道模型（如 Winner [60]），提供平均指标但在复杂环境中难以保证精度。这些模型往往无法捕捉分组级干扰，也无法反映造成反射、绕射与阴影的环境障碍影响。为克服这些局限，已有工作探索把射线追踪集成进系统级车辆仿真：Ruz Nieto 等 [38] 把 Opal 射线追踪器 [61]（基于 NVIDIA OptiX、采用弹射与反射射线（SBR）方法的开源引擎）与 OMNeT++ 集成以仿真 LoRaWAN 通信，虽有前景但不含移动性或标准化 V2X 协议。[40] 中 Rusca 等用真实移动性数据开发了基于 MATLAB 的 RT 框架以计算精确信道参数（路径增益、相移、到达角等），聚焦 PHY 层并支持高级信道仿真，但缺乏标准兼容的 V2X 协议栈且需要商业 MATLAB 许可（这是所有使用内置 RT 引擎的 MATLAB 仿真器的通病 [62]）。Gaugel 等 [41] 把射线追踪器输出引入 ns-3 以获得更精确的 PHY 模型，可实现分组接收的比特级仿真，但集成为离线方式、不支持真实移动性或完整车辆协议栈。更集成的方案 **ns3sionna** 由 Zubow 等 [42] 最近提出，把 Sionna RT 与 ns-3 耦合以仿真 IEEE 802.11ac；其方法依赖 ZeroMQ 做进程间通信。

### C. 现有射线追踪器比较

（原文在此处比较开源与商业射线追踪器在精度、速度、可定制性与许可方面的差异，并讨论与本框架所用 Sionna RT 的选择依据；详见原文 PDF。）

### D. 车辆数字孪生

（原文综述车辆 DT 相关工作，包括基于录制移动性轨迹构建精确数字表示 [40]、地铁站完整室内行人场景的 DT [69] 等，并说明 VaN3Twin 与它们的区别；详见原文 PDF。）

**表 VI（原文 Table VI）：V2X 框架与 VaN3Twin 的比较（重点：共存与射线追踪集成）**

| 框架/研究 | 支持的 RAT | DSRC 与 C-V2X 共存 | 射线追踪 | V2X 协议 | 全栈实现 | 开源 |
|---|---|---|---|---|---|---|
| WiLabV2XSim [33] | IEEE 802.11p、LTE-V2X、NR-V2X | ✓ | ✗ | ✗ | ✓ | – |
| LTEV2VSim [34] | IEEE 802.11p、LTE-V2X | ✗ | ✗ | ✗ | – | ✓ |
| Jayaweera 等 [35] | IEEE 802.11p、LTE-V2X | ∼（基于 MATLAB 的数值结果） | ✗ | ✗ | – | ✗ |
| Veins [36] | IEEE 802.11p、LTE-V2X [37] | ✗ | ✗（可按 [38] 方式潜在集成） | ✓（ETSI 协议栈需 Artery [39]） | – | ✓ |
| Rusca 等 [40] | 技术无关的单 RAT | ✗ | ✓（MATLAB RT） | ✗ | ✗ | ✓ |
| Gaugel 等 [41] | 技术无关的单 RAT | ✗ | ∼（离线 RT 轨迹） | ✗ | ✗ | ✗ |
| ns3sionna [42] | IEEE 802.11 | ✗ | ✓（Sionna RT 在环） | ✗ | – | ✓ |
| DT-CoVeSS [43] | C-V2X | ✗ | ✓（定制 Sionna RT） | ∼（支持 SAE J3161 与多版本 [16]） | – | – |
| **VaN3Twin** | **LTE-V2X、NR-V2X、IEEE 802.11p** | **✓** | **✓（Sionna RT 在环）** | **✓（ETSI 协议栈，支持 LTE-V2X、NR-V2X）** | **✓** | **✓** |

## VI. 结论

本工作提出 **VaN3Twin**<sup>5</sup>（脚注 5：VaN3Twin 与本文结果所用的仿真配置文件及其射线追踪场景见 https://github.com/DriveX-devs/VaN3Twin），一个可扩展的 V2X NDT，能够以前所未有的精度复现异构技术的共存。通过把开源射线追踪引擎 Sionna RT 集成进全栈 ms-van3t 仿真器，我们实现了高保真传播建模、跨多通信技术的可扩展仿真，以及时频级的精确干扰跟踪。对比仿真表明，经典随机模型产生过度简化、往往误导的结果——例如与 VaN3Twin 中基于射线的模型相比，基于 SINR 的接收判定最多有 **49%** 的不匹配；ms-van3t 未考虑 NLoSv 场景进一步扩大该不匹配，在易发生车辆遮挡的情形下导致 **60%** 的分歧。相对真实测量的验证确认了 VaN3Twin 在传播层与应用层保真度上的改进：使用射线追踪在农村场景中把分组接收 DR 降低**超过 50%**，在复杂城市环境中降低**超过 70%**。这些改进使 VaN3Twin 成为场地特定验证、大规模共存测试与标准化支持的有价值工具，例如对 3GPP Rel. 18 [70] 引入的新特性（基于机器学习的调度、增强 NR-V2X 侧链、改进定位）进行安全预部署评估，以及用 VaN3Twin 生成的数据集训练 AI 模型、支持网络规划运营。未来工作将把更多 PHY 功能（如波形生成与多天线系统）卸载到 GPU，以提升仿真速度、并可能通过减少对抽象的依赖来提升精度；此外将系统分析……（原文续见 PDF）。

## 参考文献（英文原书目）

[1] S. Abuelsamid. (2018) Toyota has big plans to get cars talking to each other and infrastructure in the U.S. [Online]. Available: https://www.forbes.com/

[2] B. M. Masini, A. Bazzi, and A. Zanella, "A survey on the roadmap to mandate on board connectivity and enable V2V-based vehicular sensor networks," 2018.

[3] 5G Automotive Association, "An assessment of LTE-V2X (PC5) and 802.11p direct communications technologies for improved road safety in the EU," 5GAA, 2017.

[4] C-Roads Platform. (2024) Webinar: From Vision to Reality – Operational C-ITS Services.

[5] M. Lucarelli. (2023) Auto, cycling and tech innovators launch Coalition for Cyclist Safety based on V2X deployments.

[6] Euro NCAP. (2022) Mercedes-Benz Car-to-X Communication.

[7] Ford Media Center. (2019) Ford accelerates connectivity strategy in China; targets production of first C-V2X-equipped vehicle in 2021.

[8] A. Bazzi, A. Zanella, I. Sarris, and V. Martinez, "Co-channel coexistence: Let ITS-G5 and sidelink C-V2X make peace," in 2020 IEEE MTT-S International Microwave Workshop Series on 5G Hardware and System Technologies (IMWS-5G), 2020.

[9] P. Roux and V. Mannoni, "Performance evaluation for co-channel coexistence between ITS-G5 and LTE-V2X," in 2020 IEEE 92nd Vehicular Technology Conference (VTC2020-Fall), 2020.

[10] CAR 2 CAR Communication Consortium, "White paper on additional investigation of ITS-G5 and sidelink LTE-V2X co-channel coexistence methods," White Paper, 2021.

[11] M. Rapelli, F. Raviglione, and C. Casetti, "OScar: An ETSI-compliant C-ITS stack for field-testing with embedded hardware devices," in 2024 22nd Mediterranean Communication and Computer Networking Conference (MedComNet), 2024.

[12] S. Roongpraiwan, Z. Li, T. Yu, and K. Sakaguchi, "Digital twin-enabled blockage-aware dynamic mmWave multi-hop V2X communication," 2025.

[13] R. Pegurri, F. Linsalata, E. Moro, J. Hoydis, and U. Spagnolini, "Toward digital network twins: Integrating Sionna RT in ns-3 for 6G multi-RAT network simulations," 2025.

[14] G. F. Riley and T. R. Henderson, The ns-3 Network Simulator. Berlin, Heidelberg: Springer, 2010, pp. 15–34.

[15] J. Hoydis, S. Cammerer, F. Ait Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, "Sionna: An open-source library for next-generation physical layer research," arXiv, 2022.

[16] F. Raviglione, C. R. Carletti, M. Malinverno, C. Casetti, and C. Chiasserini, "ms-van3t: An integrated multi-stack framework for virtual validation of V2X applications," 2023.

[17] P. A. Lopez, M. Behrisch, L. Bieker-Walz, J. Erdmann, Y.-P. Flötteröd, R. Hilbrich, L. Lücken, J. Rummel, P. Wagner, and E. Wießner, "Microscopic traffic simulation using SUMO," in 2018 IEEE International Conference on Intelligent Transportation Systems (ITSC), 2018.

[18] A. Dosovitskiy, G. Ros, F. Codevilla, A. Lopez, and V. Koltun, "CARLA: An open urban driving simulator," in Conference on Robot Learning. PMLR, 2017.

[19] "TraCI," https://sumo.dlr.de/docs/TraCI.html.

[20] OpenStreetMap contributors, "Planet dump retrieved from https://planet.osm.org," 2017.

[21] M. Lecci, P. Testolina, M. Polese, M. Giordani, and M. Zorzi, "Accuracy versus complexity for mmWave ray-tracing: A full-stack perspective," IEEE Transactions on Wireless Communications, 2022.

[22] Google Maps Data, ©2025 Airbus, Maxar Technologies.

[23] PC Engines, "APU2E4 system board schema." [Online]. Available: https://www.pcengines.ch/apu2e4.htm

[24] ArduSimple, "simpleRTK2B Fusion description and specifications." [Online]. Available: https://www.ardusimple.com/product/simplertk2b-fusion/

[25] F. Raviglione, M. Malinverno, and C. Casetti, "Open source platform for IEEE 802.11p NICs evaluation," in 2019 IEEE 20th International Symposium on A World of Wireless, Mobile and Multimedia Networks (WoWMoM), 2019.

[26] MobileMark, "SMWG-313 description and specifications." [Online]. Available: https://www.mobilemark.com/product/smwg-313-2xdsrc-gns/

[27] ITU-R P.2040-1, "Effects of building materials and structures on radiowave propagation above about 100 MHz," Jul. 2015.

[28] G. Liu and L. Kong, "Simulation of video streaming over wireless networks with ns-3," 2023. [Online]. Available: https://arxiv.org/abs/2302.1419

[29] 3GPP TR 36.885: Study on LTE-based V2X services, 3GPP Technical Report 36.885, version 14.0.0, 2016.

[30] 3GPP TR 38.901: Study on channel model for frequencies from 0.5 to 100 GHz, 3GPP Technical Report 38.901, 2019.

[31] Z. Ali, S. Lagén, L. Giupponi, and R. Rouil, "3GPP NR V2X Mode 2: Overview, models and system-level evaluation," IEEE Access, vol. 9, pp. 89554–89579, 2021.

[32] M. Drago, T. Zugno, M. Polese, M. Giordani, and M. Zorzi, "MilliCar: An ns-3 module for mmWave NR V2X networks," in Proceedings of the 2020 Workshop on ns-3, 2020.

[33] V. Todisco, S. Bartoletti, C. Campolo, A. Molinaro, A. O. Berthet, and A. Bazzi, "Performance analysis of sidelink 5G-V2X Mode 2 through an open-source simulator," IEEE Access, vol. 9, 2021.

[34] A. Bazzi, G. Cecchini, M. Menarini, B. M. Masini, and A. Zanella, "Survey and perspectives of vehicular Wi-Fi versus sidelink cellular-V2X in the 5G era," Future Internet, vol. 11, no. 6, 2019.

[35] S. Jayaweera, S. Manosha, N. Rajatheva, and M. Latva-aho, "Co-existence of ITS-G5 and C-V2X at an urban road intersection," in 2021 Joint European Conference on Networks and Communications & 6G Summit (EuCNC/6G Summit), 2021.

[36] C. Sommer, R. German, and F. Dressler, "Bidirectionally coupled network and road traffic simulation for improved IVC analysis," IEEE Transactions on Mobile Computing, vol. 10, no. 1, pp. 3–15, 2011.

[37] B. McCarthy and A. O'Driscoll, "OpenCV2X Mode 4: A simulation extension for cellular vehicular communication networks," in 2019 IEEE 24th International Workshop on Computer Aided Modeling and Design of Communication Links and Networks (CAMAD), 2019.

[38] A. Ruz-Nieto, E. Egea-Lopez, J.-M. Molina-García-Pardo, and J. Santa, "A 3D simulation framework with ray-tracing propagation for LoRaWAN communication," Internet of Things, 2023.

[39] R. Riebl, H.-J. Günther, C. Facchi, and L. Wolf, "Artery: Extending Veins for VANET applications," in 2015 International Conference on Models and Technologies for Intelligent Transportation Systems (MT-ITS), 2015.

[40] R. Rusca, F. Raviglione, C. Casetti, P. Giaccone, and F. Restuccia, "Mobile RF scenario design for massive-scale wireless channel emulators," in 2024 IEEE International Conference on Communications (ICC), 2024.

[41] T. Gaugel, L. Reichardt, J. Mittag, T. Zwick, and H. Hartenstein, "Accurate simulation of wireless vehicular networks based on ray tracing and physical layer simulation," 2009.

[42] A. Zubow, Y. Pilz, S. Rösler, and F. Dressler, "ns3 meets Sionna: Using realistic channels in network simulation," arXiv, cs.NI 2412.20524, 2024.

[43] G. Twardokus and H. Rahbari, "DT-CoVeSS: Advancing NextG C-V2X security evaluation through high-fidelity digital twinning," in IEEE INFOCOM WKSHPS, 2024.

[44] M. Malinverno, F. Raviglione, C. Casetti, C.-F. Chiasserini, J. Mangues-Bafalluy, and M. Requena-Esteso, "A multi-stack simulation framework for vehicular applications," 2020.

[45] B. Williams, Automated Driving Levels, 2021, pp. 19–41.

[46] L. Cazzella, F. Linsalata, M. Magarini, M. Matteucci, and U. Spagnolini, "A multi-modal simulation framework to enable digital twin-based V2X communications," 2024.

[47] V. Vukadinovic, K. Bakowski, P. Marsch, I. D. Garcia, H. Xu, M. Sybis, P. Sroka, K. Wesolowski, D. Lister, and J. Thibault, "3GPP C-V2X and IEEE 802.11p for vehicle-to-vehicle communications in highway platooning scenarios," Ad Hoc Networks, vol. 74, 2018.

[48] R. Molina-Masegosa, J. Gozalvez, and M. Sepulcre, "Comparison of IEEE 802.11p and LTE-V2X: An evaluation with periodic and aperiodic messages of constant and variable size," IEEE Access, vol. 8, 2020.

[49] E. Moradi-Pari, D. Tian, M. Bahramgiri, S. Rajab, and S. Bai, "DSRC versus LTE-V2X: Empirical performance analysis of direct vehicular communication technologies," IEEE Transactions on Intelligent Transportation Systems, 2023.

[50] F. Raviglione, M. Malinverno, S. Feraco, G. Avino, C. Casetti, C. F. Chiasserini, N. Amati, and J. Widmer, "Experimental assessment of IEEE 802.11p and LTE-V2X," 2024.

[51] P. Testolina, M. Polese, J. M. Jornet, T. Melodia, and M. Zorzi, "Modeling interference for the coexistence of 6G networks and passive sensing systems," 2023.

[52] V. Maglogiannis, D. Naudts, S. Hadiwardoyo, D. van den Akker, J. Marquez-Barja, and I. Moerman, "Experimental V2X evaluation for C-V2X and ITS-G5," IEEE Transactions on Network and Service Management, 2022.

[53] M. Elloumi, M. Z. Hassan, and G. Kaddoum, "Spectrum sharing in internet-of-vehicles networks: Digital twin-empowered proactive interference management," 2024.

[54] V. Maglogiannis et al., "Experimental V2X evaluation for C-V2X and ITS-G5," 2022.

[55] A. Bazzi, S. Bartoletti, A. Zanella, and V. Martinez, "Performance analysis of IEEE 802.11p preamble insertion in C-V2X sidelink signals for co-channel coexistence," 2023.

[56] M. H. Manshaei, M. Krunz, and A. Yousseef, "Performance evaluation of DSRC and C-V2X coexistence in the 5.895–5.925 GHz spectrum," in 2024 International Conference on Computing, Networking and Communications (ICNC), 2024.

[57] F. Eckermann, M. Kahlert, and C. Wietfeld, "Performance analysis of C-V2X Mode 4 communication introducing an open-source C-V2X simulator," in 2019 IEEE 90th Vehicular Technology Conference (VTC2019-Fall), 2019.

[58] Z. Ali, S. Lagén, L. Giupponi, and R. Rouil, "3GPP NR V2X Mode 2: Overview, models and system-level evaluation," IEEE Access, vol. 9, 2021.

[59] A. Varga and R. Hornig, "An overview of the OMNeT++ simulation environment," in Proceedings of the 1st International Conference on Simulation Tools and Techniques for Communications, Networks and Systems, 2008.

[60] P. Kyösti, J. Meinilä, L. Hentilä, X. Zhao, T. Jämsä, C. Schneider, M. Narandzic, M. Milojević, A. Hong, J. Ylitalo, V.-M. Holappa, M. Alatossava, R. Bultitude, Y. Jong, and T. Rautiainen, "WINNER II channel models," 2007.

[61] E. Egea-Lopez, J. M. Molina-Garcia-Pardo, M. Lienard, and P. Degauque, "Opal: An open source ray-tracing propagation simulator for electromagnetic characterization," 2021.

[62] The MathWorks, Inc. (2024) Ray tracing for wireless communications. [Online]. Available: https://www.mathworks.com/help/comm/ug/ray-tracing-for-wireless-communications.html

[63] M. Zhu, L. Cazzella, F. Linsalata, M. Magarini, M. Matteucci, and U. Spagnolini, "Toward real-time digital twins of EM environments: Computational complexity and beyond," 2024.

[64] Remcom Wireless InSite. [Online]. Available: https://www.remcom.com/wireless-insite-em-propagation-software

[65] M. Elloumi, G. Kaddoum, M. Zoheb Hassan, and B. Selim, "Digital-twin-empowered interference management for multihop internet of vehicles networks," 2024.

[66] Z. Wang, X. Liao, X. Zhao, K. Han, P. Tiwari, M. J. Barth, and G. Wu, "A digital twin paradigm: Vehicle-to-cloud based advanced driver assistance systems," in 2020 IEEE 91st Vehicular Technology Conference (VTC2020-Spring), 2020.

[67] M. Rapelli, C. Casetti, and G. Gagliardi, "TUST: From raw data to vehicular traffic simulation in Turin," in 2019 IEEE/ACM 23rd International Symposium on Distributed Simulation and Real Time Applications (DS-RT), 2019.

[68] ——, "Vehicular traffic simulation in the city of Turin from raw data," IEEE Transactions on Mobile Computing, vol. 21, no. 12, pp. 4656–4666, 2022.

[69] M. Rapelli, G. S. Pannu, F. Dressler, and C. Casetti, "Content sharing in pedestrian-based micro clouds," in 2022 IEEE 95th Vehicular Technology Conference (VTC2022-Spring), 2022.

[70] 3rd Generation Partnership Project. (2022) 3GPP Release 18. [Online]. Available: https://www.3gpp.org/release18

## 图注与表注

**图注：** 图 1–10 的图注已随文置于第 II–IV 节相应位置：图 1（VaN3Twin 框架总览：ms-van3t 高层架构 + Sionna RT 集成，三条数据流以蓝/红/绿标识）；图 2（整个框架流程图）；图 3（两次测量区域与 DT：农村 a/b、城市 c/d，Tx 红、Rx 黄沿绿轨迹）；图 4（现场测试车辆装置）；图 5（农村 RSSI 实测与仿真对比 a、PDF b）；图 6（城市 NLoS 的 RSSI 与 PDF）；图 7（一般场景 SINR PDF 三配置）；图 8（频繁 NLoSv 场景 SINR PDF 三配置）；图 9（干扰检测与可解码性判定的传播层 DR）；图 10（NR-V2X 受 802.11p 干扰的仿真快照）。

**表注：** 表 I（射线追踪参数）、表 II（分组接收 DR，农村/城市各 3 个数值）、表 III（NR-V2X 参数）、表 IV（IEEE 802.11p 参数）、表 V（可扩展性：5 组车辆数 × 缓存命中率/加速比/平均与 P95 开销）、表 VI（9 个框架与 VaN3Twin 在 RAT/共存/射线追踪/协议/全栈/开源六维上的比较）均已在本页相应位置呈现；表 II–VI 逐格转写，表 I 按原文条目列出。

**本页范围与校对状态：** 本页覆盖原文摘要、Index Terms、第 I–VI 节全部正文与小节（II-A–C、III-A–B、IV-A–C、V-A–D）、式 (1)–(16)、算法 1、表 I–VI、图 1–10 图注、参考文献 [1]–[70]（英文原条目）。原文无附录。**许可说明（重要）：** 原文为 IEEE Transactions on Wireless Communications 正式版（Author's Accepted Manuscript，DOI 10.1109/TWC.2026.3685710，© 2026 IEEE），再传播许可条款待核验；本页为个人学习用途的中文译稿，**不计入可公开全文统计**，页首与页尾均保留该说明。**原文说明 4 处已加注：** ① 式 (4)、(6)、(11)–(14) 在 PDF 中跨栏/跨页断排，本页按原文编号 + 文字定义准确描述，未改写公式；② 第 III.B 节末、第 VI 结论末在 PDF 中跨页截断，按可见部分翻译并标注"（原文续见 PDF）"；③ 第 V.C（射线追踪器比较）与 V.D（车辆数字孪生）两小节在原文中以连续段落呈现，本页给出结构化说明并注明详见 PDF；④ 表 VI 中"∼"表示部分支持、"–"表示原表未列，按原文照录。逐句逐式终校未做；供后续 QA 重点核对：式 (5)–(8) 的信道模型与 LoS 指示、式 (10) 的 3GPP LoS 概率、式 (15)–(16) 的 SINR 计算、表 II/V/VI 数值。

{% endraw %}
