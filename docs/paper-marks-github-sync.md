# 科研论文阅读标记：公开 JSON 共享与跨设备同步

适用范围：`/papers/` 的四项个人状态（已略读、已精读、已参考、收藏），以及每篇 `/papers/items/<16位ID>/` 的同组标记。

## 目的与数据边界

- 用户于 2026-10-15 明确同意将四项论文阅读状态公开，方便 ChatGPT 在后续科研讨论中直接读取；**这项授权仅针对论文四项标记**，不包括文学划线、批注、日签反馈等其他个人数据。
- 公开文件固定为 `assets/data/paper-marks-shared.json`；格式是 `{version:1,updatedAt,marks:{paperId:{mask,times}}}`。
- `mask` 继续使用 1=已略读、2=已精读、4=已参考、8=收藏，可组合；`times` 依次记录四项标记最后一次变化的毫秒时间戳，包含撤销勾选的时间，以避免旧值复活。
- 论文标题和元信息仍由 `assets/papers/library.json` 提供，使用稳定的 16 位 `paper.id` 对应；不在共享文件中重复存储正文、论文数据或任何秘密。
- 公开 JSON 是**上一次主动上传的快照**，不是浏览器数据的实时镜像。ChatGPT 必须区分两者；不能因为 JSON 为空而断言本机没有标记。

## 使用方法

1. 网站 `/papers/` → 展开「☁ 与 GPT 共享阅读标记（GitHub 同步）」。
2. 首次上传前，在 [GitHub fine-grained token 设置](https://github.com/settings/personal-access-tokens/new) 新建令牌：
   - Resource owner: `LRXuanxuan`
   - Repository access: **Only select repositories** → `lrxuanxuan.github.io`
   - Repository permissions: **Contents = Read and write**；Metadata 的只读权限通常自动包含
   - 不需要额外授予 Actions、Administration 或任何其他仓库权限；设置合理过期时间
3. 把令牌粘贴到临时输入框，再点「↑ 合并并共享到 GitHub」。浏览器先读取公开数据，按**每篇每项标记的修改时间**合并，再用 GitHub Contents API 的 SHA 写入公开文件。出现 409/422 冲突时必须重试读取并同步，不可无条件覆盖。
4. 换设备后，在论文库点「↓ 从 GitHub 合并到本机」，**读取操作不需要令牌**。新的勾选先存在本机；需要再次公开或从另一设备看到时再手动上传/拉取。
5. 用户询问论文阅读统计时，助手可直接读取 [公开标记 JSON](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/assets/data/paper-marks-shared.json)，和论文库的元数据按照 `paper.id` 关联。无需读取浏览器 localStorage。

## 保持不变的原则

- 原有本地 `localStorage['rc-paper-marks-v1']` 的 `{paperId:mask}` 格式仍是本机页面唯一读写格式。新增 `rc-paper-marks-sync-v1` 只储存每项时间戳和取消记录，不改动原来已勾选内容。
- `assets/js/paper-marks.js` 是渲染和点击的唯一入口；`assets/js/paper-marks-sync.js` 是公开同步与合并模块，必须在 `paper-marks.js` 后加载，包含在论文库和详情页。
- 网络失败、没有 token 或未启用共享时，论文库卡片、详情页按钮、筛选和浏览器本地存储应照常工作。
- 默认不自动上传，也不能把任何 PAT 写到源码、localStorage、sessionStorage、URL、Git 提交或日志。临时输入框在上传尝试结束后清空。
- 公共数据任何人都可读取，仓库提交历史也会保留旧快照。**不要扩展为自动公开文学摘录、私人笔记或其他无关记录。**
- 页面新增同步入口为默认折叠，无 JS 框架、第三方依赖、图片、PDF 或大文件。维护时保持 `paper.id` 稳定，保留四项标记独立筛选与两种页面入口。
- 简单合并采用客户端时间戳，若两台设备时钟严重不准或两端在同一毫秒更新同一项，则无法保证真实发生顺序。正常个人使用建议设备自动校时，避免在不同设备同时修改同一标记。
