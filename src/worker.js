// Cloudflare Worker for Crypto Visualizer
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        let path = url.pathname;

        // Default to index.html
        if (path === '/' || path === '') {
            path = '/index.html';
        }

        // Get the asset from KV or serve from static files
        try {
            // For Workers Sites, assets are served from __STATIC_CONTENT
            const asset = await env.__STATIC_CONTENT.get(path.slice(1));

            if (asset) {
                const contentType = getContentType(path);
                return new Response(asset, {
                    headers: {
                        'Content-Type': contentType,
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            }

            // 404 for not found
            return new Response('Not Found', { status: 404 });
        } catch (e) {
            // Fallback: serve index.html for SPA routing
            if (path !== '/index.html') {
                const index = await env.__STATIC_CONTENT.get('index.html');
                if (index) {
                    return new Response(index, {
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                        },
                    });
                }
            }

            return new Response('Internal Error: ' + e.message, { status: 500 });
        }
    },
};

function getContentType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const types = {
        'html': 'text/html; charset=utf-8',
        'css': 'text/css; charset=utf-8',
        'js': 'application/javascript; charset=utf-8',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
    };
    return types[ext] || 'text/plain';
}
