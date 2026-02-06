import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Handle the Share Target POST request
self.addEventListener('fetch', (event) => {
    if (event.request.method === 'POST' && event.request.url.includes('share-target')) {
        event.respondWith((async () => {
            const formData = await event.request.formData();
            const file = formData.get('receipt');

            // Save the file to a temporary cache so the React app can pick it up
            const cache = await caches.open('shared-files');
            await cache.put('shared-image', new Response(file));

            // Redirect to the main app page
            return Response.redirect('/ledger/', 303);
        })());
    }
});

// Cache fonts and icons
registerRoute(
    ({ request }) => request.destination === 'font' || request.destination === 'image',
    new CacheFirst({
        cacheName: 'assets-cache',
    })
);
