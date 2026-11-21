'use strict';
(() => {
  const trigger = document.getElementById('share-gallery');
  if (!trigger) return;
  const panel = document.getElementById('gallery-share-panel');
  const status = document.getElementById('gallery-share-status');
  const input = document.getElementById('gallery-share-link');
  const copy = document.getElementById('copy-gallery-link');
  const close = document.getElementById('close-gallery-share');
  const configured = document.querySelector('meta[property="og:url"]')?.content;
  let url;
  try {
    url = new URL(configured, location.href);
    if (!/^https?:$/.test(url.protocol) || configured?.includes('__')) throw new Error('No built gallery URL');
  } catch (_) {
    url = new URL('/', location.href);
  }
  // Share the gallery itself, never an embedded QA page, query, or scroll position.
  url.pathname = '/'; url.search = ''; url.hash = '';
  input.value = url.href;
  const data = {title: document.title, text: 'Photographs by Josh Daynard.', url: url.href};
  const show = message => {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    status.textContent = message;
  };
  const dismiss = () => {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({preventScroll: true});
  };
  const copyLink = async () => {
    show('Copying gallery link…');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url.href);
      show('Gallery link copied.');
    } catch (_) {
      show('Automatic copying isn’t available here. Select the link and copy it manually.');
      input.focus({preventScroll: true});
      input.select();
      input.setSelectionRange(0, input.value.length);
    }
  };
  trigger.addEventListener('click', async () => {
    if (trigger.disabled) return;
    trigger.disabled = true;
    try {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share(data);
          show('Share action completed.');
          return;
        } catch (error) {
          // Canceling the system sheet must not unexpectedly copy anything.
          if (error?.name === 'AbortError') return;
        }
      }
      await copyLink();
    } finally {
      trigger.disabled = false;
    }
  });
  copy.addEventListener('click', copyLink);
  close.addEventListener('click', dismiss);
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
  });
  input.addEventListener('click', () => input.select());
  trigger.hidden = false;
})();
