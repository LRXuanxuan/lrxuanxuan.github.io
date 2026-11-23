# 轻绘 Windows / Android：跨会话维护与发布交接

> 记录日期：2026-11-22。此页是**长期索引和操作规范**，不是自动更新的“最新版检测”。每次准备修改时先核对仓库 main、版本文件、Release 和 CI 状态，再更新本页。不要凭旧会话记忆直接打包或覆盖发布文件。

## 一、唯一源码与现有基线

- **唯一代码仓库**：[LRXuanxuan/lrxuanxuan.github.io](https://github.com/LRXuanxuan/lrxuanxuan.github.io)，默认分支 `main`。网页版 `drawing-studio.html`、`color-block-studio.html` 与 `assets/drawing-studio/` 是**三个平台共同使用的绘画实现**；绝不为 Windows / Android 复制第二套画板。
- **Windows 桌面版：已发布的基线为 0.1.2。** GitHub Release [`lightdraw-v0.1.2`](https://github.com/LRXuanxuan/lrxuanxuan.github.io/releases/tag/lightdraw-v0.1.2)，标签指向固定提交 `d21f7958b75de70d2a15dc6c101b06fbcc4f5c70`。下载页 [`/drawing-desktop/`](https://lrxuanxuan.github.io/drawing-desktop/) 指向这一版的 NSIS 安装 EXE、免安装 ZIP 和 SHA-256 校验清单。发行还包含独立 EXE。平台：Windows 10/11 x64；Tauri 2 + 系统 WebView2。Windows 安装包本身不代表已进行 Windows 代码签名。
- **Android：当前主分支源码版本为 0.1.1（`versionCode=2`），尚需正式签名与发布核验。** `android/app/build.gradle` 中 `applicationId=io.github.lrxuanxuan.lightdraw`，`minSdk=26`，`targetSdk=36`。此前会话曾制作已签名的 0.1.0 APK、SHA-256 清单和**私密签名备份**，但**本仓库和这份交接文件都不包含这些二进制文件或签名密钥**。不能凭此条声称签名 APK 已有永久公开下载链接；在下一次升级前，应先确认用户手中的正式 APK 和原始签名备份仍可取得。
- **源码与安装包的区别：** Git 仓库保存可修改源码及构建脚本；Windows 已发布的安装文件存 GitHub Release，目前主分支已将 Windows 源码版本提升到 0.1.3，尚未核实对应正式 Release；Android CI 暂时只产生未签名 release APK，Actions artifact 保留 **14 天**，不能视作长期备份。用户保存的私密签名备份是另一个不可替代的资产。
- 2026-11-22 已检视到**数位笔优先输入分流**：网页版新增默认开启的「画笔仅限数位笔」，鼠标左键在画笔模式改为平移；鼠标仍可使用其他编辑工具，手指绘画另有开关。Windows 源码版本 0.1.3 和 Android 源码版本 0.1.1 已纳入此功能与测试；这**不意味着对应原生安装包已经发行**。新会话应从**最新 main** 开始，避免回退或丢掉其他新修改。

## 二、文件与构建入口

| 作用 | 源码位置 |
| --- | --- |
| 共用画布、图层、画笔、颜色、参考、工程保存 | `drawing-studio.html`、`color-block-studio.html`、`assets/drawing-studio/` |
| Windows 原生壳和锁定依赖 | `desktop/`、`desktop/src-tauri/` |
| Windows 构建、发版工作流 | `tools/build_drawing_desktop.py`、`.github/workflows/drawing-desktop.yml` |
| Android 原生壳与签名预留 | `android/`、`android/app/build.gradle` |
| Android 离线资源、构建与模拟器检查 | `tools/build_drawing_android.py`、`.github/workflows/drawing-android.yml` |
| 桌面端详细约定 | [`docs/drawing-desktop.md`](drawing-desktop.md) |
| 安卓端详细约定 | [`docs/drawing-android.md`](drawing-android.md) |
| 共用画板功能及测试约定 | [`docs/drawing-studio.md`](drawing-studio.md) |
| AI 维护硬性规则 | [`AGENTS.md`](../AGENTS.md) |

**当前已知功能基线：** 0.1.2 的 Windows 打包版及同期的共用前端包括图层复制/向下合并/显隐、中心渐变、油漆桶闭合间隙、套索填充、色卡快捷入口、透明填充和逐层/整体调色等。后续应依据当前源码和测试判断功能是否保留，不要因换一个会话就从零重新实现。

## 三、换个会话继续更新的最短流程

1. 先读取本页、`AGENTS.md`、`docs/drawing-studio.md` 和两个平台的详细文档，再检查 `main` 最新提交、版本号、构建工作流及 GitHub Release。始终保留用户既有项目、图层、签名和存储约定。
2. 只修改共同前端一次；必要时再分别调整 `desktop/` 或 `android/` 的原生适配。网页版完成部署 **不代表** 已安装的 Windows/Android 程序自动更新。
3. 运行相关 Node/Canvas 像素、图层、填充、工程保存、原生消息合同测试，之后运行 Windows CI 启动检查与 Android 模拟器测试。**不可把自动化检查写成真实设备、数位板或触控笔验收。**
4. 发布新版 Windows：核对已发行 0.1.2 和主分支待发布的 0.1.3，使用尚未占用的版本；同步 `desktop/package.json`、`desktop/src-tauri/Cargo.toml`、`desktop/src-tauri/tauri.conf.json`、关联锁文件/使用说明/网页下载入口。构建并核验 NSIS 安装包、独立 EXE、免安装 ZIP 和 SHA-256，再发布**新** `lightdraw-vX.Y.Z` 标签，不覆盖旧 Release。必要时用 workflow_dispatch 启动构建（仅改共享资源不一定触发 Windows 的路径过滤）。
5. 发布新版 Android：先核验原签名备份；主分支暂为 `0.1.1` / `versionCode 2`，发布前须核对已分发的正式 APK，确保新版本的 `versionCode` **严格大于实际安装版本**，保留 `applicationId`。CI 构建/验证 unsigned APK，必须在安全环境用**同一把长期正式签名密钥**签名，执行签名验证、应用 ID/版本核查及覆盖升级测试，再交付/发布已签名 APK 与 SHA-256。**没有旧密钥就暂停覆盖升级方案**，不能换成调试签名或新签名假称可覆盖安装。
6. 每次真正确认发布成功后，回写本页：平台版本、源码提交 SHA、Release 或私密交付位置、产物 SHA-256、签名证书指纹（仅公开证书指纹、绝不公开密钥）、关键验证证据及仍未实测的部分。

## 2026-11-22 共用前端更新：撤下历史草稿

- 已从画室界面移除「旧版草稿」按钮、弹窗、历史列表与访问接口；`DrawingStorage` 升级 IndexedDB `rc-drawing-studio-v1` 至 schema v3，打开时自动删除旧 `drafts` 对象存储。
- **已有 `current/artwork` 自动续画必须保留**；没有当前作品时直接空白启动，不自动迁入旧草稿。手动 `.lrxdraw` 文件不会被清理。保留跨标签页 stamp CAS、退出存储检查与失败保护。
- 这是一项已提交到主分支的网页版源码改动，**并不表示原先安装的 Windows/Android 二进制已经自动更新**。以后重新打包时直接复用当前共用源码，不要把被撤下的恢复入口加回来。验证规范见 `AGENTS.md` 和 `tools/test_drawing_storage.cjs`。

## 2026-11-22 共用前端更新：吹石、海怪与东东笔刷

- 共 56 支：保留原「勾线」「混色与推抹」「硬边与像素」8 支，新增吹石 13、海怪 15、东东 20。按用户最新指示撤下原有其余 18 支和专用绘制代码；用户无需旧工程兼容，不保留旧笔刷 ID 迁移。
- 三份 `brushes-*-data.js` 保存精简笔尖/纹理与源参数，`brushes-chuishi.js` 是三组共用的轻量 Canvas 适配引擎。HTML 必须按数据、适配引擎、core、app 的依赖顺序加载；打包脚本递归复制 `assets/drawing-studio/`，勿漏掉新模块。
- 缺失的原应用内置素材及部分渲染公式采用明确记录的近似。素材来源、转换命令与支持边界见 [导入笔刷说明](drawing-imported-brushes.md)，专项像素/DOM 回归见 `tools/test_drawing_chuishi.cjs`。网页不携带原始刷包、头像、重置备份或新的运行时依赖。
- 方形混色与发光喷枪取样当前层，会合成该层的笔画身份；普通新增笔刷与空心描边保留整笔擦除身份。当前工程与本机续画、原内存/图层上限仍按既有机制处理。
- 这次仅更新网页版及共用前端，未重新发布 Windows / Android 安装包。下次原生发版直接复用当前资源，并复查离线资源闭包与专项笔迹回归。

## 2026-11-22 共用前端更新：Risograph 色卡与干湿印填充

- 新增六套用户提供的 RSCO Risograph 数字色板，统一每行五色，保留各套原始颜色顺序，继续复用右侧取色、左侧参考概括与工程预设保存。数据在 `assets/drawing-studio/palettes-risograph.js`，来源与转换规则见 [Risograph 色卡说明](drawing-risograph-palettes.md)。
- 同时新增 Riso Dry 稀疏、中等、浓密，以及 Riso Wet 淡、中、浓，共六档程序填充，复用 `marks.js` 与原选区/透明/工程流程；HTML 中 `marks.js`、`app.js` 的缓存版本同步更新。没有新增运行时图像或原笔刷包。
- 本次只修改网页版及共用前端资源，Windows / Android 原生版本号和已发布安装包不变。下次打包由现有脚本递归纳入新模块，需保留 HTML 的加载顺序及新色板资源；不另建一套色卡实现。

## 2026-11-22 共用前端更新：笔刷颗粒与纹理参数

- 纹理笔在“画具 → 笔触”提供独立粗细 0–400% 和密度 0–200%，100% 保持原效果。任一项为 0% 关闭颗粒与内部纹理并保留正常出墨，包含水彩纸纹；独立水彩外观控件仍使用各自参数。参数随每支笔在本机记忆，当前笔参数写入 `.lrxdraw`；试笔、笔刷库和实际绘画共用，0 值不得回落成默认值。
- 共用 `brushes-chuishi.js` 处理独立纸纹和柔和机理笔尖纹理，`app.js` 与 `drawing-studio.html` 接入控件。继续使用原有素材与小缓存，不添加运行时库或纹理包。定向验收见 `tools/test_drawing_brush_texture.cjs`。
- 此项更新网页版和共用资源，未重新发布 Windows / Android 安装包。后续原生发版直接纳入当前资源，并运行纹理与原有笔刷像素回归；不得将网页更新说成已安装程序自动升级。

## 2026-11-22 共用前端更新：糖针、多色与自然变化

- 填充材质新增圆头短条「糖针」（`sprinkles`）。排线、水玉、棋盘、纸纹、点描、编织与糖针可选择 1–6 种纹理色，背景色/透明保持独立；第一色沿用当前前景，其余颜色分别设置。
- 「自然变化」默认关闭；开启后分别调节大小和形状变化。共享 `marks.js` 以固定种子生成小图块，预览与提交同源，新增字段随原有 `settings.marks` 保存和恢复。Riso 和渐变沿用原有选项。维护与像素验收见 `docs/drawing-studio.md`、`tools/test_drawing_pattern_variation.cjs` 及原填充回归。
- 本次仅修改网页版和共用前端，不递增 Windows / Android 原生版本，也不重新发布 EXE/APK。下次打包直接复用当前资源；保留现有安装包、签名及数据目录约定。

## 2026-11-22 共用前端更新：形状插入后编辑

- 形状面板新增「插入形状 / 选择修改」。插入自动选中，支持拖动移动、四角缩放、线条／箭头两端调整、样式应用、复制和删除；当前层形状列表可选择重叠、空心或遮挡的对象。文字仍沿用像素放置。
- `stroke-records.js` 在既有 `kind: overlay` 中增加不可变 `shape` 参数，不改变工程版本号；复用 64 px 稀疏瓦片及原撤销、保存机制。移动和修改保留原操作顺序，后画笔迹与局部擦除仍正确参与重放；独立副本不能修改原件或历史。
- 新形状参数随工程与本机续画保存。旧栅格没有参数，不能恢复对象身份；128 次操作／16 MiB 记录限额及填色、抠图、混色、改尺、合并等合成边界继续适用。选框不进入图片或工程图层内容。
- 同时加入以所选直线为基准的平行／垂直绘制，以及闭合形状、画框的四角平面透视。透视投影包含描边、渐变和多色纹理；四角元数据随工程保存，支持复位和撤销。源／目标各限制为 1 MP、最长边 2048，拖动预览各 131,072 像素；大幅变形可能损失细部清晰度，不生成完整 3D 光影或镜面反射。
- 本项只更新网页版与共用前端源码，不调整原生版本号、不重新发行 Windows／Android 包。已安装的旧版本不具备新形状编辑能力；后续原生发版应复用当前代码，并验收工程中的形状参数往返，不能把像素可打开当作编辑身份已保留。
- 维护说明与验收项见 [画室说明](drawing-studio.md)，专项回归为 `tools/test_drawing_shapes_core.cjs`、`tools/test_drawing_shape_editing.cjs`、`tools/test_drawing_shape_guides.cjs` 和 `tools/test_drawing_perspective_core.cjs`。此处记录实现和检查要求，不作为部署、原生包或真实设备测试已完成的凭据。

## 2026-11-22 共用前端更新：三支淡彩水彩

- 新增持续湿纸「湿水彩 · 融色」、干后透明「干水彩 · 罩染」及露白「枯笔水彩 · 颗粒」，在原有 56 支之外新增三支。共用 `watercolor.js` 与固定提交的 MIT Spectral.js；加载顺序为 `vendor/spectral/spectral.js` → `watercolor.js` → `core.js` → `app.js`。
- 默认浅淡透纸；水分、边缘斑驳、水纹、浓淡变化独立调节，原纹理粗细/密度继续可用。每笔偏好及工程均保留参数，当前预览以同一引擎绘制两笔。
- 湿画无后台计时或隐藏湿层，直接从当前层实际 RGBA 重新混合；同层旧色可化开，其他层与纸底保持独立。干罩染/枯笔保留整笔身份，湿混色按既有规则合成记录且仍可撤销/局部擦除。
- 专项验收见 `tools/test_drawing_watercolor.cjs`，来源/许可证与边界见 [水彩笔刷说明](drawing-watercolor.md)。此次更新网页版和共用资源，未重发 Windows / Android 安装包；下次打包纳入模块及许可证，不覆盖既有发行。

## 2026-11-23 共用前端更新：速写画纸

- 「屏幕与练习」移到「纸张与文具」前。按用户追加要求，将新加的两款速写预设改为 CTL-472 横向 1400 × 875（16:10）和纵向 875 × 1400（10:16），依据官方 152 × 95 mm 有效绘画区；首次空白画布及新建表单默认横向。
- 两个方向的预设先按同方向精确尺寸识别，再回退转置匹配；点击方向按钮同步名称。当前作品与工程按原尺寸恢复，每笔大小和压感偏好保持。共用预设控件，无新增素材或依赖。
- 本项更新网页版与共用前端，未重新发行 Windows / Android 安装包；后续打包直接复用上述默认值和预设。

## 2026-11-23 共用前端更新：十五支趣味笔刷

- 在原有 59 支之外新增 15 支，分为“趣味·干性／线束／颗粒／装饰／气氛”五组。共用 `brushes-expressive.js` 独立生成炭条、线束、飞溅、环链、烟云等笔迹，不复制 KRESKA 的源码或素材，不称为官方移植。
- HTML 在 `core.js` 之前加载新模块，`core.js` 统一登记及委托；原有逐笔偏好、试笔、分帧图库、压感、防抖、浓度一次合成和整笔记录继续复用。可调纹理任一项为 0 时保持正常出墨；纯几何形状不显示纹理旋钮。
- 所有新增笔刷不取样图层、不跨层修改；工程和本机续画保存最终像素及原有笔画记录。回归入口为 `tools/test_drawing_expressive.cjs`，同时保留应用、原笔刷、纹理、水彩及整笔擦除检查。具体用途见 [画室说明](drawing-studio.md)。
- 仅更新网页版及共用前端，不修改 Windows／Android 版本号、不重发 EXE/APK。下次原生打包递归纳入新模块，核对 HTML 资源闭包；已有安装包不会随网页更新自动增加笔刷。

## 四、必须保留的兼容性和隐私边界

- 两平台应用 ID 固定 `io.github.lrxuanxuan.lightdraw`。Windows 本机源站 `https://tauri.localhost`；Android 本机源站 `https://appassets.androidplatform.net`。不要随意变更来源、数据目录、WebView 或窗口配对流程。
- Windows、Android、网页版的本机 IndexedDB 草稿**互不自动同步**。跨设备/跨平台迁移请保存和打开 `.lrxdraw` 工程；安装/卸载或清理数据前主动导出备份。保留旧工程兼容性。
- **绝不将 APK 签名 keystore、密码、私密 ZIP、用户画作或参考图写入公开 GitHub、Release、Pages、CI 日志。** 签名私钥必须由用户在受控的私密位置另存并至少保留可靠备份。GitHub Actions 临时 artifact 不是密钥备份，也不是永久分发渠道。
- 符合博客轻量化约束：不要将安装包、APK、node_modules、Rust target、Android 构建目录等大文件直接加入网站目录或 Git 历史。Windows 二进制集中放 GitHub Release；Android 正式 APK 应放经过核验的分发位置，不能因为没有发布链路就声称已上线。
- 旧版发布产物一律保留；同标签不覆盖。更新者需先检查当前版本实际资产和 SHA，失败则保持原下载入口。

## 五、给下个会话的复用指令

> 请直接读取我的 GitHub 仓库 `LRXuanxuan/lrxuanxuan.github.io` 中的 `docs/drawing-app-release-handoff.md`、`AGENTS.md`、`docs/drawing-desktop.md` 和 `docs/drawing-android.md`，从最新 main 修改轻绘现有共用代码；按原有打包和签名规则发布 Windows / Android 新版，不要重新建立项目或覆盖旧版本。
