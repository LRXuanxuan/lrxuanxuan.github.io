/* Small, dependency-free reader discovery widget. */
(() => {
  "use strict";
  const host = document.querySelector(".rc-wander[data-wander-index]");
  if (!host) return;

  const labels = { literature: "科幻与翻译", tidbits: "豆知识", papers: "论文译稿" };
  const buttons = Array.from(host.querySelectorAll("[data-wander-filter]"));
  const title = host.querySelector("[data-wander-title]");
  const teaser = host.querySelector("[data-wander-teaser]");
  const kind = host.querySelector("[data-wander-kind]");
  const open = host.querySelector("[data-wander-open]");
  const next = host.querySelector("[data-wander-next]");
  const status = host.querySelector("[data-wander-status]");
  const groups = { literature: [], tidbits: [], papers: [] };
  let filter = "all";
  let previous = null;

  function choose() {
    const available = filter === "all"
      ? Object.keys(groups).filter((key) => groups[key].length > 0)
      : (groups[filter].length ? [filter] : []);
    if (!available.length) return;
    const selectedGroup = available[Math.floor(Math.random() * available.length)];
    const entries = groups[selectedGroup];
    let candidates = entries;
    if (previous && entries.length > 1) {
      candidates = entries.filter((entry) => entry.url !== previous.url);
    }
    const entry = candidates[Math.floor(Math.random() * candidates.length)];
    previous = entry;
    kind.textContent = labels[entry.category];
    title.textContent = entry.title;
    teaser.textContent = entry.description;
    open.href = entry.url;
    open.textContent = "打开这一页 ↗";
    status.textContent = "";
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const requested = button.dataset.wanderFilter;
      if (requested !== "all" && !groups[requested].length) return;
      filter = requested;
      buttons.forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      });
      choose();
    });
  });
  next.addEventListener("click", choose);

  fetch(host.dataset.wanderIndex, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("index unavailable");
      return response.json();
    })
    .then((items) => {
      if (!Array.isArray(items)) throw new Error("invalid index");
      const seen = new Set();
      items.forEach((item) => {
        if (!item || !Object.hasOwn(groups, item.category)) return;
        if (typeof item.title !== "string" || typeof item.url !== "string" ||
            typeof item.description !== "string" || !item.url.startsWith("/")) return;
        if (seen.has(item.url)) return;
        seen.add(item.url);
        groups[item.category].push(item);
      });
      if (!Object.values(groups).some((entries) => entries.length)) throw new Error("empty index");
      buttons.forEach((button) => {
        const category = button.dataset.wanderFilter;
        button.disabled = category !== "all" && groups[category].length === 0;
      });
      next.disabled = false;
      choose();
    })
    .catch(() => {
      kind.textContent = "漫游路线暂不可用";
      title.textContent = "也可以从书架开始";
      teaser.textContent = "暂时无法读取随机目录，请先前往科幻书架或使用上方栏目导航。";
      status.textContent = "";
      buttons.forEach((button) => { button.disabled = true; });
      next.disabled = true;
    });
})();
