// ============================================================================
// RF_WORKSPACE_PRO - BACKGROUND SERVICE WORKER (sw.js)
// Rich Fish Aquarium - Web Push Notification Engine
// ============================================================================

const CACHE_NAME = 'rf-workspace-v1';
const ICON_URL = 'https://i.postimg.cc/TYD5NncZ/icon.png';

// Lắng nghe sự kiện Push từ Server khi ứng dụng ĐÃ TẮT
self.addEventListener('push', function(event) {
    let data = {
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

    const options = {
        body: data.body,
        icon: ICON_URL,
        badge: ICON_URL,
        tag: data.tag || 'rf-notification-' + Date.now(),
        renotify: true,
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'open', title: '🔍 Mở Đơn Ngay' },
            { action: 'close', title: '✕ Đóng' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Xử lý sự kiện khi nhân sự nhấp vào banner thông báo
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes('script.google.com') || (self.location && client.url.includes(self.location.origin))) {
                    if ('navigate' in client) {
                        client.navigate(targetUrl);
                    }
                    if ('focus' in client) {
                        return client.focus();
                    }
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
