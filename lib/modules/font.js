const { pathConfig } = require( '../utils/path' );
const path = require( 'path' );
module.exports = ( config ) => {
    const { module } = config;
    const { rules } = module;
    const { fontDir } = pathConfig;

    // 字体文件处理，使用 Webpack 5 Asset Modules 替代 file-loader
    const fontFile = /\.(?:ttf|eot|woff|woff2)$/i;

    rules.push( {
        test: fontFile,
        type: 'asset/resource',
        generator: {
            filename: path.join( fontDir, '[name]-[hash:8][ext]' ),
        }
    } );

    return config;
}
