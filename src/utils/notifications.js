export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendLocalNotification = async (title, body) => {
    if (Notification.permission === "granted") {
        // Try to send via Service Worker for better reliability on mobile
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
            await registration.showNotification(title, {
                body: body,
                icon: '/ledger/pwa-192x192.png',
                badge: '/ledger/pwa-192x192.png',
                vibrate: [200, 100, 200],
                tag: 'ledger-update'
            });
        } else {
            // Fallback for desktop/older browsers
            new Notification(title, { body, icon: '/ledger/pwa-192x192.png' });
        }
    }
};
