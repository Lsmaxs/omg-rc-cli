const { pathConfig } = require( './path' );
const path = require( 'path' );

function getPackageName ( module ) {
    const context = module.resource && path.dirname( module.resource );
    if ( !context ) return null;
    const idx = context.indexOf( 'node_modules' );
    if ( idx === -1 ) return null;
    const after = context.slice( idx + 'node_modules'.length + 1 );
    return after.startsWith( '@' )
        ? after.split( '/' ).slice( 0, 2 ).join( '~' )
        : after.split( '/' )[0];
}

function getSrcPath ( module ) {
    const context = module.resource && path.dirname( module.resource );
    if ( !context ) return null;
    const idx = context.indexOf( '/src/' );
    if ( idx === -1 ) return null;
    const relative = context.slice( idx + 5 );
    const parts = relative.split( '/' );
    return parts.slice( 0, 2 ).join( '~' );
}

module.exports = function createWebpackConfigSplitChunks () {
    return {
        chunks: 'all',
        minChunks: 2,
        automaticNameDelimiter: '~',
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        minSize: 20000,
        cacheGroups: {
            // ===== 第一级：核心运行时 =====
            babel: {
                test: /\/node_modules\/@babel/,
                priority: 30,
                chunks: 'initial',
                name: 'core-js',
                minSize: 20000,
                reuseExistingChunk: true,
            },
            react: {
                enforce: true,
                reuseExistingChunk: true,
                name: 'react-runtime',
                test: /\/node_modules\/(react|react-dom|react-router|mobx|mobx-react|scheduler|prop-types)/,
                chunks: 'initial',
                priority: 30
            },

            // ===== 第二级：大型第三方库单独分包 =====
            uiLib: {
                test: /\/node_modules\/(zzc-design-mobile|zzc-ui|zzc-base-component)[\\/]/,
                priority: 20,
                chunks: 'all',
                name: 'vendors~zzc-ui',
                reuseExistingChunk: true,
            },
            tools: {
                test: /\/node_modules\/(lodash|underscore|axios|dayjs|qs|fast-sort|classnames|immutable)[\\/]/,
                priority: 20,
                chunks: 'all',
                name: 'vendors~tools',
                reuseExistingChunk: true,
            },

            // ===== 第三级：通用 node_modules 按 package + 入口名分包 =====
            vendors: {
                test: /[\\/]node_modules[\\/]/,
                reuseExistingChunk: true,
                priority: 10,
                minChunks: 1,
                chunks: 'all',
                enforce: true,
                name ( module, chunks ) {
                    const moduleName = getPackageName( module );
                    const entryNames = chunks.map( c => c.name ).filter( Boolean );
                    const uniqueNames = [ ...new Set( entryNames ) ];
                    if ( uniqueNames.length > 0 ) {
                        const prefix = uniqueNames.slice( 0, 3 ).join( '~' ).slice( 0, 20 );
                        return `vendors~${ prefix }`;
                    }
                    return moduleName ? `vendors~${ moduleName }` : 'vendors';
                }
            },

            // ===== 第四级：业务公共代码 =====
            common: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
                chunks: 'all',
                enforce: true,
                name ( module, chunks ) {
                    const srcPath = getSrcPath( module );
                    const entryNames = chunks.map( c => c.name ).filter( Boolean );
                    const uniqueNames = [ ...new Set( entryNames ) ];
                    if ( uniqueNames.length > 0 ) {
                        const prefix = uniqueNames.slice( 0, 3 ).join( '~' ).slice( 0, 24 );
                        return `common~${ prefix }`;
                    }
                    return srcPath ? `common~${ srcPath }` : 'common';
                }
            }
        }
    }
}
