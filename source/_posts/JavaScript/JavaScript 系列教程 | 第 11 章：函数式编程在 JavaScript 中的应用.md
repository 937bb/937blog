---
title: JavaScript 系列教程 | 第 11 章：函数式编程在 JavaScript 中的应用
description: 本章深入分析函数式编程的核心概念，如纯函数、高阶函数、柯里化、不变性等，并给出 JavaScript 中的实际使用示例。
keywords: 'JavaScript, 函数式编程, 纯函数, 高阶函数, 柯里化, 不变性'
categories:
  - JavaScript
tags:
  - 教程
  - JavaScript
  - 函数式编程
date: '2025-06-14 16:04'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
abbrlink: 36960
---

## 一、前言

在一个叫「代码林」的小镇，有个开发者叫小函。他总是讨厌副作用，总希望函数调用后世界依旧安然无恙。这正是函数式编程的哲学核心——**避免副作用，追求纯粹与可预测性**。

函数式编程（Functional Programming，FP）在 JavaScript 中有着非常广泛的实践价值。特别是在 React、Redux 等框架中，我们几乎离不开 FP 的理念。

---

## 二、函数式编程核心理念

### 1. 纯函数（Pure Function）

**定义：** 给定相同的输入，总是返回相同的输出，并且没有副作用。

```js
// 纯函数
function add(a, b) {
  return a + b;
}

// 非纯函数（有副作用）
let count = 0;
function increment() {
  count++; // 修改了外部变量
  return count;
}
```

👀 **使用场景：** 数据计算、状态处理等业务逻辑处理部分。

🧠 **小贴士：** 纯函数更易于测试和复用。

---

### 2. 不变性（Immutability）

**定义：** 一旦创建，就不能被更改。修改只能通过创建新的副本。

```js
const obj = { name: 'JS' };
const newObj = { ...obj, name: 'JavaScript' };
```

📌 不变性使得我们能更容易追踪变化（如 React 的组件更新依赖于 props 是否变化）。

---

### 3. 高阶函数（Higher-Order Function）

**定义：** 接受函数作为参数，或返回另一个函数的函数。

```js
function greet(fn) {
  console.log('开始调用：');
  fn();
}

function sayHello() {
  console.log('你好，函数式世界！');
}

greet(sayHello); // 输出两行内容
```

📦 **使用场景：**

* 数组方法如 `map`、`filter`、`reduce`
* 事件处理
* 中间件系统

---

### 4. 柯里化（Currying）

**定义：** 将接收多个参数的函数转换为一系列接收单一参数的函数。

```js
function add(a) {
  return function(b) {
    return a + b;
  };
}

const addFive = add(5);
console.log(addFive(10)); // 15
```

📌 **好处：** 参数复用、更强的函数组合能力。

🧠 小提示：使用库如 Lodash 中的 `curry` 可以简化使用。

---

## 三、函数组合与管道

> 函数组合 = 把多个小函数组合成一个大函数（从右往左执行）

```js
const compose = (f, g) => (x) => f(g(x));

const toUpper = str => str.toUpperCase();
const exclaim = str => str + '!';

const shout = compose(exclaim, toUpper);
console.log(shout('hello')); // HELLO!
```

🧠 **思维图解：**

```
hello
 ↓ toUpper
HELLO
 ↓ exclaim
HELLO!
```

---

## 四、场景实战：用函数式方式改写代码

### 示例：将用户列表筛选出年龄大于 18 的，并提取姓名

```js
const users = [
  { name: '张三', age: 20 },
  { name: '李四', age: 17 },
  { name: '王五', age: 25 }
];

const getNames = users => users
  .filter(user => user.age > 18)
  .map(user => user.name);

console.log(getNames(users)); // ['张三', '王五']
```

💡 **对比传统写法：** 更清晰、可组合、可读性更高。

---

## 五、小故事：副作用的锅是谁背？

在「函数镇」里，有两个厨师：小纯和老副。

* 小纯每次做饭都严格按照配方，材料、火候都不变，出品一如既往；
* 老副喜欢随机加料、临时换锅，有时候味道好，有时候翻车。

👉 编程也是如此，**我们更信任“纯厨师”的出品**。

---

## 六、常用函数式工具库

| 库名           | 简介                      |
| ------------ | ----------------------- |
| Lodash/fp    | 函数式封装的 Lodash 版本        |
| Ramda        | 专为函数式编程设计的 JavaScript 库 |
| Immutable.js | 提供不可变数据结构支持             |

---

## 七、总结

函数式编程不是让你放弃命令式，而是在需要“副作用控制”“高可组合性”的时候，提供更清晰、可预测的编码方式。

* 纯函数 = 输入决定输出，无副作用
* 高阶函数 = 函数接收函数、返回函数
* 柯里化 = 拆分多参函数为单参函数链
* 不变性 = 避免共享修改，提高可控性

---

## 八、推荐阅读 & 参考资料（可在大陆访问）

* 📘 [函数式编程指南（简体中文）](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/)
* 📘 [JavaScript 教程 - 菜鸟教程](https://www.runoob.com/js/js-functions.html)
* 📗 [阮一峰 ECMAScript 6 入门](https://es6.ruanyifeng.com/#docs/function)
* 📘 [Ramda 中文文档](https://ramdacn.yuque.com/ramda)
* 📘 [掘金：函数式编程系列](https://juejin.cn/search?query=%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BC%96%E7%A8%8B)

---
