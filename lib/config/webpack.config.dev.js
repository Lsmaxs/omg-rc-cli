const getWebpackBaseConfig = require( './webpack.config.base' );
const { pathConfig } = require( '../utils/path' );

function getWebpackConfig ( buildPath, options ) {

    const config = getWebpackBaseConfig(buildPath, options);

    config.mode = 'development';
    // Webpack 5 中 devtool 名称格式调整
    config.devtool = 'eval-cheap-module-source-map';
    // 静默 webpack infrastructure 日志（dev-server、dev-middleware 等）
    config.infrastructureLogging = {
        level: 'none',
    };

    // React Fast Refresh 插件 —— 仅在 dev server 模式下启用
    if ( process.env.OMG_ENV === 'server' ) {
        const ReactRefreshWebpackPlugin = require( '@pmmmwh/react-refresh-webpack-plugin' );
        config.plugins.push(
            new ReactRefreshWebpackPlugin( {
                overlay: {
                    sockIntegration: 'wds',
                },
            } )
        );
    }

    return config;
}

module.exports = getWebpackConfig;
