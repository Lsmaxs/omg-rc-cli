const Typeof = require( '../utils/typeof' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const autoprefixer = require( 'autoprefixer' );
const browserslist = require( '../utils/browserslist' );
const os = require( 'os' );

module.exports = class StyleLoaders {

    constructor(config) {

        this.config = config;

        // css配置
        const CSS_LOADER_OPTION = {};
        // css-modules配置
        const CSS_MODULES_LOADER_OPTION = Object.assign( {}, CSS_LOADER_OPTION, {
            esModule: false,
            modules: {
                mode: 'local',
                localIdentName: '[local]--[hash:base64:5]',
                namedExport: false,
            },
        } );

        let autoprefixerBrowsers = [];
        if ( config.browserslist && Typeof.isArray( config.browserslist ) ) {
            autoprefixerBrowsers = config.browserslist.slice( 0 );
        } else {
            autoprefixerBrowsers = browserslist.slice( 0 );
        }

        const STYLE_LOADER = {
            loader: require.resolve( 'style-loader' ),
            options: {}
        }

        const MINI_CSS_EXTRACT_PLUGIN = {
            loader: MiniCssExtractPlugin.loader
        };

        const CSS_LOADER = {
            loader: require.resolve( 'css-loader' ),
            options: CSS_LOADER_OPTION
        };

        const CSS_MODULES_LOADER = {
            loader: require.resolve( 'css-loader' ),
            options: CSS_MODULES_LOADER_OPTION
        };

        // postcss-loader 8.x 新配置格式
        const POSTCSS_LOADER = {
            loader: require.resolve( 'postcss-loader' ),
            options: {
                postcssOptions: {
                    plugins: [
                        ['autoprefixer', { overrideBrowserslist: autoprefixerBrowsers }]
                    ],
                },
            }
        }

        // sass-loader 14.x + Dart Sass 配置
        const SASS_LOADER = {
            loader: require.resolve( 'sass-loader' ),
            options: {
                api: 'legacy',
                sassOptions: {
                    silenceDeprecations: ['legacy-js-api', 'import'],
                },
                sourceMap: true,
            }
        }

        const THREAD_LOADER = {
            loader: require.resolve( 'thread-loader' ),
            options: {
              workers: os.cpus().length,
              workerParallelJobs: 50,
              workerNodeArgs: ['--max-old-space-size=1024'],
              poolRespawn: false,
              poolTimeout: 3000,
              poolParallelJobs: 50,
              name: "style-pool"
            }
          }

        // css的默认配置
        this.CSS_RULES = [
            {
                name: 'css-loader',
                rule: CSS_LOADER
            },
            {
                name: 'postcss-loader',
                rule: POSTCSS_LOADER
            }
        ];

        // css module的默认配置（不含首个 loader，由下方统一处理）
        this.CSS_MODULE_RULES = [
            {
                name: 'css-loader',
                rule: CSS_MODULES_LOADER
            },
            {
                name: 'postcss-loader',
                rule: POSTCSS_LOADER
            }
        ];

        // scss的默认配置
        this.SCSS_RULES = [
            {
                name: 'css-loader',
                rule: CSS_LOADER
            },
            {
                name: 'postcss-loader',
                rule: POSTCSS_LOADER
            },
            {
                name: 'thread_loader',
                rule: THREAD_LOADER
            },
            {
                name: 'sass-loader',
                rule: SASS_LOADER
            }
        ];

        // scss module的默认配置（不含首个 loader，由下方统一处理）
        this.SCSS_MODULE_RULES = [
            {
                name: 'css-loader',
                rule: CSS_MODULES_LOADER
            },
            {
                name: 'postcss-loader',
                rule: POSTCSS_LOADER
            },
            {
                name: 'sass-loader',
                rule: SASS_LOADER
            }
        ];

        // 如果开启了热更新，那么默认的scss和css的导出将转为内联功能，否则使用 MiniCssExtractPlugin
        const firstLoader = ( process.env.OMG_ENV == 'server' && config.devServer && config.devServer.hot )
            ? { name: 'style-loader', rule: STYLE_LOADER }
            : { name: 'MiniCssExtractPlugin', rule: MINI_CSS_EXTRACT_PLUGIN };

        this.CSS_RULES.unshift( firstLoader );
        this.SCSS_RULES.unshift( firstLoader );
        this.CSS_MODULE_RULES.unshift( firstLoader );
        this.SCSS_MODULE_RULES.unshift( firstLoader );
    }

    cssLoader() {
        let use = [].concat(this.CSS_RULES);

        if (this.config.loaderOpt && this.config.loaderOpt.css) {
            const newUse = this.config.loaderOpt.css(this.CSS_RULES);
            use = newUse || use;
        }

        return use.reduce((result, item) => {
            result.push(item.rule);
            return result;
        }, []);
    }

    cssModuleLoader() {
        let use = [].concat(this.CSS_MODULE_RULES);

        if (this.config.loaderOpt && this.config.loaderOpt.cssModule) {
            const newUse = this.config.loaderOpt.cssModule(this.CSS_MODULE_RULES);
            use = newUse || use;
        }

        return use.reduce((result, item) => {
            result.push(item.rule);
            return result;
        }, []);
    }

    scssLoader() {
        let use = [].concat(this.SCSS_RULES);

        if (this.config.loaderOpt && this.config.loaderOpt.scss) {
            const newUse = this.config.loaderOpt.scss(this.SCSS_RULES);
            use = newUse || use;
        }

        return use.reduce((result, item) => {
            result.push(item.rule);
            return result;
        }, []);
    }

    scssModuleLoader() {
        let use = [].concat(this.SCSS_MODULE_RULES);

        if (this.config.loaderOpt && this.config.loaderOpt.scssModule) {
            const newUse = this.config.loaderOpt.scssModule(this.SCSS_MODULE_RULES);
            use = newUse || use;
        }

        return use.reduce((result, item) => {
            result.push(item.rule);
            return result;
        }, []);
    }
}
