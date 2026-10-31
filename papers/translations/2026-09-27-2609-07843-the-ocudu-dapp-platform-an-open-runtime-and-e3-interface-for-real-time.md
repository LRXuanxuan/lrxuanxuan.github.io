---
layout: page
title: "OCUDU dApp 平台：实时 AI 的开放运行时与 E3 接口｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-07843-the-ocudu-dapp-platform-an-open-runtime-and-e3-interface-for-real-time/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3c36e9afe33d8029/) · [原文 arXiv](https://arxiv.org/abs/2609.07843) · [全部目录](/papers/catalog/)

# OCUDU dApp 平台：实时 AI 的开放运行时与 E3 接口

**原题：** The OCUDU dApp Platform: An Open Runtime and E3 Interface for Real-Time AI-RAN  
**作者：** Timothy O'Shea、Matthew Pennybacker、Andriy Kharchenko。单位：DeepSig Inc.，美国弗吉尼亚州阿灵顿（Arlington, VA, USA）。原文未给出作者邮箱。  
**版本：** arXiv:2609.07843v1（cs.NI），v1 日期 2026 年 9 月 7 日；原文 17 页（IEEE 期刊论文格式，教程/系统论文）。本页对应论文库 2026-09-27 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—XIV 节、致谢、图 1—13 图注、表 I—X、列表 1—3（代码标识符保留原文，不译）、参考文献 [1]—[20]（英文原条目）。原文全文**无编号数学公式**，因此本页不含编号公式；十张表均逐格转录并与 PDF 渲染核对；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文说明）：** 原文缩写与专有名词在本页保留英文：dApp（distributed app，分布式应用，O-RAN 语境下的实时推理/控制应用）、AI-RAN、O-RAN、E3/E3AP/E3DP（dApp 与宿主 RAN 节点之间的实时接口；AP 为管理面、DP 为数据面）、RIC/rApp/xApp、DU/CU、L1/PHY/MAC、PUSCH、DM-RS、SRS、PRB/VRB、RNTI、MCS、CQI/SINR/BLER/TPC、OLLA、ISAC、COTS、ABI、SBOM、SPDX、ECDSA P-256、APER、FlatBuffers、SCTP、SEQPACKET、CUDA-IPC、seccomp、rlimit、MCP（Model Context Protocol）、BSD-3-Clause-Clear。代码标识符、路径、YAML 键名、函数名与 API 名（如 `ocudu_dapp_query_v1`、`dappctl`、`classc.spectrum`）保留原文，不翻译；列表 1—3 为代码，本页保留其英文代码形态并给出上下文说明。**原文疑点/说明（按原文照录并加注）：** ①E3 在原文中明确指出**不是** O-RAN 已批准的接口，而是 E2 的"实时本地演化"（可与 E2 桥接），与 libe3 的线格式**不**字节兼容；②原文 §VI 明确说明本版本的 E3 **不带** TLS/DTLS 或令牌认证，两个 SCTP 载波默认绑定回环地址；③原文 §XII 明确区分"机制成本"与"系统级运行"两类证据，并列出多个尚未补齐的测量缺口（作者自述，非本页推断）；④原文表 VIII 中 Class B 的 3.6 µs P99.9 为平台自测的 development matrix（未启用批准的 CPU 控制），原文明确说明其为开发证据；⑤图 1 标题中的 "10 ms" 指 RIC 控制回路的下限量级。

## 摘要

机器学习最大的增益出现在 3GPP 新空口（NR）5G 分布式单元（DU）内部 10 ms 以下的频段：链路自适应、逐时隙调度、信道估计以及接收机本身。此前没有任何开放平台允许独立构建的软件在该频段运行。先前的 dApp 框架只能作为导出流的外部观察者进入该频段。本文是对 **OCUDU dApp 平台**的引导式介绍：这是一个开放运行时与 E3 接口，在其之下，经过签名的 AI-RAN 应用在生产级 DU 内以三种时序契约执行——驻留在 GPU 接收链上（Class A）、位于调度器 100 µs 允许截止时间内（Class B），或作为永不阻塞的观察者、其结果由调度器消费（Class C）。传统路径永不被替代，每一种权限都是有类型的、经校验的，并由运营方界定边界。本文说明运行时、嵌入式 E3 代理与三个公开仓库如何彼此配合；展示一个 dApp 的源码、其签名包及其生命周期状态机；定义模块编写所依据的契约；并说明同一个管理面如何同时服务于一个 Python 脚本、一个运营方控制台与一个 LLM 代理。在一台连接手机的 GB10 gNB 上，三类 dApp（含一个树外神经均衡器）在同一个活小区上一同运行且零回退，并且仅通过生命周期操作就在空口上比较了均衡器变体。每一项实测检查点都随其条件与缺口一并报告。平台、SDK 与一个零硬件快速入门在 BSD-3-Clause-Clear 许可下作为 OCUDU AI-RAN 第 2 工作组的预览版本公开，邀请反馈、新用例，以及在并入 OCUDU 主线之前接受独立审查。

**关键词：** AI-RAN；dApp；O-RAN；E3；5G NR；DU；GPU；实时控制；ISAC；频谱感知；神经接收机；MLOps。

## I. 引言

O-RAN 控制架构让其最有价值的地盘处于无管理状态。rApp 工作在 1 s 及以上，xApp 大致向下延伸到 10 ms [1]、[2]。比这更快的一切都被封在厂商的 DU 内：链路自适应、逐时隙调度、信道估计，以及在一个相干时间内对频谱的任何反应。然而这一频段正是学习型组件展现最大增益之处——从神经接收机 [3] 到学习型链路自适应——也是 ISAC 等感知应用必须栖身才能"看见"信道之处。

dApp 概念为这一层命名并证明了需求。Bonati 等人提出了它 [4]；Lacava 等人赋予它 E3 接口（dApp 与其宿主 RAN 节点之间的实时接口）以及一个可工作的 OpenAirInterface 框架 [5]–[7]；NVIDIA 的 Aerial dApp 容器呼应了它 [8]–[10]。O-RAN 研究部门此后发布了 dApp 用例 [11]，厂商开始开放其底层 PHY [12]，部署特征刻画也已出现 [13]。这些系统共享同一个结构性天花板，即图 1 中阴影所示：dApp 是一个**外部观察者回路**。L1 导出 IQ 或 KPI，一个独立进程消费它，控制以粗略指示返回，没有准入界、没有截止时间、也没有回退。价值最高的应用——在 L1 自身张量上运行的神经接收机，或在调度决策提交前就给出答案的学习型策略——无法以这种方式表达。

本文提出的 OCUDU dApp 平台把 10 ms 以下频段开放为一个受管理的、开放的运行时。该平台建立在两个主张之上。第一，只有当该频段向由厂商、运营方与研究者组成的多元社区开放时，AI-RAN 的上行空间才能迅速兑现。第二，同一套基础设施能承载该社区所构建的一切。让一个 Python 脚本观察 CRC 判决所用的同一包格式、E3 平面与安全机制，也能让神经接收机替换接收链、让感知工作单元操纵调度器、让持续学习回路从实时采集跑到模型回滚，并让多家厂商交付可由同一运营方在运行时组合的 dApp。

本文按教程撰写。它从架构概览及其词汇（第 III 节）出发，依次介绍三种执行类及其契约（第 IV 节）、包、信任与生命周期状态机（第 V 节）、E3 平面（第 VI 节）、代码所在（第 VII 节）、包含真实源码的首次会话——一个 Class B 模块、一个可移植 Class C 客户端与一个代理（第 VIII 节）、它所承载的应用（第 IX 节）、厂商生态（第 X 节）、延迟与安全架构及其回退语义（第 XI 节）、带局限的实测证据（第 XII 节），以及扩展契约带来的收益（第 XIII 节）。各项测量依其定义单独报告 [14]。

**图 1：** 控制回路阶梯。O-RAN 的 RIC 停在约 10 ms 处。先前的 dApp 框架只能作为外部观察者回路（阴影）进入 10 ms 以下频段。OCUDU 以一个包格式、一个 E3 平面与三种时序契约覆盖整个频段。（来源：原文第 2 页。）

## II. 先前的 dApp 框架及其边界

参考 dApp 实现 [5] 把一个 Python 编写库与 libe3 [7]、一个通过 E3 服务模型导出 IQ 的补丁版 OpenAirInterface gNB，以及用于 xApp–dApp 协调的 FlexRIC 扩展配对；其典型 dApp 在导出的 IQ 上感知频谱，并返回一个 PRB 黑名单供 MAC 调度器执行。NVIDIA 的容器 [8]、[9] 把 E3 管理器与位于 CUDA L1 旁的 Triton 推理服务器配对，通过共享内存描述符向 GPU 推理后端发布 RAN 数据，并应用于 InterfO-RAN [15] 中的实时上行干扰检测。二者都是真正的亚 RIC 控制，也都验证了 E3 作为该接口的可行性。

无论实现质量如何，外部回路形态都会带来三个后果。第一，**内联应用无法表达**：神经接收机必须运行在 L1 的张量上并在时隙内流动，而外部进程为到达 PHY 已持有的数据要付出序列化、唤醒与 CUDA 上下文开销 [16]。第二，**无线链路继承 dApp 的失效模式**：实验性组件可能使小区退化或停顿，因为没有生产者侧隔离、没有准入控制、没有截止时间，也没有始终可用的传统路径。第三，**运维无法规模化**：每个 dApp 都是定制部署，因为没有签名打包、没有类型化配置、没有模型生命周期、没有统一可观测性，也没有任何框架给运营方提供在同一小区上组合多家厂商 dApp 的机制。本平台逐一应对上述问题，同时把观察者模式作为入口（经 E3 的 Class C）完整保留，使既有 dApp 风格消费者可直接移植。

## III. 平台概览

OCUDU 是 Linux 基金会开源 5G CU/DU 项目 [17]，一个生产级 5G NR 协议栈，其驻留 GPU 的 CUDA L1 与前传加速见 [16]。dApp 运行时在该协议栈上增加三个接缝并在其上增加一个管理面（图 2）。表 I 并列给出三个接缝，表 II 定义后文依赖的术语。这些术语很短，但其中若干——shadow、evaluation mode、generation、lane——具有下文论证所依赖的精确含义。

dApp 是一个在**厂商自己的仓库**中、针对**已安装的 SDK**（而非平台源码树）构建的共享对象。它由签名清单与 SPDX 软件物料清单（SBOM）描述，被暂存到 gNB YAML 中指定的目录，并通过 E3 上的显式生命周期驱动（第 V 节）。第三方边界是一个冻结的、带尺寸标签的 C ABI，具有已检入的布局指纹并在 GCC/Clang、C11/C++17 间验证，通过 `dlopen` 加载 [18]。协作只通过宿主拥有的、带模式版本的缓存进行。契约与后端无关：包声明 CPU（x86、ARM）或 CUDA 后端并获得相应的驻留钩子，SDK 为每个参考实现同时提供两种变体。重点仍是 GPU 优先，因为基带旁的计算余量可让 AI-RAN 应用先以完整保真度尝试、再优化，而不挤占无线链路自身的预算。四条不变式普遍成立：宿主拥有内存、流、校验与回退；传统路径永不被替代；每一种权限都是有类型的、逐字段校验的，并由运营方界定；dApp 之间永不互相调用。

**图 2：** 平台实现形态。DU 进程内：Class A 模块在 PUSCH 通道自己的 CUDA 流上被调用并写出 DU 拥有的输出；Class B 模块是调度器决策边界处的直接调用，返回已校验的意图；原生 Class C 模块对每个捕获时隙取租用视图，并把结果发布到宿主拥有的缓存供调度器读回。外部：共享内存环或 CUDA-IPC 池之后的受监督 Class C 工作进程，以及各类 E3 客户端。一个嵌入式 E3 代理在实时路径之外管理这一切。（来源：原文第 3 页。）

**表 I：三种执行类速览。** 接口标识符是包声明的 32 位契约 ID。（来源：原文第 3 页。）

| 类别 | 接口 | 运行位置 | 输入 | 输出 | 预算 | 失败或迟到时 |
|---|---|---|---|---|---|---|
| Class A，驻留内联 L1 | 0x00010003 信道估计；0x00010004 估计+均衡；0x00010005 全接收机到软比特 | 在 DU 进程内，于 PUSCH 通道自己的 CUDA 流上入队（CPU 变体在 CPU 上调用上层 PHY） | GPU 驻留时隙网格（complex BF16）、DM-RS 导频张量、compact 数据-RE 索引、带类型的 PUSCH 与 DM-RS 元数据 | 信道估计+噪声；均衡符号+均衡后噪声；FP16 软比特（解扰前） | 估计 100 µs、完整完成 150 µs（更深两级） | 越规授权、绕过或入队失败：同一次调用中运行传统级；迟到完成：使用结果、记录事件，连续八次打开通道熔断器 |
| Class B，有界实时控制 | 0x00010006 调度器 | 在 DU 进程内，于调度器逐切片决策处直接调用，在传统策略运行之后 | 至多 8,192 条无指针候选记录、最新干扰图、空闲 VRB 掩码，以及运营方允许的 flag | 每候选意图：优先级或禁止、PRB 上下限、偏好或指派、MCS、层数、TPC、逐 PRB 避免掩码 | 从特征构造到提交 100 µs | 调用前已太晚：跳过；调用后迟到或非法：丢弃；提交后迟到：回滚。传统决策始终成立 |
| Class C，异步观察与建议 | 0x00010001 全上行频谱网格；0x00010002 SRS 信道估计 | 在受监督进程的租用视图内、同主机进程内，或作为任意主机上的 E3 客户端 | 每时隙一次不可变发布：网格或 SRS 张量、调度器预期使用计划、序号与无线时间 | 来自唯一被准入权限包的逐 PRB 干扰图与静默期意图；其他人为观察 | 对生产者无预算；消费者自定步速 | 满环或慢消费者计为丢弃；死工作进程在有界预算内重启；所发布图按其有效期过期 |

**表 II：本文词汇。**（来源：原文第 4 页。）

| 术语 | 含义 |
|---|---|
| lane、worker | 调用 dApp 的宿主线程；lane 状态无锁且本地，实例状态跨 lane 共享 |
| gate | 决定钩子是否被调用的单一原子量；关闭表示运行传统路径 |
| bypass | 模块拒绝一次调用；宿主运行传统级 |
| admission profile | Class A 接口声明的形状界限（最大 PRB、端口、层数、调制、DM-RS 类型）；越界授权走传统路径 |
| intent | Class B 模块给调度器的建议；逐字段校验，原子提交或丢弃 |
| allow flag | 运营方 YAML 开关，授予某 Class B 实例对一类意图的权限；默认全关 |
| evaluation mode | YAML `scheduler_evaluation_only`：Class B 实例在每次决策时被调用并校验，其输出被丢弃并计数 |
| shadow | 生命周期状态：已预热、可配置、可加载模型、零流量暴露；不被调用 |
| generation | 清单、每个实例、每个配置、每个模型上的单调计数器；变更携带预期值，过期值返回 `conflict` |
| lease | Class C 视图或数据存储订阅的有界生存期；放弃即失效 |
| hard floor | 每条流的订阅者不得低于的最小间隔；默认非零 |
| breaker | 每实例熔断器：连续八次故障或未命中后打开，并让流量走传统路径，直到运营方探测 |
| incident | 故障、未命中、熔断转移或生命周期变更的归因记录，存于有界存储 |
| preflight | 一次性辅助进程，在 DU 映射模块前查询其描述符 |
| quiescence | 证明没有 worker 仍在模块内的证据；卸载前必需 |
| manifest、package sequence | 被签名的哈希绑定 JSON 记录，以及折入签名的单调发布号 |
| trust policy | 运营方离线文件：厂商密钥、每包序号下限、吊销列表与策略 epoch |
| quiet reservation | 由感知权限请求、宿主授予且预算受限的上行静默窗口 |
| E3AP、E3DP | SCTP 载波：端口 36423 上的 APER 编码管理与遥测；端口 38472 上的 FlatBuffers 只轮询数据面 |

## IV. 三种执行类

### A. Class A：驻留内联 L1

宿主提供 GPU 驻留张量及其每 lane 的 CUDA 流 [19]、[20]。输入是 complex BF16 的全时隙设备网格、带边界坐标的显式 DM-RS 导频张量、紧凑有序的数据-RE 索引，以及带类型的 PUSCH 元数据（分配形状、端口、层数、调制、噪声底、DM-RS 布局），因此模块无需调用私有 PHY 即可估计信道。输出是调用方拥有、由宿主准备并校验的设备张量：第一深度为端口与层主序的信道估计加噪声；第二深度为 `[data_re, layer]` 序的紧凑均衡符号加均衡后噪声；第三深度为解扰前 `[data_re, layer, bit]` 序的 FP16 软比特。三个深度在逐渐更深的点上重新接入链路，且没有任何钩子单独替换均衡，因为均衡器接口同时实现信道估计。在第二或第三深度成功的模块还必须从自身均衡后噪声给出调度器的上行 SINR，因为该路径上传统测量核被跳过。

在任何模块代码运行之前，宿主以固定的整数界限序列校验授权是否满足接口声明的准入 profile。随后模块入队核函数并返回，不分配也不同步。两个时钟决定接下来发生什么，其区分对运营方很重要。**回调时钟**覆盖校验与入队；在该时钟上的绕过、不支持的形状或入队失败会选择传统级，传统级在同一流上排在模块写入落地之前，故回退无需主机同步即可确定。**完成时钟**由逐 lane CUDA 事件在模块及其续延到解扰前边界之间打点。迟到完成不会被重放：宿主已承诺消费该授权的模块结果，故结果被使用并记录观察到延迟的事件，计数器递增，连续八次未命中打开该 lane 的熔断器，使后续授权走传统路径。主机侧等待由约 2 ms 的软墙预算约束，故卡住的核函数至多花费当前时隙。生产预算为估计 100 µs、更深两级完成 150 µs。

模型管理是一等公民：有界的 stage、validate、warm、activate、rollback 序列可在活小区上做权重交换，带代际检查且热路径上无分配。参考接收机恰好拥有两个预分配的设备权重 bank，以单次原子交换发布活动 bank，保留被替换 bank 作为唯一回滚代际，并在逐 lane 完成栅栏证明其已排空后才复用该 bank。

### B. Class B：有界实时控制

MAC 调度器的逐切片策略先计算其传统优先级并保留正常历史。随后它构造无指针候选快照，并在自己的 lane 上直接调用被准入的 Class B 模块。表 III 按头文件定义列出完整契约：每条候选记录携带什么、意图可以说什么，以及哪些 flag 授予哪种权限。完整边界从特征构造到校验与提交，运行在 100 µs 的允许截止时间内——这是一个刻意不作为 YAML 旋钮的宿主默认值。超时在三个检查点处理：调用前已太晚则跳过；调用后迟到或非法则丢弃结果；提交后迟到则回滚已应用的一切。任何情形下传统决策成立，重复未命中打开该实例熔断器。

权限逐 flag 授予。未设置的 flag 使该类意图静默不可用，模块通过 `allowed_output_flags` 获知。参考调度器刻意是基线副本，其五个阶段（排序、外环链路自适应、MCS 选择、PRB 打包、上行功控）全部默认关闭，故在 E3 上逐个开启某阶段之前，即便所有 flag 置位激活它也不改变任何东西。推荐路径是先 evaluation mode：模块在每次决策时被调用并校验，输出被丢弃并计数，其阶段计时器在真实负载下累积；只有此后运营方才逐个翻转 flag。

**表 III：Class B 契约（`use_cases/v1/scheduler.h`）。**（来源：原文第 4 页。）

| 元素 | 内容 |
|---|---|
| 调用 | 方向、切片、无线时间、小区 PRB 数、剩余切片预算、候选代际、允许的输出 flag |
| 候选记录（每 UE 一条，至多 8,192） | 候选 id、RNTI、待发字节与待发 SR、队头时延（下行）、已服务速率均值、传统优先级与禁止标志、CQI 或 SINR、64 结果窗口上的首传 BLER 及其计数、归一化功率余量、宿主 OLLA 偏移、上一结果及其所用 MCS、MCS 表与专家上限、层数、变换预编码、目标 SINR；逐字段有效性标志 |
| 上下文 | 最新 Class C 干扰图（逐 PRB 张量，带来源头）；空闲 VRB 掩码 |
| 意图（每候选一条） | 优先级或禁止；PRB 下限与上限；首选起点与数量（软偏好，或在允许时为硬指派）；推荐与最大 MCS；层数；TPC 命令；beam id（占位符，v1 无权限） |
| 输出 | 意图数组、必须与输入匹配的决策代际，以及本时隙新上行传输的可选逐 PRB 避免掩码 |
| allow flags（YAML） | `avoid_prb_mask`（需要非零 PRB 预算）、`mcs`（受宿主最大增量限制）、`prb_limits`、`prb_preference`、`prb_assignment`（需要空闲 VRB 快照）、`tpc`、`layers` |
| 校验 | 每条候选恰好覆盖一次；每个带 flag 字段在范围内且被允许；存储身份不变；全有或全无 |

### C. Class C：异步观察与建议

Class C 是先前架构的终点，也是 OCUDU 刻意选择的起点。一个 PHY 生产者每时隙创建一次不可变发布：全上行网格或 SRS 信道估计、调度器已提交的预期使用计划（符号×PRB 的类别图，使辐射计能区分计划空白单元与我方 UE 的能量）、序号与无线时间。三个隔离级别消费它：经租用零拷贝视图或路由拥有快照的原生进程内模块；经共享内存环或经一次设备到设备快照填充的有界 CUDA-IPC 导出池的受监督工作进程；以及任意主机上的可移植 E3 客户端。活动 L1 内存永不被映射进其他进程。生产者永不等待：发布是一次 try-lock 加一次非阻塞 eventfd、一次写与两次读系统调用，满环或忙消费者计为丢弃。宿主内联 Class C 在上行 PHY 线程上拷贝全网格，对 273-PRB、四端口网格每时隙约 50—100 µs，故多小区部署使用 CUDA 路线，只付一次设备到设备拷贝。

结果会回流，但在严格的权限模型之下。包清单携带一个能力位，区分唯一被准入的**图权限**与任意数量的**仅观察**工作进程。只有权限方可发布逐 PRB 干扰图与静默期意图，且只能通过进程内宿主 API 或受监督工作进程的认证控制通道（其对端凭据在 spawn 时固定）。每个结果必须匹配其输入被提交时记录的一次性账本条目，且实例身份、代际与序号由宿主（而非工作进程）打戳。观察者包发出的结果帧是致命能力违规。E3 客户端完全不能发布图，只能通过管理操作回写。调度器的避免掩码在之后（通常在数个时隙内）的决策中消费该图与任何已授予的静默预留，每张图都带有效期限，过期即被忽略。图 3 把三种契约放在同一个时隙上。

**图 3：** 单个上行时隙上的三种时序契约。Class B 在有界边界内提早决策；Class A 在时隙完成时内联替换接收级，并在完成时钟上测量；Class C 在不阻塞的情况下分叉快照，并通过来源校验的结果在更晚的决策处闭环。（来源：原文第 5 页。）

### D. 性能与信任的连续谱

三种类别是设计有意覆盖的性能—信任连续谱上的点（图 4）。驻留 Class A 模块在进程内、宿主流上以零拷贝张量与微秒级权限运行，因此必须是系统中**最受信任**的工件：DU 地址空间内的已签名原生代码。另一端的 E3 客户端可运行于任意进程、语言或主机，几乎不需要信任，并以延迟、拷贝与速率下限为此隔离付费。二者之间是 Class B 的有界进程内边界、原生 Class C 位置，以及带单拷贝导出与 seccomp 隔离的受监督进程。厂商或集成商从符合其隔离要求与成熟度的位置进入，通常从最隔离的一端开始，随 evaluation-mode 证据、A/B 窗口与无事件运行的积累向内移动。位置选择是 Class C 的选择：Class A 与提交型 Class B 按定义在进程内，声明进程外内联钩子的包在清单加载时即被拒绝。第 XII 节报告每个位置在参考宿主上的代价，配套接口研究 [14] 度量每个位置与先前框架机制相比的差异。

**图 4：** 性能—信任连续谱。五个位置从驻留进程内执行（最大权限、最大所需信任）延伸到外部 E3 进程（最大隔离与语言自由）。进程内契约是可移植 C ABI；E3 端与协议栈无关。（来源：原文第 5 页。）

## V. 包、信任与生命周期

**包是什么。** 一个生产级 bundle 是四个文件：共享对象、JSON 清单、SPDX 2.3 SBOM 与分离签名 sidecar。清单指明包身份、所声明的接口、后端与位置、工件的 SHA-256 以及 SBOM 的 SHA-256。一个签名覆盖全部：厂商对"清单拼接包序号"的域分隔摘要用 ECDSA P-256 与 SHA-256 签名。因此验证签名并按清单重新哈希工件与 SBOM 即可认证整个 bundle，折入序号则提供回滚保护。SBOM 是被检查的而非装饰性的：它必须恰好描述一个包与一个文件，其名称、版本、供应商与摘要均等于清单中的对应值。

**运营方持有什么。** 一个离线信任策略以 SPKI 编码哈希列出每个受信任厂商公钥、每包序号下限、吊销列表，以及一个由 gNB YAML 以最小值固定的单调策略 epoch。轮换密钥即添加新密钥并递增 epoch；吊销某密钥将使其历史签名全部失效；封禁坏构建即抬高该包下限。策略文件本身受文件系统权限与 YAML epoch 保护，而非签名——安全模型中对此有明确说明。随后准入绑定工件哈希与 SBOM 身份，在一次性 preflight 进程中运行描述符发现，将清单与编译后的描述符比对；若有任何失败，在 DU 映射该包之前拒绝。

**生命周期。** 图 5 按运行时实现绘制实例状态机。有三个状态容易混淆。`LOADED` 表示已 preflight 并已映射，但不可调用。`ARMED` 表示所有钩子已绑定在关闭的 gate 之后，且全部冷工作（包括在声明的最坏形状上的预热）已完成。`SHADOW` 表示实例已预热、接受配置与模型操作、且看到零流量。因此 shadow 是权重被 stage、validate、warm 且零暴露之处，也是 A/B 候选等待之处；它不是行为被度量之处。无权限的度量对 Class B 是 evaluation mode（处于 `ACTIVE` 且输出被丢弃），对 Class A 就是激活本身并在窗口间比较。激活把声明的接口集解析到钩子注册表，把每个 lane 挡在一个实例唯一 gate 之后，并以单次 release store 整体暴露。去激活按相反顺序：gate 关闭，lane 在有界读者宽限期后取消发布，然后才要求模块停止并静默。无法证明静默的模块被隔离驻留，而不是在活核函数下释放。

**并发与模型。** 清单、每个实例、每个配置与每个模型都带单调代际。每个变更请求携带事务 id、预期代际与可选 dry-run 标志；过期代际返回 `conflict` 而非覆盖，长操作返回 job id 而非占住套接字。模型操作遵循固定阶梯：stage、validate、warm、activate、rollback、retire，作用于 SDK 为每一类实现的三 bank 存储（staged、active、previous），因此厂商只需为其工件提供 validate 与 warm 的含义。

**图 5：** 按实现绘制的实例生命周期。E3 动作（紫色）驱动转移；每个状态的含义写在其下。熔断器与 Class B evaluation mode 与状态正交，以注释示出。每次转移都是异步、带代际检查、可 dry-run 的作业。（来源：原文第 7 页。）

## VI. E3 平面

一切控制与观察都通过已发布、带版本的 schema 经 E3 进行（图 6）：一个 ASN.1 管理服务模型与一个以 APER 编码的 E3AP 信封、一个遥测服务模型，以及一个 FlatBuffers 数据面。三个载波服务于它们。一个带凭据的本地 UNIX 套接字（模式 0600、检查对端凭据）服务同主机工具。端口 36423 上的 E3AP over SCTP 携带建立、订阅、指示与管理控制，采用消息边界分帧与至多 16 MiB 的有界分片。端口 38472 上的数据面（E3DP）是 FlatBuffers 轮询并租用的端点，面向不想用 APER 栈的消费者。APER 解码路径端到端防御性受限（读字段前做约束检查、有界重组、字符串限长），故畸形对端无法使代理失稳。

这里的 E3 是 E2 的建立、订阅、指示与控制哲学在实时本地的演化版本，可与 E2 桥接，但**不是**已批准的 O-RAN 接口。表 IV 精确说明它与先前两个实现的关系。过程名与字段词汇沿用 libe3，使适配器可实现为机械转换，但线格式**不**字节兼容，libe3 dApp 需要信封重编码加通道拓扑 shim，而非直连。SCTP 是 E2 标准化的载波，也是数家大型厂商偏好的 RAN 控制面载波，因此在此作为一等载波。

传输安全直说：本版本 E3**不**携带 TLS、DTLS 或令牌认证。两个 SCTP 载波默认绑定回环地址，除非配置显式对端列表，否则接受任何能到达绑定地址的对端。一条管理关联携带完整权限、加载、卸载、配置与 RAN 控制，因此运营方必须把 E3AP 端口与本地管理套接字同等对待，并在任何机外暴露前设置外部边界（IPsec、VPN、网络策略）。

**图 6：** E3 平面。生产者每人一个事件付一次原子加载；无人监听时如此，任何捕获工作前先以 CAS 消费速率下限。一个嵌入式代理配合有界存储服务三个载波；控制返回至宿主权限之下。（来源：原文第 7 页。）

**表 IV：与先前 E3 实现的线兼容性。**（来源：原文第 7 页。）

| 项目 | OCUDU E3 | libe3（NEU） | NVIDIA cuSense |
|---|---|---|---|
| 编码 | ASN.1 APER | ASN.1 APER 或 JSON | JSON |
| 传输 | SCTP 带消息边界 | ZMQ 或 POSIX 套接字，三个通道 | ZMQ REQ/REP 与 PUB/SUB |
| 信封 | E3-PDU，过程名相同 | E3-PDU | `common_headers` 带外共享内存 |
| 载荷上界 | 16 MiB 带分片 | 32 KiB，无分片 | JSON 响应 |
| 控制结果 | 带服务模型体的响应 | 仅确认 | JSON 响应 |
| 既有 dApp 需要什么 | 已发布 schema | 一个信封适配器；E3DP 服务参考客户端的传输，但其发布的 schema 必须重新生成 | 新的传输层 |

**遥测**（表 V）与先前导出在两点上不同。速率纪律：逐 RNTI 下限、逐订阅抽稀，以及在任何捕获工作前强制执行的逐流非零默认硬下限；空闲流每人一个事件付一次原子加载，故订阅记录器不能使小区失稳；全速捕获是显式运营方选项。完整性：`pusch.grid` 携带原始预均衡资源元素以及重跑接收链所需的每个参数（HARQ 与 RV、扰码、LDPC 基图、MCS、DM-RS 布局、DC 位置、UCI），可复现已验证数据集。

**管理**是一个统一面。它报告清单、指标与指标 schema、事件、健康、服务小区信息与静默预留队列。它驱动异步生命周期作业、每包 schema 的类型化配置、模型操作，以及一小组 RAN 控制（UE 释放为空闲、切换、RU 增益），后者由宿主自有权限对象接纳并让渡给所属组件。相同操作通过本地套接字与 SCTP 一致工作，来自 C++ `dappctl`、Python 客户端或第 VIII 节的 MCP 服务器。

**表 V：遥测流及其默认硬下限。**（来源：原文第 8 页。）

| 流 | 内容 | 下限 |
|---|---|---|
| `pusch.symbols` | 均衡符号、SINR、EVM、EPRE、RSRP、TA、CFO、授权形状 | 10 ms |
| `pusch.crc` | 逐传输块 CRC 判决 | 1 ms |
| `srs.channel` | 逐子载波 SRS 响应（端口对） | 5 ms |
| `pusch.dmrs_channel` | 逐端口逐层的 DM-RS 信道估计 | 5 ms |
| `pusch.grid` | 原始预均衡 RE 加全部参数，用于离线重解码 | 20 ms |
| `gnb.metrics_json` | gNB JSON 指标报告，逐字节 | 报告期 |
| `classc.spectrum` | Class C 快照：全上行网格张量与预期使用计划 | 生产者速率 |
| `classc.srs_isac` | Class C 快照：SRS 信道估计张量 | 生产者速率 |

## VII. 代码所在

平台以三个仓库发布在 OCUDU AI-RAN 第 2 工作组下（图 7），并排克隆为 `ocudu/` 与 `ocudu-docker/`。工作组公开开发。本版本是预览，供他人测试接口、提出用例并审查参考实现，然后才把运行时并入 OCUDU 主线。表 VI 把本文每个机制映射到其入口点，使读者可从一句话直接跳到实现它的代码。

`ocudu-dapp-platform` 是带嵌入式运行时的 gNB。公开 ABI 位于 `include/ocudu/dapp/abi/v1/`（`module.h`、`host_api.h`、`memory.h`、`execution.h`、`management.h`、`metric_catalog.h`），六个用例接口位于 `include/ocudu/dapp/use_cases/v1/`（连同 `coordination.h` 的静默预留意图），进程外契约（共享环布局、CUDA 导出池、SEQPACKET 控制协议）位于 `include/ocudu/dapp/process/v1/`。`lib/dapp/runtime/` 下的运行时持有包目录与清单、工件校验器与签名检查、一次性 preflight、模块加载器、原生钩子注册表与槽位、实例管理器与生命周期、作业调度器、熔断器、静默跟踪器与 Class C 进程监督器。`lib/dapp/e3/` 下的 E3 平面持有嵌入式代理、管理服务、APER 与 FlatBuffers 编解码器、E3AP 与 E3DP SCTP 服务器、本地凭据传输、可移植数据存储与遥测发布器；`lib/dapp/ipc/` 持有共享 SPSC 环、SEQPACKET 通道与 Class C 发布路由。进 PHY 与 MAC 的接缝是 `lib/phy/upper/dapp/` 与 `lib/scheduler/dapp/`。gNB 侧服务与 YAML 配置是 `apps/services/dapp/`。运营方工具 `dappctl`、`dapp_package`、`dapp_preflight` 在 `apps/tools/` 下。schema 在 `schemas/e3/`，Python 客户端是 `python/ocudu_e3/`，`docs/dapp/` 持有十三个教程、术语表与参考文档。

`ocudu-dapp-sdk` 是编写工具包。它消费已安装的 `OCUDUDAppSDK` CMake 包，永不拷贝宿主头文件。`reference/` 持有十六个参考包（信道估计、均衡器、接收机、调度器、频谱、SRS-ISAC，均有 CPU 与 CUDA 变体）、受监督进程/worker 与 `portable/` E3 消费者；`examples/` 持有可复制的商业 Class A 布局 `vendor_min`、一个经 E3 的 Python Class C dApp、Python 遥测观察者、经 E3AP 的频谱与 ISAC 感知，以及 MCP 服务器；`tools/` 持有认证器、每类的脚手架与验证阶梯；`docs/` 持有逐类编写指南。

`ocudu-dapp-quickstart` 是一个 Dockerfile，从两仓库当前提交构建二者，在构建内运行每个发布门，并生成带无线支持的 CPU 与 CUDA 镜像（UHD、DPDK），外加一个回环 E3 代理的 compose 文件，使每个教程命令都无需硬件即可运行。

**图 7：** 三个公开仓库及其之间的接缝。平台仓库拥有接口、运行时与 E3 平面；SDK 与每个厂商仓库只针对已安装包构建；快速入门把三者构建进一个带回环 E3 代理的容器。（来源：原文第 8 页。）

**表 VI：各机制所在（路径相对平台仓库，除非标注 SDK）。**（来源：原文第 9 页。）

| 机制 | 入口点 |
|---|---|
| 冻结 C ABI v1 | `include/ocudu/dapp/abi/v1/module.h`、`host_api.h`、`memory.h`、`execution.h`；SDK CI 中的指纹门 |
| 用例接口 | `include/ocudu/dapp/use_cases/v1/`（`spectrum.h`、`srs_isac.h`、`channel_estimator.h`、`equalizer.h`、`receiver.h`、`scheduler.h`、`coordination.h`、`pusch_metadata.h`） |
| Class A 接缝 | `lib/phy/upper/dapp/`；钩子槽位于 `lib/dapp/runtime/native_hook_*.cpp` |
| Class B 接缝 | `lib/scheduler/dapp/`；意图校验与 allow flag 在调度器策略中 |
| Class C 原生与进程 | `lib/dapp/ipc/publication_route.cpp`、`shared_spsc_ring.cpp`、`seqpacket_channel.cpp`；`lib/dapp/runtime/class_c_process_supervisor.cpp` |
| 准入与信任 | `lib/dapp/runtime/package_catalog.cpp`、`package_manifest.cpp`、`package_signature.cpp`、`artifact_verifier.cpp`、`native_preflight.cpp`；`docs/dapp/security_model.md` |
| 生命周期与作业 | `lib/dapp/runtime/instance_manager *.cpp`、`lifecycle.cpp`、`job_dispatcher.cpp`、`quiescence_tracker.cpp` |
| 安全 | `circuit_breaker.cpp`、`guarded_call.h`、`incident_store.cpp` |
| E3 代理与编解码 | `lib/dapp/e3/embedded_agent.cpp`、`management_service.cpp`、`aper_codec.cpp`、`e3ap_codec.cpp`、`fbs_codec.cpp` |
| 载波 | `lib/dapp/e3/local_connector.cpp`、`e3ap_sctp_server.cpp`、`e3dp_sctp_server.cpp`；`docs/dapp/e3_wire.md` |
| 遥测 | `lib/dapp/e3/telemetry_publisher.cpp`、`portable_data_store.cpp` |
| schema | `schemas/e3/`（ASN.1 管理、遥测、E3AP；FlatBuffers 数据面） |
| YAML 与服务 | `apps/services/dapp/`；参考文档 `docs/dapp/yaml_configuration.md` |
| 工具 | `apps/tools/dappctl`、`dapp_package`、`dapp_preflight`；`python/ocudu_e3/` |
| 术语表、局限 | `docs/dapp/glossary.md`、`docs/dapp/known_limitations.md` |
| 参考实现（SDK） | `reference/`：`channel_estimator`、`equalizer`、`receiver`、`scheduler`、`spectrum`、`srs_isac`（每个均有 `_cuda` 变体）、`process`、`portable` |
| 认证与脚手架（SDK） | `tools/`：`certify_class_a_cuda.cu`、`scaffold_class_a_cuda.py`、`scaffold_class_bc_cpu.py`、`dapp_validate.py` |
| MCP 服务器（SDK） | `examples/e3_mcp_server/`；指南 `docs/mcp_companion.md` |

**表 VII：教程阶梯**（平台内 `docs/dapp/`，SDK 内 `docs/`）。（来源：原文第 9 页。）

| # | 教程 | 覆盖内容 |
|---|---|---|
| 0 | 零硬件测试台 | 构建镜像；回环 E3 代理；无电台运行一切 |
| 1 | 新厂商 dApp 仓库（SDK） | 脚手架、构建、针对已安装 SDK 认证 |
| 2 | 从 gNB YAML 安装与加载 | 目录、信任策略、初始实例、准入 |
| 3 | 用 `dappctl` 操作 | 生命周期、A/B 版本交换、去激活与卸载、熔断器 |
| 4 | 经 MCP 监控与调优（SDK） | 向 gNB 提问；KPI 驱动的 LLM 调优回路 |
| 5 | 签名、SBOM、密钥 | 签名内容、SBOM、信任策略、轮换、吊销 |
| 6 | 经 E3 暴露 dApp KPI | 声明指标；从任意客户端读取 |
| 7 | 第一个 dApp：独立 Class C | Python 进程外 dApp：订阅、解码、回写动作 |
| 8 | 遥测与数据捕获 | 全部八条流、下限、HDF5 捕获、离线 PUSCH 重放 |
| 9 | 神经模型操作 | stage、validate、warm、activate、rollback；活 A/B |
| 10 | Class B 调度器控制 | 100 µs 契约、allow flag、evaluation-first、从感知到避让 |
| 11 | 故障排查手册 | 症状、原因、修复，来自真实失效模式 |
| 12 | 综合项目 | 采集、训练、打包、shadow、激活、监控、回滚 |

## VIII. 使用平台

**首次会话。** 零硬件路径把平台构建进容器，并把后续每个命令指向回环 E3 代理。绿色镜像即是已验证平台，因为每个发布门都在构建内运行。

```text
# 1. Clone the three public repositories side by side
WG2=https://gitlab.com/ocudu/work_groups/wg2_ai_ran
git clone https://gitlab.com/ocudu/work_groups/wg2_ai_ran/ocudu-dapp-platform.git ocudu
git clone https://gitlab.com/ocudu/work_groups/wg2_ai_ran/ocudu-dapp-sdk.git
git clone https://gitlab.com/ocudu/work_groups/wg2_ai_ran/ocudu-dapp-quickstart.git ocudu-docker
# 2. Build the release images (host, SDK, every gate)
ocudu-docker/scripts/build.sh
# 3. Start the loopback E3 agent and look around
docker compose -f ocudu-docker/docker-compose.yml up e3-agent
python3 -m ocudu_e3 --port 36423 catalog
python3 -m ocudu_e3 --port 36423 subscribe pusch.crc --maximum 5
python3 -m ocudu_e3 --port 36423 inventory
```

**教程阶梯。** 文档组织为十三个教程（表 VII），把读者从空厂商仓库带到让 LLM 代理调优一个活小区。前五个不需要签名密钥，全部针对回环代理运行。

**模块长什么样。** 每个进程内 dApp，无论哪一类，恰好导出一个符号 `ocudu_dapp_query_v1`，它填写模块表：身份、所实现接口，以及非实时生命周期回调 `create`、`configure`、`prepare`、`warmup`、`start`、`stop`、`quiesce`、`destroy`。每个接口提供一个实时入口点。列表 1 给出一个完整但最小的 Class B 模块，摘自 SDK 参考调度器：它对每条候选回显传统优先级（这正是它成为基线副本的原因），并在运营方已授予 MCS 权限时降低近期误块率高的 UE 的 MCS。每个结构以尺寸与 ABI 版本开头，没有指向宿主对象的指针跨边界，模块只读取被给定的尺寸。SDK 辅助层用几行 C++ 填好模块表与 worker 上下文，故厂商只需写算法，不写管线代码。

```c
#include "ocudu/dapp/use_cases/v1/scheduler.h"
#define SCH(x) OCUDU_DAPP_SCHEDULER_##x   /* shorten the ABI names */
static ocudu_dapp_status_v1
invoke(void *ctx, const ocudu_dapp_scheduler_input_v1 *in,
       ocudu_dapp_scheduler_output_v1 *out)
{
  /* in->invocation.deadline_monotonic_ns bounds this call */
  uint32_t n = 0;
  for (uint32_t i = 0; i < in->nof_candidates; ++i) {
    const ocudu_dapp_scheduler_candidate_v1 *c = &in->candidates[i];
    ocudu_dapp_scheduler_intent_v1 *it = &out->intents[n++];
    it->struct_size = sizeof(*it);
    it->candidate_id = c->candidate_id;
    it->flags = SCH(INTENT_PRIORITY_V1);
    it->priority = c->conventional_priority; /* baseline replica */
    if ((in->allowed_output_flags & SCH(ALLOW_MCS_V1)) &&
        (c->flags & SCH(CANDIDATE_BLER_VALID_V1)) &&
        c->bler > 0.2f && c->recommended_mcs > 0) {
      it->flags |= SCH(INTENT_MCS_V1);
      it->recommended_mcs = (int16_t)(c->recommended_mcs - 1);
    }
  }
  out->nof_intents = n;
  out->decision_generation = in->candidate_generation;
  return OCUDU_DAPP_OK_V1; /* host validates every field, then commits */
}
static const ocudu_dapp_scheduler_interface_v1 api =
    { WORKER_API, invoke, {0} };
OCUDU_DAPP_EXPORT_V1 ocudu_dapp_status_v1
ocudu_dapp_query_v1(const ocudu_dapp_host_info_v1 *host,
                    ocudu_dapp_module_v1 *m)
{
  return populate(host, m, "com.vendor.sched", &descriptor, &api);
}
```

**列表 1：** 一个针对 `use_cases/v1/scheduler.h` 的最小 Class B 模块。（代码按原文保留；仅属注释与缩进为便于阅读略有整理。）

**构建与认证 dApp。** 厂商用 `scaffold_class_a_cuda.py` 或 `scaffold_class_bc_cpu.py` 生成项目，用 `find_package(OCUDUDAppSDK)` 针对已安装包构建，并运行 `certify_class_a_cuda`（Class A）或 `dapp_validate.py`。认证器通过公开 ABI 加载最终共享对象，运行完整生命周期，在独立 CUDA 流上创建两个 worker，并驱动从单 PRB 最小形状到包声明最大形状的确定性向量。其中两类向量尤其重要：非原点位置可捕获把 DM-RS 坐标解释为相对自身分配的模块；秩亏两层参考只有在模块消费联合多符号导频集时才可解。每个调用方拥有的输出都位于投毒分配内的非零偏移处，并对前缀、后缀与非活动容量金丝雀在每次调用后检查。`dapp_package` 随后生成清单与 SBOM，并用厂商密钥签名 bundle。

**加载与驱动 dApp。** 运营方把签名 bundle 暂存到 gNB YAML 指定的目录，并经 E3 驱动。YAML 只命名清单；E3 可从目录中选择，但永不能提供路径。

```yaml
# gnb.yml: the dapp block (production shape)
dapp:
  catalog_root: /opt/ocudu/dapps
  native_preflight_helper: /opt/ocudu/bin/ocudu-dapp-preflight
  package_signature_mode: required     # lab: allow_unsigned
  package_trust_store: /etc/ocudu/dapp-trust.json
  minimum_trust_policy_epoch: 1
  package_manifests: [acme_eq.manifest.json, acme_sched.manifest.json]
  initial_instances:
    - {package_manifest: acme_eq.manifest.json, placement: in_process,
       backend: cuda, target: shadow}   # warmed, zero traffic
  scheduler_evaluation_only: true       # measure before authority
  scheduler_allow_mcs: true             # one allow flag per intent class
  local_e3: {socket_path: /run/ocudu/dapp-management.sock}
  e3ap_sctp: {bind_address: 127.0.0.1, port: 36423}
```

```text
# walk the lifecycle over the local socket; every step is an async job
ocudu-dappctl inventory
ocudu-dappctl load --package <id> --placement in-process --backend cuda
ocudu-dappctl lifecycle prepare <instance>        # allocate, upload weights
ocudu-dappctl lifecycle arm <instance>            # bind hooks, gate closed
ocudu-dappctl lifecycle enter-shadow <instance>  # warm, zero traffic
ocudu-dappctl model <instance> stage|validate|warm|activate|rollback
ocudu-dappctl config <instance> --set olla_target_bler=f64:0.05 --dry-run
ocudu-dappctl lifecycle activate <instance>       # one release store
ocudu-dappctl metrics <instance>; ocudu-dappctl incidents; ocudu-dappctl health
# the same operations over SCTP from any host
python3 ocudu_dappctl.py --sctp <gnb>:36423 inventory
```

两个竞争包的实例可以同时加载，一个激活、一个在 shadow 中等待且权重已预热，然后通过激活一个、去激活另一个完成交换。KPI 比较随后跨激活窗口运行，均衡器变体在空口上就是这样比较的（第 XII 节）。

**编写可移植 Class C dApp。** 任意主机上的 Python 进程打开 E3AP 关联，订阅 `classc.spectrum` 或 `srs.channel`，把每条指示解码为 NumPy 数组，并通过管理操作回写动作。列表 2 是 SDK 发射检测器的核心，它在第 XII 节的组合运行中处于活动状态。在 51-PRB 小区上它跟上全生产者速率，约每秒 120 个网格、4 MB/s，且每个网格解码约 120 µs。gNB 中没有任何补丁或重建。

```python
from ocudu_e3 import E3Client, SubscriptionConfig
from ocudu_e3.classc import decode_spectrum
with E3Client("gnb-host", 36423, dapp_name="radiometer") as client:
    client.setup()  # E3AP handshake; assigns a dApp id
    cfg = SubscriptionConfig("classc.spectrum", drop_policy="dropOldest")
    client.subscribe(["classc.spectrum"], configs=[cfg])
    for ind in client.indications(timeout=1.0):
        rec = ind.record          # OCC3 header + raw grid bytes
        snap = decode_spectrum(rec.metadata, rec.tensor)
        p_db = 10 * np.log10(snap.prb_power() + 1e-20)  # [symbol, PRB]
        # track a floor only where the plan says "planned empty";
        # report PRB runs above it that persist across slots
        for event in detector.detect(snap):
            print(event, ind.dropped_objects)
```

**列表 2：** 一个经 E3AP 的可移植 Class C 辐射计（`examples/e3_spectrum_sensing`）。（代码按原文保留。）

**从代理驱动小区。** SDK 中的 MCP 服务器（`examples/e3_mcp_server/`）是一个 E3 客户端，以最简单形式向 LLM 代理暴露接口的 KPI 与旋钮：一条 E3 关联上的 28 个 Model Context Protocol 工具，其中二十个观察（扇区状态、逐 UE KPI、流量历史、SRS 信道、星座图、遥测目录、dApp 清单、健康、指标、配置、事件、作业、静默预留），八个动作（dApp 配置与模型操作、生命周期、UE 释放与切换、RF 增益）。每个改状态工具默认 dry-run；应用变更是第二次显式调用 `dry_run=false`，而 `--read-only` flag 会完全移除动作类工具。列表 3 浓缩了 2026 年 8 月 26 日针对参考小区记录的一次会话。代理无需协议知识，平台护栏（类型化校验、代际、allow flag、宿主仲裁的 RAN 控制）约束了每次调用：越界值被 dApp 自身校验器拒绝，过期代际被宿主拒绝，二者都在实机上演练过。

```text
user > How is the sector looking?
agent> get_cell_overview()
-> 4 RNTIs in 10 s; UL SINR -10..9.7 dB; UL BLER mean 0.52, worst 1.0
agent> get_kpis(45); list_ues()
-> 0x4711: SNR 22 dB, CQI 15, UL MCS 15-18, BLER 10-12% on 4000 TBs
-> 0x474a, 0x474f, ...: SNR -10 dB, MCS 0, BLER ~100%, a few hundred TBs
agent: one real user sitting on the host OLLA's 10% target; the rest are
a device failing attach at the cell edge. An RF problem, not scheduling.
user > Can we tighten link adaptation for the good UE?
agent> get_dapp_config(instance=sched, schema=true) -> 22 keys, all passthrough
agent> set_dapp_config(instance=sched, dry_run=true,
  {olla_mode: contained_baseline, mcs_mode: table_plus_olla,
   olla_target_bler: 0.10, olla_step_db: 0.05, olla_max_offset_db: 6.0})
-> dryRunSuccess
agent: proposal validated; apply with dry_run=false when you are ready,
then compare BLER and MCS over a comparable window and keep or revert.
```

**列表 3：** 一次经 MCP 的 LLM 代理会话（浓缩；参考小区，2026 年 8 月 26 日）。（文本按原文保留。）

## IX. 同一架构上的七个用例

下面每个用例都按"运行什么、走哪条路径、平台提供什么"陈述。除持续学习回路（其端到端活动运行在 dummy-RU DU 上）外，全部运行于第 XII 节的活小区。

**频谱感知**直接源自最初的 dApp 演示，在此以三个逐级提升的信任级别运行。一个 Python E3 观察者订阅 Class C 频谱流，功能上等同东北大学的演示，但经已发布 schema、处于速率下限之下、且无需补丁 gNB。同一辐射计随后作为受监督进程 dApp（`ref_spectrumd`）在心跳与 seccomp 下运行。最后该工作进程作为**权限**，返回逐 PRB 干扰图与静默期意图，在数个时隙内出现在调度器的避免掩码中。一个算法、三种隔离级别、DU 零改动。

**ISAC** 骑乘 gNB 已估计的 SRS 信道：`srs_isac_monitor.py` 从 `srs.channel` 描绘距离—多普勒图；打包的 Class C 参考实现从同一张量计算有界信道冲激响应预览，CUDA 变体在生产者流上运行，永不落地到主机。

**数据集捕获**是一等产品。`record_telemetry.py` 把任意流组合写入 HDF5；`export_pusch_burst.py` 捕获 `pusch.grid` 突发；`ocudu-pusch-replay` 用 gNB 自己的接收机离线重解码并交叉校验记录的 CRC 判决。每次捕获都带有自身已验证标签、信道估计与精确 PHY 配置。

**持续学习回路**（图 8）把这些部件组装起来。遥测喂给一个在线调优过程，它可作为 dApp、RIC 应用或边缘作业运行。该过程通过同一 E3 面返回封装好的模型工件。工件被 stage、validate，并在零暴露的 shadow 实例上预热，然后在代际检查下原子激活。逐模型指标与事件监控它；退化触发一次操作的回滚；漂移则重新进入捕获。每一步都是类型化、带事务 id、可 dry-run 的操作，故该回路可由脚本、CI 管线或代理驱动。

**内联神经接收机**是 Class A 的旗舰应用。SDK 的 CUDA 参考实现实现了神经接收机在三个深度所采纳的精确契约。它们还携带学习型实现所需的模型机制：prepare 时权重上传、逐 worker 的 lane 本地历史，以及两个有界设备权重 bank 与完成栅栏纪律，故非活动 bank 在流仍读取它时永不被释放。在小区上运行的神经均衡器**不在** SDK 中；它是一个从源码树外、仅针对公开 SDK、由另一团队构建的包——这正是本文所主张的接缝得到了证明。

**内联学习型调度器。** 一个学习型策略在与基线副本相同的意图 schema 背后替换各阶段，并继承相同的 evaluation-first 路径、截止时间、来自 Class A 的均衡后噪声与来自 Class C 的干扰上下文，故它第一天就能干扰感知。

**代理驱动的运维。** 因为每个操作都是已发布 schema 定义的类型化请求，把整个面暴露给 LLM 代理只需薄适配器。代理可运行常驻回路，每隔几分钟读取 KPI 与事件，推理趋势，并用一条自然语言提示调整小区参数或 dApp 配置，同时享有使脚本回路安全的同样护栏。

**图 8：** 持续学习回路。受速率下限约束的遥测流入在线调优过程；封装好的模型工件经 E3 返回，在 shadow 实例上 stage 并预热，然后原子激活；监控驱动回滚或下一轮。一个 E3 面承载整个回路。（来源：原文第 12 页。）

## X. 厂商生态：构建、加载、组合

第 IX 节的一切都是单一团队的应用。同一基础设施通过一个清晰接缝支持从未谋面的团队（图 9）：宿主仓库拥有六个接口、E3 平面与运行时；已安装的 SDK 包、冻结 ABI 与已发布 schema 是任何人构建所依据的全部。每个 dApp 生产者都坐在该接缝之上，使用相同头文件、认证工具与打包方式。

**厂商：你的仓库、你的节奏。** dApp 生活在厂商自己的仓库中，用 `find_package` 针对已安装 SDK 构建：无宿主源码树、无 fork、无补丁队列。指纹验证的 ABI 与已发布兼容策略把厂商发布节奏与宿主解耦。离线认证与验证阶梯给厂商一份可随工件发布的证明：一个不可变、哈希绑定的共享对象+清单+SPDX SBOM+分离签名 bundle。

**运营方与集成商：组合、调优、优化。** 运营方持有信任关系的另一半：第 V 节的离线信任策略。组合是目录决策：YAML 中命名多家厂商的签名 bundle，并经 E3 驱动；它按构造安全，因为包之间不能链接或调用，只能通过宿主拥有的缓存协作，且每种权限单独授予。因此运营方调优的是组合：allow flag 决定某策略获得多少调度权限，预算与下限决定某感知套件可施加多少实时与遥测成本，位置决定其隔离，shadow 暂存候选与逐实例指标使竞争包之间的 A/B 成为常规操作。

**厂商中立之家与通往标准之路。** 代码作为预览版本生活在 OCUDU AI-RAN 第 2 工作组之下，该工作组也是其接受审查、扩展新用例并为并入 OCUDU 主线做准备的场所。接口以代码定义、由随附参考实现演练、由厂商经其互操作压力测试，使技术共识在工作软件的速度上于项目内形成。随后进入 SDO 的——O-RAN 的 E3 工作 [11] 并最终 3GPP——是一个已被证明的工件。Class A 与 Class B 的 C ABI 刻意可移植到本代码库之外，E3 端则已接纳任何使用该 schema 的协议栈。

**图 9：** 该基础设施所使能的生态。厂商在自己的仓库中针对已安装 SDK 构建签名包；运营方与集成商持有信任策略，在一个目录中组合多家厂商的包，并在活 DU 上加载、调优、交换与卸载它们：无需重建、无跨厂商链接、全程宿主仲裁。（来源：原文第 12 页。）

## XI. 延迟架构与安全

30 kHz 子载波间隔下一个时隙是 500 µs，在五小区 CUDA L1 规模下约 100 µs 的主机抖动就已产生前传迟到，因此平台必须不给无线链路稳态增加任何可测开销。设计按构造保证这一点（图 10），分两步。第一，实时线程上的每个稳态机制代价为纳秒到个位微秒：空闲时一次原子 gate、速率下限一次 CAS、一次无锁缓存读、一次带 eventfd 写的 try-lock 发布。第二，工作按线程而非按模块放置：实时 lane 的全部 E3 职责是一次受 gate 的 memcpy，而编码、套接字 I/O 与生命周期作业位于允许较慢的管理执行器上。五条规则使之具体化：

1. **空闲是一次原子加载。** 每个捕获点与 dApp 钩子由单次 relaxed 或 acquire 原子 gate 控制。未配置的特性没有可测代价。
2. **生产者永不阻塞。** try-lock、非阻塞 eventfd 与计数丢弃取代消费者可能诱发的每一次等待。慢观察者是它自己的问题，永不是无线链路的问题。
3. **每个残余等待都有界。** 退化 GPU 或卡死消费者至多花费当前时隙：回退触发、计数器递增、没有线程停顿。
4. **任何调用路径上无稳态分配。** 预分配工作区、无锁快照池、每次编码前清空的 builder。
5. **GPU 纪律。** Class A 在宿主流上入队并返回。Class C 的 CUDA 导出是进入有界 IPC 池的一次设备到设备快照，永不是活动 L1 内存的映射。

**截止时间对每一类意味着什么。** 截止时间以不同方式强制执行，运营方应知道是哪种。对 Class B，截止时间在三个检查点强制执行，迟到结果被跳过、丢弃或回滚，故无线链路永不会看到它。对 Class A，回调时钟上的失败在同一次调用中选择传统级，但已入队的核函数无法取消，故迟到但成功的完成会被使用并记录、而非被替换；慢模块的隔离手段是熔断器（连续八次未命中后打开），以及把越规授权挡在其外的准入门。在原生代码调用中途抢占无法安全做到，这是 v1 的刻意决定：其时序尚未被信任的包应放在 Class C 进程位置，而非内联。对 Class C，根本不存在生产者侧截止时间。

图 11 给出包所攀爬的阶梯与一切回退所依托的护栏。准入绑定工件哈希与 SBOM 身份、在一次性 preflight 进程中运行描述符发现、并在任何派发前检查声明的形状 profile。运行时护栏在模块边界捕获异常并翻译为经净化的事件记录，在分离的回调与完成时钟上计量截止时间，在故障时打开逐 lane 熔断器；传统路径在每一级都在位。受监督 Class C worker 增加带固定对端凭据的 `SOCK_SEQPACKET` 控制、在信任边界校验无指针结果、seccomp 拒绝列表、资源限制、挑战—响应心跳，以及带退避、以健康运行窗口为条件的重启预算。可观测性闭环：逐原因回退计数、带实测 GPU 时长的截止未命中、心跳延迟、重启与事件记录，全部可通过管理 dApp 的同一 E3 面查询。进程内模块仍是完全受信任代码；preflight 与护栏降低可预见故障的影响，但不是沙箱，进程位置是有界故障隔离，不是敌对多租户隔离。

**图 10：** 延迟架构。上：实时路径上每个稳态机制在对数代价轴上的位置，比时隙预算低三个数量级、也远低于已致前传迟到的抖动。下：按线程的工作放置。实时 lane 只拥有四个廉价操作，一切昂贵工作以正常优先级运行。（来源：原文第 14 页。）

**图 11：** 安全阶梯。认证与签名离线完成；准入故障关闭；运行时护栏把故障与迟到转化为回退加熔断；受监督隔离甚至能约束行为不当的进程。传统路径在每一级都在位，每次转移都可经 E3 观测。（来源：原文第 14 页。）

## XII. 实测证据与局限

**测试台。** 全部活小区结果来自一个空口小区：一台 NVIDIA GB10（DGX Spark，Arm）主机运行 CUDA 驻留 L1、split-8 USRP B210、n78 频段 3410.1 MHz、20 MHz（51 PRB）TDD、30 kHz 子载波间隔、一发一收天线、Open5GS 核心网，以及作为 UE 的商用手机，组合运行期间有三台接入。接口测量来自配套接口研究 [14]，在同一主机上用已发布机制在两种条件下（安静主机与小区在空口）取得的原始分位数（图 12、13）。产生这些结果的基准套件随平台发布。表 VIII 与表 IX 区分两类证据——机制成本与系统级运行——并逐行说明读者复现所需条件。

**局限与状态。** 缺口与特性一样直白陈述，并说明各自如何闭合。

- **Class A 尾部。** 参考接收机在独占 GPU 的活形状上满足预算，但 273-PRB 核函数约 270 µs 完成、超出 150 µs 预算，尚未通过延迟认证。在此之前，准入 profile 止步于认证器已认证的形状，100 MHz 小区对更宽授权走传统路径。尾部认证是下一个准入门。
- **Class B 证据**来自未启用经批准 CPU 控制（无隔离核或固定实时策略）的主机，故属开发证据。套件表明安静主机上每个载波都满足截止时间，而只有直接调用在 DU 上空的条件下保住尾部——这正是关键条件。
- **稳态开销**按构造保证并由前传迟到发布门检查，但第 XI 节论证所需的已发布比较（同一流量在运行时关闭、开启、以及开启并挂全速记录器三种情形下，报告前传迟到、GPU 利用率与逐核负载）仍待完成。它是在本预览离开工作组之前的最高优先级测量。
- 上空比较遵从未操作手册记录的纪律，该纪律习自一次顺序比较曾把 no-op 对照排在两个真实实验组之上：交错并重排实验组，每次切换后等待链路自适应稳定，从单一 RNTI 读取 CRC 计数器的窗口内增量，每臂累积数千传输块。表 IX 的 BLER 行背后的块计数、窗口长度与区间，以及组合运行的对照窗口，将随认证报告发布。
- **生态。** 多厂商机制已实现并演练，但迄今在小区上运行过的每个包都由作者所在组织产出。树外神经均衡器展示了该接缝，而非已出现的独立厂商。
- **传输安全。** 本版本 E3 不携带传输认证；带凭据的本地套接字、回环绑定与运营方隧道即边界（第 VI 节）。
- **多小区。** 遥测归因目前是单小区：每条流报告发布者的默认小区 id，宿主内联 Class C 也不是五小区配置。多小区归因与异步 Class C prepared-output 事务是路线图项。
- **MCP。** 该服务器是模式的示例，而非硬化产品。其安全性来自平台护栏。

**表 VIII：机制成本与截止时间符合性（GB10 主机）。** 标为 runtime 的行是平台自身检查点；标为 suite 的行来自配套接口研究 [14]，除注明外均在安静主机上。（来源：原文第 13 页。）

| 主张 | 结果 | 条件 | 复现方式 |
|---|---|---|---|
| Class B 边界（runtime） | 3.6 µs P99.9，无未命中 | 最坏 profile、9,000 次调用开发矩阵；未启用经批准 CPU 控制的主机 | 平台测试，任意 x86 或 Arm 主机 |
| Class B 直接调用（suite） | 安静时 0.29 µs P99.9；小区在空口时 5.2 µs | 同一 3.2 KB 请求经 SCTP 回环：安静 16 µs、上空 181 µs，100 µs 处 0.35% 未命中 | 基准套件；上空行需电台 |
| Class A 驻留接收机 | 82 µs P50、112 µs P99.9（suite）；92.5 与 105.1 µs（runtime） | 活形状、51 PRB、两层、256-QAM、独占 GPU；150 µs 预算；273-PRB 核函数尚未认证 | 在 CUDA 主机上运行认证器 |
| Class C 环发布 | 每 68 KB 时隙 2.0 µs P50、2.3 µs P99.9 | 生产者临界区；满环计为丢弃；强制 worker 重启下维持 0.87 Gb/s | 基准套件，任意主机 |
| SCTP 上的 E3AP | 1.5 KB 时单向 10 µs；734 KB 时 1.4 ms；控制往返 11 µs | asn1c APER 编解码、回环关联、两个固定进程 | 快速入门回环代理 |

**表 IX：活小区上的系统级运行。**（来源：原文第 15 页。）

| 运行 | 结果 | 条件与缺口 |
|---|---|---|
| 单小区组合 | 四个 dApp、三类俱全、超过 260,000 次均衡器调用、零回退 | 树外神经均衡器（A）、参考调度器（B）、频谱与 SRS-ISAC（C）；三台接入手机。相同流量且 dApp 卸载的对照窗口尚未发布 |
| 空口均衡器变体 | MCS 11—15 下首传 BLER 低 7—11 个百分点 | 两个神经变体仅经生命周期交换，相同 UE 与流量；在激活窗口内逐 RNTI 读 CRC。传输块计数、窗口长度与置信区间尚未列表 |
| 运维面 | 八条遥测流；28 个 MCP 工具（二十观察、八动作） | 一条 E3 关联；每个改状态工具默认 dry-run；可针对回环代理复现 |

## XIII. 扩展契约带来什么

表 X 汇总与第 II 节先驱框架的差异，应读作范围与生产成熟度的陈述：那些框架意在证明该层并取得了成功，下文许多机制只有在 dApp 被信任到足以产生影响之后才需要。三行承载论证。**权限**：先前的控制返回是粗略原语；此处每条控制路径——Class A 输出、Class B 意图、Class C 图与静默请求、E3 RAN 控制——都通过针对运营方授予边界的类型化校验，宿主仍是裁决者。**生产者安全**：先前导出与 L1 耦合；此处无线链路在算术上对其观察者无动于衷。**运维**：先前 dApp 是手工集成部署；这些是有治理的工件，带签名、SBOM、代际、dry-run、事件与回滚——正是这一点使多厂商组合与代理驱动运维得以可能。

**表 X：先前 dApp 框架（为证明该层而构建）对 OCUDU 平台（为生产采纳而构建）。** 差异在范围与成熟度，而非意图。（来源：原文第 15 页。）

| 项目 | 先前（NEU / NVIDIA） | OCUDU dApp 平台 |
|---|---|---|
| 执行 | 经导出 IQ/KPI 的外部进程 | 外部**与**进程内；驻留 GPU L1 替换；有界调度器钩子 |
| 控制 | 早期原语（如 PRB 黑名单） | 类型化、校验、allow-flag 界定意图；已授予静默预留；RAN 控制操作 |
| 生产者安全 | 导出与 L1 耦合 | 永不阻塞；空闲即一次原子；有界等待；计数丢弃 |
| 回退 | 留给集成方 | 传统路径永不被替代；熔断器；隔离 |
| 打包 | 逐部署集成 | 签名清单、SBOM、离线信任；preflight；ABI 指纹 |
| 生命周期 | 手工或脚本 | E3 作业、shadow 状态、代际、dry-run、回滚 |
| 模型操作 | 框架之外 | 在活小区上 stage、validate、warm、activate、rollback |
| 多厂商 | 意图中立；组合机制仍待 | 在运营方信任与 allow flag 下的运行时组合 |
| 隔离 | 容器 | 受监督进程：认证 IPC、seccomp、心跳、有界重启 |
| 线格式 | 前标准、仍在收敛 | 已发布 ASN.1 APER 与 FlatBuffers、有界编解码、版本化 schema；SCTP 为一等载波 |

## XIV. 结论与可用性

**工件可用性。** 全部软件以 BSD-3-Clause-Clear 许可在 OCUDU AI-RAN 第 2 工作组下开源，地址 https://gitlab.com/ocudu/work_groups/wg2_ai_ran/，分为三个仓库：`ocudu-dapp-platform`（带 dApp 运行时、E3 代理、schema 与 Python 客户端的 gNB）、`ocudu-dapp-sdk`（参考包、认证器、脚手架、示例与 MCP 服务器）、`ocudu-dapp-quickstart`（可复现容器构建、回环 E3 代理，以及教程与文档索引）。第 VIII 节的列表可在无需电台、GPU 或签名密钥的情况下复现 E3 面；表 VIII 的机制成本可在任意主机上由已发布基准套件复现，仅在该表注明处需要 CUDA 主机与电台；上空结果需要 GB10 级主机、USRP 或 split-7.2 O-RU，以及接入 UE，如教程所述。这是预览版本：工作组邀请对接口的反馈、能对其施压的新用例，以及参考实现的独立审查，这些都将输入运行时与 E3 平面并入 OCUDU 主线的过程。

**展望。** ABI 与 schema 已冻结；路线图增加异步 Class C prepared-output 事务、多小区遥测归因，并随 evaluation-mode 证据积累而拓宽 Class B 特性块。平台被构建为持续生长：新用例接口、新流、新参考，以及按设计由作者永不会见到的厂商 dApp——由厂商永不会谋面的运营方组合。因为接口生活在厂商中立的开源项目中，它们所积累的共识在需要形式化时可移植进 O-RAN 与 3GPP。

dApp 层的奠基者对机会所在判断正确，观察者回路是进入该机会的正确第一步。本文以工作系统呈现了下一步：一种基础设施，使同一有治理工件今天观察频谱、明天建议调度器、在证据支持之日替换接收机，同时喂给训练其继任者的数据集，向运维代理负责，并与从未见过其代码的厂商的 dApp 共享小区。

## 致谢

本工作部分由美国国防部 OUSD(R&E) FutureG 办公室通过国家频谱联盟（NSC）Spectrum Forward OTA 资助，包括对 Linux 基金会 OCUDU 开源 RAN 项目贡献的支持。

## 图注与表注

**图 1（原文第 2 页）：** 见正文 §I 图注（控制回路阶梯）。
**图 2（原文第 3 页）：** 见正文 §III 图注（平台实现形态）。
**图 3（原文第 5 页）：** 见正文 §IV-C 图注（单时隙上的三种时序契约）。
**图 4（原文第 5 页）：** 见正文 §IV-D 图注（性能—信任连续谱）。
**图 5（原文第 7 页）：** 见正文 §V 图注（实例生命周期）。
**图 6（原文第 7 页）：** 见正文 §VI 图注（E3 平面）。
**图 7（原文第 8 页）：** 见正文 §VII 图注（三个公开仓库及接缝）。
**图 8（原文第 12 页）：** 见正文 §IX 图注（持续学习回路）。
**图 9（原文第 12 页）：** 见正文 §X 图注（厂商生态）。
**图 10（原文第 14 页）：** 见正文 §XI 图注（延迟架构）。
**图 11（原文第 14 页）：** 见正文 §XI 图注（安全阶梯）。
**图 12（原文第 15 页）：** Class B 契约在负载下的表现。一次 3.2 KB 调度器请求跨六种边界，各 20,000 次；柱为 P99.9、刻线为 P50，虚线为允许截止时间（100 µs）。六种边界为：OCUDU direct ABI（已校验调用）、SPSC queue（2 线程）、SPSC shm（2 进程）、SCTP loopback（E3 风格实时）、ZeroMQ REQ/REP `ipc://`、ZeroMQ REQ/REP tcp loopback。安静主机上每种载波都满足；当 DU 在空口时，只有无需唤醒的路径保住尾部。（来源：原文第 15 页。）
**图 13（原文第 16 页）：** 生产者规则实测。左：OCUDU 共享环与 ZeroMQ 发布/订阅的每时隙生产者代价；右：消费者所见数据年龄。环生产者代价不动，陈旧度由环深约束，每次丢弃都被计数（0/0/13/4457 次丢弃等标注、环深×时隙=4 ms）；ZeroMQ 要么排队到其高水位线，要么静默丢弃。（来源：原文第 16 页。）

**表注汇总：** 表 I（原文第 3 页）为三种执行类速览；表 II（第 4 页）为术语表；表 III（第 4 页）为 Class B 契约；表 IV（第 7 页）为与先前 E3 实现的线兼容性；表 V（第 8 页）为遥测流与默认硬下限；表 VI（第 9 页）为各机制代码入口点；表 VII（第 9 页）为十三个教程；表 VIII（第 13 页）为机制成本与截止时间符合性；表 IX（第 15 页）为活小区系统级运行；表 X（第 15 页）为先前框架与平台的差异。十张表均已在正文中逐格转录并与 PDF 渲染核对。

## 参考文献（英文原书目）

[1] M. Polese, L. Bonati, S. D'Oro, S. Basagni, and T. Melodia, "Understanding O-RAN: Architecture, interfaces, algorithms, security, and research challenges," IEEE Communications Surveys & Tutorials, vol. 25, no. 2, pp. 1376–1411, 2023.
[2] O-RAN ALLIANCE, "WG3: Near-real-time RAN intelligent controller and E2 interface workgroup," 2026, official workgroup charter. [Online]. Available: https://www.o-ran.org/technical-groups/wg3
[3] R. Wiesmayr, C. Dick, J. Hoydis, and S. Cammerer, "Design of a standard-compliant real-time neural receiver for 5G NR," arXiv preprint arXiv:2409.02912, 2024.
[4] S. D'Oro, M. Polese, L. Bonati, H. Cheng, and T. Melodia, "dApps: Distributed applications for real-time inference and control in O-RAN," IEEE Communications Magazine, 2022, arXiv:2203.02370. [Online]. Available: https://arxiv.org/abs/2203.02370
[5] A. Lacava, L. Bonati, N. Mohamadi, R. Gangula, F. Kaltenberger, P. Johari, S. D'Oro, F. Cuomo, M. Polese, and T. Melodia, "dApps: Enabling real-time AI-based open RAN control," Computer Networks, vol. 269, p. 111342, 2025, arXiv:2501.16502. [Online]. Available: https://arxiv.org/abs/2501.16502
[6] OpenRAN Gym and WiNES Lab, "dApp framework tutorial: Deploy and extend dApps," 2026, openAirInterface spectrum-sharing tutorial. [Online]. Available: https://openrangym.com/tutorials/dapps-oai
[7] WiNES Lab, "libe3: Vendor-neutral E3AP C++ library," GitHub repository, 2026. [Online]. Available: https://github.com/wineslab/libe3
[8] D. Villa, M. Belgiovine, N. Hedberg, M. Polese, C. Dick, and T. Melodia, "Programmable and GPU-accelerated edge inference for real-time ISAC on NVIDIA Aerial testbed," arXiv preprint arXiv:2512.06493, 2026. [Online]. Available: https://arxiv.org/abs/2512.06493v2
[9] NVIDIA, "Aerial CUDA-accelerated RAN," https://docs.nvidia.com/aerial/, 2024.
[10] K. Cohen-Arazi, M. Roe, Z. Hu, R. Chavan, A. Ptasznik, J. Lin, J. Morais, J. Boccuzzi, and T. Balercia, "NVIDIA AI Aerial: AI-native wireless communications," arXiv preprint arXiv:2510.01533, 2025. [Online]. Available: https://arxiv.org/abs/2510.01533
[11] O-RAN Alliance nGRG, "dApps for real-time RAN control: Use cases and requirements," O-RAN Alliance, Tech. Rep. RR-2024-10, Oct. 2024, contributed research report. [Online]. Available: https://www.o-ran.org/research-reports/dapps-for-real-time-ran-control-use-cases-and-requirements
[12] The Mobile Network, "When it comes to Nokia's new AI-RAN, keep your eye on the dApps," https://the-mobile-network.com/2026/07/when-it-comes-to-nokias-new-ai-ran-keep-your-eye-on-the-dapps/, Jul. 2026.
[13] C. Boeira, E. Baena, A. Lacava, T. Melodia, D. Koutsonikolas, and I. Haque, "Performance characterization of dApps in open radio access networks," arXiv preprint arXiv:2605.05426, 2026.
[14] T. O'Shea, M. Pennybacker, and A. Kharchenko, "Enabling AI-RAN applications through dApp architecture decisions: A measured study," 2026, companion paper, in preparation.
[15] N. N. Santhi, D. Villa, M. Polese, and T. Melodia, "InterfO-RAN: Real-time in-band cellular uplink interference detection with GPU-accelerated dApps," arXiv preprint arXiv:2507.23177, 2025. [Online]. Available: https://arxiv.org/abs/2507.23177
[16] M. Pennybacker, W. Liu, A. Kharchenko, and T. O'Shea, "GPU-resident CUDA acceleration for OCUDU 5G PHY and O-RAN fronthaul: Architecture and preliminary performance," arXiv preprint arXiv:2608.04338, 2026. [Online]. Available: https://arxiv.org/abs/2608.04338
[17] OCUDU Ecosystem Foundation, "OCUDU ecosystem foundation FAQ," https://ocudu.org/faq/, 2026, linux Foundation-hosted Open CU/DU ecosystem.
[18] The Open Group, "POSIX dlopen()." [Online]. Available: https://pubs.opengroup.org/onlinepubs/9699919799/functions/dlopen.html
[19] NVIDIA, "CUDA runtime API: Stream management," 2026. [Online]. Available: https://docs.nvidia.com/cuda/cuda-runtime-api/group__CUDART__STREAM.html
[20] ——, "CUDA programming guide: The CUDA driver API," 2026. [Online]. Available: https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/driver-api.html

**本页范围与校对状态：** 本页覆盖 arXiv:2609.07843v1（cs.NI，2026 年 9 月 7 日）全文 17 页：摘要、第 I—XIV 节、致谢、图 1—13 图注、表 I—X、列表 1—3（代码保留原文，仅上下文译出）、参考文献 [1]—[20]（英文原条目）。原文全文无编号数学公式（本页亦无编号公式）。表格核对：用 `render.py` 渲染 PDF 第 3、4、7、8、9、13、15 页并逐格核对表 I—X（含表 VIII 的 3.6 µs/0.29 µs/5.2 µs/82 µs/112 µs/2.0 µs/2.3 µs、表 IX 的 260,000 次调用与 7—11 个百分点、表 X 的逐项差异等），并核对 §XII 测试台参数（GB10、split-8 USRP B210、n78 3410.1 MHz、20 MHz/51 PRB、30 kHz 等）。已按页首译注列出原文关键说明/疑点 5 项（E3 非 O-RAN 已批准接口、无 TLS/DTLS、证据分类与缺口、Class B 3.6 µs 为开发证据、图 1 中 10 ms 含义），均按原文照录并加注。未做逐句逐式的字符级终校（含代码列表的缩进与注释为便于阅读略有整理，标识符与数值未改）；图内曲线与示意图内容未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体内容，请以 [原文 PDF](https://arxiv.org/pdf/2609.07843v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
