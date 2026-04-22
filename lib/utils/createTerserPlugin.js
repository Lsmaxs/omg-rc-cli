
const TerserPlugin = require( 'terser-webpack-plugin' );
const mergeObject = require('../utils/mergeObject');

module.exports = function ( config ) {

    const DEFAULT_TERSER_OPTION = {
        parse: {
            ecma: 8,
        },
        compress: {
            drop_console: false,
            drop_debugger: true,
            ecma: 5,
            comparisons: false,
            warnings: false,
            inline: 2,
            collapse_vars: true,
            reduce_vars: true
        },
        mangle:{
            safari10: true
        },
        output: {
            ecma: 5,
            ascii_only: true,
            beautify: false,
            comments: false,
            safari10: true
        }
    }

    // 外包传入，将智能合并
    let terserOptions = config.terser ? mergeObject(DEFAULT_TERSER_OPTION, config.terser) : DEFAULT_TERSER_OPTION;
    return new TerserPlugin( {
        // terser-webpack-plugin v5 移除 cache 选项，缓存由 Webpack 5 持久化缓存接管
        parallel: true,
        extractComments: false,
        terserOptions: terserOptions
    } );
}
