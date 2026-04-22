const { pathConfig } = require( './path' );
const path = require( 'path' );

module.exports = function createWebpackDevServerConfig ( webpackConfig, targetPath ) {

    let { devServer } = webpackConfig;
    // webpack-dev-server 4.x 配置
    const DEFAULT_DEV_SERVER_CONFIG = {
        host: '0.0.0.0',
        port: 9527,
        https: false,
        // v4: contentBase → static
        static: {
            directory: pathConfig.appDist,
            publicPath: '/',
        },
        // v4: stats → devMiddleware.stats
        devMiddleware: {
            stats: 'none',
        },
        // 热更新配置
        hot: true,
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

    webpackConfig.devServer = devServer ? Object.assign( DEFAULT_DEV_SERVER_CONFIG, devServer ) : DEFAULT_DEV_SERVER_CONFIG;
    return webpackConfig;
}
