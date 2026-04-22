const { isInline, isSprite, isUrl } = require( '../utils/resourceQuery' );
const SVGLoaders = require('../rulesLoaders/svg.loader');
module.exports = ( config ) => {
    const { module } = config;
    const { rules } = module;

    const svgFile = /\.svg$/i;

    const svgLoaders = new SVGLoaders(config);

    const svgUrlConfig = svgLoaders.svgUrlLoader();

    rules.push( {
        test: svgFile,
        oneOf: [
            // svg强制内联处理
            {
                resourceQuery: isInline,
                use: svgLoaders.svgInlineLoader()
            },
            // svg强制url处理 - 使用 Asset Modules
            {
                resourceQuery: isUrl,
                type: svgUrlConfig.type,
                generator: svgUrlConfig.generator,
                use: svgUrlConfig.use,
            },
            // 使用svg精灵合并
            {
                resourceQuery: isSprite,
                use: svgLoaders.svgSpriteLoader()
            },
            // 默认情况下使用react组件进行导出
            {
                use: svgLoaders.svgSpriteReactLoader()
            }
        ]

    } );

    return config;
}
