const getWebpackDevConfig = require( '../config/webpack.config.dev' );
const getWebpackProConfig = require( '../config/webpack.config.pro' );
const mergeOMGConfig = require( '../utils/mergeOMGConfig' );
const getProjectConfig = require( '../utils/getProjectConfig' );
const { pathConfig, changeCacheDirPath } = require( '../utils/path' );
const path = require( 'path' );
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin;
const analyzerConfig = require( '../config/analyzer.config' );
const createOuputFileName = require( '../utils/createOuputFileName' );
const OutputAssetsPlugin = require('../plugins/outputAssets-plugin');

module.exports = async ( cmdOpt ) => {
    return new Promise( async ( resolve, reject ) => {

        try {
            const { buildPath, buildDir, env, options, config = null } = cmdOpt;

            let webpackConfig = process.env.OMG_ENV == 'development' || process.env.OMG_ENV == 'server' ? getWebpackDevConfig( buildPath, options ) : getWebpackProConfig( buildPath, options );
            const customOMGConfig = config || getProjectConfig( env );
            // 合并配置
            webpackConfig = !!customOMGConfig ? mergeOMGConfig( webpackConfig, customOMGConfig ) : webpackConfig;

            const {omg} = webpackConfig;
            const {filenameBefore, openOutputAssets, outputAssetsDirName } = omg;
            if (filenameBefore && filenameBefore != '') {
                webpackConfig.output.filename = path.join(filenameBefore, pathConfig.jsDir, createOuputFileName( 'js', options.chunkhash ));
            }

            // 当指定src下某个目录进行打包的时候，output将会增加一层
            if ( webpackConfig.output && webpackConfig.output.dirName != null ) {
                webpackConfig.output.path = path.resolve( webpackConfig.output.path, webpackConfig.output.dirName );
            } else if ( buildDir ) {
                webpackConfig.output.path = path.resolve( webpackConfig.output.path, buildDir );
            }

            // 是否配置全局缓存
            if ( webpackConfig.omg && webpackConfig.omg.cacheToGlobal ) {
                changeCacheDirPath( path.join( __dirname, '../../node_modules/.cache' ), buildDir );
            }

            // 是否开启资产输出 OutputAssets
            if ( openOutputAssets ) {
                webpackConfig.plugins.push(
                    new OutputAssetsPlugin({
                        path: path.resolve(webpackConfig.output.path, outputAssetsDirName)
                    })
                );
            }

            // Webpack 5 持久化缓存已在 webpack.config.base.js 中配置
            // 如需关闭缓存，通过 omg.noCache 控制
            if ( webpackConfig.omg && webpackConfig.omg.noCache ) {
                webpackConfig.cache = false;
            }

            // 开启包分析
            const { analyzer = false, analyzerOpt } = webpackConfig;
            if ( analyzer ) {
                if ( analyzerOpt ) {
                    analyzerConfig.set( analyzerOpt );
                }
                webpackConfig.plugins.push(
                    new BundleAnalyzerPlugin( analyzerConfig.get() )
                )
            }

            // 确保一定有入口
            if ( !webpackConfig ) {
                reject( new Error( 'init webpack base config error!' ) );
            } else {
                resolve( webpackConfig );
            }
        } catch ( err ) {
            reject( err );
        }
    } );
}
