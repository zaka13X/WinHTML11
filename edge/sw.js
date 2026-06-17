const PROXY_BASE = "https://proxy.2677929.xyz";

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Catches sub-requests requested relatively inside your iframe frame
self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // Only rewrite requests that are slipping off the proxy domain and trying to hitting your own host domain
    if (!requestUrl.startsWith(PROXY_BASE) && !requestUrl.includes('edge/sw.js') && !requestUrl.includes('edge/index.html')) {
        
        let targetUrl = requestUrl;

        // If a relative path looks for an asset on your host server (e.g. localhost/edge/style.css)
        if (targetUrl.includes(self.location.host)) {
            const parts = targetUrl.split(self.location.host);
            let cleanPath = parts || '';
            // Strip out structural subfolder artifacts
            cleanPath = cleanPath.replace(/^\/edge\//, '');
            
            // Remap back to a standard target web protocol address
            targetUrl = 'https://' + cleanPath;
        }

        // Enforce strict protocol formatting
        targetUrl = targetUrl.replace(/^(https?:\/)(?!\/)/, '$1/');

        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        // Append resource exactly as required: https://2677929.xyzhttps://domain.com/asset.js
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
