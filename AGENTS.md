# 博客维护记忆（AGENTS.md）

本文件记录维护 `lrxuanxuan.github.io` 时应遵循的长期约定，供后续更新网站内容和代码时参考。

## 推荐工作簿网页表格（2026-10-13用户授权）

- `/papers/table/` 是推荐工作簿第一张主表的网页表格入口，首页原导航新增“推荐表格”，保留原导语、统计、筛选、四项个人标记和全部原有入口。
- `papers/table.html`、`assets/papers/workbook.js`、`assets/papers/workbook.css` 是轻量原生 HTML/JS/CSS。读取同一 `assets/papers/library.json` 的字段、超链接和主表列顺序，不上传 XLSX，不硬编码论文、条数或日期，不维护第二份推荐数据。
- 保留工作簿原始行顺序及全部历史记录；支持标题搜索、日期与阅读状态筛选、分页、横向滚动和单元格全文展开。固定紧凑行高 2cm，不能因此截断源字段；弹窗保留完整文字与真实链接。工作簿勾选与浏览器个人标记仍各自保留真实来源。
- 每次推荐表追加或修改并通过源文件验收后，运行 `site_sync/export_library.py` 重新同步当前字段，增量发布并核对线上 `workbook_table.row_count`、17列、来源哈希及新增论文。新增行直接追加，不能重建、删掉或重排历史工作簿。用户手工保存的表格变化在下一次同步时刷新。
- 导出器的 `export.lock` 和发布器的 `publish.lock` 互相检查，单一写入者；不能擅自删除其他运行者的锁。新增 UI 文件必须保留在导出 manifest 中，后续翻译/日推导出不得移除表格入口。

## 内容与页面排版

- **少用 LaTeX 展示公式。** 网站中并非所有 Markdown 页面都配置数学公式渲染；未经实际验证，不要直接写入 `\[`、`\]`、`\boxed{}` 等 LaTeX 展示语法，以免显示为原始源码。
- **能用普通文本箭头 `→` 就不用数学环境。** 表示概念演变、因果或简单流程时，优先用 Unicode 箭头、符号与普通文字。
- **能用 `> 引用块` 就不用 `\boxed{}`。** 需要突出简短观点、结论或对照关系时，优先使用 Markdown 引用块。
- **能用加粗就不要上复杂排版。** 优先使用 `**加粗**`、正常段落、少量列表与标题，避免无必要的插件、脚本和复杂组件。
- 确实需要严谨数学公式的科研文章是例外；必须先确认相应页面能够正确渲染，不能为了普通豆知识内容擅自引入 MathJax、KaTeX 等较重的加载依赖。

## 轻量化与检查

- 博客以**纯文字、轻量 HTML/CSS 与低资源消耗**为优先目标；不要轻易上传 PDF、大尺寸图片、字体或其他大文件。若有现成外部资料，优先使用链接。
- 豆知识条目维护在 `_data/tidbits.yml`。添加时使用唯一的 `slug` 与带 `+08:00` 时区的 `added_at`；存档以北京时间的添加时间倒序排序。
- 更新 YAML 数据前后保持字段、缩进、Markdown 原文和已有条目不变。提交前检查特殊符号、换行、代码块、链接和引用块是否在网站中按预期显示。
- 修改网站内容以**局部、最小变更**为原则，不要顺手改变无关页面的功能或视觉布局。


## 论文库布局与译文接入（2026-10-12用户明确要求）

- `/papers/` 的首页模板是 `_tabs/papers.md`。顶部必须保持 `DAILY RESEARCH READING` → 导语 → 统计 → 论文/每日报告/中英文译文/全部目录 → 筛选的原有顺序。日常新增译文不得在模板前插入批次标题、长列表、details、通知卡片或公告，也不得随意改 CSS/导航/筛选。
- 译文正文放 `papers/translations/<唯一slug>.md`，使用唯一 permalink `/papers/translations/<slug>/`，保留已有地址。队列已验收双语稿由 `site_sync/export_library.py` 自动生成；手动既有译文只登记到 `assets/papers/external-translations.json`（本地维护源为 `site_sync/external_translations.json`），由导出器合并到 `assets/papers/library.json` 的 `translations`，在原“中英文译文”视图和 catalog 展示。
- 登记字段为 date/title/url/slug/scope/source_page_path/download/paper_ids/source_arxiv_ids/qa_complete。paper_ids 必须由标题、DOI 或原文 arXiv 身份核验，禁止按日期匹配。未绑定的译文保留统一目录，不猜关联。不得把部分译稿/技术整理/翻译中当作全文验收通过，统计来自真实 QA；不能在 library.js 硬编码单篇链接或手动增加计数。
- 推荐记录通过每篇 `translations` 列表直达本篇译稿；已完成的标准全文入口保持 `full_translation_url`。目录保留部分译稿范围说明。日报继续只关联本篇；已有URL与全文、其他网站栏目均须保留。
- 发布前读取最新 main，保留其他任务文件，以最小差异提交；同一时刻只允许一个导出/发布者。检查 Actions 成功、首页第一块和译文列表/链接后才能宣称部署完成。PDF始终只保留原文链接。

## 首页「随机漫游」约定

- 首页「随机漫游」取代了人工维护的「近期上传」。不要恢复重复的静态更新列表；右侧「最近更新」继续独立工作。
- `_plugins/random_wander.rb` 在 Jekyll 构建时自动从文学章节／个人译作、`_data/tidbits.yml` 和 `papers/translations/*.md` 生成 `/assets/data/random-walk.json`。新内容只需按现有栏目规范发布，不能手工维护一份冗余随机目录。
- `assets/js/random-walk.js` 使用原生 JS，本地随机、栏目筛选、避免连续重复；默认「全部」先等概率选栏目再选文章。保持纯文字、无需依赖或大媒体文件，并验证豆知识锚点可打开具体条目。


## 科研论文四项个人标记（2026-10-13）

- `/papers/` 论文卡片右上角与每篇 `/papers/items/<16位论文ID>/` 独立页面正文右上角，**必须**提供同一组四个精简、醒目、可点击的独立标记：`已略读`、`已精读`、`已参考`、`收藏`。用户原请求中的“已精度”按“已精读”处理。四项彼此独立，允许重复点击取消；`aria-pressed` 表示当前状态。
- 标记以论文库既有的 16 位稳定 `paper.id` 为主键（详情页从 `/papers/items/<id>/` 解析），保存在当前浏览器 `localStorage['rc-paper-marks-v1']` 的 `{ paperId: 0..15 }` 位掩码里。列表、独立页与多标签页的标记应相互一致；无需 GitHub API、登录或外部追踪。只记录使用者自己的状态，不能提交个人标记数据到公开仓库。更换设备／浏览器、清除站点数据不会自动同步。
- **实现入口：** `assets/js/paper-marks.js` 是唯一标记逻辑，`assets/css/paper-marks.css` 是共用轻量样式；`assets/papers/library.js` 在每个论文卡片顶部使用 `window.PaperMarks.createToolbar(p.id)`；`_tabs/papers.md` 加载共用资源，`_includes/metadata-hook.html` 根据论文详情 permalink 自动加载并注入按钮。新增、覆盖或重新导出 `papers/items/*.md` 和 `assets/papers/library.json` 时，不需要往每篇文档复制脚本，更**不得删除共用入口**。
- 本地四项标记与推荐表中历史的静态“是否略读 / 是否精读”字段独立；不得伪称自动写回原数据、跨设备云同步，也不应自行改变用户历史勾选或把「精读」强制推断成「略读」。
- 验收至少检查：论文库卡片右上角、任意独立论文页右上角的四项按钮；点击／再次点击切换、刷新后保留、两个入口状态一致、较窄屏幕自动换行、无 JS 时论文阅读不受阻；下次新增论文仍自动出现。保持原生 JS/CSS、无新增大文件、无后台或第三方依赖。
