self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(data.title || 'New Notification', {
            body: data.body || 'You have a new message on Freelance Marketplace',
            icon: '/favicon.ico', // Update with your actual icon
            badge: '/favicon.ico',
            data: {
                url: data.url || '/'
            }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const url = event.notification.data.url;

            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
