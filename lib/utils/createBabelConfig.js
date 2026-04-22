const { pathConfig } = require( './path' );
const browserList = require( './browserslist' );

const hasConfigFile = require( './hasConfigFile' );
const getCacheIdentifier = require( './getCacheIdentifier' );

module.exports = ( config, type ) => {
    const hasBabelConfig = hasConfigFile( 'babel', false );
    const babelConfig = {
        babelrc: hasBabelConfig.hasConfig,
        configFile: hasBabelConfig.path || false,
        sourceMaps: false,
        inputSourceMap: false,
        highlightCode: true,
        presets: hasBabelConfig.hasConfig ? [] : [
            [
                require.resolve( '@babel/preset-env' ),
                {
                    targets: {
                        browsers: config.browserList || browserList
                    },
                    ignoreBrowserslistConfig: true,
                    useBuiltIns: false,
                    modules: false,
                    debug: false
                }
            ],
            [
                require.resolve( '@babel/preset-react' ),
                {
                    development: process.env.OMG_ENV === 'development' || process.env.OMG_ENV === 'server'
                }
            ],

        ],
        plugins: hasBabelConfig.hasConfig ? [] : [
            // @babel/plugin-syntax-dynamic-import 已内置到 @babel/preset-env，无需单独引入
            [
                require.resolve( '@babel/plugin-proposal-decorators' ),
                { legacy: true }
            ],
            // @babel/plugin-proposal-class-properties 已内置到 @babel/preset-env 7.x+
            // 但保留以确保 loose 模式兼容
            [
                require.resolve( '@babel/plugin-transform-runtime' ),
                {
                    corejs: 3,
                    helpers: true,
                    regenerator: true,
                    useESModules: true,
                    absoluteRuntime: true,
                    version: require( '@babel/runtime/package.json' ).version,
                }
            ]
        ],
    };

    // 如果是webpack调用，才进行缓存策略
    if ( type == 'webpack' ) {
        babelConfig.cacheDirectory = !config.omg.noCache ? pathConfig.appCacheDir : false;
        babelConfig.cacheCompression = !config.omg.noCache;
        babelConfig.cacheIdentifier = getCacheIdentifier( process.env.NODE_ENV, 'omg-rc-cli' );
    }

    // 当开启了热更新，需要额外配置babel插件
    if ( process.OMG_ENV == 'server' && config.devServer && config.devServer.hot ) {
        babelConfig.plugins.unshift( require.resolve( "react-hot-loader/babel" ) );
    }

    return babelConfig;
}
