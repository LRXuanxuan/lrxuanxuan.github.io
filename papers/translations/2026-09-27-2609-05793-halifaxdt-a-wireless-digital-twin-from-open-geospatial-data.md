---
layout: page
title: "HalifaxDT：基于开放地理空间数据的无线数字孪生｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-05793-halifaxdt-a-wireless-digital-twin-from-open-geospatial-data/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/203aec474c6df667/) · [原文 arXiv](https://arxiv.org/abs/2609.05793) · [全部目录](/papers/catalog/)

# HalifaxDT：基于开放地理空间数据的无线数字孪生

**原题：** HalifaxDT: A Wireless Digital Twin from Open Geospatial Data  
**作者：** Alexis Delplace（达尔豪斯大学计算机科学学院，加拿大哈利法克斯；LISN，巴黎-萨克雷大学，法国吉夫叙伊韦特）、Xinyi Li、Samer Lahoud、Nur Zincir-Heywood（达尔豪斯大学计算机科学学院，加拿大哈利法克斯）  
**版本：** arXiv:2609.05793v1（cs.NI），2026 年 9 月 5 日提交，原文 9 页；本文为 ACM 下一代无线网络数字孪生研讨会（DTwin '26）论文，会议于 2026 年 10 月 26—30 日在美国得克萨斯州奥斯汀举行，DOI: 10.1145/3842434.3844958。原文采用知识共享署名 4.0 国际许可（CC BY 4.0）。  
**范围与状态：** 全文中文译稿：摘要、CCS 概念、关键词、ACM 引用格式、正文第 1—5 节、致谢、图 1—图 4 图注、表 1—表 4 与参考文献（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

无线数字孪生可为未来无线网络提供站点特定（site-specific）的分析、规划与实验支持。然而在缺乏精确三维城市模型时，在城市尺度上构建数字孪生仍具挑战。本文提出 **HalifaxDT**——加拿大新斯科舍省哈利法克斯半岛的无线数字孪生，它由**异构的开放地理空间数据与频谱数据**构建而成。HalifaxDT 通过一套工作流把建筑轮廓、LiDAR 高程产品、建筑元数据与频谱许可记录结合起来，在协调多种建筑高度信息来源的同时，**保留几何决策的来源追溯（provenance）**。所得地形、建筑与网关元数据被集成到 Sionna RT 中进行无线仿真。本文通过两个用例评估 HalifaxDT：其一将其覆盖预测与基于实地测量得到的参考图以及一个解析基线比较；其二用该数字孪生预测正常运营条件下的接收信号并检测干扰。覆盖结果表明，相比解析基线，HalifaxDT 更好地保留了实测无线电地图的空间结构；干扰研究表明，偏离预测参考的偏差可以揭示仅凭接收功率难以检测的干扰。本文还指出当前的保真度局限，包括材质表示简化、缺少植被，以及需要更广泛的射频校准并与实时测量同步。

**CCS 概念：** •网络 → 无线接入网；网络仿真；网络测量。

**关键词：** 数字孪生、无线网络、射线追踪、Sionna RT、干扰检测、覆盖图绘制。

**ACM 引用格式：** Alexis Delplace, Xinyi Li, Samer Lahoud, and Nur Zincir-Heywood. 2026. HalifaxDT: A Wireless Digital Twin from Open Geospatial Data. In ACM Workshop on Digital Twins over NextG Wireless Networks (DTwin '26), October 26–30, 2026, Austin, TX, USA. ACM, New York, NY, USA, 9 pages. https://doi.org/10.1145/3842434.3844958

## 1 引言

无线数字孪生正成为未来无线网络中站点特定仿真、部署规划、合成数据生成与假设分析（what-if analysis）的重要工具。然而其有用性取决于能否获得对传播分析而言足够精确的环境模型。在密集城区，无线电性能由局部几何、遮挡、反射、绕射、地形高程、天线布放与材料属性共同塑造。因此，无线数字孪生不能只被视为网络模型，它还必须表示网络运行所处的物理环境。

已有工作涵盖仿真平台、经校准的传播模型与城市尺度场景实例。Sionna RT [8] 提供本文使用的可微射线追踪引擎；经测量校准的数字孪生则表明实地观测如何校正系统性 RSSI 偏移并提升保真度 [16]；BostonTwin [17] 等城市尺度系统展示了在精细城市几何已可用时如何利用该几何。HalifaxDT 在这些工作的基础上，把**开放数据场景重建**与**稀疏 LoRaWAN 实地测量评估**结合起来。

然而许多城市缺少可直接转换为无线仿真场景的精细三维模型。因此 HalifaxDT 聚焦于从开放或机构图层出发的**可追溯重建**，包括建筑轮廓、LiDAR 高程产品、志愿地理信息、市政记录与频谱许可数据库。这对建筑高度估计尤为重要：高程栅格、显式高度属性、楼层数估计与外部地形记录在覆盖范围、时间有效性、空间对齐与高度定义上各不相同。

本文提出 HalifaxDT——新斯科舍省哈利法克斯半岛的、可直接用于射线追踪的无线数字孪生。HalifaxDT 由公开可得的地理空间与频谱数据构建，而非来自已有的三维城市模型。它集成市政建筑轮廓、LiDAR 派生高程产品、OpenStreetMap 元数据、市政建筑属性、国家地形建筑记录与频谱许可信息，并把所得场景导出为与 Sionna RT 兼容的格式。生成的场景资产、处理后的输入与重建脚本已在线公开，供检查与复用 [2]。

本文贡献有三。第一，提出一套可复用的工作流，用于从异构开放地理空间数据构建可直接用于射线追踪的无线数字孪生。第二，提出一种建筑高度推断流程，在保留来源追溯的前提下结合高程产品、建筑属性、楼层数估计与外部记录。第三，把该工作流实例化为 HalifaxDT，并通过覆盖图绘制与干扰检测对其进行评估，表明开放数据无线数字孪生可在**无干扰源标签数据**的情况下同时支持传播分析与干扰源（jammer）检测。

## 2 HalifaxDT 构建方法

城市尺度无线仿真数字孪生的构建可组织为可复用的四阶段工作流：(i) 确定描述环境所需的地理空间数据；(ii) 在统一空间参考框架中对齐异构数据源；(iii) 把对齐后的图层转换为可直接用于射线追踪的三维场景；(iv) 把所得场景与无线仿真器集成。HalifaxDT 在哈利法克斯半岛上实例化该工作流，但同一流程可适配其他有类似开放或机构地理空间数据源的城市。

### 2.1 地理空间输入与数据源发现

第一步是确定目标无线仿真所需的数据图层。若已有带地理参考的三维城市模型，构建问题主要是格式转换、坐标归一化与无线材质标注；否则必须从二维与 2.5 维地理空间数据源重建场景。

实践中所需输入可分为几大类：已有三维模型、建筑轮廓、高程产品与建筑元数据。表 1 汇总各图层的作用、典型来源与 HalifaxDT 采用的对应数据。所选地理空间图层通过空间对齐并转换到统一度规坐标系后集成，用于场景生成。

**表 1：构建城市尺度无线数字孪生的核心地理空间输入。**

| 输入 | 典型来源 | HalifaxDT 示例 |
|---|---|---|
| 三维城市模型 | CityGML、OBJ/PLY、已有城市模型 | 不可用；由各图层重建 |
| 建筑轮廓 | OSM、地籍数据、市政／省级 GIS | HRM Buildings；Shapefile |
| DSM | LiDAR、摄影测量、卫星 DSM | HRM LiDAR DSM；GeoTIFF |
| DEM/DTM | LiDAR、国家高程数据集、地形 API | HRM LiDAR DEM；GeoTIFF |
| 建筑元数据 | OSM 标签、市政建筑图层、建筑登记库、地形数据库 | OSM/Overpass；GeoJSON、HRM Buildings CSV、NSTDB；Shapefile/GPKG |

当缺少显式建筑高度时，两类高程图层尤其有用。**数字表面模型（DSM）**描述可见表面，包括建筑、植被与其他地上物体；**数字高程模型（DEM）**（即数字地形模型 DTM）描述裸地地形。当 DSM 与 DEM 共配准时，二者之差给出相对局部地形的高度，可用于估计建筑高度。在可获得共配准表面高程与地形高程产品的条件下，这种 DSM—DEM 策略可推广到其他城市数字孪生。实践中主要挑战是：高程图层的可得性与分辨率、其与建筑轮廓的时间一致性，以及数据集之间空间对齐的质量。

HalifaxDT 以哈利法克斯地区自治市（HRM）的建筑轮廓为基础几何，使用 HRM LiDAR 产品作为高程来源，并以 OpenStreetMap（OSM）、HRM Buildings CSV 与新斯科舍省地形数据库（NSTDB）记录作为建筑属性与高度证据的补充来源 [4–6, 10–12]。OSM 在可用时提供志愿贡献的高度、楼层（level）、材质与屋顶标签；HRM Buildings CSV 提供市政建筑属性（包括显式高度值与楼层数元数据）；NSTDB 提供外部建筑高度参考。下文分析这些数据源的覆盖度与互补性。

### 2.2 预处理与高度推断

完成数据源发现后，矢量与栅格图层被归一化到统一的度规框架。在 HalifaxDT 中，该步骤把 HRM 建筑轮廓、OSM/NSTDB 建筑记录与 HRM DSM/DEM 栅格裁剪到哈利法克斯半岛，重投影到同一局部坐标系，并把每个轮廓与用于高度推断的栅格采样和元数据记录关联起来。之所以需要该归一化，是因为这些数据源不共享相同几何或标识符：市政轮廓、OSM 多边形与 NSTDB 记录可能用不同轮廓、坐标系与属性描述同一栋建筑。具体投影与空间范围依赖于实现；关键要求是在场景生成之前把所有几何与栅格证据放入**单一局部坐标框架**。

HalifaxDT 中最重要的预处理任务是**建筑高度推断**。对建筑轮廓 $b$，由 DSM 导出的高度候选值由与该轮廓相交的归一化 DSM–DEM 采样分布计算：

$$
h_b^{\mathrm{DSM}}=Q_{0.95}\left(\{z_{\mathrm{DSM}}(u)-z_{\mathrm{DEM}}(u)\mid u\in b,\ u\ \text{valid}\}\right),\tag{1}
$$

其中 $Q_{0.95}$ 表示有效栅格采样的第 95 百分位。该式近似上屋面高度，同时比最大值对孤立植被、噪声、缺失栅格值与单像素离群值更不敏感。实践中该估计仍须对轮廓错位、屋顶形状变化、多体量建筑以及外部数据集所用高度定义差异保持稳健。

每个数据源可提供一个或多个候选高度估计。候选高度可由以下途径导出：显式高度字段；楼层数结合依建筑类型而定的层高先验；屋顶高度元数据；经局部地形高程校正的外部高程记录；或建筑类型、要素类别、轮廓面积与建造类型等元数据。在 HalifaxDT 中，这些非 DSM 候选来自 OSM 标签、HRM Buildings CSV 与 NSTDB 记录。OSM 与 HRM 在可用时提供显式高度候选，在提供楼层数时退化为由楼层数导出的候选。

HalifaxDT 中观察到的数据源覆盖情况正是这种**多源设计**的动因。如图 1 所示，OSM 仅为有限比例的建筑提供高度相关元数据，且显式高度很少；DSM 派生候选覆盖全部轮廓，而 NSTDB 记录与 HRM Buildings CSV 补充了高程派生、显式高度与楼层数派生的证据。由于这些数据源在覆盖范围、导出方法、时间有效性与空间匹配质量上各不相同，把它们组合起来可减少通用回退高度的使用，并在存在独立候选处提供交叉校验。DSM 派生候选的完全可得**并不**意味着完整可靠的高度覆盖：DSM-P95 可能受轮廓对齐、屋顶形状、植被、与 2018 年 LiDAR 采集的时间失配以及高度定义差异影响。对高仰角尾部或混合屋顶高度，选择器使用 DSM-P75 而非 DSM-P95，以避免让小型屋顶结构或邻近物体决定整栋建筑的高度。

图 1 报告的是数据源可用性，表 2 报告的是最终高度选择决策。多数建筑保留 DSM 派生高度，多源证据主要影响多体量、已获外部确认或 DSM 无效的情形。在 **14.5%** 的建筑中，最终选定高度与 DSM-P95 相差超过 2 m。

**图 1：HalifaxDT 所集成各数据源中建筑高度证据的可用性。** 图中条形依次为 DSM P95（19,667，100%）、NSTDB（15,268，77.6%）、HRM（13,214，67.2%）、OSM（1,894，9.6%）；后三者按 HRM 显式高度、HRM 楼层数推断、OSM 显式高度、OSM 楼层数推断细分。

**表 2：HalifaxDT 中最终建筑高度来源决策。**

| 选定高度决策 | 数量 | 占比 |
|---|---|---|
| DSM-P95 | 16,163 | 82.2% |
| 高尾部剖面使用 DSM-P75 | 1,747 | 8.9% |
| 外部或共识来源 | 1,511 | 7.7% |
| FCODE 回退 | 246 | 1.3% |

高度推断协议把每种可能高度都视为由一个或多个数据源支持的候选，并赋予确定性的规则式置信度分数。初始分数取决于数据源与导出方法，调整则依据 DSM 像素数、轮廓内部可用性、屋顶剖面稳定性、OSM/HRM 重叠、OSM 多边形歧义、NSTDB 重叠或匹配距离、与 2018 年 LiDAR 采集日期的时间一致性以及物理合理性。分数仅用于**对同一建筑**的竞争候选排序。

DSM 派生值在数据较新且对齐良好时具有信息量，但对 DSM 采集之后新建或改建的建筑可靠性较低。这在 HalifaxDT 中很重要，因为 DSM 与 DEM 来自 2018 年 LiDAR 数据，而城市持续发展。当建造或更新元数据表明某建筑晚于 DSM 采集时，DSM 派生候选仍保留但赋予较低置信度；早于 DSM 且栅格覆盖良好的建筑通常保留较强的 DSM 证据。

打分之后，流程选择最终高度。在预定义容差内相互一致的物理合理估计用**加权中位数**合并，这对离群值稳健，同时给予高分候选更大影响。该容差考虑了各数据源特定高度定义（例如屋顶基底、屋顶最高点、高程派生高度或楼层派生高度），因此小的差异在预期之内。若不存在强共识，则选择得分最高的合理候选；若直接证据缺失或不可靠，流程退化为基于元数据的推断。

该阶段输出既包括高度值，也包括**来源记录**：选定的数据源或共识、决策策略、置信水平、是否为 DSM 后建建筑的标记、所考虑的候选以及决策理由。该来源记录支持人工检查、后续修正，以及把同一构建工作流适配到数据可得性不同的其他城市。

### 2.3 无线仿真场景生成

第三阶段把预处理后的地理空间图层转换为可直接用于射线追踪的场景。这需要选择地形表示、生成地面网格、拉伸建筑轮廓、指定材质组，并创建射线追踪器所用的场景描述。

地形建模的主要权衡是空间分辨率与所得地面网格复杂度。HalifaxDT 使用 5 m DEM 表示地形，因为在研究区尺度上地形高程的变化比建筑几何更平缓；1 m 地形表面会显著增加网格复杂度，而对预期的城市尺度仿真收益有限。这一选择体现一条通则：**高分辨率数据应保留在影响传播相关结构之处，而在主要增加计算代价之处应予以简化**。

建筑通过拉伸高度增强后的轮廓生成。拉伸时建筑基底从 DEM 采样，使墙体跟随局部地形高程；轮廓边可在拉伸前加密，以更好捕捉长边沿线的地形变化，屋顶按选定的屋顶高程生成。这些步骤避免把建筑当作置于平面上的扁平物体，同时仍比完整建筑三维重建更简单。

场景还标注了近似的**射频材质**。开放的城市尺度数据集很少提供精细立面材质，因此 HalifaxDT 把可得的语义属性映射到少量近似 RF 材质类别：可用时使用显式 OSM 材质标签，否则由建筑类型、要素类别、高度、轮廓几何与空间先验推断粗粒度材质标签，再映射到射线追踪器中可用的材质模型。地形与砖、混凝土、金属、木材等常见材质类别可赋予对应或最接近的可用 RF 材质代理。由于城市尺度材质标签稀疏且粗糙，这些标注被视为**可选的场景元数据**；下文覆盖图评估使用单一建筑材料，以避免由未经验证的材质标签差异引入额外不确定性来源。对更大城市，同一协议可按空间分块并行应用，同时保留局部分块坐标与全局坐标参考系之间的映射，使构建工作流在不改变底层数据模型的条件下可扩展。

### 2.4 HalifaxDT 实例与 Sionna 集成

最后阶段把生成的地形、建筑与 RF 材质标注打包为可被 Sionna RT 加载的场景。

导出场景围绕一个 **Mitsuba 兼容的 XML 场景文件**组织，这是 Sionna RT 期望的场景格式。该 XML 文件声明 ITU 射频材质定义并引用仿真器使用的网格对象；地形与建筑几何导出为 PLY 网格文件，并由 XML 场景文件链接，每个网格组分配材质引用。因此场景描述成为连接生成几何与 RF 材质标注的中央入口。

随后 Sionna RT 可加载该 XML 场景，并使用场景定义的终端设备与网关计算无线电地图或传播路径。这样同一 HalifaxDT 场景可支持多种无线分析，同时把环境表示与实验特定的无线配置分离。

## 3 用例

### 3.1 覆盖图绘制

覆盖图描述无线电信号质量在地理区域上如何变化，可支持网络规划、网关布放、覆盖空洞识别以及部署前后的服务可用性评估。传统覆盖图可由实地测量或解析传播模型生成，但测量活动代价高昂，而解析模型只能粗略表示特定城市环境。无线数字孪生提供了生成此类地图的另一条途径：一旦某城市及其无线基础设施被表示于**传播就绪**的虚拟环境中，就可在没有测量的地点估计无线条件，并在部署配置改变时更新。

#### 3.1.1 覆盖图构建

所有地图使用相同的 25 m 室外网格与地理范围。参考图由在哈利法克斯半岛采集的 LoRaWAN（Long Range Wide Area Network）传输记录导出 [1]。为构建网格级参考图，把传输尝试（包括收到数据包与非接收）分配到网格单元；非接收被视为位于 −140 dBm 的**删失（censored）观测**，这是数据集中观察到的最小网关灵敏度。随后用**回归克里金（regression kriging）** [7] 把不规则测量转换为连续地图，把估计的 RSSI 场分解为大尺度趋势与克里金残差：

$$
\hat r(s)=\hat m(s)+\hat\varepsilon(s),\tag{2}
$$

其中 $\hat m(s)$ 为回归趋势，$\hat\varepsilon(s)$ 为克里金残差场。在 HalifaxDT 中，趋势建模为

$$
\hat m(s)=\beta_0+\beta_1\log_{10}(d(s))+\beta_2d(s)+\beta_3x(s)+\beta_4y(s),\tag{3}
$$

其中 $d(s)$ 为到网关的距离，$x(s)$ 与 $y(s)$ 为测量网格单元的局部投影坐标。残差场在每个预测位置 $s_0$ 处用局部普通克里金估计：

$$
\hat\varepsilon(s_0)=\sum_{i=1}^{n}\lambda_i\left(r(s_i)-\hat m(s_i)\right),\tag{4}
$$

其中 $r(s_i)-\hat m(s_i)$ 为测量网格单元 $s_i$ 处的残差。权重 $\lambda_i$ 来自普通克里金，最多使用 300 m 内 18 个邻近测量单元。标准差为 1.2 个网格单元的高斯平滑步骤用于抑制孤立插值伪影。所得地图是**测量派生的插值产物，而非独立的真值 RSSI 场**；因此本文在评估掩膜上报告测量支撑度与克里金不确定性诊断。对回归克里金参考，该掩膜上的标准差中位数、第 90 百分位、第 95 百分位与最大值分别为 5.51、8.52、9.10 与 10.27 dB。

HalifaxDT 覆盖图用 Sionna RT 在 HalifaxDT 场景上生成。本文在 25 m 室外网格上使用 `PathSolver` 逐点计算而非 `RadioMapSolver`。对每个有效网格点，求解器计算从 LoRaWAN 终端设备到固定网关的上行路径，并利用路径增益互易性。终端设备天线置于地形高度加 2.5 m 处，以匹配测量设置；网关天线位于局部地面以上 12 m，在哈利法克斯半岛上约相当于海拔 60 m。仿真使用 904.6 MHz、终端设备 EIRP 25 dBm、网关接收增益 6 dBi、各向同性垂直极化天线，参数 `max_depth=16`、`samples_per_src=20M`、`max_num_paths_per_src=500k`，随机种子 42。启用视距（LoS）、漫反射与透射／折射；关闭镜面反射与绕射。建筑使用单一混凝土材质，地形使用中等干燥地面，使比较聚焦于几何、地形、天线布放与射线追踪空间结构，而非粗糙的材质标签假设。逐点 RSSI 栅格在 −140 dBm 处取底，并用 $3\times3$ 中值滤波后再以 $\sigma=62.5$ m 作高斯平滑。该后处理**仅**应用于 HalifaxDT，因为解析地图在空间上已经平滑。仿真使用 `sionna-rt 2.0.1` 与 `cuda_ad_mono_polarized` Mitsuba 变体。

为作比较，本文保留城市 **Okumura–Hata 模型**——这是 900 MHz 附近大型城市环境中成熟的解析基线。它在每个室外网格位置上用相同载频、固定网关配置、终端设备高度、天线增益与 −140 dBm 底限求值。

本文先在不做 RSSI 校准的情况下评估地图。如表 3 所示，HalifaxDT 取得比 Okumura–Hata 更低的 MAE 与更好的空间指标。该原始比较包含全局链路预算失配，例如线缆或接头损耗、天线增益失配以及测量活动特定的 RSSI 上报效应，这些可能独立于地图的空间结构而惩罚某张地图，因此本文还评估有限数据校准设置。

#### 3.1.2 有限数据校准

本文考虑一种轻量校准场景：用测量活动的一小部分子集校正全局 RSSI 偏移与尺度误差。由于这些记录来自构建测量派生参考图的同一测量活动，这属于**有限数据校准**而非独立验证。为评估采样变异性，把该流程重复 50 次独立随机抽选；每次抽选 30 条真实传输记录（含接收 RSSI 与非接收）来校准两个模型。本文使用带隐变量 RSSI 的**左删失 Tobit 模型**：

$$
y_{i,m}^{\ast}=\alpha_m+\beta_m\widehat r_m(s_i)+\varepsilon_i,\qquad \varepsilon_i\sim\mathcal N(0,\sigma_m^{2}),\tag{5}
$$

其中 $\widehat r_m(s_i)$ 为模型 $m$ 的未校准预测。参数 $\alpha_m$ 表示全局偏移，$\beta_m$ 调整 RSSI 尺度。对接收到的传输，似然使用观测到的 RSSI；对非接收，则使用隐变量 RSSI 低于灵敏度底限 $c=-140$ dBm 的概率：

$$
L_{i,m}=\begin{cases}\dfrac{1}{\sigma_m}\phi\!\left(\dfrac{r_i-\mu_{i,m}}{\sigma_m}\right), & i\in\mathcal R,\\[8pt] \Phi\!\left(\dfrac{c-\mu_{i,m}}{\sigma_m}\right), & i\in\mathcal C,\end{cases}
\qquad \mu_{i,m}=\alpha_m+\beta_m\widehat r_m(s_i),\tag{6}
$$

其中 $\mathcal R$ 与 $\mathcal C$ 分别表示接收到的与删失的未接收传输。这样可避免把每次未接收都当作灵敏度底限处的精确 RSSI 测量。

仅用 30 个观测时，无约束仿射校准可能过拟合。因此本文通过最小化岭正则化 Tobit 负对数似然来估计 $\boldsymbol\theta_m=(\alpha_m,\beta_m,\sigma_m)$（$\sigma_m>0$）：

$$
\widehat{\boldsymbol\theta}_m=\arg\min_{\boldsymbol\theta_m}\left[-\frac{1}{30}\sum_{i=1}^{30}\log L_{i,m}+\lambda_\alpha\left(\frac{\alpha_m}{10}\right)^{2}+\lambda_\beta\left(\beta_m-1\right)^{2}\right],\tag{7}
$$

其中 $\lambda_\alpha=0.1$、$\lambda_\beta=1$。这些惩罚把偏移收缩向零、把 RSSI 尺度收缩向一，使校准在数据支持不足时保持在未修改地图附近。校准后的栅格报告仿射校准后拟合的隐变量 RSSI 均值，而似然计入 −140 dBm 处的左删失。因此校准比较强调的是**各地图在多大程度上保留了测量派生参考的空间组织**。

#### 3.1.3 空间解读

图 2 给出表 3 所汇总结论的空间视图。Okumura–Hata 地图遵循平滑的径向衰减趋势，但无法再现站点特定的阴影与不规则覆盖边界；相反，HalifaxDT 地图呈现与测量派生地图中可见变化相一致的空间变化。本文用表 3 的全局与空间比较指标量化该观察。

**图 2：哈利法克斯室外覆盖图。** 左为测量派生参考图，中为 HalifaxDT 的 Tobit 校准图，右为 Okumura–Hata 的 Tobit 校准图（图中 (a) 测量派生、(b) Sionna、(c) Okumura-Hata）。

**表 3：全局与空间覆盖图指标。** 箭头表示更优方向，Gain 表示 HalifaxDT 相对 Okumura–Hata 的相对改进。对 30 点校准行，各条目报告 50 次独立随机校准抽选上的中心值，格式为均值 ± 标准差。

| 校准 | 模型 | MAE ↓ (dB) | V-RMSE ↓ (dB²) | FSS ↑ | IoU ↑ | BDist ↓ (m) |
|---|---|---|---|---|---|---|
| 原始 | HalifaxDT | 10.92 | 11.24 | 0.840 | 0.664 | 220.4 |
| 原始 | Okumura–Hata | 20.66 | 16.10 | 0.679 | 0.503 | 469.5 |
| *Gain* | – | +47.2% | +30.2% | +23.8% | +31.9% | +53.1% |
| 30 点 | HalifaxDT | 5.58 ± 0.31 | 4.18 ± 1.42 | 0.876 ± 0.008 | 0.705 ± 0.014 | 152.5 ± 5.0 |
| 30 点 | Okumura–Hata | 6.61 ± 0.35 | 14.68 ± 0.17 | 0.802 ± 0.018 | 0.621 ± 0.021 | 339.2 ± 31.9 |
| *Gain* | – | +15.6% | +71.5% | +9.2% | +13.6% | +55.0% |

该比较还显示场景保真度如何影响无线电地图。在真实环境的南部公园区域，茂密植被部分阻挡传播，而 HalifaxDT 把该区域表示为相对平坦开阔，因此模型允许终端设备与网关之间更强的直射与反射路径，导致 RSSI 被高估；两个局部的建筑邻近高估区域很可能反映类似的植被损耗缺失。这些误差反映环境模型的局限，也指明了额外场景细节最能改善数字孪生之处。

#### 3.1.4 定量比较

表 3 中所有指标使用同一室外评估掩膜，该掩膜保留距至少一条用于构建参考图的原始实地测量记录 300 m 以内的网格单元。对该评估子集，掩膜包含 18.03 km² 上的 28,852 个网格单元，含 4,958 条原始记录与 2,903 个有测量的单元，对应 274.9 条记录/km²、161.0 个有测量单元/km²，且在 10.1% 的评估单元中有直接支撑。在全部可得的测量活动记录中，同一区域含 7,435 条记录，包括 4,926 个接收数据包与 2,509 次非接收。因此掩膜把比较限制在局部有支撑的区域，确保指标不被参考图主要依赖插值的区域主导。MAE 度量全局逐像素 RSSI 精度：相对 Okumura–Hata，HalifaxDT 把原始 MAE 降低 47.2%；在对 50 次重复 30 点 Tobit 校准后仍好 15.6%，且两模型达到相近的城市尺度平均误差。这促使我们引入下述互补的空间指标。

作为**非插值**的合理性检查，本文在用于地图比较的原始测量位置上评估仅接收误差。使用 3,445 条接收记录，校准后的 HalifaxDT 得到 MAE/RMSE 为 7.96/9.84 dB，而校准后的 Okumura–Hata 为 7.57/9.38 dB。因此，HalifaxDT 在表 3 中的优势应理解为**测量支撑覆盖图结构的改进**，而非统一更好的数据包级 RSSI 预测。Okumura–Hata 捕捉了主导的城市尺度衰减趋势，但其平滑径向结构不能像 HalifaxDT 那样再现局部覆盖边界与阴影区域。该 MAE/RMSE 计算排除非接收，非接收通过删失 Tobit 校准处理。

为在平均 RSSI 误差之外评估空间组织，本文使用四个互补指标。**变差函数 RMSE（V-RMSE）**在相同滞后距离上比较预测与参考经验半变差函数 [9]，校准后 HalifaxDT 低 71.5%。**分数技巧评分（FSS）** [14] 比较局部覆盖面积分数，同时容许小的空间位移，校准后高 9.2%。**交并比（IoU）**度量覆盖区域重叠 [13]，高 13.6%。**边界距离**通过对称最近等值线距离比较预测与参考覆盖等值线，低 55.0%。这些指标表明 HalifaxDT 更好地保留了实测无线电地图的站点特定结构。若不作 HalifaxDT 平滑，未校准地图在 MAE、FSS、IoU 与边界距离上仍优于 Okumura–Hata（分别为 12.30 dB、0.845、0.633 与 238.5 m），但 V-RMSE 增至 63.17 dB²，印证其对单元尺度空间变化的敏感性。

总体而言，HalifaxDT 在**不做 RSSI 校准**时明显更准确，表明数字孪生地图所需的经验调整显著少于解析基线。在重复的 30 观测校准下，正则化删失校准改善了双方，但 HalifaxDT 在各空间覆盖指标上仍保持一致优势。因此覆盖图用例表明，HalifaxDT 能提供超出经校准解析基线所捕捉范围的、有测量支撑的空间覆盖预测。

### 3.2 干扰检测

HalifaxDT 还可为干扰检测提供基于模型的参考。

利用建模环境与射线追踪信道，HalifaxDT 估计正常运营条件下感知单元应从合法发射机接收到的信号。该参考可与真实测量比较 [15]；偏差可能表明来自故障设备、未授权发射机或干扰源的意外干扰。

#### 3.2.1 检测方法

考虑含多个合法发射机与一个干扰源的场景。感知单元处的接收信号建模为

$$
y_{\mathrm{PT}}=\sum_{k=1}^{K}H_kx_k+H_{\mathrm{jam}}x_{\mathrm{jam}}+n,
$$

其中 $H_k$ 为第 $k$ 个合法发射机到感知单元的信道频率响应（CFR），$x_k$ 为发送的 OFDM 信号，$n$ 为加性白高斯噪声。数字孪生预测的无干扰接收信号为 $y_{\mathrm{DT}}=\sum_{k=1}^{K}H_kx_k+n$。干扰通过计算残差功率 $P_\varepsilon=\lVert y_{\mathrm{PT}}-y_{\mathrm{DT}}\rVert^{2}$ 来检测。

如图 3 所示，数字孪生需要发射机与感知单元位置、发送信号与发射功率来预测无干扰信号。这些输入可通过 5G 定位与网络侧发射机信息获得，但实践中可能有噪声；此处假设它们精确，以在理想化数字孪生下单独考察检测性能。当 $P_\varepsilon$ 超过预定义阈值时判定存在干扰源。

**图 3：使用数字孪生进行干扰源检测的系统概览。** 真实环境支路给出 $y_{\mathrm{PT}}$，数字孪生支路给出 $y_{\mathrm{DT}}$；残差功率 $P_\varepsilon=\lVert y_{\mathrm{PT}}-y_{\mathrm{DT}}\rVert^{2}$ 与阈值比较，超阈判定为干扰源（Jammer），否则判定为合法（Legitimate）。

本文把基于数字孪生的检测器与传统能量检测（ED）比较：后者仅使用接收功率 $P_y=\lVert y_{\mathrm{PT}}\rVert^{2}$，不需要信道或环境知识。两种方法都无需训练、也不需要标注的干扰源数据；合法样本仅用于校准阈值。

#### 3.2.2 实验设置

本文考虑 HalifaxDT 中 $500\times500$ m 的一个子区域，含三个固定街面合法发射机与一个位于 $(2990,3190)$ m 的屋顶感知单元。随机采样五个干扰源位置并独立评估，得到图 4 所示的五个测试场景。

载频为 3.7 GHz、带宽 100 MHz。OFDM 信号每帧使用 64 个子载波与 14 个符号，合法发射机与干扰源的发射功率均为 0 dBm。本文考虑八种干扰波形：带幅度变化的连续波干扰（CWJ-A）、带频率变化的连续波干扰（CWJ-W）、幅度调制干扰（AMJ）、噪声幅度调制干扰（NAMJ）、窄带噪声干扰（NBNJ）、多音干扰（MTJ）、线性频率调制干扰（LFMJ）与周期脉冲噪声干扰（PPNJ），定义遵循 [3]。

**图 4：仿真场景布局。** HalifaxDT 上的场景布局，标注建筑、发射机（TX0、TX1、TX2）、感知单元（SU）与五个干扰源位置（J0—J4）。

对两种方法，阈值都用 400 个合法样本校准，目标虚警率（FPR）为 1%。在每个干扰源位置，测试集含 500 个合法样本与八类干扰各 500 个受干扰样本，即每个场景 4,500 个样本：500 个合法样本与 4,000 个受干扰样本。

物理环境用完整 HalifaxDT 射线追踪场景仿真：启用 LoS 与镜面反射，关闭漫反射与折射，最大交互深度为 5，使用单一垂直极化各向同性天线。观测与数字孪生参考**由同一场景生成**，因此该设置给出的是**上界**：$P_\varepsilon$ 反映的是在完全已知 $H_k$ 下的检测，并未计入数字孪生模型失配。数字孪生参考 $y_{\mathrm{DT}}$ 还包含独立抽取的噪声项 $n$，因此残差同时反映干扰源贡献与独立噪声实现。

#### 3.2.3 结果

检测性能见表 4。

**表 4：检测性能。**

| 干扰源 | JNR (dB) | TPR_DT | TNR_DT | TPR_ED | TNR_ED |
|---|---|---|---|---|---|
| J0 | 7.9 | 99.8% | 97.4% | 76.0% | 99.2% |
| J1 | 1.0 | 100.0% | 98.6% | 70.8% | 100.0% |
| J2 | 17.2 | 100.0% | 99.0% | 100.0% | 98.8% |
| J3 | 4.0 | 100.0% | 99.0% | 95.2% | 99.2% |
| J4 | −8.1 | 48.9% | 98.8% | 4.5% | 98.0% |
| 均值 | – | 89.7% | 98.6% | 69.3% | 99.0% |

基于数字孪生的检测器在全部五个干扰源位置上优于能量检测。在最高 JNR（J2）下，两方法因干扰信号很强都达到 100% TPR；在中等 JNR（J0、J1、J3）下，基于数字孪生的方法 TPR 仍高于 99%，而能量检测在 70.8% 至 95.2% 之间；在最低 JNR（J4）下，基于数字孪生的检测器 TPR 达 48.9%，而能量检测仅 4.5%。其优势来自预测合法聚合信号并检验残差，而能量检测只依赖总接收功率，无法区分合法分量与干扰分量。

## 4 局限性与未来工作

HalifaxDT 存在若干局限，也指明了未来工作方向。部分场景输入是近似或不完整的：覆盖图评估使用单一混凝土建筑材料，因为城市尺度材质标签稀疏且粗糙；2018 年 LiDAR 高程数据可能遗漏近期新建或改建的建筑；植被被省略，而如公园区域所见，这会影响传播精度。最后，当前评估未包含对数字孪生本身的**独立射频测量验证**。在干扰检测用例中，真值接收信号也由同一射线追踪场景生成，意味着数字孪生被假定能表示真实环境。因此，针对独立 RF 测量以及在数字孪生模型失配条件下进行验证，是未来工作的重要方向。

## 5 结论

本文提出 HalifaxDT——由开放地理空间数据与频谱数据构建的、面向传播的哈利法克斯半岛无线数字孪生。其可复现工作流把异构的二维与高程数据源转换为可直接用于射线追踪的城市场景，包含推断的建筑高度、地形高程、可选的粗粒度材质元数据与网关元数据。通过覆盖图绘制与干扰检测，HalifaxDT 展示了环境感知数字孪生如何提供粗糙解析传播模型或仅依赖接收功率的检测所无法捕捉的空间与信号层面信息。结果还表明性能取决于场景保真度：缺失植被、简化的材质表示与有限的 RF 校准可能造成系统性误差，这推动了测量驱动的校准、更丰富的环境建模以及与实时无线观测更紧密的同步。

## 致谢

作者感谢 Noah Jehanno 与 Nathan Chappe 对支持本工作的数据采集与原型活动的贡献。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 17 条，源文 p. 9）。

[1] Alexis Delplace, Samer Lahoud, and Kinda Khawam. 2025. Exploring LR-FHSS Modulation for Enhanced IoT Connectivity: A Measurement Campaign. In 2025 IEEE 102nd Vehicular Technology Conference (VTC2025-Fall). 1–7. doi:10.1109/VTC2025-Fall65116.2025.11309920

[2] Alexis Delplace, Xinyi Li, Samer Lahoud, and Nur Zincir-Heywood. 2026. HalifaxDT. https://github.com/AlexisDel/HalifaxDT. Online repository.

[3] Xuhui Ding, Qi Lu, Yue Zhang, Gaoyang Li, Xiaozheng Gao, Neng Ye, Dusit Niyato, and Kai Yang. 2026. Few-Shot Recognition and Classification Framework for Jamming Signal: A CGAN-Based Fusion CNN Approach. IEEE Transactions on Vehicular Technology 75, 8 (2026), 17494–17508. doi:10.1109/TVT.2026.3678290

[4] Halifax Regional Municipality. n.d.. Buildings. Building polygons and associated building information. https://data-hrm.hub.arcgis.com/datasets/HRM::buildings-1/about?layer=0

[5] Halifax Regional Municipality. n.d.. LiDAR DEM 5m 2018. Digital elevation model. https://data-hrm.hub.arcgis.com/documents/HRM::lidar-dem-5m-2018/about

[6] Halifax Regional Municipality. n.d.. LiDAR DSM 1m 2018. Digital surface model. https://data-hrm.hub.arcgis.com/documents/HRM::lidar-dsm-1m-2018/about

[7] Tomislav Hengl, Gerard B. M. Heuvelink, and David G. Rossiter. 2007. About Regression-Kriging: From Equations to Case Studies. Computers & Geosciences 33, 10 (2007), 1301–1315. doi:10.1016/j.cageo.2007.05.001

[8] Jakob Hoydis, Fayçal Aït Aoudia, Sebastian Cammerer, Merlin Nimier-David, Nikolaus Binder, Guillermo Marcus, and Alexander Keller. 2023. Sionna RT: Differentiable Ray Tracing for Radio Propagation Modeling. arXiv:2303.11103 [cs.IT] doi:10.48550/arXiv.2303.11103

[9] Mirko Mälicke. 2022. SciKit-GStat 1.0: A SciPy-flavored Geostatistical Variogram Estimation Toolbox Written in Python. Geoscientific Model Development 15 (2022), 2505–2532. doi:10.5194/gmd-15-2505-2022

[10] OpenStreetMap contributors. n.d.. OpenStreetMap. Map data. https://www.openstreetmap.org/

[11] OpenStreetMap contributors. n.d.. Overpass API. Used to query OpenStreetMap data. https://overpass-api.de/

[12] Province of Nova Scotia. n.d.. Nova Scotia Geographic Data Directory. Nova Scotia Topographic Database buildings. https://nsgi.novascotia.ca/gdd/

[13] Hamid Rezatofighi, Nathan Tsoi, JunYoung Gwak, Amir Sadeghian, Ian Reid, and Silvio Savarese. 2019. Generalized Intersection over Union: A Metric and a Loss for Bounding Box Regression. In 2019 IEEE/CVF Conference on Computer Vision and Pattern Recognition. 658–666. doi:10.1109/CVPR.2019.00075

[14] Nigel M. Roberts and Humphrey W. Lean. 2008. Scale-Selective Verification of Rainfall Accumulations from High-Resolution Forecasts of Convective Events. Monthly Weather Review 136, 1 (2008), 78–97. doi:10.1175/2007MWR2123.1

[15] Anton Schösser, Friedrich Burmeister, Philipp Schulz, Mohd Danish Khursheed, Sinuo Ma, and Gerhard Fettweis. 2025. Advancing Spectrum Anomaly Detection through Digital Twins. IEEE Communications Magazine 63, 4 (2025), 40–46. doi:10.1109/MCOM.001.2400221

[16] Susruth Sudhakaran, Javier Perez-Ramirez, Dave Cavalcanti, Cosmin Cazan, Nicholas Olson, Rafael Rosales, and Valerio Frascolla. 2024. Wireless Network Digital Twin Calibrated by Real Time Telemetry and XR Feedback Interface. In 2024 IEEE 20th International Conference on Factory Communication Systems (WFCS). 1–8. doi:10.1109/WFCS60972.2024.10540718

[17] Paolo Testolina, Michele Polese, Pedram Johari, and Tommaso Melodia. 2024. Boston Twin: The Boston Digital Twin for Ray-Tracing in 6G Networks. In Proceedings of the 15th ACM Multimedia Systems Conference (MMSys 2024). Association for Computing Machinery, New York, NY, USA, 441–447. doi:10.1145/3625468.3652190

## 图注与表注

原文图 1—图 4 的完整图注已随正文就近译出（图 1 见第 2.2 节高度推断，图 2 见第 3.1.3 节空间解读，图 3 见第 3.2.1 节检测方法，图 4 见第 3.2.2 节实验设置），此处不再重复，仅补充表注：

**表注：** 表 1 为核心地理空间输入（图层、典型来源、HalifaxDT 实例三层）；表 2 为最终建筑高度来源决策（DSM-P95、高尾部剖面 DSM-P75、外部或共识来源、FCODE 回退四类及其数量与占比）；表 3 为全局与空间覆盖图指标（原始与 30 点校准两组，含 MAE、V-RMSE、FSS、IoU、BDist 及 Gain 行）；表 4 为五处干扰源位置下的检测性能（JNR、基于数字孪生的 TPR/TNR、基于能量检测的 TPR/TNR 及均值行）。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.05793v1（cs.NI，2026-09-05；ACM DTwin '26 会议论文，CC BY 4.0）的全文中文译稿，按原文结构译出：摘要；CCS 概念、关键词与 ACM 引用格式；第 1 节引言；第 2 节 HalifaxDT 构建方法（2.1 地理空间输入与数据源发现、2.2 预处理与高度推断、2.3 无线仿真场景生成、2.4 HalifaxDT 实例与 Sionna 集成）；第 3 节用例（3.1 覆盖图绘制：3.1.1 覆盖图构建、3.1.2 有限数据校准、3.1.3 空间解读、3.1.4 定量比较；3.2 干扰检测：3.2.1 检测方法、3.2.2 实验设置、3.2.3 结果）；第 4 节局限性与未来工作；第 5 节结论；致谢；图 1—图 4 图注；表 1—表 4；17 条英文参考文献。公式覆盖原文编号式 (1)—(7)，另含 3 个未编号显示式（$y_{\mathrm{PT}}$、$y_{\mathrm{DT}}$、$P_\varepsilon$）。

**源文页码：** 第 1 页（题名、作者、摘要、CCS 概念／关键词／ACM 引用格式、引言开头）→ 第 2 页（引言续、贡献、第 2 节开头、2.1 数据源发现）→ 第 3 页（表 1、2.2 预处理与式 (1)、图 1、表 2、高度推断协议）→ 第 4 页（高度决策细节、2.3 场景生成、2.4 Sionna 集成、第 3 节开头）→ 第 5 页（3.1.1 覆盖图构建、式 (2)—(4)、Sionna 参数、3.1.2 有限数据校准、式 (5)）→ 第 6 页（式 (6)—(7)、表 3 与图 2 说明、3.1.3 空间解读、3.1.4 定量比较开头）→ 第 7 页（定量比较续、3.2 干扰检测、3.2.1 检测方法、图 3、3.2.2 实验设置）→ 第 8 页（图 4、3.2.3 结果与表 4、第 4 节、第 5 节、致谢）→ 第 9 页（参考文献 [1]—[17]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 1—表 4 的全部数值、单位与符号已按 PDF 文本层与第 3、6、8 页渲染图交叉核对（表 1、表 2、表 3、表 4 逐格核对），未改变任何数值。
2. 图 1—图 4 均未上传图片，仅提供中文图注与正文关键数值；图 2 的覆盖图色块与图 4 的场景布局不作数字化估算。
3. 原文编号式 (1)—(7) 全部译出并保留原编号；$y_{\mathrm{PT}}$、$y_{\mathrm{DT}}$、$P_\varepsilon$ 三式在原文中未编号，译文同样不加编号。
4. **原文疑点／说明：** ①原文 §3.1 末段与表 3 的 "Gain" 行为斜体、表示 HalifaxDT 相对 Okumura–Hata 的相对改进，译文照录并说明符号方向；②原文对"测量派生参考图非独立真值"有明确声明，译文保留该限定（这是理解表 3 结论的前提）；③原文式 (5) 把未校准预测记为 $\hat r_m(s_i)$、式 (6) 用同一记号，译文统一；④原文参考文献 [2] 为在线仓库、[4]—[6]、[10]—[12] 为数据集／服务页面且无出版年（原文记 "n.d."），译文照录。
5. 版权说明：本文采用 CC BY 4.0 许可（原文脚注明示），页面为中文翻译并保留原文出处与 DOI；未上传原文 PDF。页面目录日期 2026-09-27 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-05）信息。
6. 原文为 ACM 会议论文（DTwin '26），篇幅 9 页；页面无附录（原文第 9 页为参考文献）。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
