const getWebpackBaseConfig = require( './webpack.config.base' );

function getWebpackConfig ( buildPath, options ) {

    const config = getWebpackBaseConfig(buildPath, options);

    config.mode = 'production';
    config.devtool = false;

    return config;
}

module.exports = getWebpackConfig;
