'use strict';
const os = require( 'os' );
const hasConfigFile = require( '../utils/hasConfigFile' );
const babelConfig = require( '../utils/createBabelConfig' );
const createTerserPlugin = require( '../utils/createTerserPlugin' );

module.exports = ( config ) => {
  const { module, optimization } = config;
  const { rules } = module;

  const hasTsConfig = hasConfigFile( 'typescript', false ).hasConfig;

  // babel
  rules.push( {
    test: /\.(js|jsx|mjs)$/,
    exclude: /(node_modules|bower_components)/,
    use: [
      {
        loader: require.resolve( 'thread-loader' ),
        options: {
          workers: os.cpus().length,
          workerParallelJobs: 50,
          workerNodeArgs: ['--max-old-space-size=1024'],
          poolRespawn: false,
          poolTimeout: 3000,
          poolParallelJobs: 50,
          name: "babel-pool"
        }
      },
      {
        loader: require.resolve( 'babel-loader' ),
        options: babelConfig( config, 'webpack' ),
      }
    ]
  } );


  // typescript
  hasTsConfig && rules.push( {
    test: /\.(ts|tsx)$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: require.resolve( 'ts-loader' )
    }
  } );

  // ESLint 已从构建链路剥离，建议用户通过独立 npm script 运行：
  // npm install eslint --save-dev
  // npx eslint src/ --ext .js,.jsx,.ts,.tsx

  // js代码压缩
  if ( optimization ) {
    optimization.minimize = config.mode == 'production';
    if ( optimization.minimize ) {
      config.optimization.minimizer = [createTerserPlugin( config )];
    }
  }

  return config;
}
