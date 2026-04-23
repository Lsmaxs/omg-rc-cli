const { pathConfig } = require( '../utils/path' );
const path = require( 'path' );
const CssMinimizerPlugin = require( 'css-minimizer-webpack-plugin' );
const createOuputFileName = require( '../utils/createOuputFileName' );
const StyleLoaders = require( '../rulesLoaders/style.loader' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = ( config, options ) => {
    const { module, omg } = config;
    const { filenameBefore } = omg;
    const { rules } = module;
    const { appDist, cssDir } = pathConfig;
    const { chunkhash } = options;
    // 纯css文件
    function isCSSFile ( filePath ) {
        return /\.css$/i.test( filePath ) && !/\.module\.css$/i.test( filePath );
    }

    // 需要使用css module的文件
    function isCSSModulesFile ( filePath ) {
        return /\.module\.css$/i.test( filePath );
    }

    // 纯scss文件
    function isSCSSFile ( filePath ) {
        return /\.s[ac]ss$/i.test( filePath ) && !/\.module\.s[ac]ss$/i.test( filePath );
    }

    // 需要使用scss module的文件
    function isSCSSModulesFile ( filePath ) {
        return /\.module\.s[ac]ss$/i.test( filePath );
    }

    // 初始化加载器
    const styleLoader = new StyleLoaders( config );

    // xx.module.css进行css module处理
    rules.push( {
        test: isCSSModulesFile,
        use: styleLoader.cssModuleLoader()
    } );

    // 普通css处理
    rules.push( {
        test: isCSSFile,
        use: styleLoader.cssLoader()
    } );

    // 普通scss处理
    rules.push( {
        test: isSCSSFile,
        use: styleLoader.scssLoader()
    } );

    // xx.module.scss module处理
    rules.push( {
        test: isSCSSModulesFile,
        use: styleLoader.scssModuleLoader()
    } );

    // css导出插件
    config.plugins.push(
        new MiniCssExtractPlugin( {
            filename: path.join( filenameBefore, cssDir, createOuputFileName( 'css', chunkhash ) ),
            chunkFilename: path.join( cssDir, createOuputFileName( 'csschunk', chunkhash ) ),
            ignoreOrder: true,
        } )
    );

    // 使用 CssMinimizerPlugin 替代已废弃的 OptimizeCssAssetsPlugin
    if ( config.mode == 'production' ) {
        config.optimization.minimizer = config.optimization.minimizer || [];
        config.optimization.minimizer.push(
            new CssMinimizerPlugin()
        )
    }

    return config;
}
