const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const cp = require('node:child_process');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
const sandbox = {window:{}}; vm.runInNewContext(fs.readFileSync('gallery-data.js','utf8'),sandbox);
const g = sandbox.window.JMD_DATA.galleries[0];
assert.equal(g.photos.length,27); assert.equal(new Set(g.photos.map(p=>p.id)).size,27);
assert.equal(g.featuredId,'06'); assert.equal(g.photos[7].id,'06');
assert.equal(g.photos[5].id,'07'); assert.equal(g.photos[6].id,'08');
for(const photo of g.photos){
 assert(photo.title && photo.alt && photo.description);
 assert.equal(photo.note,null);
 for(const suffix of ['.webp','-s.webp']){
  const filename=photo.id+suffix;
  assert(fs.readFileSync(filename).equals(cp.execFileSync('git',['show',`03d53f1:${filename}`],{maxBuffer:4e6})),`${filename} unchanged`);
 }
}
for(const filename of ['logo-ink.png','logo-light.png']) assert(fs.readFileSync(filename).equals(cp.execFileSync('git',['show',`03d53f1:${filename}`],{maxBuffer:4e6})));
const html=fs.readFileSync('index.html','utf8');
const about=fs.readFileSync('about.html','utf8');
assert(!html.includes('class="about"')); assert(about.includes('id="return-gallery"')); assert(about.includes('josh-portrait.jpg')); assert(html.includes('href="about.html"'));
const nav=html.match(/<nav[\s\S]*?<\/nav>/)[0]; assert.equal((nav.match(/<a /g)||[]).length,2);
assert(nav.includes('About') && nav.includes('Inquiries'));
assert(!/Swipe|Real things|extraordinary found|Santa Cruz Mountains|The coast|People and things|Close encounters|Land and sky/i.test(html));
assert(about.includes('Josh Daynard photographs the character in living things, familiar places and beautiful machines. His work moves between intimate nature studies, expansive skies and unguarded human moments, following light and curiosity rather than a single category.'));
assert(html.indexOf('id="gallery-title"')<html.indexOf('id="hero"'));
cp.execFileSync(process.execPath,['build.cjs'],{env:{...process.env,VERCEL_URL:'verified-preview.example'}});
const built=fs.readFileSync('dist/index.html','utf8'); assert(built.includes('https://verified-preview.example/06.webp?v=gallery-wall-1')); assert(!built.includes('__SOCIAL_IMAGE_URL__'));
assert(fs.readFileSync('dist/josh-portrait.jpg').equals(fs.readFileSync('josh-portrait.jpg')));
console.log('PASS static: 27 photos, #8 order, 56 original image/logo assets unchanged, exact bio, navigation, copy, metadata build, supplied portrait');

assert(fs.existsSync('dist/about.html')); assert(fs.existsSync('dist/site.js'));

const inquiries=fs.readFileSync('inquiries.html','utf8');
assert(!html.includes('class="inquiries"')); assert(html.includes('href="inquiries.html"'));
assert(inquiries.includes('id="return-gallery"')); assert(!inquiries.includes('Josh.daynard@icloud.com')); assert(!inquiries.includes('mailto:')); assert(inquiries.includes('id="contact-form"')); assert(inquiries.includes('Instagram'));
assert(!/print|price|checkout|store/i.test(inquiries)); assert(fs.existsSync('dist/inquiries.html'));
