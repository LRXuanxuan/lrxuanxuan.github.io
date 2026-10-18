/* 五分钟表达训练：纯前端，每天北京时间换题。草稿只保存到当前浏览器。 */
(() => {
  'use strict';
  const root = document.querySelector('[data-rc-argument]');
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const el = {
    status: $('[data-argument-status]'),
    date: $('[data-argument-date]'),
    category: $('[data-argument-category]'),
    type: $('[data-argument-type]'),
    prompt: $('[data-argument-prompt]'),
    guide: $('[data-argument-guide]'),
    mode: $('[data-argument-mode]'),
    categoryFilter: $('[data-argument-category-filter]'),
    random: $('[data-argument-random]'),
    today: $('[data-argument-today]'),
    copy: $('[data-argument-copy]'),
    draft: $('[data-argument-draft]'),
    save: $('[data-argument-save]'),
    browse: $('[data-argument-browse]'),
    list: $('[data-argument-list]'),
    results: $('[data-argument-results]')
  };
  const STORAGE_KEY = 'rc-argument-drafts-v1';
  const guides = {
    '论述': '一句话表明判断 → 给出一个理由 → 举一个具体例子 → 说明适用范围或例外。可以赞同、反对，也可以提出条件。',
    '辩驳': '先准确复述对方主张 → 找出其中过强的假设 → 举出反例或理由 → 给出更稳妥的改写。目标是反驳论证，而非贬低说话的人。'
  };
  let questions = [];
  let current = null;
  let showingToday = true;
  let currentDay = '';
  let loader = null;

  function beijingDay() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const date = value.year + '-' + value.month + '-' + value.day;
    const number = Math.floor(Date.UTC(+value.year, +value.month - 1, +value.day) / 86400000);
    return { date, number };
  }

  function todayQuestion() {
    const day = beijingDay();
    // 100 道题，37 与 100 互素，因此每一轮 100 天内不会重复。
    const idx = ((day.number * 37 + 23) % questions.length + questions.length) % questions.length;
    return { question: questions[idx], day: day.date };
  }

  function readDrafts() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (_) { return {}; }
  }

  function show(question, daily) {
    if (!question) return;
    current = question;
    showingToday = daily;
    const day = beijingDay();
    currentDay = day.date;
    el.date.textContent = (daily ? '今日练习' : '自由练习') + ' · ' + day.date + '（北京时间） · 第 ' + question.id + '/100 题';
    el.category.textContent = question.category;
    el.type.textContent = question.type;
    el.prompt.textContent = question.prompt;
    el.guide.textContent = guides[question.type];
    el.draft.value = String(readDrafts()[question.id] || '');
    el.save.textContent = '草稿仅保存于此浏览器；切题时自动保留。';
    el.status.textContent = '';
    el.today.disabled = daily;
  }

  function filterQuestions() {
    return questions.filter(q =>
      (el.mode.value === 'all' || q.type === el.mode.value) &&
      (el.categoryFilter.value === 'all' || q.category === el.categoryFilter.value)
    );
  }

  function renderList() {
    if (el.list.hidden) return;
    const filtered = filterQuestions();
    el.results.replaceChildren();
    const ol = document.createElement('ol');
    ol.className = 'rc-argument-items';
    filtered.forEach(q => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.questionId = String(q.id);
      button.textContent = q.prompt;
      const meta = document.createElement('span');
      meta.textContent = q.category + ' · ' + q.type + ' · #' + q.id;
      li.append(meta, button);
      ol.append(li);
    });
    el.results.append(ol);
    el.status.textContent = '题库中共有 ' + filtered.length + ' 道符合筛选条件的题目。';
  }

  async function load() {
    if (!loader) {
      loader = fetch(root.dataset.bank, {cache:'default'}).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(data => {
        if (!Array.isArray(data.questions) || data.questions.length !== 100 ||
            new Set(data.questions.map(q => q.id)).size !== 100) throw new Error('题库数据不完整');
        questions = data.questions;
        const categories = [...new Set(questions.map(q => q.category))];
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = option.textContent = category;
          el.categoryFilter.append(option);
        });
        const entry = todayQuestion();
        show(entry.question, true);
        el.random.disabled = false;
        el.copy.disabled = false;
        el.browse.disabled = false;
        return true;
      }).catch(err => {
        loader = null;
        el.status.textContent = '题库暂时加载失败，收起再展开可重试。';
        throw err;
      });
    }
    return loader;
  }

  root.addEventListener('toggle', () => {
    if (root.open) load().catch(() => {});
  });

  el.random.addEventListener('click', () => {
    const pool = filterQuestions().filter(q => !current || q.id !== current.id);
    if (!pool.length) {
      el.status.textContent = '当前筛选下没有其他题目，请更换筛选条件。';
      return;
    }
    show(pool[Math.floor(Math.random() * pool.length)], false);
  });
  el.today.addEventListener('click', () => {
    const entry = todayQuestion();
    show(entry.question, true);
  });
  el.copy.addEventListener('click', async () => {
    if (!current) return;
    const content = current.type + '练习：' + current.prompt + '\n' + guides[current.type];
    try {
      await navigator.clipboard.writeText(content);
      el.status.textContent = '已复制题目与练习步骤。';
    } catch (_) {
      el.status.textContent = '当前浏览器无法自动复制，可手动选取题目文本。';
    }
  });
  el.draft.addEventListener('input', () => {
    if (!current) return;
    const saved = readDrafts();
    if (el.draft.value.trim()) saved[current.id] = el.draft.value;
    else delete saved[current.id];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      el.save.textContent = '已保存在本机 · 不上传服务器';
    } catch (_) {
      el.save.textContent = '浏览器存储不可用，请自行复制草稿保存。';
    }
  });
  el.browse.addEventListener('click', () => {
    el.list.hidden = !el.list.hidden;
    el.browse.textContent = el.list.hidden ? '浏览全部题目' : '收起题库';
    el.browse.setAttribute('aria-expanded', String(!el.list.hidden));
    renderList();
  });
  el.results.addEventListener('click', evt => {
    const button = evt.target.closest('button[data-question-id]');
    if (!button) return;
    const question = questions.find(q => q.id === Number(button.dataset.questionId));
    show(question, false);
    el.list.hidden = true;
    el.browse.textContent = '浏览全部题目';
    el.browse.setAttribute('aria-expanded', 'false');
    el.prompt.scrollIntoView({block:'center',behavior:'auto'});
  });
  el.mode.addEventListener('change', renderList);
  el.categoryFilter.addEventListener('change', renderList);

  function refreshIfNewDay() {
    if (!root.open || !questions.length) return;
    if (showingToday && beijingDay().date !== currentDay) {
      const entry = todayQuestion();
      show(entry.question, true);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshIfNewDay();
  });
  setInterval(refreshIfNewDay, 60000);
  if (location.hash === '#argument-practice') root.open = true;
  if (root.open) load().catch(() => {});
})();
