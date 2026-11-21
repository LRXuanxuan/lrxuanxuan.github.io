# 轻绘 Windows / Android：跨会话维护与发布交接

> 记录日期：2026-11-22。此页是**长期索引和操作规范**，不是自动更新的“最新版检测”。每次准备修改时先核对仓库 main、版本文件、Release 和 CI 状态，再更新本页。不要凭旧会话记忆直接打包或覆盖发布文件。

## 一、唯一源码与现有基线

- **唯一代码仓库**：[LRXuanxuan/lrxuanxuan.github.io](https://github.com/LRXuanxuan/lrxuanxuan.github.io)，默认分支 `main`。网页版 `drawing-studio.html`、`color-block-studio.html` 与 `assets/drawing-studio/` 是**三个平台共同使用的绘画实现**；绝不为 Windows / Android 复制第二套画板。
- **Windows 桌面版：已发布的基线为 0.1.2。** GitHub Release [`lightdraw-v0.1.2`](https://github.com/LRXuanxuan/lrxuanxuan.github.io/releases/tag/lightdraw-v0.1.2)，标签指向固定提交 `d21f7958b75de70d2a15dc6c101b06fbcc4f5c70`。下载页 [`/drawing-desktop/`](https://lrxuanxuan.github.io/drawing-desktop/) 指向这一版的 NSIS 安装 EXE、免安装 ZIP 和 SHA-256 校验清单。发行还包含独立 EXE。平台：Windows 10/11 x64；Tauri 2 + 系统 WebView2。Windows 安装包本身不代表已进行 Windows 代码签名。
- **Android：当前源码版本为 0.1.0（`versionCode=1`）。** `android/app/build.gradle` 中 `applicationId=io.github.lrxuanxuan.lightdraw`，`minSdk=26`，`targetSdk=36`。此前会话曾制作已签名的 0.1.0 APK、SHA-256 清单和**私密签名备份**，但**本仓库和这份交接文件都不包含这些二进制文件或签名密钥**。不能凭此条声称签名 APK 已有永久公开下载链接；在下一次升级前，应先确认用户手中的正式 APK 和原始签名备份仍可取得。
- **源码与安装包的区别：** Git 仓库保存可修改源码及构建脚本；Windows 已发布的安装文件存 GitHub Release；Android CI 暂时只产生未签名 release APK，Actions artifact 保留 **14 天**，不能视作长期备份。用户保存的私密签名备份是另一个不可替代的资产。
- 截至本记录，`main` 比 Windows 0.1.2 发行标签前进了两个提交，主要涉及 Android 测试及下载页等；后续修改应从**最新 main** 开始，而不是退回 0.1.2 发行标签再丢弃新变更。

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
4. 发布新版 Windows：从 0.1.2 递增到尚未占用的版本；同步 `desktop/package.json`、`desktop/src-tauri/Cargo.toml`、`desktop/src-tauri/tauri.conf.json`、关联锁文件/使用说明/网页下载入口。构建并核验 NSIS 安装包、独立 EXE、免安装 ZIP 和 SHA-256，再发布**新** `lightdraw-vX.Y.Z` 标签，不覆盖旧 Release。必要时用 workflow_dispatch 启动构建（仅改共享资源不一定触发 Windows 的路径过滤）。
5. 发布新版 Android：先核验原签名备份；`versionName` 递增到未用版本、`versionCode` **严格大于 1**，保留 `applicationId`。CI 构建/验证 unsigned APK，必须在安全环境用**同一把长期正式签名密钥**签名，执行签名验证、应用 ID/版本核查及覆盖升级测试，再交付/发布已签名 APK 与 SHA-256。**没有旧密钥就暂停覆盖升级方案**，不能换成调试签名或新签名假称可覆盖安装。
6. 每次真正确认发布成功后，回写本页：平台版本、源码提交 SHA、Release 或私密交付位置、产物 SHA-256、签名证书指纹（仅公开证书指纹、绝不公开密钥）、关键验证证据及仍未实测的部分。

## 四、必须保留的兼容性和隐私边界

- 两平台应用 ID 固定 `io.github.lrxuanxuan.lightdraw`。Windows 本机源站 `https://tauri.localhost`；Android 本机源站 `https://appassets.androidplatform.net`。不要随意变更来源、数据目录、WebView 或窗口配对流程。
- Windows、Android、网页版的本机 IndexedDB 草稿**互不自动同步**。跨设备/跨平台迁移请保存和打开 `.lrxdraw` 工程；安装/卸载或清理数据前主动导出备份。保留旧工程兼容性。
- **绝不将 APK 签名 keystore、密码、私密 ZIP、用户画作或参考图写入公开 GitHub、Release、Pages、CI 日志。** 签名私钥必须由用户在受控的私密位置另存并至少保留可靠备份。GitHub Actions 临时 artifact 不是密钥备份，也不是永久分发渠道。
- 符合博客轻量化约束：不要将安装包、APK、node_modules、Rust target、Android 构建目录等大文件直接加入网站目录或 Git 历史。Windows 二进制集中放 GitHub Release；Android 正式 APK 应放经过核验的分发位置，不能因为没有发布链路就声称已上线。
- 旧版发布产物一律保留；同标签不覆盖。更新者需先检查当前版本实际资产和 SHA，失败则保持原下载入口。

## 五、给下个会话的复用指令

> 请直接读取我的 GitHub 仓库 `LRXuanxuan/lrxuanxuan.github.io` 中的 `docs/drawing-app-release-handoff.md`、`AGENTS.md`、`docs/drawing-desktop.md` 和 `docs/drawing-android.md`，从最新 main 修改轻绘现有共用代码；按原有打包和签名规则发布 Windows / Android 新版，不要重新建立项目或覆盖旧版本。
