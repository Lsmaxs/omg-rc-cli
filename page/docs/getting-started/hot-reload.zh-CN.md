---
title: 热更新
order: 10
---

## 概述

OMG-RC-CLI 在 dev server 模式下支持 **React Fast Refresh** 热更新，修改代码后浏览器无需刷新页面即可看到变化，并保留 React 组件的 state。

## 开启热更新

在项目的 `omg.config.js` 中，将 `devServer.hot` 设置为 `true`：

```js
module.exports = () => ({
    devServer: {
        hot: true,
        port: 9527,
    },
});
```

## 前置要求

- **React 版本 >= 16.9**（React Fast Refresh 最低要求）
- 项目需要安装 `react-refresh` 依赖（OMG 在启动时会自动检测并安装匹配版本）

## 支持的热更新类型

### React 组件

修改 React 组件的 JSX 逻辑后，组件会原地更新且 **state 不会丢失**：

```jsx
// src/my-page/js/App.jsx
import React, { useState } from 'react';

const App = () => {
    const [count, setCount] = useState(0);
    return (
        <div>
            <p>计数：{count}</p>
            <button onClick={() => setCount(c => c + 1)}>+1</button>
        </div>
    );
};

export default App;
```

修改上面的文字或结构，保存后浏览器即时更新，`count` 的值不会重置。

### 样式文件

修改 `.css`、`.scss`、`.module.css`、`.module.scss` 文件后，样式即时生效，页面不会刷新。

### 不支持热更新的场景

以下修改会导致页面全量刷新：

- 修改入口文件（如 `index.jsx`）中的 `render()` 调用
- 新增或删除导出的 React 组件
- 修改 `omg.config.js` 或 `webpack` 配置
- TypeScript 文件（经 `ts-loader` 处理，不经过 Babel，Fast Refresh 不生效）

## 编写规范

### 组件文件

组件必须使用 **ES Module 的 `export default`** 导出，Fast Refresh 才能自动识别：

```jsx
// ✅ 正确 - 默认导出组件
const App = () => <h1>Hello</h1>;
export default App;

// ✅ 正确 - 函数名首字母大写
export default function MyComponent() {
    return <div>content</div>;
}

// ❌ 错误 - 不导出组件，Fast Refresh 无法识别
const App = () => <h1>Hello</h1>;
// 缺少 export
```

### 入口文件

入口文件应只负责渲染根组件，不要在里面写组件逻辑：

```jsx
// src/my-page/js/index.jsx
import React from 'react';
import { render } from 'react-dom';
import App from './App';

render(<App />, document.getElementById('root'));
```

### 组件文件拆分

将组件拆分到独立文件中，每个导出的组件都能独立热更新：

```
src/my-page/js/
├── index.jsx      # 入口（仅 render 调用）
├── App.jsx        # 根组件
├── Header.jsx     # 子组件
└── Footer.jsx     # 子组件
```

## 注意事项

1. **React 版本**：如果使用 React < 16.9，热更新无法正常工作，请升级 React
2. **生产构建不受影响**：Fast Refresh 仅在 dev server 模式下启用，`omg build` 产出的代码不包含任何热更新相关代码
3. **缓存清理**：升级 OMG 版本后，建议删除 `node_modules/.cache` 以清除旧的构建缓存
4. **组件命名**：组件函数/变量名首字母必须大写（React 规范），否则 Fast Refresh 无法识别
