---
title: JavaScript 系列教程 | 第 4 章：对象与数组的增强语法（解构）
description: 本章讲解 ES6+ 中对象与数组的常见增强写法，如解构赋值、扩展运算符、Symbol 等，带你写出更优雅的 JavaScript 代码。
keywords: '解构赋值, 扩展运算符, Symbol, 对象简写, 计算属性名, JavaScript 教程'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - ECMAScript
  - JavaScript
date: '2025-06-13 09:57'
abbrlink: 4989
---

## 一、开篇小故事：阿毛的外卖数据处理

阿毛是个写前端的小哥，最近被产品小姐姐追着优化一个「外卖订单分析页」的需求。

他要从服务器拿到一堆数据对象，每个对象字段很多，他只关心其中几个字段。写起来麻烦又冗余：

```js
// 传统写法
const order = { id: 123, user: '张三', status: 'pending', time: '12:00' };
const user = order.user;
const status = order.status;
```

突然他发现 ES6 有个叫 **“解构赋值”** 的东西，一行代码就能搞定：

```js
const { user, status } = order;
```

阿毛感叹：“写代码终于不那么土了！” —— 于是他打开了 JS 的**语法增强之门**。

---

## 二、解构赋值：写更简洁的代码

### 对象解构

```js
const userInfo = {
  name: '小明',
  age: 20,
  school: '北大'
};

// 解构方式取出字段
const { name, school } = userInfo;
console.log(name); // '小明'
console.log(school); // '北大'
```

### 设置默认值 + 重命名变量

```js
const config = {
  theme: 'dark'
};

const { theme = 'light', lang = 'zh', theme: mode } = config;

console.log(theme); // 'dark'
console.log(lang);  // 'zh'
console.log(mode);  // 'dark'
```

### 数组解构

```js
const arr = [1, 2, 3];
const [a, b, c] = arr;
console.log(a, b, c); // 1 2 3
```

也可以跳过元素：

```js
const [first, , third] = arr;
console.log(first, third); // 1 3
```

---

## 三、扩展运算符：让对象/数组变得更灵活

### ... 在数组中：合并、克隆

```js
const a = [1, 2];
const b = [3, 4];
const merged = [...a, ...b]; // 合并
console.log(merged); // [1, 2, 3, 4]
```

```js
const copy = [...a]; // 克隆数组
```

### ... 在对象中：浅拷贝、合并配置

```js
const defaults = { lang: 'zh', theme: 'light' };
const userConfig = { theme: 'dark' };

const config = { ...defaults, ...userConfig };
console.log(config); // { lang: 'zh', theme: 'dark' }
```

---

## 四、对象字面量增强写法

### 属性名与变量同名时可以简写

```js
const name = '小红';
const age = 18;

// 传统写法
const student1 = { name: name, age: age };

// 简写写法
const student2 = { name, age };
```

### 动态属性名（计算属性名）

```js
const key = 'score';
const obj = {
  [key]: 100 // 相当于 obj.score = 100
};
console.log(obj.score); // 100
```

---

## 五、Symbol：定义独一无二的属性名

```js
const id = Symbol('id');

const user = {
  name: '小刚',
  [id]: 123
};

console.log(user[id]); // 123
console.log(Object.keys(user)); // ['name']
```

> Symbol 定义的属性不会出现在 `Object.keys()`、`for...in` 中，可以用来隐藏字段或实现私有属性。

---

## 六、实战案例：处理订单系统数据

```js
const orders = [
  { id: 1, user: '小明', status: 'pending', price: 20 },
  { id: 2, user: '小红', status: 'paid', price: 50 },
];

// 获取状态为 paid 的用户名列表
const paidUsers = orders
  .filter(({ status }) => status === 'paid') // 解构 status
  .map(({ user }) => user); // 解构 user

console.log(paidUsers); // ['小红']
```

---

## 七、图解：对象增强语法逻辑图

![解构赋值逻辑图](/images/post/js/structure.png)

> 图片来源于网络

---

## 八、小结与推荐实践

| 技术     | 作用              |
| ------ | --------------- |
| 解构赋值   | 语义清晰、字段提取更简洁    |
| 扩展运算符  | 克隆、合并、展开数据结构    |
| 对象简写   | 代码更紧凑、变量复用      |
| 计算属性名  | 动态创建属性          |
| Symbol | 实现“私有变量”或唯一 key |

---

## 九、推荐阅读与资料

* [MDN - 解构赋值（中文）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
* [MDN - 扩展运算符（中文）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
* [掘金：你真的会用解构赋值吗？](https://juejin.cn/post/6932392641307605000)
* [菜鸟教程 - JS Symbol](https://www.runoob.com/js/js-symbol.html)

---