# 阶段一修复总结

> 执行日期：2026-04-22
> 状态：全部修复完成，构建验证通过

---

## 修复清单

### L1: omg-inject-html-webpack-plugin 升级 ✅

- **操作**: npm link 本地 v2.0.0（用户已修复 Webpack 5 兼容性）
- **新增依赖**: `html-webpack-plugin@^5.6.7`（v2.0.0 将其移为 peerDependency）
- **package.json 保持 `1.3.1`**（npm link 覆盖，发布时需改为 `^2.0.0`）

### L2: ESLint 从构建链路剥离 ✅

- **操作**: 从 `lib/modules/script.js` 移除 `eslint-webpack-plugin` 调用
- **删除依赖**: `eslint@^8.56.0`, `eslint-webpack-plugin@^4.2.0`
- **附带收益**: 从根本上解决了 `ajv@6` vs `ajv@8` 版本冲突
- **移除 overrides**: 不再需要 ajv-keywords 的 symlink workaround
- **用户迁移指引**: 通过独立 npm script 运行 eslint：
  ```bash
  npx eslint src/ --ext .js,.jsx,.ts,.tsx
  ```

### 非核心功能评估

| 功能 | 包名 | 决策 | 原因 |
|------|------|------|------|
| Emoji 输出 | node-emoji | ✅ 保留 | 功能正常，提升 CLI 体验 |
| Loading 动画 | ncnbb-io-spin | ✅ 保留 | 功能正常 |
| 桌面通知 | node-notifier | ✅ 保留 | 功能正常 |
| 友好错误 | friendly-errors-webpack-plugin | ✅ 保留 | 可正常工作 |
| 进度条 | webpack.ProgressPlugin | ✅ 替代 webpackbar | webpackbar@6 不兼容 W5 |
| 构建速度测量 | speed-measure-webpack-plugin | ✅ 保留 | 可选功能，不影响核心 |

---

## 构建验证结果

### omg build（开发模式）
```
✅ exit code: 0
✅ Compiled successfully in 2782ms
✅ 零错误零警告
✅ 产出 54 个文件（js/css/html/images/fonts/svg/ts）
```

### omg publish（生产模式）
```
✅ exit code: 0
✅ Compiled successfully in 3639ms
✅ CSS 压缩（css-minimizer-webpack-plugin）
✅ JS 压缩（terser-webpack-plugin@5）
✅ Webpack 5 持久化缓存生效
```

### 产出完整性检查
- ✅ JS: 16 个入口 + chunks（react-runtime, vendors, lazy-load）
- ✅ CSS: 9 个文件（含 chunk css）
- ✅ HTML: 16 个页面
- ✅ Images: 压缩后的图片资源
- ✅ Fonts: 字体文件
- ✅ SVG: SVG 资源
- ✅ TS: TypeScript 声明文件

---

## 依赖变更对比

| 操作 | 包 |
|------|-----|
| 移除 | eslint, eslint-webpack-plugin, webpackbar, hard-source-webpack-plugin, optimize-css-assets-webpack-plugin, postcss-safe-parser, node-object-hash, webpack-jarvis, file-loader, url-loader, eslint-loader, eslint-friendly-formatter, node-sass, @babel/plugin-syntax-dynamic-import |
| 新增 | css-minimizer-webpack-plugin, html-webpack-plugin, sass, webpack-cli, postcss |
| 升级 | webpack→5, webpack-dev-server→4, terser-webpack-plugin→5, commander→13, babel→7.26, typescript→5.7, 以及 30+ loader/plugin |

---

## 待发布注意事项

1. `omg-inject-html-webpack-plugin` 需先发布 v2.0.0 到 npm registry
2. 发布后 package.json 中版本改为 `"^2.0.0"`
3. example/package.json 中 `node-sass` 已替换为 `sass`
4. 建议发布前在 Node 20/22 下再次验证
