// Vercel Node function. Secrets and recipient stay in server-side environment variables.
const windows = new Map();
const ready = () => Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO && process.env.CONTACT_FROM);
const reply = (res, status, body) => res.status(status).json(body);
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return reply(res, 200, {available: ready()});
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return reply(res, 405, {error:'Method not allowed.'}); }
  if (!ready()) return reply(res, 503, {error:'The contact form is not available yet. Please try Instagram.'});
  let origin;
  try { origin = new URL(req.headers.origin); } catch(e) { return reply(res, 403, {error:'Please send your message from this website.'}); }
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin.host !== host || !['https:','http:'].includes(origin.protocol)) return reply(res, 403, {error:'Please send your message from this website.'});
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return reply(res, 415, {error:'Unsupported message format.'});
  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); } catch(e) { return reply(res, 400, {error:'Please check your message and try again.'}); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(res, 400, {error:'Please check your message and try again.'});
  if (body.website) return reply(res, 200, {ok:true}); // Honeypot: never sends mail.
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!name || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email) || !message || message.length > 5000) return reply(res, 400, {error:'Please enter your name, a valid email, and a message of up to 5,000 characters.'});
  // Basic warm-instance abuse guard. Use provider/WAF limits before a public launch.
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0];
  const now = Date.now();
  for (const [key, record] of windows) if (record.until < now) windows.delete(key);
  const record = windows.get(ip) || {count:0,until:now+600000};
  if (record.count >= 3) { res.setHeader('Retry-After','600'); return reply(res,429,{error:'Please wait a few minutes before sending another message.'}); }
  record.count += 1; windows.set(ip, record);
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({from:process.env.CONTACT_FROM,to:[process.env.CONTACT_TO],reply_to:email,subject:'JMD.media website inquiry',text:`From: ${name}\nReply email: ${email}\n\n${message}`}),
      signal:AbortSignal.timeout(10000)
    });
    if (!result.ok) return reply(res,502,{error:'Your message could not be sent. Please try again later or use Instagram.'});
    return reply(res,200,{ok:true});
  } catch(e) { return reply(res,502,{error:'Sending could not be confirmed. Please wait before trying again, or use Instagram.'}); }
};
