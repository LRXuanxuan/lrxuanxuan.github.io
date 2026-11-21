# Risograph 孔版印刷色卡

2026-11-22，按用户要求将六个已上传的 RSCO Procreate `.swatches` 数字色板加入「轻绘」，每行五色。来源是用户提供文件中的 `Swatches.json`，不是从网上色卡图片采样。运行时数据位于 `assets/drawing-studio/palettes-risograph.js`。

## 收录范围与顺序

| 界面名称 | 稳定 ID | 有效色块 | 移除空槽 | 源 Display P3 色块 |
| --- | --- | ---: | ---: | ---: |
| 主色卡 01 | `risograph-master01` | 30 | 0 | 2 |
| 主色卡 02 | `risograph-master02` | 30 | 0 | 0 |
| 主色卡 03 | `risograph-master03` | 20 | 10 | 4 |
| 北美印刷店 | `risograph-north-american` | 14 | 16 | 1 |
| 欧洲印刷店 | `risograph-european` | 14 | 16 | 3 |
| 日本印刷店 | `risograph-japanese` | 14 | 16 | 2 |

共 122 个套装成员，81 个不同英文色名，转成 8 位 sRGB 后有 79 个不同 HEX。跨套重复成员保持原位；`Gray/Grey` 和 `Wine/Burgundy` 虽然各自同色，也保留原始名称。只去掉空槽，不重新排序或重新按色相分组。

每套的 `columns: 5` 同时供右侧色卡和左侧参考概括用色读取。紧凑排法连续排列；按色系排法仅显示套装标题，仍保留完整原序。主色卡 01、02 为六行，03 为四行；三套印刷店色卡各三行，末行四色。独立六块常用色继续一行六块，其他品牌列数不随此次变化。

中文短名为界面译名，不作为原厂色号或官方中文名称。`officialName` 保留去掉统一前缀 `RSCO Riso ` 后的英文原名，可在悬停说明和无障碍名称中查看。网页数据按英文名称复用同色对象，套装成员数组单独保留。

## 源文件校验值

- `RSCO_Risograph_Master_Colors_01.swatches`（6093 字节）
  SHA-256：`2e504b86445bcacb089f05fad8801f477e76fab8577b247a6bd8f72955e46da5`

- `RSCO_Risograph_Master_Colors_02.swatches`（5310 字节）
  SHA-256：`4e142ea1405a57c9f1454b91e9f635b9e5b8c8f855195ee4e84b8753a9437cc7`

- `RSCO_Risograph_Master_Colors_03.swatches`（5091 字节）
  SHA-256：`4b8c6afb91fccaa9f86ce822adb8e71999c04c839e4393fb1ffc1463b30e55f2`

- `RSCO_Risograph_North_American_Print_Shop.swatches`（4763 字节）
  SHA-256：`6ebdd785a770a39ea6b9e1b19aa6112c6c76f9c772ee424e40bd8dcb031f3dc2`

- `RSCO_Risograph_European_Print_Shop.swatches`（4894 字节）
  SHA-256：`e89147ceac50bde1f9cfee9808f591a52a590bda9871bb33a8fa4ec792eea39f`

- `RSCO_Risograph_Japanese_Print_Shop.swatches`（4894 字节）
  SHA-256：`95b6645d399e09db616bddf5c4aa6e4060503f58e298142def6320a66bb5d003`

以上原始压缩包不作为页面依赖发布。维护时应由用户授权的原文件重新转换，不从浏览器截图反推 RGB。

## 解码与色彩转换

这六个文件的 122 个有效条目均为完全不透明。针对**此次文件实际字段**逐项核对：

1. 4 个 `origin=1` 条目均为 Black；其 `components` 等于独立字段 `[hue, saturation, brightness]`，属于 HSV，应先转 RGB。转换并量化后为 `#000000`。把该数组直接乘 255 会错误得到 `#000500`。
2. 其余 118 个 `origin=2` 条目的 `components` 为 RGB，与独立 HSV 转 RGB 的结果在 `1e-6` 容差内一致。
3. 110 个条目引用嵌入的 `sRGB IEC61966-2.1`，保持原 RGB 浮点通道。12 个条目引用 `Display P3`，用其嵌入 ICC 转换为 sRGB。不能将 P3 通道直接当作网页 HEX。
4. 离线转换使用 LittleCMS 2.16 的 `TYPE_RGB_FLT` 输入、输出，目标为 `cmsCreate_sRGBProfile()`；relative colorimetric intent=1，flags=0，未启用黑点补偿。适应状态为 1.0（该设置只影响 absolute colorimetric intent，不改变此处的 relative 转换）。
5. 最后才把输出通道限制到 `[0,1]` 并计算 `floor(channel * 255 + 0.5)`，生成小写六位 HEX。不要先把 P3 量化到 8 位再转色域，会产生额外误差。

源 ICC：
- sRGB IEC61966-2.1，3144 字节，SHA-256：`2b3aa1645779a9e634744faf9b01e9102b0c9b88fd6deced7934df86b949af7e`。
- Display P3，548 字节，SHA-256：`e468e89239fc0493d5e8fb9b014e91b210c6caa73c81edf04c3d21a734f377cc`。

P3 条目转到 sRGB 后的检查值：

| 英文原名 | sRGB HEX |
| --- | --- |
| Flatallic Gold | `#BB8D44` |
| Metallic Gold | `#B19269` |
| Bright Olive Green | `#B89E00` |
| Bright Gold | `#C47D17` |
| Copper | `#CB5E2C` |
| White | `#FFFFFF` |
| Grey | `#928D88` |
| Fluorescent Green | `#44D62C` |
| Mint | `#82D8D5` |
| Coral | `#FF8E91` |

`Bright Olive Green` 超出 sRGB 色域，转换后的负蓝通道被裁剪；白色边界还可能出现微小的 ICC 浮点越界。此转换保留适合网页使用的数字屏幕颜色，不承诺完整保留 P3 色域、荧光、金属反射或纸上油墨混合。

## 接入与维护

- `drawing-studio.html` 在基础 `palettes.js` 及其他色卡之后、`palette-map.js` 与 `color-library.js` 之前加载新模块，使用 `defer` 保持依赖顺序。
- 六套均设置 `matchMethod: 'color'`，复用 Oklab 参考概括与额外黑白候选。点击选色、自由调色、填充前景、收藏与工程 `paletteId` 均沿用已有流程。
- 维护时核对每套有效色块数、完整原序、同名色一致性、五列、左/右联动及工程恢复；已有映射测试的加载列表及按色彩匹配预设名单必须包含新模块。
- 无新增运行时库、图像或字体。Windows/Android 下次打包由既有脚本复制共用前端；这次网页更新不代表已安装的原生程序自动升级。
