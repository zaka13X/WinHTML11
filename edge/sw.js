const PROXY_BASE = "https://proxy.2677929.xyz/";

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // Checks for /browser/ anywhere inside the subfolder's request path
    if (requestUrl.includes('/browser/')) {
        
        // Split precisely at the simulation directory layout marker
        const parts = requestUrl.split('/browser/');
        let targetUrl = parts[1];

        // Correct malformed layout paths or double slashes
        targetUrl = targetUrl.replace(/^(https?:\/)(?!\/)/, '$1/');

        // Fallback protocol generation for clean routing
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        // Construct target layout matching your proxy
        const finalProxyUrl = `${PROXY_BASE}${targetUrl}`;

        const modifiedHeaders = new Headers(event.request.headers);

        event.respondWith(
            fetch(finalProxyUrl, {
                method: event.request.method,
                headers: modifiedHeaders,
                credentials: event.request.credentials,
                mode: 'cors'
            }).catch(err => {
                return new Response(`Proxy Routing Failure: ${err.message}`, { 
                    status: 502,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
        );
    }
});
