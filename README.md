<h1 align="center">omg-rc-cli</h1>
<p align="center">易用高效的React脚手架</p>
<p align='center'>
<img alt='npm' src='https://img.shields.io/npm/v/omg-rc-cli'/>
<img alt='npm' src='https://img.shields.io/npm/dw/omg-rc-cli'/>
<img alt='NPM' src='https://img.shields.io/npm/l/omg-rc-cli'/>
</p>


## 介绍

omg-rc-cli 是一套可以快速新建 React 项目的脚手架，基于 Webpack 5 二次开发，进行了大量预设配置和功能扩展。

每次我们编写新项目时，都会为配置 webpack 而烦恼，而且针对不同的目录结构，也会有不同的配置方式，大大影响我们的开发效率，omg-rc-cli 就是为了解决这一系列问题而开发的一套 React 脚手架，能帮助团队能快速的投入开发，并且互相遵从一些目录结构的规范进行页面开发。

更详细的文档可以访问[官网](http://cli.omg-code.com/)

## 特性
- 基于 Webpack 5 构建，带有合理的默认配置和持久化缓存
- 集成了前端生态中较好的构建插件
- 是一个可全局安装的 npm 包
- 让开发者可专注在撰写应用上，无需再纠结配置问题

### 使用环境

Node.js >= 18

## 功能
- [x] ES6 | ES7
- [x] SCSS | CSS（Dart Sass）
- [x] Svg
- [x] React(JSX | TSX)语法转换
- [x] TypeScript
- [x] Handlebars
- [x] HTML 资源自动注入
- [x] 自动代码分割
- [x] 图片智能优化（png, jpg, jpeg, webp, gif）
- [x] Webpack 5 持久化缓存
- [x] 多线程编译压缩
- [x] Asset Modules（内置资源处理）

## v2.0 升级变更

- Webpack 4 → Webpack 5（持久化缓存、Asset Modules）
- node-sass → Dart Sass（纯 JS 实现，无需原生编译）
- ESLint 从构建链路剥离（建议作为独立 npm script 运行）
- html-webpack-plugin 升级到 v5
- 全面升级 Babel 7.26、TypeScript 5.x、commander 13.x
- 移除 hard-source-webpack-plugin、optimize-css-assets-webpack-plugin 等废弃包
- 要求 Node.js >= 18

## 起步 && 安装
```Shell
npm install -g omg-rc-cli
```

## 提供命令
```Shell
# 初始化项目
omg init <projectName>

# 快速创建页面目录
omg create <dirPath> <name>

# 开发构建
omg build [targetPath] [targetDir]

# 生产发布
omg publish [targetPath] [targetDir]

# 监听模式
omg watch [targetPath] [targetDir]

# 开发服务器
omg server [targetPath] [targetDir]
```

## ESLint 使用

v2.0 起 ESLint 不再内嵌于构建流程，建议作为独立脚本运行：

```Shell
npm install eslint --save-dev
npx eslint src/ --ext .js,.jsx,.ts,.tsx
```
