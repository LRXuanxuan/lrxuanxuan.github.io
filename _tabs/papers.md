---
layout: page
title: 论文库
icon: fas fa-book-open
order: 1
permalink: /papers/
toc: false
---

<link rel="stylesheet" href="{{ '/assets/papers/library.css' | relative_url }}">
<section aria-label="本批新增论文译稿" style="margin:0 0 1rem 0">
  <details>
    <summary><strong>2026-10-12 · 上传论文的中文全文译稿</strong>（当前已完成 1 / 5）</summary>
    <p><a href="/papers/translations/2026-10-12-multice-flow/">MultiCE-Flow：基于流匹配的多模态信道估计</a> — 全文完成（6 页）。</p>
    <p>RadioMapMotion、贝叶斯主动学习扩散 CGM、CAR-Flow、Anchor-CKM：尚待完整翻译与校核，暂不标注为全文完成。</p>
  </details>
</section>

<div class="pl-latest-translations" style="margin:1rem 0 1.3rem;padding:.85rem 1rem;border:1px solid var(--main-border-color);border-radius:.6rem">
  <strong>新译论文（2026-10-12）</strong>
  <p style="margin:.45rem 0 0"><a href="/papers/translations/2602-07321/">《无线上下文工程：面向高效移动智能体 AI 与边缘通用智能》</a> · 中文全文 · 7 页原文</p>
</div>
<p class="pl-meta"><a href="/papers/translation-status-2026-08/">2026 年 8 月 · 十篇论文全文翻译进度与授权说明</a></p>
<div id="paper-library" data-source="{{ '/assets/papers/library.json' | relative_url }}">
  <div class="pl-intro"><span class="pl-eyebrow">DAILY RESEARCH READING</span><h2>每天一点，积累一条研究线索。</h2><p>无线通信、信号处理与生成模型。点击论文标题查看本篇推荐、证据、原文与代码，直接进入对应日报条目及译文。</p></div>
  <div id="pl-stats" class="pl-stats" aria-live="polite">正在加载论文记录…</div>
  <nav class="pl-nav" aria-label="论文库视图"><button type="button" data-view="papers" class="active">论文</button><button type="button" data-view="reports">每日报告</button><button type="button" data-view="translations">中英文译文</button><a href="{{ '/papers/catalog/' | relative_url }}">全部目录</a></nav>
  <form id="pl-filters" class="pl-filters" role="search"><label>标题搜索<input id="pl-query" type="search" placeholder="仅搜索论文标题" autocomplete="off"></label><label>推荐日期<select id="pl-date"><option value="">全部日期</option></select></label><label>发表状态<select id="pl-status"><option value="">全部状态</option></select></label><label class="pl-check"><input id="pl-code" type="checkbox">有 GitHub 链接</label><button type="reset">重置</button></form>
  <p id="pl-count" aria-live="polite"></p><div id="pl-results"></div>
  <button id="pl-more" type="button" hidden>显示更多</button>
  <noscript>请启用 JavaScript 搜索与筛选，或查看<a href="{{ '/papers/catalog/' | relative_url }}">全部推荐目录</a>。</noscript>
</div>
<script src="{{ '/assets/papers/library.js' | relative_url }}" defer></script>
