import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const resolveTypeScriptForJsImports = {
    name: 'resolve-typescript-for-js-imports',
    enforce: 'pre' as const,
    resolveId(source: string, importer?: string) {
        if (!importer || !source.startsWith('.') || !source.endsWith('.js')) return null;

        const cleanImporter = importer.split('?')[0];
        const target = path.resolve(path.dirname(cleanImporter), source);
        if (existsSync(target)) return null;

        for (const extension of ['.ts', '.tsx']) {
            const candidate = `${target.slice(0, -3)}${extension}`;
            if (existsSync(candidate)) return candidate;
        }

        return null;
    },
};

export default defineConfig(({ mode }) => {
    const proxyTarget =
        process.env.PROXY === 'dev'
            ? 'https://dev.iotdomu.cz'
            : process.env.PROXY === 'prod'
                ? 'https://iotdomu.cz'
                : 'http://localhost:8085';
    const ssl = process.env.SSL === 'true';
    const skipChecker = process.env.SKIP_CHECKER === 'true';

    return {
        plugins: [
            !skipChecker && checker({ typescript: true }),
            react(),
            svgr(),
            VitePWA({
                strategies: 'injectManifest',
                srcDir: 'src',
                filename: 'service-worker.ts',
                injectRegister: false,
                registerType: 'prompt',
                showMaximumFileSizeToCacheInBytesWarning: true,
                devOptions: { enabled: ssl, type: 'module' },
                injectManifest: {
                    globIgnores: ['assets/*.wasm', 'assets/PlotifyChart*.js'],
                },
            }),
            ssl && basicSsl(),
            resolveTypeScriptForJsImports,
        ],
        define: {
            global: 'globalThis',
            'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
        },
        resolve: {
            alias: [
                { find: /^assert$/, replacement: require.resolve('assert/') },
                { find: /^buffer\/?$/, replacement: require.resolve('buffer/') },
                { find: /^events\/?$/, replacement: require.resolve('events/') },
                { find: /^node:buffer$/, replacement: require.resolve('buffer/') },
                { find: /^node:events$/, replacement: require.resolve('events/') },
                { find: /^node:process$/, replacement: require.resolve('process/browser') },
                { find: /^node:stream$/, replacement: require.resolve('stream-browserify') },
                { find: /^process$/, replacement: require.resolve('process/browser') },
                { find: /^stream$/, replacement: require.resolve('stream-browserify') },
            ],
        },
        server: {
            port: 3000,
            proxy: {
                '/api': { target: proxyTarget, changeOrigin: true, ws: true },
                '/socket.io': { target: proxyTarget, changeOrigin: true, ws: true },
            },
        },
        build: {
            outDir: path.resolve(configDirectory, 'build'),
            sourcemap: process.env.SOURCE_MAP === 'true',
        },
    };
});
