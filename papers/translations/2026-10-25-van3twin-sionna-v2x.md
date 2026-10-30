---
layout: page
title: "VaN3Twin：射线追踪闭环下的多技术 V2X 数字孪生｜中文译稿（2026-10-30 补译，未逐句终校）"
permalink: /papers/translations/2026-10-25-van3twin-sionna-v2x/
math: true
toc: true
---

[← 返回论文库](/papers/) · [IEEE DOI](https://doi.org/10.1109/TWC.2026.3685710) · [项目源码](https://github.com/DriveX-devs/VaN3Twin)

# VaN3Twin：将射线追踪引入仿真闭环的多技术 V2X 数字孪生

**原题：** VaN3Twin: the Multi-Technology V2X Digital Twin with Ray Tracing in the Loop  
**作者：** Roberto Pegurri、Diego Gasco、Francesco Linsalata、Marco Rapelli、Eugenio Moro、Francesco Raviglione、Claudio Casetti  
**来源：** *IEEE Transactions on Wireless Communications*, Vol. 25 (2026), pp. 16812–16827；DOI: 10.1109/TWC.2026.3685710。  
**译稿状态（2026-10-25）：** 正文 I–VI 已补充框架设计、实测验证、多 RAT 同信道共存公式（1）–（16）、算法 1、主要实验表和相关研究；本轮补入表 VI 逐单元格转录、末页结论后续语句、原文脚注 5、致谢及参考文献 [1]—[70] 英文原书目。**尚非逐句逐式终校完成的全文译稿。**

## 摘要

本文介绍 VaN3Twin，这是首个开源、全协议栈网络数字孪生（network digital twin，NDT）框架，能够通过射线追踪提供准确的物理层建模，并仿真多种车联万物（vehicle-to-everything，V2X）通信技术的共存。VaN3Twin 通过将 Sionna Ray Tracer（RT）纳入仿真闭环，扩展了 ms-van3t 仿真器，使其能够高保真地表示无线传播，包括多样化的视距（line of sight，LoS）条件，尤其关注由其他车辆三维网格造成的视距遮挡、多普勒效应，以及散射、绕射等位置相关效应。

与传统仿真工具不同，所提出的框架支持对工作在共享频谱上的专用短程通信（dedicated short-range communication，DSRC）和蜂窝车联万物通信（cellular V2X，C-V2X）进行真实的共存分析。专用干扰跟踪模块在时频资源块级别捕获跨技术干扰，并改进信干噪比（signal-to-interference-plus-noise ratio，SINR）估计，消除了分别使用 LoS 与非视距（non-line of sight，NLoS）传播模型所导致的双峰现象等人为伪影。与实地测量相比，相对于当前最先进的仿真工具，VaN3Twin 在乡村环境中将应用层不一致程度降低了 50%，在城市环境中降低了超过 70%，证明了其在大规模、准确的数字孪生 V2X 共存仿真中的价值。

**索引词：** V2X、射线追踪、车联网、Sionna RT、ms-van3t、ns-3、同信道共存、网络数字孪生。

## I. 引言

2016 年，丰田成为首家推出具备车联万物（V2X）通信能力商用车辆的汽车制造商；这些面向日本市场的车辆使用基于 IEEE 802.11p 的专用短程通信（DSRC）技术 [1]。此后不久，美国和欧洲也分别出现类似部署 [2]、[3]，对应的汽车制造商包括通用汽车和大众集团。如今，V2X 市场持续发展，越来越多的车辆能够与部署在主要公路沿线的数千个路侧单元（roadside unit，RSU）进行通信 [4]。

但从技术角度看，V2X 生态日益复杂。自 3GPP Release 14 于 2017 年引入 LTE-V2X 后，丰田推动亚洲 V2X 市场转向蜂窝 V2X（C-V2X），而欧洲仍主要依赖 IEEE 802.11p。不过，奥迪、梅赛德斯和福特等大型车企也经常宣布未来采用 C-V2X 技术的部署计划，包括 LTE-V2X 和新兴的 NR-V2X 标准 [5]–[7]。因此，来自不同制造商、可能采用不同 V2X 技术的车辆很快会在道路上共存，从而给互操作性、标准化和协调部署带来重大挑战。鉴于这一趋势及其重要性，许多车载单元（on-board unit，OBU）和 RSU 厂商开始为产品配备多种 V2X 技术的支持能力。

然而，不同技术共存仍是一项重大挑战。在美国，联邦通信委员会（FCC）已将 5.9 GHz 安全频段中的 45 MHz 重新分配给免许可业务，并将剩余 30 MHz 专门保留给 C-V2X；2024 年 12 月出台的后续规则要求传统 DSRC 设施完成迁移。在欧洲，C-V2X 和 IEEE 802.11p 都在 5.8–5.9 GHz 频段运行，因此同信道干扰已经成为 V2X 研究的关键问题。许多研究人员和车联网产业联盟正在积极研究这些挑战 [8]–[10]，它们已成为 V2X 领域最受关注的问题之一。

在真实共存场景中预测 C-V2X 与 DSRC 的性能非常复杂，在搭载一种或多种 V2X 技术的大规模城市车队场景中尤为如此。尽管面向车载实地测试的仿真与仿真器框架已有进展 [11]，但在真实环境下开展全面的技术共存和同信道干扰研究，仍然需要庞大的 V2X 车辆车队，而且这些车辆必须能够支持一种或多种无线接入技术（radio access technology，RAT）。现有厂商的 OBU 通常每次只能支持一种 RAT，例如 DSRC 或 C-V2X，而不能同时支持两者。这使大规模共存场景的实地测试在后勤、经济和技术层面均面临困难。因此，先进的仿真工具对于分析未来车联网的大规模复杂场景不可或缺；准确的干扰建模对于灵活频谱利用和异构无线技术之间的有效频谱共享也至关重要。

除传统仿真目标之外，高保真建模也是网络数字孪生（NDT）这一新兴范式的基础 [12]。NDT 旨在实时创建网络的精确副本，因此仿真模型需要在通信协议栈的各层保持较高精度 [13]。在 V2X 无线网络中，这项要求尤为重要：系统运行条件会因高速移动、复杂传播环境（尤其是城市环境）和多 RAT 共存而迅速变化。在这类场景中，依据最终仿真目标的不同，精确度往往不可或缺，只有如此才能保证数字副本忠实反映其物理对应系统。仿真器的真实性越高，生成的模型通常也就越精细、越可靠。

然而，迄今为止，能够纳入真实信道模型的车联网仿真工具仍然很少。例如，基于网络仿真器 ns-3 [14] 的工具通常依赖随机信道模型，省略了确定性阴影遮挡、多径效应表征和全面的传播损耗建模等关键特征。特别是在车对车（V2V）场景中，另一个极其重要的局限是，这些模型未能考虑周围车辆对接收信号的影响。此外，能够原生支持 IEEE 802.11p、LTE-V2X、NR-V2X 等多种通信技术完整协议栈，以及 ETSI 规范高层协议的车联网仿真器十分有限。这些限制妨碍了基于车联网仿真开展可靠的同信道干扰研究。弥补上述不足，对于增进对共存场景的认识、提高基于仿真的研究可信度十分重要。

本文提出 VaN3Twin¹，将用于高保真无线信道建模的开源 Sionna RT [15] 集成至 ms-van3t V2X 仿真器 [16]，形成可用于 NDT 的可靠全协议栈、多 RAT V2X 仿真框架。VaN3Twin 还原生支持多种通信技术的共存建模，并能够在模拟传播环境中同时考虑建筑物、树木、路侧基础设施等静态对象，以及车辆、行人等动态对象。

ms-van3t 是基于 ns-3 的先进开源 V2X 仿真器，支持 ETSI 兼容 V2X 应用的设计、仿真和硬件在环仿真。但作为 ns-3 原生仿真器，ms-van3t 传统上依靠概率模型模拟无线信道效应。尽管这些模型适合大规模仿真，但也可能过度简化物理层现象，降低动态且存在严重干扰的环境中的仿真准确度。通过使用射线追踪，VaN3Twin 克服了这一缺陷，弥合了高层车联网仿真与真实传播建模之间的差距。

**本文的主要贡献如下：**

1. 实现了首个开源、全协议栈、支持多 RAT 的 V2X 网络数字孪生 VaN3Twin，通过射线追踪克服传统随机信道模型和频率相关模型的限制。不同于仅将 Sionna RT 集成到 ns-3 仿真循环的研究 [13]，本文重点构建完整的 V2X NDT，并明确考虑多种 V2X 技术在同一频谱内共存的情况。
2. 开发了自适应、模块化框架，允许射线追踪组件在配备 GPU 的专用服务器上运行，而 VaN3Twin 其余部分可在另一台机器上运行。这种分工既优化了计算资源，又提高了高保真城市级 V2X 仿真的可扩展性。
3. 通过乡村和城市真实测试场景中的实地测量验证 VaN3Twin 的数字孪生能力。与先进仿真工具相比，其传播层和分组接收层仿真结果均更贴近测量数据，在乡村环境中将与实测数据的不一致程度降低 50%，城市环境中降低超过 70%。
4. 开发统一的技术共存建模框架，可模拟在共享频谱中同时部署一种或多种 RAT 的异构系统。其中包括专用共存模块，将同信道共存效应纳入 SINR 估计。
5. 证明基于射线的仿真能够提高共存场景中的 SINR 估计精度，产生更平滑的 SINR 分布，并消除分别使用 LoS 和 NLoS 传播模型所造成的人为双峰现象。

本文余下部分安排如下：第二节详细介绍 VaN3Twin，重点说明灵活架构、射线追踪集成、数据交换和移动同步；第三节通过城乡真实车辆测量验证传播模型；第四节介绍多 RAT 干扰管理共存模块，并分析性能及可扩展性；第五节讨论相关研究；第六节总结全文。

¹ 项目地址：[DriveX-devs/VaN3Twin](https://github.com/DriveX-devs/VaN3Twin)；Sionna 地址：[nvlabs/sionna](https://github.com/nvlabs/sionna)。

## II. VaN3Twin 框架

本节介绍所提出的架构，它将 Sionna RT 集成至现有 ms-van3t 工作流，如原文图 1 所示。该图展示从应用层到物理层的完整 ms-van3t 协议栈，以及模拟器支持的所有无线接入技术。图中还展示了 ms-van3t 的移动性接口：它可以与 SUMO [17]、CARLA [18] 移动仿真器交互，也可使用预先记录的车辆轨迹。

使用 SUMO 或 CARLA 时，每辆车的移动状态通过标准化接口获取。对于 SUMO，接口为交通控制接口（Traffic Control Interface，TraCI）[19]；对于 CARLA，接口为 OpenCDA。移动数据最终由 ms-van3t 的移动模型接收，并经由车辆数据提供器（vehicle data provider，VDP）模块传递至相应协议层。

原文图 1 下方还展示了与 Sionna RT 的集成关系。该集成通过 UDP 套接字实现数据交换，从而得到快速、模块化的架构。射线追踪器既可以与 ms-van3t 在同一台本地机器上运行，也可以部署在计算能力更强的远程服务器上。模块化是 VaN3Twin 的关键特征。基于 ms-van3t 及其底层 ns-3 引擎，VaN3Twin 的每个模块都能够被替换、扩展或重新实现，包括协议栈、信道模型、移动性模式和性能指标。Sionna RT 本身同样开源且高度可定制，还可以通过专用适配器接口被完整替换，而无需改变集成逻辑。这一设计最大程度地保证了二次开发灵活性，并促进未来射线追踪技术的集成。

关于 ms-van3t 与射线追踪引擎之间的信息交换，系统设置了三类数据流，分别对应原文图 1、图 2 中的不同颜色：① 数字孪生初始化，包括建筑物和路侧基础设施以及车辆网格映射；② 车辆动态位置更新；③ 信道参数请求及响应。下面分别说明。

### A. 数字孪生模型初始化与车辆网格映射

射线追踪器在三维场景中运行，场景同时包含静态和动态对象，每个对象都用三维网格表示。网格的几何形状决定对象的实际外形，而金属、玻璃、塑料等材料属性则决定电磁特性，并影响电磁波与物体表面的相互作用。建筑物、道路标志和路侧单元等静态对象在仿真期间保持不变，构成数字孪生模型的固定部分。

为了在建模环境中支持车辆交通仿真，本文从 OpenStreetMap（OSM）[20] 提取包含建筑物多边形的场景拓扑，并将其导入 SUMO 交通仿真器。由此能够构建场景基础设施的完整数字孪生模型。与之相对，动态对象用于表示车辆等移动实体。本文从所支持的移动仿真器中选取乘用车、轿车、卡车、公交车等多种车辆网格，并将每辆车的网格进一步划分为车身、车灯、车窗、轮辋等部件，从而为不同部件分配适当的无线电材料属性。

令仿真涉及的车辆集合为 $\mathcal V=\{v_1,v_2,\ldots,v_N\}$，时刻 $t$ 的活动车辆集合为 $\mathcal V_{\rm active}(t)\subseteq\mathcal V$。所有车辆对应的三维网格集合为 $\mathcal M=\{M_{v_1},M_{v_2},\ldots,M_{v_N}\}$，其中 $M_{v_n}$ 包含车辆 $v_n$ 的几何和材料属性。每辆活动车辆均设置发送、接收天线，并根据车体位置更新天线坐标。原文式（1）将天线坐标表示为车体参考点位置与固定安装偏移量之和。

对于每辆车，通过一对一映射 $\varphi:v_n\mapsto M_{v_n}$ 绑定其网格。数字孪生初始化与该网格映射仅在仿真开始时进行一次，之后保持不变，因此不产生持续的映射初始化开销。当车辆变为活动状态时，其网格才根据物理状态与动态位置更新进行同步。

### B. 动态位置更新

在仿真时刻 $t$，车辆 $v_n$ 具有位置向量 $\mathbf p_{v_n}(t)=[x_{v_n}(t),y_{v_n}(t),z_{v_n}(t)]$、速度向量 $\boldsymbol\nu_{v_n}(t)$ 和航向角 $\theta_{v_n}(t)$。每个仿真时间步都从 ms-van3t 的移动模型获取活动车辆类别、ID、位置和方向等信息。

为获得一致且时间同步的移动对象表示，移动仿真器生成的动态位置更新通过 ms-van3t 移动模型发送至射线追踪器。具体来说，每当车辆 $v_n$ 在时刻 $t$ 获得更新后的移动状态时，系统便发送包含 $\{\mathbf p_{v_n}(t),\boldsymbol\nu_{v_n}(t),\theta_{v_n}(t)\}$ 的位置更新消息。射线追踪器接收后，根据更新后的位置和朝向重新布置车辆网格，使传播环境反映车辆网络随时间变化的几何形状和运动学状态。速度信息还用于计算多普勒频移及相应的信道相干时间。

为避免每次微小位移都触发射线追踪场景更新，作者设置了最小更新距离阈值：

$$
\Delta d_{\min}=\max\!\bigl(\Delta d_0,\ \nu_{v_n}(t)\tau_{\rm coh}\bigr). \tag{2}
$$

其中 $\Delta d_0$ 为基础位移阈值，$\tau_{\rm coh}$ 为信道相干时间，$\nu_{v_n}(t)$ 为车辆当前速度。位置更新仅在车辆相对于上次更新位置的位移大于该阈值时进行：

$$
\|\mathbf p_{v_n}(t)-\mathbf p_{v_n}(t')\|>\Delta d_{\min}. \tag{3}
$$

这里 $t'\lt t$ 表示上次网格更新时间。若车辆网格尚未完成过位置更新，则始终满足首次更新条件。作者指出，多普勒阈值可能造成过于频繁的更新，因此车辆仿真通常采用较大的基础位移阈值，具体数值依场景经验确定。

### C. 信道参数请求与响应

第三类数据交换发生在射线追踪组件与 ms-van3t 物理层之间。当 ms-van3t 中的 RAT 模型检测到两辆活动车辆即将通信时，便向射线追踪器发出信道参数请求，绕过 ns-3 原生的信道计算机制。射线追踪器收到请求后，计算对应车辆网格天线之间的传播路径集合。

尽管请求最初可能由某一辆发送车与接收车的通信触发，射线追踪引擎仍会计算当前所有活动车辆之间的成对传播路径，避免重复计算。该策略利用 GPU 并行化，使场景分析成本分摊到多次信道查询。假设信道满足互易性，则

$$
\mathcal R_{v_i,v_j}=\mathcal R_{v_j,v_i}
=\{r_1,r_2,\ldots,r_K\}. \tag{4}
$$

每条路径 $r_k$ 都具有复增益 $\alpha_k$、传播时延 $\tau_k$、出发方向、到达方向和多普勒频移 $\phi_k$ 等参数。只有满足交互类型、角分辨率、反弹次数等物理和几何约束的路径才被保留。计算路径集合中可以同时包含 LoS 与 NLoS 分量。原文式（5）据此构造时变多径信道冲激响应。

对于发往物理层的信道参数响应，作者提取总路径增益、最小传播时延和 LoS 指示量：

$$
G_{v_i,v_j}=\sum_{k=1}^{K}|\alpha_k|^2,\qquad
\tau_{v_i,v_j}=\min\{\tau_1,\ldots,\tau_K\}. \tag{6--7}
$$

其中 $G_{v_i,v_j}$ 是全部传播路径的功率和；$\tau_{v_i,v_j}$ 表示最短路径的传播时延。LoS 指示量 $\lambda_{v_i,v_j}$ 在存在至少一条 LoS 路径时取 1，否则取 0，见原文式（8）。

为提高计算效率，射线追踪路径集合存储在缓存 $\mathcal C$ 中，供后续请求重复使用。缓存未命中时，对所有活动车辆对计算传播路径并存储结果；命中时则直接使用缓存。当任意活动车辆状态发生改变，致使其网格更新时，系统使所有车辆对的缓存失效。尽管这一策略相对保守，却能够保证缓存始终与当前场景一致，并反映车辆等移动散射体对多径、接收功率和信号质量的动态影响。




## 补译：III. VaN3Twin 基于真实数据的验证（原文第 5–8 页，部分）

为评估 VaN3Twin 对 V2X 网络中真实无线传播的复现能力，作者开展了两次测量活动：一次在意大利韦尔切利省 Sali Vercellese 的乡村环境（图 3a），另一次在都灵市中心（图 3c）。实测使用文献 [11] 详细介绍、图 4 展示的专用设备。图 4a 中包括 PC Engines APU2E4 嵌入式主板及 ArduSimple simpleRTK2B Fusion 板卡。车载单元运行 OpenWrt-V2X 操作系统和提供完整 ETSI C-ITS 协议栈的 Open Stack for car（OScar）框架。ArduSimple 板卡使用实时动态定位（RTK）服务实现厘米级 GNSS 定位。图 4b 中的 MobileMark SMWG-313 是车载磁吸式多频段天线，同时为 GNSS 接收机和 V2X 频段的两个 MIMO 天线单元提供支持。

两辆车使用相同的设备配置。一辆停放在路侧，作为发送端 Tx，按固定时间间隔周期性发出协同感知消息（Cooperative Awareness Message，CAM）；另一辆车在道路上移动，充当接收端 Rx。两次实测分别在图 3a 和图 3c 所示区域进行。每次成功收到分组时，接收端记录载荷、事件的 UNIX 时间戳、测量的平均接收信号强度指示（RSSI）和当前 GPS 坐标。

VaN3Twin 中用于射线追踪的数字孪生场景（图 3b、图 3d）通过 Blender 及其 Blosm 插件建立，后者从 OpenStreetMap 导入传播环境的 2.5D 表示。依据 ITU-R P.2040 建议，建筑物采用混凝土材料；存在树木时，将整棵树作为木质对象建模；地面使用混凝土，车辆则采用具有金属车身的完整三维网格，以考虑其散射作用。射线追踪引擎模拟镜面反射、漫反射与折射，每条射线最多发生五次相互作用。发送和接收天线近似为各向同性，与实测设备的天线特征相适应。

**表 I：VaN3Twin 的射线追踪参数。**

| 参数 | 配置 |
|---|---|
| 载波频率 | 5.89 GHz |
| 建筑物及道路材料 | 混凝土 [27] |
| 树木材料 | 木材 [27] |
| 车辆材料 | 金属 [27] |
| 反射机制 | 镜面反射、漫反射 |
| 折射 | 启用 |
| 最大交互次数 | 5 |
| 天线类型 | 各向同性 |
| 极化方式 | 垂直极化 |
| Tx 与 Rx 高度 | 1.8 m |

虽然本次验证使用低速率 CAM 业务，但 VaN3Twin 支持更广泛的应用层业务配置，例如具有高数据率和严格时延要求的协同感知、传感器共享以及自适应视频流业务。选择 CAM 的原因在于实测硬件能够产生该类流量，从而实现仿真与实测的直接对照。底层 ns-3 支持任意业务流量模式，因此可拓展至其他应用配置。

验证分为两个层次：（i）传播层：比较真实接收端测得的 RSSI 与虚拟接收端的对应结果；（ii）分组接收层：比较虚拟接收端与真实数据集中分组接收事件的一致程度。为衡量后一层面的复现准确性，作者引入不一致率（Disagreement Ratio，DR），以两个实体的二元判定结果之间的差异进行度量。设 $\mathcal R$ 和 $\mathcal M$ 分别是两个实体判为正的结果集合，其对称差 $\mathcal R\triangle\mathcal M$ 表示仅有一方判为正的结果，则

$
\mathrm{DR}=\frac{|\mathcal R\triangle\mathcal M|}{|\mathcal R\cup\mathcal M|}. \tag{9}
$

DR 越小表示两者的判定越一致，越大则说明分歧越显著。为全面对比随机传播模型、基于射线追踪的传播模型与真实测量，作者还使用原生 ms-van3t 运行相同的仿真。此时 ms-van3t 采用根据 3GPP TR 36.885 [29] 构建的随机传播模型，根据距离以概率方式决定 LoS 状态，其 LoS 概率为

$
P_{\mathrm{LoS}}=\min\left(\frac{18}{d},1\right)\left(1-e^{-d/36}\right)+e^{-d/36}. \tag{10}
$

其中 $d$ 是收发双方之间的距离。与射线追踪不同，这个模型由 3GPP 规范固定定义，不包含可调参数。乡村测量中收发双方保持完整 LoS，城市测量中的发射天线高度也接近典型蜂窝微小区基站，因而两个场景均较好地符合该模型的使用条件，使比较具有参考价值。实车测量以及 VaN3Twin、原生 ms-van3t 两种仿真均采用 IEEE 802.11p 通信协议栈。

### A. 乡村 LoS 场景

第一组测量在意大利韦尔切利附近 Sali Vercellese 的乡村地区进行，场地开阔且平坦，没有建筑物或树木等障碍物。接收车辆沿图 3a、图 3b 所示直线道路往返行驶，与停放不动的发送车辆始终保持不间断 LoS。该场景为之后更复杂的城市测量提供基准。

图 5 对比了不同模型的传播结果：蓝色表示实际测量，绿色表示 VaN3Twin，红色表示原生 ms-van3t。图 5a 的 RSSI 曲线显示，实测信号与 VaN3Twin 沿接收车辆整个轨迹得到的信号趋势高度一致。在这一简单传播场景下，ms-van3t 的结果也与实测基本吻合，但其曲线过于平滑，缺乏局部波动。这反映了该理论传播模型未刻画小尺度传播效应的固有限制。图 5b 中三组 RSSI 数据的概率密度函数也表现出整体相近的趋势。

在分组接收层面，原生 ms-van3t 与真实测量之间的 DR 为 **12.82%**；VaN3Twin 则将这一差异几乎减半，降至 **6.5%**。即使在非常简单的传播环境中，引入射线追踪仍能够提高分组接收结果的复现精度。

**图 3：** 两处测量区域及其数字孪生：Sali Vercellese 乡村场景的卫星视图 (a) 和射线追踪复现场景 (b)；都灵城市场景的卫星视图 (c) 和射线追踪复现场景 (d)。两个数字孪生场景中，静止 Tx 用红色标记表示，Rx 用黄色标记表示并沿绿色轨迹移动。

**图 4：** 实车测试的设备配置：(a) OBU 与 ArduSimple GNSS 设备；(b) MobileMark 磁吸式天线。

**图 5：** Sali Vercellese 乡村场景的测量与仿真 RSSI 比较：(a) 实测 RSSI 与 VaN3Twin、ms-van3t 估计 RSSI；(b) 三组数据的 RSSI 概率密度函数。

**补译范围说明：** 此处补录了原文第三节的实验装置、验证方法、公式（9）–（10）、表 I 与乡村场景结果。城市场景后半部分、第四节多 RAT 共存、第五节文献综述、第六节结论、其他图表及参考文献仍缺少完整逐段译文，尚不能认定全文完工。


## 补译：III-B. 城市 NLoS 场景及验证汇总

第二组现场测量在意大利都灵市中心进行。与乡村场景不同，该环境包含密集建筑和复杂街道布局，收发车辆之间的直接传播路径会受到建筑物阻挡。图 6a 比较实测 RSSI 与两种仿真器输出：VaN3Twin 能更准确地跟随实测信号强度的连续变化；相比之下，原生 ms-van3t 的 RSSI 呈现突然且频繁的跳变。这是因为其采用式（10）的 LoS 概率判定，并在两套独立的 LoS/NLoS 路径损耗模型之间刚性切换。

图 6b 的概率密度函数（PDF）更加直观地显示上述差别。VaN3Twin 的 RSSI 分布与现场数据在均值和离散程度上更加接近，而 ms-van3t 的结果明显呈双峰分布，产生不符合现场观测的聚集现象，无法反映真实传播的平滑变化。对城市 NLoS 场景计算分组接收不一致率，原生 ms-van3t 达到 27.9%，VaN3Twin 降至 8.16%。尽管 ms-van3t 所用的 3GPP 随机模型专门针对含 NLoS 的城市环境进行校准，射线追踪方法仍能将该指标改善至原来的不到三分之一。

**表 II：ms-van3t 与 VaN3Twin 对真实分组接收事件的重现误差。**

| 场景 | ms-van3t DR | VaN3Twin DR | 相对下降 |
|---|---:|---:|---:|
| 乡村 Sali Vercellese | 12.82% | 6.50% | 49.3% |
| 都灵市中心 | 27.90% | 8.16% | 70.8% |

因此，VaN3Twin 的确定性射线传播模型不仅改善传播层 RSSI 的复现，也提高了应用层分组接收事件的逐点一致性。下节在此基础上引入跨 RAT 共存模块，将其他发射车辆造成的干扰纳入信道和分组接收模拟。

**图 6：** 都灵城市实测场景的 RSSI 对比。（a）真实测量（蓝）、VaN3Twin（绿）、ms-van3t（红）的 RSSI 曲线；（b）三者 RSSI 的概率密度函数。

## IV. VaN3Twin 的多 RAT 共存

射线追踪能够构造一致而贴近实际的无线信道模型，因此作者进一步开发专用的共存模块。原生 ms-van3t 虽然允许使用不同 RAT 的车辆出现在同一仿真场景中，却不计算一种 RAT 的发射对另一种 RAT 的干扰。新的模块显式处理不同车联网技术的同时传输在频谱上完全或部分重叠的情况，从而评价跨 RAT 干扰对通信性能的影响。本节比较三种配置：（1）无共存模块的原生 ms-van3t；（2）使用原生传播模型但启用共存模块的 ms-van3t；（3）启用共存模块并采用 VaN3Twin 射线传播模型。

### A. 共存模块的实现

原生 ms-van3t 对不同 RAT 分别使用默认传播模型。LTE-V2X 和 NR-V2X 通常采用基于 3GPP 的模型 [29]、[30]，它们与 IEEE 802.11p 的默认传播模型并不一致；而且这些模型通常以概率方式决定 LoS 状态，难以精确表示复杂环境。ms-van3t 允许通过外部输入覆盖 LoS 状态，也可导入二维建筑图自动决定遮挡。但后二者分别需要外部信道状态与耗时、精度有限的建筑物盒状几何建模。VaN3Twin 则直接采用统一的射线追踪信道表示（式（5）），确保不同 RAT 获得相同物理环境下的一致传播参数，这对于共享频谱中的共存研究尤为重要。

设启用共存功能的 RAT 集合为 $\mathcal W$。任一 $w\in\mathcal W$ 的载波中心频率、带宽、子载波间隔和子载波数量分别记作 $f_c^{(w)}$、$B^{(w)}$、$\Delta f^{(w)}$、$L^{(w)}$。对应子信道频率集合为

$
\mathcal F^{(w)}
=\left\{f_c^{(w)}+l\,\Delta f^{(w)}\right\},\quad
f_c^{(w)}+l\,\Delta f^{(w)}
\in\left[f_c^{(w)}-\frac{B^{(w)}}2,\ f_c^{(w)}+\frac{B^{(w)}}2\right],
\quad l\in\mathcal L^{(w)}. \tag{11}
$

为了计算跨 RAT 干扰，需要构建覆盖全部无线技术的统一时频资源网格。令 $\mathcal S^{(w)}$ 为技术 $w$ 对应的时隙集合，则

$
\mathcal Z^{(w)}=\mathcal F^{(w)}\times\mathcal S^{(w)}, \tag{12}
$

$
\mathcal Z=\mathcal F\times\mathcal S,\qquad
\mathcal F=\bigcup_{w\in\mathcal W}\mathcal F^{(w)},\quad
\mathcal S=\bigcup_{w\in\mathcal W}\mathcal S^{(w)}. \tag{13}
$

对任一资源块 $z\in\mathcal Z$，$\mathcal W(z)\subseteq\mathcal W$ 表示此时使用该块的 RAT 集合。共存模块连续观察信道，跟踪使用这些技术的所有发射事件。设 $\mathcal V_{\rm tx}(t)\subseteq\mathcal V_{\rm active}(t)$ 为时刻 $t$ 的发射车辆集合，每辆发射车 $v_n$ 对应一个跟踪对象

$
H_{v_n}=\bigl(w\in\mathcal W,\ f_c^{(w)},\ B^{(w)},\ T,\ S(f)\bigr), \tag{14}
$

其中 $T$ 是发射持续时间，$S(f)$ 是功率谱密度（PSD）。对于资源块 $z$ 中使用 RAT $w$ 的期望发射，SINR 定义为

$
\mathrm{SINR}_{w,z}=
\frac{P_{\mathrm{Rx},w,z}}
{N_{0,z}+P_{\mathrm{int},w}
+\displaystyle\sum_{w'\ne w}P_{\mathrm{Rx},w',z}}. \tag{15}
$

其中 $P_{\mathrm{Rx},w,z}$ 为期望信号接收功率，$N_{0,z}$ 为噪声功率，$P_{\mathrm{int},w}$ 为同一 RAT 内其他车辆引起的干扰功率，$P_{\mathrm{Rx},w',z}$ 为不同 RAT $w'$ 的干扰功率。对于使用技术 $w'$ 的干扰车 $v_{\rm int}$，若它到接收车 $v_r$ 的总路径增益 $G_{v_{\rm int},v_r}$ 小于预设门限 $G_{\rm thr}$，则忽略该干扰；否则根据干扰车的 PSD 和路径增益计算其接收干扰功率。最后，在全部资源块上以带宽相关权重 $\omega_z$ 求加权平均：

$
\mathrm{SINR}_w=
\frac{1}{|\mathcal Z|}\sum_{z\in\mathcal Z}
\omega_z\,\mathrm{SINR}_{w,z}. \tag{16}
$

**算法 1：包含跨 RAT 干扰的 SINR 评估。** 输入为启用的技术集合 $\mathcal W$，以及各技术的子信道集合 $\mathcal F^{(w)}$ 和时隙集合 $\mathcal S^{(w)}$。首先遍历全部 RAT，构建频率并集 $\mathcal F$ 和时隙并集 $\mathcal S$，再令 $\mathcal Z=\mathcal F\times\mathcal S$，跟踪全部活动发射车辆。对于每个时频块 $z$，确定其活动 RAT 集合 $\mathcal W(z)$；对每个活动 RAT $w$，先将总干扰初始化为同 RAT 干扰 $P_{\rm int,tot}=P_{\rm int,w}$，再遍历使用其他 RAT $w'\ne w$ 的已跟踪干扰车辆。如果 $G_{v_{\rm int},v_r}\ge G_{\rm thr}$，将对应的 $P_{\rm Rx,w',z}$ 累加至 $P_{\rm int,tot}$。完成所有干扰发射车的处理后，计算 $\mathrm{SINR}_{w,z}$；最后按权重 $\omega_z$ 汇总得到各 RAT 的整体 $\mathrm{SINR}_w$。

### B. 启用共存模块的多 RAT 仿真

为验证共存机制，在含建筑物和障碍物的城市环境中安排 20 辆车行驶，因而场景同时包含 LoS 和 NLoS 链路。数字孪生按第三节的方法构建，射线追踪配置使用表 I。每辆车按照 ETSI 规则周期性发送 CAM 和集体感知消息（Collective Perception Message，CPM），各 RAT 均使用 5.9 GHz 载波和 10 MHz 带宽。20 辆车各有 10 辆使用 IEEE 802.11p、10 辆使用 NR-V2X。程序先读取 SUMO 的 XML 路径文件以确定车辆，再为车辆创建代表 C-ITS 站的 ns-3 节点、相应设施层服务、物理层和 MAC 层，并按照第二节所述机制同步 ns-3、SUMO 与 Sionna RT。

**表 III：NR-V2X 参数。**

| 参数 | 数值 |
|---|---|
| 载频；信道/子信道带宽 | 5.9 GHz；10/10 MHz |
| Numerology；MCS | 2；14 |
| PSSCH 侧链路 RSRP 门限 | 21 dB |
| PSSCH 资源块数；每资源块发送次数 | 10；3 |
| 预留周期 | 20 ms |
| 调制；子载波间隔 | OFDM；60 kHz |
| 发射功率；灵敏度；SINR 门限 | 30 dBm；−93 dBm；10 dB |
| 资源选择 | 随机选择 [31] |
| 路径损耗模型；侧链路模式 | 基于 3GPP [30]；PC5 Mode 4 |

**表 IV：IEEE 802.11p 参数。**

| 参数 | 数值 |
|---|---|
| 载频；带宽 | 5.9 GHz；10 MHz |
| 物理层调制 | OFDM |
| 发射功率；灵敏度；SINR 门限 | 30 dBm；−93 dBm；10 dB |
| 传输速率 | 3 Mb/s |
| 媒体接入方式 | CSMA/CA |
| 路径损耗模型 | 基于 3GPP [29] |

仿真先在不考虑共存干扰的原生 ms-van3t 上运行，然后分别在使用原生传播模型与 VaN3Twin 射线传播模型的共存模块上重复运行。为了在两种模型之间保持可比的 LoS 条件，作者将 VaN3Twin 射线追踪器判断的 LoS 状态直接注入 ms-van3t。图 7 显示全部 V2V 链路的 SINR 概率密度：VaN3Twin 输出近似高斯状分布，而两个 ms-van3t 配置都有显著双峰。这与前述 LoS/NLoS 两种模型的硬切换一致。即使注入射线追踪判定的 LoS 信息，基于 3GPP 的模型仍倾向高估 SINR；未建模跨 RAT 干扰的原始版本高估程度更严重。

周围车辆还会形成车辆遮挡引起的非视距（NLoSv）。原生 ms-van3t 无法专门处理这种状态，通常将其保守地归入建筑物等大型障碍造成的 NLoS。图 8 选取经常发生 NLoSv 的链路，VaN3Twin 仍保持相对连续的 SINR 分布，而两种 ms-van3t 配置均显著高估 SINR，并在约 10 dB 附近形成明显峰值。

图 9 展示两类传播层不一致率。对干扰源是否具有显著影响的判断，ms-van3t（启用共存）与 VaN3Twin 在普通场景中的 DR 为 21.72%，经常发生 NLoSv 时增至 34.69%。进一步将这种误差传播到基于 SINR 的分组可解码判断，两个场景的不一致率分别达到 **49.11%** 和 **60.18%**。在图 10 所示两辆 NR-V2X 车辆的通信实例中，干扰功率估计相差最多 17.53 dBm，对应 SINR 差异为 4 dB。

从应用层的整体分组接收率（PRR）看，NR-V2X 在原生 ms-van3t 下达到 97%；启用跨 RAT 共存模块后降为 93%；VaN3Twin 估计为 84%。聚合指标差异相对有限，与 CAM、CPM 载荷较小及 NR-V2X 重传机制有关；但逐分组的结果远非一致。在普通场景中，启用共存的 ms-van3t 与 VaN3Twin 的分组接收 DR 为 30.56%；在车辆相距较近、频繁发生 NLoSv 的场景中，DR 为 18.43%。由此可见，单看较高的整体 PRR，可能掩盖许多具体通信事件在仿真中的时空位置发生了偏差。这对于要求在具体时刻重现现实状态的网络数字孪生而言尤其重要。

**图 7：** 三种仿真配置产生的全部 V2V 链路 SINR 概率密度。**图 8：** 频繁出现 NLoSv 的车辆链路的 SINR 概率密度。**图 9：** 普通场景和频繁出现 NLoSv 场景的干扰源检测与可解码判定 DR。**图 10：** 存在车辆遮挡的 NR-V2X 链路仿真快照：目标收发车标为红色，使用 IEEE 802.11p 的干扰车标为蓝色，蓝色射线显示部分干扰路径。

### C. 运行成本与可扩展性

为了评估射线追踪的运算代价，作者在 5、10、20、40、60 辆活动车辆下记录每次信道参数计算的实际墙钟时间。工作站运行 Ubuntu 22.04.5，配备 NVIDIA GeForce RTX 3090（25 GB 显存）、16 个 3.00 GHz Intel Core i9-10980XE CPU 和 256 GB 内存。使用 Sionna RT v1.2.0，配置与表 I 相同，但将每条射线的最大交互次数改为 3，并启用第二节介绍的缓存机制。由于缓存命中与完整射线计算的成本差异悬殊，作者分别报告完整场景快照的耗时和缓存命中率。

**表 V：不同车辆数量下的运行统计。**

| 活动车辆数 | 缓存命中率 | 加速比 | 平均完整计算（ms） | P95（ms） |
|---|---:|---:|---:|---:|
| 5 | 92.65% | 13.5× | 168.56 | 204.14 |
| 10 | 95.97% | 24.7× | 196.30 | 253.25 |
| 20 | 98.46% | 64.1× | 232.98 | 295.65 |
| 40 | 99.02% | 150.6× | 252.03 | 468.66 |
| 60 | 99.58% | 237.1× | 446.25 | 847.61 |

车辆越多，完整射线追踪快照的计算成本越高，但一次并行计算也会产生更多车辆对的传播路径，因而缓存的后续命中率更高；在 60 辆车时命中率达到 99.58%，缓存与成组计算的系统级加速达到约 237 倍。作者还指出，降低孪生状态更新频率并结合车辆轨迹预测预先安排射线追踪计算，有望进一步逼近实时运行；大规模场景亦可拆分为多个部署于网络边缘的小型数字孪生。

## V. 相关研究（正文补译）

### A. 同信道共存仿真

自动驾驶向 SAE 4、5 级演进，需要在安全、可控环境中测试新的 V2X 服务；因此精确模拟物理层和 MAC 层及其交互非常重要。以往的仿真和现场试验较多针对单项技术，研究多项技术共享同一信道时的相互干扰则较少。部分研究使用不同频段，因此没有建模相互干扰；其他方法通过学习式资源分配研究单项 RAT 内部的干扰感知调度，尚未提供完整 V2X 协议栈。在 IEEE 802.11p 与 C-V2X Mode 4 共存研究中，WiLabV2XSim、LTEV2VSim 等 MATLAB 工具已用于改进前导码和信道分配策略；还有研究通过优化动态选择技术与信道，但未实现完整协议栈。基于 ns-3 的 ms-van3t 将 SUMO、CARLA、ETSI 高层服务和多 RAT 协议集成起来，仍缺少精确的跨 RAT 相互干扰。OMNeT++ 的 Veins、OpenCV2X 等扩展可用于 V2X，但并未提供蜂窝协议与基于 Wi-Fi 的协议同信道共存的一体化模拟途径。就本文调查的现有开源方案而言，WiLabV2XSim 是此前少数能够以简化方式模拟多 V2X 技术同信道干扰的工具。

### B. 车联网仿真与射线追踪集成

传统 ns-3、OMNeT++ 和 MATLAB 模拟通常依赖 Winner 等随机或解析信道模型，适用于整体统计性能，却难以重现复杂环境中的反射、绕射、阴影与逐分组干扰。已有研究将基于 NVIDIA OptiX 的开源 Opal 射线追踪器接入 OMNeT++，但目标为 LoRaWAN，缺少移动性与标准化 V2X 协议。另有 MATLAB 射线追踪方案用实测移动轨迹估计路径增益、相位和到达角，然而侧重物理层且依赖商业 MATLAB。也有 ns-3 方案利用离线射线追踪结果进行比特级分组仿真，但未将实时移动性与完整车联网协议栈集成。近期 ns3sionna 将 Sionna RT 经 ZeroMQ 接入 ns-3，用于室内外 IEEE 802.11ac WLAN。本文则采用轻量 UDP 将 Sionna RT 接入 ms-van3t，以支持完整 V2X 协议栈、不同 RAT、SUMO/CARLA 或真实 GPS 驱动的车辆移动性，以及同信道共存。面向 C-V2X 安全性评价的 DT-CoVeSS 也集成了定制 Sionna RT，但不模拟 DSRC 与 C-V2X 的并行共存。

### C. 射线追踪引擎比较

射线追踪效率对于动态车辆场景尤为关键。由于商业软件内部实现通常不可见，实际墙钟时间基准测试是比较不同引擎的一种可行办法。文献 [63] 比较了 Remcom Wireless InSite、Sionna RT 和 MathWorks Ray Tracing Toolbox，在低分辨率简化城市几何与基于 CARLA 的高分辨率写实场景中分别测试。Sionna RT 在两种场景下均获得较低执行时间，利用 GPU 并行化时尤为明显。不过计算速度不能单独保证准确性，因此本文还通过第三节的真实测量验证其所在完整仿真框架。Sionna RT 同时具有开源优势，便于复现和扩展。

### D. 车辆数字孪生

数字孪生可用于对物理系统状态进行建模，并通过仿真观察其随时间的演化。针对 V2X 网络，来自现实的车辆与环境数据被持续导入孪生模型，模型计算结果可进一步反馈至实际车联网，从而形成闭环。数字孪生也能够在部署前重建环境、移动性或历史数据，以研究不同网络配置下的演化；在混合模式中，还可向真实系统引入实时通信的虚拟节点，降低实验成本。VaN3Twin 的原生仿真/仿真器模式同样支持这一能力。已有 RAVEN 平台将车载数据与环境上下文结合，预测车辆位置与信道，优化毫米波多跳车联网的干扰和容量；云端辅助驾驶数字孪生则在云侧处理决策并向车辆返回执行建议。TuST 利用真实交通数据重建都灵全城移动性，其他工作利用真实轨迹或地铁站行人流建立数字孪生，用于无线仿真。

**表 VI：V2X 框架与 VaN3Twin 的对照（重点为共存与射线追踪集成，按原表逐格转录）。** 表中 ✓ 表示支持，✗ 表示不支持，∼ 表示部分支持（括号内为原文注释）。

| 框架／研究 | 支持的 RAT | DSRC 与 C-V2X 共存 | 射线追踪 | V2X 完整协议栈实现 | 开源 |
| --- | --- | --- | --- | --- | --- |
| WiLabV2XSim [33] | IEEE 802.11p、LTE-V2X、NR-V2X | ✓ | ✗ | ✗ | ✓ |
| LTEV2VSim [34] | IEEE 802.11p、LTE-V2X | ✗ | ✗ | ✗ | ✓ |
| Jayaweera 等 [35] | IEEE 802.11p、LTE-V2X | ∼（基于 MATLAB 的数值结果） | ✗ | ✗ | ✗ |
| Veins [36] | IEEE 802.11p、LTE-V2X [37] | ✗ | ✗（可如 [38] 那样潜在集成） | ✓（ETSI 协议栈需 Artery [39]） | ✓ |
| Rusca 等 [40] | 与接入技术无关的单 RAT | ✗ | ✓（MATLAB RT） | ✗ | ✓ |
| Gaugel 等 [41] | 与接入技术无关的单 RAT | ✗ | ∼（离线 RT 轨迹） | ✗ | ✗ |
| ns3sionna [42] | IEEE 802.11 | ✗ | ✓（闭环 Sionna RT） | ✗ | ✓ |
| DT-CoVeSS [43] | C-V2X | ✗ | ✓（定制的 Sionna RT） | ∼（支持 SAE J3161 与 IEEE 1609.2） | ✓ |
| ms-van3t [16], [44] | IEEE 802.11p、LTE、LTE-V2X、NR-V2X | ✗ | ✗ | ✓（支持多个版本的 ETSI 协议栈 [16]） | ✓ |
| VaN3Twin | IEEE 802.11p、LTE、LTE-V2X、NR-V2X | ✓ | ✓（闭环 Sionna RT） | ✓（支持多个版本的 ETSI 协议栈 [16]） | ✓ |

由表 VI 可见：VaN3Twin 是表中同时具备多 RAT 支持、DSRC/C-V2X 共存、闭环 Sionna RT、ETSI 全协议栈与开源状态的方案。

## VI. 结论（正文补译）

本文提出可扩展的 V2X 网络数字孪生 VaN3Twin，将开源射线追踪器 Sionna RT 纳入 ms-van3t 的完整协议栈仿真闭环，提供高保真传播建模、多通信技术仿真以及时频级干扰跟踪。实验表明，传统随机模型可能输出过度简化甚至误导性的结果：与 VaN3Twin 的射线模型相比，基于 SINR 的分组接收判定在普通场景存在最高约 49% 的差异，频繁发生 NLoSv 时扩大至约 60%。真实环境验证说明，射线追踪降低了传播层和应用层的误差，乡村分组接收 DR 改善约 49.3%，复杂城市环境改善约 70.8%。

该框架可用于特定场景验证、大规模异构技术共存研究、标准化支持和新特性的安全预部署测试，例如 3GPP Release 18 [70] 引入的机器学习调度、增强 NR-V2X 侧链路与改进定位；还可用来产生训练 AI 模型的数据和支持网络规划。

**未来工作（原文末页续译）：** 作者计划把更多物理层功能——例如波形生成与多天线系统——卸载到 GPU，以减少对抽象化的依赖，从而提高仿真速度并可能提高精度。此外，未来工作将系统分析计算性能与仿真精度之间的折中，例如调节射线追踪参数（交互类型、最大交互深度）以及让网络数字孪生（NDT）的更新速率适配不同环境的动态特性。另一条可行的未来方向是评估能否利用通用软件无线电外设（USRP）硬件及相关软件（如 OpenAirInterface 或 srsRAN）开展额外的 C-V2X 现场测试，以便把 VaN3Twin 的输出与真实测量数据进一步对比；随着兼容硬件进入市场，这些测试也将使用专用的 C-V2X 芯片组进行。最后，未来工作还包括更深入地研究 VaN3Twin 的实时能力，并利用其仿真（emulation）模式与真实联网车辆对接。

> **原文脚注 5：** VaN3Twin 及其仿真配置文件、用于采集本文结果的射线追踪场景，均可在 GitHub 仓库 https://github.com/DriveX-devs/VaN3Twin 获取。

## 致谢（ACKNOWLEDGMENTS，按原文补译）

本出版物属于 PNRR-NGEU 项目，获得 MUR - DM 117/2023 资助。本文在欧盟“下一代欧盟”（NextGenerationEU）意大利国家复苏与韧性计划（NRRP）框架下获得支持，参与“未来通信”（Telecommunications of the Future）伙伴计划（PE00000001，项目“RESTART”，结构性项目 6GWINET）。本研究亦在 MOST——可持续交通国家研究中心（Sustainable Mobility National Research Center）内开展，并获欧盟 Next-GenerationEU 资助（PNRR，MISSIONE 4 COMPONENTE 2，INVESTIMENTO 1.4，D.D. 1033 17/06/2022，CN00000023）。

## 参考文献

> 以下按原文编号 [1]—[70] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “V .”“W AN”“¨” 等为提取伪影，已按常规写法整理（如 V.、WAN、ö/é 等变音字母），书目内容未改动。原文 [54] 与 [52]、[58] 与 [31] 内容重复，系原文排版如此，照原样转录。

[1] S. Abuelsamid. (2018) Toyota Has Big Plans To Get Cars Talking To Each Other And Infrastructure In The U.S. [Online]. Available: https://www.forbes.com/sites/samabuelsamid/2018/04/16/toyota-launches-aggressive-v2x-communications-roll-out-from-2021/

[2] B. M. Masini, A. Bazzi, and A. Zanella, “A survey on the roadmap to mandate on board connectivity and enable V2V-based vehicular sensor networks,” Sensors, vol. 18, no. 7, p. 2207, 2018.

[3] 5G Automotive Association, “An assessment of LTE-V2X (PC5) and 802.11 p direct communications technologies for improved road safety in the EU,” 5G Automotive Association, Tech. Rep., December, 2017.

[4] C-Roads Platform. (2024) Webinar: From Vision to Reality - Operational C-ITS Services. [Online]. Available: https://www.c-roads.eu/platform/about/news/News/entry/show/webinar-from-vision-to-reality-operational-c-its-services.html

[5] M. Lucarelli. (2023) Auto, cycling and tech innovators launch Coalition for Cyclist Safety based on V2X deployments. [Online]. Available: https://media.audiusa.com/releases/586

[6] Euro NCAP. (2022) Mercedes-Benz Car-to-X Communication.

[7] Ford Media Center. (2019) Ford Accelerates Connectivity Strategy in China; Targets Production of First C-V2X-Equipped Vehicle in 2021.

[8] A. Bazzi, A. Zanella, I. Sarris, and V. Martinez, “Co-channel coexistence: Let ITS-G5 and sidelink C-V2X make peace,” in 2020 IEEE MTT-S International Conference on Microwaves for Intelligent Mobility (ICMIM). IEEE, 2020, pp. 1–4.

[9] P. Roux and V. Mannoni, “Performance evaluation for co-channel coexistence between ITS-G5 and LTE-V2X,” in 2020 IEEE 92nd Vehicular Technology Conference (VTC2020-Fall). IEEE, 2020, pp. 1–5.

[10] CAR 2 CAR Communication Consortium, “White paper on Additional Investigation of ITS-G5 and Sidelink LTE-V2X Co-Channel Coexistence Methods,” White Paper, Tech. Rep., 2022.

[11] M. Rapelli, F. Raviglione, and C. Casetti, “OScar: An ETSI-Compliant C-ITS Stack for Field-Testing with Embedded Hardware Devices,” in 2024 22nd Mediterranean Communication and Computer Networking Conference (MedComNet). IEEE, 2024, pp. 1–4.

[12] S. Roongpraiwan, Z. Li, T. Yu, and K. Sakaguchi, “Digital twin-enabled blockage-aware dynamic mmwave multi-hop v2x communication,” 2025. [Online]. Available: https://arxiv.org/abs/2503.03590

[13] R. Pegurri, F. Linsalata, E. Moro, J. Hoydis, and U. Spagnolini, “Toward digital network twins: Integrating sionna RT in ns-3 for 6G Multi-RAT networks simulations,” in IEEE INFOCOM WKSHPS: Digital Twins over NextG Wireless Networks (DTWIN 2025) (INFOCOM DTWIN 2025), London, United Kingdom (Great Britain), May 2025, p. 5.88.

[14] G. F. Riley and T. R. Henderson, The ns-3 Network Simulator. Berlin, Heidelberg: Springer Berlin Heidelberg, 2010, pp. 15–34. [Online]. Available: https://doi.org/10.1007/978-3-642-12331-3_2

[15] J. Hoydis, S. Cammerer, F. Ait Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, “Sionna: An Open-Source Library for Next-Generation Physical Layer Research,” arXiv preprint, Mar. 2022.

[16] F. Raviglione, C. R. Carletti, M. Malinverno, C. Casetti, and C. Chiasserini, “ms-van3t: An integrated multi-stack framework for virtual validation of V2X communication and services,” Computer Communications, vol. 217, pp. 70–86, 2024. [Online]. Available: https://www.sciencedirect.com/science/article/pii/S0140366424000227

[17] P. A. Lopez, M. Behrisch, L. Bieker-Walz, J. Erdmann, Y.-P. Flötteröd, R. Hilbrich, L. Lücken, J. Rummel, P. Wagner, and E. Wießner, “Microscopic traffic simulation using sumo,” in The 21st IEEE International Conference on Intelligent Transportation Systems. IEEE, 2018. [Online]. Available: https://elib.dlr.de/124092/

[18] A. Dosovitskiy, G. Ros, F. Codevilla, A. Lopez, and V. Koltun, “Carla: An open urban driving simulator,” in Conference on robot learning. PMLR, 2017, pp. 1–16.

[19] “Traci,” https://sumo.dlr.de/docs/TraCI.html.

[20] OpenStreetMap contributors, “Planet dump retrieved from https://planet.osm.org,” https://www.openstreetmap.org, 2017.

[21] M. Lecci, P. Testolina, M. Polese, M. Giordani, and M. Zorzi, “Accuracy versus complexity for mmwave ray-tracing: A full stack perspective,” IEEE Transactions on Wireless Communications, vol. 20, no. 12, pp. 7826–7841, 2021.

[22] Google Maps Data, ©2025 Airbus, Maxar Technologies. [Online]. Available: https://www.google.com/maps

[23] PC Engines, “APU2E4 System board schema.” [Online]. Available: https://www.pcengines.ch/apu2e4.htm

[24] ArduSimple, “simpleRTK2B Fusion description and specifications.” [Online]. Available: https://www.ardusimple.com/product/simplertk2b-fusion/

[25] F. Raviglione, M. Malinverno, and C. Casetti, “Open source platform for IEEE 802.11 p NICs evaluation,” in 2019 IEEE 20th International Symposium on "A World of Wireless, Mobile and Multimedia Networks" (WoWMoM). IEEE, 2019, pp. 1–3.

[26] MobileMark, “MGW-313 description and specifications.” [Online]. Available: https://www.mobilemark.com/product/smwg-313-2xdsrc-gns/

[27] ITU-R P.2040-1, “Effects of building materials and structures on radiowave propagation above about 100 MHz,” Jul. 2015.

[28] G. Liu and L. Kong, “Simulation of video streaming over wireless networks with ns-3,” 2023. [Online]. Available: https://arxiv.org/abs/2302.14196

[29] “3GPP TR 36.885: Study on LTE-based V2X Services,” 3rd Generation Partnership Project (3GPP), Technical Report 36.885, 2016, version 14.0.0. [Online]. Available: https://www.3gpp.org

[30] “3GPP TR 38.901: Study on channel model for frequencies from 0.5 to 100 GHz,” 3rd Generation Partnership Project (3GPP), Technical Report 38.901, 2017, version 14.0.0. [Online]. Available: https://www.3gpp.org

[31] Z. Ali, S. Lagén, L. Giupponi, and R. Rouil, “3gpp nr v2x mode 2: Overview, models and system-level evaluation,” IEEE Access, vol. 9, pp. 89 554–89 579, 2021.

[32] M. Drago, T. Zugno, M. Polese, M. Giordani, and M. Zorzi, “Millicar: An ns-3 module for mmwave nr v2x networks,” in Proceedings of the 2020 Workshop on ns-3, 2020, pp. 9–16.

[33] V. Todisco, S. Bartoletti, C. Campolo, A. Molinaro, A. O. Berthet, and A. Bazzi, “Performance analysis of sidelink 5g-v2x mode 2 through an open-source simulator,” IEEE Access, vol. 9, pp. 145 648–145 661, 2021.

[34] A. Bazzi, G. Cecchini, M. Menarini, B. M. Masini, and A. Zanella, “Survey and perspectives of vehicular wi-fi versus sidelink cellular-v2x in the 5g era,” Future Internet, vol. 11, no. 6, 2019. [Online]. Available: https://www.mdpi.com/1999-5903/11/6/122

[35] S. Jayaweera, S. Manosha, N. Rajatheva, and M. Latva-aho, “Co-existence of its-g5 and c-v2x at an urban road intersection,” in 2021 Joint European Conference on Networks and Communications & 6G Summit (EuCNC/6G Summit), 2021, pp. 253–258.

[36] C. Sommer, R. German, and F. Dressler, “Bidirectionally Coupled Network and Road Traffic Simulation for Improved IVC Analysis,” IEEE Transactions on Mobile Computing, vol. 10, no. 1, pp. 3–15, January 2011.

[37] B. McCarthy and A. O’Driscoll, “Opencv2x mode 4: A simulation extension for cellular vehicular communication networks,” in 2019 IEEE 24th International Workshop on Computer Aided Modeling and Design of Communication Links and Networks (CAMAD), 2019, pp. 1–6.

[38] A. Ruz-Nieto, E. Egea-Lopez, J.-M. Molina-García-Pardo, and J. Santa, “A 3D simulation framework with ray-tracing propagation for LoRaWAN communication,” Internet of Things, vol. 24, p. 100964, 2023. [Online]. Available: https://www.sciencedirect.com/science/article/pii/S2542660523002871

[39] R. Riebl, H.-J. Günther, C. Facchi, and L. Wolf, “Artery: Extending veins for vanet applications,” in 2015 International Conference on Models and Technologies for Intelligent Transportation Systems (MT-ITS), 2015, pp. 450–456.

[40] R. Rusca, F. Raviglione, C. Casetti, P. Giaccone, and F. Restuccia, “Mobile RF Scenario Design for Massive-Scale Wireless Channel Emulators,” in 2023 Joint European Conference on Networks and Communications & 6G Summit (EuCNC/6G Summit), 2023, pp. 675–680.

[41] T. Gaugel, L. Reichardt, J. Mittag, T. Zwick, and H. Hartenstein, “Accurate simulation of wireless vehicular networks based on ray tracing and physical layer simulation,” in High Performance Computing in Science and Engineering’11: Transactions of the High Performance Computing Center, Stuttgart (HLRS) 2011. Springer, 2012, pp. 619–630.

[42] A. Zubow, Y. Pilz, S. Rösler, and F. Dressler, “Ns3 meets Sionna: Using Realistic Channels in Network Simulation,” arXiv, cs.NI 2412.20524, 12 2024.

[43] G. Twardokus and H. Rahbari, “DT-CoVeSS: Advancing NextG C-V2X Security Evaluation through High-Fidelity Digital Twinning,” in IEEE INFOCOM WKSHPS: Digital Twins over NextG Wireless Networks (DTWIN 2025) (INFOCOM DTWIN 2025), London, United Kingdom (Great Britain), May 2025.

[44] M. Malinverno, F. Raviglione, C. Casetti, C.-F. Chiasserini, J. Mangues-Bafalluy, and M. Requena-Esteso, “A multi-stack simulation framework for vehicular applications testing,” in Proceedings of the 10th ACM Symposium on Design and Analysis of Intelligent Vehicular Networks and Applications, ser. DIVANet ’20. New York, NY, USA: Association for Computing Machinery, 2020, p. 17–24. [Online]. Available: https://doi.org/10.1145/3416014.3424603

[45] B. Williams, Automated Driving Levels, 2021, pp. 19–41.

[46] L. Cazzella, F. Linsalata, M. Magarini, M. Matteucci, and U. Spagnolini, “A multi-modal simulation framework to enable digital twin-based v2x communications in dynamic environments,” in 2024 IEEE 100th Vehicular Technology Conference (VTC2024-Fall), 2024, pp. 1–6.

[47] V. Vukadinovic, K. Bakowski, P. Marsch, I. D. Garcia, H. Xu, M. Sybis, P. Sroka, K. Wesolowski, D. Lister, and I. Thibault, “3gpp c-v2x and ieee 802.11p for vehicle-to-vehicle communications in highway platooning scenarios,” Ad Hoc Networks, vol. 74, pp. 17–29, 2018. [Online]. Available: https://www.sciencedirect.com/science/article/pii/S157087051830057X

[48] R. Molina-Masegosa, J. Gozalvez, and M. Sepulcre, “Comparison of IEEE 802.11p and LTE-V2X: An Evaluation With Periodic and Aperiodic Messages of Constant and Variable Size,” IEEE Access, vol. 8, pp. 121 526–121 548, 2020.

[49] E. Moradi-Pari, D. Tian, M. Bahramgiri, S. Rajab, and S. Bai, “Dsrc versus lte-v2x: Empirical performance analysis of direct vehicular communication technologies,” IEEE Transactions on Intelligent Transportation Systems, vol. 24, no. 5, pp. 4889–4903, 2023.

[50] F. Raviglione, M. Malinverno, S. Feraco, G. Avino, C. Casetti, C. F. Chiasserini, N. Amati, and J. Widmer, “Experimental assessment of ieee 802.11-based v2i communications,” in Proceedings of the 18th ACM Symposium on Performance Evaluation of Wireless Ad Hoc, Sensor, & Ubiquitous Networks, ser. PE-WASUN ’21. New York, NY, USA: Association for Computing Machinery, 2021, p. 33–40. [Online]. Available: https://doi.org/10.1145/3479240.3488506

[51] P. Testolina, M. Polese, J. M. Jornet, T. Melodia, and M. Zorzi, “Modeling Interference for the Coexistence of 6G Networks and Passive Sensing Systems,” IEEE Transactions on Wireless Communications, vol. 23, no. 8, pp. 9220–9234, 2024.

[52] V. Maglogiannis, D. Naudts, S. Hadiwardoyo, D. van den Akker, J. Marquez-Barja, and I. Moerman, “Experimental v2x evaluation for c-v2x and its-g5 technologies in a real-life highway environment,” IEEE Transactions on Network and Service Management, vol. 19, no. 2, pp. 1521–1538, 2022.

[53] M. Elloumi, M. Z. Hassan, and G. Kaddoum, “Spectrum sharing in internet-of-vehicles networks: Digital twin-empowered proactive interference management approach,” IEEE Transactions on Network and Service Management, pp. 1–1, 2025.

[54] V. Maglogiannis, D. Naudts, S. Hadiwardoyo, D. van den Akker, J. Marquez-Barja, and I. Moerman, “Experimental v2x evaluation for c-v2x and its-g5 technologies in a real-life highway environment,” IEEE Transactions on Network and Service Management, vol. 19, no. 2, pp. 1521–1538, 2022.

[55] A. Bazzi, S. Bartoletti, A. Zanella, and V. Martinez, “Performance analysis of ieee 802.11p preamble insertion in c-v2x sidelink signals for co-channel coexistence,” Vehicular Communications, vol. 45, p. 100710, 2024. [Online]. Available: https://www.sciencedirect.com/science/article/pii/S2214209623001407

[56] M. H. Manshaei, M. Krunz, and A. Yousseef, “Performance evaluation of dsrc and c-v2x coexistence in the 5.895-5.925 ghz spectrum,” in 2024 International Conference on Computing, Networking and Communications (ICNC), 2024, pp. 862–867.

[57] F. Eckermann, M. Kahlert, and C. Wietfeld, “Performance Analysis of C-V2X Mode 4 Communication Introducing an Open-Source C-V2X Simulator,” in 2019 IEEE 90th Vehicular Technology Conference (VTC2019-Fall), 2019, pp. 1–5.

[58] Z. Ali, S. Lagén, L. Giupponi, and R. Rouil, “3gpp nr v2x mode 2: Overview, models and system-level evaluation,” IEEE Access, vol. 9, pp. 89 554–89 579, 2021.

[59] A. Varga and R. Hornig, “An overview of the omnet++ simulation environment,” in Proceedings of the 1st International Conference on Simulation Tools and Techniques for Communications, Networks and Systems & Workshops, ser. Simutools ’08. Brussels, BEL: ICST (Institute for Computer Sciences, Social-Informatics and Telecommunications Engineering), 2008.

[60] P. Kyösti, J. Meinilä, L. Hentila, X. Zhao, T. Jämsä, C. Schneider, M. Narandzic, M. Milojević, A. Hong, J. Ylitalo, V.-M. Holappa, M. Alatossava, R. Bultitude, Y. Jong, and T. Rautiainen, “WINNER II channel models,” IST-4-027756 WINNER II D1.1.2 V1.2, 02 2008.

[61] E. Egea-Lopez, J. M. Molina-Garcia-Pardo, M. Lienard, and P. Degauque, “Opal: An open source ray-tracing propagation simulator for electromagnetic characterization,” PLOS ONE, vol. 16, no. 11, pp. 1–19, 11 2021. [Online]. Available: https://doi.org/10.1371/journal.pone.0260060

[62] The MathWorks, Inc. (2024) Ray Tracing for Wireless Communications. [Online]. Available: https://www.mathworks.com/help/comm/ug/ray-tracing-for-wireless-communications.html

[63] M. Zhu, L. Cazzella, F. Linsalata, M. Magarini, M. Matteucci, and U. Spagnolini, “Toward real-time digital twins of em environments: Computational benchmark for ray launching software,” IEEE Open Journal of the Communications Society, 2024.

[64] Remcom Wireless InSite. [Online]. Available: https://www.remcom.com/wireless-insite-em-propagation-software

[65] M. Elloumi, G. Kaddoum, M. Zoheb Hassan, and B. Selim, “Digital-twin-empowered interference management for multihop internet of vehicles networks over millimeter wave bands,” IEEE Internet of Things Journal, vol. 12, no. 11, pp. 17 807–17 827, 2025.

[66] Z. Wang, X. Liao, X. Zhao, K. Han, P. Tiwari, M. J. Barth, and G. Wu, “A digital twin paradigm: Vehicle-to-cloud based advanced driver assistance systems,” in 2020 IEEE 91st Vehicular Technology Conference (VTC2020-Spring), 2020, pp. 1–6.

[67] M. Rapelli, C. Casetti, and G. Gagliardi, “Tust: from raw data to vehicular traffic simulation in turin,” in 2019 IEEE/ACM 23rd International Symposium on Distributed Simulation and Real Time Applications (DS-RT), 2019, pp. 1–8.

[68] ——, “Vehicular traffic simulation in the city of turin from raw data,” IEEE Transactions on Mobile Computing, vol. 21, no. 12, pp. 4656–4666, 2022.

[69] M. Rapelli, G. S. Pannu, F. Dressler, and C. Casetti, “Content sharing in pedestrian-based micro clouds,” in 2022 IEEE 95th Vehicular Technology Conference: (VTC2022-Spring), 2022, pp. 1–6.

[70] 3rd Generation Partnership Project. (2022) 3GPP Release 18. [Online]. Available: https://www.3gpp.org/release18

**校对状态：** 本轮在既有译稿基础上补齐：第 V 节表 VI 的逐单元格转录、第 VI 节末页结论后续语句（未来工作）、原文脚注 5、致谢段落，以及参考文献 [1]—[70] 的英文原书目。正文 I–VI、第三节的真实数据验证、公式（1）–（16）、算法 1 与表 I–V 均沿用既有译文（已在前轮补入）；逐句逐式与 PDF 的终校仍未完成，本页不冒充全文精校。

---
**原文归属：** © 2026 IEEE。版权及再传播许可以出版方和机构知识库声明为准。未在本站重复上传原文 PDF、图像或扫描页。
