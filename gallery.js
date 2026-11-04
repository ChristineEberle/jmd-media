'use strict';
const $ = id => document.getElementById(id);
const gallery = window.JMD_DATA.galleries[0];
const photos = gallery.photos;
const root = document.documentElement;
const viewer = $('viewer');
const image = $('viewer-image');
let current = 0;
let origin = null;
let savedOverflow = '';
let gesture = null;
const count = i => `${String(i + 1).padStart(2, '0')} / ${photos.length}`;

function makePhoto(photo, featured = false) {
  const figure = document.createElement('figure');
  figure.className = featured ? 'hero' : 'plate';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'photo-button';
  button.setAttribute('aria-label', `View ${photo.title} larger`);
  const img = document.createElement('img');
  img.src = `${photo.id}${featured ? '' : '-s'}.webp`;
  img.alt = photo.alt;
  img.width = photo.width;
  img.height = photo.height;
  if (featured) img.fetchPriority = 'high';
  else { img.loading = 'lazy'; img.decoding = 'async'; }
  button.append(img);
  button.addEventListener('click', () => openPhoto(photos.indexOf(photo)));
  const caption = document.createElement('figcaption');
  caption.className = 'caption';
  const number = document.createElement('span');
  number.className = 'number'; number.textContent = String(photos.indexOf(photo) + 1).padStart(2, '0');
  const title = document.createElement('span');
  title.className = 'title'; title.textContent = photo.title;
  caption.append(number, title); figure.append(button, caption);
  return figure;
}
const featured = photos.find(photo => photo.id === gallery.featuredId) || photos[0];
$('hero').replaceWith(Object.assign(makePhoto(featured, true), {id: 'hero'}));
$('gallery-title').textContent = gallery.title;
$('collection-count').textContent = `${photos.length} photographs`;
photos.forEach(photo => $('plates').append(makePhoto(photo)));

// Justified rows preserve the entire photograph, without crops or empty masonry columns.
function layoutWall() {
  const wall = $('plates');
  const width = wall.clientWidth;
  const gap = parseFloat(getComputedStyle(wall).columnGap);
  const target = width < 540 ? 210 : width < 1000 ? 220 : 290;
  const maxPerRow = width < 540 ? 2 : width < 1000 ? 3 : 5;
  let row = [], ratio = 0;
  const finish = () => {
    const height = (width - gap * (row.length - 1)) / ratio;
    row.forEach(({photo, el}) => { el.style.width = `${height * photo.width / photo.height}px`; });
    row = []; ratio = 0;
  };
  photos.forEach((photo, i) => {
    const r = photo.width / photo.height;
    if (row.length && (ratio + r) * target > width && Math.abs(width / ratio - target) < Math.abs(width / (ratio + r) - target)) finish();
    row.push({photo, el: wall.children[i]}); ratio += r;
    if (row.length >= maxPerRow || ratio * target >= width) finish();
  });
  if (row.length) finish();
}
new ResizeObserver(layoutWall).observe($('plates'));
layoutWall();

function showPhoto(index) {
  current = (index + photos.length) % photos.length;
  const photo = photos[current];
  // Set src directly: stale preload callbacks can never replace a newer selection.
  $('image-error').hidden = true;
  image.alt = photo.alt;
  image.src = `${photo.id}.webp`;
  $('viewer-title').textContent = photo.title;
  $('viewer-count').textContent = count(current);
  $('viewer-description').textContent = photo.description || '';
  $('viewer-note').textContent = photo.note || '';
  $('viewer-note').hidden = !photo.note;
  viewer.scrollTop = 0;
  for (const offset of [-1, 1]) new Image().src = `${photos[(current + offset + photos.length) % photos.length].id}.webp`;
}
image.addEventListener('error', () => { $('image-error').hidden = false; });
image.addEventListener('load', () => { $('image-error').hidden = true; });
function openPhoto(index) {
  origin = document.activeElement;
  savedOverflow = document.body.style.overflow;
  showPhoto(index);
  viewer.showModal();
  document.body.style.overflow = 'hidden';
  $('viewer-close').focus();
}
function closePhoto() { viewer.close(); }
viewer.addEventListener('close', () => { document.body.style.overflow = savedOverflow; gesture = null; origin?.focus({preventScroll: true}); });
$('viewer-close').addEventListener('click', closePhoto);
$('viewer-prev').addEventListener('click', () => showPhoto(current - 1));
$('viewer-next').addEventListener('click', () => showPhoto(current + 1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1)); }
  // Explicitly contain keyboard focus, including browsers with incomplete dialog tab cycling.
  if (event.key === 'Tab') {
    const controls = [...viewer.querySelectorAll('button')].filter(el => !el.hidden);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
const stage = $('viewer-stage');
stage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) { gesture = null; return; }
  gesture = {id: event.pointerId, x: event.clientX, y: event.clientY};
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointerup', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
  gesture = null;
  if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.3) showPhoto(current + (dx < 0 ? 1 : -1));
});
stage.addEventListener('pointercancel', () => { gesture = null; });
stage.addEventListener('lostpointercapture', () => { gesture = null; });
