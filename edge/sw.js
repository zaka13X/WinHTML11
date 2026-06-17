// Correct root domain variable matching your endpoint layout
const PROXY_BASE = "https://proxy.2677929.xyz";

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // Checks for simulated tracking path
    if (requestUrl.includes('/browser/')) {
        
        // Extract destination details following the separation marker
        const parts = requestUrl.split('/browser/');
        let targetUrl = parts;

        // Reconnect standard structural colons if altered
        targetUrl = targetUrl.replace(/^(https?:\/)(?!\/)/, '$1/');

        // Fallback layout generation to match strict protocol format
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        // FIXED: Uses backticks to combine variables properly without string errors
        const finalProxyUrl = `${PROXY_BASE}${targetUrl}`;

        const modifiedHeaders = new Headers(event.request.headers);

        event.respondWith(
            fetch(finalProxyUrl, {
                method: event.request.method,
                headers: modifiedHeaders,
                credentials: event.request.credentials,
                mode: 'cors'
            }).catch(err => {
                return new Response(`Proxy Failure on Asset: ${err.message}`, { 
                    status: 502,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
        );
    }
});
