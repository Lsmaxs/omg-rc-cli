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

    return config;
}

module.exports = getWebpackConfig;
