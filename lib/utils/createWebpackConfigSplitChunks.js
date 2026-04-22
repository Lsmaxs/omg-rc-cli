const { pathConfig } = require( './path' );
const path = require( 'path' );

module.exports = function createWebpackConfigSplitChunks () {
    return {
        chunks: 'initial',
        minChunks: 2,
        automaticNameDelimiter: '~',
        maxAsyncRequests: 8,
        maxInitialRequests: 6,
        minSize: 30000,
        cacheGroups: {
            babel: {
                test: /\/node_modules\/@babel/,
                priority: -10,
                chunks: 'initial',
                name: 'core-js',
                minSize: 30000,
                reuseExistingChunk: true,// 重用模块
            },
            react: {
                enforce: true,
                reuseExistingChunk: true,// 重用模块
                name: 'react-runtime',
                test: /\/node_modules\/(react|react-dom)/,
                chunks: 'initial',
                priority: -10
            },
            vendors: {
                test: /[\\/]node_modules[\\/]/,
                reuseExistingChunk: true,
                priority: -20
            },
            default: {
                minChunks: 2,
                priority: -30,
                reuseExistingChunk: true
            }
        }
    }
}