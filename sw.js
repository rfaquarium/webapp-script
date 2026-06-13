self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // Để trống, cho phép ứng dụng luôn lấy dữ liệu mới nhất từ mạng
});
