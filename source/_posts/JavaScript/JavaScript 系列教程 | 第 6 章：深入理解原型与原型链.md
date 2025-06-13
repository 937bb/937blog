---
title: JavaScript 系列教程 | 第 6 章：深入理解原型与原型链
description: 🔍 本章深入解析 JavaScript 的原型机制与原型链原理，搞懂对象之间的关系，彻底掌握继承底层逻辑。
keywords: JavaScript 原型, 原型链, constructor, prototype, 继承机制
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - ECMAScript
  - JavaScript
abbrlink: 1006
date: '2025-06-13 15:35'
---


## 一、小故事开篇：小明找爸爸

小明问自己：“我有什么能力？”

系统回答：“看你自己有没有，没有的话问你爸（__proto__）。”

结果：

- 小明没有 `sayHi` 方法
- 他跑去问他的爸爸（构造函数的 `prototype`）
- 还没有？继续问爷爷（Object.prototype）...

这就是原型链的真实写照。

---

## 二、什么是原型（Prototype）？

在 JS 中，每一个对象都可以通过 `__proto__` 指向另一个对象，那个被指向的就是“原型对象”。

```js
const person = { name: '小明' };
console.log(person.__proto__ === Object.prototype); // true
```

也就是说，普通对象默认都继承自 `Object.prototype`。

---

## 三、函数都有一个 `prototype` 属性？

对的。函数天生带一个 `prototype` 属性，这是用于“创建对象时”作为新对象的原型。

```js
function Animal() {}
console.log(Animal.prototype); // ➜ 是个对象
```

### 使用 `new` 关键字时：

```js
const dog = new Animal();
// dog.__proto__ === Animal.prototype ➜ true
```

也就是说：构造函数的 `prototype` 成为了新对象的 `__proto__`

---

## 四、构造函数、原型对象、实例三者的关系

来看下这个关系图：

```
function Person() {}
        │
        ├── Person.prototype (原型对象)
        │       └── constructor → Person
        │
        ↓
new Person() → 实例对象（p1）
              └── __proto__ → Person.prototype
```

## 五、原型链到底长啥样？

每个对象都有 `__proto__` 属性，如果这个属性中也没有你要找的内容，就继续往上找，直到 `null` 为止。

```js
function A() {}
const a = new A();

console.log(a.__proto__ === A.prototype); // true
console.log(A.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null
```

### 原型链图示：

```
a
└── __proto__ → A.prototype
                  └── __proto__ → Object.prototype
                                      └── __proto__ → null
```

---

## 六、多层嵌套原型链示例

```js
function GrandFather() {}
function Father() {}
function Son() {}

Father.prototype = new GrandFather();
Son.prototype = new Father();

const xiaoming = new Son();

console.log(xiaoming.__proto__ === Son.prototype); // true
console.log(xiaoming.__proto__.__proto__ === Father.prototype); // true
console.log(xiaoming.__proto__.__proto__.__proto__ instanceof GrandFather); // true
```

> 每一层都是通过 `__proto__` 连起来的，形成原型链。

---

## 七、构造函数中的 `constructor` 是什么？

每一个函数默认创建的 `prototype` 对象中都有一个 `constructor` 属性，它指回原构造函数本身。

```js
function Car() {}
console.log(Car.prototype.constructor === Car); // true

const car1 = new Car();
console.log(car1.constructor === Car); // true
```

这个属性可以用来识别对象是通过哪个构造函数创建的。

### 但注意！

```js
function Animal() {}
function Dog() {}

Dog.prototype = new Animal();

const d = new Dog();

console.log(d.constructor === Dog); // ❌ false（指向 Animal）

// 所以你得手动修复：
Dog.prototype.constructor = Dog;
```

---

## 八、手动继承中的 `constructor` 要不要修？

### 场景一：手动设置继承（`Object.create`）

```js
function Animal() {}
function Dog() {}

Dog.prototype = Object.create(Animal.prototype);

// constructor 丢失了
console.log(Dog.prototype.constructor === Dog); // ❌ false

// 修复它
Dog.prototype.constructor = Dog;
```

### 场景二：类继承不用修

```js
class A {}
class B extends A {}

const b = new B();
console.log(b.constructor === B); // ✅ true
```

因为 `class` 默认帮你处理好了这些。

---

## 九、面试经典问题答疑

### 1）为什么 `__proto__` 和 `prototype` 这么重要？

- `__proto__` 是对象的内部属性（指向其原型）
- `prototype` 是构造函数用于“创建实例”的模板

### 2）如何判断一个对象是由哪个构造函数创建的？

```js
obj.constructor === 构造函数
```

除非你修改过 `prototype`，就要记得修复 `constructor`

### 3）JS 中的继承是怎么实现的？

通过原型链。

- 构造函数创建实例
- 实例通过 `__proto__` 访问构造函数的 `prototype`
- 多层构造函数可形成多级继承

---

## 十、小结

| 概念        | 说明                             |
|-------------|----------------------------------|
| `prototype` | 函数的原型对象，用于构建实例     |
| `__proto__` | 实例指向其构造函数的原型         |
| `constructor` | 指向构造函数的引用            |

---

## 图解：JavaScript 原型链完整示意图（中文）

![原型链图示（中文）](/images/post/js/proto.png)

> 图片来源于网络

---

## 推荐阅读 & 参考资料

- [阮一峰：理解 JavaScript 原型链](https://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript.html) ✅
- [MDN：JavaScript 原型继承](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) ✅
- [掘金小册：JS 深入原型链](https://juejin.cn/post/6844903603628357639) ✅
- 《你不知道的 JavaScript（上卷）》第 6 章 ✅

---