# omg-rc-cli v2.0 升级计划

> 版本：2.0.0
> 编写日期：2026-04-22
> 当前版本：1.1.2
> 目标：将构建工具从 Webpack 4 升级到 Webpack 5，将 node-sass 替换为 Dart Sass，确保 Node.js 18+ 全兼容

---

## 目录

- [一、现状分析](#一现状分析)
- [二、升级目标与范围](#二升级目标与范围)
- [三、技术债务清单](#三技术债务清单)
- [四、升级计划总览](#四升级计划总览)
- [五、阶段一：Webpack 5 迁移](#五阶段一webpack-5-迁移)
- [六、阶段二：node-sass → Dart Sass 替换](#六阶段二node-sass--dart-sass-替换)
- [七、阶段三：Node.js 18+ 兼容性保障](#七阶段三nodejs-18-兼容性保障)
- [八、阶段四：依赖全面升级与优化](#八阶段四依赖全面升级与优化)
- [九、风险评估与回滚方案](#九风险评估与回滚方案)
- [十、测试策略](#十测试策略)
- [十一、时间节点安排](#十一时间节点安排)
- [附录A：完整依赖升级映射表](#附录a完整依赖升级映射表)
- [附录B：破坏性变更速查表](#附录b破坏性变更速查表)
- [附录C：验收标准清单](#附录c验收标准清单)

---

## 一、现状分析

### 1.1 项目概况

omg-rc-cli 是一个基于 Webpack 4 的 React 脚手架 CLI 工具，提供项目初始化、构建、开发服务器、发布等完整工作流。

### 1.2 核心技术栈（当前版本）

| 类别 | 技术 | 当前版本 | 状态 |
|------|------|---------|------|
| 构建工具 | webpack | 4.42.1 | 严重过时 |
| 开发服务器 | webpack-dev-server | 3.10.3 | 严重过时 |
| CSS 预处理 | node-sass | 4.13.1 | 已废弃 |
| Sass 加载器 | sass-loader | 7.3.1 | 不兼容 Dart Sass |
| JS 编译 | @babel/core | 7.9.0 | 过时 |
| TypeScript | typescript | 3.7.5 | 严重过时 |
| 代码压缩 | terser-webpack-plugin | 2.3.5 | 过时 |
| CSS 压缩 | optimize-css-assets-webpack-plugin | 5.0.3 | 已废弃 |
| 模块缓存 | hard-source-webpack-plugin | 0.13.1 | 不兼容 Webpack 5 |
| CSS 处理 | css-loader | 3.4.2 | 过时 |
| PostCSS | postcss-loader | 3.0.0 | 过时 |
| Autoprefixer | autoprefixer | 9.7.4 | 过时 |
| 文件处理 | file-loader / url-loader | 5.1.0 / 3.0.0 | Webpack 5 内置替代 |
| Lint | eslint-loader | 3.0.3 | 已废弃 |
| CLI 框架 | commander | 4.1.1 | 过时 |

### 1.3 关键文件结构

```
omg-rc-cli/
├── bin/omg.js                          # CLI 入口
├── index.js                            # 主入口（commander 命令注册）
├── index_node.js                       # Node API 入口
├── lib/
│   ├── config/
│   │   ├── webpack.config.base.js      # Webpack 基础配置
│   │   ├── webpack.config.dev.js       # 开发环境配置
│   │   └── webpack.config.pro.js       # 生产环境配置
│   ├── modules/
│   │   ├── style.js                    # CSS/SCSS 处理（含 OptimizeCssAssetsPlugin）
│   │   ├── script.js                   # JS/TS 处理
│   │   ├── html.js                     # HTML 处理
│   │   ├── images.js                   # 图片处理
│   │   ├── svg.js                      # SVG 处理
│   │   ├── font.js                     # 字体处理
│   │   └── handlebars.js               # Handlebars 模板
│   ├── rulesLoaders/
│   │   ├── style.loader.js             # 样式 loader 链（含 sass-loader 配置）
│   │   ├── image.loader.js             # 图片 loader
│   │   └── svg.loader.js               # SVG loader
│   ├── utils/
│   │   ├── getWebpackConfig.js          # Webpack 配置组装（含 HardSourceWebpackPlugin）
│   │   ├── createWebpackDevServerConfig.js  # DevServer 配置
│   │   ├── createWebpackConfigSplitChunks.js # SplitChunks 配置
│   │   ├── createTerserPlugin.js        # Terser 压缩配置
│   │   └── ...                         # 其他工具函数
│   ├── plugins/
│   │   └── outputAssets-plugin.js       # 自定义资产输出插件
│   └── script/
│       ├── build.js                    # build 命令
│       ├── watch.js                    # watch 命令
│       ├── server.js                   # server 命令
│       └── publish.js                  # publish 命令
├── example/                            # 示例项目
│   ├── omg.config.js                   # 用户配置文件
│   └── src/                            # 示例源码
├── page/                               # 文档站（Dumi）
└── page_server/                        # 文档站静态服务
```

### 1.4 核心构建流程

```
用户执行命令 → commander 解析 → lib/script/*.js
    → 环境变量设置 (NODE_ENV / OMG_ENV)
    → getWebpackConfig() 组装配置
        → webpack.config.base.js / dev.js / pro.js
        → mergeOMGConfig() 合并用户 omg.config.js
        → HardSourceWebpackPlugin（生产缓存）
    → getWebpackEntry() 获取入口
    → getWebpackBuildRules() 获取构建规则
        → modules/style.js（CSS/SCSS → OptimizeCssAssetsPlugin）
        → modules/script.js（JS/TS → babel-loader, ts-loader）
        → modules/images.js / svg.js / font.js / html.js
    → createWebpackCompiler() 创建编译器
    → compiler.run() / compiler.watch() / webpackDevServer
```

---

## 二、升级目标与范围

### 2.1 核心目标

1. **Webpack 4 → Webpack 5**：完成构建工具主版本升级，利用 Webpack 5 持久化缓存、模块联邦、更好的 Tree Shaking
2. **node-sass → Dart Sass**：完全移除 node-sass 原生依赖，切换到纯 JS 实现的 sass (Dart Sass)
3. **Node.js 18+ 兼容**：确保所有依赖在 Node.js 18/20/22 下正常运行
4. **现代化依赖**：全面升级过时依赖，移除已废弃包

### 2.2 不在范围内

- React 版本升级（由使用方自行决定）
- 文档站 (page/) 的 Dumi 框架升级
- CLI 命令接口变更（保持向后兼容）
- omg.config.js 配置格式变更（保持向后兼容）

### 2.3 兼容性承诺

- 升级后 CLI 的命令行接口（`omg build/watch/server/publish`）保持不变
- omg.config.js 配置文件格式保持向后兼容
- 输出目录结构保持一致
- 用户无需修改项目源码即可享受升级收益

---

## 三、技术债务清单

### 3.1 严重（阻塞升级）

| # | 债务 | 影响 | 涉及文件 |
|---|------|------|---------|
| D1 | hard-source-webpack-plugin 不兼容 Webpack 5 | 构建失败 | `lib/utils/getWebpackConfig.js` |
| D2 | node-sass 需要原生编译，Node 18+ 编译失败 | 安装/构建失败 | `package.json`, `lib/rulesLoaders/style.loader.js` |
| D3 | webpack-dev-server 3.x API 不兼容 Webpack 5 | Dev server 无法启动 | `lib/script/server.js`, `lib/utils/createWebpackDevServerConfig.js` |
| D4 | optimize-css-assets-webpack-plugin 已废弃 | 与 Webpack 5 不兼容 | `lib/modules/style.js` |
| D5 | terser-webpack-plugin 2.x 不兼容 Webpack 5 | 生产构建失败 | `lib/utils/createTerserPlugin.js` |

### 3.2 高优先级

| # | 债务 | 影响 | 涉及文件 |
|---|------|------|---------|
| D6 | file-loader / url-loader 在 Webpack 5 中已内置 | 不必要依赖 | `lib/rulesLoaders/image.loader.js`, `lib/modules/images.js` |
| D7 | eslint-loader 已废弃，需替换为 eslint-webpack-plugin | 功能失效 | `lib/utils/createEslintConfig.js` |
| D8 | postcss-loader 3.x 使用旧 API | 兼容性风险 | `lib/rulesLoaders/style.loader.js` |
| D9 | css-loader 3.x 不支持新特性 | 功能缺失 | `lib/rulesLoaders/style.loader.js` |
| D10 | autoprefixer 9.x 过时 | 兼容性风险 | `lib/rulesLoaders/style.loader.js` |

### 3.3 中等优先级

| # | 债务 | 影响 | 涉及文件 |
|---|------|------|---------|
| D11 | Babel 7.9.x 可升级到最新 7.x | 缺少优化 | `package.json` |
| D12 | TypeScript 3.7.5 严重过时 | 类型检查能力弱 | `package.json` |
| D13 | commander 4.x 可升级 | 缺少新特性 | `package.json` |
| D14 | glob 7.x 使用已废弃的回调 API | Node 22 弃用警告 | `package.json` |
| D15 | webpack-jarvis 不维护，不兼容 Webpack 5 | 功能失效 | `lib/utils/getWebpackConfig.js` |

---

## 四、升级计划总览

```
阶段一：Webpack 5 迁移（核心）           预计 5 个工作日
    ├── 1.1 升级 webpack/webpack-cli 核心包
    ├── 1.2 替换不兼容插件
    ├── 1.3 迁移配置文件
    ├── 1.4 修复资源模块（Asset Modules）
    └── 1.5 迁移 webpack-dev-server 4.x

阶段二：node-sass → Dart Sass 替换       预计 2 个工作日
    ├── 2.1 替换依赖包
    ├── 2.2 迁移 sass-loader 配置
    ├── 2.3 处理语法差异
    └── 2.4 构建脚本调整

阶段三：Node.js 18+ 兼容性保障            预计 2 个工作日
    ├── 3.1 全量依赖兼容性检查
    ├── 3.2 处理 Node.js 内置模块变更
    ├── 3.3 Polyfill 策略调整（Webpack 5 移除 Node polyfill）
    └── 3.4 CI/CD 环境配置建议

阶段四：依赖全面升级与优化                预计 3 个工作日
    ├── 4.1 Babel 全家桶升级
    ├── 4.2 ESLint 工具链升级
    ├── 4.3 TypeScript 升级
    ├── 4.4 其他依赖升级
    └── 4.5 性能优化验证

总预计工期：12 个工作日
```

---

## 五、阶段一：Webpack 5 迁移

### 5.1 升级 webpack/webpack-cli 核心包

**目标版本：**
- `webpack`: 4.42.1 → **5.98.0**（最新稳定版）
- 新增 `webpack-cli`: **^6.0.1**（Webpack 5 推荐）

**操作步骤：**

```bash
npm uninstall webpack
npm install webpack@^5.98.0 webpack-cli@^6.0.1
```

**关键变更点：**

1. **`lib/config/webpack.config.base.js`** — resolve 配置调整：
   ```javascript
   // 旧配置
   resolve: {
       extensions: ['.mjs', '.web.js', '.js', '.json', '.web.jsx', '.jsx', '.ts', 'tsx'],
       mainFields: ['module', 'jsnext:main', 'browser', 'main'],
   }

   // 新配置
   resolve: {
       extensions: ['.mjs', '.web.js', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
       // Webpack 5 默认 mainFields 已优化，保留即可
       mainFields: ['browser', 'module', 'main'],
   }
   ```
   注意：`extensions` 中 `'tsx'` 需要修复为 `'.tsx'`（当前缺少前导点号）。

2. **output 配置调整：**
   ```javascript
   output: {
       // Webpack 5 新增 clean 选项替代 removeOutputDir
       clean: options.remove ? true : false,
       // 保持现有 path/filename 配置
       path: pathConfig.appDist,
       filename: `${pathConfig.jsDir}/${createOuputFileName('js', chunkhash)}`,
       chunkFilename: `${pathConfig.jsDir}/${createOuputFileName('jschunk', chunkhash)}`,
       publicPath: process.env.OMG_ENV == 'server' ? '/' : `${pathConfig.appDist}/`,
       pathinfo: false,
       // Webpack 5 新增
       assetModuleFilename: `${pathConfig.imagesDir}/[name].[hash:8][ext]`,
   }
   ```

3. **optimization 配置调整（`lib/utils/createWebpackConfigSplitChunks.js`）：**
   ```javascript
   // Webpack 5 中 automaticNameDelimiter 已重命名为 automaticNameDelimiter（无变化）
   // 但 name: true 在 Webpack 5 中已不再推荐，建议移除
   splitChunks: {
       chunks: 'initial',
       minChunks: 2,
       maxAsyncRequests: 8,
       maxInitialRequests: 6,
       minSize: 30000,
       // 移除 name: true，使用自动命名
       cacheGroups: {
           babel: { /* 保持不变 */ },
           react: { /* 保持不变 */ },
           vendors: { /* 保持不变 */ },
           default: { /* 保持不变 */ }
       }
   }
   ```

### 5.2 替换不兼容插件

#### 5.2.1 hard-source-webpack-plugin → Webpack 5 内置持久化缓存

**影响文件：** `lib/utils/getWebpackConfig.js`（第 54-84 行）

**迁移方案：**

```javascript
// ===== 删除 =====
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

// ===== 替换为 Webpack 5 内置缓存 =====
// 在 webpack.config.base.js 中添加：
module.exports = function getWebpackBaseConfig(buildPath, options) {
    const config = {
        // ...
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename],
            },
            cacheDirectory: path.join(pathConfig.appCacheDir, 'webpack5'),
            version: pkg.version,
        },
        // ...
    };
};
```

**同时修改 `lib/utils/getWebpackConfig.js`：**
- 删除第 6 行：`const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')`
- 删除第 54-84 行的 `HardSourceWebpackPlugin` 实例化代码块
- 可移除 `node-object-hash` 依赖（仅被 HardSource 使用）

**收益：** Webpack 5 持久化缓存比 hard-source 更稳定，首次构建后二次构建速度提升 60-80%。

#### 5.2.2 optimize-css-assets-webpack-plugin → css-minimizer-webpack-plugin

**影响文件：** `lib/modules/style.js`（第 72-84 行）

**迁移方案：**

```javascript
// ===== 删除 =====
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const safePostCssParser = require('postcss-safe-parser');

// ===== 替换 =====
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// 在 production 环境下：
if (config.mode == 'production') {
    config.optimization.minimizer = config.optimization.minimizer || [];
    config.optimization.minimizer.push(
        new CssMinimizerPlugin({
            minimizerOptions: {
                preset: ['default', { discardComments: { removeAll: true } }],
            },
        })
    );
}
```

**注意：** `css-minimizer-webpack-plugin` 应放在 `optimization.minimizer` 中，而非 `plugins` 数组。

#### 5.2.3 terser-webpack-plugin 升级

**影响文件：** `lib/utils/createTerserPlugin.js`

**迁移方案：**

```javascript
// 升级到 terser-webpack-plugin@^5.3.0
const TerserPlugin = require('terser-webpack-plugin');

// Webpack 5 中 terser-webpack-plugin 配置调整：
new TerserPlugin({
    parallel: true,
    extractComments: false,
    terserOptions: {
        parse: { ecma: 8 },
        compress: {
            drop_console: false,
            drop_debugger: true,
            ecma: 5,
            comparisons: false,
            warnings: false,
            inline: 2,
            collapse_vars: true,
            reduce_vars: true,
        },
        mangle: { safari10: true },
        output: {
            ecma: 5,
            ascii_only: true,
            beautify: false,
            comments: false,
            safari10: true,
        },
    },
})
// 注意：cache 选项在 v5 中已移除（由 Webpack 5 持久化缓存接管）
```

#### 5.2.4 webpack-jarvis 处理

**影响文件：** `lib/utils/getWebpackConfig.js`（第 87-96 行）

**迁移方案：** webpack-jarvis 已停止维护且不兼容 Webpack 5。

- 方案一（推荐）：移除 jarvis 功能，用户可使用 `webpack-bundle-analyzer` 替代
- 方案二：替换为 `webpack-dashboard`

```javascript
// 删除 webpack-jarvis 相关代码
// 从 package.json 中移除 webpack-jarvis 依赖
```

### 5.3 资源模块迁移（Asset Modules）

**影响文件：** `lib/rulesLoaders/image.loader.js`, `lib/modules/images.js`, `lib/modules/font.js`

**迁移方案：** Webpack 5 内置 Asset Modules 替代 file-loader 和 url-loader。

```javascript
// ===== 旧配置（file-loader） =====
{
    test: /\.(eot|woff|woff2|ttf|svg)$/,
    use: [{
        loader: 'file-loader',
        options: { name: '[name].[hash:8].[ext]', outputPath: 'fonts/' }
    }]
}

// ===== 新配置（Asset Modules） =====
{
    test: /\.(eot|woff|woff2|ttf)$/,
    type: 'asset/resource',
    generator: {
        filename: 'fonts/[name].[hash:8][ext]',
    },
}

// ===== 旧配置（url-loader） =====
{
    test: /\.(png|jpe?g|gif|webp)$/i,
    use: [{
        loader: 'url-loader',
        options: { limit: 8192, name: '[name].[hash:8].[ext]', outputPath: 'images/' }
    }]
}

// ===== 新配置（Asset Modules） =====
{
    test: /\.(png|jpe?g|gif|webp)$/i,
    type: 'asset',
    parser: {
        dataUrlCondition: { maxSize: 8 * 1024 },
    },
    generator: {
        filename: 'images/[name].[hash:8][ext]',
    },
}
```

**可移除的依赖：** `file-loader`, `url-loader`

### 5.4 迁移 webpack-dev-server 4.x

**目标版本：** webpack-dev-server@^4.15.0

**影响文件：** `lib/script/server.js`, `lib/utils/createWebpackDevServerConfig.js`

**关键 API 变更：**

```javascript
// ===== 旧配置 (v3) =====
const DEFAULT_DEV_SERVER_CONFIG = {
    host: '0.0.0.0',
    port: 9527,
    https: false,
    contentBase: pathConfig.appDist,    // ← 已移除
    stats: 'none',                       // ← 已移除
};

// ===== 新配置 (v4) =====
const DEFAULT_DEV_SERVER_CONFIG = {
    host: '0.0.0.0',
    port: 'auto',                        // 或保持 9527
    https: false,
    static: {                            // 替代 contentBase
        directory: pathConfig.appDist,
        publicPath: '/',
    },
    client: {
        logging: 'none',                 // 替代 stats
    },
    devMiddleware: {
        stats: 'none',
    },
    webSocketServer: 'ws',
};
```

**server.js 启动方式变更：**

```javascript
// ===== 旧方式 (v3) =====
const server = new webpackDevServer(compiler, devServer);
server.listen(port, host, callback);

// ===== 新方式 (v4) =====
const server = new webpackDevServer(devServer, compiler);
await server.start();
// 或指定端口
await server.startPortCallback(port, callback);
```

**注意：** 构造函数参数顺序在 v4 中发生了反转（config 在前，compiler 在后）。

### 5.5 Webpack 5 Node.js Polyfill 策略

Webpack 5 不再自动注入 Node.js 核心模块的 polyfill。需要评估项目是否使用了以下模块：

```javascript
// 如果用户的代码中使用了 Node.js 内置模块，需要在配置中添加：
resolve: {
    fallback: {
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
    },
},
// 并注入全局变量
plugins: [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
    }),
],
```

**当前项目评估：** omg-rc-cli 作为 CLI 工具在 Node.js 环境运行，其构建产物的目标环境是浏览器。如果用户的业务代码未直接引用 Node 模块，则无需添加 polyfill。但应在 `webpack.config.base.js` 中预留 `resolve.fallback` 配置点。

### 5.6 阶段一验收标准

- [ ] `omg build` 命令可正常执行，产出与之前结构一致的 dist 目录
- [ ] `omg publish` 命令可正常执行，生产模式构建成功
- [ ] `omg server` 开发服务器可正常启动并支持热更新
- [ ] `omg watch` 监听模式可正常工作
- [ ] 持久化缓存生效（二次构建速度提升 >50%）
- [ ] 所有 example 示例可正常构建
- [ ] 无 Webpack deprecation warnings

---

## 六、阶段二：node-sass → Dart Sass 替换

### 6.1 依赖替换

```bash
# 移除 node-sass
npm uninstall node-sass

# 安装 Dart Sass（纯 JS 实现，无需原生编译）
npm install sass@^1.83.0

# 升级 sass-loader（需 ^10.x 以支持 Dart Sass + Webpack 5）
npm install sass-loader@^14.0.0
```

### 6.2 sass-loader 配置迁移

**影响文件：** `lib/rulesLoaders/style.loader.js`

```javascript
// ===== 旧配置 =====
const SASS_LOADER_OPTION = {
    sassOptions: {
        outputStyle: 'compressed',  // node-sass 特有选项
    }
};

// ===== 新配置（Dart Sass） =====
const SASS_LOADER_OPTION = {
    // Dart Sass 使用 api: 'modern-compiler' 获得最佳性能
    api: 'modern-compiler',
    sassOptions: {
        // 移除 outputStyle（由 Webpack 生产模式压缩处理）
        // 静默依赖警告
        silenceDeprecations: ['legacy-js-api'],
    },
    // 使用新式 sass-options 格式
    sourceMap: true,
};
```

### 6.3 语法差异处理

#### 6.3.1 除法运算符

```scss
// 旧语法（node-sass 支持）
$width: 100px / 2;

// 新语法（Dart Sass 要求）
$width: math.div(100px, 2);
// 或
$width: (100px / 2);  // 保留括号也可
```

**需要在 `sassOptions` 中添加：**

```javascript
sassOptions: {
    // 允许使用 / 作为除法运算符（兼容旧代码）
    // 但建议逐步迁移到 math.div()
    quietDeps: true,
}
```

#### 6.3.2 颜色函数

```scss
// 已废弃的 color 函数
// node-sass 支持，Dart Sass 需使用 @use 'sass:color'
$color: lighten(#000, 10%);

// Dart Sass 推荐写法
@use 'sass:color';
$color: color.adjust(#000, $lightness: 10%);
```

#### 6.3.3 @import → @use / @forward

Dart Sass 仍然支持 `@import`，但在未来的 Major 版本中将被移除。建议：

- **本次升级不强制要求**迁移 `@import` 到 `@use`
- 在配置中开启 `silenceDeprecations` 静默相关警告
- 后续版本逐步引导用户迁移

```javascript
sassOptions: {
    silenceDeprecations: ['import'],
    quietDeps: true,  // 静默第三方库的废弃警告
}
```

### 6.4 构建脚本调整

**package.json 变更：**

```diff
dependencies:
-   "node-sass": "4.13.1",
-   "sass-loader": "7.3.1",
+   "sass": "^1.83.0",
+   "sass-loader": "^14.0.0",
```

**example/package.json 同步变更：**

```diff
-   "node-sass": "^4.12.0"
+   "sass": "^1.83.0"
```

### 6.5 性能对比

| 指标 | node-sass 4.x | Dart Sass (sass) |
|------|---------------|-------------------|
| 安装方式 | 需编译原生模块 | 纯 JS，npm install 即可 |
| Node 18+ 兼容 | 需要特定构建工具 | 完全兼容 |
| 编译速度 | 较快（C++） | 略慢（JS）但差距缩小 |
| 跨平台 | 常见编译失败 | 无平台问题 |
| 维护状态 | 已停止维护 | 活跃维护 |

### 6.6 阶段二验收标准

- [ ] `npm install` 在 Node.js 18/20/22 下无需额外编译工具即可成功
- [ ] SCSS 文件可正常编译，产出 CSS 与升级前功能一致
- [ ] CSS Modules（`.module.scss`）正常工作
- [ ] PostCSS + Autoprefixer 仍然生效
- [ ] 热更新模式下样式修改可实时反映
- [ ] 无 node-sass 相关的废弃警告
- [ ] example 项目中 `scss-example` 构建正常

---

## 七、阶段三：Node.js 18+ 兼容性保障

### 7.1 全量依赖兼容性检查

需要逐个确认以下依赖在 Node.js 18/20/22 下的兼容性：

| 依赖 | 当前版本 | Node 18 | Node 20 | Node 22 | 操作 |
|------|---------|---------|---------|---------|------|
| glob | 7.1.6 | ⚠️ 废弃回调 API | ⚠️ | ❌ | 升级到 ^11.0.0 |
| handlebars | 4.2.0 | ✅ | ⚠️ | ⚠️ | 升级到 ^4.7.8 |
| svg-sprite-loader | 4.2.1 | ✅ | ✅ | ⚠️ | 升级到 ^6.0.0 |
| image-webpack-loader | 6.0.0 | ⚠️ | ⚠️ | ⚠️ | 升级到 ^8.0.0 |
| react-hot-loader | 4.12.20 | ✅ | ✅ | ✅ | 可选升级到 React Refresh |
| node-notifier | 6.0.0 | ⚠️ | ⚠️ | ⚠️ | 升级到 ^10.0.0 |

### 7.2 glob 升级（关键）

**影响范围：** `lib/utils/getWebpackEentry.js` 及其他使用 glob 的文件

```bash
npm uninstall glob
npm install glob@^11.0.0
```

**API 变更：**

```javascript
// ===== 旧 API (glob 7.x) =====
const glob = require('glob');
glob('**/*.js', (err, files) => { /* ... */ });

// ===== 新 API (glob 11.x) =====
const { glob } = require('glob');
// 或
const { globSync } = require('glob');
const files = globSync('**/*.js');
// 异步
const files = await glob('**/*.js');
```

### 7.3 Polyfill 更新策略

Webpack 5 移除了自动 Node.js polyfill。需要在 `webpack.config.base.js` 中提供可选的 polyfill 配置：

```javascript
// webpack.config.base.js
const config = {
    resolve: {
        // 为用户代码提供可选的 polyfill
        fallback: {
            // 默认全部为 false，不注入 polyfill
            // 用户可在 omg.config.js 中覆盖此配置
        }
    },
};
```

在 `mergeOMGConfig.js` 中支持用户自定义 fallback：

```javascript
// 如果用户的 omg.config.js 中配置了 resolve.fallback，合并到配置中
if (customConfig.resolve && customConfig.resolve.fallback) {
    webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        ...customConfig.resolve.fallback,
    };
}
```

### 7.4 engine 字段设置

在 `package.json` 中声明 Node.js 版本要求：

```json
{
    "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
    }
}
```

### 7.5 CI/CD 环境配置建议

```yaml
# GitHub Actions 示例
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build
```

### 7.6 阶段三验收标准

- [ ] `npm install` 在 Node 18/20/22 下无 error
- [ ] `omg build/publish/server/watch` 在 Node 18/20/22 下均可正常运行
- [ ] 无 `DEP0XXX` 弃用警告
- [ ] glob API 迁移完成，异步和同步模式均可正常工作
- [ ] engine 字段正确声明

---

## 八、阶段四：依赖全面升级与优化

### 8.1 Babel 全家桶升级

**目标版本：** Babel 7.26.x（保持 7.x Major 版本）

```bash
npm install @babel/core@^7.26.0 @babel/preset-env@^7.26.0 @babel/preset-react@^7.26.0 \
    @babel/preset-typescript@^7.26.0 @babel/plugin-transform-runtime@^7.26.0 \
    @babel/runtime@^7.26.0 @babel/runtime-corejs3@^7.26.0 \
    babel-loader@^9.2.0
```

**移除已内置的 Babel 插件：**

```bash
# 以下插件功能已内置到 @babel/preset-env 和 @babel/preset-react 中
npm uninstall @babel/plugin-proposal-class-properties \
    @babel/plugin-proposal-decorators \
    @babel/plugin-syntax-dynamic-import
```

**注意：** 如需保留装饰器支持，应使用 `@babel/plugin-proposal-decorators` 的最新版本，但语法需调整：

```javascript
// babel 配置中
plugins: [
    ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
    // class-properties 现在由 @babel/preset-env 处理
],
```

### 8.2 ESLint 工具链升级

**替换 eslint-loader → eslint-webpack-plugin**

```bash
npm uninstall eslint-loader eslint-friendly-formatter
npm install eslint-webpack-plugin@^4.2.0 eslint@^8.56.0
```

**影响文件：** `lib/utils/createEslintConfig.js`

```javascript
// ===== 旧方式 (eslint-loader) =====
{
    enforce: 'pre',
    test: /\.(js|jsx|ts|tsx)$/,
    use: [{
        loader: 'eslint-loader',
        options: { formatter: 'eslint-friendly-formatter' }
    }]
}

// ===== 新方式 (eslint-webpack-plugin) =====
const ESLintPlugin = require('eslint-webpack-plugin');

// 在 plugins 中添加
config.plugins.push(
    new ESLintPlugin({
        context: pathConfig.appSrc,
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        cache: true,
        failOnError: false,
    })
);
```

### 8.3 TypeScript 升级

```bash
npm install typescript@^5.7.0 ts-loader@^9.5.0
```

**注意：** TypeScript 5.x 有一些配置变更：
- `tsconfig.json` 中 `importsNotUsedAsValues` 已被 `verbatimModuleSyntax` 替代
- 建议用户更新 `tsconfig.json`，但 CLI 不强制要求

### 8.4 其他关键依赖升级

```bash
# CSS 处理链升级
npm install css-loader@^7.1.0 style-loader@^4.0.0 postcss-loader@^8.1.0 \
    autoprefixer@^10.4.0 postcss@^8.4.0

# 图片处理
npm install image-webpack-loader@^8.1.0

# SVG 处理
npm install svg-sprite-loader@^6.0.0 svgo@^3.3.0 svgo-loader@^4.0.0 \
    svg-url-loader@^3.0.0

# 开发体验
npm install mini-css-extract-plugin@^2.9.0 friendly-errors-webpack-plugin@^1.2.0 \
    webpackbar@^6.0.0

# CLI 相关
npm install commander@^13.0.0
npm install thread-loader@^4.0.0

# 工具库
npm install handlebars@^4.7.8 handlebars-loader@^1.7.0

# 移除不再需要的依赖
npm uninstall file-loader url-loader hard-source-webpack-plugin \
    node-object-hash node-sass optimize-css-assets-webpack-plugin \
    postcss-safe-parser eslint-loader eslint-friendly-formatter \
    webpack-jarvis
```

### 8.5 postcss-loader 配置迁移

**影响文件：** `lib/rulesLoaders/style.loader.js`

```javascript
// ===== 旧配置 (postcss-loader 3.x) =====
{
    loader: 'postcss-loader',
    options: {
        ident: 'postcss',
        plugins: [autoprefixer(options)]
    }
}

// ===== 新配置 (postcss-loader 8.x) =====
{
    loader: 'postcss-loader',
    options: {
        postcssOptions: {
            plugins: [
                ['autoprefixer', { overrideBrowserslist: browserslist }]
            ],
        },
    }
}
```

### 8.6 阶段四验收标准

- [ ] 所有依赖升级到目标版本，无已知安全漏洞
- [ ] Babel 编译 ES6+、JSX、TypeScript 均正常
- [ ] ESLint 插件正常工作
- [ ] 图片压缩、SVG 处理、字体加载均正常
- [ ] Handlebars 模板编译正常
- [ ] thread-loader 多线程编译正常
- [ ] 无 npm audit critical/high 级别漏洞

---

## 九、风险评估与回滚方案

### 9.1 风险矩阵

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Webpack 5 配置差异导致构建失败 | 高 | 高 | 逐文件迁移，每次修改后立即验证 |
| 第三方 loader 不兼容 Webpack 5 | 中 | 高 | 提前查阅兼容性矩阵，准备替代方案 |
| Dart Sass 语法差异影响用户项目 | 中 | 中 | 开启兼容模式，静默废弃警告 |
| webpack-dev-server 4.x API 变更大 | 高 | 中 | 完整重写 server 启动逻辑 |
| glob API 变更导致入口解析失败 | 中 | 中 | 全文搜索 glob 使用并逐一修改 |
| 持久化缓存导致构建异常 | 低 | 低 | 提供 cache: false 配置选项 |
| 用户项目 omg.config.js 不兼容 | 低 | 高 | 做好配置合并测试，保持向后兼容 |
| 性能回归（构建速度变慢） | 低 | 中 | 升级后做性能基准测试对比 |

### 9.2 回滚方案

**方案一：Git 分支隔离**
- 在 `v2` 分支上进行所有升级工作
- 保留 `master` 分支为 1.x 稳定版本
- 如遇重大问题可随时回退到 master

**方案二：SemVer 版本隔离**
- 升级后发布为 `2.0.0`
- `1.x` 维护分支保留为 `1.1.x`
- 用户可选择 `omg-rc-cli@1.x` 或 `omg-rc-cli@2.x`

**方案三：特性开关**
```javascript
// omg.config.js 中可选配置
module.exports = {
    omg: {
        // 允许用户降级到旧行为
        legacyCache: false,    // true = 使用旧缓存策略
        legacyAsset: false,    // true = 使用 file-loader/url-loader
    }
};
```

### 9.3 回滚触发条件

- 构建 P0 级别 Bug（构建失败、产出错误）且 24 小时内无法修复
- 性能回退超过 30%（构建时间增加）
- 用户项目大规模报告兼容性问题

---

## 十、测试策略

### 10.1 测试层级

```
Level 1：单元验证（每个阶段完成后）
    ├── 依赖安装测试（Node 18/20/22）
    ├── 构建命令功能测试
    └── 插件功能验证

Level 2：集成验证（全量升级完成后）
    ├── example 全量示例构建
    ├── 开发服务器完整功能
    └── 生产构建产出验证

Level 3：回归验证
    ├── 产出文件对比（升级前后）
    ├── 性能基准测试
    └── 兼容性矩阵测试
```

### 10.2 测试用例清单

#### 10.2.1 构建命令测试

| # | 测试场景 | 命令 | 预期结果 |
|---|---------|------|---------|
| T1 | 默认构建 | `omg build` | dist 目录生成，文件结构正确 |
| T2 | 指定目录构建 | `omg build src/react-example` | 仅构建指定目录 |
| T3 | 指定文件构建 | `omg build -t react-example` | 仅构建指定入口 |
| T4 | 清除输出 | `omg build -r` | 构建前清除 dist 目录 |
| T5 | 生产发布 | `omg publish` | 压缩、hash、代码分割 |
| T6 | 监听模式 | `omg watch` | 文件修改后自动重新构建 |
| T7 | 开发服务器 | `omg server` | 启动 dev server，支持热更新 |

#### 10.2.2 功能测试

| # | 测试场景 | 预期结果 |
|---|---------|---------|
| T8 | CSS 处理 | CSS 文件正确提取和压缩 |
| T9 | SCSS 处理 | SCSS 编译正确，变量、mixin 正常工作 |
| T10 | CSS Modules | `.module.css` 和 `.module.scss` 正确生成局部类名 |
| T11 | 图片处理 | 图片正确复制/hash/压缩，小图 base64 内联 |
| T12 | SVG 处理 | SVG sprite/url/inline 模式均正常 |
| T13 | 字体处理 | 字体文件正确复制和引用 |
| T14 | TypeScript | TS/TSX 文件正确编译 |
| T15 | Handlebars | HBS 模板正确编译 |
| T16 | 代码分割 | vendors/react-runtime/core-js chunk 正确生成 |
| T17 | Tree Shaking | 未使用的导出被正确移除 |
| T18 | 热更新 | CSS/JS 修改后浏览器自动更新 |
| T19 | 持久化缓存 | 二次构建速度显著提升 |
| T20 | Bundle Analyzer | analyzer 配置开启后可查看包分析 |
| T21 | Source Map | 开发模式 source map 正确生成 |
| T22 | ESLint | lint 错误正确报告 |

#### 10.2.3 兼容性测试矩阵

| Node.js 版本 | npm install | omg build | omg publish | omg server |
|-------------|-------------|-----------|-------------|------------|
| 18.x | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| 20.x | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| 22.x | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |

### 10.3 性能基准测试

```bash
# 升级前（在 master 分支）
time omg publish           # 记录首次构建时间
time omg publish           # 记录二次构建时间（有缓存）

# 升级后（在 v2 分支）
time omg publish           # 记录首次构建时间
time omg publish           # 记录二次构建时间（Webpack 5 持久化缓存）
```

**成功指标：**
- 首次构建时间不超过升级前的 110%
- 缓存构建时间较升级前提升 ≥50%
- 产出文件大小差异不超过 ±5%

---

## 十一、时间节点安排

### 11.1 详细排期

| 阶段 | 日期 | 工作日 | 任务 | 产出 |
|------|------|--------|------|------|
| **阶段一** | **Day 1-5** | **5 天** | **Webpack 5 迁移** | |
| 1.1 | Day 1 | 1 天 | 升级 webpack/webpack-cli 核心包，修复基础配置 | webpack 5 基础构建可用 |
| 1.2 | Day 2 | 1 天 | 替换 HardSource → 内置缓存，替换 OptimizeCSS → CssMinimizer | 核心插件替换完成 |
| 1.3 | Day 3 | 1 天 | 迁移资源模块（Asset Modules），移除 file-loader/url-loader | 资源处理迁移完成 |
| 1.4 | Day 4 | 1 天 | 迁移 webpack-dev-server 4.x，修复 server 启动逻辑 | dev server 可正常启动 |
| 1.5 | Day 5 | 1 天 | 集成测试，修复遗留问题，移除 webpack-jarvis | 阶段一全部验收通过 |
| | Day 6 | 1 天 | **阶段一验收 + 代码审查** | **阶段一里程碑** |
| **阶段二** | **Day 7-8** | **2 天** | **Dart Sass 替换** | |
| 2.1 | Day 7 上午 | 0.5 天 | 替换依赖包，迁移 sass-loader 配置 | Dart Sass 基础可用 |
| 2.2 | Day 7 下午 | 0.5 天 | 处理语法差异，配置兼容选项 | SCSS 编译全部通过 |
| 2.3 | Day 8 | 1 天 | 测试所有 SCSS 示例，调整构建脚本 | 阶段二全部验收通过 |
| | Day 9 | 1 天 | **阶段二验收** | **阶段二里程碑** |
| **阶段三** | **Day 10-11** | **2 天** | **Node.js 18+ 兼容性** | |
| 3.1 | Day 10 | 1 天 | 全量依赖兼容性检查，glob 等 API 迁移 | 依赖兼容性修复完成 |
| 3.2 | Day 11 | 1 天 | Node 18/20/22 全矩阵测试，engine 字段设置 | 多版本测试通过 |
| | Day 12 | 1 天 | **阶段三验收** | **阶段三里程碑** |
| **阶段四** | **Day 13-15** | **3 天** | **依赖全面升级** | |
| 4.1 | Day 13 | 1 天 | Babel + ESLint 工具链升级 | 编译/Lint 工具链完成 |
| 4.2 | Day 14 | 1 天 | TypeScript + CSS 处理链 + 其他依赖升级 | 所有依赖升级完成 |
| 4.3 | Day 15 | 1 天 | 性能基准测试，全量回归测试 | 性能和功能验证通过 |
| | Day 16 | 1 天 | **最终验收 + 文档更新** | **2.0.0 发布就绪** |

### 11.2 里程碑

| 里程碑 | 日期 | 标志 |
|--------|------|------|
| M1：Webpack 5 可用 | Day 6 | `omg build/publish/server` 基于 Webpack 5 正常工作 |
| M2：Dart Sass 可用 | Day 9 | SCSS 编译不再依赖 node-sass |
| M3：Node 18+ 兼容 | Day 12 | Node 18/20/22 全部通过测试 |
| M4：2.0 发布就绪 | Day 16 | 全部验收标准通过，文档更新完成 |

---

## 附录A：完整依赖升级映射表

| 包名 | 旧版本 | 新版本 | 操作 | 变更类型 |
|------|--------|--------|------|---------|
| webpack | 4.42.1 | ^5.98.0 | 升级 | Major |
| webpack-cli | - | ^6.0.1 | 新增 | 新增 |
| webpack-dev-server | 3.10.3 | ^4.15.0 | 升级 | Major |
| node-sass | 4.13.1 | - | 移除 | 移除 |
| sass | - | ^1.83.0 | 新增 | 新增 |
| sass-loader | 7.3.1 | ^14.0.0 | 升级 | Major |
| hard-source-webpack-plugin | 0.13.1 | - | 移除 | 移除 |
| node-object-hash | 2.0.0 | - | 移除 | 移除 |
| optimize-css-assets-webpack-plugin | 5.0.3 | - | 移除 | 移除 |
| postcss-safe-parser | 4.0.2 | - | 移除 | 移除 |
| css-minimizer-webpack-plugin | - | ^7.0.0 | 新增 | 新增 |
| terser-webpack-plugin | 2.3.5 | ^5.3.0 | 升级 | Major |
| file-loader | 5.1.0 | - | 移除 | 内置替代 |
| url-loader | 3.0.0 | - | 移除 | 内置替代 |
| css-loader | 3.4.2 | ^7.1.0 | 升级 | Major |
| style-loader | 1.1.3 | ^4.0.0 | 升级 | Major |
| postcss-loader | 3.0.0 | ^8.1.0 | 升级 | Major |
| autoprefixer | 9.7.4 | ^10.4.0 | 升级 | Major |
| postcss | - | ^8.4.0 | 新增 | 新增（peerDep） |
| mini-css-extract-plugin | 0.9.0 | ^2.9.0 | 升级 | Major |
| babel-loader | 8.1.0 | ^9.2.0 | 升级 | Major |
| @babel/core | 7.9.0 | ^7.26.0 | 升级 | Minor |
| @babel/preset-env | 7.9.0 | ^7.26.0 | 升级 | Minor |
| @babel/preset-react | 7.8.3 | ^7.26.0 | 升级 | Minor |
| @babel/preset-typescript | 7.8.3 | ^7.26.0 | 升级 | Minor |
| @babel/plugin-transform-runtime | 7.9.0 | ^7.26.0 | 升级 | Minor |
| @babel/runtime | 7.9.2 | ^7.26.0 | 升级 | Minor |
| @babel/runtime-corejs3 | 7.9.2 | ^7.26.0 | 升级 | Minor |
| @babel/plugin-proposal-class-properties | 7.8.3 | - | 移除 | 内置到 preset-env |
| @babel/plugin-proposal-decorators | 7.8.3 | - | 移除 | 内置到 preset-env |
| @babel/plugin-syntax-dynamic-import | 7.8.3 | - | 移除 | 内置到 preset-env |
| eslint | 6.8.0 | ^8.56.0 | 升级 | Major |
| eslint-loader | 3.0.3 | - | 移除 | 已废弃 |
| eslint-friendly-formatter | 4.0.1 | - | 移除 | 已废弃 |
| eslint-webpack-plugin | - | ^4.2.0 | 新增 | 新增 |
| typescript | 3.7.5 | ^5.7.0 | 升级 | Major |
| ts-loader | 6.2.1 | ^9.5.0 | 升级 | Major |
| glob | 7.1.6 | ^11.0.0 | 升级 | Major |
| commander | 4.1.1 | ^13.0.0 | 升级 | Major |
| handlebars | 4.2.0 | ^4.7.8 | 升级 | Minor |
| thread-loader | 2.1.3 | ^4.0.0 | 升级 | Major |
| svg-sprite-loader | 4.2.1 | ^6.0.0 | 升级 | Major |
| svgo | 1.3.2 | ^3.3.0 | 升级 | Major |
| svgo-loader | 2.2.1 | ^4.0.0 | 升级 | Major |
| svg-url-loader | 4.0.0 | ^3.0.0 | 升级（注意降级） | Major |
| image-webpack-loader | 6.0.0 | ^8.1.0 | 升级 | Major |
| node-notifier | 6.0.0 | ^10.0.0 | 升级 | Major |
| webpack-bundle-analyzer | ^3.7.0 | ^4.10.0 | 升级 | Major |
| webpackbar | 4.0.0 | ^6.0.0 | 升级 | Major |
| speed-measure-webpack-plugin | 1.3.3 | ^1.5.0 | 升级 | Minor |
| webpack-jarvis | 0.3.2 | - | 移除 | 不兼容 W5 |

---

## 附录B：破坏性变更速查表

### B.1 对 CLI 用户的影响

| 变更 | 影响 | 兼容策略 |
|------|------|---------|
| 移除 node-sass | 用户不需要安装 Python/Visual Studio | ✅ 无需操作 |
| 移除 webpack-jarvis | `jarvis: true` 配置失效 | ⚠️ 配置忽略即可 |
| Webpack 5 持久化缓存 | 新增 `.cache` 目录 | ✅ 自动管理 |
| Asset Modules | 图片/字体处理自动升级 | ✅ 无需操作 |
| ESLint 插件化 | Lint 行为更准确 | ✅ 无需操作 |

### B.2 对 omg.config.js 配置的影响

| 配置项 | 变更 | 兼容性 |
|--------|------|--------|
| `resolve.alias` | 无变化 | ✅ 完全兼容 |
| `devServer` | 部分选项名称变化 | ⚠️ 旧选项自动忽略 |
| `terser` | 配置格式变化 | ⚠️ 需更新配置格式 |
| `browserslist` | 无变化 | ✅ 完全兼容 |
| `analyzer` | 无变化 | ✅ 完全兼容 |
| `jarvis` | 已移除 | ⚠️ 配置忽略 |
| `loaderOpt` | loader 链格式可能变化 | ⚠️ 需验证 |

### B.3 对构建产出的影响

| 产出 | 变更 | 影响 |
|------|------|------|
| JS 文件名 | hash 算法变化 | ⚠️ hash 值会不同 |
| CSS 文件名 | hash 算法变化 | ⚠️ hash 值会不同 |
| chunk 分割 | 可能产生不同 chunk | ⚠️ 需验证 |
| Source Map | 格式可能变化 | ✅ 功能不变 |
| assets.json | 格式不变 | ✅ 完全兼容 |

---

## 附录C：验收标准清单

### C.1 功能验收

- [ ] `omg init` 可正常初始化项目
- [ ] `omg create` 可正常创建页面目录
- [ ] `omg build` 可正常执行开发构建
- [ ] `omg watch` 监听模式正常工作
- [ ] `omg server` 开发服务器可启动（Webpack 5 + dev-server 4）
- [ ] `omg publish` 生产构建正常（压缩、hash、代码分割）
- [ ] Node API (`index_node.js`) 可正常调用
- [ ] 所有 example 示例可正常构建

### C.2 性能验收

- [ ] 首次构建时间 ≤ 升级前 × 110%
- [ ] 缓存构建时间 ≤ 升级前 × 50%（提升 ≥50%）
- [ ] 产出文件大小差异 ≤ ±5%
- [ ] 开发服务器启动时间 ≤ 升级前 × 110%
- [ ] 热更新响应时间 ≤ 1s

### C.3 兼容性验收

- [ ] Node.js 18.x 全功能正常
- [ ] Node.js 20.x 全功能正常
- [ ] Node.js 22.x 全功能正常
- [ ] macOS 正常运行
- [ ] Windows 正常运行（如需支持）
- [ ] Linux 正常运行

### C.4 质量验收

- [ ] 无 `npm audit` critical/high 漏洞
- [ ] 无 Webpack deprecation warnings
- [ ] 无 node-sass 相关警告或错误
- [ ] 无 Node.js 弃用 API 警告
- [ ] package.json 无未使用依赖
- [ ] README.md 更新至 2.0 信息

### C.5 文档验收

- [ ] README.md 版本信息更新
- [ ] CHANGELOG.md 记录所有变更
- [ ] 升级指南文档（供用户参考）
- [ ] omg.config.js 新增/变更配置项说明

---

> **文档状态：** 待确认
> **下一步：** 确认计划后，按阶段顺序执行升级工作
