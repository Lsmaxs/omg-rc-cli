const { pathConfig } = require( './path' );
const path = require( 'path' );

module.exports = function createWebpackDevServerConfig ( webpackConfig, targetPath ) {

    let { devServer } = webpackConfig;
    // 提取 v3 的 before/after 回调，转换为 v4 的 setupMiddlewares
    const beforeHook = devServer && devServer.before;
    const afterHook = devServer && devServer.after;

    // webpack-dev-server 4.x 配置
    const DEFAULT_DEV_SERVER_CONFIG = {
        host: '0.0.0.0',
        port: 9527,
        https: false,
        // v4: static 用于提供额外的静态文件，publicPath 避免与 devMiddleware 冲突
        static: {
            directory: pathConfig.appDist,
            publicPath: '/static',
        },
        // v4: stats → devMiddleware.stats
        devMiddleware: {
            stats: 'none',
        },
        // 热更新配置
        hot: true,
        // 禁用 liveReload，避免 HMR 失败时自动全页刷新
        liveReload: false,
        // WebSocket 传输方式
        webSocketServer: 'ws',
        // 客户端配置
        client: {
            logging: 'none',
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        // 允许通过外部访问
        allowedHosts: 'all',
    };

    if ( devServer ) {
        // 移除 v3 废弃的属性，避免 schema 校验报错
        delete devServer.before;
        delete devServer.after;
        delete devServer.disableHostCheck;
    }

    // 兼容 v3 的 before/after → v4 的 setupMiddlewares
    if ( beforeHook || afterHook ) {
        const originalSetupMiddlewares = devServer && devServer.setupMiddlewares;
        DEFAULT_DEV_SERVER_CONFIG.setupMiddlewares = function ( middlewares, devServerInstance ) {
            if ( beforeHook ) {
                beforeHook( devServerInstance.app, devServerInstance );
            }
            if ( originalSetupMiddlewares ) {
                middlewares = originalSetupMiddlewares( middlewares, devServerInstance ) || middlewares;
            }
            if ( afterHook ) {
                afterHook( devServerInstance.app, devServerInstance );
            }
            return middlewares;
        };
    }

    webpackConfig.devServer = devServer ? Object.assign( DEFAULT_DEV_SERVER_CONFIG, devServer ) : DEFAULT_DEV_SERVER_CONFIG;
    return webpackConfig;
}
