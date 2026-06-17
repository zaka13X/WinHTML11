// Define your proxy server domain endpoint here
// Make sure to include the trailing slash
const PROXY_BASE = "https://proxy.2677929.xyz/";

self.addEventListener('install', (event) => {
    // Force the service worker to activate immediately without waiting
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Take control of all open browser tabs/iframes instantly
    event.waitUntil(self.clients.claim());
});

// Intercepts network calls inside the iframe and forces them through the proxy format
self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // Check if the request is originating from our simulated browser window environment
    if (requestUrl.includes('/browser/')) {
        
        // Extract everything following the '/browser/' identifier
        const parts = requestUrl.split('/browser/');
        let targetUrl = parts[1];

        // Clean up any double-slashes or protocol artifacts left by relative paths
        targetUrl = targetUrl.replace(/^(https?:\/)(?!\/)/, '$1/');

        // If a sub-asset (CSS/JS) drops the protocol entirely, force-prepend https://
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        // Build the requested structure: (proxy domain)/https://(target url)
        const finalProxyUrl = `${PROXY_BASE}${targetUrl}`;

        // Clone the request headers to preserve cookies and user-agent context
        const modifiedHeaders = new Headers(event.request.headers);

        // Execute the rewritten request across the proxy channel
        event.respondWith(
            fetch(finalProxyUrl, {
                method: event.request.method,
                headers: modifiedHeaders,
                credentials: event.request.credentials,
                mode: 'cors'
            }).catch(err => {
                return new Response(`failed.: ${err.message}`, { 
                    status: 502,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
        );
    }
});
