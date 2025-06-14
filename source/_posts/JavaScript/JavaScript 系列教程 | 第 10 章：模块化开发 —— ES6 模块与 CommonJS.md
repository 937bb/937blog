---
title: JavaScript 系列教程 | 第 10 章：模块化开发 —— ES6 模块与 CommonJS
description: "\U0001F4E6 本章详细解析 JavaScript 模块化的发展历程、ES6 模块与 CommonJS 的差异、使用方式与底层机制，并通过真实场景与图解，帮助你轻松掌握模块化开发的核心思想。"
keywords: 'JavaScript, 模块化, ES6 Modules, CommonJS, import, export, require, JavaScript教程'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - JavaScript
date: '2025-06-14 15:12'
abbrlink: 21463
---

## 一、小故事：拼图游戏与模块

在“代码王国”中，每个程序员都要玩一个叫“拼图”的游戏。一开始，他们用一个大纸板画所有图案（就像一个 `.js` 文件写完所有逻辑），但很快纸板太大、太乱。

后来他们学聪明了，把每个图案裁成一块块小拼图，只在需要时组合使用。这，就是**模块化的诞生**！

---

## 二、模块化是什么？为什么需要它？

> 模块化 = 把一个程序拆成独立的、可复用的小模块，每个模块完成一个功能。

### ✅ 优势：

* 提高可维护性（每个模块职责清晰）
* 避免命名冲突（作用域隔离）
* 提升协作效率（多人开发互不干扰）
* 支持按需加载（提高性能）

---

## 三、历史回顾：从无模块到现代模块

| 阶段         | 模块方式         | 问题            |
| ---------- | ------------ | ------------- |
| 最初         | 全局函数、对象      | 污染全局、依赖混乱     |
| 手工模拟       | IIFE（立即执行函数） | 作用域隔离但维护麻烦    |
| Node.js 推出 | CommonJS     | 同步加载，仅适用于服务端  |
| ES6 标准化    | ES Modules   | 官方标准、支持浏览器和工具 |

---

## 四、CommonJS 模块规范（用于 Node.js）

每个文件就是一个模块，使用 `require` 引入、`module.exports` 导出。

### 示例 1：导出模块（math.js）

```js
// math.js
function add(x, y) {
  return x + y;
}
module.exports = {
  add
};
```

### 示例 2：引入模块（main.js）

```js
const math = require('./math');
console.log(math.add(2, 3)); // 输出：5
```

### 🧠 特点：

* 同步加载（适用于服务端）
* 文件运行时执行一次，缓存结果

---

## 五、ES6 模块（用于现代浏览器和打包工具）

使用 `export` 导出，`import` 引入。

### 示例 1：导出模块（math.mjs）

```js
// math.mjs
export function add(x, y) {
  return x + y;
}
```

### 示例 2：引入模块（main.mjs）

```js
import { add } from './math.mjs';
console.log(add(2, 3)); // 输出：5
```

### 🚀 特点：

* **静态加载**：编译时就确定模块依赖，便于优化
* **只能顶层引入**：不能在函数内部使用 import
* **严格模式**：默认启用严格模式
* 支持浏览器、支持 tree shaking（去除无用代码）

---

## 六、流程图：模块引入加载过程对比

```text
CommonJS 加载流程（运行时）：
main.js
  ↓ require('math')
  ↓ 加载并执行 math.js
  ↓ 返回 module.exports

ESM 加载流程（编译时）：
main.mjs
  ↓ import { add } from 'math'
  ↓ 编译时构建依赖关系图
  ↓ 浏览器异步加载并执行
```

---

## 七、CommonJS vs ES6 Module 对比总结

| 特性   | CommonJS         | ES Modules                         |
| ---- | ---------------- | ---------------------------------- |
| 加载方式 | 同步               | 异步（浏览器支持 `<script type="module">`） |
| 适用环境 | Node.js          | 浏览器、Node.js（ESM 支持）                |
| 变量导出 | `module.exports` | `export`                           |
| 引入模块 | `require()`      | `import`                           |
| 作用域  | 运行时动态引入          | 编译时静态分析                            |

---

## 八、实战场景：使用模块构建一个 Todo 工具库

### 文件结构：

```bash
/todo-app
  ├─ utils/
  │    └─ storage.js
  ├─ app.js
```

### `storage.js`：

```js
export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key) {
  return JSON.parse(localStorage.getItem(key));
}
```

### `app.js`：

```js
import { save, load } from './utils/storage.js';

const todos = load('todos') || [];
todos.push({ text: '学习模块化', done: false });
save('todos', todos);

console.log(load('todos'));
```

🧪 效果：

* 每次刷新，todo 会被存储并读取；
* 模块清晰、易维护！

---

## 九、模块打包工具（webpack、Vite 简介）

现代项目中模块需要打包，常用工具包括：

| 工具      | 说明                     |
| ------- | ---------------------- |
| Webpack | 老牌打包工具，配置灵活、生态成熟       |
| Vite    | 新一代前端构建工具，基于 ES 模块，速度快 |
| Rollup  | 专注库打包，生成更小体积           |
| Parcel  | 零配置入门，适合快速原型开发         |

> 🌐 推荐：Vite 是现代开发中非常流行的选择，天然支持 ES Modules，开发体验极佳。

---

## 十、小测试：你能区分模块规范吗？

**题目 1：**

```js
// 文件 a.js
module.exports = function () {
  console.log('Hello A');
}

// 文件 b.js
import a from './a.js';
```

❓ 错误在哪？

🧠 **解析**：不能混用 CommonJS 和 ESM！若用 `import`，则 `a.js` 应使用 `export default`。

---

## 十一、总结

* 模块化是大型项目开发的基础能力；
* CommonJS 是 Node.js 的默认规范，ESM 是浏览器标准；
* 推荐在前端中优先使用 ES6 Modules；
* 学会拆分功能、合理封装，是构建可维护 JS 工程的关键。

---

## 十二、参考资料 & 推荐阅读

* 📗 [MDN：JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
* 📘 [阮一峰：ES6 模块语法](https://es6.ruanyifeng.com/#docs/module)
* 📘 [Node.js 官方文档：模块系统](https://nodejs.org/zh-cn/docs/guides/module-system/)
* 📘 [菜鸟教程：JavaScript 模块](https://www.runoob.com/w3cnote/js-module.html)
* 📙 [Vite 中文官网](https://cn.vitejs.dev/)

---