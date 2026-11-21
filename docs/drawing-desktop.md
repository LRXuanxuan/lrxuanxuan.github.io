# 轻绘 Windows 桌面版

桌面入口 `/drawing-desktop.html`，首版 0.1.0，Windows 10/11 x64。
原生窗口使用 Tauri 2 和系统 WebView2；前端直接打包当前画板、教学页及其
本机资源，不维护另一套画板源码。桌面版本与网页版的 IndexedDB 分开，
通过 `.lrxdraw` 工程迁移作品，不承诺自动读取浏览器的草稿。

## 文件与构建

| 文件 | 用途 |
| --- | --- |
| `desktop/package.json`、`package-lock.json` | 固定 Tauri CLI；仅构建时使用 Node |
| `desktop/src-tauri/` | Rust 原生窗口、导出、关闭保护、权限与打包配置 |
| `desktop/desktop.js` | 仅在桌面包中注入的保存、窗口联动、关闭适配 |
| `tools/build_drawing_desktop.py` | 从现有网页及资源生成 `desktop/dist/`，检查本机启动资源闭包并写入哈希清单 |
| `desktop/icon.svg` | 现有轻绘笔尖图案的矢量图标源；PNG/ICO 仅供原生安装包使用 |
| `.github/workflows/drawing-desktop.yml` | Windows x64 编译、打包、校验与 GitHub Release |
| `desktop/README.txt` | 随 ZIP 提供的中文使用说明 |

Windows 开发环境安装 Rust MSVC 工具链、Visual Studio C++ 构建工具、
Node 和 Python 后，在 `desktop/` 运行 `npm ci`、`npm run build`。
CLI 的 beforeBuildCommand 会先生成前端，再由 Rust 编译资源并生成 NSIS。
发布构建使用已提交的 npm 与 Cargo 锁文件；首次构建需要下载构建工具及依赖。

`desktop/dist/`、`desktop/node_modules/`、`desktop/generated-licenses/`、
`desktop/release/`、`desktop/src-tauri/target/` 是构建产物，
不提交。`desktop/` 从 Jekyll 输出排除。EXE/ZIP 只放 GitHub Release，
不能加入 Git 历史或 GitHub Pages 站点。

## 必须保持的存储与窗口约定

- 固定 identifier `io.github.lrxuanxuan.lightdraw` 和资源源站
  `https://tauri.localhost`（`use_https_scheme(true)`）；不要在后续更新随意改成
  HTTP、file 协议或临时端口，否则既有 IndexedDB 可能无法找到。
- 单实例运行，主画板标签 `main`。教学及打印窗口使用 `studio-*`。
  只有一个可编辑主画板；意外新开画板的导航转为聚焦主窗口。
- 所有窗口关闭 Tauri 的原生拖放接管，保留原 HTML 图片/PDF 拖放。
- 新窗创建必须使用 `about:blank`、原请求的 `window_features` 和
  `NewWindowResponse::Create`。不要自行导航已有窗口，否则 WebView2 的
  WindowProxy/opener 配对会失效。教学参考仍用原 `DrawingBridge` 同源机制。
- 桌面适配层把画室链接的普通点击、修饰点击和中键统一送入 DrawingBridge；
  该链接不提供浏览器“新标签页”菜单，画布右键撤销继续保留。
- 远程 HTTP(S) 链接只在系统浏览器打开。原生导出命令只接受本机画室页面；
  不给远程页面文件系统、命令执行或应用退出权限。

## 保存与退出合同

`DrawingDesktop.save(blob, filename)` 只有原生下载管理器报告成功落盘时才
返回 `true`；保存对话框取消返回 `false`，失败 reject。作品字节留在
WebView2 的 Blob 下载路径，不用跨 IPC 传巨大 base64。

1. JS 先建立 Blob URL 并监听事件，再调用 `prepare_download` 让用户选路径。
2. 用户同意后以同一个 Blob URL 触发 `a.download`。Rust 只接受当前窗口已授权的 URL。
3. `lightdraw-download-started` 回执取消 10 秒启动超时；已开始的下载没有总时限。
4. `lightdraw-download-finished` 含 URL、结果和实际位置；此时才撤销 URL，
   并允许网页逻辑显示成功或更新已另存的 revision。

画板初始化、自动恢复与参考读取完成后才调用 `desktop_ready`。主窗口关闭时
由 `lightdraw-close-requested` 触发 `DrawingStudio.prepareToClose()`：先收笔并
提交滑块事务，再排空旧保存 promise，循环写入最终 revision，最后核对存储
队列与 stamp。忙碌/PDF 未翻完返回 false，存储故障或跨窗口冲突 reject。
只有 true 才调用 `finish_close`。整个阶段临时禁止新输入，避免保存后又落笔。

Rust 在 `finish_close` 再检查所有窗口的待选路径和正在下载项；存在未完成导出
时保留应用。保存失败的对话框允许继续绘画并另存工程，也允许用户明确放弃
本次未保存修改后退出。不能默默绕过失败直接退出。

## 发布与验证

版本号同时维护 package.json、Cargo.toml、tauri.conf.json、用户 README 与
下载页，npm/Cargo 锁文件同步。发行标签 `lightdraw-v<版本>` 固定到实际构建
提交，同版本已发布文件不覆盖。源码改变后发布新版本；网站日常色卡改动
不会自动覆盖用户已经下载的 EXE。

正式文件包括 NSIS 安装包、ZIP 中的 Lightdraw.exe、独立 EXE 与 SHA256SUMS.txt。
安装包为当前用户安装；缺少 WebView2 时下载 bootstrapper，不捆绑庞大浏览器。
免安装指可直接运行 EXE，用户草稿仍使用 Windows 用户目录，不宣传为数据随身版。

最低必要检查：

- `tools/test_drawing_app.cjs` 覆盖最终修订保存、收笔/事务、失败保留和导出取消。
- `tools/test_studio_desktop_exports.cjs` 覆盖教学页的所有下载调用等待实际结果。
- `tools/test_drawing_desktop.cjs` 检查原生适配保存、关闭和链接配对合同。
- Python 打包检查全部 HTML 启动资源及延迟 PDF/worker 资源；保留上游许可证。
- 发行构建先从锁定的 Rust 依赖收集许可，嵌入前端资源并在 ZIP 附文本；
  CI 缺少许可清单时打包失败，不能只在 ZIP 附许可而遗漏独立 EXE/安装版。
- Windows CI 编译并核对安装包/EXE/ZIP 与哈希；发布后核对 Release 文件及站点入口。

自动化合同测试和 CI 编译不等于真实 Windows GUI、数位板或打印机实测。
未经实机测试，不声称所有 Wacom 型号支持压感，也不把安装包大小说成运行内存。

原生 API/发行策略依据：[Tauri Windows 安装程序](https://v2.tauri.app/distribute/windows-installer/)、
[WebviewWindowBuilder](https://docs.rs/tauri/2.12.7/tauri/webview/struct.WebviewWindowBuilder.html)、
[Tauri GitHub Actions](https://v2.tauri.app/distribute/pipelines/github/)。



## 0.1.1 前端同步

用户要求 EXE 同步归纳练习室最新的左上角 logo。0.1.1 继续复用现有
网页源码，包含单 SVG logo 的单格布局修正以及本轮手机和平板界面微调。
应用 identifier、数据目录、文件格式和原生保存流程保持一致。

安装版、独立 EXE 和免安装 ZIP 按新版本构建，不替换已发布的 0.1.0。
网站下载入口只在新版本发布并核对资产后切换到 0.1.1。


## 0.1.2 绘画工具同步

本版继续保留 0.1.1 的练习室单 SVG logo 修正，并将同一套网页功能同步进
Windows 原生壳：紧凑图层图标、复制/向下合并/显隐、中心渐变、可调闭合间隙、
套索填充、填充色卡快捷入口、颜色/透明填充和逐层/整体调色。

原生应用身份、用户数据目录与保存机制不变，旧 `.lrxdraw` 工程继续兼容。
下载入口须在 `lightdraw-v0.1.2` 构建、原生启动验证与产物哈希核对成功后再发布；
不覆盖 0.1.0 或 0.1.1 Release。各功能的像素、撤销与工程验证见画室维护说明。

## 0.1.3 数位笔优先

新版本包含网页版默认开启的「画笔仅限数位笔」。仅拦截鼠标在画笔工具里的普通左键绘制，改为平移；橡皮、填充、形状、文字、取色和移层继续可用。偏好存在原有 Tauri HTTPS 源站的 localStorage，保留 0.1.2 的固定应用身份、IndexedDB 工程与草稿路径。

Windows 0.1.3 在构建与发布前用同一份前端代码跑数位笔/鼠标输入回归。发布新 Release 后才更新网站的下载按钮；旧 Release 不覆盖。
