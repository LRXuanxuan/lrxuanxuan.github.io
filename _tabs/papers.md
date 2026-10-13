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
<div id="paper-library" data-source="{{ '/assets/papers/library.json' | relative_url }}">
  <div class="pl-intro"><span class="pl-eyebrow">DAILY RESEARCH READING</span><h2>每天一点，积累一条研究线索。</h2><p>无线通信、信号处理与生成模型。点击论文标题查看本篇推荐、证据、原文与代码，直接进入对应日报条目及译文。</p></div>
  <div id="pl-stats" class="pl-stats" aria-live="polite">正在加载论文记录…</div>
  <nav class="pl-nav" aria-label="论文库视图"><button type="button" data-view="papers" class="active">论文</button><button type="button" data-view="reports">每日报告</button><button type="button" data-view="translations">中英文译文</button><a href="{{ '/papers/catalog/' | relative_url }}">全部目录</a></nav>
  <form id="pl-filters" class="pl-filters" role="search"><label>标题搜索<input id="pl-query" type="search" placeholder="仅搜索论文标题" autocomplete="off"></label><label>推荐日期<select id="pl-date"><option value="">全部日期</option></select></label><label>发表状态<select id="pl-status"><option value="">全部状态</option></select></label><label>阅读标记<select id="pl-reading"><option value="">全部标记</option><option value="1">已略读</option><option value="2">已精读</option><option value="4">已参考</option><option value="8">收藏</option><option value="none">未标记</option></select></label><label class="pl-check"><input id="pl-code" type="checkbox">有 GitHub 链接</label><button type="reset">重置</button></form>
  <p id="pl-count" aria-live="polite"></p><div id="pl-results"></div>
  <button id="pl-more" type="button" hidden>显示更多</button>
  <noscript>请启用 JavaScript 搜索与筛选，或查看<a href="{{ '/papers/catalog/' | relative_url }}">全部推荐目录</a>。</noscript>
</div>
<script src="{{ '/assets/papers/library.js' | relative_url }}" defer></script>
