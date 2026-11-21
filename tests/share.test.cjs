const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../share.js'), 'utf8');
function boot(navigator, configured = 'https://gallery.example/', href = 'https://preview.example/qa?debug=yes#photo-06') {
  const ids = ['share-gallery', 'gallery-share-panel', 'gallery-share-status', 'gallery-share-link', 'copy-gallery-link', 'close-gallery-share'];
  const elements = Object.fromEntries(ids.map(id => [id, {
    hidden: true, disabled: false, value: '', textContent: '', attrs: {}, events: {},
    addEventListener(name, callback) { this.events[name] = callback; },
    setAttribute(name, value) { this.attrs[name] = value; },
    focus() { this.focused = true; }, select() { this.selected = true; },
    setSelectionRange(start, end) { this.selection = [start, end]; }
  }]));
  const document = {title: 'JMD.media · LOOK UP! · Light, Unscripted', getElementById: id => elements[id], querySelector: () => configured ? {content: configured} : null};
  vm.runInNewContext(source, {document, navigator, location: {href}, URL});
  return elements;
}
(async () => {
  let shared, copied = [];
  let e = boot({share: async data => { shared = data; }, clipboard: {writeText: async value => copied.push(value)}});
  await e['share-gallery'].events.click();
  assert.equal(shared.url, 'https://gallery.example/');
  assert.equal(copied.length, 0);
  assert.equal(e['gallery-share-status'].textContent, 'Share action completed.');
  assert.equal(e['share-gallery'].disabled, false);

  e = boot({share: async () => { throw Object.assign(new Error('Canceled'), {name: 'AbortError'}); }, clipboard: {writeText: async value => copied.push(value)}});
  await e['share-gallery'].events.click();
  assert.equal(copied.length, 0, 'canceling native share must not copy a link');
  assert.equal(e['gallery-share-panel'].hidden, true);
  assert.equal(e['share-gallery'].disabled, false);

  e = boot({share: async () => { throw new Error('Share unavailable'); }, clipboard: {writeText: async value => copied.push(value)}});
  await e['share-gallery'].events.click();
  assert.equal(copied.pop(), 'https://gallery.example/');
  assert.equal(e['gallery-share-status'].textContent, 'Gallery link copied.');

  e = boot({clipboard: {writeText: async value => copied.push(value)}}, '__GALLERY_URL__');
  await e['share-gallery'].events.click();
  assert.equal(copied.pop(), 'https://preview.example/', 'QA path, query and hash must not be shared');

  e = boot({clipboard: {writeText: async () => { throw new Error('Denied'); }}});
  await e['share-gallery'].events.click();
  assert(e['gallery-share-status'].textContent.includes('copy it manually'));
  assert(e['gallery-share-link'].focused && e['gallery-share-link'].selected);
  assert.equal(e['gallery-share-link'].value, 'https://gallery.example/');
  assert.deepEqual([...e['gallery-share-link'].selection], [0, 'https://gallery.example/'.length]);
  e['close-gallery-share'].events.click();
  assert.equal(e['gallery-share-panel'].hidden, true);
  assert.equal(e['share-gallery'].attrs['aria-expanded'], 'false');
  assert.equal(e['share-gallery'].focused, true);

  e = boot({}, 'javascript:alert(1)');
  await e['share-gallery'].events.click();
  assert.equal(e['gallery-share-link'].value, 'https://preview.example/');
  assert(e['gallery-share-link'].selected);
  let prevented = false;
  e['gallery-share-panel'].events.keydown({key: 'Escape', preventDefault() { prevented = true; }});
  assert(prevented && e['gallery-share-panel'].hidden);
  console.log('PASS share logic: native success/cancel/error, clipboard success/denial/unavailable, manual link, safe gallery URL, dismiss and focus restoration. Native OS sheet/device rendering still requires device QA.');
})().catch(error => { console.error(error); process.exitCode = 1; });
