// Офлайн-кэш: игра открывается даже без интернета.
// Картинки, иконки и модели берутся из кэша (меньше запросов к хостингу, повторный запуск быстрее),
// страница — сначала из сети, чтобы обновления доходили сразу. Версия кэша меняется с каждой сборкой.
const CACHE = 'sokol-6c37c57ebd';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
const keep = (req, res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin) return;                       // шрифты и прочее чужое — как обычно
  if (/\/(img|models|icons)\//.test(u.pathname)) {                // статика между сборками не меняется
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => keep(req, res))));
    return;
  }
  e.respondWith(fetch(req).then(res => keep(req, res)).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
