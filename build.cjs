// Static build: social scrapers read HTML, so resolve absolute image URLs at build time.
const fs = require('node:fs');
const path = require('node:path');
const origin = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://jmd-media.vercel.app');
const url = new URL(origin);
if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('SITE_URL must use HTTPS');
fs.mkdirSync('dist', { recursive: true });
for (const file of fs.readdirSync('.')) {
 if (/\.(webp|png|jpg|css)$/.test(file) || ['gallery.js','gallery-data.js','site.js','contact.js'].includes(file)) fs.copyFileSync(file,path.join('dist',file));
}
for (const file of ['index.html', 'about.html', 'inquiries.html']) {
 const html = fs.readFileSync(file, 'utf8').replaceAll('__SOCIAL_IMAGE_URL__', new URL('/06.webp?v=gallery-wall-1', url).href);
 fs.writeFileSync(path.join('dist', file), html);
}
