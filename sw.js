const CACHE_NAME = 'money-radar-cache-v3.3.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png', // 新增
  './icon-512.png'  // 新增
];

// 安裝階段：將指定資源加入快取
self.addEventListener('install', (event) => {
  console.log('[SW 診斷 A] 進入 Service Worker Install 階段');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW 診斷 D] 靜態資源快取寫入完成');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 啟動階段：清除舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW 診斷 B] 清除舊快取版本: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求階段：Cache-First 策略
self.addEventListener('fetch', (event) => {
  console.log(`[SW 診斷 C] 攔截 Fetch 請求: ${event.request.url}`);
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`[SW 診斷 D] 快取命中，回傳 Cache: ${event.request.url}`);
        return cachedResponse;
      }
      
      console.log(`[SW 診斷 D] 快取未命中，轉發網路請求: ${event.request.url}`);
      return fetch(event.request);
    }).catch(() => {
      console.error('[SW 診斷 D] Fetch 失敗且無快取可回傳');
    })
  );
});