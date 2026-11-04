'use strict';
// Shared utilities across real, same-tab HTML pages. Native browser history stays intact.
(() => {
  const root = document.documentElement;
  const theme = document.getElementById('theme');
  const preference = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : preference.matches;
  const label = () => { theme.setAttribute('aria-label', `Switch to ${isDark() ? 'light' : 'dark'} theme`); theme.title = theme.getAttribute('aria-label'); };
  theme.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark'; root.dataset.theme = next;
    try { localStorage.setItem('jmd-theme', next); } catch(e) {}
    label();
  });
  preference.addEventListener('change', label); label();

  const key = 'jmd-gallery-return';
  const about = document.getElementById('about-link');
  const inquiries = document.getElementById('inquiries-link');
  for (const link of [about, inquiries].filter(Boolean)) link.addEventListener('click', () => {
    try { sessionStorage.setItem(key, JSON.stringify({url: location.href, y: scrollY, focus: link.id})); } catch(e) {}
  });
  const returnLink = document.getElementById('return-gallery');
  if (returnLink) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (saved?.url) {
        const target = new URL(saved.url);
        if (target.origin === location.origin && /\/(?:index\.html)?$/.test(target.pathname)) {
          target.searchParams.set('return', 'gallery'); returnLink.href = target.href;
        }
      }
    } catch(e) {}
  }
  if ((about || inquiries) && new URL(location.href).searchParams.get('return') === 'gallery') {
    const target = new URL(location.href); target.searchParams.delete('return');
    history.replaceState(history.state, '', target.pathname + target.search + target.hash);
    // Wait for the justified wall to be laid out before restoring its saved position.
    addEventListener('pageshow', () => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(key));
        if (Number.isFinite(saved?.y) && saved.y >= 0) requestAnimationFrame(() => requestAnimationFrame(() => {
          const previous = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = 'auto';
          scrollTo({top: saved.y, behavior: 'instant'});
          const control = saved.focus === 'inquiries-link' ? inquiries : about;
          control?.focus({preventScroll: true});
          document.documentElement.style.scrollBehavior = previous;
        }));
      } catch(e) {}
    }, {once: true});
  }
})();
