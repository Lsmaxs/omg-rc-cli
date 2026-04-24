const { pathConfig } = require( '../utils/path' );
const path = require( 'path' );
const { isUndefined } = require( '../utils/typeof' );
const FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' );
const createOuputFileName = require( '../utils/createOuputFileName' );
const createWebpackConfigAlias = require( '../utils/createWebpackConfigAlias' );
const createWebpackConfigSplitChunks = require( '../utils/createWebpackConfigSplitChunks' );

function getWebpackBaseConfig ( buildPath, options ) {

    const { progress, prompt, chunkhash } = options;
    const config = {
        context: pathConfig.appPath,

        // Webpack 5 持久化缓存（替代 hard-source-webpack-plugin）
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [ __filename ],
            },
            cacheDirectory: path.join( pathConfig.appCacheDir, 'webpack5' ),
        },

        output: {
            path: pathConfig.appDist,
            filename: `${pathConfig.jsDir}/${createOuputFileName( 'js', chunkhash )}`,
            chunkFilename: `${pathConfig.jsDir}/${createOuputFileName( 'jschunk', chunkhash )}`,
            publicPath: process.env.OMG_ENV == 'server' ? '/' : `${pathConfig.appDist}/`,
            pathinfo: false,
            // Webpack 5 Asset Modules 默认输出路径
            assetModuleFilename: `${pathConfig.imageDir}/[name]-[hash:8][ext]`,
        },

        resolve: {
            alias: createWebpackConfigAlias(),
            extensions: ['.mjs', '.web.js', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
            mainFields: ['browser', 'module', 'main'],
            modules: [
                pathConfig.ownNodeModules,
                pathConfig.appNodeModules
            ],
            // Webpack 5 不再自动注入 Node.js polyfill，提供空的 fallback
            fallback: {},
        },
        module: {
            rules: []
        },
        plugins: [
        ],
        optimization: {
            splitChunks: createWebpackConfigSplitChunks()
        },
        omg: {
            filenameBefore: '',
            autoFindEntry: true,
            noCache: false,
            cacheToGlobal: false,
            openOutputAssets: false,
            outputAssetsDirName: '.assets'
        }
    };

    // 自定义进度输出 —— 不显示 webpack 原始进度行
    if ( progress ) {
        const webpack = require( 'webpack' );
        config.plugins.push(
            new webpack.ProgressPlugin()
        );
    }

    // 是否开启构建提示
    if( prompt ) {
        config.plugins.push(
            new FriendlyErrorsWebpackPlugin({clearConsole: false, verbose: true})
        );
    }

    // 当传入指定目录后
    if ( !isUndefined( buildPath ) && buildPath != pathConfig.appPath ) {
        config.resolve.modules.unshift( path.resolve( pathConfig.appPath, buildPath, 'node_modules' ) );
        config.output.path = path.resolve( pathConfig.appPath, buildPath, 'dist' );
    }

    return config;
}

module.exports = getWebpackBaseConfig;
