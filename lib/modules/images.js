const { pathConfig } = require( '../utils/path' );
const { isInline, isUrl } = require( '../utils/resourceQuery' );
const ImageLoaders = require('../rulesLoaders/image.loader');

module.exports = ( config ) => {
    const { module } = config;
    const { rules } = module;

    const regFile = /\.(jpe?g|png|gif|webp)$/i;

    const imageLoaders = new ImageLoaders(config);

    // Webpack 5 Asset Modules: 在 oneOf 中需要使用独立的 rule 对象
    // 每个 rule 包含 type（Asset Modules 类型）和 use（image-webpack-loader 等额外 loader）
    const defaultConfig = imageLoaders.imageLoader();
    const inlineConfig = imageLoaders.imageInlineLoader();
    const urlConfig = imageLoaders.imageUrlLoader();

    rules.push( {
        test: regFile,
        oneOf: [
            // 指定inline
            {
                resourceQuery: isInline,
                type: inlineConfig.type,
                use: inlineConfig.use,
            },
            // 指定通过url加载
            {
                resourceQuery: isUrl,
                type: urlConfig.type,
                generator: urlConfig.generator,
                use: urlConfig.use,
            },
            // 默认加载方式，超出limit使用url引入，否则base64内联
            {
                type: defaultConfig.type,
                parser: defaultConfig.parser,
                generator: defaultConfig.generator,
                use: defaultConfig.use,
            },
        ]
    } );

    return config;
}
