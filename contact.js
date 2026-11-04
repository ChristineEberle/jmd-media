'use strict';
(() => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  const send = document.getElementById('contact-send');
  const unavailable = 'The contact form is not available yet. You can connect with Josh on Instagram below.';
  fetch('/api/contact', {headers:{Accept:'application/json'}}).then(async response => {
    const data = await response.json();
    if (!response.ok || !data.available) throw new Error();
    form.hidden = false; status.textContent = '';
  }).catch(() => { status.textContent = unavailable; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (send.disabled || !form.reportValidity()) return;
    send.disabled = true; send.textContent = 'Sending…'; status.textContent = '';
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/contact', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Your message could not be sent. Please try again later.');
      status.textContent = 'Your message has been sent. Thank you for getting in touch.';
      form.reset();
    } catch(error) { status.textContent = error.message === 'Failed to fetch' ? 'Sending could not be confirmed. Please wait before trying again, or use Instagram.' : error.message; }
    finally { send.disabled = false; send.textContent = 'Send message'; }
  });
})();
