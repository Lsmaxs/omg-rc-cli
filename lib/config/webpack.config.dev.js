const getWebpackBaseConfig = require( './webpack.config.base' );
const { pathConfig } = require( '../utils/path' );

function getWebpackConfig ( buildPath, options ) {

    const config = getWebpackBaseConfig(buildPath, options);

    config.mode = 'development';
    // Webpack 5 中 devtool 名称格式调整
    config.devtool = 'eval-cheap-module-source-map';

    return config;
}

module.exports = getWebpackConfig;
