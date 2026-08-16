/* ============================================================
   GREGAIREL.COM — Offline field guides

   Registered only by the guide pages (w-trek, ebc, japan).
   Precaches the guides and their images so they read on the
   trail with no signal. Everything else passes straight to
   the network — this worker never touches the rest of the site.

   Bump the cache name when guide content changes materially;
   the activate step clears old versions.
   ============================================================ */

var CACHE = 'field-guides-v1';

var ASSETS = [
  '/w-trek.html',
  '/ebc.html',
  '/japan.html',
  '/css/style.css',
  '/css/hunt.css',
  '/js/main.js',
  '/js/playlist.js',
  '/js/hunt.js',
  '/js/daruma-find.js',
  '/favicon.svg',
  '/img/patagonia-towers.jpg',
  '/img/day2-towers.jpg',
  '/img/day3-cuernos.jpg',
  '/img/day4-french-valley.jpg',
  '/img/day5-grey-glacier.jpg',
  '/img/day6-catamaran.jpg',
  '/img/khumbu-icefall.jpg',
  '/img/ebc-trek.jpg',
  '/img/japan-chureito.jpg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (ASSETS.indexOf(url.pathname) === -1) return;
  // Cached guides load instantly and offline; the network refreshes
  // the copy in the background for next time.
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      var refresh = fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var clone = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || refresh;
    })
  );
});
