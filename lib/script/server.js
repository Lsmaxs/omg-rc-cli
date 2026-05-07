const path = require( 'path' );
const fs = require( 'fs' );
const errorlog = require( '../extension/console/errorLog' );
const getWebpcakConfig = require( '../utils/getWebpackConfig' );
const getWebpackEntry = require( '../utils/getWebpackEentry' );
const getWebpackBuildRules = require( '../utils/getWebpackBuildRules' );
const createWebpackCompiler = require( '../utils/createWebpackCompiler' );
const Loading = require( '../extension/console/loading' );
const log = require( '../extension/console/log' );
const infoLog = require( '../extension/console/infoLog' );
const { pathConfig, initPathConfig } = require( '../utils/path' );
const clearOtherWebpackConfig = require( '../utils/clearOtherWebpackConfig' );
const createWebpackDevServerConfig = require( '../utils/createWebpackDevServerConfig' );
const webpackDevServer = require( 'webpack-dev-server' );
const address = require( 'address' );
const checkRunDevDependencies = require( '../utils/checkRunDevDependencies' );
const checkReactHotLoaderDependencies = require( '../utils/checkReactHotLoaderDependencies' );
const getProjectConfig = require( '../utils/getProjectConfig' );
const analyzerConfig = require('../config/analyzer.config');
let loading = null;

function server ( targetPath, targetDir, env, options, config = null ) {
    process.env.BABEL_ENV = 'development';
    process.env.NODE_ENV = 'development';
    process.env.OMG_ENV = 'server';
    process.env.OMG_CONSOLE = '1';

    let isOpenAnalyzer = false;

    return new Promise( async ( resolve ) => {

        const BUILD_PATH = targetPath && targetPath != '' ? path.join( pathConfig.appPath, targetPath ) : pathConfig.appPath;
        const BUILD_DIR = targetDir && targetDir != '' ? targetDir : null;
        targetPath && initPathConfig( targetPath, targetDir );

        // 检查运行环境
        const isPass = await checkRunDevDependencies();
        if ( !isPass ) {
            resolve( false );
        }

        // 检查是否进行 react-refresh 版本检查（仅在开启热更新时）
        let isHotEnabled = true;
        try {
            const projectConfig = config || getProjectConfig( env );
            isHotEnabled = !projectConfig || !projectConfig.devServer || projectConfig.devServer.hot !== false;
        } catch ( e ) {
            // 配置加载失败（如 env 参数不完整），默认启用热更新
        }

        if ( isHotEnabled ) {
            const isPass_hot = await checkReactHotLoaderDependencies();
            if ( !isPass_hot ) {
                loading && loading.stop();
                resolve( false );
            }
        }

        loading = new Loading( 'building' );

        // 检查目录是否存在
        if ( !fs.existsSync( BUILD_PATH ) ) {
            loading.stop();
            errorlog( `Could not find ${BUILD_PATH}!` );
            resolve( false );
            return;
        }

        if ( targetDir ) {
            const dirPaht = path.join( BUILD_PATH, './src', targetDir );
            if ( !fs.existsSync( path.join( dirPaht ) ) ) {
                loading.stop();
                errorlog( `Could not find ${dirPaht}!` );
                resolve( false );
                return;
            }
        }

        getWebpcakConfig( {
            buildPath: BUILD_PATH,
            buildDir: targetDir,
            env,
            options,
            config
        } )
            .then( ( webpackConfig ) => {
                log( 'init webpack base config successfully!' );
                return getWebpackEntry( webpackConfig, BUILD_PATH, BUILD_DIR, options )
            } )
            .then( ( webpackConfig ) => {
                log( 'init webpack entry successfully!' );
                return getWebpackBuildRules( webpackConfig, targetDir, options );
            } )
            .then( ( webpackConfig ) => {
                log( 'init webpack build rules successfully!' );
                loading.stop();
                isOpenAnalyzer = !!webpackConfig.analyzer;
                webpackConfig = createWebpackDevServerConfig( webpackConfig, targetPath );
                return createWebpackCompiler( clearOtherWebpackConfig( webpackConfig ) );
            } )
            .then( ( data ) => {
                const { compiler, config } = data;
                const { devServer } = config;
                const host = devServer.host || '0.0.0.0';
                const port = devServer.port || 9527;
                let isFirstCompile = true;

                // 编译完成
                compiler.hooks.done.tap( 'done', stats => {
                    const time = stats.endTime - stats.startTime;
                    const hasErrors = stats.hasErrors();

                    if ( hasErrors ) {
                        log( { text: `Compiled with errors`, time, emoji: 'x' } );
                        const info = stats.toJson();
                        info.errors && info.errors.forEach( err => {
                            errorlog( err.message || err );
                        } );
                        return;
                    }

                    const label = isFirstCompile ? 'Compiled successfully' : 'Recompiled successfully';
                    log( { text: label, time, emoji: 'white_check_mark' } );

                    if ( isFirstCompile ) {
                        let portocol = Boolean( devServer.https ) === false ? 'http' : 'https';
                        console.log( '' );
                        infoLog( { text: `Local:   ${portocol}://${host}:${port}`, emoji: 'globe_with_meridians' } );
                        infoLog( { text: `Network: ${portocol}://${address.ip()}:${port}`, emoji: 'globe_with_meridians' } );
                        if (isOpenAnalyzer) {
                            infoLog( { text: `Analyzer: ${portocol}://${host}:${analyzerConfig.get().analyzerPort}`, emoji: 'bar_chart' } );
                        }
                        console.log( '' );
                        isFirstCompile = false;
                    }
                } );

                // 文件变更，开始重新编译
                compiler.hooks.invalid.tap( 'invalid', () => {
                    log( { text: 'Recompiling...', emoji: 'arrows_counterclockwise' } );
                } );

                // webpack-dev-server v4
                const wdsServer = new webpackDevServer( devServer, compiler );
                wdsServer.startCallback( err => {
                    err && console.log( err );
                } );

            } )
            .catch( ( err ) => {
                errorlog( err );
                loading && loading.stop();
                resolve( false );
            } )
    } );

}

module.exports = server;
