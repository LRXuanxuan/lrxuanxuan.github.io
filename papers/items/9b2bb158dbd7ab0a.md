---
layout: page
title: "Environment-Aware IRS Deployment via Channel Knowledge Map: Joint Sensing-Communications Coverage Optimization"
permalink: /papers/items/9b2bb158dbd7ab0a/
toc: false
---

[← 返回论文库](/papers/?paper=9b2bb158dbd7ab0a)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

本文研究面向智能反射面（intelligent reflecting surface, IRS）赋能的集成感知与通信（integrated sensing and communication, ISAC）系统的 IRS 部署优化问题：在候选位置策略性地部署多个 IRS，以辅助基站（base station, BS）提升感知与通信覆盖。本文提出一种利用信道知识地图（channel knowledge map, CKM）的环境感知 IRS 部署设计，CKM 提供各候选 IRS 位置与 BS 或目标感知/通信点之间的信道状态信息（channel state information, CSI）。基于由 CKM 获得的 CSI，本文在运行阶段联合优化 IRS 部署、BS 发射波束成形与 IRS 反射波束成形，目标是在满足感知区域最小照射功率要求与通信区域最小信噪比（signal-to-noise ratio, SNR）要求的前提下最小化系统代价。特别地，考虑两种情形：IRS 反射波束成形可在整个运行期内分别以实时动态方式与准静态方式实现。对两种情形，联合 IRS 部署与发射/反射波束成形设计均被建模为混合整数非凸优化问题，并采用基于连续凸近似（successive convex approximation, SCA）的松弛-定界方法求解：先将二元 IRS 部署指示变量松弛为连续变量，再通过 SCA 求收敛解，最后将松弛指示量取整回二元值。数值结果表明，所提算法在满足感知与通信要求的同时能有效降低系统代价。

**摘要依据：** [查看原文摘要](https://doi.org/10.1109/TNSE.2026.3691866)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 利用 CKM 提供的 CSI 设计环境感知的 IRS 部署以提升感知与通信覆盖
- 联合优化 IRS 部署与基站发射、IRS 反射波束成形以最小化系统代价
- 将感知照射功率与通信 SNR 要求作为约束纳入部署优化
- 考虑反射波束成形的实时动态与准静态两种实现情形
- 设计基于连续凸近似的松弛-定界方法求解混合整数非凸问题

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
