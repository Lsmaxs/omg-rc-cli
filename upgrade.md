# omg-rc-cli v2.0 升级指南

> 适用对象：使用 omg-rc-cli 的业务项目开发者
> 最后更新：2026-04-22

---

## 一、升级前准备

### 环境要求

| 依赖 | 最低版本 |
|------|---------|
| Node.js | >= 18 |
| npm | >= 8 |

确认当前版本：

```bash
node -v   # 应为 v18.x 或更高
npm -v    # 应为 8.x 或更高
```

### 备份

升级前建议确认当前工作区无未提交的重要变更：

```bash
git status
```

---

## 二、升级步骤

### 步骤 1：更新 package.json

在项目 `package.json` 中修改以下依赖：

#### 1.1 升级 `@babel/runtime-corejs3`

```diff
  "dependencies": {
-   "@babel/runtime-corejs3": "^7.9.2",
+   "@babel/runtime-corejs3": "^7.29.2",
```

> **原因**：omg-rc-cli v2.0 内部 Babel 升级到了 7.26+，运行时依赖 `@babel/runtime-corejs3` 需同步更新，否则 CLI 启动时会自动尝试安装并报错。

#### 1.2 添加 `ajv@^8.18.0`

在 `dependencies` 中添加：

```diff
  "dependencies": {
+   "ajv": "^8.18.0",
```

> **原因**：omg-rc-cli v2.0 使用的 `babel-loader@9` → `schema-utils@4` → `ajv-keywords@5` 需要 `ajv@^8`。如果项目中有旧依赖（如 `eslint@4`）把 `ajv@5` 提升到了 `node_modules` 顶层，会导致 `ajv-keywords@5` 找到错误版本而报 `Cannot find module 'ajv/dist/compile/codegen'` 错误。显式声明 `ajv@^8` 可确保正确版本被提升到顶层。

#### 1.3 移除 `dependencies` 中重复的 `http-proxy-middleware`

检查你的 `package.json`，如果 `http-proxy-middleware` 同时出现在 `dependencies` 和 `devDependencies` 中：

```diff
  "dependencies": {
    ...
-   "http-proxy-middleware": "^3.0.5",
    ...
  },
  "devDependencies": {
+   "http-proxy-middleware": "^2.0.9",
    "omg-rc-cli": "^2.0.0"
  }
```

- 仅保留在 `devDependencies` 中即可，版本使用 `^2.0.9`（与项目代码中 `createProxyMiddleware` API 兼容）
- 如果原来只在 `devDependencies` 中有，则无需操作

#### 1.4 升级 omg-rc-cli

```diff
  "devDependencies": {
-   "omg-rc-cli": "^1.x.x",
+   "omg-rc-cli": "^2.0.0"
  }
```

### 步骤 2：清理并重新安装依赖

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

> **说明**：
> - 删除 `node_modules` 和旧的 `package-lock.json` 可避免 npm arborist 在处理旧依赖树时出现 `Cannot read properties of null` 错误
> - `--legacy-peer-deps` 用于跳过旧项目中的 peer dependency 冲突（如 `react-router@4` 要求 `react@^15` 而项目使用 `react@16`）
> - 安装完成后会自动生成新的 `package-lock.json`，**请将其提交到仓库**

### 步骤 3：验证

```bash
# 启动开发服务器（以 mainRental 为例）
omg server ./ mainRental --env.workingSpace=mainRental
```

正常情况下应看到：

```
 OMG  😎  @babel/runtime-corejs3 Consistent version, no updates required！
 OMG  😎  react-hot-loader Consistent version, no updates required！
 OMG  🍺  init webpack base config successfully!
 OMG  🍺  init webpack entry config successfully!
 OMG  🍺  init webpack rule config successfully!
```

---

## 三、omg.config.js 兼容性说明

**无需修改 `omg.config.js`。** omg-rc-cli v2.0 已内置向后兼容处理。

以下旧配置在新版本中会自动转换，无需改动：

| 旧配置（v1） | 新版本行为 |
|-------------|-----------|
| `devServer.before` | 自动转换为 `setupMiddlewares`（v4 API） |
| `devServer.after` | 自动转换为 `setupMiddlewares`（v4 API） |
| `devServer.disableHostCheck` | 自动替换为 `allowedHosts: 'all'` |

### 长期建议

后续新项目或重构时，建议将 `omg.config.js` 中的 `devServer` 配置迁移到新 API：

```javascript
// 旧写法（仍然兼容）
devServer: {
    before: config.router
}

// 新写法（推荐）
devServer: {
    setupMiddlewares: (middlewares, devServer) => {
        config.router(devServer.app, devServer);
        return middlewares;
    }
}
```

---

## 四、常见问题排查

### Q1：启动时报 `@babel/runtime-corejs3 Version is not consistent`

```
Omg runtime @babel/runtime-corejs3 dependent version：7.29.2
you project @babel/runtime-corejs3 dependent version：7.9.2
@babel/runtime-corejs3 Version is not consistent. Update now！
install @babel/runtime-corejs3 failure！
```

**原因**：`package.json` 中 `@babel/runtime-corejs3` 版本过低。

**解决**：按步骤 1.1 更新版本号，然后 `rm -rf node_modules && npm install --legacy-peer-deps`。

### Q2：npm install 报 `Cannot read properties of null (reading 'package')`

**原因**：旧的 `node_modules` 残留或缺少 `package-lock.json`，导致 npm arborist 构建依赖树时崩溃。

**解决**：删除 `node_modules` 和 `package-lock.json` 后重新安装。

### Q3：启动时报 `options has an unknown property 'before'`

```
ValidationError: Invalid options object. Dev Server has been initialized using an options object that does not match the API schema.
- options has an unknown property 'before'.
```

**原因**：使用的是未包含兼容层修复的 omg-rc-cli 版本。

**解决**：确保 omg-rc-cli 版本为包含 `createWebpackDevServerConfig.js` 兼容层修复的版本。可通过以下命令确认：

```bash
omg --version   # 应为 2.0.0+
```

### Q4：安装时出现大量 peer dependency 警告

```
npm warn Could not resolve dependency:
npm warn peer react@"^15" from react-router@4.1.1
```

**说明**：这是旧项目中 `react-router@4` 与 `react@16` 的已知兼容性警告，不影响功能。使用 `--legacy-peer-deps` 安装即可忽略。

### Q5：启动时报 `Cannot find module 'ajv/dist/compile/codegen'`

```
Error: Cannot find module 'ajv/dist/compile/codegen'
Require stack:
- .../node_modules/ajv-keywords/dist/definitions/typeof.js
```

**原因**：项目中旧依赖（如 `eslint@4`）将 `ajv@5` 提升到了 `node_modules` 顶层，而 `ajv-keywords@5`（来自 `schema-utils@4`）需要 `ajv@^8`。`ajv@5` 中没有 `dist/compile/codegen` 模块。

**解决**：在 `package.json` 的 `dependencies` 中显式添加 `"ajv": "^8.18.0"`，确保 `ajv@8` 被提升到顶层。

**依赖链**：
```
commitcheck@1.1.6 → eslint@4.19.1 → ajv@5（被提升到顶层，导致冲突）
omg-rc-cli@2.0.0 → babel-loader@9 → schema-utils@4 → ajv-keywords@5 → 需要 ajv@^8
```

---

## 五、各 workingSpace 升级检查清单

`book_m_frontend/rental` 项目包含多个 workingSpace，逐一确认：

| workingSpace | 目录 | 检查项 |
|-------------|------|--------|
| mainRental | `omgConfig/mainRental/` | `config.js`、`router.js` 无需改动 |
| rentalAfter | `omgConfig/rentalAfter/` | `config.js`、`router.js` 无需改动 |
| motor | `omgConfig/motor/` | `config.js`、`router.js` 无需改动 |
| after | `omgConfig/after/` | `config.js`、`router.js` 无需改动 |

每个 workingSpace 的 `omg.config.js` 配置是共享的（项目根目录），只需修改一次 `package.json` 即可覆盖所有 workingSpace。

---

## 六、升级后的变更

升级到 omg-rc-cli v2.0 后，你将获得：

| 特性 | 说明 |
|------|------|
| Webpack 5 持久化缓存 | 二次构建速度提升 50%+ |
| Dart Sass | 无需安装 Python 或原生编译工具 |
| Asset Modules | 图片/字体处理更高效 |
| Node.js 18/20/22 支持 | 多版本 Node 兼容 |
| 多线程编译压缩 | 生产构建速度更快 |
