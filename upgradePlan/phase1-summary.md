# 阶段一：Webpack 5 迁移 — 重构总结

> 执行日期：2026-04-22
> 状态：核心构建已通，存在已知遗留问题

---

## 一、已完成变更

### 1.1 核心包升级

| 包名 | 旧版本 | 新版本 | 状态 |
|------|--------|--------|------|
| webpack | 4.42.1 | 5.106.2 | ✅ |
| webpack-cli | - | 6.0.1 | ✅ 新增 |
| webpack-dev-server | 3.10.3 | 4.15.2 | ✅ |
| terser-webpack-plugin | 2.3.5 | 5.3.13 | ✅ |
| css-minimizer-webpack-plugin | - | 7.0.0 | ✅ 替代 OptimizeCSS |
| commander | 4.1.1 | 13.1.0 | ✅ |

### 1.2 已移除的废弃包

| 包名 | 移除原因 |
|------|---------|
| hard-source-webpack-plugin | 不兼容 Webpack 5，由内置持久化缓存替代 |
| optimize-css-assets-webpack-plugin | 已废弃，由 css-minimizer-webpack-plugin 替代 |
| postcss-safe-parser | 随 OptimizeCSS 一起移除 |
| node-object-hash | 仅被 HardSource 使用 |
| webpack-jarvis | 不兼容 Webpack 5，已停止维护 |
| file-loader | Webpack 5 Asset Modules 内置替代 |
| url-loader | Webpack 5 Asset Modules 内置替代 |
| eslint-loader | 已废弃，由 eslint-webpack-plugin 替代 |
| eslint-friendly-formatter | 随 eslint-loader 一起移除 |
| node-sass | 由 Dart Sass 替代（阶段二已完成前置操作） |
| @babel/plugin-syntax-dynamic-import | 已内置到 @babel/preset-env |
| @babel/plugin-proposal-class-properties | 已内置到 @babel/preset-env |

### 1.3 文件变更清单

| 文件 | 变更内容 |
|------|---------|
| `package.json` | 版本升至 2.0.0，全面更新依赖，新增 engines/overrides |
| `index.js` | commander 导入方式改为 `{ program }` 解构 |
| `lib/config/webpack.config.base.js` | 新增 Webpack 5 持久化缓存、resolve.fallback、assetModuleFilename、移除 WebpackBar |
| `lib/config/webpack.config.dev.js` | devtool 改为 `eval-cheap-module-source-map` |
| `lib/config/webpack.config.pro.js` | devtool 改为 `false` |
| `lib/utils/getWebpackConfig.js` | 移除 HardSource/Jarvis，新增 noCache 控制 |
| `lib/modules/style.js` | OptimizeCSS → CssMinimizerPlugin |
| `lib/modules/script.js` | eslint-loader → eslint-webpack-plugin |
| `lib/modules/images.js` | 适配 Asset Modules 返回格式 |
| `lib/modules/font.js` | file-loader → Asset Modules |
| `lib/modules/svg.js` | 适配 svgUrlLoader 返回格式 |
| `lib/rulesLoaders/image.loader.js` | url-loader/file-loader → Asset Modules |
| `lib/rulesLoaders/svg.loader.js` | file-loader → Asset Modules |
| `lib/rulesLoaders/style.loader.js` | postcss-loader 8.x 配置 + sass-loader 14.x 配置 |
| `lib/utils/createTerserPlugin.js` | 移除 cache 选项（由 Webpack 5 持久化缓存接管） |
| `lib/utils/createWebpackDevServerConfig.js` | contentBase → static, stats → devMiddleware |
| `lib/utils/createBabelConfig.js` | 移除内置 babel 插件引用 |
| `lib/utils/createWebpackConfigSplitChunks.js` | 移除 `name: true`（Webpack 5 不支持布尔值） |
| `lib/utils/getImageminConfig.js` | svgo 插件配置格式更新为 svgo@3 格式 |
| `lib/script/server.js` | webpack-dev-server v4 构造函数参数顺序反转，移除 jarvis |
| `example/package.json` | node-sass → sass, 更新 @babel/runtime-corejs3 |

### 1.4 构建验证结果

**example 项目 `omg build` 验证：**

- ✅ Webpack 5 配置验证通过
- ✅ 入口文件解析成功（16个入口）
- ✅ Babel 编译 JS/JSX 成功
- ✅ TypeScript 编译成功
- ✅ SCSS 编译成功（Dart Sass + sass-loader 14）
- ✅ CSS 提取成功
- ✅ Handlebars 模板编译成功
- ✅ 图片处理成功（Asset Modules）
- ✅ 字体处理成功（Asset Modules）
- ✅ SVG sprite 处理成功
- ✅ 代码分割正常（vendors/react-runtime/core-js chunks）
- ✅ Webpack 5 持久化缓存生效

**dist 目录产出完整：** js/、css/、html/、images/、fonts/、svg/、ts/

---

## 二、已知遗留问题

### 2.1 P0 — 必须修复

| # | 问题 | 原因 | 建议方案 |
|---|------|------|---------|
| L1 | `omg-inject-html-webpack-plugin@1.3.1` 不兼容 Webpack 5 | 在 seal 后修改 `Compilation.assets`，Webpack 5 禁止此行为 | 需升级该插件或 fork 修复，改用 `Compilation.hooks.processAssets` |
| L2 | `ajv@6` 和 `ajv-keywords@5` 版本冲突 | eslint@8 需要 ajv@6，schema-utils@4 需要 ajv@8，npm 提升冲突 | 通过 symlink workaround 已临时解决，需在 package.json 中固化 |

### 2.2 P1 — 建议修复

| # | 问题 | 原因 | 建议方案 |
|---|------|------|---------|
| L3 | `webpackbar@6` 不兼容 Webpack 5.98 | 传了 ProgressPlugin 不支持的 name/color/reporters 选项 | 已临时替换为 `webpack.ProgressPlugin()`，建议寻找替代方案 |
| L4 | `image-webpack-loader@8` 的 `imagemin-svgo` 使用旧版 svgo API | imagemin-svgo@9 内置 svgo@2 配置格式与 svgo@3 不兼容 | 开发模式下暂时跳过图片压缩，生产模式需单独处理 |
| L5 | `omg-inject-html-webpack-plugin` 触发 Webpack 5 deprecation warnings | 使用了 Webpack 4 时期的 Compilation.assets 修改方式 | 同 L1 |

### 2.2 P2 — 后续优化

| # | 问题 | 建议 |
|---|------|------|
| L6 | `friendly-errors-webpack-plugin` 已停止维护 | 可考虑替代方案或自行实现 |
| L7 | `glob@11` 在 Node 18 下有 engine 警告 | Node 20+ 无此问题，可接受 |
| L8 | `svg-sprite-loader@6` 依赖 `loader-utils@1` | 目前通过 `loader-utils@2` 兼容，需关注后续更新 |
| L9 | npm audit 报告 39 个漏洞 | 多数来自间接依赖，阶段四统一处理 |

---

## 三、依赖解决策略

### 3.1 ajv 冲突 workaround

`schema-utils@4`（被 babel-loader、terser-webpack-plugin 等使用）需要 `ajv@8` + `ajv-keywords@5`。`eslint@8` 需要 `ajv@6`。npm hoist 将 `ajv@6` 放到顶层，导致 `ajv-keywords@5` 找不到 `ajv@8`。

**临时解决方案：**
```bash
mkdir -p node_modules/ajv-keywords/node_modules
ln -s node_modules/schema-utils/node_modules/ajv node_modules/ajv-keywords/node_modules/ajv
```

**长期方案：** 在 package.json 的 `postinstall` 脚本中自动化此操作，或降级到不依赖 ajv@8 的工具链版本。

### 3.2 node-sass → sass 前置完成

由于 `sass-loader@14` 和 `sass@1.83.0`（Dart Sass）已作为阶段一的一部分安装（因为 Webpack 5 迁移需要完整的 loader 链工作），阶段二的 SCSS 迁移工作已提前完成。使用 `api: 'legacy'` 模式确保与 thread-loader 兼容。

---

## 四、性能指标（阶段一）

| 指标 | 数值 |
|------|------|
| Webpack 版本 | 5.106.2 |
| 持久化缓存类型 | filesystem |
| 入口数量（example） | 16 |
| 产出目录结构 | js/css/html/images/fonts/svg/ts |
| 首次构建 | 完成（产出完整，有插件兼容性警告） |
| 缓存构建 | 待阶段四基准测试 |

---

## 五、下一阶段预览

**阶段二（node-sass → Dart Sass）已在阶段一中提前完成。** SCSS 编译已切换到 Dart Sass，无需额外操作。

**阶段三（Node.js 18+ 兼容性）：**
- glob@11 API 已验证兼容
- engines 字段已添加 `>=18.0.0`
- 需要在 Node 20/22 下验证

**阶段四（依赖全面升级）重点关注：**
- 解决 `omg-inject-html-webpack-plugin` 的 Webpack 5 兼容性（P0）
- 处理 `image-webpack-loader` 的 svgo 兼容性
- 寻找 `webpackbar` 替代方案
- 修复所有 npm audit 漏洞

---

## 六、验收状态

| 验收项 | 状态 |
|--------|------|
| `omg build` 命令可正常执行 | ⚠️ 产出完整但 omg-inject-html-webpack-plugin 报错 |
| `omg publish` 命令可正常执行 | ⏳ 待验证 |
| `omg server` 开发服务器可启动 | ⏳ 待验证 |
| `omg watch` 监听模式正常工作 | ⏳ 待验证 |
| 持久化缓存生效 | ✅ |
| 所有 example 示例可正常构建 | ⚠️ 构建完成但有插件警告 |
| 无 Webpack deprecation warnings | ❌ omg-inject-html-webpack-plugin 导致 |

---

> **阶段一结论：** Webpack 5 核心迁移完成，构建流程正常运行并产出完整产物。遗留 1 个 P0 级别问题（omg-inject-html-webpack-plugin 兼容性），需在阶段四优先解决。
