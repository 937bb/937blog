---
title: JavaScript 系列教程 | 第 12 章：this 的指向与箭头函数详解
description: "\U0001F9ED 本章将以白话文、比喻、图解和场景演示，深入解析 JavaScript 中 `this` 的指向规则，以及 ES6 箭头函数与普通函数在 `this` 绑定上的巨大差异，帮助你彻底理解并灵活运用。"
keywords: 'JavaScript, this, 箭头函数, arrow function, call, bind, apply, JS教程'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - JavaScript
date: '2025-06-14 16:10'
abbrlink: 34142
---

## 🔁 一、小故事串场：谁来叫醒我？

在一个厨房里，有个厨师（函数），他通常不太清楚自己在哪个厨房（`this`）。

有时候他被老板（`call`）叫过去，有时候他被打电话过去（`apply`），有时老板还“给他绑定了手机号”（`bind`），让他以后都去同一个地方。

这，就是 JS 中的 `this`、`call`、`apply` 和 `bind`。

---

## 👀 二、this 的四大绑定规则

在 JavaScript 中，`this` 的指向主要由**四条绑定规则**决定。掌握这四条规则，就像学会“认主人”的技巧，能帮我们准确判断函数运行时 `this` 指向谁。

### 1️⃣ 默认绑定（Default Binding）

这是最基本的规则。当函数单独调用时，`this` 默认指向**全局对象**（浏览器中是 `window`，严格模式下为 `undefined`）。

```js
function show() {
  console.log(this); // window（非严格模式下）
}
show();
```

👀 **小贴士**：

* 在非严格模式中，`this` 指向 `window`
* 在严格模式 (`'use strict'`) 下，`this` 为 `undefined`

---

### 2️⃣ 隐式绑定（Implicit Binding）

当函数作为某个对象的**方法调用**时，`this` 指向该对象。

```js
const person = {
  name: '小明',
  sayHi: function () {
    console.log('你好，我是 ' + this.name);
  }
};

person.sayHi(); // 你好，我是 小明
```

📦 **总结规律**：

> 谁调用我，我就是谁！

---

### 3️⃣ 显式绑定（Explicit Binding）

通过 `call()`、`apply()`、`bind()` 可以**强制指定 this**。

```js
function greet() {
  console.log(this.name);
}

const user = { name: '小红' };

greet.call(user);  // 小红
greet.apply(user); // 小红
```

⚠️ 注意：`call/apply` 会立即执行；`bind` 会返回一个新函数：

```js
const say = greet.bind(user);
say(); // 小红
```

---

### 4️⃣ new 绑定（New Binding）

当函数通过 `new` 调用时，会自动绑定一个新的对象，并把它作为 `this`。

```js
function Person(name) {
  this.name = name;
  console.log(this.name);
}

const p1 = new Person('小李'); // 小李
```

🧠 **理解重点**：

> new 会创建一个全新的空对象，并将 `this` 指向它，最后默认返回这个新对象。

---

### ⚠️ 特殊情况：绑定丢失（常见陷阱）

```js
const person = {
  name: '小赵',
  sayHi() {
    console.log(this.name);
  }
};

const fn = person.sayHi;
fn(); // undefined（this 变成 window）
```

💡 **解决方案**：使用 `.bind()` 或箭头函数保留原始绑定。

---

## 📲 三、显式绑定神器：call、apply、bind

### 🔧 `call()` 用法

```js
function greet(greeting) {
  console.log(`${greeting}, 我是 ${this.name}`);
}

const person = { name: '小明' };
greet.call(person, '你好'); // 你好, 我是 小明
```

* 语法：`fn.call(thisArg, arg1, arg2, ...)`
* 功能：立即执行，`this` 设置为指定对象

---

### 📞 `apply()` 用法

```js
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: '小红' };
greet.apply(person, ['早上好', '!']); // 早上好, 小红!
```

* 语法：`fn.apply(thisArg, [argsArray])`
* 功能：与 `call` 相同，但参数以数组传递

---

### 🔹 `bind()` 用法

```js
function introduce() {
  console.log(`我是 ${this.name}`);
}

const user = { name: '小李' };
const boundIntro = introduce.bind(user);
boundIntro(); // 我是 小李
```

* 语法：`fn.bind(thisArg, arg1, ...)`
* 功能：返回一个新函数，持久绑定 `this`，不立即执行

---

## 🤝 四者区别对比

| 方法    | 是否立即执行 | 参数传递方式 | 返回值  | this 是否可重绑 |
| ----- | ------ | ------ | ---- | ---------- |
| call  | ✅      | 逗号分隔   | 执行结果 | 是          |
| apply | ✅      | 数组形式   | 执行结果 | 是          |
| bind  | ❌      | 逗号/预填  | 新函数  | 否          |

---

## 🧬 四、场景应用

### ✅ 1. 借用方法改变 this

```js
const arrayLike = {
  0: '苹果',
  1: '香蕉',
  length: 2
};

const realArray = Array.prototype.slice.call(arrayLike);
console.log(realArray); // ['苹果', '香蕉']
```

* 把伪数组转为真数组

---

### ✅ 2. React 组件中预绑定 this

```js
class Button {
  constructor(name) {
    this.name = name;
    this.click = this.click.bind(this);
  }

  click() {
    console.log(this.name + ' 被点击了');
  }
}

const btn = new Button('提交按钮');
btn.click(); // 提交按钮 被点击了
```

---

## ⛓ 五、箭头函数的 this

### 注意：箭头函数不符合 this 的通用规则

```js
const obj = { name: '小王' };
const arrow = () => console.log(this.name);

arrow.call(obj); // undefined
```

* 箭头函数不能被 call/apply/bind 重绑
* 它的 this 来自定义时的语境（如 window ）

---

## 🔮 六、小演练

```js
const person = { name: 'Anna' };

function say(greet, symbol) {
  console.log(`${greet} ${this.name}${symbol}`);
}

say.call(person, 'Hello', '!');
say.apply(person, ['Hi', '?']);
const boundSay = say.bind(person, 'Hey');
boundSay('~');
```

结果：

```
Hello Anna!
Hi Anna?
Hey Anna~
```

---

## 📚 七、总结

* `call`、`apply` 用于立即执行且切换 this
* `bind` 返回新函数且持久绑定 this
* 箭头函数不能被重绑 this，自己确定 this
* 合理选择绑定方式，可以让代码更漂亮

---

## 📙 八、参考文档和推荐阅读

* [MDN - call](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
* [MDN - bind](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
* [JavaScript教程 - 菜鸟教程](https://www.runoob.com/js/js-function-call.html)
* [阙一峰 ES6 箭头函数](https://es6.ruanyifeng.com/#docs/function#箭头函数)
* [B站 - call/apply/bind 视频教程](https://www.bilibili.com/video/BV1Kb411W75N)

---
