// ============================================================================
// RF_WORKSPACE_PRO - SERVICE WORKER (sw.js)
// Zero-Latency App Shell Cache + Web Push Notifications
// ============================================================================

const CACHE_NAME = 'rf-shell-v2';
const ICON_URL = 'https://i.postimg.cc/TYD5NncZ/icon.png';

// Các tài nguyên cần cache ngay khi install → mở app = tải từ disk (0ms)
const SHELL_ASSETS = [
  '/',
  '/vercel_index.html',
  '/manifest.json'
];

// === INSTALL: Cache App Shell ngay lập tức ===
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_ASSETS);
    }).then(function() {
      return self.skipWaiting(); // Kích hoạt ngay, không đợi tab cũ đóng
    })
  );
});

// === ACTIVATE: Xóa cache phiên bản cũ ===
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim(); // Chiếm quyền kiểm soát tất cả tab ngay
    })
  );
});

// === FETCH: Chiến lược Stale-While-Revalidate cho Shell ===
// Shell page → trả từ cache NGAY (0ms), đồng thời fetch bản mới nhất để cập nhật cache ngầm
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Chỉ xử lý request tới domain của mình (Vercel), KHÔNG chặn GAS iframe
  if (url.origin !== self.location.origin) return;

  // Chỉ cache GET requests cho shell assets
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(cached) {
        // Fetch bản mới nhất từ network (chạy ngầm)
        var networkFetch = fetch(event.request).then(function(networkResponse) {
          // Cập nhật cache với bản mới nhất
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(function() {
          return cached; // Offline → dùng cache
        });

        // Trả cache ngay lập tức nếu có (ZERO LATENCY), nếu không thì đợi network
        return cached || networkFetch;
      });
    })
  );
});

// === PUSH NOTIFICATION ===
self.addEventListener('push', function(event) {
  var data = {
    title: '🔔 Rich Fish Aquarium',
    body: 'Bạn có thông báo mới từ xưởng sản xuất!',
    url: '/',
    tag: 'rf-general-notification'
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: ICON_URL,
      badge: ICON_URL,
      tag: data.tag || 'rf-notification-' + Date.now(),
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: '🔍 Mở Đơn Ngay' },
        { action: 'close', title: '✕ Đóng' }
      ]
    })
  );
});

// === NOTIFICATION CLICK ===
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'close') return;

  var targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.location.origin) || client.url.includes('script.google.com')) {
          if ('focus' in client) return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
