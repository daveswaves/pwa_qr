// sw.js
self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (e) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (e) => {
  // Just let the request pass through
  console.log('Service Worker: Fetching', e.request.url);
});
