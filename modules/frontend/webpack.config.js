const isEnvProduction = process.env.NODE_ENV === 'production';
const sourceMapEnv = process.env.SOURCE_MAP;

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import PnpWebpackPlugin from 'pnp-webpack-plugin';

const require = createRequire(import.meta.url);
const configFile = fileURLToPath(import.meta.url);
const configDirectory = path.dirname(configFile);

const proxyTarget =
    process.env.PROXY === 'dev'
        ? 'https://dev.iotdomu.cz'
        : process.env.PROXY === 'prod'
            ? 'https://iotdomu.cz'
            : 'http://localhost:8085';

console.log('Proxy target: ', proxyTarget, process.env.NODE_ENV);
const config = {
    mode: isEnvProduction ? 'production' : 'development',
    entry: ['./src/index.tsx'],
    output: {
        path: path.resolve(configDirectory, 'build'),
        filename: isEnvProduction ? 'assets/js/[name].[contenthash:8].js' : 'static/js/[name].js',
        chunkFilename: isEnvProduction ? 'assets/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
        assetModuleFilename: 'assets/media/[name].[hash][ext]',
        publicPath: '/',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        extensionAlias: {
            '.js': ['.ts', '.tsx', '.js'],
        },
        plugins: [
            PnpWebpackPlugin,
        ],
        fallback: {
            stream: require.resolve('stream-browserify'),
            process: require.resolve('process'),
            'process/browser': require.resolve('process/browser'),
            "events": require.resolve("events/"),
            "buffer": require.resolve("buffer/"),
            "@plotly/point-cluster": require.resolve("@plotly/point-cluster"),
            "array-bounds": require.resolve("array-bounds"),
            assert: false,
        },
    },
    resolveLoader: {
        plugins: [
            PnpWebpackPlugin.moduleLoader(configFile),
        ],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: [
                    /node_modules/,
                ],
                resolve: {
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
                },
                loader: 'ts-loader',
                options: {
                    getCustomTransformers: () => ({
                        before: [!isEnvProduction && ReactRefreshTypeScript.default()].filter(Boolean),
                    }),
                    projectReferences: true,
                },
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
                // use: {
                //     loader: MiniCssExtractPlugin.loader,
                // },
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },
    devtool: sourceMapEnv ? sourceMapEnv : isEnvProduction ? undefined : 'inline-source-map',
    // devtool: 'source-map',
    plugins: [
        !isEnvProduction && new ReactRefreshWebpackPlugin(),
        !isEnvProduction &&
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                mode: 'write-references',
                build: true,
            },
        }),
        new CopyPlugin({
            patterns: [
                { from: path.join(configDirectory, 'public/assets'), to: 'assets' },
                {
                    from: 'public/*.js',
                    to() {
                        return '[name][ext]';
                    },
                },
                {
                    from: 'public/*.png',
                    to() {
                        return '[name][ext]';
                    },
                },
                'public/robots.txt',
                'public/iotdomu.webmanifest',
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.join(configDirectory, 'public/index.html'),
        }),
        new MiniCssExtractPlugin({
            filename: 'assets/css/[name].[contenthash:8].css',
            chunkFilename: 'assets/css/[name].[contenthash:8].chunk.css',
        }),
        new webpack.EnvironmentPlugin({ ...process.env }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        !isEnvProduction && new webpack.HotModuleReplacementPlugin(),
        isEnvProduction &&
        new WorkboxPlugin.InjectManifest({
            swSrc: './src/service-worker.ts',
            swDest: 'service-worker.js',
            maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
            exclude: [/\.map$/, /^manifest.*\.js$/, /\/dist\//],
        }),
    ].filter(Boolean),
    devServer: {
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:3000',
                router: () => proxyTarget,
                changeOrigin: true,
            },
            {
                context: ['/socket.io'],
                target: 'http://localhost:3000',
                router: () => proxyTarget,
                ws: true,
                changeOrigin: true,
            },
        ],
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:3000',
        //         router: () => proxyTarget,
        //         changeOrigin: true,
        //     },
        //     '/socket.io': {
        //         target: 'http://localhost:3000',
        //         router: () => proxyTarget,
        //         ws: true,
        //         changeOrigin: true,
        //     },
        // },
        historyApiFallback: {
            rewrites: [{ from: /^\/(?!api\/)/, to: '/index.html' }],
        },
    },
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all',
    //         cacheGroups: {
    //             reactVendor: {
    //                 test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
    //                 name: 'vendor-react',
    //                 chunks: 'all',
    //             },
    //         },
    //     },
    // },

    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                reactVendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|@reduxjs|ramda)[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                },

                // default: {
                //     minChunks: 2,
                //     priority: -20,
                //     reuseExistingChunk: true,
                // },
            },
        },
    },
    watchOptions: {
        // for some systems, watching many files can result in a lot of CPU or memory usage
        // https://webpack.js.org/configuration/watch/#watchoptionsignored
        // don't use this pattern, if you have a monorepo with linked packages
        ignored: /node_modules/,
    },
};

export default config;
