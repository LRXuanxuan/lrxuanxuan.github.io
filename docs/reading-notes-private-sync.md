# 阅读摘录：GitHub 私有仓库同步维护规范

此功能服务于 `/translations/` 下的文学作品和已启用 `reading_notes` 的文章，遵守博客轻量化、个人数据不进入公共仓库的原则。

## 首次启用（由博客所有者在浏览器操作）

1. 在 https://github.com/new 创建仓库 `LRXuanxuan/reading-notes-private`，选择 **Private**、勾选 Add README。也可使用其他自己有权访问的**私有**仓库。
2. 在 https://github.com/settings/personal-access-tokens/new 创建 **Fine-grained personal access token**：
   - Resource owner：持有这个私库的账户。
   - Repository access：Only select repositories → 仅选择这个私库。
   - Repository permissions：Contents = Read and write；Metadata = Read（通常自动赋予）。
   - 不要授予公共博客仓库访问权限；设置合理到期时间。
3. 打开任意启用了阅读笔记的作品/章节，在「〰 摘录」面板中展开「☁ 私库同步（手动）」，填写仓库名及临时令牌，点击「↑ 合并并同步到私库」。
4. 其他电脑/浏览器填写相同仓库与有效令牌，再点击「↓ 从私库合并到本机」。之后可在该设备继续双向合并同步。
5. 如需让 ChatGPT 以后**直接读取**私人摘录，在 GitHub 的 ChatGPT GitHub App 安装设置中，另外明确授权该私有仓库。仅创建私库、只在网页填写 token，并不等于 ChatGPT 已有权限。

## 数据格式与安全边界

- 核心脚本：`assets/js/reading-notes.js`；样式：`assets/css/reading-notes.css`；入口继续由 `_includes/metadata-hook.html` 自动挂载。
- 本地仍使用原键 `localStorage['lrx-reading-notes-v1']`，不更改或清空历史摘录。内部格式升级到 `version: 2`，字段 `notes` 保留原文和批注，增加 `updated` 和 `deleted`（删除墓碑，时间戳，解决跨设备删除重现）。
- 私库固定文件名 `reading-notes.json`；只上传 JSON 纯文本，绝不把该文件提交到**公开博客仓库**、GitHub Pages、Issue、Actions 日志或公共 Gist。
- 为兼容 GitHub Contents API 的小文件 Base64 返回方式，私库同步快照限制为约 1 MiB；超过时提示用户先导出整理，不静默截断数据。手动 JSON 导入仍允许最大 3 MB。
- **仅手动同步**：访问令牌在输入框中短暂使用，不写入浏览器 localStorage、sessionStorage、URL、仓库、日志；不自动同步，不加载第三方 SDK，也没有自己托管的后端。刷新网页后需要重新输入 token。
- 每次同步前读取 GitHub API `GET /repos/{owner}/{repo}`，**必须核验 `private === true`**，否则停止执行（fail closed）。使用 GitHub Contents API 的 sha 乐观并发控制，遇到并发冲突返回提示，不覆盖远程新版本。
- 「↑ 合并并同步到私库」先读取远程快照、按每条 ID / `updated` / `deleted` 合并，成功写入后再刷新本机。相同 ID 编辑冲突使用时间戳较新的版本；用户应避免不同设备同时操作同一条批注。
- 「↓ 从私库合并到本机」不执行 GitHub PUT，不删除本机独有的正常记录；云端删除记录仍会正确过滤旧版本。
- 继续保留手动「↓ 导出 JSON 备份」「↑ 导入 JSON 备份」。兼容 v1 备份文件；导入模式只追加缺失的笔记，不批量删除本地内容。
- GitHub 私有仓库虽限制公开访问，但**文件仍是明文**，GitHub 本身及获得仓库访问权的应用/账户可读取；也会保留 Git 提交历史。它不是端到端加密存储，勿存放不愿交给 GitHub 的敏感内容。
- 安全注意：任何脚本注入（XSS）、恶意浏览器扩展或被入侵的设备可能在令牌填写期间窃取令牌。请仅使用自己信任的设备、最小权限短期 token，不要用 classic PAT 的全仓库权限。

## 未来改动须保持

1. 不得把 token 放入公开代码、Jekyll 配置、日志或静态资源，不得增加隐式上传。
2. 不能自动要求所有访问者登录 GitHub，也不能阻断不使用同步功能的本地划线。
3. 保持 localStorage 键及旧 v1 备份兼容；修改删除、编辑、同步逻辑时须覆盖跨设备删除、并发 sha 冲突、私库校验、Unicode 中文、空仓库和网络失败场景。
4. 轻量优先：不新增大型包、JS 框架、图像、PDF、服务器；自动编译/新增译作仍应加载同一公共阅读笔记脚本。
