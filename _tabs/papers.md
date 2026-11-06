---

layout: page

title: 论文库

icon: fas fa-book-open

order: 1

permalink: /papers/

toc: false

---



<!-- Stable library shell: add translations via assets/papers/external-translations.json, never prepend batches here. -->

<link rel="stylesheet" href="{{ '/assets/papers/library.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/paper-marks.css' | relative_url }}">
<script src="{{ '/assets/js/paper-marks.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/paper-marks-sync.js' | relative_url }}" defer></script>

<div id="paper-library" data-source="{{ '/assets/papers/library.json' | relative_url }}">

  <div class="pl-intro"><span class="pl-eyebrow">DAILY RESEARCH READING</span><h2>每天一点，积累一条研究线索。</h2><p>无线通信、信号处理与生成模型。点击论文标题查看本篇推荐、证据、原文与代码，直接进入对应日报条目及译文。</p></div>

  <div id="pl-stats" class="pl-stats" aria-live="polite">正在加载论文记录…</div>

  <nav class="pl-nav" aria-label="论文库视图"><button type="button" data-view="papers" class="active">论文</button><button type="button" data-view="reports">每日报告</button><button type="button" data-view="translations">中英文译文</button><a href="{{ '/papers/table/' | relative_url }}">推荐表格</a><a href="{{ '/papers/catalog/' | relative_url }}">全部目录</a></nav>

  <form id="pl-filters" class="pl-filters" role="search"><label>标题搜索<input id="pl-query" type="search" placeholder="仅搜索论文标题" autocomplete="off"></label><label>推荐日期<select id="pl-date"><option value="">全部日期</option></select></label><label>发表状态<select id="pl-status"><option value="">全部状态</option></select></label><label>阅读标记<select id="pl-reading"><option value="">全部标记</option><option value="1">已略读</option><option value="2">已精读</option><option value="4">已参考</option><option value="8">收藏</option><option value="none">未标记</option></select></label><label class="pl-check"><input id="pl-code" type="checkbox">有 GitHub 链接</label><button type="reset">重置</button></form>

  <details id="pm-sync-panel" class="pm-sync">
    <summary>☁ 与 GPT 共享阅读标记（GitHub 同步）</summary>
    <p>四项勾选仍保存在本机。需要共享或跨设备使用时，可手动合并。共享记录会公开显示论文阅读与收藏状态，不包含账号令牌。</p>
    <div class="pm-sync-actions">
      <button id="pm-sync-pull" type="button">↓ 从 GitHub 合并到本机</button>
      <label>临时 GitHub 令牌<input id="pm-sync-token" type="password" autocomplete="off" spellcheck="false" placeholder="Fine-grained token（仅本仓库 Contents 读写）"></label>
      <button id="pm-sync-push" type="button">↑ 合并并共享到 GitHub</button>
    </div>
    <p id="pm-sync-status" class="pm-sync-status" role="status" aria-live="polite"></p>
    <p><a href="https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/assets/data/paper-marks-shared.json" target="_blank" rel="noopener noreferrer">查看已共享的标记</a> · <a href="https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/docs/paper-marks-github-sync.md" target="_blank" rel="noopener noreferrer">同步说明及授权方法</a></p>
  </details>

  <p id="pl-count" aria-live="polite"></p><div id="pl-results"></div>

  <button id="pl-more" type="button" hidden>显示更多</button>

  <noscript>请启用 JavaScript 搜索与筛选，或查看<a href="{{ '/papers/catalog/' | relative_url }}">全部推荐目录</a>。</noscript>

</div>

<script src="{{ '/assets/papers/library.js' | relative_url }}" defer></script>

