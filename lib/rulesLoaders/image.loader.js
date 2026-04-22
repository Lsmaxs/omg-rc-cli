const { pathConfig } = require( '../utils/path' );
const path = require( 'path' );
const getImageminConfig = require( '../utils/getImageminConfig' );

module.exports = class ImageLoaders {

    constructor( config ) {

        this.config = config;
        const { imageConfig, omg } = this.config;
        const { filenameBefore } = omg;
        const { imageDir } = pathConfig;

        const IMAGEWEBPACKLOADERCONFIG = imageConfig && imageConfig.compression ? imageConfig.compression : getImageminConfig();
        const OUTPUT_IMAGE_NAME = path.join( filenameBefore, imageDir, '[name]-[hash][ext]' );
        const limit = imageConfig && imageConfig.limit != null ? imageConfig.limit : 8192;

        // 图片优化只会在生产模式下生效
        let loaderSliceMax = 1;
        if ( config.mode == 'production' ) {
            loaderSliceMax = 2;
        }

        const IMAGE_WEBPACK_LOADER = {
            loader: require.resolve( 'image-webpack-loader' ),
            options: IMAGEWEBPACKLOADERCONFIG
        }

        // 指定inline - 使用 Webpack 5 Asset Modules (asset/inline)
        this.IMAGE_INLINE_RULE = [
            {
                name: 'image-webpack-loader',
                rule: IMAGE_WEBPACK_LOADER
            }
        ].slice( 0, loaderSliceMax );

        // 指定通过url加载 - 使用 Webpack 5 Asset Modules (asset/resource)
        this.IMAGE_URL_RULE = [
            {
                name: 'image-webpack-loader',
                rule: IMAGE_WEBPACK_LOADER
            }
        ].slice( 0, loaderSliceMax );

        // 默认加载方式 - 使用 Webpack 5 Asset Modules (asset)
        this.IMAGE_DEFAULT_RULE = [
            {
                name: 'image-webpack-loader',
                rule: IMAGE_WEBPACK_LOADER
            }
        ].slice( 0, loaderSliceMax );

        // Webpack 5 Asset Modules 配置
        this._limit = limit;
        this._outputImageName = OUTPUT_IMAGE_NAME;
    }

    imageLoader () {
        let use = [].concat( this.IMAGE_DEFAULT_RULE );

        if ( this.config.loaderOpt && this.config.loaderOpt.image ) {
            const newUse = this.config.loaderOpt.images( this.IMAGE_DEFAULT_RULE );
            use = newUse || use;
        }

        const result = use.reduce( ( result, item ) => {
            result.push( item.rule );
            return result;
        }, [] );
        // 添加 Asset Modules 的内联配置
        return { type: 'asset', parser: { dataUrlCondition: { maxSize: this._limit } }, generator: { filename: this._outputImageName }, use: result };
    }

    imageInlineLoader () {
        let use = [].concat( this.IMAGE_INLINE_RULE );

        if ( this.config.loaderOpt && this.config.loaderOpt.image_inline ) {
            const newUse = this.config.loaderOpt.images( this.IMAGE_INLINE_RULE );
            use = newUse || use;
        }

        const result = use.reduce( ( result, item ) => {
            result.push( item.rule );
            return result;
        }, [] );
        return { type: 'asset/inline', use: result };
    }

    imageUrlLoader () {
        let use = [].concat( this.IMAGE_URL_RULE );

        if ( this.config.loaderOpt && this.config.loaderOpt.image_url ) {
            const newUse = this.config.loaderOpt.images( this.IMAGE_URL_RULE );
            use = newUse || use;
        }

        const result = use.reduce( ( result, item ) => {
            result.push( item.rule );
            return result;
        }, [] );
        return { type: 'asset/resource', generator: { filename: this._outputImageName }, use: result };
    }
}
