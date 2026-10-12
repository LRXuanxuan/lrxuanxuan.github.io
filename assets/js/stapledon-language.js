/* Offline-capable, dependency-free language switch for Stapledon stories. */
(() => {
  const root = document.getElementById('stapledon-reader');
  const controls = document.querySelector('.stapledon-language-switch');
  if (!root || !controls) return;
  const buttons = [...controls.querySelectorAll('button[data-stapledon-lang]')];
  const sections = [...root.querySelectorAll('[data-story-lang]')];
  if (sections.length !== 2 || buttons.length !== 2) return;
  const storageKey = 'stapledon-story-language';
  const select = (lang, save) => {
    const selected = lang === 'en' ? 'en' : 'zh';
    sections.forEach(section => { section.hidden = section.dataset.storyLang !== selected; });
    buttons.forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.stapledonLang === selected)); });
    if (save) { try { localStorage.setItem(storageKey, selected); } catch (_) {} }
  };
  let preferred = 'zh';
  try { preferred = localStorage.getItem(storageKey) || 'zh'; } catch (_) {}
  const urlLanguage = new URLSearchParams(window.location.search).get('lang');
  if (urlLanguage === 'zh' || urlLanguage === 'en') preferred = urlLanguage;
  select(preferred, false);
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.stapledonLang, true)));
})();
