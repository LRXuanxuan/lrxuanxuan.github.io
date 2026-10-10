---
title: "照明之咪摇奖机"
icon: fas fa-moon
order: 5
permalink: /fortune/
---

<div class="fortune-page">
  <p class="fortune-intro">问卜可随意，解读须谨慎。81 张牌、四种朝向，以及单抽、三抽、四季与仪式牌阵。所有抽牌均在浏览器本地完成。</p>
  <p><a href="{{ '/fortune-full.html' | relative_url }}" target="_blank" rel="noopener noreferrer">在独立页面中打开完整版 ↗</a></p>
  <iframe id="fortune-embed" title="照明之咪摇奖机完整版" src="{{ '/fortune-full.html' | relative_url }}" loading="eager" scrolling="no"></iframe>
</div>

<style>
.fortune-page{width:100%;max-width:100%}
.fortune-page .fortune-intro{font-size:.92rem}
#fortune-embed{width:100%;min-height:780px;border:0;border-radius:12px;display:block;background:#f4f1e8}
</style>

<script>
(function() {
  const frame = document.getElementById('fortune-embed');
  if (!frame) return;
  function resize() {
    try {
      const d = frame.contentDocument;
      if (!d) return;
      const height = Math.max(d.body.scrollHeight, d.documentElement.scrollHeight);
      frame.style.height = Math.max(height + 36, 780) + 'px';
    } catch (e) {
      frame.style.height = '1100px';
      frame.setAttribute('scrolling', 'auto');
    }
  }
  frame.addEventListener('load', function () {
    resize();
    try {
      const obs = new ResizeObserver(resize);
      obs.observe(frame.contentDocument.body);
      obs.observe(frame.contentDocument.documentElement);
    } catch (e) {
      frame.setAttribute('scrolling', 'auto');
    }
  });
  window.addEventListener('resize', resize);
})();
</script>
