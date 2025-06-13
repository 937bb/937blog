---
title: JavaScript 系列教程 | 第 6 章：什么是原型？什么是原型链？
description: 用最白话的方式带你理解 prototype、__proto__、构造函数、原型链查找机制和继承的本质。
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - ECMAScript
  - JavaScript
abbrlink: 38307
date: 2025-06-13 14:39
---


## 一、开篇故事：迷路的小猫

你可以这样理解原型链：

🐱 小猫丢了饭碗（找不到 `food` 属性），它问爸爸，爸爸没有，就问爷爷，爷爷也没有，问太爷爷……最后实在没人了，只能作罢。

这就是原型链的本质 —— **查不到，就往“上级”查**，直到查到底。

---

## 二、我们从一个真实代码说起

```js
function Animal() {
  this.type = "animal"; // 实例私有属性
}
Animal.prototype.sayType = function() {
  console.log("我是：" + this.type);
};

const cat = new Animal();
```

### 🔍 发生了什么？

```js
cat.sayType(); 
// 输出：我是：animal
```

你会以为 `cat` 里有 `sayType`，其实并没有。它找不到，于是去 `Animal.prototype` 里找，果然有！

---

## 三、原型是对象的“备用仓库”

我们每创建一个函数，比如：

```js
function Person() {}
```

它背后自动生成一个 `.prototype` 属性。

```js
console.log(typeof Person.prototype); // "object"
```

这个对象，就是实例们的“备用仓库”。

### demo

```js
Person.prototype.sayHi = function() {
  console.log("Hi");
};

const xiaoming = new Person();
xiaoming.sayHi(); // 从 prototype 上找到 sayHi 并调用
```

---

## 四、`__proto__` 是什么？它是连通原型链的桥梁！

你可以理解为：

* `Person.prototype` 是生产模具；
* `__proto__` 是“指向这个模具”的箭头！

```js
console.log(xiaoming.__proto__ === Person.prototype); // true
```

### 📦 所以，当你访问 `xiaoming.sayHi` 时，JS 内部做了什么？

它查找步骤如下：

1. `xiaoming` 对象本身有没有 `sayHi`？ ❌
2. 去 `xiaoming.__proto__` 看看有没有？ ✅ 找到了！

---

## 五、原型链到底有多长？

我们来看一个多层嵌套继承例子：

```js
function Animal() {}
Animal.prototype.sound = function() {
  console.log("通用声音");
};

function Dog() {}
Dog.prototype = new Animal(); // 原型链建立
Dog.prototype.bark = function() {
  console.log("汪汪");
};

function Husky() {}
Husky.prototype = new Dog(); // 再次建立原型链
Husky.prototype.color = "黑白";

const myDog = new Husky();
```

### 🔗 原型链结构如下图所示：

```text
myDog
 └── __proto__ → Husky.prototype
                └── __proto__ → Dog.prototype
                                └── __proto__ → Animal.prototype
                                                └── __proto__ → Object.prototype
                                                                └── null
```

我们访问：

```js
myDog.bark();  // 来自 Dog.prototype
myDog.sound(); // 来自 Animal.prototype
```

找不到？那就继续往上找！

---

## 六、图解：原型链中文结构图

![原型链中文结构图](/mnt/data/An_educational_infographic_in_Chinese_illustrates_.png)

---

## 七、构造函数、原型、实例三者关系再梳理

```js
function Car() {}
const bmw = new Car();
```

你要记住这一张图：

```text
Car         →  函数
│
├─ .prototype ——→ 构造函数的原型对象（用于创建实例）
│                   ↑
│                bmw.__proto__
│
bmw        →  实例对象
```

---

## 八、`instanceof` 判断的是原型链是否存在

```js
bmw instanceof Car; // true
```

内部逻辑大致为：

```js
function myInstanceOf(obj, Fn) {
  let proto = obj.__proto__;
  while (proto !== null) {
    if (proto === Fn.prototype) return true;
    proto = proto.__proto__;
  }
  return false;
}
```

---

## 九、对象之间是如何继承的？

我们手动封装一个简单的继承函数：

```js
function inherit(Sub, Super) {
  Sub.prototype = Object.create(Super.prototype); // 建立继承
  Sub.prototype.constructor = Sub;                // 修正 constructor
}
```

---

## 🔟 补充面试经典问题

### 1. `__proto__` 和 `prototype` 的区别？

| 语法          | 所属对象 | 作用                 |
| ----------- | ---- | ------------------ |
| `__proto__` | 实例对象 | 指向其构造函数的 prototype |
| `prototype` | 构造函数 | 定义实例共享的方法          |

### 2. 原型链查找顺序是？

* 自身 → `__proto__` → `Object.prototype` → `null`

---

## 11、常见误区 🔍

### ❌ 错误：

```js
Child.prototype = Parent.prototype;
```

这会导致两者共享原型对象！改动一个，另一个也受影响。

### ✅ 正确做法：

```js
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

---

## 12、总结口诀 💡

> 对象找不到 → 查 `__proto__` → 一直找 → 找到底 → 返回 undefined

---

## 📚 推荐资料

* [MDN：JavaScript 原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
* [阮一峰 ECMAScript 原型链章节](https://wangdoc.com/javascript/oop/prototype)
* [Bilibili 原型链动画讲解](https://www.bilibili.com/video/BV1p4411H7na)
* [掘金：原型链入门到精通](https://juejin.cn/post/6844904094281230349)

---