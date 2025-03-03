import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        include: ['sockjs-client', '@stomp/stompjs'], // 여기에 sockjs-client 추가
        noDiscovery: true
    },
    plugins: [
        vue(),
        Components({
            resolvers: [PrimeVueResolver()]
        }),
        vueDevTools()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            'sockjs-client': 'sockjs-client/dist/sockjs.min.js' // sockjs-client 별칭 추가
        }
    },
    server: {
        proxy: {
            '^/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                rewrite: (path) => path.replace('/^/api/', ''),
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        console.log('Proxy Request:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        console.log('Proxy Response:', proxyRes.statusCode);
                    });
                }
            },
            // WebSocket 프록시 추가
            '/ws': {
                target: 'ws://localhost:5000', // 백엔드 서버 주소
                ws: true, // WebSocket 프록시 활성화
                changeOrigin: true
            }
        }
    }
});
