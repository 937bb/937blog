---
title: JavaScript ES 系列教程 | 第 1 章：ECMAScript 简史与发展脉络
description: "\U0001F44B 从混乱走向标准化，JavaScript 的进化之路。了解 ECMAScript 的前世今生，奠定学习现代 JavaScript 的基础。"
keywords: 'ECMAScript 简史, JavaScript ES 历史, TC39 流程, JavaScript 演进, JavaScript 学习'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - ECMAScript
  - JavaScript
date: '2025-06-13 08:56'
abbrlink: 51840
---

## 一、阿聪的困惑：JavaScript 到底是啥？

> 🌟**小故事引入**：
> 阿聪是个初学前端的小白。他写了段 JavaScript 代码放进浏览器，一切看起来都正常。但当他去找教程时，有的说叫 ECMAScript，有的说叫 JavaScript，还有人讨论 ES6、ES2020、TC39……阿聪懵了：**“这些都是什么鬼？”**

---

## 二、JavaScript 和 ECMAScript 是啥关系？

**打个比方：**

> JavaScript 就像“小红书”App
> ECMAScript 就是“小红书的使用说明书”（技术规范）

也就是说：

* **JavaScript** 是实现（浏览器里实际能运行的语言）
* **ECMAScript（简称 ES）** 是标准（规定它该怎么写）

💡 浏览器（如 Chrome）会根据 ECMAScript 的标准来支持 JavaScript 功能。

---

## 三、发展简史：从 ES3 到 ES2025，一路进化

| 版本              | 发布时间 | 主要变化                                     |
| --------------- | ---- | ---------------------------------------- |
| ES3             | 1999 | `try/catch`、正则表达式                        |
| ES5             | 2009 | `strict mode`、`Object.defineProperty`    |
| **ES6（ES2015）** | 2015 | `let`、`const`、`class`、模块、Promise         |
| ES7 ～ ES2024    | 每年发布 | async/await、可选链、BigInt、Top-Level Await 等 |

### 📈 一图看懂 ECMAScript 的演进

![ES 历史时间线](/images/post/js/timline.jpg)

> 图源：图片来源于网络

---

## 四、TC39：决定新语法的组织

就像微信每年会更新新功能，JS 也由一个“官方委员会”来决定新功能，这个组织就是：

> **TC39（ECMAScript 技术委员会）**

* 由浏览器厂商（如 Chrome、Safari）、大厂工程师组成
* 每年开会，评估提案，推动新语法进入标准

### 📋 提案的 5 个阶段

| 阶段 | 名称        | 说明           |
| -- | --------- | ------------ |
| 0  | strawman  | 草案，非正式       |
| 1  | proposal  | 提案，已有初步实现计划  |
| 2  | draft     | 草案，有明确语法/逻辑  |
| 3  | candidate | 候选，有至少 2 个实现 |
| 4  | finished  | 完成，正式写入标准    |

---

## 五、为什么要关心 ECMAScript？

> 🚀 新特性可以让你写出**更简洁、更安全、更强大**的代码。

比如：

```js
// ES5：写个默认参数还得这样
function greet(name) {
  name = name || '游客';
  console.log('你好，' + name);
}

// ES6：直接搞定
function greet(name = '游客') {
  console.log(`你好，${name}`);
}
```

更重要的是，在团队协作、代码规范、面试中都频频出现。

---

## 六、学 ES 你会遇到的术语科普

| 术语           | 白话解释                 |
| ------------ | -------------------- |
| ESx          | 某一版本标准，如 ES6、ES2020  |
| Babel        | 编译工具：把新语法转成老浏览器能懂的代码 |
| Polyfill     | “补丁”：为老浏览器模拟新功能      |
| transpile    | 转译：把 A 语法转为 B 语法     |
| feature flag | 判断功能是否被支持，做兼容适配      |

---

## 七、一个现实 Demo：使用 Babel 转换代码

你可以写一段现代 JavaScript，然后用 Babel 转换：

```bash
# 安装 Babel 命令行工具
npm install --save-dev @babel/core @babel/cli @babel/preset-env

# 创建配置
echo '{ "presets": ["@babel/preset-env"] }' > babel.config.json

# 编写源码
echo "const fn = () => console.log('Hello ES6');" > test.js

# 转译为兼容代码
npx babel test.js -o output.js
```

运行完你会发现 `output.js` 被转为 ES5 兼容形式！

---

## 八、学 JS 为什么不能只看语法？

你需要掌握的，不仅是**怎么写一段代码**，而是理解这段代码**为何这样写、为何有效、为何不能那样写**——这就必须了解 JS 背后的 **标准逻辑** 和 **发展历程**。

---

## 九、你该如何学习 ECMAScript？

推荐你按这个顺序：

1. 掌握 ES6（变量、函数、类、模块）基础
2. 了解 ES7 ～ ES2020 的常用特性
3. 有意识地追踪 ES202x 的新特性
4. 实战中使用 Babel、ESLint 等工具
5. 遇到新语法，查 [MDN](https://developer.mozilla.org/zh-CN/) 或 [TC39 提案](https://github.com/tc39/proposals)

---

## 🔚 小结

* JavaScript 是 ECMAScript 的实现
* 每年都会发布新版本（ES6 起年更）
* TC39 组织负责制定新特性
* 掌握 ECMAScript 能让你成为更现代的 JS 开发者

---

## 📚 参考资料 & 推荐阅读

| 类型       | 链接                                                                    |
| -------- | --------------------------------------------------------------------- |
| 中文文档     | [MDN 中文文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript) ✅ |
| 中文教程     | [现代 JavaScript 教程](https://zh.javascript.info/) ✅                     |
| 提案跟踪     | [TC39 官方 GitHub](https://github.com/tc39/proposals) ✅                 |
| ES6 中文   | [ES6 入门教程 - 阮一峰](https://es6.ruanyifeng.com/) ✅                       |
| Babel 工具 | [Babel 中文网](https://www.babeljs.cn/) ✅                                |

---