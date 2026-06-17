const PROXY_BASE = "https://proxy.2677929.xyz";

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Intercept sub-assets (CSS, JS, images) requested relative to the iframe
self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // Skip rewriting if the request is already pointing to the proxy endpoint
    if (!requestUrl.startsWith(PROXY_BASE) && !requestUrl.includes('edge/sw.js') && !requestUrl.includes('edge/index.html')) {
        
        let targetUrl = requestUrl;

        // Strip local dev host strings if relative assets are misrouted locally
        if (targetUrl.includes(self.location.host)) {
            const parts = targetUrl.split(self.location.host);
            // Reconstruct asset pointer cleanly 
            targetUrl = 'https://' + parts[1].replace(/^\/edge\//, '');
        }

        // Construct target template: (proxy)/https://(destination)
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
