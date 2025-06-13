---
title: JavaScript 系列教程 | 第 7 章：闭包（Closure）完全解析
description: 🚀 本章将以白话文深入讲解 JavaScript 中闭包的概念、实现原理、使用场景，并通过多个示例与图解，帮助你彻底理解闭包的作用与意义。
keywords: JavaScript, 闭包, closure, 函数作用域, 作用域链, JavaScript教程
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - JavaScript
abbrlink: 8207
date: '2025-06-13 16:12'
---

## 一、开场白话：闭包是什么？

在一个叫做「代码镇」的小村庄，有个程序员阿明，他总是喜欢把事情藏在一个盒子里。但有时候他又会在盒子里偷偷放上一张纸条，写着：“等你回来的时候，把这个值记住！”

这张纸条其实就像 **闭包**。它能「记住」原来函数中的某些变量，哪怕函数早已执行完了。

---

## 二、闭包的定义

> **闭包**是指一个函数能够「记住」并访问它**定义时所在的词法作用域**，即使这个函数在其作用域外被调用。

换句话说，就是函数**能够访问它外部函数作用域中的变量**。

---

## 三、为什么需要闭包？

### ✨ 使用场景

1. **延长变量的生命周期**
2. **封装私有变量**
3. **模拟模块化开发**
4. **事件处理或异步执行**

---

## 四、经典示例与变量生命周期

### 示例 1：函数中返回函数

```js
function outer() {
  let name = '小明'; // 外部变量
  return function inner() {
    console.log('名字是：' + name);
  };
}

const fn = outer();  // outer() 执行完毕
fn();  // 输出：名字是：小明
```

🧠 **解释**：

* 即使 `outer()` 已经执行完毕，`name` 变量仍被 `inner()` 记住；
* 这就是闭包的作用 —— **记忆变量的环境**！

---

## 五、用图来理解闭包（词法作用域链）

![闭包图解](/images/post/js/execution-context.png)

> 图片来源于网络

---

## 六、常见应用场景实战

### 1️⃣ 封装私有变量

```js
function createCounter() {
  let count = 0;  // 私有变量
  return {
    increment: function() {
      count++;
      console.log(count);
    },
    decrement: function() {
      count--;
      console.log(count);
    }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
```

👀 外部无法直接访问 `count`，但通过闭包函数可间接访问，这就是“私有变量”的封装效果。

---

### 2️⃣ 定时器或异步处理

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log('i:', i); // 每次输出 3，而不是 0、1、2
  }, 100);
}
```

🧠 因为 `var` 没有块级作用域，`i` 是共享的变量。

解决方案 —— 用闭包保存每次循环的 `i`：

```js
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log('j:', j);  // 正确输出：0、1、2
    }, 100);
  })(i);
}
```

---

## 七、闭包中的常见问题

### ❌ 内存泄漏问题？

闭包会导致外部变量无法被回收（因为被引用着），可能引发内存泄漏。

🧽 **解决方法**：在不需要时手动置空、解除引用。

```js
function outer() {
  let bigData = new Array(100000).fill('data');

  return function() {
    console.log(bigData[0]);
  };
}

const leak = outer();
// 使用后解除引用
// leak = null; // 清理闭包引用
```

---

## 八、小测试：你真的理解闭包了吗？

```js
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

const add5 = makeAdder(5);
console.log(add5(10)); // 输出 15
```

🌟 答案解析：

* `x = 5` 保存在闭包环境中；
* 执行 `add5(10)` 时 `y = 10`，返回 5 + 10 = 15。

---

## 九、多语言对照：闭包在其他语言中

| 语言         | 是否支持闭包           | 示例说明            |
| ---------- | ---------------- | --------------- |
| JavaScript | ✅ 支持             | 主流使用语言          |
| Python     | ✅ 支持             | def + nonlocal  |
| PHP        | ✅ 支持（5.3+）       | 使用 `use` 引入外部变量 |
| Java       | ✅ 支持（lambda 表达式） | 外部变量需 final 或等效 |

---

## 十、总结

* 闭包是函数+其定义时的词法作用域的组合。
* 它让我们能在函数执行完后“记住”并访问之前的变量。
* 是 JavaScript 中高级函数式编程的核心利器。
* 学会闭包 = 掌握控制变量作用域的“神器”！

---

## 十一、推荐阅读 & 参考资料（可在大陆访问）

* 📘 [阮一峰 ECMAScript 6 入门](https://es6.ruanyifeng.com/)
* 📗 [MDN：Closures](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
* 📘 [JavaScript 教程 - 菜鸟教程](https://www.runoob.com/js/js-function-closures.html)
* 📘 [极客时间《JavaScript核心原理解析》](https://time.geekbang.org/column/intro/100009001)

---