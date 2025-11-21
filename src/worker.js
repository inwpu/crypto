// Cloudflare Worker for Crypto Visualizer
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
    async fetch(request, env, ctx) {
        try {
            // Use the official asset handler for Workers Sites
            return await getAssetFromKV(
                {
                    request,
                    waitUntil: ctx.waitUntil.bind(ctx),
                },
                {
                    ASSET_NAMESPACE: env.__STATIC_CONTENT,
                    ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
                }
            );
        } catch (e) {
            // If not found, try to serve index.html for SPA routing
            if (e.status === 404) {
                try {
                    const notFoundResponse = await getAssetFromKV(
                        {
                            request: new Request(new URL('/index.html', request.url).toString(), request),
                            waitUntil: ctx.waitUntil.bind(ctx),
                        },
                        {
                            ASSET_NAMESPACE: env.__STATIC_CONTENT,
                            ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
                        }
                    );
                    return new Response(notFoundResponse.body, {
                        ...notFoundResponse,
                        status: 200,
                    });
                } catch (e) {
                    return new Response('Not Found', { status: 404 });
                }
            }
            return new Response('Internal Error: ' + e.message, { status: 500 });
        }
    },
};
